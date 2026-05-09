// SPDX-License-Identifier: MIT
pragma solidity 0.8.28; // [SOLIDITY] Uso de versión moderna para seguridad y eficiencia nativa (ahorro de gas en checks matemáticos).

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; // [SOLIDITY] Patrón de diseño seguro para gestión de accesos sin tener que hardcodear.

/**
 * @title ReFiSplitter
 * @dev [BLOCKCHAIN] Contrato inteligente principal que se despliega en la blockchain de Celo.
 * Funciona como el enrutador económico (motor) de Artesanía Viajera.
 * 
 * [REFI] (Regenerative Finance): Implementa economía circular automatizada,
 * donde una parte del pago no va a intermediarios corporativos, sino a 
 * pools comunitarios y al sostenimiento del proyecto.
 */
contract ReFiSplitter is Ownable {
    // --- VARIABLES DE ESTADO ---
    
    // [BLOCKCHAIN] Dirección pública de la Tesorería de la Ruta (La DApp). Recibe el 5%.
    address public treasury; 
    
    // [REFI] Array dinámico de GoodPools (Ej: Mujeres del Carmen).
    // Permite agregar o quitar pools futuros sin necesidad de cambiar el contrato ni redesplegar.
    address[] public goodPools; 

    // [SOLIDITY] Las constantes (`constant`) no ocupan espacio en el Storage (disco duro de la blockchain).
    // Esto ahorra muchísimo gas, ya que se incrustan en el bytecode directamente.
    uint256 public constant TREASURY_FEE = 5; // 5% para la Tesorería.
    uint256 public constant POOLS_FEE = 5; // 5% a dividir entre todos los GoodPools activos.

    // --- EVENTOS ---
    // [BLOCKCHAIN] Los eventos son la forma más barata de guardar logs en la blockchain.
    // [REFI] Son vitales aquí porque permiten al Frontend (Dashboard de Impacto) leer las métricas históricas de cuánto se ha donado.
    event ImpactGenerated(address indexed artesano, uint256 total, uint256 treasuryImpact, uint256 poolsImpact);
    event PoolAdded(address indexed pool);
    event PoolRemoved(address indexed pool);
    event TreasuryUpdated(address indexed newTreasury);

    // --- ERRORES PERSONALIZADOS ---
    // [CELO / SOLIDITY] Usar "Custom Errors" en vez de `require(condicion, "Texto largo")` 
    // ahorra miles de unidades de gas al usuario si una transacción falla, porque no guarda el string de texto en la EVM.
    error TransferFailed();
    error InvalidAmount();
    error InvalidAddress();
    error PoolAlreadyExists();
    error PoolNotFound();
    error NoPoolsConfigured();

    /**
     * @dev Constructor que se ejecuta una sola vez al desplegar.
     * @param _treasury Tesorería inicial (5%).
     * @param _initialPools Lista inicial de pools (5% compartido).
     */
    constructor(address _treasury, address[] memory _initialPools) Ownable(msg.sender) {
        if (_treasury == address(0)) revert InvalidAddress();
        treasury = _treasury;
        
        for (uint256 i = 0; i < _initialPools.length; i++) {
            if (_initialPools[i] == address(0)) revert InvalidAddress();
            goodPools.push(_initialPools[i]);
        }
    }

    // --- FUNCIONES DE ADMINISTRACIÓN (SOLO OWNER) ---
    // [SOLIDITY] `onlyOwner` restringe el acceso. Modificar los pools no afecta el código base (no requiere redespliegue).

    function setTreasury(address _newTreasury) external onlyOwner {
        if (_newTreasury == address(0)) revert InvalidAddress();
        treasury = _newTreasury;
        emit TreasuryUpdated(_newTreasury);
    }

    function addGoodPool(address _pool) external onlyOwner {
        if (_pool == address(0)) revert InvalidAddress();
        for (uint256 i = 0; i < goodPools.length; i++) {
            if (goodPools[i] == _pool) revert PoolAlreadyExists();
        }
        goodPools.push(_pool);
        emit PoolAdded(_pool);
    }

    function removeGoodPool(address _pool) external onlyOwner {
        uint256 length = goodPools.length;
        for (uint256 i = 0; i < length; i++) {
            if (goodPools[i] == _pool) {
                // [SOLIDITY] Optimización de Gas: Para borrar en un array, movemos el último elemento al hueco y hacemos pop().
                goodPools[i] = goodPools[length - 1];
                goodPools.pop();
                emit PoolRemoved(_pool);
                return;
            }
        }
        revert PoolNotFound();
    }

    function getGoodPools() external view returns (address[] memory) {
        return goodPools;
    }

    // --- LÓGICA DE PAGOS ---

    /**
     * [CELO] Pago con moneda nativa de la red (Celo).
     * [REFI] Enrutamiento: 90% Artesano, 5% Ruta, 5% Pools Comunitarios.
     */
    function comprarArtesania(address _artesano) external payable {
        uint256 total = msg.value;
        if (total == 0) revert InvalidAmount();
        if (_artesano == address(0)) revert InvalidAddress();

        uint256 poolsCount = goodPools.length;
        if (poolsCount == 0) revert NoPoolsConfigured();

        uint256 treasuryAmount = (total * TREASURY_FEE) / 100;
        uint256 poolsTotalAmount = (total * POOLS_FEE) / 100;
        uint256 artesanoAmount = total - treasuryAmount - poolsTotalAmount;

        // [CELO] Uso de call() en lugar de transfer() para prevenir ataques de reentrada o fallos por gas limits.
        (bool s1, ) = treasury.call{value: treasuryAmount}("");
        if (!s1) revert TransferFailed();

        // [REFI] Repartición equitativa a múltiples comunidades.
        uint256 amountPerPool = poolsTotalAmount / poolsCount;
        for (uint256 i = 0; i < poolsCount; i++) {
            (bool sp, ) = goodPools[i].call{value: amountPerPool}("");
            if (!sp) revert TransferFailed();
        }

        (bool s2, ) = _artesano.call{value: artesanoAmount}("");
        if (!s2) revert TransferFailed();

        emit ImpactGenerated(_artesano, total, treasuryAmount, poolsTotalAmount);
    }

    /**
     * [CELO] Pago con ERC-20 estándar (Ej. USDT) usando Approve + TransferFrom.
     */
    function comprarArtesaniaERC20(address _token, address _artesano, uint256 _amount) external {
        if (_amount == 0) revert InvalidAmount();
        if (_artesano == address(0)) revert InvalidAddress();

        uint256 poolsCount = goodPools.length;
        if (poolsCount == 0) revert NoPoolsConfigured();

        uint256 treasuryAmount = (_amount * TREASURY_FEE) / 100;
        uint256 poolsTotalAmount = (_amount * POOLS_FEE) / 100;
        uint256 artesanoAmount = _amount - treasuryAmount - poolsTotalAmount;

        IERC20 token = IERC20(_token);

        bool successTransfer = token.transferFrom(msg.sender, address(this), _amount);
        if (!successTransfer) revert TransferFailed();

        bool successTreasury = token.transfer(treasury, treasuryAmount);
        if (!successTreasury) revert TransferFailed();

        uint256 amountPerPool = poolsTotalAmount / poolsCount;
        for (uint256 i = 0; i < poolsCount; i++) {
            bool sp = token.transfer(goodPools[i], amountPerPool);
            if (!sp) revert TransferFailed();
        }

        bool successArtesano = token.transfer(_artesano, artesanoAmount);
        if (!successArtesano) revert TransferFailed();

        emit ImpactGenerated(_artesano, _amount, treasuryAmount, poolsTotalAmount);
    }

    /**
     * [BLOCKCHAIN] Función Callback (ERC677Receiver) especial para tokens como G$ (GoodDollar).
     * [CELO] Permite recibir el pago y ejecutar todo en UNA SOLA transacción, sin necesidad de Approve previo.
     */
    function onTokenTransfer(address /* sender */, uint256 value, bytes memory data) external returns (bool) {
        address _token = msg.sender; // El contrato del token G$ que llama a esta función
        address _artesano = abi.decode(data, (address)); // Desempaquetar la dirección del artesano
        
        uint256 poolsCount = goodPools.length;
        if (poolsCount == 0) revert NoPoolsConfigured();

        uint256 treasuryAmount = (value * TREASURY_FEE) / 100;
        uint256 poolsTotalAmount = (value * POOLS_FEE) / 100;
        uint256 artesanoAmount = value - treasuryAmount - poolsTotalAmount;

        IERC20 token = IERC20(_token);

        bool successTreasury = token.transfer(treasury, treasuryAmount);
        if (!successTreasury) revert TransferFailed();

        uint256 amountPerPool = poolsTotalAmount / poolsCount;
        for (uint256 i = 0; i < poolsCount; i++) {
            bool sp = token.transfer(goodPools[i], amountPerPool);
            if (!sp) revert TransferFailed();
        }

        bool successArtesano = token.transfer(_artesano, artesanoAmount);
        if (!successArtesano) revert TransferFailed();

        emit ImpactGenerated(_artesano, value, treasuryAmount, poolsTotalAmount);
        
        return true;
    }
}
