"use client";

import FarcasterLoader from "app/components/farcasterLoader";
import "./globals.css";
import Providers from "@/components/privyProvider";
import Navbar from "app/components/navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <Navbar />
          <FarcasterLoader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
