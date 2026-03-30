// src/constants/pueblos.ts

export interface PuntoInteres {
    id: number; // ID único para el ERC-1155 (Rango PUEBLO + SITIO)
    nombre: string;
    coords: { lat: number; lng: number };
    radio: number; // Metros a la redonda para permitir el reclamo
    historiaBase: string; // Lo que la IA usará como semilla
}

export interface Pueblo {
    nombre: string;
    idRango: number; // Prefijo para los IDs (100 para Santa Fe, 200 para Guatapé...)
    centro: { lat: number; lng: number };
    puntos: PuntoInteres[];
}

export const PUEBLOS_DATA: Record<string, Pueblo> = {
    "santa-fe": {
        nombre: "Santa Fe de Antioquia",
        idRango: 100,
        centro: { lat: 6.5569, lng: -75.8277 },
        puntos: [
            {
                id: 100001,
                nombre: "Iglesia Santa Bárbara",
                coords: { lat: 6.5582, lng: -75.8271 },
                radio: 50,
                historiaBase: "Icono del estilo barroco popular colonial..."
            },
            {
                id: 100002,
                nombre: "Puente de Occidente",
                coords: { lat: 6.5785, lng: -75.7952 },
                radio: 100,
                historiaBase: "Obra maestra de ingeniería de José María Villa..."
            }
        ]
    },
    "guatape": {
        nombre: "Guatapé",
        idRango: 200,
        centro: { lat: 6.233, lng: -75.163 },
        puntos: [
            {
                id: 200001,
                nombre: "Piedra del Peñol",
                coords: { lat: 6.221, lng: -75.179 },
                radio: 150,
                historiaBase: "Monolito gigante con 740 escalones..."
            },
            {
                id: 200002,
                nombre: "Plazoleta de los Zócalos",
                coords: { lat: 6.2341, lng: -75.1612 },
                radio: 50,
                historiaBase: "El lugar más colorido de Colombia donde cada zócalo cuenta una historia..."
            }
        ]
    },
    "jardin": {
        nombre: "Jardín",
        idRango: 300,
        centro: { lat: 5.599, lng: -75.819 },
        puntos: [
            { id: 300001, nombre: "Basílica de la Inmaculada Concepción", coords: { lat: 5.5992, lng: -75.8191 }, radio: 50, historiaBase: "" }
        ]
    },
    "medellin": {
        nombre: "Medellín y Valle de Aburrá",
        idRango: 400,
        centro: { lat: 6.244, lng: -75.581 },
        puntos: [
            { id: 400001, nombre: "Plaza Botero", coords: { lat: 6.2522, lng: -75.5692 }, radio: 60, historiaBase: "" }
        ]
    }
};