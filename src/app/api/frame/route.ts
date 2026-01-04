import { NextResponse } from "next/server";

export async function POST() {
    return NextResponse.json({
        type: "frame",
        version: "next",
        imageUrl: "https://artesania-viajera-poap.vercel.app/og-image.png",
        button: {
            title: "Lanzar Artesanía Viajera",
            action: {
                type: "launch_frame",
                name: "Artesanía Viajera",
                url: "https://artesania-viajera-poap.vercel.app/",
                splashImageUrl: "https://artesania-viajera-poap.vercel.app/splash.png",
                splashBackgroundColor: "#0a0a0a"
            }
        }
    });
}

export async function GET() {
    return POST();
}