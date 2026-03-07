// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @dev Interfaz para conectar con tu contrato de Pasaporte existente.
 * Esto nos permite verificar si el usuario tiene el NFT antes de dejarlo publicar.
 */
interface IArtesaniaPassport {
    function balanceOf(address owner) external view returns (uint256);
}

/**
 * @title ArtesaniaRegistry
 * @author Daniel - Biota / Artesanía Viajera
 * @notice Registro descentralizado para el muro de momentos (Social Store).
 */
contract ArtesaniaRegistry {
    // --- Errores Personalizados (Ahorro de gas) ---
    error SoloMiembrosPuedenPublicar(); // No es el artesano ni tiene el NFT
    error DatosInvalidos();

    // --- Variables de Estado ---
    address public immutable i_artesano;
    IArtesaniaPassport public immutable i_passport;

    struct Contenido {
        string cid; // El link de Pinata/IPFS
        address autor; // Quién subió la foto
        uint256 fecha; // Cuándo se subió
        bool esArtesano; // Diferencia tus fotos oficiales de las de los turistas
    }

    // Mapeo: ID del Pueblo => Lista de Momentos
    mapping(string => Contenido[]) private s_murales;

    // Evento para que el mapa y la web se actualicen al instante
    event NuevoMomento(
        string indexed puebloId,
        address indexed autor,
        bool esArtesano,
        string cid
    );

    /**
     * @param _passportAddress Dirección del contrato ArtesaniaPassport desplegado.
     */
    constructor(address _passportAddress) {
        if (_passportAddress == address(0)) revert DatosInvalidos();
        i_artesano = msg.sender;
        i_passport = IArtesaniaPassport(_passportAddress);
    }

    /**
     * @notice Registra un momento en el muro de un pueblo.
     * @param _puebloId Identificador (ej: "guatape_socalos").
     * @param _cid Hash de IPFS de la foto.
     */
    function registrarMomento(
        string calldata _puebloId,
        string calldata _cid
    ) external {
        bool esElArtesano = (msg.sender == i_artesano);

        // 🛡️ SEGURIDAD: Solo tú o alguien con al menos 1 NFT puede publicar.
        if (!esElArtesano && i_passport.balanceOf(msg.sender) == 0) {
            revert SoloMiembrosPuedenPublicar();
        }

        // Validación básica de strings
        if (bytes(_puebloId).length == 0 || bytes(_cid).length == 0)
            revert DatosInvalidos();

        // Guardamos el momento en la blockchain
        s_murales[_puebloId].push(
            Contenido({
                cid: _cid,
                autor: msg.sender,
                fecha: block.timestamp,
                esArtesano: esElArtesano
            })
        );

        emit NuevoMomento(_puebloId, msg.sender, esElArtesano, _cid);
    }

    /**
     * @notice Devuelve todos los momentos de un pueblo específico.
     */
    function obtenerMural(
        string calldata _puebloId
    ) external view returns (Contenido[] memory) {
        return s_murales[_puebloId];
    }
}
