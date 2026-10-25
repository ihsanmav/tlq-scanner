# Tahap 1: Uji OCR di webcam

Tujuan: membuktikan Tesseract.js (bahasa Indonesia) bisa membaca kartu TLQ dari webcam laptop HP Victus 16 dengan ketepatan 95%, sebelum aplikasi lain dibangun.

## Cara menjalankan
1. `npm run dev`, buka alamat localhost di Edge, lalu buka halaman **/uji-ocr** (atau tombol "Uji OCR" di halaman awal).
2. Izinkan kamera. Pertama kali dibuka, data bahasa Indonesia diunduh sekali (perlu internet). Gambar kartu tidak ikut diunggah.
3. Siapkan tempat: kartu rata (pakai dudukan bila ada), cahaya merata, tidak ada lampu tepat di atas kartu.
4. Untuk setiap kartu:
   - Letakkan sisi depan di dalam bingkai, tekan **Scan** (atau spasi).
   - Di kolom **Teks asli kartu**, cocokkan kata demi kata dengan kartu fisik dan perbaiki setiap huruf yang salah. Kolom ini sudah diisi hasil OCR supaya cepat, jadi bacalah dengan teliti: huruf salah yang terlewat membuat angka ketepatan terlalu tinggi.
   - Tekan **Catat hasil**. Halaman otomatis pindah ke sisi belakang, lalu ke kartu berikutnya.
5. Ulangi sampai 20 kartu (40 sisi). Pilih kartu dari berbagai tema.
6. Tekan **Unduh CSV** dan simpan berkasnya. Catatan juga tersimpan di browser ini sampai dihapus.

## Cara menghitung
- **Ketepatan huruf** = 1 - (jumlah huruf yang harus diperbaiki / jumlah huruf di teks asli). Huruf besar/kecil dan tanda baca ikut dihitung; susunan baris dan spasi ganda tidak.
- Angka utama di halaman adalah rata-rata ketepatan huruf semua sisi. Ketepatan kata dan waktu baca ditampilkan sebagai pelengkap.
- Pilihan "Cara membaca" dan "Perbesar dan pertajam" boleh dicoba. Pengaturan tiap scan ikut tercatat, jadi bisa dibandingkan di CSV.

## Syarat selesai
Rata-rata ketepatan huruf pada 20 kartu mencapai 95%. Bila kurang, bahas dulu sebelum lanjut ke Tahap 3 (lihat docs/PRD.md bagian 13: dudukan kartu, cahaya, area baca).

## Hasil
| Tanggal | Kartu | Ketepatan huruf | Depan / belakang | Waktu baca rata-rata | Pengaturan terbaik | Catatan |
| --- | --- | --- | --- | --- | --- | --- |
| | | | | | | |
