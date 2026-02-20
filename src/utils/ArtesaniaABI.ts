export const ArtesaniaABI = [
    // Función para crear el recuerdo (Solo el dueño/API puede llamar a esta)
    {
        inputs: [
            { internalType: "address", name: "recipient", type: "address" },
            { internalType: "string", name: "tokenURI", type: "string" }
        ],
        name: "mintMomento",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function"
    },
    // Evento para escuchar cuando alguien recibe su pasaporte
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "turista", type: "address" },
            { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" }
        ],
        name: "MomentoMinteado",
        type: "event"
    }
] as const;