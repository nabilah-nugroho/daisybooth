import React, { useEffect, useState } from 'react';

export type MascotPose =
  | 'main'
  | 'logo'
  | 'windowPeek'
  | 'photoFan'
  | 'cameraHug'
  | 'sittingStrip';

export const MASCOT_SHEET_SRC = '/assets/aistudio/image_c9706644.png';

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const MASCOT_CROPS: Record<MascotPose, CropRect> = {
  logo: { x: 120, y: 56, w: 628, h: 212 },
  main: { x: 40, y: 248, w: 728, h: 676 },
  windowPeek: { x: 754, y: 92, w: 424, h: 398 },
  photoFan: { x: 1172, y: 114, w: 328, h: 384 },
  cameraHug: { x: 740, y: 494, w: 414, h: 432 },
  sittingStrip: { x: 1146, y: 544, w: 354, h: 386 },
};

const croppedCache = new Map<MascotPose, string>();
let sheetPromise: Promise<HTMLImageElement> | null = null;

function loadMascotSheet(): Promise<HTMLImageElement> {
  if (!sheetPromise) {
    sheetPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Gagal memuat aset maskot'));
      img.src = MASCOT_SHEET_SRC;
    });
  }
  return sheetPromise;
}

export async function getCroppedMascotUrl(pose: MascotPose): Promise<string> {
  const cached = croppedCache.get(pose);
  if (cached) return cached;

  const sheet = await loadMascotSheet();
  const rect = MASCOT_CROPS[pose];
  const canvas = document.createElement('canvas');
  canvas.width = rect.w;
  canvas.height = rect.h;

  const ctx = canvas.getContext('2d');
  if (!ctx) return MASCOT_SHEET_SRC;

  ctx.drawImage(sheet, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);

  // Clean the stray tip of the DaisyBooth underline from the top-right corner of the 'main' crop
  if (pose === 'main') {
    ctx.clearRect(380, 0, 348, 22);
  }

  const url = canvas.toDataURL('image/png');
  croppedCache.set(pose, url);
  return url;
}

interface MascotSpriteProps {
  pose: MascotPose;
  alt: string;
  className?: string;
}

export const MascotSprite: React.FC<MascotSpriteProps> = ({
  pose,
  alt,
  className = 'w-32 h-32',
}) => {
  const [src, setSrc] = useState<string | null>(() => croppedCache.get(pose) ?? null);

  useEffect(() => {
    let active = true;
    getCroppedMascotUrl(pose)
      .then((url) => {
        if (active) setSrc(url);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [pose]);

  if (!src) {
    return <div className={className} aria-hidden="true" />;
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      className={`object-contain select-none pointer-events-none ${className}`}
    />
  );
};
