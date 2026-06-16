import { NextResponse } from "next/server";

// Memoria global temporal para la Hackathon (se pierde si reinicias npm run dev)
// Guarda el último reporte de ubicación de cada artesano
let activeArtisans: Record<string, { lat: number; lng: number; puebloId: string; timestamp: number }> = {};

export async function POST(req: Request) {
  try {
    const { walletAddress, lat, lng, puebloId } = await req.json();

    if (!walletAddress || !lat || !lng) {
      return NextResponse.json({ error: "Faltan datos de ubicación o wallet." }, { status: 400 });
    }

    // Guardar o actualizar la ubicación del artesano
    activeArtisans[walletAddress] = {
      lat,
      lng,
      puebloId: puebloId || "desconocido",
      timestamp: Date.now(),
    };

    console.log(`[API Location] Artesano ${walletAddress} ubicado en ${lat}, ${lng} (${puebloId})`);

    return NextResponse.json({ success: true, message: "Ubicación registrada exitosamente." });
  } catch (error) {
    console.error("Error en API /api/location:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

export async function GET() {
  // Limpiar artesanos que no han reportado en los últimos 30 minutos (opcional para mantener limpio el mapa)
  const now = Date.now();
  const thirtyMinutes = 30 * 60 * 1000;
  
  Object.keys(activeArtisans).forEach(wallet => {
    if (now - activeArtisans[wallet].timestamp > thirtyMinutes) {
      delete activeArtisans[wallet];
    }
  });

  // Devolver todos los artesanos activos
  return NextResponse.json({ artisans: activeArtisans });
}
