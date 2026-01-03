import type { Metadata } from "next";
import ClientHome from "./clientHome";
// Metadatos para que Farcaster reconozca tu App como un Frame
export const metadata: Metadata = {
  title: "Artesanía Viajera",
  description: "Explora y colecciona artesanías con Farcaster y Self",
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://artesania-viajera-poap.vercel.app/og-image.png",
    "fc:frame:button:1": "📍 Ver Mapa",
    "fc:frame:button:2": "🆔 Verificar Identidad",
    "fc:frame:post_url": "https://artesania-viajera-poap.vercel.app/api/frame",
  },
};

export default function Page() {
  return <ClientHome />;
}
