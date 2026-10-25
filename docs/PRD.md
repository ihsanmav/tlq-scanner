# PRD – Aplikasi Scanner TLQ Berbasis Web (React + shadcn/ui)

Oct 21, 2026 · @Ihsan Maulana

## 1. Tujuan Akhir dan Ukuran Keberhasilan

Tujuan akhirnya: tim bisa membuka satu halaman web di laptop, mengarahkan kartu TLQ ke webcam, dan dalam waktu kurang dari 30 detik kedua sisi kartu (depan dan belakang) sudah terbaca dan tersimpan di Master Data sebagai satu data kartu yang benar, lengkap dengan tema dan kategorinya, serta What to do sebagai daftar langkah.

PRD ini mengganti versi Android (Flutter). Ide teknisnya sama: kartu fisik discan dua kali, lalu kata-kata di kartu dibaca dari hasil foto dan dimasukkan ke Master Data sebagai data kartu. Yang berubah: aplikasinya berjalan di browser laptop, memakai React dan shadcn/ui, dan kameranya adalah webcam laptop.

| Ukuran | Target | Cara mengukur |
| --- | --- | --- |
| Ketepatan pembacaan teks | 95% | Teks hasil baca dibandingkan dengan teks asli kartu pada 200 kartu awal di laptop yang akan dipakai |
| Waktu scan dua sisi | di bawah 30 detik | Dihitung dari pilih tema dan kategori sampai hasil tersimpan |
| Hasil scan tersimpan benar | 100% | Setiap scan muncul di Master Data dengan tema dan kategori yang dipilih |
| Master Data bisa dikelola sendiri | Ihsan bisa tambah, ubah, impor kartu tanpa bantuan developer | Uji langsung oleh Ihsan |

## 2. Latar Belakang, Pengguna, dan Apa yang Berubah

TLQ (The Living Qur'an) adalah kartu mini berisi ayat pilihan. Sisi depan memuat Nama Surah:Ayat dan terjemahan. Sisi belakang memuat Insight/Tafsir dan What to do/Action. What to do berisi beberapa langkah, jadi bentuknya daftar seperti aplikasi to-do. Jumlahnya lebih dari 600 kartu, satu edisi cetak, hanya teks Indonesia (tanpa teks Arab dan tanpa kode QR). Karena isinya dua sisi, setiap kartu discan dua kali.

**Pengguna.** Ada dua peran: Operator scan (memindai kartu) dan Admin Master Data (mengelola katalog, tema, kategori, dan hasil scan). Dua operator bisa memakai Scanner pada saat yang sama. Admin masuk dengan login.

**Apa yang berubah dari versi Android:**

| Hal | Versi Android (lama) | Versi web (baru) |
| --- | --- | --- |
| Tempat berjalan | APK di HP Oppo A96 | Browser Edge atau Chrome di laptop HP Victus 16 |
| Kamera | Kamera belakang HP | Webcam laptop |
| Tampilan | Flutter | React + shadcn/ui |
| Master Data | Template Excel di luar aplikasi | Halaman web di aplikasi yang sama |
| Pembacaan teks (OCR) | Google ML Kit | Tesseract.js (diputuskan Ihsan, lihat bagian 9) |
| Cara pakai | Install APK | Buka alamat web, tidak perlu install |

## 3. Ruang Lingkup dan Asumsi

Versi pertama fokus pada dua aplikasi web: Aplikasi Scanner dan Master Data, dalam satu proyek React yang sama.

**Termasuk di versi 1:**

- Scan depan lalu belakang lewat webcam laptop, dengan pilihan tema dan kategori di awal.
- Pembacaan teks kartu, koreksi oleh operator, cek duplikat, dan penyimpanan ke Master Data.
- Master Data: tema, kategori di dalam tema, katalog kartu, hubungan kartu dengan kategori, daftar langkah What to do, impor dari Excel/CSV, dan daftar hasil scan.

**Belum termasuk:**

- Aplikasi HP atau tablet, dan browser selain Chrome/Edge.
- Ayat harian (tetap ditunda seperti versi Android).
- Rilis publik. Aplikasi dipakai internal oleh tim.

**Asumsi dan keputusan** (jawaban lengkap ada di bagian 13):

- Scanner membaca kata-kata di kartu fisik dari hasil foto webcam, lalu memasukkannya ke Master Data (dikonfirmasi Ihsan). Operator meninjau dan mengoreksi teks sebelum disimpan.
- Isi katalog (600+ kartu) masuk lewat scan ini: 25 kartu per tema dulu (200 kartu awal, target 22 Oktober 2026), sisanya menyusul. Impor Excel tetap ada sebagai cadangan.
- 8 tema tetap (sebelumnya disebut kategori): Married, Penghafal Quran, Miracle, Parenting, Karir, Kesehatan, Emotional, Thalabul Ilmi. Setiap tema punya beberapa kategori yang diisi admin, dan setiap kategori berisi beberapa kartu hasil scan. Satu kartu boleh masuk lebih dari satu kategori (asumsi, lihat bagian 13).
- Operator wajib memilih tema, lalu kategori di dalam tema itu, sebelum scan.
- Scanner tidak memakai login. Master Data memakai login admin (diputuskan Ihsan).
- Pengguna memakai laptop HP Victus 16 dengan webcam bawaan dan Edge versi terbaru, dibuka lewat alamat HTTPS di server sendiri.

## 4. Alur Scan Dua Sisi

*(Diagram alur scan dua sisi: lihat docs/desain/ dan bagian 4 di dokumen PRD asli.)*

Operator memilih tema dan kategori, memindai sisi depan, lalu memeriksa dan mengoreksi teks hasil bacaan. Setelah itu sisi belakang dipindai dan diperiksa dengan cara yang sama; What to do dipecah menjadi daftar langkah yang bisa diubah. Teks yang salah dikoreksi atau discan ulang per sisi, dan kartu baru tersimpan ke Master Data setelah kedua sisi benar.

## 5. Kebutuhan Fungsional: Aplikasi Scanner

| No | Fitur | Isi |
| --- | --- | --- |
| S1 | Pilih tema dan kategori | Operator memilih satu dari 8 tema, lalu satu kategori di dalam tema itu, sebelum kamera aktif. Tema dan kategori dicatat pada kartu yang disimpan. |
| S2 | Izin dan pilih kamera | Browser meminta izin webcam. Jika laptop punya lebih dari satu kamera, operator bisa memilih. Jika izin ditolak, tampil petunjuk cara mengaktifkannya. |
| S3 | Tampilan kamera | Video langsung dengan bingkai panduan persegi panjang. Ada penanda jika gambar terlalu gelap, buram, atau ada pantulan cahaya. |
| S4 | Ambil gambar | Tombol "Scan" (juga tombol spasi). Usulan tahap berikutnya: ambil otomatis saat gambar stabil. |
| S5 | Scan sisi depan | Membaca Nama Surah:Ayat dan terjemahan dari foto webcam (OCR), lalu mengisi kolom data kartu. |
| S6 | Konfirmasi depan | Menampilkan teks hasil baca di samping foto. Operator mengoreksi teks yang salah, lalu menekan "Benar" atau "Ulangi scan". Jika Surah:Ayat sudah ada di katalog, tampil peringatan duplikat. |
| S7 | Scan sisi belakang | Membaca Insight dan What to do dari foto dan menempelkannya ke kartu yang sama. Teks What to do dipecah menjadi daftar langkah (lihat S11). Teks bisa dikoreksi seperti sisi depan. Jika salah, hanya sisi belakang yang diulang. |
| S8 | Simpan hasil | Menyimpan satu kartu ke katalog Master Data berstatus draf: teks depan, Insight, daftar langkah What to do, kategori beserta temanya, waktu scan, skor baca depan dan belakang. Admin menambahkan teks Arab, lalu mengubah status menjadi final. |
| S9 | Scan berikutnya | Setelah tersimpan, tombol "Kartu berikutnya" kembali ke S3 dengan tema dan kategori yang sama. |
| S10 | Riwayat sesi | Daftar singkat kartu yang sudah discan pada sesi ini, dengan tombol batalkan hasil terakhir. |
| S11 | Daftar What to do | Langkah tampil seperti aplikasi to-do: satu baris per langkah dengan kotak centang (hanya tampilan), gagang untuk menggeser urutan, dan tombol hapus, ditambah tombol Tambah langkah. Operator bisa mengetik ulang, menggabung, memecah, menambah, dan menghapus langkah sebelum menyimpan. Langkah kosong dibuang saat disimpan. |

**Aturan pembacaan dan cek duplikat**:

- Teks hasil bacaan dirapikan: baris yang terpotong digabung dan spasi berlebih dibuang.
- Sebelum disimpan, Surah:Ayat dan terjemahan dibandingkan dengan katalog untuk menemukan duplikat. Batas kemiripan awal 85%.
- Surah:Ayat di sisi depan jadi kunci utama kartu.
- Teks yang disimpan adalah hasil baca yang sudah ditinjau operator. Foto kartu tidak disimpan.

## 6. Kebutuhan Fungsional: Master Data

Master Data adalah halaman admin di aplikasi web yang sama. Semua tabel memakai komponen Table shadcn/ui dengan pencarian, filter, dan pengurutan.

| No | Modul | Isi |
| --- | --- | --- |
| M1 | Tema | Tambah, ubah, nonaktifkan, dan atur urutan 8 tema (nama, deskripsi, urutan, aktif). Tema adalah kelompok paling atas. |
| M2 | Kategori | Di dalam setiap tema, admin menambah, mengubah, menonaktifkan, dan mengatur urutan beberapa kategori (nama, deskripsi, urutan, aktif). Setiap kategori berisi beberapa kartu hasil scan. |
| M3 | Katalog kartu | Tambah, ubah, hapus kartu: nama surah, Surah:Ayat, teks Arab (hanya untuk tampilan di aplikasi), terjemahan, insight, daftar What to do (tambah, ubah, hapus, geser urutan langkah), versi. Pencarian dan filter per tema dan per kategori. Kartu dari scan masuk sebagai draf untuk ditinjau admin. |
| M4 | Hubungan kartu dan kategori | Satu kartu bisa dipilih ke lebih dari satu kategori. Tema kartu mengikuti kategorinya. |
| M5 | Impor katalog | Unggah file Excel/CSV memakai template terbaru (TLQ_master_data_template.xlsx: sheet master_tema, master_category, katalog_kartu, card_category). Satu langkah What to do per baris di dalam sel. Ada pratinjau, daftar baris yang salah, lalu tombol impor. |
| M6 | Hasil scan | Daftar semua hasil scan: kartu, tema, kategori, waktu, skor, status. Filter per tema, kategori, tanggal, dan status. Ekspor ke CSV. |
| M7 | Ringkasan | Jumlah kartu per tema dan per kategori, jumlah kartu yang sudah discan, dan yang belum. Berguna untuk melihat kemajuan dari 600+ kartu. |
| M8 | Login admin | Masuk dengan akun admin (diputuskan Ihsan). |

**Aturan data:** nomor kartu (`card_id`) unik, Surah:Ayat wajib, dan kartu tanpa kategori diberi peringatan, kategori wajib berada di dalam satu tema, dan langkah What to do yang kosong dibuang saat disimpan. Perubahan teks katalog menaikkan nomor versi.

## 7. Kebutuhan Non-Fungsional: Webcam, Browser, Privasi

Webcam laptop biasanya lebih rendah kualitasnya daripada kamera HP. Ini risiko terbesar versi web, jadi aturannya dibuat tegas.

| Area | Aturan |
| --- | --- |
| Browser | Edge (browser utama, laptop HP Victus 16) dan Chrome, versi terbaru. Safari dan Firefox belum diuji. |
| Alamat web | Wajib HTTPS (atau localhost saat pengembangan), karena browser hanya memberi akses kamera lewat koneksi aman. |
| Kualitas gambar | Minta resolusi 1280x720 atau lebih. Bila webcam hanya 640x480, tampilkan peringatan dan tetap coba. |
| Cahaya dan pantulan | Kartu cetak mengilap bisa memantulkan cahaya. Panduan di layar: letakkan kartu rata, hindari lampu tepat di atasnya. Layar menandai gambar terlalu gelap atau buram. |
| Posisi kartu | Bingkai panduan di layar. Operator mendekatkan kartu sampai teks jelas. Dudukan kartu sederhana sangat disarankan (lihat bagian 13). |
| Kecepatan | Pembacaan satu sisi di bawah 5 detik pada laptop yang dipakai. Total dua sisi di bawah 30 detik. |
| Privasi | Gambar kamera diproses di browser dan tidak diunggah. Yang dikirim ke server hanya hasil scan (teks kartu yang sudah ditinjau, daftar langkah, tema dan kategori, skor baca, waktu). Bila nanti OCR memakai server, bagian ini harus diperbarui. |
| Tanpa kamera | Jika tidak ada webcam atau izin ditolak, Scanner menampilkan pesan jelas dan Master Data tetap bisa dipakai. |
| Ketersediaan | Dipakai internal oleh 2 operator pada saat yang sama. Dua operator tidak boleh membuat kartu ganda: cek duplikat dijalankan lagi di server saat menyimpan. |

## 8. Data Kartu dan Cara Dibaca

Susunan data: Tema berisi beberapa Kategori, dan Kategori berisi beberapa Kartu. Dua hal berubah dari versi Android: ada tabel tema, dan What to do disimpan sebagai daftar langkah. Template Excel ikut diperbarui.

| Tabel | Kolom utama | Fungsi |
| --- | --- | --- |
| master_tema | tema_id, nama_tema, deskripsi, urutan, aktif | 8 tema (T01 sampai T08), kelompok paling atas. |
| master_category | category_id, tema_id, nama_kategori, deskripsi, urutan, aktif | Beberapa kategori di dalam tiap tema, diatur admin. |
| katalog_kartu | card_id, surah_name, ayah_ref, arabic_text, translation_id, insight, version | Katalog 600+ kartu, diisi lewat scan atau impor. Teks Arab diisi admin untuk tampilan di aplikasi, tidak tercetak di kartu. |
| card_category | card_id, category_id | Satu kartu boleh punya banyak kategori. Tema kartu mengikuti kategorinya. |
| card_action | action_id, card_id, urutan, teks | Langkah What to do. Satu baris per langkah, urutannya bisa digeser. |
| scan_result | scan_id, card_id, category_id, waktu_scan, skor_depan, skor_belakang, status | Satu baris per kartu yang selesai discan. Tema diambil dari kategorinya. |
| daily_verse_rule | tema_id, bobot, aktif | Disiapkan untuk ayat harian, belum dipakai di versi 1. |

**Cara kartu dibaca:**

1. Gambar dari webcam diambil saat operator menekan Scan, lalu dipotong ke bingkai kartu dan dipertajam.
2. OCR membaca teks dari gambar.
3. Teks dipisah ke kolom: Surah:Ayat dan terjemahan (depan), Insight dan daftar langkah What to do (belakang).
4. Operator meninjau dan mengoreksi teks. Jika Surah:Ayat mirip dengan kartu yang sudah ada, tampil peringatan duplikat.
5. Sisi belakang dibaca dengan cara yang sama, ditempelkan ke kartu yang sama, lalu disimpan sebagai draf.

**Status scan:** `final`, `draf`, `perlu ulang`.

Batas kemiripan 85% untuk cek duplikat adalah angka awal. Angka akhirnya ditentukan dari uji pada 200 kartu awal di webcam yang dipakai.

## 9. Rancangan Teknis: React + shadcn/ui

*(Diagram arsitektur: browser (Scanner dan Master Data) berbicara ke server sendiri (API + PostgreSQL).)*

Scanner dan Master Data adalah dua area dalam satu proyek React. Pilihan di tabel ini adalah usulan, kecuali OCR dan server yang sudah diputuskan Ihsan. Versinya dicek saat pengerjaan dimulai.

| Kebutuhan | Usulan | Alasan singkat |
| --- | --- | --- |
| Kerangka | Vite + React + TypeScript | Cepat dibangun dan mudah dirawat |
| Tampilan | Tailwind CSS + shadcn/ui (Card, Table, Dialog, Form, Select, Tabs, Badge, Sonner) | Sesuai permintaan, komponennya siap pakai |
| Tabel | TanStack Table di dalam komponen Table shadcn/ui | Pencarian, filter, dan urutan |
| Form dan cek isian | react-hook-form + zod | Cek data kartu saat diisi dan diimpor |
| Data dari server | TanStack Query | Menyimpan katalog sementara dan menyegarkan data |
| Halaman | React Router | Pembagian /scan dan /admin |
| Webcam | `getUserMedia` di browser | Tanpa pustaka tambahan |
| OCR | Tesseract.js, bahasa Indonesia (diputuskan Ihsan) | Berjalan di browser, gambar tidak keluar dari laptop |
| Cek duplikat | Fuse.js atau hitungan Levenshtein sendiri | Cek duplikat kartu terhadap seluruh katalog |
| Impor Excel/CSV | SheetJS atau Papa Parse | Memakai template yang sudah ada |
| Server dan database | Server sendiri (diputuskan Ihsan). Usulan: API sederhana + PostgreSQL | Data Master Data harus dipakai bersama dan tidak hilang |

Google ML Kit yang dipakai di versi Android tidak tersedia untuk web, karena itu OCR memakai Tesseract.js sesuai keputusan Ihsan. Ketepatannya tetap diuji di tahap 1 (bagian 12).

## 10. Layar

| Layar | Alamat | Isi |
| --- | --- | --- |
| Pilih tema dan kategori | /scan | 8 kartu tema (komponen Card). Setelah tema dipilih, muncul daftar kategori di dalam tema itu, lalu tombol Mulai. |
| Scan depan | /scan/depan | Video webcam, bingkai panduan, pilihan kamera, tombol Scan, petunjuk cahaya. |
| Konfirmasi depan | /scan/depan/konfirmasi | Foto dan teks hasil baca yang bisa dikoreksi, peringatan duplikat, tombol Benar dan Ulangi scan. |
| Scan belakang | /scan/belakang | Sama seperti scan depan, dengan penanda "sisi belakang" dan kartu yang sedang dikerjakan. |
| Konfirmasi belakang | /scan/belakang/konfirmasi | Teks Insight dan daftar What to do seperti aplikasi to-do: satu baris per langkah, geser untuk mengubah urutan, hapus, dan Tambah langkah. |
| Hasil scan kartu | /scan/selesai | Ringkasan satu kartu lengkap, tombol Simpan dan Kartu berikutnya. |
| Master Data: ringkasan | /admin | Jumlah kartu per tema dan per kategori, dan kemajuan scan. |
| Master Data: tema | /admin/tema | Tabel tema dan form tambah/ubah (Dialog). |
| Master Data: kategori | /admin/kategori | Tabel kategori dikelompokkan per tema, form tambah/ubah (Dialog) dengan pilihan tema. |
| Master Data: katalog | /admin/kartu | Tabel kartu, pencarian, filter, form tambah/ubah (termasuk daftar What to do), impor. |
| Master Data: hasil scan | /admin/hasil-scan | Tabel hasil scan, filter, ekspor CSV. |
| Login admin | /login | Email dan kata sandi admin. |

Aplikasi Scanner dibuat satu kolom dan besar supaya mudah dilihat dari jarak lengan. Master Data memakai menu samping (Sidebar shadcn/ui) dan tabel.

## 11. Kasus Khusus

| Kasus | Yang dilakukan aplikasi |
| --- | --- |
| Izin webcam ditolak | Tampil langkah mengaktifkan izin di Edge/Chrome, dan tombol Coba lagi. |
| Webcam sedang dipakai aplikasi lain | Pesan jelas, minta tutup aplikasi lain. |
| Beberapa kamera | Pilihan kamera, ingat pilihan terakhir di browser. |
| Gambar terbalik (cermin) | Pratinjau tidak dicerminkan, supaya teks kartu terbaca normal. |
| Pantulan cahaya, gelap, atau buram | Peringatan di layar, tombol Scan tetap bisa ditekan. |
| Banyak huruf salah terbaca | Operator mengoreksi teks langsung di layar, atau mengulang scan. |
| Kartu sudah ada di katalog (duplikat) | Tampil kartu yang sudah ada. Operator memilih: lewati, timpa, atau simpan sebagai kartu baru. |
| Sisi belakang salah terbaca | Hanya sisi belakang yang diulang. Kartu depan tidak perlu discan lagi. |
| Dua operator memindai kartu yang sama bersamaan | Server hanya menyimpan satu. Operator kedua diberi tahu bahwa kartu sudah ada, lalu memilih lewati atau timpa. |
| Teks tidak terbaca sama sekali | Tampil pesan "teks tidak terbaca". Operator mengulang scan atau mengetik manual. Jika disimpan, ditandai `perlu ulang` agar bisa ditindaklanjuti di Master Data. |
| Koneksi ke server putus | Hasil scan ditahan sementara di browser dan dikirim ulang saat tersambung (usulan). |
| Pindah tab saat scan | Kamera dimatikan otomatis dan dinyalakan lagi saat kembali. |
| Teks What to do tidak terpecah dengan benar | Operator menggabung, memecah, atau mengetik ulang langkah di daftar, lalu menggeser urutannya. |
| Tema atau kategori dinonaktifkan saat operator memilih | Pilihan itu hilang dari daftar Scanner. Kartu yang sudah tersimpan tidak berubah. |

## 12. Tahapan Pengerjaan

Urutan disusun dari tujuan akhir ke belakang. Target selesai: 25 Oktober 2026 (diputuskan Ihsan). Tanggal per tahap belum dibagi. Setiap tahap punya syarat selesai.

1. **Uji OCR di webcam (paling awal).** Siapkan halaman uji kecil: ambil gambar 20 kartu dari webcam laptop yang akan dipakai, jalankan OCR, lihat ketepatannya. Selesai bila ketepatan Tesseract.js di webcam itu cukup. Jika kurang, dibahas lagi sebelum lanjut.
2. **Kerangka proyek.** Vite + React + TypeScript, Tailwind, shadcn/ui, routing, dan tampilan dasar. Selesai bila dua area (/scan dan /admin) bisa dibuka.
3. **Master Data dan katalog.** Tema, kategori, katalog kartu, hubungan kartu-kategori, daftar What to do, impor Excel/CSV, login admin. Selesai bila admin bisa menambah, mengubah, dan mengimpor kartu.
4. **Aplikasi Scanner.** Pilih tema dan kategori, webcam, scan depan, konfirmasi, scan belakang, simpan. Selesai bila satu kartu bisa discan dua sisi sampai tersimpan.
5. **Hasil scan di Master Data.** Daftar, filter, ekspor CSV, ringkasan.
6. **Pengujian dan penyetelan.** Uji 200 kartu awal, atur batas kemiripan, cek waktu di bawah 30 detik. Selesai bila ketepatan mencapai 95%.
7. **Peluncuran internal.** Pasang di server sendiri dengan alamat HTTPS, buat akun admin, serahkan panduan pakai singkat. Selanjutnya katalog diisi bertahap sampai 600+ kartu.

## 13. Risiko dan Pertanyaan Terbuka

**Risiko utama:**

| Risiko | Dampak | Penanganan |
| --- | --- | --- |
| Webcam laptop kurang tajam untuk teks kecil | Ketepatan di bawah 95% | Uji OCR lebih dulu (tahap 1), dudukan kartu, cahaya merata, bila tetap kurang, dibahas ulang dengan Ihsan |
| Kartu mengilap memantulkan cahaya | Teks terpotong atau tak terbaca | Panduan posisi dan penanda di layar, tombol ulang cepat |
| OCR Tesseract.js lambat di laptop lama | Melebihi 30 detik | Uji di laptop yang akan dipakai, perkecil area baca |
| Teks salah terbaca lalu lolos tanpa koreksi | Teks salah masuk ke katalog | Semua kartu hasil scan berstatus draf sampai ditinjau admin, plus cek duplikat |

**Pertanyaan dan jawaban** (tiga pertanyaan terakhir masih terbuka):

- [ ] Sudah dijawab Ihsan: scanner membaca kata-kata di kartu fisik dan memasukkannya ke Master Data dari hasil foto.
- [ ] OCR: sudah diputuskan Ihsan memakai Tesseract.js di browser (gambar tidak keluar dari laptop).
- [ ] Di mana aplikasi dan database dijalankan (sudah diputuskan Ihsan: server sendiri).
- [ ] Apakah Master Data perlu login admin, dan apakah Scanner juga perlu? Sudah diputuskan Ihsan: Master Data perlu login admin, Scanner tidak.
- [ ] Laptop, webcam, dan browser apa yang dipakai? Apakah ada webcam eksternal yang lebih tajam? Sudah dijawab Ihsan: laptop HP Victus 16, webcam bawaan, browser Edge, tanpa webcam eksternal.
- [ ] Apakah fitur ayat harian masuk versi ini? (diputuskan Ihsan: tidak masuk)
- [ ] Tanggal target aplikasi web ini. Target 25 Oktober 2026 sebelumnya untuk APK, apakah masih berlaku? Sudah dijawab Ihsan: masih berlaku, target 25 Oktober 2026.
- [ ] Apakah beberapa operator memakai aplikasi pada saat yang sama (menentukan pilihan database)? Sudah dijawab Ihsan: ada 2 operator bersamaan.
- [ ] Kategori apa saja di setiap tema? Belum ada daftar. Usulan: Ihsan menyiapkan daftar awal sebelum scan 200 kartu, lalu admin mengelolanya di Master Data.
- [ ] Apakah satu kartu boleh masuk lebih dari satu kategori? Asumsi sementara: boleh.
- [ ] Target 25 kartu per tema atau per kategori? Asumsi sementara: per tema (8 tema x 25 = 200 kartu, 22 Oktober 2026).
