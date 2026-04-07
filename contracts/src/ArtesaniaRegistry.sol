// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface IArtesaniaPassport {
    function balanceOf(address owner) external view returns (uint256);
}

/**
 * @title ArtesaniaRegistry
 * @author Daniel - Artesanía Viajera
 * @notice Optimizado para Gas: Storage Packing y Calldata.
 */
contract ArtesaniaRegistry {
    error SoloMiembrosPuedenPublicar();
    error DatosInvalidos();

    // Inmutables: Se guardan en el código, no en el storage (Gas = 0)
    address public immutable i_artesano;
    IArtesaniaPassport public immutable i_passport;

    // --- STORAGE PACKING ---
    // Agrupamos variables pequeñas para que vivan en un solo slot de 32 bytes.
    struct Contenido {
        address autor; // 20 bytes
        uint40 fecha; // 5 bytes (Suficiente para los próximos 30,000 años)
        bool esArtesano; // 1 byte
        // Total: 26 bytes. Solidity los empaqueta juntos.
        string cid; // El string vive en un slot separado (dinámico)
    }

    // Usar bytes32 es mucho más barato que usar strings para las llaves del mapping
    mapping(bytes32 => Contenido[]) private s_murales;

    event NuevoMomento(
        bytes32 indexed puebloId,
        address indexed autor,
        bool esArtesano,
        string cid
    );

    constructor(address _passportAddress) {
        if (_passportAddress == address(0)) revert DatosInvalidos();
        i_artesano = msg.sender;
        i_passport = IArtesaniaPassport(_passportAddress);
    }

    /**
     * @notice Registra un momento. El Robot paga el gas, el Turista es el dueño.
     * @param _puebloId ID en bytes32 (Ahorra gas en el hashing)
     * @param _cid Hash de IPFS
     * @param _viajero Dirección real del turista (Address recolectada por Privy)
     */
    function registrarMomento(
        bytes32 _puebloId,
        string calldata _cid,
        address _viajero
    ) external {
        // Cacheamos en memoria para ahorrar lecturas de storage (SLOAD)
        address artesano = i_artesano;
        bool esElArtesano = (msg.sender == artesano);

        // 🛡️ Seguridad: Revisamos el balance del VIAJERO real
        if (!esElArtesano && i_passport.balanceOf(_viajero) == 0) {
            revert SoloMiembrosPuedenPublicar();
        }

        if (_puebloId == bytes32(0) || bytes(_cid).length == 0)
            revert DatosInvalidos();

        // Guardado en un solo paso de storage packing
        s_murales[_puebloId].push(
            Contenido({
                autor: _viajero,
                fecha: uint40(block.timestamp),
                esArtesano: esElArtesano,
                cid: _cid
            })
        );

        emit NuevoMomento(_puebloId, _viajero, esElArtesano, _cid);
    }

    function obtenerMural(
        bytes32 _puebloId
    ) external view returns (Contenido[] memory) {
        return s_murales[_puebloId];
    }
}
