"use client";

import FarcasterLoader from "app/components/farcasterLoader";
import "./globals.css";
import Providers from "@/components/privyProvider";
//import Navbar from "app/components/navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <meta
        //httpEquiv="Content-Security-Policy"
        content="connect-src 'self' https://auth.privy.io https://gateway.pinata.cloud https://*.mypinata.cloud; img-src 'self' data: https://gateway.pinata.cloud https://*.mypinata.cloud; default-src 'self'; script-src 'self' https://auth.privy.io; style-src 'self' 'unsafe-inline';"
      />
      <body>
        <Providers>
          {/*<Navbar />*/}
          <FarcasterLoader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
