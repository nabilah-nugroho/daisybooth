import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { STUDIO_ASSETS } from '../data/themes';
import { MascotSprite } from './MascotSprite';

interface HeroSectionProps {
  onStartBooth: () => void;
}

const PreviewPolaroid: React.FC<{
  src: string;
  alt: string;
  caption: string;
}> = ({ src, alt, caption }) => {
  const [failed, setFailed] = useState(false);

  return (
    <div className="bg-white p-2.5 pb-4 rounded-2xl border border-[#F2DCE6] shadow-[0_8px_24px_rgba(88,52,70,0.08)]">
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-[#FCEBF2] flex items-center justify-center">
        {!failed ? (
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-4 text-center text-[#7A5B6B]">
            <Camera className="w-6 h-6" />
            <span className="text-xs font-medium">{caption}</span>
          </div>
        )}
      </div>
      <p className="mt-2.5 text-center text-xs font-semibold text-[#5A424E]">{caption}</p>
    </div>
  );
};

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartBooth }) => {
  return (
    <section
      id="beranda"
      className="bg-gradient-to-b from-[#FFF3F7] to-[#FFF9FB] border-b border-[#F4E1E9] py-12 md:py-16 px-6"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left: Clean Editorial Copy */}
        <div className="lg:col-span-6 text-center lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9B5A76] mb-3">
            Studio Photobooth Pastel
          </p>
          <h1
            className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold leading-[1.15] tracking-tight text-[#2F2128] mb-4"
            style={{ textWrap: 'balance' }}
          >
            Abadikan Momen Manis Dalam Kolase Estetik
          </h1>
          <p className="text-base text-[#5E4652] leading-relaxed mb-7 max-w-lg mx-auto lg:mx-0">
            Pilih konsep rumah polka, Polaroid nostalgia, kalender spesial, atau strip klasik. Ambil pose lewat kamera langsung maupun unggah foto dan ekspor PNG resolusi tinggi.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <button
              type="button"
              onClick={onStartBooth}
              className="px-6 py-3 rounded-xl bg-[#F49DBB] hover:bg-[#EB87AA] active:scale-[0.98] text-[#2B1B23] font-semibold text-sm transition-all duration-150 cursor-pointer whitespace-nowrap"
            >
              Buka Studio Foto
            </button>
            <a
              href="#galeri"
              className="px-5 py-3 rounded-xl bg-white hover:bg-[#FFF4F8] border border-[#EED3DF] text-[#2F2128] font-semibold text-sm transition-colors whitespace-nowrap"
            >
              Lihat Galeri
            </a>
          </div>
        </div>

        {/* Right: Clean, Non-Overlapping Polaroid + Mascot Stage */}
        <div className="lg:col-span-6">
          <div className="bg-[#FCEBF2]/75 border border-[#F3DCE6] rounded-3xl p-5 sm:p-6">
            <div className="grid grid-cols-2 gap-4 items-center">
              <PreviewPolaroid
                src={STUDIO_ASSETS.heroLeft}
                alt="Potret studio pastel dengan kamera instan"
                caption="Kamera Studio"
              />
              <PreviewPolaroid
                src={STUDIO_ASSETS.heroRight}
                alt="Koleksi strip foto pastel dengan pita satin dan bunga daisy"
                caption="Kolase Strip"
              />
            </div>

            <div className="mt-4 pt-4 border-t border-[#F1D5E2] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <MascotSprite
                  pose="main"
                  alt="Maskot DaisyBooth memegang kamera pink dan strip foto"
                  className="w-16 h-16 shrink-0"
                />
                <div>
                  <p className="text-sm font-bold text-[#2F2128]">Maskot DaisyBooth</p>
                  <p className="text-xs text-[#644B58]">
                    Tersedia sebagai stiker langsung di hasil cetakan foto
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block text-xs font-medium text-[#7A5B6B] whitespace-nowrap">
                7 Template · 6 Filter
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
