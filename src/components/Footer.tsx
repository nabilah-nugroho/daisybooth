import React from 'react';
import { ButterflyMotif, DaisyMotif, ScallopDivider } from './ScallopDivider';

export const Footer: React.FC = () => {
  return (
    <footer className="relative">
      <ScallopDivider color="#F9C5DA" direction="up" />

      <div className="bg-[#F9C5DA] py-10 px-6 text-[#35242D]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <DaisyMotif className="w-8 h-8" centerColor="#F8E59E" />
            <div>
              <span className="font-serif text-xl font-bold block leading-none">DaisyBooth</span>
              <span className="text-xs text-[#5A424E]">Studio Photobooth Pastel & Galeri Strip</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm font-medium text-[#4D3441]">
            <a href="#beranda" className="hover:text-[#2E1F27] transition-colors">
              Beranda
            </a>
            <a href="#studio" className="hover:text-[#2E1F27] transition-colors">
              Studio
            </a>
            <a href="#koleksi" className="hover:text-[#2E1F27] transition-colors">
              Koleksi
            </a>
            <a href="#galeri" className="hover:text-[#2E1F27] transition-colors">
              Galeri
            </a>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#5A424E]">
            <ButterflyMotif className="w-6 h-6" />
            <span>© {new Date().getFullYear()} DaisyBooth Studio</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
