import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  SmartphoneNfc,
  Wallet,
  Map,
  Store,
  Rocket,
  Sparkles,
} from "lucide-react";

export default function PitchDeck() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-purple-500/30">
      {/* Navegación superior */}
      <nav className="p-6 max-w-7xl mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-bold">Volver al mapa</span>
        </Link>
        <div className="text-xs font-mono text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full bg-purple-500/10">
          Pitch Deck 2026
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pb-24 space-y-32">
        {/* 1. SLIDE: PORTADA */}
        <section className="min-h-[70vh] flex flex-col justify-center text-center space-y-6 pt-10">
          <div className="inline-flex items-center justify-center p-4 bg-purple-600/20 rounded-full mx-auto mb-4 border border-purple-500/30">
            <Sparkles className="text-purple-400 w-8 h-8" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
            Artesanía{" "}
            <span className="text-transparent bg-clip-text bg-gradient from-purple-400 to-blue-500">
              Viajera
            </span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Evolucionamos el souvenir tradicional en un{" "}
            <strong>Pasaporte Digital Phygital</strong>. Conectamos turismo,
            cultura y la blockchain de Celo sin fricciones.
          </p>
        </section>

        {/* 2. SLIDE: EL PROBLEMA */}
        <section className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-zinc-500">
              01. El Problema
            </h2>
            <h3 className="text-4xl font-bold">
              El recuerdo turístico se queda en un cajón.
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Desconexión",
                desc: "El turista compra la artesanía pero pierde el vínculo con la comunidad y el creador.",
              },
              {
                title: "Cero Trazabilidad",
                desc: "No hay forma de demostrar digitalmente que estuviste en ese lugar mágico.",
              },
              {
                title: "Fricción Web3",
                desc: "La tecnología blockchain es muy compleja para el turista y el artesano común.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl"
              >
                <h4 className="text-xl font-bold text-red-400 mb-3">
                  {item.title}
                </h4>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. SLIDE: LA SOLUCIÓN */}
        <section className="space-y-12 relative">
          <div className="absolute inset-0 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />
          <div className="space-y-4 relative">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-purple-500">
              02. La Solución
            </h2>
            <h3 className="text-4xl font-bold">
              Un Souvenir con Alma Digital.
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-8 relative">
            <div className="bg-linear-to-br from-purple-900/40 to-black border border-purple-500/30 p-10 rounded-3xl space-y-6">
              <SmartphoneNfc className="w-12 h-12 text-purple-400" />
              <h4 className="text-2xl font-bold">La Manilla Física</h4>
              <p className="text-zinc-300">
                Un producto artesanal, tejido con historia local. Incluye un
                código QR que funciona como puente al mundo digital.
              </p>
            </div>
            <div className="bg-linear-to-br from-blue-900/40 to-black border border-blue-500/30 p-10 rounded-3xl space-y-6">
              <Wallet className="w-12 h-12 text-blue-400" />
              <h4 className="text-2xl font-bold">El Gemelo Digital (NFT)</h4>
              <p className="text-zinc-300">
                Al escanear el QR, el usuario recibe un sello (POAP) en su
                Pasaporte Digital. Una prueba inmutable de su viaje en la
                blockchain.
              </p>
            </div>
          </div>
        </section>

        {/* 4. SLIDE: CÓMO FUNCIONA */}
        <section className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-zinc-500">
              03. La Magia (Frictionless)
            </h2>
            <h3 className="text-4xl font-bold">
              De la plaza a la blockchain en 10 segundos.
            </h3>
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
            <div className="text-center space-y-3 flex-1">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-2xl">
                1️⃣
              </div>
              <h4 className="font-bold">Compra</h4>
              <p className="text-xs text-zinc-400">
                El turista adquiere la artesanía en el municipio.
              </p>
            </div>
            <div className="hidden md:block text-zinc-600">→</div>
            <div className="text-center space-y-3 flex-1">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-2xl">
                2️⃣
              </div>
              <h4 className="font-bold">Escanea</h4>
              <p className="text-xs text-zinc-400">
                Lee el QR físico con su cámara. Cero apps extra.
              </p>
            </div>
            <div className="hidden md:block text-zinc-600">→</div>
            <div className="text-center space-y-3 flex-1">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                3️⃣
              </div>
              <h4 className="font-bold">Login Invisible</h4>
              <p className="text-xs text-purple-200">
                Privy crea una wallet web3 usando solo su Gmail.
              </p>
            </div>
            <div className="hidden md:block text-zinc-600">→</div>
            <div className="text-center space-y-3 flex-1">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                4️⃣
              </div>
              <h4 className="font-bold">Sello Estampado</h4>
              <p className="text-xs text-blue-200">
                Recibe su NFT en Celo y se une a la comunidad.
              </p>
            </div>
          </div>
        </section>

        {/* 5. SLIDE: MODELO DE NEGOCIO Y FUTURO */}
        <section className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-zinc-500">
              04. El Futuro
            </h2>
            <h3 className="text-4xl font-bold">Mucho más que un recuerdo.</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-black border border-zinc-800 p-6 rounded-2xl flex items-start gap-4">
              <Store className="w-8 h-8 text-green-400 shrink-0" />
              <div>
                <h4 className="font-bold mb-1">E-Commerce Web3</h4>
                <p className="text-xs text-zinc-400">
                  Tienda online nativa para comprar desde casa pagando con
                  cripto (CELO/cCOP).
                </p>
              </div>
            </div>
            <div className="bg-black border border-zinc-800 p-6 rounded-2xl flex items-start gap-4">
              <Map className="w-8 h-8 text-yellow-400 shrink-0" />
              <div>
                <h4 className="font-bold mb-1">Mapa Interactivo</h4>
                <p className="text-xs text-zinc-400">
                  Exploración de municipios, compartiendo momentos reales en un
                  pasaporte público.
                </p>
              </div>
            </div>
            <div className="bg-black border border-zinc-800 p-6 rounded-2xl flex items-start gap-4">
              <Globe className="w-8 h-8 text-pink-400 shrink-0" />
              <div>
                <h4 className="font-bold mb-1">Impacto Social</h4>
                <p className="text-xs text-zinc-400">
                  Trazabilidad de fondos y regalías directas a las comunidades
                  artesanas en Colombia.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="text-center pt-12 pb-24">
          <div className="inline-block bg-linear-to-r from-purple-600 to-blue-600 p-px rounded-full mb-8">
            <Link
              href="/"
              className="flex items-center gap-2 bg-black px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-zinc-900 transition-colors"
            >
              <Rocket size={20} />
              Explorar el Proyecto
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
