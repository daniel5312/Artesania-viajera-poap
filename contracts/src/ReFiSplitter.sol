// SPDX-License-Identifier: MIT
pragma solidity 0.8.28; // [SOLIDITY] Seguridad y eficiencia

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

    // [REFI] Trazabilidad: Crucial para auditoría de impacto en el Grant
    event ImpactGenerated(address indexed artesano, uint256 total, uint256 impact);

    constructor(address _pool) {
        collectivePool = _pool; // [GOODDOLLAR/COLLECTIVE] Configuración de destino
    }

    /**
     * [REFI] Función de pago con distribución automática de valor.
     */
    function comprarArtesania(address _artesano) external payable {
        uint256 total = msg.value; // [CELO] Manejo de moneda nativa
        if (total == 0) revert InvalidAmount();

        uint256 impactAmount = (total * REFI_FEE) / 100;
        uint256 artesanoAmount = total - impactAmount;

        // [CELO/EVM] Low-level calls para máxima compatibilidad y ahorro de gas
        (bool s1, ) = collectivePool.call{value: impactAmount}(""); // Al Pool/Tesorería
        if (!s1) revert TransferFailed();

        (bool s2, ) = _artesano.call{value: artesanoAmount}(""); // Al Artesano
        if (!s2) revert TransferFailed();

        emit ImpactGenerated(_artesano, total, impactAmount); // [REFI] Registro de impacto
    }
}
