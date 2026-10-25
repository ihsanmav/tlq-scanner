// Ambil gambar kartu dari video webcam: potong ke bingkai, ukur mutu, lalu pertajam untuk OCR.
// Gambar hanya ada di memori browser. Tidak diunggah dan tidak disimpan.

/** Posisi bingkai sebagai pecahan ukuran video (0..1). */
export interface Bingkai {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Bingkai di tengah video yang mengikuti bentuk kartu (rasio lebar:tinggi). */
export function hitungBingkai(aspekVideo: number, rasioKartu: number): Bingkai {
  let w = 0.8;
  let h = (w * aspekVideo) / rasioKartu;
  if (h > 0.9) {
    h = 0.9;
    w = (h * rasioKartu) / aspekVideo;
  }
  return { x: (1 - w) / 2, y: (1 - h) / 2, w, h };
}

export interface MutuGambar {
  terang: number; // rata-rata kecerahan 0..255
  ketajaman: number; // makin besar makin tajam
  pantulan: number; // bagian piksel yang hampir putih penuh, 0..1
}

// Batas perkiraan. Disetel ulang setelah uji di webcam yang dipakai (Tahap 6).
export const BATAS_MUTU = { gelap: 80, silau: 225, buram: 60, pantulan: 0.02 };

export function peringatanMutu(m: MutuGambar): string[] {
  const pesan: string[] = [];
  if (m.terang < BATAS_MUTU.gelap) pesan.push("Terlalu gelap");
  if (m.terang > BATAS_MUTU.silau) pesan.push("Terlalu terang");
  if (m.ketajaman < BATAS_MUTU.buram) pesan.push("Buram");
  if (m.pantulan > BATAS_MUTU.pantulan) pesan.push("Ada pantulan cahaya");
  return pesan;
}

function keAbu(data: Uint8ClampedArray): Float32Array {
  const abu = new Float32Array(data.length / 4);
  for (let i = 0; i < abu.length; i++) {
    abu[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }
  return abu;
}

function ukurMutu(abu: Float32Array, lebar: number, tinggi: number): MutuGambar {
  let jumlah = 0;
  let putih = 0;
  for (const v of abu) {
    jumlah += v;
    if (v >= 250) putih++;
  }
  // Ketajaman: sebaran nilai Laplacian. Gambar buram punya tepi lembut, jadi sebarannya kecil.
  let n = 0;
  let s = 0;
  let s2 = 0;
  for (let y = 1; y < tinggi - 1; y++) {
    for (let x = 1; x < lebar - 1; x++) {
      const i = y * lebar + x;
      const lap = 4 * abu[i] - abu[i - 1] - abu[i + 1] - abu[i - lebar] - abu[i + lebar];
      s += lap;
      s2 += lap * lap;
      n++;
    }
  }
  const rata = n ? s / n : 0;
  return {
    terang: jumlah / abu.length,
    ketajaman: n ? s2 / n - rata * rata : 0,
    pantulan: putih / abu.length,
  };
}

/** Abu-abu, lalu rentangkan kontras: 1% piksel tergelap jadi hitam, 1% paling terang jadi putih. */
function pertajam(data: Uint8ClampedArray) {
  const abu = keAbu(data);
  const hist = new Uint32Array(256);
  for (const v of abu) hist[Math.round(v)]++;
  const batas = abu.length * 0.01;
  let bawah = 0;
  let atas = 255;
  for (let c = 0; bawah < 255 && c + hist[bawah] < batas; bawah++) c += hist[bawah];
  for (let c = 0; atas > 0 && c + hist[atas] < batas; atas--) c += hist[atas];
  const rentang = Math.max(1, atas - bawah);
  for (let i = 0; i < abu.length; i++) {
    const v = ((abu[i] - bawah) * 255) / rentang;
    data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = v;
  }
}

export interface HasilAmbil {
  kanvas: HTMLCanvasElement; // gambar yang dibaca OCR
  mutu: MutuGambar;
}

/** Potong video ke bingkai. Bila praOlah aktif, gambar diperbesar (teks kecil lebih mudah dibaca) dan dipertajam. */
export function ambilGambar(video: HTMLVideoElement, bingkai: Bingkai, praOlah: boolean): HasilAmbil {
  const sx = Math.round(bingkai.x * video.videoWidth);
  const sy = Math.round(bingkai.y * video.videoHeight);
  const sw = Math.round(bingkai.w * video.videoWidth);
  const sh = Math.round(bingkai.h * video.videoHeight);

  const asli = document.createElement("canvas");
  asli.width = sw;
  asli.height = sh;
  const cAsli = asli.getContext("2d", { willReadFrequently: true })!;
  cAsli.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);
  const mutu = ukurMutu(keAbu(cAsli.getImageData(0, 0, sw, sh).data), sw, sh);
  if (!praOlah) return { kanvas: asli, mutu };

  const skala = Math.min(3, Math.max(1, 2400 / sw));
  const besar = document.createElement("canvas");
  besar.width = Math.round(sw * skala);
  besar.height = Math.round(sh * skala);
  const cBesar = besar.getContext("2d", { willReadFrequently: true })!;
  cBesar.imageSmoothingQuality = "high";
  cBesar.drawImage(asli, 0, 0, besar.width, besar.height);
  const img = cBesar.getImageData(0, 0, besar.width, besar.height);
  pertajam(img.data);
  cBesar.putImageData(img, 0, 0);
  return { kanvas: besar, mutu };
}
