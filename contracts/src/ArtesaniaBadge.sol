// SPDX-License-Identifier: MIT
pragma solidity 0.8.28; // 🟢 Solidity: Versión con optimizaciones nativas de manejo de memoria.

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ArtesaniaBadge
 * @author Dani - Artesanía Viajera x Biota
 * @notice Contrato ultra-optimizado para insignias de ruta (ERC-1155).
 * @dev Implementa "Manual ID Ranges" para evitar el uso de contadores en Storage.
 */
contract ArtesaniaBadge is ERC1155, Ownable {
    // --- IDENTIDAD ---
    string public name = "Insignias de Ruta - Artesania Viajera";

    // 🟢 Gas Tip: Mapeo privado. Solo se accede vía la función uri().
    mapping(uint256 => string) private _badgeURIs;

    // --- ERRORES PERSONALIZADOS (Ahorro de Gas) ---
    // 🟢 Solidity Tip: Los Custom Errors ahorran ~50 gas por cada transacción fallida
    // comparado con los mensajes de texto (require).
    error SitioNoConfigurado(uint256 id);
    error DireccionInvalida();

    // --- EVENTOS (Trazabilidad ReFi) ---
    event BadgeEntregado(address indexed viajero, uint256 indexed badgeId);

    constructor() ERC1155("") Ownable(msg.sender) {}

    // --- FUNCIONES ADMINISTRATIVAS ---

    /**
     * @notice Configura un sitio usando rangos (ej: 100001).
     * @param id ID calculado (Pueblo + Sitio).
     * @param metadataUri CID de IPFS.
     * 🟢 Gas Tip: 'calldata' indica a la EVM que solo lea el string, no que lo copie a memoria.
     */
    function configurarSitio(
        uint256 id,
        string calldata metadataUri
    ) external onlyOwner {
        _badgeURIs[id] = metadataUri;
    }

    // --- FUNCIONES DE MINTING (Optimización MiniPay) ---

    /**
     * @notice Entrega la insignia.
     * 🟢 Pro Tip: Al NO usar un contador (_nextTokenId++), eliminamos una escritura
     * costosa en el almacenamiento (SSTORE), ahorrando ~20,000 de gas por cada mint.
     */
    function mintBadge(address to, uint256 id) external onlyOwner {
        if (to == address(0)) revert DireccionInvalida();
        if (bytes(_badgeURIs[id]).length == 0) revert SitioNoConfigurado(id);

        _mint(to, id, 1, "");

        emit BadgeEntregado(to, id);
    }

    /**
     * @notice Mint masivo: Permite entregar varios sellos de una sola vez.
     * 🟢 Celo Tip: Ideal para cuando el turista reclama varios puntos al final del día.
     */
    function mintBatchBadges(
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts
    ) external onlyOwner {
        _mintBatch(to, ids, amounts, "");
    }

    // --- VISTAS ---

    /**
     * @dev Devuelve el URI del metadata.
     */
    function uri(uint256 id) public view override returns (string memory) {
        return _badgeURIs[id];
    }
}
