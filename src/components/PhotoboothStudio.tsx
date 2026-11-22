import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  CameraOff,
  Check,
  Download,
  FlipHorizontal2,
  ImagePlus,
  Printer,
  RotateCcw,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  FRAME_THEMES,
  PHOTO_FILTERS,
  STICKER_MOTIFS,
  STRIP_LAYOUTS,
} from '../data/themes';
import {
  FrameThemeId,
  PhotoFilterId,
  SavedStrip,
  StickerMotifId,
  StripLayoutId,
} from '../types/photobooth';
import { generateSamplePoses } from '../utils/samplePoses';
import { saveGalleryStrip } from '../utils/galleryStorage';
import { playCountdownBeep, playPrintSlideSound, playShutterSound } from '../utils/sound';
import { renderPhotoStripCanvas } from '../utils/stripRenderer';
import { MascotSprite } from './MascotSprite';

interface PhotoboothStudioProps {
  selectedTheme: FrameThemeId;
  onSelectTheme: (theme: FrameThemeId) => void;
  onStripSaved: (strip: SavedStrip) => void;
}

const DEFAULT_CAPTIONS: Record<StripLayoutId, { caption: string; subCaption: string }> = {
  'house-studio': { caption: 'Daisy House!', subCaption: '@daisybooth' },
  'kid-again': { caption: 'i wanna be a kid again', subCaption: '20 11 26' },
  'birthday-cal': { caption: 'Happy', subCaption: 'special day' },
  'crossword-cute': { caption: 'CUTE TOO <3', subCaption: 'DaisyBooth Edition' },
  'strip-4': { caption: 'Sweet Memories', subCaption: '' },
  'grid-2x2': { caption: 'Sweet Memories', subCaption: '' },
  'polaroid-1': { caption: 'Sweet Memories', subCaption: '' },
};

export const PhotoboothStudio: React.FC<PhotoboothStudioProps> = ({
  selectedTheme,
  onSelectTheme,
  onStripSaved,
}) => {
  const [layout, setLayout] = useState<StripLayoutId>('house-studio');
  const [filter, setFilter] = useState<PhotoFilterId>('soft-peach');
  const [sticker, setSticker] = useState<StickerMotifId>('mascot');
  const [caption, setCaption] = useState<string>(DEFAULT_CAPTIONS['house-studio'].caption);
  const [subCaption, setSubCaption] = useState<string>(DEFAULT_CAPTIONS['house-studio'].subCaption);
  const [captionEdited, setCaptionEdited] = useState<boolean>(false);

  const [countdownSeconds, setCountdownSeconds] = useState<number>(3);
  const [mirrored, setMirrored] = useState<boolean>(true);
  const [inputMode, setInputMode] = useState<'camera' | 'upload'>('camera');

  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null, null]);
  const [activeSlot, setActiveSlot] = useState<number>(0);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraStarting, setCameraStarting] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraBlockedInFrame, setCameraBlockedInFrame] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [isCapturingSequence, setIsCapturingSequence] = useState<boolean>(false);
  const [flashActive, setFlashActive] = useState<boolean>(false);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [printPhase, setPrintPhase] = useState<'idle' | 'preparing' | 'printing' | 'done'>('idle');
  const printTimerRef = useRef<number | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sequenceAbortRef = useRef<boolean>(false);

  const currentLayout = useMemo(
    () => STRIP_LAYOUTS.find((item) => item.id === layout) ?? STRIP_LAYOUTS[0],
    [layout]
  );

  const currentFilter = useMemo(
    () => PHOTO_FILTERS.find((item) => item.id === filter) ?? PHOTO_FILTERS[0],
    [filter]
  );

  const slotCount = currentLayout.slots;
  const filledCount = photos.slice(0, slotCount).filter(Boolean).length;

  const handleSelectLayout = (nextLayout: StripLayoutId) => {
    setLayout(nextLayout);
    setActiveSlot((prev) =>
      Math.min(prev, (STRIP_LAYOUTS.find((l) => l.id === nextLayout)?.slots ?? 4) - 1)
    );
    if (!captionEdited) {
      setCaption(DEFAULT_CAPTIONS[nextLayout].caption);
      setSubCaption(DEFAULT_CAPTIONS[nextLayout].subCaption);
    }
  };

  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    renderPhotoStripCanvas(canvas, {
      photos: photos.slice(0, slotCount),
      layout,
      frameTheme: selectedTheme,
      filter,
      sticker,
      caption,
      subCaption,
    }).catch(() => {
      if (!cancelled) {
        // Ignore transient decode cancellations
      }
    });

    return () => {
      cancelled = true;
    };
  }, [photos, slotCount, layout, selectedTheme, filter, sticker, caption, subCaption]);

  const stopCamera = useCallback(() => {
    sequenceAbortRef.current = true;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCountdownValue(null);
    setIsCapturingSequence(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
      if (printTimerRef.current) {
        window.clearTimeout(printTimerRef.current);
      }
    };
  }, [stopCamera]);

  const triggerPrintAnimation = useCallback(() => {
    if (printTimerRef.current) {
      window.clearTimeout(printTimerRef.current);
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setPrintPhase('done');
      playPrintSlideSound();
      return;
    }

    setPrintPhase('preparing');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPrintPhase('printing');
        playPrintSlideSound();
        printTimerRef.current = window.setTimeout(() => {
          setPrintPhase('done');
        }, 2350);
      });
    });
  }, []);

  // Reliably bind active MediaStream whenever video element is visible
  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (cameraActive && inputMode === 'camera' && video && stream) {
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }
      video.play().catch(() => {});
    }
  }, [cameraActive, inputMode]);

  const startCamera = async () => {
    setCameraError(null);
    setCameraBlockedInFrame(false);

    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setCameraError(
        'Akses kamera memerlukan koneksi HTTPS atau localhost yang aman.'
      );
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'Peramban Anda tidak mendukung akses kamera langsung. Gunakan mode Unggah Foto atau Foto Contoh.'
      );
      return;
    }

    setCameraStarting(true);
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });
      } catch (innerErr) {
        const innerName = innerErr instanceof DOMException ? innerErr.name : '';
        if (innerName === 'NotAllowedError' || innerName === 'PermissionDeniedError' || innerName === 'SecurityError') {
          throw innerErr;
        }
        // Fallback to widest-compatibility constraint for desktop/USB/virtual cameras
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      streamRef.current = stream;
      setInputMode('camera');
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      const errorName = err instanceof DOMException ? err.name : '';
      const inIframe = typeof window !== 'undefined' && window.self !== window.top;

      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError' || errorName === 'SecurityError') {
        setCameraBlockedInFrame(inIframe);
        setCameraError(
          inIframe
            ? 'Izin kamera ditolak atau dibatasi di dalam iframe pratinjau. Klik "Buka di Tab Baru" di bawah atau izinkan kamera pada bilah alamat browser.'
            : 'Izin kamera ditolak oleh browser. Klik ikon gembok/kamera di bilah alamat browser untuk mengizinkan akses kamera.'
        );
      } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        setCameraError(
          'Kamera tidak terdeteksi di perangkat ini. Pastikan webcam terpasang atau gunakan Unggah Foto / Foto Contoh.'
        );
      } else if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
        setCameraError(
          'Kamera sedang dipakai oleh aplikasi lain (seperti Zoom/Meet). Tutup aplikasi tersebut lalu coba nyalakan lagi.'
        );
      } else {
        setCameraError(
          `Kamera gagal dinyalakan${errorName ? ` (${errorName})` : ''}. Coba muat ulang halaman atau gunakan Unggah Foto.`
        );
      }
    } finally {
      setCameraStarting(false);
    }
  };

  const captureSingleFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;

    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = video.videoWidth || 960;
    captureCanvas.height = video.videoHeight || 720;
    const ctx = captureCanvas.getContext('2d');
    if (!ctx) return null;

    ctx.save();
    if (mirrored) {
      ctx.translate(captureCanvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
    ctx.restore();

    playShutterSound();
    setFlashActive(true);
    window.setTimeout(() => setFlashActive(false), 360);

    return captureCanvas.toDataURL('image/jpeg', 0.92);
  }, [mirrored]);

  const runCountdown = (seconds: number): Promise<boolean> => {
    return new Promise((resolve) => {
      if (seconds <= 0) {
        resolve(true);
        return;
      }

      let remaining = seconds;
      setCountdownValue(remaining);
      playCountdownBeep(false);

      const timer = window.setInterval(() => {
        if (sequenceAbortRef.current) {
          window.clearInterval(timer);
          setCountdownValue(null);
          resolve(false);
          return;
        }
        remaining -= 1;
        if (remaining <= 0) {
          window.clearInterval(timer);
          setCountdownValue(null);
          playCountdownBeep(true);
          resolve(true);
        } else {
          setCountdownValue(remaining);
          playCountdownBeep(false);
        }
      }, 1000);
    });
  };

  const handleCaptureOne = async () => {
    if (!cameraActive || isCapturingSequence) return;
    sequenceAbortRef.current = false;
    setIsCapturingSequence(true);

    const completed = await runCountdown(countdownSeconds);
    if (completed) {
      const dataUrl = captureSingleFrame();
      if (dataUrl) {
        setPhotos((prev) => {
          const next = [...prev];
          next[activeSlot] = dataUrl;
          const nextFilled = next.slice(0, slotCount).filter(Boolean).length;
          if (nextFilled === slotCount) {
            window.setTimeout(() => triggerPrintAnimation(), 250);
          }
          return next;
        });
        setActiveSlot((prev) => (prev + 1) % slotCount);
      }
    }
    setIsCapturingSequence(false);
  };

  const handleCaptureSequence = async () => {
    if (!cameraActive || isCapturingSequence) return;
    sequenceAbortRef.current = false;
    setIsCapturingSequence(true);
    let capturedAny = false;

    for (let slot = 0; slot < slotCount; slot++) {
      if (sequenceAbortRef.current) break;
      setActiveSlot(slot);
      const ok = await runCountdown(countdownSeconds);
      if (!ok || sequenceAbortRef.current) break;

      const dataUrl = captureSingleFrame();
      if (dataUrl) {
        capturedAny = true;
        setPhotos((prev) => {
          const next = [...prev];
          next[slot] = dataUrl;
          return next;
        });
      }
      if (slot < slotCount - 1) {
        await new Promise((r) => window.setTimeout(r, 650));
      }
    }

    setIsCapturingSequence(false);
    if (capturedAny && !sequenceAbortRef.current) {
      window.setTimeout(() => triggerPrintAnimation(), 250);
    }
  };

  const handleUseSamplePhotos = () => {
    setSaveMessage(null);
    setPhotos(generateSamplePoses());
    setActiveSlot(0);
    playShutterSound();
    window.setTimeout(() => triggerPrintAnimation(), 180);
  };

  const handleUploadFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files).slice(0, slotCount);
    fileList.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const targetIndex = fileList.length === 1 ? activeSlot : index;
          setPhotos((prev) => {
            const next = [...prev];
            next[targetIndex] = reader.result as string;
            const nextFilled = next.slice(0, slotCount).filter(Boolean).length;
            if (nextFilled === slotCount && index === fileList.length - 1) {
              window.setTimeout(() => triggerPrintAnimation(), 220);
            }
            return next;
          });
          if (fileList.length === 1) {
            setActiveSlot((prev) => (prev + 1) % slotCount);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    event.target.value = '';
  };

  const handleClearSlot = (index: number) => {
    setPhotos((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setActiveSlot(index);
  };

  const handleResetAll = () => {
    setPhotos([null, null, null, null, null]);
    setActiveSlot(0);
    setSaveMessage(null);
    setPrintPhase('idle');
    setCaptionEdited(false);
    setCaption(DEFAULT_CAPTIONS[layout].caption);
    setSubCaption(DEFAULT_CAPTIONS[layout].subCaption);
  };

  const handleDownloadPng = async () => {
    const exportCanvas = document.createElement('canvas');
    await renderPhotoStripCanvas(exportCanvas, {
      photos: photos.slice(0, slotCount),
      layout,
      frameTheme: selectedTheme,
      filter,
      sticker,
      caption,
      subCaption,
    });

    const url = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `daisybooth-${layout}-${selectedTheme}-${Date.now()}.png`;
    link.click();
  };

  const handleSaveToGallery = async () => {
    if (filledCount === 0) {
      setSaveMessage({ type: 'error', text: 'Ambil atau unggah minimal 1 foto sebelum menyimpan.' });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const exportCanvas = document.createElement('canvas');
      await renderPhotoStripCanvas(exportCanvas, {
        photos: photos.slice(0, slotCount),
        layout,
        frameTheme: selectedTheme,
        filter,
        sticker,
        caption,
        subCaption,
      });

      const imageData = exportCanvas.toDataURL('image/png');
      const savedStrip = await saveGalleryStrip({
        title: caption.trim() || 'Sweet Memories',
        frameTheme: selectedTheme,
        layout,
        filter,
        sticker,
        imageData,
      });

      onStripSaved(savedStrip);
      setSaveMessage({ type: 'success', text: 'Hasil kolase berhasil disimpan ke Galeri!' });
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section id="studio" className="py-14 md:py-18 px-6 bg-[#FFF9FB]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9B5A76] mb-1.5">
              Studio Interaktif
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2F2128]">
              Pilih Konsep & Ambil Posemu
            </h2>
          </div>
          <p className="text-sm text-[#644B58]">
            {currentLayout.name} · {currentLayout.slots} Pose · {currentLayout.description}
          </p>
        </div>

        {/* Single Unified Template Selector */}
        <div className="flex flex-wrap items-center gap-2 p-2 bg-white rounded-2xl border border-[#F2DCE6] mb-8">
          {STRIP_LAYOUTS.map((item) => {
            const active = layout === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectLayout(item.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#F49DBB] text-[#2B1B23] shadow-xs'
                    : 'text-[#5E4652] hover:bg-[#FFF4F8] hover:text-[#2F2128]'
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Stage: Camera Viewfinder, Slots & Filters */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#F2DCE6] p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="inline-flex items-center gap-1 p-1 bg-[#FDF2F6] rounded-xl border border-[#F3DCE6]">
                <button
                  type="button"
                  onClick={() => setInputMode('camera')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    inputMode === 'camera'
                      ? 'bg-white text-[#2F2128] shadow-xs'
                      : 'text-[#644B58] hover:text-[#2F2128]'
                  }`}
                >
                  Kamera Langsung
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    inputMode === 'upload'
                      ? 'bg-white text-[#2F2128] shadow-xs'
                      : 'text-[#644B58] hover:text-[#2F2128]'
                  }`}
                >
                  Unggah Foto
                </button>
              </div>

              <button
                type="button"
                onClick={handleUseSamplePhotos}
                className="px-4 py-2 rounded-xl bg-[#EEEDFC] hover:bg-[#DFDDF9] text-[#2F2A54] text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
              >
                Pakai Foto Contoh
              </button>
            </div>

            {/* Viewfinder */}
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-[#FDF2F6] border border-[#F3DCE6] mb-5">
              {inputMode === 'camera' ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      filter: currentFilter.cssFilter,
                      transform: mirrored ? 'scaleX(-1)' : 'none',
                    }}
                    className={cameraActive ? 'w-full h-full object-cover' : 'hidden'}
                  />

                  {!cameraActive && (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                      <MascotSprite
                        pose="cameraHug"
                        alt="Maskot DaisyBooth memeluk kamera pink"
                        className="w-24 h-24 sm:w-28 sm:h-28 mb-2 shrink-0"
                      />
                      <h3 className="text-lg font-bold text-[#2F2128] mb-1.5">
                        Siap Berpose di Studio?
                      </h3>
                      <p className="text-sm text-[#644B58] max-w-sm mb-5">
                        Aktifkan kamera untuk mengisi {slotCount} pose otomatis, atau coba langsung dengan Foto Contoh.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          disabled={cameraStarting}
                          onClick={startCamera}
                          className="px-5 py-2.5 rounded-xl bg-[#F49DBB] hover:bg-[#EB87AA] disabled:opacity-60 text-[#2B1B23] font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {cameraStarting ? 'Menghubungkan...' : 'Nyalakan Kamera'}
                        </button>
                        <button
                          type="button"
                          onClick={handleUseSamplePhotos}
                          className="px-5 py-2.5 rounded-xl bg-white border border-[#EED3DF] hover:bg-[#FFF9FB] text-[#2F2128] font-medium text-sm transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Uji Tanpa Kamera
                        </button>
                      </div>
                      {cameraError && (
                        <div className="mt-4 max-w-md bg-[#FDE8EF] px-4 py-2.5 rounded-xl text-xs text-[#A33058] space-y-2">
                          <p>{cameraError}</p>
                          {cameraBlockedInFrame && typeof window !== 'undefined' && (
                            <a
                              href={window.location.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block font-semibold underline text-[#2F2128]"
                            >
                              Buka di Tab Baru
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {countdownValue !== null && (
                    <div className="absolute inset-0 bg-[#2F2128]/25 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="font-mono tabular-nums text-7xl sm:text-8xl font-bold text-white drop-shadow-md">
                        {countdownValue}
                      </span>
                    </div>
                  )}

                  {flashActive && (
                    <div className="absolute inset-0 bg-white animate-flash pointer-events-none" />
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#EEEDFC] text-[#4C458F] flex items-center justify-center mb-3">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-[#2F2128] mb-1.5">
                    Unggah Foto Dari Perangkat
                  </h3>
                  <p className="text-sm text-[#644B58] max-w-sm mb-5">
                    Pilih hingga {slotCount} foto sekaligus untuk mengisi kolase {currentLayout.name}.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUploadFiles}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-xl bg-[#C8C6F2] hover:bg-[#B7B4EB] text-[#272343] font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap inline-flex items-center gap-2"
                  >
                    <ImagePlus className="w-4 h-4" />
                    Pilih Foto Galeri
                  </button>
                </div>
              )}
            </div>

            {/* Camera Controls */}
            {inputMode === 'camera' && cameraActive && (
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-5 border-b border-[#F3DCE6]">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isCapturingSequence}
                    onClick={handleCaptureSequence}
                    className="px-5 py-2.5 rounded-xl bg-[#F49DBB] hover:bg-[#EB87AA] disabled:opacity-50 text-[#2B1B23] font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap inline-flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Ambil {slotCount} Pose Otomatis
                  </button>
                  <button
                    type="button"
                    disabled={isCapturingSequence}
                    onClick={handleCaptureOne}
                    className="px-4 py-2.5 rounded-xl bg-[#FDF2F6] hover:bg-[#F9E1EB] disabled:opacity-50 text-[#2F2128] font-medium text-sm transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Ambil Pose #{activeSlot + 1}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMirrored((m) => !m)}
                    title="Balik cermin kamera"
                    className={`p-2.5 rounded-xl border text-sm transition-colors cursor-pointer ${
                      mirrored
                        ? 'bg-[#EEEDFC] border-[#C8C6F2] text-[#272343]'
                        : 'bg-white border-[#EED3DF] text-[#5E4652]'
                    }`}
                  >
                    <FlipHorizontal2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    title="Matikan kamera"
                    className="p-2.5 rounded-xl bg-white border border-[#EED3DF] hover:bg-[#FDE8EF] text-[#7A354E] transition-colors cursor-pointer"
                  >
                    <CameraOff className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Slot Thumbnails */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#2F2128]">
                  Slot Pose ({filledCount}/{slotCount})
                </span>
                <span className="text-xs text-[#7A5B6B]">
                  Klik slot untuk mengganti posisi bidik
                </span>
              </div>

              <div
                className={`grid gap-3 ${
                  slotCount === 5
                    ? 'grid-cols-3 sm:grid-cols-5'
                    : slotCount === 2
                    ? 'grid-cols-2 max-w-sm'
                    : slotCount === 1
                    ? 'grid-cols-1 max-w-[160px]'
                    : 'grid-cols-2 sm:grid-cols-4'
                }`}
              >
                {Array.from({ length: slotCount }).map((_, idx) => {
                  const photo = photos[idx];
                  const isActive = activeSlot === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveSlot(idx)}
                      className={`group relative aspect-[4/3] rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        isActive ? 'border-[#E67FA4]' : 'border-[#F2DCE6] hover:border-[#DFB8C9]'
                      } bg-[#FDF2F6]`}
                    >
                      {photo ? (
                        <>
                          <img
                            src={photo}
                            alt={`Pose ${idx + 1}`}
                            style={{ filter: currentFilter.cssFilter }}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClearSlot(idx);
                            }}
                            aria-label={`Hapus pose ${idx + 1}`}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-[#2F2128]/75 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-medium text-[#8B6A7A]">
                          <span className="tabular-nums">Pose {idx + 1}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filters & Timer */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 pt-5 border-t border-[#F3DCE6]">
              <div className="sm:col-span-8">
                <p className="text-xs font-semibold text-[#7A5B6B] mb-2">Filter Warna</p>
                <div className="flex flex-wrap gap-1.5">
                  {PHOTO_FILTERS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFilter(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        filter === item.id
                          ? 'bg-[#2F2128] text-white'
                          : 'bg-[#FDF2F6] text-[#5E4652] hover:bg-[#F9E1EB]'
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-4">
                <p className="text-xs font-semibold text-[#7A5B6B] mb-2">Timer</p>
                <div className="inline-flex items-center gap-1 p-1 bg-[#FDF2F6] rounded-xl border border-[#F3DCE6]">
                  {[0, 3, 5].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setCountdownSeconds(sec)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono tabular-nums font-medium transition-colors cursor-pointer ${
                        countdownSeconds === sec
                          ? 'bg-white text-[#2F2128] shadow-xs'
                          : 'text-[#644B58] hover:text-[#2F2128]'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Stage: Printer Slot Preview & Customization */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#F2DCE6] p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#2F2128]">Pratinjau Hasil</h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={triggerPrintAnimation}
                  className="text-xs font-semibold text-[#A3426B] hover:text-[#2F2128] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak Animasi
                </button>
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="text-xs font-medium text-[#7A5B6B] hover:text-[#2F2128] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            </div>

            {/* Printer Dispenser & Ejection Viewport */}
            <div className="bg-[#FFF4F8] rounded-2xl border border-[#F3DCE6] overflow-hidden mb-5">
              <div className="bg-gradient-to-b from-[#FCE6EF] to-[#F9D8E6] px-4 pt-3 pb-2.5 border-b border-[#EED0DF]">
                <div className="flex items-center justify-between text-[11px] font-medium text-[#6B4B5B] mb-2">
                  <span>DaisyBooth Printer</span>
                  <span>
                    {printPhase === 'printing'
                      ? 'Sedang mencetak perlahan...'
                      : printPhase === 'done'
                      ? 'Foto siap diambil'
                      : 'Siap cetak'}
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-[#2E1F27] shadow-[inset_0_3px_6px_rgba(0,0,0,0.45)] border-b border-white/60" />
              </div>

              <div className="overflow-hidden px-4 pt-3 pb-5 flex items-center justify-center min-h-[340px]">
                <div
                  style={{
                    transform: printPhase === 'preparing' ? 'translateY(-106%)' : 'translateY(0%)',
                    transition:
                      printPhase === 'printing'
                        ? 'transform 2200ms cubic-bezier(0.22, 1, 0.36, 1)'
                        : 'none',
                  }}
                  className="will-change-transform flex items-center justify-center w-full"
                >
                  <canvas
                    ref={previewCanvasRef}
                    className="max-h-[410px] w-auto max-w-full rounded-xl shadow-[0_12px_26px_rgba(68,40,56,0.12)]"
                  />
                </div>
              </div>
            </div>

            {/* Frame Theme Swatches */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-[#7A5B6B] mb-2">Palet Warna</p>
              <div className="grid grid-cols-4 gap-2">
                {FRAME_THEMES.map((theme) => {
                  const active = selectedTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => onSelectTheme(theme.id)}
                      className={`px-2 py-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        active
                          ? 'border-[#2F2128] bg-[#FFF8FA]'
                          : 'border-[#F0DAE4] bg-white hover:border-[#DFB8C9]'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-black/10 flex items-center justify-center"
                        style={{ backgroundColor: theme.frameBg }}
                      >
                        {active && <Check className="w-3 h-3 text-[#2F2128]" />}
                      </span>
                      <span className="text-[11px] font-medium text-[#2F2128] truncate max-w-full">
                        {theme.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sticker & Captions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div>
                <label
                  htmlFor="sticker-select"
                  className="block text-xs font-semibold text-[#7A5B6B] mb-1.5"
                >
                  Stiker
                </label>
                <select
                  id="sticker-select"
                  value={sticker}
                  onChange={(e) => setSticker(e.target.value as StickerMotifId)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EED3DF] bg-white text-xs sm:text-sm text-[#2F2128] focus:outline-2 focus:outline-[#E689AB]"
                >
                  {STICKER_MOTIFS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="strip-caption-input"
                  className="block text-xs font-semibold text-[#7A5B6B] mb-1.5"
                >
                  Judul Kolase
                </label>
                <input
                  id="strip-caption-input"
                  type="text"
                  maxLength={32}
                  value={caption}
                  onChange={(e) => {
                    setCaptionEdited(true);
                    setCaption(e.target.value);
                  }}
                  placeholder="Daisy House!"
                  className="w-full px-3 py-2 rounded-xl border border-[#EED3DF] bg-white text-xs sm:text-sm text-[#2F2128] focus:outline-2 focus:outline-[#E689AB]"
                />
              </div>

              <div>
                <label
                  htmlFor="strip-subcaption-input"
                  className="block text-xs font-semibold text-[#7A5B6B] mb-1.5"
                >
                  Teks / Tanggal
                </label>
                <input
                  id="strip-subcaption-input"
                  type="text"
                  maxLength={28}
                  value={subCaption}
                  onChange={(e) => {
                    setCaptionEdited(true);
                    setSubCaption(e.target.value);
                  }}
                  placeholder="@daisybooth"
                  className="w-full px-3 py-2 rounded-xl border border-[#EED3DF] bg-white text-xs sm:text-sm text-[#2F2128] focus:outline-2 focus:outline-[#E689AB]"
                />
              </div>
            </div>

            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleDownloadPng}
                className="flex-1 px-4 py-3 rounded-xl bg-white border border-[#EED3DF] hover:bg-[#FFF4F8] text-[#2F2128] font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                Unduh PNG
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveToGallery}
                className="flex-1 px-4 py-3 rounded-xl bg-[#F49DBB] hover:bg-[#EB87AA] disabled:opacity-60 text-[#2B1B23] font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Menyimpan...' : 'Simpan ke Galeri'}
              </button>
            </div>

            {saveMessage && (
              <p
                className={`mt-3 text-xs font-medium px-3.5 py-2.5 rounded-xl ${
                  saveMessage.type === 'success'
                    ? 'bg-[#EEF8F0] text-[#245934]'
                    : 'bg-[#FDE8EF] text-[#9E2D55]'
                }`}
              >
                {saveMessage.text}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
