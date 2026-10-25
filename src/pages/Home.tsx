import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-bold text-brand">TLQ Scanner</h1>
      <p className="mt-2 text-zinc-600">Pilih bagian yang ingin dibuka.</p>
      <div className="mt-6 flex gap-3">
        <Link className="rounded-md bg-brand px-4 py-2 text-white" to="/scan">Scanner</Link>
        <Link className="rounded-md border px-4 py-2" to="/admin">Master Data</Link>
        <Link className="rounded-md border px-4 py-2" to="/uji-ocr">Uji OCR (Tahap 1)</Link>
      </div>
    </main>
  );
}
