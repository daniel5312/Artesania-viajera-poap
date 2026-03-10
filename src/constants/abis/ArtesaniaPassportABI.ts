export const PASSPORT_ADDRESS = "0xF62d9Ed4243c08C0191C62ac5dA9F77abC7559b5" as const;

export const PASSPORT_ABI = [
    { inputs: [{ internalType: "address", name: "owner", type: "address" }], name: "balanceOf", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
    { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "ownerOf", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
    { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "tokenURI", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" },
    { inputs: [{ internalType: "address", name: "recipient", type: "address" }, { internalType: "string", name: "tokenURI", type: "string" }], name: "mintMomento", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
    { anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "turista", type: "address" }, { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" }], name: "MomentoMinteado", type: "event" }
] as const;