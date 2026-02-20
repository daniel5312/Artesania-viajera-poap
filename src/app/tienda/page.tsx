import ArtesaniaStore from "@/components/artesaniaStore";

export default function TiendaPage() {
  return (
    <main className="max-w-7xl mx-auto pt-10 px-4">
      <h1 className="text-4xl font-black mb-2">Tienda Oficial</h1>
      <p className="text-zinc-400 mb-8">
        Adquiere artesanías auténticas con su gemelo digital.
      </p>
      <ArtesaniaStore />
    </main>
  );
}
