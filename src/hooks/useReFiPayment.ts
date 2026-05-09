import { useState, useCallback } from "react";
import { useWriteContract, useSwitchChain, useAccount, useConnectors, useConnect } from "wagmi";
import { parseUnits, encodeAbiParameters, getAddress, createPublicClient, http } from "viem";
import { celo } from "viem/chains";
import { REFI_SPLITTER_CONTRACT } from "@/constants/contracts";
import { usePrivy } from "@privy-io/react-auth";

const G_DOLLAR_ADDRESS = "0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A";
const USDT_ADDRESS = "0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e";

const publicClient = createPublicClient({ chain: celo, transport: http("https://forno.celo.org") });

const erc20Abi = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export function useReFiPayment() {
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const { address: wagmiAddress, isConnected: authWagmi } = useAccount();
  const { connectAsync } = useConnect();
  const connectors = useConnectors();
  const { user, authenticated: authPrivy, login } = usePrivy();

  const [paymentState, setPaymentState] = useState<"idle" | "approving" | "paying" | "success" | "error">("idle");
  const [paymentHash, setPaymentHash] = useState<`0x${string}` | undefined>();

  const executePayment = useCallback(async (
    amountStr: string,
    tokenAddress: string,
    decimals: number,
    targetWallet: string,
    isCollective: boolean,
    isMiniPayRoute: boolean
  ) => {
    const isUserAuthenticated = isMiniPayRoute ? authWagmi : authPrivy;
    const userAddress = isMiniPayRoute ? wagmiAddress : user?.wallet?.address;

    if (!isUserAuthenticated) {
      if (!isMiniPayRoute) {
        login();
        throw new Error("Por favor, inicia sesión primero.");
      } else {
        const injected = connectors.find((c) => c.id === "injected") || connectors[0];
        if (injected) {
           await connectAsync({ connector: injected });
           throw new Error("Billetera conectada, por favor intenta de nuevo.");
        } else {
           throw new Error("MiniPay no detectado. Refresca la página.");
        }
      }
    }

    if (!userAddress) throw new Error("No se detectó una wallet válida conectada.");

    setPaymentState("approving");
    setPaymentHash(undefined);

    try {
      try {
        await switchChainAsync({ chainId: celo.id });
      } catch (e) {
        // Probablemente ya está en Celo Mainnet
      }

      const splitterAddress = REFI_SPLITTER_CONTRACT.address;

      if (!splitterAddress) throw new Error("El contrato Splitter no está configurado.");

      const amount = parseUnits(amountStr, decimals);
      let tx: `0x${string}`;

      // Flujo ERC-677: Un solo clic (Cero Approve) para G$
      if (tokenAddress.toLowerCase() === G_DOLLAR_ADDRESS.toLowerCase()) {
        setPaymentState("paying");
        const transferAndCallAbi = [{
          name: "transferAndCall",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [
            { name: "_to", type: "address" },
            { name: "_value", type: "uint256" },
            { name: "_data", type: "bytes" },
          ],
          outputs: [{ name: "", type: "bool" }],
        }] as const;

        const data = encodeAbiParameters([{ type: "address" }], [getAddress(targetWallet)]);

        tx = await writeContractAsync({
          address: tokenAddress as `0x${string}`,
          abi: transferAndCallAbi,
          functionName: "transferAndCall",
          args: [splitterAddress as `0x${string}`, amount, data],
          chainId: celo.id,
        });
      } else {
        // Flujo normal ERC20 (USDT) con Approve + Transfer
        const allowance = await publicClient.readContract({
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "allowance",
          args: [userAddress as `0x${string}`, splitterAddress as `0x${string}`],
        });

        if (allowance < amount) {
          const approveTx = await writeContractAsync({
            address: tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: "approve",
            args: [splitterAddress as `0x${string}`, amount],
          });
          await publicClient.waitForTransactionReceipt({ hash: approveTx });
        }

        setPaymentState("paying");
        tx = await writeContractAsync({
          address: splitterAddress as `0x${string}`,
          abi: REFI_SPLITTER_CONTRACT.abi,
          functionName: "comprarArtesaniaERC20",
          args: [tokenAddress as `0x${string}`, getAddress(targetWallet), amount],
          chainId: celo.id,
        });
      }

      setPaymentHash(tx);
      setPaymentState("success");
      return tx;
    } catch (error: any) {
      setPaymentState("error");
      throw error;
    }
  }, [authPrivy, authWagmi, connectAsync, connectors, login, switchChainAsync, user?.wallet?.address, wagmiAddress, writeContractAsync]);

  return {
    executePayment,
    paymentState,
    paymentHash,
    resetPaymentState: () => {
      setPaymentState("idle");
      setPaymentHash(undefined);
    },
    G_DOLLAR_ADDRESS,
    USDT_ADDRESS
  };
}
