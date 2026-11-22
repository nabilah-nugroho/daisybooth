import React from 'react';

interface HeaderProps {
  onStartBooth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onStartBooth }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F2DCE6]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        <a
          href="#beranda"
          className="text-xl font-extrabold tracking-tight text-[#2F2128] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D86C96]"
        >
          DaisyBooth
        </a>

        <nav
          aria-label="Navigasi utama"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#644B58]"
        >
          <a
            href="#studio"
            className="hover:text-[#2F2128] transition-colors whitespace-nowrap shrink-0"
          >
            Studio
          </a>
          <a
            href="#koleksi"
            className="hover:text-[#2F2128] transition-colors whitespace-nowrap shrink-0"
          >
            Tema Warna
          </a>
          <a
            href="#galeri"
            className="hover:text-[#2F2128] transition-colors whitespace-nowrap shrink-0"
          >
            Galeri
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onStartBooth}
            className="px-5 py-2 rounded-xl bg-[#F49DBB] hover:bg-[#EB87AA] active:scale-[0.98] text-[#2B1B23] text-sm font-semibold transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F2128]"
          >
            Mulai Foto
          </button>
        </div>
      </div>
    </header>
  );
};
