// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title Minimal IERC20 Interface
 */
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/**
 * @title ReFiSplitter (Arquitectura Dual Híbrida)
 * @dev [CELO] Enrutador avanzado que separa los fondos G$ (hacia contratos GoodDollar) 
 * y fondos nativos CELO/USDT (hacia EOAs o billeteras cripto), previniendo revert calls.
 */
contract ReFiSplitter {
    address public treasury; // Tesorería DApp (5%)
    address[] public goodDollarPools; // Pools de Impacto para G$ (5%)
    address[] public cryptoPools; // Pools de Impacto para CELO/USDT (5%)

    // Porcentajes fijos para el ecosistema regenerativo
    uint256 public constant ARTESANO_FEE = 90;
    uint256 public constant TREASURY_FEE = 5;
    uint256 public constant POOLS_FEE = 5;

    event ImpactGenerated(address indexed artesano, uint256 totalAmount, uint256 treasuryAmount, uint256 poolsAmount);

    error InvalidAmount();
    error InvalidAddress();
    error TransferFailed();
    error NoPoolsConfigured();

    /**
     * @dev [SOLIDITY] El constructor ahora recibe dos arreglos separados para manejar la incompatibilidad
     * de los contratos de GoodDollar con monedas nativas.
     */
    constructor(address _treasury, address[] memory _goodDollarPools, address[] memory _cryptoPools) {
        if (_treasury == address(0)) revert InvalidAddress();
        treasury = _treasury;
        goodDollarPools = _goodDollarPools;
        cryptoPools = _cryptoPools;
    }

    /**
     * @dev [CELO] Método atómico para compras con moneda nativa (CELO).
     * Usa cryptoPools (EOAs o contratos compatibles con recibir CELO).
     */
    function comprarArtesania(address _artesano) external payable {
        uint256 total = msg.value;
        if (total == 0) revert InvalidAmount();
        if (_artesano == address(0)) revert InvalidAddress();

        uint256 poolsCount = cryptoPools.length;
        if (poolsCount == 0) revert NoPoolsConfigured();

        uint256 treasuryAmount = (total * TREASURY_FEE) / 100;
        uint256 poolsTotalAmount = (total * POOLS_FEE) / 100;
        uint256 amountPerPool = poolsTotalAmount / poolsCount;

        // [CELO] Pago a Tesorería
        (bool s1, ) = treasury.call{value: treasuryAmount}("");
        if (!s1) revert TransferFailed();

        // [CELO] Pago a Pools Cripto
        for (uint256 i = 0; i < poolsCount; i++) {
            (bool sp, ) = cryptoPools[i].call{value: amountPerPool}("");
            if (!sp) revert TransferFailed();
        }

        // [CELO] Pago al Artesano
        uint256 artesanoAmount = total - treasuryAmount - poolsTotalAmount;
        (bool s2, ) = _artesano.call{value: artesanoAmount}("");
        if (!s2) revert TransferFailed();

        emit ImpactGenerated(_artesano, total, treasuryAmount, poolsTotalAmount);
    }

    /**
     * @dev [CELO] Método para pagos con tokens ERC-20 (Ejemplo: USDT, cUSD).
     * Usa cryptoPools.
     */
    function comprarArtesaniaERC20(address _token, address _artesano, uint256 _amount) external {
        if (_amount == 0) revert InvalidAmount();
        if (_artesano == address(0)) revert InvalidAddress();

        uint256 poolsCount = cryptoPools.length;
        if (poolsCount == 0) revert NoPoolsConfigured();

        uint256 treasuryAmount = (_amount * TREASURY_FEE) / 100;
        uint256 poolsTotalAmount = (_amount * POOLS_FEE) / 100;
        uint256 artesanoAmount = _amount - treasuryAmount - poolsTotalAmount;

        IERC20 token = IERC20(_token);

        if (!token.transferFrom(msg.sender, address(this), _amount)) revert TransferFailed();
        if (!token.transfer(treasury, treasuryAmount)) revert TransferFailed();

        uint256 amountPerPool = poolsTotalAmount / poolsCount;
        for (uint256 i = 0; i < poolsCount; i++) {
            if (!token.transfer(cryptoPools[i], amountPerPool)) revert TransferFailed();
        }

        if (!token.transfer(_artesano, artesanoAmount)) revert TransferFailed();

        emit ImpactGenerated(_artesano, _amount, treasuryAmount, poolsTotalAmount);
    }

    /**
     * @dev [BLOCKCHAIN] Método Callback para G$ (ERC-677).
     * Usa EXCLUSIVAMENTE goodDollarPools.
     */
    function onTokenTransfer(address /* sender */, uint256 value, bytes memory data) external returns (bool) {
        address _token = msg.sender; 
        address _artesano = abi.decode(data, (address)); 
        
        uint256 poolsCount = goodDollarPools.length;
        if (poolsCount == 0) revert NoPoolsConfigured();

        uint256 treasuryAmount = (value * TREASURY_FEE) / 100;
        uint256 poolsTotalAmount = (value * POOLS_FEE) / 100;
        uint256 artesanoAmount = value - treasuryAmount - poolsTotalAmount;

        IERC20 token = IERC20(_token);

        if (!token.transfer(treasury, treasuryAmount)) revert TransferFailed();

        uint256 amountPerPool = poolsTotalAmount / poolsCount;
        for (uint256 i = 0; i < poolsCount; i++) {
            if (!token.transfer(goodDollarPools[i], amountPerPool)) revert TransferFailed();
        }

        if (!token.transfer(_artesano, artesanoAmount)) revert TransferFailed();

        emit ImpactGenerated(_artesano, value, treasuryAmount, poolsTotalAmount);
        
        return true;
    }
}
