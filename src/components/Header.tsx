import React from 'react';
import { ScallopDivider } from './ScallopDivider';

interface HeaderProps {
  onStartBooth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onStartBooth }) => {
  return (
    <div className="sticky top-0 z-40">
      {/* Slim pastel announcement band inspired by reference top stripe */}
      <div className="bg-[#F9C5DA] text-[#35242D] text-center text-xs font-medium py-1.5 px-4 tracking-wide">
        Studio Photobooth Pastel · Bingkai Scalloped & Ekspor Strip PNG Resolusi Tinggi
      </div>

      {/* Clean 3-zone top bar */}
      <header className="bg-[#FFFFFF]/95 backdrop-blur-sm border-b border-[#F3DCE6]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#beranda"
            className="font-serif text-2xl font-bold tracking-tight text-[#35242D] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D86C96]"
          >
            DaisyBooth
          </a>

          <nav
            aria-label="Navigasi utama"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5A424E]"
          >
            <a
              href="#studio"
              className="hover:text-[#35242D] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Studio
            </a>
            <a
              href="#koleksi"
              className="hover:text-[#35242D] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Koleksi Bingkai
            </a>
            <a
              href="#galeri"
              className="hover:text-[#35242D] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Galeri
            </a>
            <a
              href="#laravel"
              className="hover:text-[#35242D] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Kode Laravel
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onStartBooth}
              className="px-5 py-2.5 rounded-xl bg-[#F49DBB] hover:bg-[#EC87AA] active:scale-[0.98] text-[#2E1F27] text-sm font-semibold transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35242D]"
            >
              Mulai Foto
            </button>
          </div>
        </div>
      </header>

      {/* Subtle lavender strip + scalloped pink wave matching reference navigation band */}
      <div className="h-2 bg-[#C8C6F2]" aria-hidden="true" />
      <ScallopDivider color="#F9C5DA" direction="down" className="-mt-px opacity-85" />
    </div>
  );
};
