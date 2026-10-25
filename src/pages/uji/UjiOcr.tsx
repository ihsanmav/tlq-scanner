import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { createWorker, OEM, PSM, type Worker } from "tesseract.js";
import { Camera, Download, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useKamera } from "@/hooks/useKamera";
import { ambilGambar, hitungBingkai, peringatanMutu, type MutuGambar } from "@/lib/ocr/gambar";
import { hitungKetepatan, rapikanTeks } from "@/lib/ocr/teks";

// Tahap 1: uji ketepatan Tesseract.js (bahasa Indonesia) pada 20 kartu dari webcam laptop.
// Yang disimpan di browser hanya teks dan angka. Gambar kartu tidak disimpan dan tidak diunggah.

const TARGET = 0.95;
const TARGET_KARTU = 20;
const KUNCI_CATATAN = "tlq-uji-ocr-v1";

type Sisi = "depan" | "belakang";

interface Catatan {
  id: string;
  waktu: string;
  noKartu: number;
  sisi: Sisi;
  resolusi: string;
  praOlah: boolean;
  psm: string;
  mutu: MutuGambar;
  durasiMs: number;
  keyakinan: number; // skor keyakinan dari Tesseract, 0..100
  teksOcr: string;
  teksAsli: string;
  ketepatanHuruf: number;
  ketepatanKata: number;
}

interface HasilSementara {
  gambar: string; // data URL, hanya di memori
  mutu: MutuGambar;
  durasiMs: number;
  keyakinan: number;
  teksOcr: string;
}

function bacaCatatan(): Catatan[] {
  try {
    return JSON.parse(localStorage.getItem(KUNCI_CATATAN) ?? "[]");
  } catch {
    return [];
  }
}

const persen = (n: number) => `${(n * 100).toFixed(1)}%`;
const rata = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

function unduhCsv(catatan: Catatan[]) {
  const kolom = [
    "no_kartu", "sisi", "waktu", "resolusi", "pra_olah", "psm", "terang", "ketajaman", "pantulan",
    "durasi_ms", "keyakinan", "ketepatan_huruf", "ketepatan_kata", "teks_ocr", "teks_asli",
  ];
  const kutip = (v: string | number | boolean) => `"${String(v).replace(/"/g, '""')}"`;
  const baris = catatan.map((c) =>
    [
      c.noKartu, c.sisi, c.waktu, c.resolusi, c.praOlah, c.psm, c.mutu.terang.toFixed(0), c.mutu.ketajaman.toFixed(0),
      c.mutu.pantulan.toFixed(4), c.durasiMs, c.keyakinan.toFixed(0), c.ketepatanHuruf.toFixed(4),
      c.ketepatanKata.toFixed(4), c.teksOcr, c.teksAsli,
    ].map(kutip).join(","),
  );
  // BOM supaya Excel membaca huruf dengan benar.
  const blob = new Blob(["﻿" + [kolom.join(","), ...baris].join("\r\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `uji-ocr-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function UjiOcr() {
  const { videoRef, daftar, deviceId, pilihKamera, resolusi, galat, cobaLagi } = useKamera();

  const workerRef = useRef<Worker | null>(null);
  const [statusModel, setStatusModel] = useState("Memuat OCR bahasa Indonesia...");
  const [modelSiap, setModelSiap] = useState(false);
  const [progres, setProgres] = useState(0);

  const [mendatar, setMendatar] = useState(true);
  const [sisi, setSisi] = useState<Sisi>("depan");
  const [psm, setPsm] = useState<string>(PSM.AUTO);
  const [praOlah, setPraOlah] = useState(true);
  const [membaca, setMembaca] = useState(false);

  const [hasil, setHasil] = useState<HasilSementara | null>(null);
  const [teksAsli, setTeksAsli] = useState("");
  const [catatan, setCatatan] = useState<Catatan[]>(bacaCatatan);
  const [noKartu, setNoKartu] = useState(() => Math.max(0, ...bacaCatatan().map((c) => c.noKartu)) + 1);

  useEffect(() => {
    try {
      localStorage.setItem(KUNCI_CATATAN, JSON.stringify(catatan));
    } catch {
      // catatan tetap ada selama halaman terbuka; unduh CSV sebelum menutup
    }
  }, [catatan]);

  useEffect(() => {
    let batal = false;
    createWorker("ind", OEM.LSTM_ONLY, {
      logger: (m) => {
        if (m.status === "recognizing text") setProgres(m.progress);
      },
    })
      .then((w) => {
        if (batal) return w.terminate();
        workerRef.current = w;
        setModelSiap(true);
        setStatusModel("OCR siap");
      })
      .catch(() => {
        if (!batal) setStatusModel("OCR gagal dimuat. Periksa koneksi internet (data bahasa diunduh sekali), lalu muat ulang halaman.");
      });
    return () => {
      batal = true;
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const bingkai = useMemo(
    () => hitungBingkai(resolusi ? resolusi.lebar / resolusi.tinggi : 16 / 9, mendatar ? 3 / 2 : 2 / 3),
    [resolusi, mendatar],
  );

  const scan = useCallback(async () => {
    const video = videoRef.current;
    const worker = workerRef.current;
    if (!video || !worker || !resolusi || membaca) return;
    setMembaca(true);
    setProgres(0);
    try {
      const { kanvas, mutu } = ambilGambar(video, bingkai, praOlah);
      const mulai = performance.now();
      await worker.setParameters({ tessedit_pageseg_mode: psm as PSM, preserve_interword_spaces: "1" });
      const { data } = await worker.recognize(kanvas);
      const durasiMs = Math.round(performance.now() - mulai);
      const teksOcr = rapikanTeks(data.text);
      setHasil({ gambar: kanvas.toDataURL("image/jpeg", 0.8), mutu, durasiMs, keyakinan: data.confidence, teksOcr });
      setTeksAsli(teksOcr);
    } finally {
      setMembaca(false);
    }
  }, [videoRef, resolusi, membaca, bingkai, praOlah, psm]);

  // Tombol spasi = Scan, kecuali saat sedang mengetik.
  useEffect(() => {
    const tekan = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.code !== "Space" || el.closest("input, textarea, select, button, [role=combobox]")) return;
      e.preventDefault();
      scan();
    };
    window.addEventListener("keydown", tekan);
    return () => window.removeEventListener("keydown", tekan);
  }, [scan]);

  const simpan = () => {
    if (!hasil || !resolusi || !teksAsli.trim()) return;
    const k = hitungKetepatan(hasil.teksOcr, teksAsli);
    setCatatan((cs) => [
      ...cs,
      {
        id: crypto.randomUUID(),
        waktu: new Date().toISOString(),
        noKartu,
        sisi,
        resolusi: `${resolusi.lebar}x${resolusi.tinggi}`,
        praOlah,
        psm,
        mutu: hasil.mutu,
        durasiMs: hasil.durasiMs,
        keyakinan: hasil.keyakinan,
        teksOcr: hasil.teksOcr,
        teksAsli: teksAsli.trim(),
        ketepatanHuruf: k.huruf,
        ketepatanKata: k.kata,
      },
    ]);
    // Urutan biasa: depan lalu belakang, kemudian kartu berikutnya.
    if (sisi === "depan") setSisi("belakang");
    else {
      setSisi("depan");
      setNoKartu((n) => n + 1);
    }
    setHasil(null);
    setTeksAsli("");
  };

  const ringkasan = useMemo(() => {
    const per = (s?: Sisi) => catatan.filter((c) => !s || c.sisi === s).map((c) => c.ketepatanHuruf);
    return {
      kartu: new Set(catatan.map((c) => c.noKartu)).size,
      huruf: rata(per()),
      depan: rata(per("depan")),
      belakang: rata(per("belakang")),
      kata: rata(catatan.map((c) => c.ketepatanKata)),
      terendah: catatan.length ? Math.min(...per()) : 0,
      durasi: rata(catatan.map((c) => c.durasiMs)),
    };
  }, [catatan]);

  const resolusiRendah = resolusi && (resolusi.lebar < 1280 || resolusi.tinggi < 720);
  const ketepatanKini = hasil && teksAsli.trim() ? hitungKetepatan(hasil.teksOcr, teksAsli) : null;

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Uji OCR di webcam</h1>
          <p className="text-sm text-muted-foreground">
            Tahap 1: scan {TARGET_KARTU} kartu (depan dan belakang), koreksi teksnya, lalu lihat ketepatan bacanya. Target {persen(TARGET)}.
          </p>
        </div>
        <Link to="/" className="text-sm text-primary underline">Kembali</Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex flex-wrap items-center gap-2 text-base">
              Kamera
              {resolusi && <Badge variant="secondary">{resolusi.lebar}x{resolusi.tinggi}</Badge>}
              <Badge variant={modelSiap ? "secondary" : "outline"}>{statusModel}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {galat ? (
              <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
                <p>{galat}</p>
                <Button variant="outline" onClick={cobaLagi}><RotateCcw /> Coba lagi</Button>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-lg bg-zinc-900">
                {/* Pratinjau tidak dicerminkan supaya teks kartu terbaca normal. */}
                <video ref={videoRef} muted playsInline className="block w-full" />
                {resolusi && (
                  <div
                    className="pointer-events-none absolute rounded-lg border-2 border-dashed border-teal-300"
                    style={{
                      left: `${bingkai.x * 100}%`,
                      top: `${bingkai.y * 100}%`,
                      width: `${bingkai.w * 100}%`,
                      height: `${bingkai.h * 100}%`,
                      boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)",
                    }}
                  />
                )}
              </div>
            )}
            {resolusiRendah && (
              <p className="text-sm text-amber-700">Resolusi webcam di bawah 1280x720. Uji tetap bisa jalan, tapi teks kecil mungkin sulit terbaca.</p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Kamera</Label>
                <Select value={deviceId || daftar[0]?.deviceId || ""} onValueChange={pilihKamera} disabled={daftar.length < 2}>
                  <SelectTrigger><SelectValue placeholder="Kamera bawaan" /></SelectTrigger>
                  <SelectContent>
                    {daftar.map((d, i) => (
                      <SelectItem key={d.deviceId || i} value={d.deviceId || `kamera-${i}`}>{d.label || `Kamera ${i + 1}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Bentuk kartu</Label>
                <Select value={mendatar ? "mendatar" : "tegak"} onValueChange={(v) => setMendatar(v === "mendatar")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mendatar">Mendatar</SelectItem>
                    <SelectItem value="tegak">Tegak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Cara membaca</Label>
                <Select value={psm} onValueChange={setPsm}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PSM.AUTO}>Otomatis (cari blok teks)</SelectItem>
                    <SelectItem value={PSM.SINGLE_BLOCK}>Satu blok teks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-2 self-end pb-2 text-sm">
                <input type="checkbox" className="size-4 accent-primary" checked={praOlah} onChange={(e) => setPraOlah(e.target.checked)} />
                Perbesar dan pertajam gambar sebelum dibaca
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={scan} disabled={!modelSiap || !resolusi || membaca}>
                <Camera /> {membaca ? `Membaca... ${Math.round(progres * 100)}%` : `Scan sisi ${sisi} kartu ${noKartu}`}
              </Button>
              <span className="text-sm text-muted-foreground">atau tekan spasi</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Tips: cahaya merata tanpa pantulan, kartu rata dan tidak miring, bingkai penuh terisi kartu.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Hasil baca</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasil ? (
              <p className="text-sm text-muted-foreground">Belum ada hasil. Letakkan kartu di dalam bingkai, lalu tekan Scan.</p>
            ) : (
              <>
                <img src={hasil.gambar} alt="Gambar yang dibaca OCR" className="w-full rounded-md border" />
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary">Waktu baca {(hasil.durasiMs / 1000).toFixed(1)} detik</Badge>
                  <Badge variant="secondary">Keyakinan OCR {hasil.keyakinan.toFixed(0)}</Badge>
                  {peringatanMutu(hasil.mutu).map((p) => (
                    <Badge key={p} className="bg-amber-100 text-amber-800 hover:bg-amber-100">{p}</Badge>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <Label>Teks hasil OCR</Label>
                  <Textarea readOnly value={hasil.teksOcr || "(teks tidak terbaca)"} rows={5} className="bg-muted text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="teks-asli">Teks asli kartu</Label>
                  <Textarea id="teks-asli" value={teksAsli} onChange={(e) => setTeksAsli(e.target.value)} rows={6} className="text-sm" />
                  <p className="text-xs text-muted-foreground">
                    Cocokkan kata demi kata dengan kartu fisik dan perbaiki setiap huruf yang salah, termasuk tanda baca.
                    Susunan baris tidak dihitung.
                  </p>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="no-kartu">No. kartu</Label>
                    <Input id="no-kartu" type="number" min={1} className="w-24" value={noKartu} onChange={(e) => setNoKartu(Number(e.target.value) || 1)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Sisi</Label>
                    <Select value={sisi} onValueChange={(v) => setSisi(v as Sisi)}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="depan">Depan</SelectItem>
                        <SelectItem value="belakang">Belakang</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {ketepatanKini && <span className="pb-2 text-sm">Ketepatan: <b>{persen(ketepatanKini.huruf)}</b></span>}
                </div>
                <div className="flex gap-2">
                  <Button onClick={simpan} disabled={!teksAsli.trim()}>Catat hasil</Button>
                  <Button variant="outline" onClick={() => setHasil(null)}>Buang, scan ulang</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0 pb-3">
          <CardTitle className="text-base">Catatan uji</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => unduhCsv(catatan)} disabled={!catatan.length}><Download /> Unduh CSV</Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!catatan.length}
              onClick={() => {
                if (confirm("Hapus semua catatan uji? Unduh CSV dulu bila masih diperlukan.")) {
                  setCatatan([]);
                  setNoKartu(1);
                  setSisi("depan");
                }
              }}
            >
              <Trash2 /> Hapus semua
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 text-sm sm:grid-cols-3 lg:grid-cols-6">
            <Angka label="Kartu" nilai={`${ringkasan.kartu} / ${TARGET_KARTU}`} />
            <Angka label="Ketepatan huruf" nilai={catatan.length ? persen(ringkasan.huruf) : "-"} tegas />
            <Angka label="Depan / belakang" nilai={catatan.length ? `${persen(ringkasan.depan)} / ${persen(ringkasan.belakang)}` : "-"} />
            <Angka label="Ketepatan kata" nilai={catatan.length ? persen(ringkasan.kata) : "-"} />
            <Angka label="Terendah" nilai={catatan.length ? persen(ringkasan.terendah) : "-"} />
            <Angka label="Rata-rata waktu baca" nilai={catatan.length ? `${(ringkasan.durasi / 1000).toFixed(1)} detik` : "-"} />
          </div>
          {ringkasan.kartu >= TARGET_KARTU && (
            <p className={`rounded-md p-3 text-sm ${ringkasan.huruf >= TARGET ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
              {ringkasan.huruf >= TARGET
                ? `Ketepatan ${persen(ringkasan.huruf)} mencapai target. Tahap 1 bisa dinyatakan selesai.`
                : `Ketepatan ${persen(ringkasan.huruf)} masih di bawah target ${persen(TARGET)}. Bahas dulu sebelum lanjut ke tahap berikutnya.`}
            </p>
          )}
          {catatan.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kartu</TableHead>
                  <TableHead>Sisi</TableHead>
                  <TableHead>Huruf</TableHead>
                  <TableHead>Kata</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Pengaturan</TableHead>
                  <TableHead>Teks asli</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...catatan].reverse().map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.noKartu}</TableCell>
                    <TableCell className="capitalize">{c.sisi}</TableCell>
                    <TableCell className={c.ketepatanHuruf < TARGET ? "font-semibold text-destructive" : "font-semibold"}>{persen(c.ketepatanHuruf)}</TableCell>
                    <TableCell>{persen(c.ketepatanKata)}</TableCell>
                    <TableCell>{(c.durasiMs / 1000).toFixed(1)} dtk</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.resolusi}, {c.psm === PSM.AUTO ? "otomatis" : "satu blok"}, {c.praOlah ? "dipertajam" : "asli"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-xs" title={c.teksAsli}>{c.teksAsli}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" aria-label="Hapus catatan" onClick={() => setCatatan((cs) => cs.filter((x) => x.id !== c.id))}>
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function Angka({ label, nilai, tegas }: { label: string; nilai: string; tegas?: boolean }) {
  return (
    <div className="rounded-lg border bg-white p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={tegas ? "text-lg font-bold text-primary" : "text-lg font-semibold"}>{nilai}</div>
    </div>
  );
}
