import type { Metadata } from "next";
import ClientHome from "./clientHome";

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
  description: "Explora y colecciona artesanías con Farcaster y Self",
  other: {
    "fc:frame": JSON.stringify(frameMetadata),
  },
};

export default function Page() {
  return <ClientHome />;
}
