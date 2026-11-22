import React from 'react';
import { MascotSprite } from './MascotSprite';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FCEAF1] border-t border-[#F2DCE6] py-8 px-6 text-[#2F2128]">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MascotSprite
            pose="cameraHug"
            alt="Maskot DaisyBooth"
            className="w-11 h-11 shrink-0"
          />
          <span className="text-base font-extrabold tracking-tight leading-tight">
            DaisyBooth
          </span>
        </div>

        <nav className="flex items-center gap-6 text-xs sm:text-sm font-medium text-[#5E4652]">
          <a href="#beranda" className="hover:text-[#2F2128] transition-colors">
            Beranda
          </a>
          <a href="#studio" className="hover:text-[#2F2128] transition-colors">
            Studio
          </a>
          <a href="#koleksi" className="hover:text-[#2F2128] transition-colors">
            Tema Warna
          </a>
          <a href="#galeri" className="hover:text-[#2F2128] transition-colors">
            Galeri
          </a>
        </nav>

        <p className="text-xs text-[#644B58]">© {new Date().getFullYear()} DaisyBooth</p>
      </div>
    </footer>
  );
};
