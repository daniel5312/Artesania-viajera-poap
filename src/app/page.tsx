import type { Metadata } from "next";
import MiniPayPage from "./minipay/page"; // Importamos tu lógica de MiniPay

const frameMetadata = {
  version: "next",
  imageUrl: "https://artesania-viajera-poap.vercel.app/og-image.png",
  button: {
    title: "📍 Abrir Artesanía Viajera",
    action: {
      type: "launch_frame",
      name: "Artesanía Viajera",
      url: "https://artesania-viajera-poap.vercel.app/",
      splashImageUrl: "https://artesania-viajera-poap.vercel.app/splash.png",
      splashBackgroundColor: "#0a0a0a",
    },
  },
};

export const metadata: Metadata = {
  title: "Artesanía Viajera",
  description: "Pasaporte Digital de Artesanías en Celo Mainnet",
  other: {
    "fc:frame": JSON.stringify(frameMetadata),
  },
};

export default function Page() {
  // Cargamos directamente la vista de MiniPay que ya tiene el Pasaporte como tab inicial
  return <MiniPayPage />;
}
