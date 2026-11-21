import React, { useState } from 'react';
import { Download, Expand, Trash2, X } from 'lucide-react';
import { FRAME_THEMES, STRIP_LAYOUTS } from '../data/themes';
import { SavedStrip } from '../types/photobooth';
import { MascotSprite } from './MascotSprite';

interface GallerySectionProps {
  strips: SavedStrip[];
  isLoading: boolean;
  onDeleteStrip: (id: string) => Promise<void>;
  onJumpToStudio: () => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  strips,
  isLoading,
  onDeleteStrip,
  onJumpToStudio,
}) => {
  const [activeLightbox, setActiveLightbox] = useState<SavedStrip | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getThemeName = (id: string) =>
    FRAME_THEMES.find((t) => t.id === id)?.name ?? id;

  const getLayoutName = (id: string) =>
    STRIP_LAYOUTS.find((l) => l.id === id)?.name ?? id;

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteStrip(id);
      if (activeLightbox?.id === id) {
        setActiveLightbox(null);
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section id="galeri" className="py-16 md:py-20 px-6 bg-[#FFF8FA]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#835B6E] mb-2">
              Arsip Kenangan
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#35242D]">
              Galeri Strip Foto
            </h2>
          </div>
          <p className="text-sm text-[#5A424E]">
            Semua strip yang Anda simpan dari studio tersimpan rapi untuk diunduh kembali kapan saja.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#F2DCE6] p-4 animate-pulse"
              >
                <div className="aspect-[3/4] rounded-xl bg-[#FCEBF2] mb-4" />
                <div className="h-4 w-2/3 bg-[#F6E2EB] rounded mb-2" />
                <div className="h-3 w-1/2 bg-[#FAF0F4] rounded" />
              </div>
            ))}
          </div>
        ) : strips.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#F2DCE6] p-12 text-center max-w-2xl mx-auto">
            <MascotSprite
              pose="sittingStrip"
              alt="Maskot DaisyBooth duduk memandangi strip foto"
              className="w-36 h-36 mx-auto mb-3"
            />
            <h3 className="font-serif text-2xl font-bold text-[#35242D] mb-2">
              Galeri Masih Kosong
            </h3>
            <p className="text-sm text-[#5A424E] max-w-md mx-auto mb-6">
              Ambil foto di ruang studio atau gunakan foto contoh, lalu tekan tombol Simpan ke Galeri untuk mengabadikan strip pertama Anda.
            </p>
            <button
              type="button"
              onClick={onJumpToStudio}
              className="px-6 py-2.5 rounded-xl bg-[#F49DBB] hover:bg-[#EB87AA] text-[#2E1F27] font-semibold text-sm transition-colors cursor-pointer"
            >
              Ke Studio Sekarang
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {strips.map((strip) => (
              <article
                key={strip.id}
                className="group bg-white rounded-2xl border border-[#F2DCE6] p-4 shadow-[0_6px_18px_rgba(92,56,74,0.04)] hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(92,56,74,0.08)] transition-all duration-200 flex flex-col"
              >
                <div
                  onClick={() => setActiveLightbox(strip)}
                  className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-[#FDF2F6] mb-3.5 cursor-pointer flex items-center justify-center p-2"
                >
                  <img
                    src={strip.imageUrl}
                    alt={strip.title}
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full object-contain rounded-lg"
                  />
                  <span className="absolute top-2.5 right-2.5 w-8 h-8 rounded-lg bg-white/90 text-[#35242D] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs">
                    <Expand className="w-4 h-4" />
                  </span>
                </div>

                <h3 className="font-serif font-semibold text-base text-[#35242D] truncate">
                  {strip.title}
                </h3>

                {/* Zero-pill clean inline metadata */}
                <p className="text-xs text-[#7A5B6B] mt-1 mb-4 truncate">
                  {getThemeName(strip.frameTheme)} · {getLayoutName(strip.layout)} · {formatDate(strip.createdAt)}
                </p>

                <div className="mt-auto flex items-center gap-2 pt-3 border-t border-[#F6E8EE]">
                  <a
                    href={strip.imageUrl}
                    download={`daisybooth-${strip.id.slice(0, 6)}.png`}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#FDF2F6] hover:bg-[#F9E1EB] text-[#35242D] text-xs font-semibold text-center inline-flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh
                  </a>
                  <button
                    type="button"
                    disabled={deletingId === strip.id}
                    onClick={() => handleDelete(strip.id)}
                    aria-label={`Hapus ${strip.title}`}
                    className="p-2 rounded-lg text-[#8B6A7A] hover:bg-[#FDE8EF] hover:text-[#9E2D55] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeLightbox && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#2E1F27]/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-8"
          onClick={() => setActiveLightbox(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-auto p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#35242D]">{activeLightbox.title}</h3>
                <p className="text-xs text-[#7A5B6B] mt-1">
                  {getThemeName(activeLightbox.frameTheme)} · {getLayoutName(activeLightbox.layout)} ·{' '}
                  {formatDate(activeLightbox.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveLightbox(null)}
                aria-label="Tutup pratinjau"
                className="w-9 h-9 rounded-xl bg-[#FDF2F6] hover:bg-[#F9E1EB] text-[#35242D] flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#FFF4F8] rounded-2xl p-4 flex items-center justify-center mb-5">
              <img
                src={activeLightbox.imageUrl}
                alt={activeLightbox.title}
                referrerPolicy="no-referrer"
                className="max-h-[60vh] w-auto rounded-xl shadow-md"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => handleDelete(activeLightbox.id)}
                className="px-4 py-2.5 rounded-xl border border-[#EED3DF] text-sm font-medium text-[#9E2D55] hover:bg-[#FDE8EF] transition-colors cursor-pointer"
              >
                Hapus Strip
              </button>
              <a
                href={activeLightbox.imageUrl}
                download={`daisybooth-${activeLightbox.id.slice(0, 6)}.png`}
                className="px-5 py-2.5 rounded-xl bg-[#F49DBB] hover:bg-[#EB87AA] text-[#2E1F27] text-sm font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Unduh PNG
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
