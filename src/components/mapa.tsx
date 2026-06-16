"use client";

import { useState, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, CheckCircle2, Lock } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

// ─── LÓGICA DE DISTANCIA (Haversine) ──────────────────────────────────────
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distancia en metros
}

const PUNTOS_RECLAMO = [
  { id: 1, pueblo: "Guatapé", nombre: "Zócalo del Recuerdo", coords: [6.234, -75.161], tipo: "Sello" },
  { id: 2, pueblo: "Guatapé", nombre: "Muelle Principal", coords: [6.232, -75.158], tipo: "NFT" },
  { id: 3, pueblo: "Jardín",  nombre: "Café de la Unión", coords: [5.598, -75.819], tipo: "Sello" },
  { id: 5, pueblo: "Santa Fe", nombre: "Puente de Occidente", coords: [6.596, -75.823], tipo: "Sello" },
  { id: 6, pueblo: "Envigado", nombre: "Parque de Envigado", coords: [6.1759, -75.5917], tipo: "Sello" },
];

const createCustomIcon = (isNear: boolean) => {
  const iconMarkup = renderToStaticMarkup(
    <div className="relative flex items-center justify-center">
      {isNear && <div className="absolute w-10 h-10 rounded-full bg-[#5FF5B4]/30 animate-ping" />}
      <div className={`relative p-1.5 rounded-full border-2 shadow-lg transition-colors ${isNear ? "bg-white border-[#5FF5B4]" : "bg-zinc-200 border-zinc-400 opacity-60"}`}>
        <MapPin size={18} color="#0d0d0c" fill={isNear ? "#5FF5B4" : "#a1a1aa"} />
      </div>
    </div>
  );
  return L.divIcon({ html: iconMarkup, className: "custom-div-icon", iconSize: [30, 30], iconAnchor: [15, 30] });
};

function RecenterMap({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(coords, 15, { animate: true }); }, [coords, map]);
  return null;
}

export default function Mapa({ selectedTown = "Envigado" }: { selectedTown?: string }) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [liveArtisans, setLiveArtisans] = useState<any[]>([]);

  // Obtener ubicación real del Turista
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Hacer Polling a la API para buscar artesanos activos
  useEffect(() => {
    const fetchArtisans = async () => {
      try {
        const res = await fetch("/api/location");
        if (res.ok) {
          const data = await res.json();
          const artisansArray = Object.entries(data.artisans || {}).map(([wallet, info]: any) => ({
            id: wallet,
            ...info
          }));
          setLiveArtisans(artisansArray);
        }
      } catch (e) {
        console.error("Error buscando artesanos en vivo", e);
      }
    };
    
    fetchArtisans();
    const interval = setInterval(fetchArtisans, 5000); // Actualiza cada 5s
    return () => clearInterval(interval);
  }, []);

  const filteredPoints = useMemo(() => PUNTOS_RECLAMO.filter(p => p.pueblo === selectedTown), [selectedTown]);
  const center = useMemo(() => (
    filteredPoints.length > 0 
      ? filteredPoints[0].coords as [number, number] 
      : [6.244, -75.572] as [number, number]
  ), [filteredPoints]);

  return (
    <div className="w-full h-full relative">
      <MapContainer 
        center={center} 
        zoom={15} 
        zoomControl={false} 
        style={{ height: "100%", width: "100%", background: "#e0f2f1" }}
      >
        {/* Tiles Voyager: Mucho más coloridos (parques verdes, agua azul, calles detalladas) */}
        <TileLayer 
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
          maxZoom={19}
        />
        
        {filteredPoints.map((point) => {
          const dist = userPos ? getDistance(userPos[0], userPos[1], point.coords[0], point.coords[1]) : Infinity;
          const isNear = dist < 5000; // 5KM para la Demo

          return (
            <Marker key={point.id} position={point.coords as [number, number]} icon={createCustomIcon(isNear)}>
              <Popup>
                <div className="p-2 flex flex-col gap-2 min-w-[160px]">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-[#00a368]">Punto de Reclamo</span>
                    <p className="text-xs font-black text-[#0d0d0c]">{point.nombre}</p>
                  </div>

                  {isNear ? (
                    <button className="w-full py-2.5 bg-[#5FF5B4] text-[#050505] rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(95,245,180,0.4)] active:scale-95 transition-all">
                      <CheckCircle2 size={13} /> Reclamar Recompensa y NFT
                    </button>
                  ) : (
                    <div className="flex flex-col gap-1">
                       <button disabled className="w-full py-2.5 bg-zinc-100 text-[#6b6862] rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 border border-zinc-200 opacity-70">
                        <Lock size={12} /> Bloqueado
                      </button>
                      <p className="text-[7px] text-center font-bold text-zinc-400 mt-1">Acércate al punto para desbloquear</p>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 🎨 PINES DE ARTESANOS EN VIVO */}
        {liveArtisans.map((artisan) => (
          <Marker key={artisan.id} position={[artisan.lat, artisan.lng]} icon={createCustomIcon(true)}>
            <Popup>
              <div className="p-2 flex flex-col gap-2 min-w-[160px]">
                <div className="flex flex-col mb-1">
                  <span className="text-[9px] font-black uppercase text-[#8162f3] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8162f3] animate-pulse"></span>
                    Artesano Activo en {artisan.puebloId.replace("_", " ")}
                  </span>
                  <p className="text-[10px] font-bold text-zinc-600 leading-tight mt-1">
                    Reclama tu NFT, crea un momento único con el artesano y recibe tokens de recompensa.
                  </p>
                </div>
                <button className="w-full py-2 bg-[#8162f3] text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(129,98,243,0.4)] active:scale-95 transition-all">
                  <MapPin size={13} /> Ir a Escanear QR
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 🧍 TURISTA (TÚ) */}
        {userPos && (
          <Marker position={userPos} icon={createCustomIcon(false)}>
             <Popup>
               <div className="p-2 text-center min-w-[100px]">
                 <p className="text-xs font-black text-[#0d0d0c] uppercase">Tú estás aquí</p>
                 <p className="text-[9px] text-zinc-500 font-bold mt-1">Modo Turista</p>
               </div>
             </Popup>
          </Marker>
        )}

        <RecenterMap coords={center} />
      </MapContainer>

      {/* Overlay de Estado */}
      <div className="absolute top-4 left-4 z-[1000] flex gap-2">
         <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#dcd8d1] shadow-sm flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${userPos ? "bg-[#5FF5B4] animate-pulse" : "bg-red-400"}`} />
            <span className="text-[9px] font-black uppercase text-[#0d0d0c]">
              {userPos ? "GPS Activo" : "Buscando GPS..."}
            </span>
         </div>
      </div>
    </div>
  );
}
