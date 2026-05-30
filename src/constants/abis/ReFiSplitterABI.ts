// Exportamos las direcciones leyendo del environment para mantener la seguridad dinámica
export const REFI_SPLITTER_ADDRESS = process.env.NEXT_PUBLIC_REFI_SPLITTER_ADDRESS as `0x${string}`;

export const REFI_SPLITTER_ABI = [
  {"inputs":[{"internalType":"address","name":"_treasury","type":"address"},{"internalType":"address[]","name":"_initialPools","type":"address[]"}],"stateMutability":"nonpayable","type":"constructor"},
  {"inputs":[],"type":"error","name":"InvalidAddress"},
  {"inputs":[],"type":"error","name":"InvalidAmount"},
  {"inputs":[],"type":"error","name":"NoPoolsConfigured"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"type":"error","name":"OwnableInvalidOwner"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"type":"error","name":"OwnableUnauthorizedAccount"},
  {"inputs":[],"type":"error","name":"TransferFailed"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"artesano","type":"address"},{"indexed":false,"internalType":"uint256","name":"total","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"treasuryImpact","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"poolsImpact","type":"uint256"}],"name":"ImpactGenerated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
  {"inputs":[],"name":"POOLS_FEE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"TREASURY_FEE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"_artesano","type":"address"}],"name":"comprarArtesania","outputs":[],"stateMutability":"payable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_token","type":"address"},{"internalType":"address","name":"_artesano","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"comprarArtesaniaERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"goodPools","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"onTokenTransfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"treasury","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}
] as const;
