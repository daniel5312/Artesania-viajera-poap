import type { Metadata } from "next";
import MiniPayPage from "./minipay/page";

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
    "talentapp:project_verification":
      "424937798db8706ac312873e8651eae136a627a3760083561f7f6c707a6fb4efab9feff6a347e4c2404eeab7988e1ce4423e4151f677767d5f6b1d28967f36ba",
  },
};

export default function Page() {
  return <MiniPayPage />;
}
