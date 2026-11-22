# DaisyBooth

> *Let's take a cute pic!!* — Aplikasi web photobooth bernuansa pastel estetik dengan kamera langsung, beragam template kolase, filter warna, maskot kustom, efek suara rana, dan animasi cetak foto.

---

## Fitur Utama

- **Kamera Langsung & Unggah Foto**
  - Pengambilan pose langsung melalui webcam (`getUserMedia`) lengkap dengan pilihan timer (`0s`, `3s`, `5s`), mode cermin (*mirror*), dan pengambilan beruntun otomatis.
  - Mendukung unggah foto dari perangkat maupun uji coba instan menggunakan pose contoh berbasis HTML5 Canvas.
- **7 Konsep Template & Kolase**
  - **Scrapbook & Kreatif:** *Rumah Polka* (2 pose), *Nostalgia Polaroid* (5 pose), *Kalender & Strip* (4 pose), dan *Teka-Teki CUTE* (4 pose).
  - **Klasik:** *4-Pose Strip*, *2×2 Bento*, dan *1 Polaroid*.
- **Palet Warna, Filter & Stiker**
  - **4 Tema Pastel:** *Blush Daisy*, *Lavender Cloud*, *Buttercream*, dan *Berry Sorbet*.
  - **6 Filter Foto:** *Natural*, *Soft Peach*, *Cotton Candy*, *Dreamy Film*, *Rosy Glow*, dan *Monokrom*.
  - **Stiker & Kustomisasi Teks:** Maskot DaisyBooth, Bunga Daisy, Kupu-Kupu, Pita Satin, atau Polos Minimalis, serta judul kolase dan teks tanggal yang dapat diubah bebas.
- **Efek Suara & Animasi Cetak**
  - Efek suara hitungan mundur, suara rana kamera mekanis (*shutter*), serta animasi foto keluar perlahan dari slot **DaisyBooth Printer** menggunakan Web Audio API.
- **Ekspor PNG & Galeri Tersimpan**
  - Unduh hasil kolase beresolusi tinggi dalam format PNG dan simpan ke bagian **Galeri Strip Foto** (dengan tampilan *lightbox* pratinjau penuh).
  - Mendukung penyimpanan backend Express (`/api/gallery`) maupun *fallback* `localStorage` otomatis saat di-deploy sebagai aplikasi statis (misalnya di Vercel).

---

## Teknologi yang Digunakan

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Web APIs:** HTML5 `<canvas>`, MediaDevices API (`getUserMedia`), Web Audio API
- **Tipografi:** Plus Jakarta Sans & JetBrains Mono
- **Backend (Opsional / Server Lokal):** Node.js & Express

---

## Struktur Proyek

```text
daisybooth/
├── index.html                   # Entri HTML utama & konfigurasi font
├── package.json                 # Daftar dependensi dan skrip npm
├── server.ts                    # Server Express + middleware Vite & API galeri
├── vite.config.ts               # Konfigurasi Vite & Tailwind CSS
├── public/                      # Aset statis publik (sprite maskot)
└── src/
    ├── App.tsx                  # Komponen utama aplikasi
    ├── index.css                # Konfigurasi Tailwind CSS & keyframe animasi
    ├── main.tsx                 # Mount React root
    ├── components/
    │   ├── Header.tsx           # Navigasi atas
    │   ├── HeroSection.tsx      # Banner pembuka dekoratif
    │   ├── PhotoboothStudio.tsx # Studio kamera, kontrol pose, & printer preview
    │   ├── CollectionShowcase.tsx # Pilihan palet warna bingkai
    │   ├── GallerySection.tsx   # Galeri hasil strip & modal lightbox
    │   ├── MascotSprite.tsx     # Pemotong sprite maskot via canvas
    │   └── Footer.tsx           # Footer halaman
    ├── data/
    │   └── themes.ts            # Definisi tema warna, layout, filter, & stiker
    ├── types/
    │   └── photobooth.ts        # Tipe TypeScript untuk aplikasi photobooth
    └── utils/
        ├── galleryStorage.ts    # Penyimpanan galeri (API + fallback localStorage)
        ├── samplePoses.ts       # Generator pose contoh berbasis Canvas
        ├── sound.ts             # Sintesis audio rana, beep timer, & printer
        └── stripRenderer.ts     # Renderer HTML5 Canvas untuk seluruh template
```

---

## Cara Menjalankan Secara Lokal

### Prasyarat
- **Node.js** versi `>= 20`
- **npm**

### Langkah Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/nabilah-nugroho/daisybooth.git
   cd daisybooth
   ```

2. **Pasang dependensi**
   ```bash
   npm install
   ```

3. **Jalankan mode pengembangan**
   ```bash
   npm run dev
   ```
   Aplikasi dapat diakses melalui `http://localhost:3000`.

---

## Skrip Tersedia

| Perintah | Keterangan |
| :--- | :--- |
| `npm run dev` | Menjalankan server pengembangan Express + Vite di port `3000` |
| `npm run build` | Membangun bundle produksi ke folder `dist/` |
| `npm run start` | Menjalankan server produksi (`server.ts`) |
| `npm run lint` | Memeriksa tipe TypeScript (`tsc --noEmit`) |

---

## Endpoint API Backend

Saat dijalankan dengan server Express (`npm run dev` / `npm run start`), endpoint berikut tersedia untuk mengelola galeri foto:

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Memeriksa status server |
| `GET` | `/api/gallery` | Mengambil daftar strip foto tersimpan |
| `POST` | `/api/gallery` | Menyimpan hasil strip foto PNG baru |
| `DELETE` | `/api/gallery/:id` | Menghapus strip foto berdasarkan ID |

> **Catatan Deploy Statis (Vercel):** Saat di-build dengan `vite build` sebagai aplikasi frontend statis tanpa server Node berjalan, aplikasi otomatis menggunakan `localStorage` browser untuk menyimpan dan menampilkan galeri.
