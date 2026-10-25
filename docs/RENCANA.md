# Rencana Kerja TLQ Scanner

Disusun dari tujuan akhir ke belakang. Target selesai: 25 Oktober 2026. Setiap tahap punya syarat selesai.

## Tujuan akhir
Satu kartu bisa discan dua sisi sampai tersimpan di Master Data dalam kurang dari 30 detik, dengan ketepatan baca 95%.

## Tahapan
| No | Tahap | Syarat selesai | Status |
| --- | --- | --- | --- |
| 1 | Uji OCR di webcam | 20 kartu diambil dari webcam laptop, Tesseract.js (bahasa Indonesia) dijalankan, ketepatan dicatat. Cukup bila mencapai target; bila kurang, bahas dulu. | alat uji siap di `/uji-ocr` (lihat `docs/uji-ocr.md`); menunggu uji 20 kartu |
| 2 | Kerangka proyek | `npm run dev` jalan; halaman `/scan` dan `/admin` terbuka; shadcn/ui terpasang. | kerangka sudah ada |
| 3 | Master Data dan katalog | Tema, kategori, katalog kartu, hubungan kartu-kategori, daftar What to do (to-do), impor Excel, login admin. Admin bisa tambah, ubah, impor tanpa developer. | belum |
| 4 | Aplikasi Scanner | Pilih tema dan kategori, webcam, scan depan, konfirmasi, scan belakang, konfirmasi (What to do sebagai daftar langkah), simpan, kartu berikutnya. | belum |
| 5 | Hasil scan di Master Data | Daftar, filter (tema, kategori, tanggal, status), ekspor CSV, ringkasan progres per tema. | belum |
| 6 | Pengujian dan penyetelan | Uji 200 kartu awal; atur batas kemiripan; waktu scan di bawah 30 detik. | belum |
| 7 | Peluncuran internal | Pasang di server sendiri dengan HTTPS; akun admin; panduan pakai singkat. | belum |

## Urutan data di server
`master_tema` -> `master_category` (tema_id) -> `katalog_kartu` -> `card_category` (kartu, kategori) -> `card_action` (langkah What to do) -> `scan_result`. Lihat bagian 8 di `docs/PRD.md`.

## Pertanyaan terbuka
1. Daftar kategori di setiap tema (Ihsan menyiapkan daftar awal sebelum scan 200 kartu).
2. Apakah satu kartu boleh di lebih dari satu kategori (asumsi: boleh).
3. Target 25 kartu per tema atau per kategori (asumsi: per tema).

## Cara memakai Claude di VS Code
1. Buka folder ini di VS Code, jalankan Claude Code di terminal VS Code (`claude`).
2. Minta satu tahap sekali, misalnya: "Kerjakan Tahap 2 di docs/RENCANA.md."
3. Setelah tiap tahap, jalankan `npm run build` dan coba di Edge sebelum lanjut.
