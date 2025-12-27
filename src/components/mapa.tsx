"use client";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import ClaimButton from "./claim-button"; // Importación de componente local

export default function Mapa() {
  const center: [number, number] = [6.25, -75.6];
  const gtp: [number, number] = [6.23, -75.16];
  const sfe: [number, number] = [6.55, -75.82];

  return (
    <MapContainer
      center={center}
      zoom={9}
      zoomControl={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png" />

      {/* Marcador Guatapé */}
      <CircleMarker center={gtp} pathOptions={{ color: "#00e5ff" }} radius={10}>
        <Popup interactive={true} className="custom-popup">
          <div className="p-2 text-center">
            <h3 className="font-bold text-zinc-900">Guatapé</h3>
            <span className="text-xs text-zinc-600">Artesanía Viajera</span>
            <ClaimButton location="Guatapé" />
          </div>
        </Popup>
      </CircleMarker>

      {/* Marcador Santa Fe */}
      <CircleMarker center={sfe} pathOptions={{ color: "#00ff41" }} radius={10}>
        <Popup interactive={true} className="custom-popup">
          <div className="p-2 text-center">
            <h3 className="font-bold text-zinc-900">Santa Fe</h3>
            <span className="text-xs text-zinc-600">Artesanía Viajera</span>
            <ClaimButton location="Santa Fe" />
          </div>
        </Popup>
      </CircleMarker>
    </MapContainer>
  );
}
