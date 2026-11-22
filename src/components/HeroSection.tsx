import React from 'react';
import { MascotSprite } from './MascotSprite';

export const HeroSection: React.FC = () => {
  return (
    <section
      id="beranda"
      className="relative overflow-hidden bg-gradient-to-b from-[#FFEFF5] via-[#FFF6F9] to-[#FFF9FB] border-b border-[#F4E1E9] py-14 sm:py-20 px-6"
    >
      {/* Pure CSS decorative pastel glows & confetti dots */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-12 left-1/4 w-56 h-56 rounded-full bg-[#F9C5DA]/25 blur-3xl" />
        <div className="absolute -bottom-12 right-1/4 w-64 h-64 rounded-full bg-[#C8C6F2]/25 blur-3xl" />
        <span className="absolute top-10 left-[12%] w-2.5 h-2.5 rounded-full bg-[#F49DBB]/55" />
        <span className="absolute bottom-12 left-[22%] w-2 h-2 rounded-full bg-[#C8C6F2]/80" />
        <span className="absolute top-14 right-[14%] w-3 h-3 rounded-full bg-[#F8E59E]/80" />
        <span className="absolute bottom-10 right-[20%] w-2 h-2 rounded-full bg-[#F49DBB]/60" />
      </div>

      <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
        {/* Decorative Left Frame */}
        <div
          aria-hidden="true"
          className="hidden sm:block bg-white p-2.5 pb-6 rounded-2xl border border-[#F2DCE6] shadow-[0_10px_28px_rgba(88,52,70,0.08)] -rotate-6 shrink-0"
        >
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-xl bg-gradient-to-br from-[#FDE7F0] to-[#F9C5DA] flex items-center justify-center p-2">
            <MascotSprite
              pose="main"
              alt=""
              className="w-24 h-24 md:w-28 md:h-28"
            />
          </div>
        </div>

        {/* Centered Decorative Title & Tagline */}
        <div className="text-center px-4 py-2">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#D86593] drop-shadow-[0_2px_0_rgba(255,255,255,0.95)] leading-none">
            DaisyBooth
          </h1>
          <div
            aria-hidden="true"
            className="mx-auto mt-3 mb-3.5 h-1 w-20 rounded-full bg-gradient-to-r from-[#F9C5DA] via-[#F49DBB] to-[#C8C6F2]"
          />
          <p className="text-base sm:text-lg font-medium italic tracking-wide text-[#5E4652]">
            let&apos;s take a cute pic!!
          </p>
        </div>

        {/* Decorative Right Frame */}
        <div
          aria-hidden="true"
          className="hidden sm:block bg-white p-2.5 pb-6 rounded-2xl border border-[#F2DCE6] shadow-[0_10px_28px_rgba(88,52,70,0.08)] rotate-6 shrink-0"
        >
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-xl bg-gradient-to-br from-[#EEEDFC] to-[#D9D7F7] flex items-center justify-center p-2">
            <MascotSprite
              pose="photoFan"
              alt=""
              className="w-24 h-24 md:w-28 md:h-28"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
