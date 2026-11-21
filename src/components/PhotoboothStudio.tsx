import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  CameraOff,
  Check,
  Download,
  FlipHorizontal2,
  ImagePlus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  FRAME_THEMES,
  PHOTO_FILTERS,
  SAMPLE_POSES,
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
import { playCountdownBeep, playShutterSound } from '../utils/sound';
import { renderPhotoStripCanvas } from '../utils/stripRenderer';

interface PhotoboothStudioProps {
  selectedTheme: FrameThemeId;
  onSelectTheme: (theme: FrameThemeId) => void;
  onStripSaved: (strip: SavedStrip) => void;
}

export const PhotoboothStudio: React.FC<PhotoboothStudioProps> = ({
  selectedTheme,
  onSelectTheme,
  onStripSaved,
}) => {
  const [layout, setLayout] = useState<StripLayoutId>('strip-4');
  const [filter, setFilter] = useState<PhotoFilterId>('soft-peach');
  const [sticker, setSticker] = useState<StickerMotifId>('daisy');
  const [caption, setCaption] = useState<string>('Sweet Memories');
  const [countdownSeconds, setCountdownSeconds] = useState<number>(3);
  const [mirrored, setMirrored] = useState<boolean>(true);
  const [inputMode, setInputMode] = useState<'camera' | 'upload'>('camera');

  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null]);
  const [activeSlot, setActiveSlot] = useState<number>(0);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [isCapturingSequence, setIsCapturingSequence] = useState<boolean>(false);
  const [flashActive, setFlashActive] = useState<boolean>(false);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  // Render live canvas preview whenever strip parameters change
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
    }).catch(() => {
      if (!cancelled) {
        // Ignore transient image decode cancellations
      }
    });

    return () => {
      cancelled = true;
    };
  }, [photos, slotCount, layout, selectedTheme, filter, sticker, caption]);

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
    };
  }, [stopCamera]);

  const startCamera = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Peramban Anda tidak mendukung akses kamera langsung. Gunakan mode Unggah Foto atau Foto Contoh.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
      setInputMode('camera');

      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch {
      setCameraError(
        'Izin kamera belum aktif atau perangkat tidak tersedia. Anda dapat mencoba mode Unggah Foto atau Foto Contoh.'
      );
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
    window.setTimeout(() => setFlashActive(false), 380);

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

    for (let slot = 0; slot < slotCount; slot++) {
      if (sequenceAbortRef.current) break;
      setActiveSlot(slot);
      const ok = await runCountdown(countdownSeconds);
      if (!ok || sequenceAbortRef.current) break;

      const dataUrl = captureSingleFrame();
      if (dataUrl) {
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
  };

  const handleUseSamplePhotos = () => {
    setSaveMessage(null);
    setPhotos(SAMPLE_POSES);
    setActiveSlot(0);
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
    setPhotos([null, null, null, null]);
    setActiveSlot(0);
    setSaveMessage(null);
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
    });

    const url = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `daisybooth-${selectedTheme}-${Date.now()}.png`;
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
      });

      const imageData = exportCanvas.toDataURL('image/png');
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: caption.trim() || 'Sweet Memories',
          frameTheme: selectedTheme,
          layout,
          filter,
          sticker,
          imageData,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Gagal menyimpan strip ke galeri.');
      }

      onStripSaved(data.strip);
      setSaveMessage({ type: 'success', text: 'Strip foto berhasil disimpan ke Galeri!' });
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
    <section id="studio" className="py-16 md:py-20 px-6 bg-[#FFF8FA]">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#835B6E] mb-2">
            Ruang Studio Interaktif
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#35242D] mb-3" style={{ textWrap: 'balance' }}>
            Ciptakan Strip Foto Estetik Anda
          </h2>
          <p className="text-[#5A424E] text-base">
            Nyalakan kamera atau unggah foto, pilih filter pastel, dan sesuaikan bingkai secara langsung.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Stage: Camera Viewfinder, Upload & Filter Controls */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#F2DCE6] p-6 sm:p-8 shadow-[0_10px_30px_rgba(92,56,74,0.05)]">
            {/* Mode Switcher + Quick Sample Action */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="inline-flex items-center gap-1 p-1 bg-[#FDF2F6] rounded-xl border border-[#F3DCE6]">
                <button
                  type="button"
                  onClick={() => setInputMode('camera')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    inputMode === 'camera'
                      ? 'bg-white text-[#35242D] shadow-xs'
                      : 'text-[#6D515F] hover:text-[#35242D]'
                  }`}
                >
                  Kamera Langsung
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    inputMode === 'upload'
                      ? 'bg-white text-[#35242D] shadow-xs'
                      : 'text-[#6D515F] hover:text-[#35242D]'
                  }`}
                >
                  Unggah Foto
                </button>
              </div>

              <button
                type="button"
                onClick={handleUseSamplePhotos}
                className="px-4 py-2 rounded-xl bg-[#EEEDFC] hover:bg-[#DFDDF9] text-[#2F2A54] text-sm font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                Pakai Foto Contoh
              </button>
            </div>

            {/* Viewfinder / Upload Dropzone */}
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-[#FDF2F6] border border-[#F3DCE6] mb-6">
              {inputMode === 'camera' ? (
                <>
                  {cameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        filter: currentFilter.cssFilter,
                        transform: mirrored ? 'scaleX(-1)' : 'none',
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-[#FCE2ED] text-[#B84C77] flex items-center justify-center mb-4">
                        <Camera className="w-8 h-8" />
                      </div>
                      <h3 className="font-serif text-xl font-semibold text-[#35242D] mb-2">
                        Siap Berpose di Studio?
                      </h3>
                      <p className="text-sm text-[#6D515F] max-w-sm mb-6">
                        Aktifkan kamera peramban Anda untuk mengambil strip foto otomatis, atau coba dengan Foto Contoh.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-6 py-2.5 rounded-xl bg-[#F49DBB] hover:bg-[#EB87AA] text-[#2E1F27] font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Nyalakan Kamera
                        </button>
                        <button
                          type="button"
                          onClick={handleUseSamplePhotos}
                          className="px-5 py-2.5 rounded-xl bg-white border border-[#EED3DF] hover:bg-[#FFF8FA] text-[#35242D] font-medium text-sm transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Uji Tanpa Kamera
                        </button>
                      </div>
                      {cameraError && (
                        <p className="mt-4 text-xs text-[#A33058] max-w-md bg-[#FDE8EF] px-4 py-2.5 rounded-xl">
                          {cameraError}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Countdown overlay */}
                  {countdownValue !== null && (
                    <div className="absolute inset-0 bg-[#35242D]/25 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="font-mono tabular-nums text-7xl sm:text-8xl font-bold text-white drop-shadow-md">
                        {countdownValue}
                      </span>
                    </div>
                  )}

                  {/* Shutter flash overlay */}
                  {flashActive && (
                    <div className="absolute inset-0 bg-white animate-flash pointer-events-none" />
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#EEEDFC] text-[#4C458F] flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-[#35242D] mb-2">
                    Unggah Foto Dari Perangkat
                  </h3>
                  <p className="text-sm text-[#6D515F] max-w-sm mb-6">
                    Pilih hingga {slotCount} foto sekaligus untuk mengisi slot strip secara otomatis.
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
                    className="px-6 py-2.5 rounded-xl bg-[#C8C6F2] hover:bg-[#B7B4EB] text-[#272343] font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap inline-flex items-center gap-2"
                  >
                    <ImagePlus className="w-4 h-4" />
                    Pilih Foto Galeri
                  </button>
                </div>
              )}
            </div>

            {/* Camera Action Bar */}
            {inputMode === 'camera' && cameraActive && (
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-6 border-b border-[#F3DCE6]">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    disabled={isCapturingSequence}
                    onClick={handleCaptureSequence}
                    className="px-5 py-2.5 rounded-xl bg-[#F49DBB] hover:bg-[#EB87AA] disabled:opacity-50 text-[#2E1F27] font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap inline-flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Ambil {slotCount} Pose Otomatis
                  </button>
                  <button
                    type="button"
                    disabled={isCapturingSequence}
                    onClick={handleCaptureOne}
                    className="px-4 py-2.5 rounded-xl bg-[#FDF2F6] hover:bg-[#F9E1EB] disabled:opacity-50 text-[#35242D] font-medium text-sm transition-colors cursor-pointer whitespace-nowrap"
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
                        : 'bg-white border-[#EED3DF] text-[#5A424E]'
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
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-sm font-semibold text-[#35242D]">
                  Slot Pose ({filledCount}/{slotCount})
                </span>
                <span className="text-xs text-[#7A5B6B]">
                  Klik slot untuk memilih posisi bidik
                </span>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: slotCount }).map((_, idx) => {
                  const photo = photos[idx];
                  const isActive = activeSlot === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveSlot(idx)}
                      className={`group relative aspect-[4/3] rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        isActive ? 'border-[#E67FA4] shadow-xs' : 'border-[#F2DCE6] hover:border-[#DFB8C9]'
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
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-[#35242D]/75 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-xs font-medium text-[#8B6A7A]">
                          <span className="tabular-nums">Pose {idx + 1}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filter & Timer Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 pt-5 border-t border-[#F3DCE6]">
              <div className="sm:col-span-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7A5B6B] mb-2.5">
                  Filter Warna Pastel
                </p>
                <div className="flex flex-wrap gap-2">
                  {PHOTO_FILTERS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFilter(item.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        filter === item.id
                          ? 'bg-[#35242D] text-white'
                          : 'bg-[#FDF2F6] text-[#5A424E] hover:bg-[#F9E1EB]'
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7A5B6B] mb-2.5">
                  Timer Hitung Mundur
                </p>
                <div className="inline-flex items-center gap-1 p-1 bg-[#FDF2F6] rounded-xl border border-[#F3DCE6]">
                  {[0, 3, 5].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setCountdownSeconds(sec)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono tabular-nums font-medium transition-colors cursor-pointer ${
                        countdownSeconds === sec
                          ? 'bg-white text-[#35242D] shadow-xs'
                          : 'text-[#6D515F] hover:text-[#35242D]'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Stage: Live Strip Canvas Preview & Customization */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#F2DCE6] p-6 sm:p-8 shadow-[0_10px_30px_rgba(92,56,74,0.05)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl font-bold text-[#35242D]">Pratinjau Hasil Strip</h3>
              <button
                type="button"
                onClick={handleResetAll}
                className="text-xs font-medium text-[#7A5B6B] hover:text-[#35242D] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>

            {/* Live Canvas Container */}
            <div className="bg-[#FFF4F8] rounded-2xl border border-[#F3DCE6] p-5 flex items-center justify-center mb-6 min-h-[340px]">
              <canvas
                ref={previewCanvasRef}
                className="max-h-[430px] w-auto max-w-full rounded-xl shadow-[0_12px_28px_rgba(68,40,56,0.12)]"
              />
            </div>

            {/* Layout Selector */}
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#7A5B6B] mb-2">
                Tata Letak Strip
              </p>
              <div className="grid grid-cols-2 gap-2">
                {STRIP_LAYOUTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLayout(item.id)}
                    className={`px-3 py-2 rounded-xl border text-left transition-colors cursor-pointer ${
                      layout === item.id
                        ? 'bg-[#FCEAF1] border-[#E689AB] text-[#35242D]'
                        : 'bg-white border-[#F0DAE4] text-[#5A424E] hover:bg-[#FFF8FA]'
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.name}</div>
                    <div className="text-[11px] text-[#7A5B6B]">{item.aspectLabel}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Theme Swatches */}
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#7A5B6B] mb-2">
                Tema Bingkai Pastel
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {FRAME_THEMES.map((theme) => {
                  const active = selectedTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => onSelectTheme(theme.id)}
                      className={`px-2.5 py-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        active
                          ? 'border-[#35242D] bg-[#FFF8FA] shadow-xs'
                          : 'border-[#F0DAE4] bg-white hover:border-[#DFB8C9]'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full border border-black/10 flex items-center justify-center"
                        style={{ backgroundColor: theme.frameBg }}
                      >
                        {active && <Check className="w-3.5 h-3.5 text-[#35242D]" />}
                      </span>
                      <span className="text-[11px] font-medium text-[#35242D] truncate max-w-full">
                        {theme.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sticker Motif + Custom Caption */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7A5B6B] mb-2">
                  Ornamen Stiker
                </p>
                <select
                  value={sticker}
                  onChange={(e) => setSticker(e.target.value as StickerMotifId)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EED3DF] bg-white text-sm text-[#35242D] focus:outline-2 focus:outline-[#E689AB]"
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
                  className="block text-xs font-semibold uppercase tracking-wider text-[#7A5B6B] mb-2"
                >
                  Teks Bawah Strip
                </label>
                <input
                  id="strip-caption-input"
                  type="text"
                  maxLength={36}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Sweet Memories"
                  className="w-full px-3 py-2 rounded-xl border border-[#EED3DF] bg-white text-sm text-[#35242D] focus:outline-2 focus:outline-[#E689AB]"
                />
              </div>
            </div>

            {/* Export & Persist Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleDownloadPng}
                className="flex-1 px-4 py-3 rounded-xl bg-white border border-[#EED3DF] hover:bg-[#FFF4F8] text-[#35242D] font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                Unduh PNG
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveToGallery}
                className="flex-1 px-4 py-3 rounded-xl bg-[#F49DBB] hover:bg-[#EB87AA] disabled:opacity-60 text-[#2E1F27] font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
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
