"use client";

import FarcasterLoader from "app/components/farcasterLoader";
import "./globals.css";
import Providers from "@/components/privyProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <FarcasterLoader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
