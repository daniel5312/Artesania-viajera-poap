"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import UniversalProvider from "@walletconnect/universal-provider";
import { WalletConnectModal } from "@walletconnect/modal";
import { createPublicClient, createWalletClient, custom, http, getAddress } from "viem";
import { celo } from "viem/chains";

interface UbiFlowContextType {
  provider: UniversalProvider | null;
  address: string | null;
  balanceG: bigint;
  balanceNativeB: bigint;
  balanceCUSDB: bigint;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  walletClientB: any | null; // El cliente inyectado de Viem
}

const UbiFlowContext = createContext<UbiFlowContextType | undefined>(undefined);

const PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "dfa4d89eaa7e8833efe6d378cd938ce2";

export function UbiFlowProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<UniversalProvider | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [balanceG, setBalanceG] = useState<bigint>(0n);
  const [balanceNativeB, setBalanceNativeB] = useState<bigint>(0n);
  const [balanceCUSDB, setBalanceCUSDB] = useState<bigint>(0n);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletClientB, setWalletClientB] = useState<any | null>(null);

  useEffect(() => {
    let isInitialized = false;
    // Evitar hidratación mismatch y sesiones fantasma
    const initProvider = async () => {
      if (isInitialized) return;
      isInitialized = true;
      try {
        console.log("Iniciando UniversalProvider...");
        const p = await UniversalProvider.init({
          projectId: PROJECT_ID,
          metadata: {
            name: "Artesanía Viajera",
            description: "GoodDollar Season 4 DApp",
            url: typeof window !== "undefined" ? window.location.href : "https://artesania.local",
            icons: ["https://avatars.githubusercontent.com/u/37784886"]
          }
        });
        console.log("UniversalProvider inicializado:", p);
        setProvider(p);

        // Si ya hay una sesión guardada en memoria
        if (p.session) {
          const accounts = p.session.namespaces.eip155?.accounts;
          if (accounts && accounts.length > 0) {
            const addr = accounts[0].split(":")[2];
            setAddress(addr);
            fetchBalance(addr);
            
            const wc = createWalletClient({
              account: addr as `0x${string}`,
              chain: celo,
              transport: custom(p)
            });
            setWalletClientB(wc);
          }
        }
        
        p.on("accountsChanged", (accounts: string[]) => {
          if (accounts.length > 0) {
            const addr = accounts[0].split(":")[2];
            setAddress(addr);
            fetchBalance(addr);
            const wc = createWalletClient({
              account: addr as `0x${string}`,
              chain: celo,
              transport: custom(p)
            });
            setWalletClientB(wc);
          } else {
            resetState();
          }
        });
        
        p.on("disconnect", resetState);

      } catch (e) {
        console.error("Error inicializando UniversalProvider en UbiFlowContext", e);
      }
    };
    initProvider();
  }, []);

  const resetState = () => {
    setAddress(null);
    setBalanceG(0n);
    setBalanceNativeB(0n);
    setBalanceCUSDB(0n);
    setWalletClientB(null);
  };

  const fetchBalance = async (addr: string) => {
    const publicClient = createPublicClient({ chain: celo, transport: http("https://forno.celo.org") });
    try {
      const gDollarAddress = getAddress("0x62B8B11039fcfE5aB0C56E502b1C372A3d2a9C7A");
      const checkSummedAddr = getAddress(addr);
      
      const abi = [{ type: "function", name: "balanceOf", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" }] as const;
      
      const bal = await publicClient.readContract({
        address: gDollarAddress,
        abi,
        functionName: "balanceOf",
        args: [checkSummedAddr]
      });
      
      const nativeBal = await publicClient.getBalance({ address: checkSummedAddr });
      
      const cUSDBal = await publicClient.readContract({
        address: getAddress("0x765DE816845861e75A25fCA122bb6898B8B1282a"),
        abi,
        functionName: "balanceOf",
        args: [checkSummedAddr]
      });

      console.log("G$ Balance fetched:", bal);
      setBalanceG(bal);
      setBalanceNativeB(nativeBal);
      setBalanceCUSDB(cUSDBal);
      return bal;
    } catch(e) {
      console.error("fetchBalance error", e);
      return 0n;
    }
  };

  const connect = async () => {
    if (!provider) {
      console.error("Provider no está listo");
      return;
    }
    setIsConnecting(true);
    const modal = new WalletConnectModal({ projectId: PROJECT_ID });
    
    try {
      provider.on("display_uri", (uri: string) => {
        console.log("Mostrando modal WalletConnect", uri);
        modal.openModal({ uri });
      });

      console.log("Llamando a provider.connect()...");
      const session = await provider.connect({
        namespaces: {
          eip155: {
            methods: ["eth_sendTransaction", "personal_sign", "eth_signTypedData"],
            chains: ["eip155:42220"],
            events: ["chainChanged", "accountsChanged"],
            rpcMap: {
              42220: "https://forno.celo.org"
            }
          }
        }
      });

      console.log("Sesión establecida:", session);
      modal.closeModal();

      if (session) {
        const addr = session.namespaces.eip155.accounts[0].split(":")[2];
        setAddress(addr);
        fetchBalance(addr);
        const wc = createWalletClient({
          account: addr as `0x${string}`,
          chain: celo,
          transport: custom(provider)
        });
        setWalletClientB(wc);
      }
    } catch(e) {
      console.error("Error conectando WalletConnect", e);
      modal.closeModal();
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    if (provider) {
      await provider.disconnect();
      resetState();
    }
  };

  return (
    <UbiFlowContext.Provider value={{ provider, address, balanceG, balanceNativeB, balanceCUSDB, isConnecting, connect, disconnect, walletClientB }}>
      {children}
    </UbiFlowContext.Provider>
  );
}

export const useUbiFlowContext = () => {
  const ctx = useContext(UbiFlowContext);
  if (!ctx) throw new Error("useUbiFlowContext debe usarse dentro de UbiFlowProvider");
  return ctx;
};
