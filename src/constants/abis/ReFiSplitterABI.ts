// Exportamos las direcciones leyendo del environment para mantener la seguridad dinámica
export const COLLECTIVE_SPLITTER_ADDRESS = process.env.NEXT_PUBLIC_COLLECTIVE_SPLITTER_ADDRESS as `0x${string}`;
export const TREASURY_SPLITTER_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_SPLITTER_ADDRESS as `0x${string}`;

export const REFI_SPLITTER_ABI = [
  {
    inputs: [{ internalType: "address", name: "_pool", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "InvalidAmount", type: "error" },
  { inputs: [], name: "TransferFailed", type: "error" },
  { inputs: [], name: "InvalidAddress", type: "error" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "artesano", type: "address" },
      { indexed: false, internalType: "uint256", name: "total", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "impact", type: "uint256" },
    ],
    name: "ImpactGenerated",
    type: "event",
  },
  {
    inputs: [{ internalType: "address", name: "_artesano", type: "address" }],
    name: "comprarArtesania",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_token", type: "address" },
      { internalType: "address", name: "_artesano", type: "address" },
      { internalType: "uint256", name: "_amount", type: "uint256" }
    ],
    name: "comprarArtesaniaERC20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "collectivePool",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "REFI_FEE",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
] as const;
