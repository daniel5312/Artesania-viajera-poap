export type Lang = "es" | "en"

const dict: Record<string, Record<Lang, string>> = {
  // Header
  "header.title": { es: "Artesania Viajera", en: "Artesania Viajera" },

  // Bottom nav
  "nav.pasaporte": { es: "Pasaporte", en: "Passport" },
  "nav.tienda": { es: "Tienda", en: "Shop" },
  "nav.momentos": { es: "Momentos", en: "Moments" },
  "nav.comunidad": { es: "Comunidad", en: "Community" },

  // Pasaporte
  "pasaporte.stamps": { es: "Sellos de Pasaporte", en: "Passport Stamps" },
  "pasaporte.location": { es: "Guatape, Antioquia", en: "Guatape, Antioquia" },

  // Tienda
  "tienda.title": { es: "Tienda Local", en: "Local Shop" },
  "tienda.payWith": { es: "Paga con cCOP", en: "Pay with cCOP" },
  "tienda.productos": { es: "Productos", en: "Products" },
  "tienda.insights": { es: "Insights NFT", en: "NFT Insights" },
  "tienda.by": { es: "por", en: "by" },
  "tienda.pay": { es: "Pagar", en: "Pay" },
  "tienda.cCOP": { es: "cCOP", en: "cCOP" },
  "tienda.confirmed": { es: "Pago Confirmado", en: "Payment Confirmed" },
  "tienda.processing": { es: "Procesando en Celo...", en: "Processing on Celo..." },
  "tienda.nftsMinted": { es: "NFTs Minteados", en: "NFTs Minted" },
  "tienda.volume": { es: "Volumen cCOP", en: "cCOP Volume" },
  "tienda.villages": { es: "Pueblos Activos", en: "Active Villages" },
  "tienda.buyers": { es: "Compradores", en: "Buyers" },
  "tienda.salesByVillage": { es: "Ventas por Pueblo", en: "Sales by Village" },
  "tienda.topNfts": { es: "Top NFTs Gemelos", en: "Top Twin NFTs" },
  "tienda.recentTx": { es: "Transacciones Recientes", en: "Recent Transactions" },
  "tienda.nftsSold": { es: "NFTs Vendidos", en: "NFTs Sold" },
  "tienda.celoNet": { es: "Red Celo Mainnet", en: "Celo Mainnet" },
  "tienda.ago2min": { es: "hace 2 min", en: "2 min ago" },
  "tienda.ago8min": { es: "hace 8 min", en: "8 min ago" },
  "tienda.ago23min": { es: "hace 23 min", en: "23 min ago" },

  // Product descriptions
  "product.manilla.name": { es: "Manilla Guatape", en: "Guatape Bracelet" },
  "product.manilla.desc": {
    es: "Pulsera artesanal tejida a mano por artesanos locales de Guatape. Cada pieza es unica.",
    en: "Handwoven artisan bracelet by local Guatape craftspeople. Each piece is unique.",
  },
  "product.mochila.name": { es: "Mochila Wayuu", en: "Wayuu Bag" },
  "product.mochila.desc": {
    es: "Bolso tradicional Wayuu con patron geometrico unico. Tejido a mano durante semanas.",
    en: "Traditional Wayuu bag with unique geometric patterns. Handwoven over weeks.",
  },
  "product.sombrero.name": { es: "Sombrero Vueltiao", en: "Vueltiao Hat" },
  "product.sombrero.desc": {
    es: "Sombrero tradicional colombiano tejido en cana flecha. Patrimonio cultural de la nacion.",
    en: "Traditional Colombian hat woven from cana flecha. A national cultural heritage.",
  },

  // Comunidad
  "comunidad.title": { es: "Comunidad Guatape", en: "Guatape Community" },
  "comunidad.subtitle": {
    es: "Comparte tu experiencia con otros viajeros",
    en: "Share your experience with fellow travelers",
  },
  "comunidad.upload": { es: "Subir Momento", en: "Upload Moment" },
  "comunidad.dragDrop": {
    es: "Arrastra una foto o toca para seleccionar",
    en: "Drag a photo or tap to select",
  },
  "comunidad.selectPhoto": { es: "Seleccionar Foto", en: "Select Photo" },

  // Momentos
  "momentos.title": { es: "Momentos Compartidos", en: "Shared Moments" },
  "momentos.subtitle": {
    es: "Conecta con viajeros que compraron la misma artesania",
    en: "Connect with travelers who bought the same craft",
  },
  "momentos.all": { es: "Todos", en: "All" },
  "momentos.connected": { es: "conectados", en: "connected" },
  "momentos.ctaTitle": {
    es: "Compra para unirte al circulo",
    en: "Buy to join the circle",
  },
  "momentos.ctaBody": {
    es: "Cada artesania que compras te conecta con otros viajeros que adquirieron la misma pieza. Comparte tus momentos y crea recuerdos colectivos.",
    en: "Every craft you buy connects you with other travelers who acquired the same piece. Share your moments and create collective memories.",
  },
  "momentos.goToShop": { es: "Ir a la Tienda", en: "Go to Shop" },

  // Moment captions
  "moment.1.caption": {
    es: "Compre mi manilla caminando por estas calles llenas de color. Cada zocalo cuenta una historia diferente.",
    en: "I bought my bracelet walking through these colorful streets. Each zocalo tells a different story.",
  },
  "moment.2.caption": {
    es: "Desde la cima del Penol con mi mochila nueva. 740 escalones y cada uno valio la pena.",
    en: "From the top of El Penol with my new bag. 740 steps and every one was worth it.",
  },
  "moment.3.caption": {
    es: "Encontre la artesana Maria en el mercado y me conto la historia detras de cada patron. Experiencia unica.",
    en: "I found artisan Maria at the market and she told me the story behind each pattern. Unique experience.",
  },
  "moment.4.caption": {
    es: "Paseo por la represa estrenando mi sombrero vueltiao. El NFT gemelo ya esta en mi wallet.",
    en: "Strolling the reservoir wearing my new vueltiao hat. The twin NFT is already in my wallet.",
  },

  // Community captions
  "community.1.caption": { es: "Calles magicas de Guatape!", en: "Magical streets of Guatape!" },
  "community.2.caption": { es: "Vista desde el Penol", en: "View from El Penol" },
  "community.3.caption": { es: "Mercado artesanal increible", en: "Amazing artisan market" },
  "community.4.caption": { es: "Paseo en lancha por la represa", en: "Boat ride on the reservoir" },

  // Time
  "time.2h": { es: "hace 2h", en: "2h ago" },
  "time.5h": { es: "hace 5h", en: "5h ago" },
  "time.1d": { es: "hace 1d", en: "1d ago" },
  "time.2d": { es: "hace 2d", en: "2d ago" },
}

export function t(lang: Lang, key: string): string {
  return dict[key]?.[lang] ?? key
}
