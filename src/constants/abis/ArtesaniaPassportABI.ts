export const PASSPORT_ADDRESS = "0x86b6E480a423f49C4104EeAcC13c262263c24ee9" as const;

export const PASSPORT_ABI = [
    { inputs: [{ internalType: "address", name: "owner", type: "address" }], name: "balanceOf", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
    { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "ownerOf", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
    { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "tokenURI", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" },
    { inputs: [{ internalType: "address", name: "recipient", type: "address" }, { internalType: "string", name: "tokenURI", type: "string" }], name: "mintMomento", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
    { anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "turista", type: "address" }, { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" }], name: "MomentoMinteado", type: "event" }
] as const;