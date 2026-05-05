"use client";

import { useState, useEffect } from "react";
import UniversalProvider from "@walletconnect/universal-provider";
import { WalletConnectModal } from "@walletconnect/modal";
import { createPublicClient, http } from "viem";
import { celo } from "viem/chains";

const PROJECT_ID = "b7134d1dd43c7b80a13324d5ea3be76a"; // Usa tu propio Project ID de WalletConnect si lo tienes

export function useWalletConnectB() {
  const [provider, setProvider] = useState<UniversalProvider | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balanceG, setBalanceG] = useState<bigint>(0n);

  useEffect(() => {
    const initProvider = async () => {
      try {
        const p = await UniversalProvider.init({
          projectId: PROJECT_ID,
          metadata: {
            name: "Artesanía Viajera",
            description: "GoodDollar Season 4 DApp",
            url: typeof window !== "undefined" ? window.location.href : "https://artesania.local",
            icons: ["https://avatars.githubusercontent.com/u/37784886"]
          }
        });
        setProvider(p);

        if (p.session) {
          const accounts = p.session.namespaces.eip155?.accounts;
          if (accounts && accounts.length > 0) {
            const addr = accounts[0].split(":")[2];
            setAddress(addr);
            fetchBalance(addr);
          }
        }
        
        // Manejo de eventos
        p.on("accountsChanged", (accounts: string[]) => {
          if (accounts.length > 0) {
            const addr = accounts[0].split(":")[2];
            setAddress(addr);
            fetchBalance(addr);
          } else {
            setAddress(null);
            setBalanceG(0n);
          }
        });
        
        p.on("disconnect", () => {
          setAddress(null);
          setBalanceG(0n);
        });

      } catch (e) {
        console.error("Error inicializando UniversalProvider", e);
      }
    };
    initProvider();
  }, []);

  const fetchBalance = async (addr: string) => {
    const publicClient = createPublicClient({ chain: celo, transport: http("https://forno.celo.org") });
    try {
      const gDollarAddress = "0x62B8B11039fcfE5aB0C56E502b1C372A3d2a9C7A";
      const abi = [{ type: "function", name: "balanceOf", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" }] as const;
      const bal = await publicClient.readContract({
        address: gDollarAddress,
        abi,
        functionName: "balanceOf",
        args: [addr as `0x${string}`]
      });
      setBalanceG(bal);
      return bal;
    } catch(e) {
      console.error(e);
      return 0n;
    }
  };

  const connect = async () => {
    if (!provider) return;
    setIsConnecting(true);
    const modal = new WalletConnectModal({ projectId: PROJECT_ID });
    
    try {
      provider.on("display_uri", (uri: string) => {
        modal.openModal({ uri });
      });

      const session = await provider.connect({
        namespaces: {
          eip155: {
            methods: ["eth_sendTransaction", "personal_sign", "eth_signTypedData"],
            chains: ["eip155:42220"], // Celo Mainnet
            events: ["chainChanged", "accountsChanged"],
            rpcMap: {
              42220: "https://forno.celo.org"
            }
          }
        }
      });

      modal.closeModal();

      if (session) {
        const addr = session.namespaces.eip155.accounts[0].split(":")[2];
        setAddress(addr);
        fetchBalance(addr);
      }
    } catch(e) {
      console.error("Error conectando UniversalProvider:", e);
      modal.closeModal();
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    if (provider) {
      await provider.disconnect();
      setAddress(null);
      setBalanceG(0n);
    }
  };

  return { connect, disconnect, address, isConnecting, balanceG, provider };
}
