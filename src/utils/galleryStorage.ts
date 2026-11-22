import { FrameThemeId, PhotoFilterId, SavedStrip, StickerMotifId, StripLayoutId } from '../types/photobooth';

const LOCAL_GALLERY_KEY = 'daisybooth_gallery_v1';
const MAX_LOCAL_STRIPS = 24;

function readLocalGallery(): SavedStrip[] {
  try {
    const raw = localStorage.getItem(LOCAL_GALLERY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalGallery(items: SavedStrip[]): void {
  try {
    localStorage.setItem(LOCAL_GALLERY_KEY, JSON.stringify(items.slice(0, MAX_LOCAL_STRIPS)));
  } catch {
    // If localStorage quota is full, trim oldest entries and retry once
    try {
      localStorage.setItem(LOCAL_GALLERY_KEY, JSON.stringify(items.slice(0, 8)));
    } catch {
      // Ignore storage quota errors
    }
  }
}

export async function loadGalleryStrips(): Promise<SavedStrip[]> {
  try {
    const response = await fetch('/api/gallery');
    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      if (Array.isArray(data.strips)) {
        return data.strips;
      }
    }
  } catch {
    // Fall back to local browser gallery when static-hosted (e.g. Vercel)
  }
  return readLocalGallery();
}

export interface SaveStripPayload {
  title: string;
  frameTheme: FrameThemeId;
  layout: StripLayoutId;
  filter: PhotoFilterId;
  sticker: StickerMotifId;
  imageData: string;
}

export async function saveGalleryStrip(payload: SaveStripPayload): Promise<SavedStrip> {
  try {
    const response = await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Gagal menyimpan strip ke galeri.');
      }
      if (data.strip) {
        return data.strip as SavedStrip;
      }
    }
  } catch (err) {
    if (err instanceof Error && err.message && !err.message.includes('fetch')) {
      throw err;
    }
  }

  // Browser localStorage fallback when deployed without backend API (e.g. Vercel static build)
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const newStrip: SavedStrip = {
    id,
    title: payload.title,
    frameTheme: payload.frameTheme,
    layout: payload.layout,
    filter: payload.filter,
    sticker: payload.sticker,
    imageUrl: payload.imageData,
    createdAt: new Date().toISOString(),
  };

  const existing = readLocalGallery();
  writeLocalGallery([newStrip, ...existing]);
  return newStrip;
}

export async function deleteGalleryStrip(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/gallery/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      return true;
    }
  } catch {
    // Fall back to localStorage
  }

  const existing = readLocalGallery();
  const updated = existing.filter((item) => item.id !== id);
  writeLocalGallery(updated);
  return true;
}
