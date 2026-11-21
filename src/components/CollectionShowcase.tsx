import React from 'react';
import { FRAME_THEMES } from '../data/themes';
import { FrameThemeId } from '../types/photobooth';

interface CollectionShowcaseProps {
  selectedTheme: FrameThemeId;
  onSelectAndScroll: (themeId: FrameThemeId) => void;
}

export const CollectionShowcase: React.FC<CollectionShowcaseProps> = ({
  selectedTheme,
  onSelectAndScroll,
}) => {
  return (
    <section id="koleksi" className="bg-[#F4F3FC] border-y border-[#E6E4F7] py-14 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5B5494] mb-1.5">
              Koleksi Tema Pastel
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#272343]">
              Pilih Nuansa Warna Bingkai
            </h2>
          </div>
          <p className="text-sm text-[#534E7A]">
            Klik salah satu tema di bawah untuk menerapkannya langsung ke studio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FRAME_THEMES.map((theme) => {
            const isSelected = selectedTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => onSelectAndScroll(theme.id)}
                className={`text-left p-5 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col justify-between gap-4 ${
                  isSelected
                    ? 'bg-white border-[#3B346E] shadow-xs'
                    : 'bg-white/85 border-[#E2E0F5] hover:bg-white hover:border-[#C5C1EB]'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded-full border border-black/10"
                      style={{ backgroundColor: theme.frameBg }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-black/10"
                      style={{ backgroundColor: theme.secondaryAccent }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-[#5B5494]">
                    {isSelected ? 'Aktif' : 'Pilih'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#272343] mb-1">{theme.name}</h3>
                  <p className="text-xs text-[#5A5582] leading-relaxed">{theme.tagline}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
