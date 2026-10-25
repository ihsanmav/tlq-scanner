import { useCallback, useEffect, useRef, useState } from "react";

// Webcam lewat getUserMedia. Lihat docs/PRD.md bagian 7 dan 11.

const KUNCI_KAMERA = "tlq-kamera-terakhir";

function bacaPilihan(): string {
  try {
    return localStorage.getItem(KUNCI_KAMERA) ?? "";
  } catch {
    return "";
  }
}

function pesanGalat(e: unknown): string {
  const nama = e instanceof DOMException ? e.name : "";
  if (nama === "NotAllowedError")
    return "Izin kamera ditolak. Klik ikon gembok di kiri alamat web, ubah Kamera menjadi Izinkan, lalu tekan Coba lagi.";
  if (nama === "NotReadableError")
    return "Kamera sedang dipakai aplikasi lain (misalnya Zoom atau Teams). Tutup aplikasi itu, lalu tekan Coba lagi.";
  if (nama === "NotFoundError" || nama === "OverconstrainedError") return "Kamera tidak ditemukan di laptop ini.";
  if (!window.isSecureContext) return "Kamera hanya bisa dipakai lewat localhost atau HTTPS.";
  return "Kamera tidak bisa dinyalakan.";
}

export function useKamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [daftar, setDaftar] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState(bacaPilihan);
  const [resolusi, setResolusi] = useState<{ lebar: number; tinggi: number } | null>(null);
  const [galat, setGalat] = useState("");
  const [percobaan, setPercobaan] = useState(0);

  useEffect(() => {
    let batal = false;
    (async () => {
      setGalat("");
      setResolusi(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            deviceId: deviceId ? { exact: deviceId } : undefined,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        if (batal) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => {});
          setResolusi({ lebar: video.videoWidth, tinggi: video.videoHeight });
        }
        // Nama kamera baru terbaca setelah izin diberikan.
        const semua = await navigator.mediaDevices.enumerateDevices();
        if (!batal) setDaftar(semua.filter((d) => d.kind === "videoinput"));
      } catch (e) {
        if (batal) return;
        // Kamera yang diingat sudah tidak ada: coba kamera bawaan.
        if (deviceId && e instanceof DOMException && e.name === "OverconstrainedError") setDeviceId("");
        else setGalat(pesanGalat(e));
      }
    })();
    return () => {
      batal = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [deviceId, percobaan]);

  const pilihKamera = useCallback((id: string) => {
    try {
      localStorage.setItem(KUNCI_KAMERA, id);
    } catch {
      // tidak apa-apa bila browser menolak penyimpanan
    }
    setDeviceId(id);
  }, []);

  const cobaLagi = useCallback(() => setPercobaan((n) => n + 1), []);

  return { videoRef, daftar, deviceId, pilihKamera, resolusi, galat, cobaLagi };
}
