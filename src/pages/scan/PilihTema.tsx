import { TEMA } from "@/lib/types";

// Tahap 4: layar S1 (Pilih tema dan kategori). Lihat docs/desain/Main.dc.html.
export default function PilihTema() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-xl font-bold">Pilih tema dan kategori</h1>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {TEMA.map((t) => (
          <button key={t.id} className="rounded-lg border bg-white p-4 text-left hover:border-brand">
            <span className="text-xs text-zinc-500">{t.id}</span>
            <div className="font-semibold">{t.nama}</div>
          </button>
        ))}
      </div>
    </main>
  );
}
