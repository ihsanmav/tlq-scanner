# TLQ Scanner

Aplikasi web untuk memindai kartu fisik The Living Qur'an (TLQ) lewat webcam laptop dan menyimpannya ke Master Data.

## Tujuan akhir
Tim membuka satu halaman web, mengarahkan kartu ke webcam, dan dalam kurang dari 30 detik kedua sisi kartu (depan dan belakang) sudah terbaca dan tersimpan sebagai satu data kartu yang benar, lengkap dengan tema dan kategorinya.

## Dokumen yang harus dibaca dulu
- `docs/PRD.md`: kebutuhan lengkap (sumber kebenaran).
- `docs/RENCANA.md`: tahapan kerja dan status.
- `docs/desain/`: desain layar (laptop dan HP). Baca berkas `.dc.html` di sana untuk detail tiap layar (HTML biasa; `tlq.css` berisi gaya bersama).
- `TLQ_master_data_template.xlsx`: format impor Master Data.

## Susunan data (penting)
Tema (8 tetap, T01 sampai T08) -> Kategori (diisi admin, tiap kategori di satu tema) -> Kartu -> Hasil scan.
- Satu kartu boleh masuk lebih dari satu kategori (tabel `card_category`). Tema kartu mengikuti kategorinya.
- What to do adalah DAFTAR LANGKAH seperti aplikasi to-do (tabel `card_action`: action_id, card_id, urutan, teks). Satu langkah per baris saat impor Excel. Langkah kosong dibuang saat simpan. Kotak centang hanya tampilan.
- Sisi depan kartu: Surah:Ayat dan terjemahan. Sisi belakang: Insight/Tafsir dan What to do. Teks Arab tidak ada di kartu (opsional, diisi admin).
- Status kartu: `draf`, `final`, `perlu ulang`. Ambang kemiripan cek duplikat awal 85%.

## Keputusan yang sudah diambil
- Tumpukan teknologi: React + Vite + TypeScript + Tailwind + shadcn/ui, React Router, TanStack Query/Table, react-hook-form + zod.
- OCR: Tesseract.js di browser (bahasa Indonesia). Gambar kamera tidak dikirim ke server dan tidak disimpan.
- Server sendiri (API sederhana + PostgreSQL). Dua operator bisa scan bersamaan, jadi cek duplikat dijalankan ulang di server saat simpan.
- Master Data memakai login admin. Scanner tidak memakai login.
- Perangkat: laptop HP Victus 16 dengan webcam bawaan, browser utama Edge.
- Ayat harian: di luar cakupan versi 1.
- Target selesai: 25 Oktober 2026. Target 200 kartu awal (25 per tema). Total 600+ kartu.

## Asumsi yang belum dikonfirmasi
1. Daftar kategori per tema belum ada; contoh di desain hanya contoh.
2. Satu kartu boleh di banyak kategori.
3. Target 25 kartu dihitung per tema.

## Cara bekerja (untuk Claude)
- Gunakan bahasa Indonesia yang sederhana dalam teks di aplikasi dan penjelasan. Hindari istilah rumit.
- Kerjakan dari tujuan akhir ke belakang. Ikuti tahapan di `docs/RENCANA.md`; selesaikan satu tahap, uji, baru lanjut.
- Pakai komponen shadcn/ui. Warna utama teal `#0F766E`, font Inter, netral zinc (ikuti `docs/desain/tlq.css`).
- Jangan menyimpan atau mengunggah foto kartu. Jangan menambah fitur di luar PRD tanpa bertanya.
- Tahap 1 harus dibuktikan dulu: uji OCR pada 20 kartu dari webcam sebelum membangun sisanya.

## Perintah
- `npm install` lalu `npm run dev` (alamat lokal; webcam jalan di localhost).
- `npm run build` untuk memeriksa tipe dan membangun.
