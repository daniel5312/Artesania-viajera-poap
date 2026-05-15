"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { usePrivy } from "@privy-io/react-auth";

type Message = {
  role: "user" | "assistant";
  content: string;
};

interface AgentContextType {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (text: string, agentRole?: string) => Promise<void>;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const { user } = usePrivy();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string, agentRole?: string) => {
    try {
      setIsLoading(true);
      const userMessage: Message = { role: "user", content: text };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          agentRole: agentRole || "CIVIL",
          sessionMetadata: { address: user?.wallet?.address, timestamp: Date.now() },
        }),
      });

      if (!response.body) throw new Error("No hay cuerpo en la respuesta");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullContent += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = fullContent;
          return newMessages;
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AgentContext.Provider value={{ messages, isLoading, sendMessage }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (!context) throw new Error("useAgent debe usarse dentro de un AgentProvider");
  return context;
}
