import { Link, Route, Routes } from "react-router-dom";
import Home from "@/pages/Home";
import PilihTema from "@/pages/scan/PilihTema";
import AdminRingkasan from "@/pages/admin/Ringkasan";
import UjiOcr from "@/pages/uji/UjiOcr";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/scan" element={<PilihTema />} />
      <Route path="/admin" element={<AdminRingkasan />} />
      <Route path="/uji-ocr" element={<UjiOcr />} />
      <Route path="*" element={<p className="p-8">Halaman tidak ditemukan. <Link className="text-brand underline" to="/">Kembali</Link></p>} />
    </Routes>
  );
}
