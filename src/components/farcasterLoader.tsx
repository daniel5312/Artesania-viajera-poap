"use client";
import { useEffect } from "react";
import sdk from "@farcaster/frame-sdk";

export default function FarcasterLoader() {
  useEffect(() => {
    sdk.actions.ready(); // <--- Esto activa la MiniApp
  }, []);
  return null;
}
