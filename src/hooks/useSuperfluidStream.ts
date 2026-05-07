"use client";

import { createPublicClient, http, getAddress } from "viem";
import { celo } from "viem/chains";
import { useState } from "react";

// Direcciones en Celo Mainnet
const CFA_FORWARDER_ADDRESS = "0xcfA132E353cB4E398080B9700609bb008eceB125";
const G_DOLLAR_SUPER_TOKEN = "0x62B8B11039fcfE5aB0C56E502b1C372A3d2a9C7A"; // G$ es SuperToken nativamente en Celo

const cfaForwarderAbi = [
  {
    inputs: [
      { internalType: "contract ISuperToken", name: "token", type: "address" },
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "int96", name: "flowRate", type: "int96" },
    ],
    name: "createFlow",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "contract ISuperToken", name: "token", type: "address" },
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "int96", name: "flowRate", type: "int96" },
    ],
    name: "updateFlow",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "contract ISuperToken", name: "token", type: "address" },
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "bytes", name: "userData", type: "bytes" },
    ],
    name: "deleteFlow",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "contract ISuperToken", name: "token", type: "address" },
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "address", name: "receiver", type: "address" },
    ],
    name: "getFlow",
    outputs: [
      { internalType: "uint256", name: "lastUpdated", type: "uint256" },
      { internalType: "int96", name: "flowRate", type: "int96" },
      { internalType: "uint256", name: "deposit", type: "uint256" },
      { internalType: "uint256", name: "owedDeposit", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "contract ISuperToken", name: "token", type: "address" },
      { internalType: "address", name: "account", type: "address" },
    ],
    name: "getAccountFlowInfo",
    outputs: [
      { internalType: "uint256", name: "lastUpdated", type: "uint256" },
      { internalType: "int96", name: "flowRate", type: "int96" },
      { internalType: "uint256", name: "deposit", type: "uint256" },
      { internalType: "uint256", name: "owedDeposit", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export function useSuperfluidStream() {
  const [isProcessing, setIsProcessing] = useState(false);

  // FlowRate para 2,000 G$ mensuales:
  // 2000 G$ = 2000 * 10^18 wei
  // Mes = 30 días = 2592000 segundos
  // FlowRate = (2000 * 10^18) / 2592000 = 771604938271604 wei/segundo
  const DEFAULT_FLOW_RATE = 771604938271604n;

  const startStream = async (walletClientB: any, accountAddress: string, receiverAddress: string, flowRateWeiPerSecond: bigint = DEFAULT_FLOW_RATE) => {
    setIsProcessing(true);
    try {
      const tx = await walletClientB.writeContract({
        address: getAddress(CFA_FORWARDER_ADDRESS),
        abi: cfaForwarderAbi,
        functionName: "createFlow",
        args: [
          getAddress(G_DOLLAR_SUPER_TOKEN),
          getAddress(receiverAddress),
          flowRateWeiPerSecond,
        ],
        account: getAddress(accountAddress),
        chain: celo,
        gas: 800000n, // Bypass Viem local gas estimation
      });
      return { success: true, hash: tx };
    } catch (error: any) {
      console.error("Superfluid createFlow error:", error);
      return { success: false, error: error.shortMessage || error.message };
    } finally {
      setIsProcessing(false);
    }
  };

  const stopStream = async (walletClientB: any, accountAddress: string, receiverAddress: string) => {
    setIsProcessing(true);
    try {
      const tx = await walletClientB.writeContract({
        address: getAddress(CFA_FORWARDER_ADDRESS),
        abi: cfaForwarderAbi,
        functionName: "deleteFlow",
        args: [
          getAddress(G_DOLLAR_SUPER_TOKEN),
          getAddress(receiverAddress),
          "0x", // empty bytes
        ],
        account: getAddress(accountAddress),
        chain: celo,
        gas: 800000n, // Bypass Viem local gas estimation
      });
      return { success: true, hash: tx };
    } catch (error: any) {
      console.error("Superfluid deleteFlow error:", error);
      return { success: false, error: error.shortMessage || error.message };
    } finally {
      setIsProcessing(false);
    }
  };

  const checkActiveStream = async (accountAddress: string, receiverAddress: string) => {
    if (!accountAddress) return 0n;
    try {
      const publicClient = createPublicClient({ chain: celo, transport: http("https://forno.celo.org") });
      const flowInfo: any = await publicClient.readContract({
        address: getAddress(CFA_FORWARDER_ADDRESS),
        abi: cfaForwarderAbi,
        functionName: "getAccountFlowInfo",
        args: [
          getAddress(G_DOLLAR_SUPER_TOKEN),
          getAddress(accountAddress)
        ]
      });
      return flowInfo[1] as bigint; // flowRate
    } catch (e) {
      console.error("Error checkActiveStream:", e);
      return 0n;
    }
  };

  return {
    startStream,
    stopStream,
    checkActiveStream,
    isProcessing,
    DEFAULT_FLOW_RATE
  };
}
