import { NextResponse } from "next/server";

export async function POST() {
    return NextResponse.json({
        type: "launch_app",
        name: "Artesanía Viajera",
        url: "https://artesania-viajera-poap.vercel.app/"
    });
}