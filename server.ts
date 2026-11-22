import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

interface StoredStrip {
  id: string;
  title: string;
  frameTheme: string;
  layout: string;
  filter: string;
  sticker: string;
  imageUrl: string;
  createdAt: string;
}

const PORT = 3000;
const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json');

function ensureStorageReady(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  if (!fs.existsSync(GALLERY_FILE)) {
    fs.writeFileSync(GALLERY_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readGallery(): StoredStrip[] {
  ensureStorageReady();
  try {
    const raw = fs.readFileSync(GALLERY_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGallery(items: StoredStrip[]): void {
  ensureStorageReady();
  fs.writeFileSync(GALLERY_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

async function startServer(): Promise<void> {
  ensureStorageReady();
  const app = express();

  app.use(express.json({ limit: '15mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/gallery', (_req, res) => {
    const strips = readGallery();
    res.json({ strips });
  });

  app.post('/api/gallery', (req, res) => {
    const { title, frameTheme, layout, filter, sticker, imageData } = req.body ?? {};

    if (
      typeof title !== 'string' ||
      !title.trim() ||
      typeof imageData !== 'string' ||
      !imageData.startsWith('data:image/png;base64,')
    ) {
      res.status(400).json({ message: 'Data strip foto tidak valid.' });
      return;
    }

    const base64Body = imageData.slice('data:image/png;base64,'.length);
    const buffer = Buffer.from(base64Body, 'base64');

    if (buffer.length === 0 || buffer.length > 12 * 1024 * 1024) {
      res.status(400).json({ message: 'Ukuran file foto terlalu besar atau kosong.' });
      return;
    }

    const id = crypto.randomUUID();
    const filename = `strip_${Date.now()}_${id.slice(0, 8)}.png`;
    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, buffer);

    const newStrip: StoredStrip = {
      id,
      title: title.trim().slice(0, 80),
      frameTheme: typeof frameTheme === 'string' ? frameTheme : 'blush-daisy',
      layout: typeof layout === 'string' ? layout : 'strip-4',
      filter: typeof filter === 'string' ? filter : 'original',
      sticker: typeof sticker === 'string' ? sticker : 'daisy',
      imageUrl: `/uploads/${filename}`,
      createdAt: new Date().toISOString(),
    };

    const existing = readGallery();
    const updated = [newStrip, ...existing].slice(0, 48);
    writeGallery(updated);

    res.status(201).json({ strip: newStrip });
  });

  app.delete('/api/gallery/:id', (req, res) => {
    const targetId = req.params.id;
    const existing = readGallery();
    const match = existing.find((item) => item.id === targetId);

    if (!match) {
      res.status(404).json({ message: 'Strip foto tidak ditemukan.' });
      return;
    }

    if (match.imageUrl.startsWith('/uploads/')) {
      const safeName = path.basename(match.imageUrl);
      const targetFile = path.join(UPLOADS_DIR, safeName);
      if (fs.existsSync(targetFile)) {
        fs.unlinkSync(targetFile);
      }
    }

    const updated = existing.filter((item) => item.id !== targetId);
    writeGallery(updated);
    res.json({ deleted: true });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(ROOT_DIR, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DaisyBooth server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
