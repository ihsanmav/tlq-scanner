// Susunan data: Tema -> Kategori -> Kartu -> Hasil scan. Lihat docs/PRD.md bagian 8.

export const TEMA = [
  { id: "T01", nama: "Married" },
  { id: "T02", nama: "Penghafal Quran" },
  { id: "T03", nama: "Miracle" },
  { id: "T04", nama: "Parenting" },
  { id: "T05", nama: "Karir" },
  { id: "T06", nama: "Kesehatan" },
  { id: "T07", nama: "Emotional" },
  { id: "T08", nama: "Thalabul Ilmi" },
] as const;

export type StatusKartu = "draf" | "final" | "perlu ulang";

export interface Kategori {
  category_id: string;
  tema_id: string;
  nama_kategori: string;
  deskripsi?: string;
  urutan: number;
  aktif: boolean;
}

export interface LangkahAction {
  action_id: string;
  card_id: string;
  urutan: number;
  teks: string; // satu langkah What to do
}

export interface Kartu {
  card_id: string;
  surah_name: string;
  ayah_ref: string; // contoh: 030:21
  arabic_text?: string; // opsional, diisi admin
  translation_id: string;
  insight: string;
  version: number;
  status: StatusKartu;
  kategori_ids: string[]; // dari card_category
  actions: LangkahAction[]; // What to do sebagai daftar langkah
}
