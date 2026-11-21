import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { STUDIO_ASSETS } from '../data/themes';
import { ButterflyMotif, DaisyMotif } from './ScallopDivider';

interface HeroSectionProps {
  onStartBooth: () => void;
}

const PolaroidCard: React.FC<{
  src: string;
  alt: string;
  caption: string;
  tiltClass: string;
}> = ({ src, alt, caption, tiltClass }) => {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`bg-white p-3 pb-7 rounded-lg shadow-[0_14px_34px_rgba(88,52,70,0.12)] border border-[#F5E4EC] w-56 sm:w-64 transition-transform duration-300 hover:rotate-0 ${tiltClass}`}
    >
      <div className="aspect-square w-full overflow-hidden rounded-sm bg-[#FCEBF2] flex items-center justify-center">
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
            <Camera className="w-7 h-7" />
            <span className="text-xs font-medium">{caption}</span>
          </div>
        )}
      </div>
      <p className="mt-3 text-center font-serif italic text-sm text-[#5A424E]">{caption}</p>
    </div>
  );
};

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartBooth }) => {
  return (
    <section
      id="beranda"
      className="relative bg-gradient-to-b from-[#FFF4F8] via-[#FFF8FA] to-[#FCE9F1] pt-8 pb-16 md:pt-12 md:pb-20 px-6 overflow-hidden"
    >
      {/* Subtle floral motifs inspired by reference hero */}
      <DaisyMotif className="hidden md:block absolute top-10 left-[12%] w-10 h-10 opacity-90 pointer-events-none" />
      <DaisyMotif
        className="hidden md:block absolute bottom-12 right-[14%] w-12 h-12 opacity-90 pointer-events-none"
        centerColor="#C8C6F2"
      />
      <ButterflyMotif className="hidden lg:block absolute top-16 right-[22%] w-11 h-11 opacity-85 pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-8">
        {/* Left tilted Polaroid */}
        <div className="relative order-2 lg:order-1 shrink-0">
          <PolaroidCard
            src={STUDIO_ASSETS.heroLeft}
            alt="Potret studio pastel dengan kamera instan"
            caption="Sweet Instant Pose"
            tiltClass="-rotate-6"
          />
          <DaisyMotif className="absolute -bottom-4 -left-4 w-10 h-10 drop-shadow-sm pointer-events-none" />
        </div>

        {/* Center editorial boutique centerpiece */}
        <div className="order-1 lg:order-2 max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#835B6E] mb-3">
            Studio Photobooth Pastel
          </p>
          <h1
            className="font-serif text-4xl sm:text-5xl lg:text-[3.25rem] font-bold leading-[1.12] tracking-tight text-[#35242D] mb-5"
            style={{ textWrap: 'balance' }}
          >
            Abadikan Momen Manis <span className="italic font-semibold text-[#C95684]">Dalam Sekejap</span>
          </h1>
          <p className="text-base sm:text-lg text-[#5A424E] leading-relaxed mb-8 max-w-lg mx-auto">
            Pilih bingkai pastel bergelombang, atur hitung mundur kamera atau unggah foto favorit, dan cetak strip Polaroid estetik langsung dari peramban Anda.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={onStartBooth}
              className="px-7 py-3.5 rounded-xl bg-[#F49DBB] hover:bg-[#EB87AA] active:scale-[0.98] text-[#2E1F27] font-semibold text-base shadow-[0_6px_18px_rgba(235,135,170,0.28)] transition-all duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35242D]"
            >
              Ambil Strip Foto
            </button>
            <a
              href="#koleksi"
              className="px-6 py-3.5 rounded-xl bg-white/90 hover:bg-white border border-[#EED3DF] text-[#35242D] font-medium text-base transition-colors whitespace-nowrap"
            >
              Lihat Koleksi Bingkai
            </a>
          </div>
        </div>

        {/* Right tilted Polaroid */}
        <div className="relative order-3 shrink-0">
          <PolaroidCard
            src={STUDIO_ASSETS.heroRight}
            alt="Koleksi strip foto pastel dengan pita satin dan bunga daisy"
            caption="Pastel Strip Print"
            tiltClass="rotate-6"
          />
          <DaisyMotif
            className="absolute -top-4 -right-4 w-10 h-10 drop-shadow-sm pointer-events-none"
            centerColor="#F9C5DA"
          />
        </div>
      </div>
    </section>
  );
};
