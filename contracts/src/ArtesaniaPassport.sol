// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ArtesaniaPassport is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Evento simple: "Alguien minteó el token #X"
    event MomentoMinteado(address indexed turista, uint256 indexed tokenId);

    constructor()
        ERC721("Artesania Viajera Passport", "AVP")
        Ownable(msg.sender)
    {}

    // ESTA ES LA MAGIA HÍBRIDA:
    // Recibe 'recipient' (Dueño) y 'tokenURI' (El enlace a tu API)
    function mintMomento(
        address recipient,
        string calldata tokenURI
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId;

        // Ahorro de gas extremo (Unchecked)
        unchecked {
            _nextTokenId++;
        }

        // Crea el NFT en Blockchain (Irrefutable propiedad)
        _safeMint(recipient, tokenId);

        // Guarda el enlace a tu API (Flexible data)
        _setTokenURI(tokenId, tokenURI);

        emit MomentoMinteado(recipient, tokenId);

        return tokenId;
    }
}
