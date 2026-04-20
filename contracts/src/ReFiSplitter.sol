// SPDX-License-Identifier: MIT
pragma solidity 0.8.28; // [SOLIDITY] Seguridad y eficiencia

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * [REFI] Motor de Economía Circular: Reparte ingresos y genera impacto social.
 */
contract ReFiSplitter {
    // [CELO] Inmutables para ahorro extremo de gas
    address public immutable collectivePool; 
    uint256 public constant REFI_FEE = 2; // [REFI] 2% para el bien común

    // [SOLIDITY] Custom Errors (Optimizan costos de transacción vs Require)
    error TransferFailed();
    error InvalidAmount();
    error InvalidAddress();

    // [REFI] Trazabilidad: Crucial para auditoría de impacto en el Grant
    event ImpactGenerated(address indexed artesano, uint256 total, uint256 impact);

    constructor(address _pool) {
        collectivePool = _pool; // [GOODDOLLAR/COLLECTIVE] Configuración de destino
    }

    /**
     * [REFI] Función de pago con distribución automática de valor (CELO Nativo).
     */
    function comprarArtesania(address _artesano) external payable {
        uint256 total = msg.value; // [CELO] Manejo de moneda nativa
        if (total == 0) revert InvalidAmount();
        if (_artesano == address(0)) revert InvalidAddress();

        uint256 impactAmount = (total * REFI_FEE) / 100;
        uint256 artesanoAmount = total - impactAmount;

        // [CELO/EVM] Low-level calls para máxima compatibilidad y ahorro de gas
        (bool s1, ) = collectivePool.call{value: impactAmount}(""); // Al Pool/Tesorería
        if (!s1) revert TransferFailed();

        (bool s2, ) = _artesano.call{value: artesanoAmount}(""); // Al Artesano
        if (!s2) revert TransferFailed();

        emit ImpactGenerated(_artesano, total, impactAmount); // [REFI] Registro de impacto
    }

    /**
     * [REFI] Función de pago con distribución automática de valor (ERC-20: USDT, G$).
     */
    function comprarArtesaniaERC20(address _token, address _artesano, uint256 _amount) external {
        if (_amount == 0) revert InvalidAmount();
        if (_artesano == address(0)) revert InvalidAddress();

        uint256 impactAmount = (_amount * REFI_FEE) / 100;
        uint256 artesanoAmount = _amount - impactAmount;

        IERC20 token = IERC20(_token);

        // 1. Transferir el monto total desde el comprador al contrato
        bool successTransfer = token.transferFrom(msg.sender, address(this), _amount);
        if (!successTransfer) revert TransferFailed();

        // 2. Distribuir el 2% al pool de impacto
        bool successImpact = token.transfer(collectivePool, impactAmount);
        if (!successImpact) revert TransferFailed();

        // 3. Distribuir el 98% al artesano
        bool successArtesano = token.transfer(_artesano, artesanoAmount);
        if (!successArtesano) revert TransferFailed();

        emit ImpactGenerated(_artesano, _amount, impactAmount);
    }
}
