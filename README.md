# TLQ Scanner

Aplikasi web pemindai kartu The Living Qur'an. Baca `docs/PRD.md` dan `docs/RENCANA.md`.

## Mulai
```
npm install
npm run dev
```
Buka alamat yang tampil (localhost). Webcam hanya bisa dipakai lewat localhost atau HTTPS.

## Memasang shadcn/ui (sudah dilakukan)
Proyek ini memakai Tailwind v3, jadi pakai CLI shadcn versi 2.3.0. Versi `@latest` hanya untuk Tailwind v4.
Pengaturan ada di `components.json` (gaya new-york, netral zinc, ikon lucide). Untuk menambah komponen:
```
npx shadcn@2.3.0 add <nama-komponen>
```
Komponen terpasang: button, card, table, dialog, form, label, input, select, tabs, badge, sonner (di `src/components/ui/`).
Warna utama teal diatur di `src/index.css` (variabel `--primary`).

Jika npm gagal dengan `EALLOWSCRIPTS`, penyebabnya baris `allow-scripts` di `~/.npmrc`. Hapus baris itu,
atau pindahkan ke kolom `allowScripts` di `package.json`.

## Berkas penting
- `docs/PRD.md` kebutuhan; `docs/RENCANA.md` tahapan; `docs/desain/` desain layar.
- `TLQ_master_data_template.xlsx` format impor katalog.
- `CLAUDE.md` petunjuk untuk Claude.
