// Perapian teks hasil OCR dan hitungan ketepatan baca. Lihat docs/PRD.md bagian 5 (aturan pembacaan).

/** Gabung baris yang terpotong dan buang spasi berlebih. Paragraf (dipisah baris kosong) tetap terpisah. */
export function rapikanTeks(teks: string): string {
  return teks
    .replace(/\r/g, "")
    .replace(/-\n(?=\p{Ll})/gu, "") // kata yang terpotong tanda hubung di akhir baris
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
}

/** Semua spasi dan baris baru dijadikan satu spasi, supaya susunan baris tidak ikut dihitung. */
function ratakan(teks: string): string {
  return teks.replace(/\s+/g, " ").trim();
}

/** Jumlah huruf (atau kata) yang harus ditambah, dihapus, atau diganti supaya a sama dengan b. */
function jarakEdit<T>(a: T[], b: T[]): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let sebelum = Array.from({ length: b.length + 1 }, (_, j) => j);
  let kini = new Array<number>(b.length + 1);
  for (let i = 1; i <= a.length; i++) {
    kini[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const beda = a[i - 1] === b[j - 1] ? 0 : 1;
      kini[j] = Math.min(sebelum[j] + 1, kini[j - 1] + 1, sebelum[j - 1] + beda);
    }
    [sebelum, kini] = [kini, sebelum];
  }
  return sebelum[b.length];
}

export interface Ketepatan {
  huruf: number; // 0..1, dibandingkan per huruf
  kata: number; // 0..1, dibandingkan per kata
}

/** Ketepatan hasil OCR terhadap teks asli kartu. Huruf besar/kecil dan tanda baca ikut dihitung. */
export function hitungKetepatan(hasilOcr: string, teksAsli: string): Ketepatan {
  const ocr = ratakan(hasilOcr);
  const asli = ratakan(teksAsli);
  const huruf = Array.from(asli);
  const kata = asli ? asli.split(" ") : [];
  return {
    huruf: huruf.length ? Math.max(0, 1 - jarakEdit(Array.from(ocr), huruf) / huruf.length) : 0,
    kata: kata.length ? Math.max(0, 1 - jarakEdit(ocr ? ocr.split(" ") : [], kata) / kata.length) : 0,
  };
}
