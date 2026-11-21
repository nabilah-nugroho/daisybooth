import React from 'react';
import { FRAME_THEMES } from '../data/themes';
import { FrameThemeId } from '../types/photobooth';
import { MascotSprite } from './MascotSprite';
import { DaisyMotif, ScallopDivider } from './ScallopDivider';

interface CollectionShowcaseProps {
  selectedTheme: FrameThemeId;
  onSelectAndScroll: (themeId: FrameThemeId) => void;
}

export const CollectionShowcase: React.FC<CollectionShowcaseProps> = ({
  selectedTheme,
  onSelectAndScroll,
}) => {
  return (
    <section id="koleksi" className="relative">
      <ScallopDivider color="#C8C6F2" direction="up" />

      <div className="bg-[#C8C6F2] py-16 md:py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex flex-col items-center">
            <MascotSprite
              pose="photoFan"
              alt="Maskot DaisyBooth membawa kipas foto Polaroid"
              className="w-28 h-28 mb-2 drop-shadow-sm"
            />
            <div className="inline-flex items-center justify-center gap-3 mb-2">
              <DaisyMotif className="w-7 h-7" centerColor="#F8E59E" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#352E5B]">
                Koleksi Tema Bingkai
              </p>
              <DaisyMotif className="w-7 h-7" centerColor="#F9C5DA" />
            </div>
          </div>

          <h2
            className="font-serif text-3xl sm:text-4xl font-bold text-[#272343] mb-3"
            style={{ textWrap: 'balance' }}
          >
            Pilih Nuansa Pastel Favoritmu
          </h2>
          <p className="text-[#3C3661] max-w-xl mx-auto mb-12 text-base">
            Ketuk salah satu kelopak koleksi di bawah untuk langsung menerapkan tema bingkai pada ruang studio.
          </p>

          {/* 4 Flower-Cloud Collection Cards echoing the reference lavender section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
            {FRAME_THEMES.map((theme) => {
              const isSelected = selectedTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onSelectAndScroll(theme.id)}
                  className="group relative w-56 h-56 flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#272343]"
                >
                  {/* 8-petal scalloped flower-cloud SVG shape */}
                  <svg
                    viewBox="0 0 200 200"
                    className={`w-full h-full drop-shadow-[0_10px_22px_rgba(39,35,67,0.12)] transition-transform duration-200 group-hover:scale-105 ${
                      isSelected ? 'scale-105' : ''
                    }`}
                    aria-hidden="true"
                  >
                    <g fill={theme.flowerCloudBg}>
                      <circle cx="100" cy="48" r="36" />
                      <circle cx="137" cy="63" r="36" />
                      <circle cx="152" cy="100" r="36" />
                      <circle cx="137" cy="137" r="36" />
                      <circle cx="100" cy="152" r="36" />
                      <circle cx="63" cy="137" r="36" />
                      <circle cx="48" cy="100" r="36" />
                      <circle cx="63" cy="63" r="36" />
                      <circle cx="100" cy="100" r="46" />
                    </g>
                    {isSelected && (
                      <circle
                        cx="100"
                        cy="100"
                        r="48"
                        fill="none"
                        stroke="#272343"
                        strokeWidth="2.5"
                        strokeDasharray="4 4"
                      />
                    )}
                  </svg>

                  <div className="relative z-10 px-5 text-center">
                    <span
                      className="block font-serif italic text-2xl font-bold leading-tight mb-1.5"
                      style={{ color: theme.flowerCloudText }}
                    >
                      {theme.name}
                    </span>
                    <span
                      className="block text-xs font-medium opacity-85 leading-snug max-w-[130px] mx-auto"
                      style={{ color: theme.flowerCloudText }}
                    >
                      {isSelected ? 'Sedang Aktif' : 'Terapkan Tema'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <ScallopDivider color="#C8C6F2" direction="down" />
    </section>
  );
};
