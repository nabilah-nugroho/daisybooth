import { FRAME_THEMES, PHOTO_FILTERS } from '../data/themes';
import { FrameThemeId, PhotoFilterId, StickerMotifId, StripLayoutId } from '../types/photobooth';

export interface RenderStripOptions {
  photos: (string | null)[];
  layout: StripLayoutId;
  frameTheme: FrameThemeId;
  filter: PhotoFilterId;
  sticker: StickerMotifId;
  caption: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Gagal memuat gambar: ${src}`));
    img.src = src;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawDaisy(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, centerColor: string): void {
  ctx.save();
  ctx.translate(cx, cy);
  const petals = 6;
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < petals; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI * 2) / petals);
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.45, size * 0.24, size * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = centerColor;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawButterfly(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, wingColor: string): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.18);
  ctx.fillStyle = wingColor;
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = Math.max(2, size * 0.08);

  // Left upper & lower wings
  ctx.beginPath();
  ctx.ellipse(-size * 0.34, -size * 0.18, size * 0.36, size * 0.26, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(-size * 0.26, size * 0.24, size * 0.26, size * 0.2, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Right upper & lower wings
  ctx.beginPath();
  ctx.ellipse(size * 0.34, -size * 0.18, size * 0.36, size * 0.26, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(size * 0.26, size * 0.24, size * 0.26, size * 0.2, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Body
  ctx.fillStyle = '#5B4350';
  ctx.beginPath();
  ctx.ellipse(0, 0.04 * size, size * 0.07, size * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawRibbonBow(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = Math.max(2, size * 0.07);

  // Left loop
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 0.75, -size * 0.55, -size * 0.85, size * 0.45, 0, size * 0.08);
  ctx.fill();
  ctx.stroke();

  // Right loop
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(size * 0.75, -size * 0.55, size * 0.85, size * 0.45, 0, size * 0.08);
  ctx.fill();
  ctx.stroke();

  // Tails
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, size * 0.08);
  ctx.lineTo(-size * 0.45, size * 0.68);
  ctx.lineTo(-size * 0.15, size * 0.58);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(size * 0.08, size * 0.08);
  ctx.lineTo(size * 0.45, size * 0.68);
  ctx.lineTo(size * 0.15, size * 0.58);
  ctx.closePath();
  ctx.fill();

  // Knot
  ctx.beginPath();
  ctx.arc(0, size * 0.04, size * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawScallopEdge(ctx: CanvasRenderingContext2D, width: number, y: number, radius: number, color: string, flip: boolean): void {
  ctx.save();
  ctx.fillStyle = color;
  const step = radius * 2;
  for (let x = radius; x < width + step; x += step) {
    ctx.beginPath();
    ctx.arc(x, y, radius, flip ? Math.PI : 0, flip ? Math.PI * 2 : Math.PI);
    ctx.fill();
  }
  ctx.restore();
}

export async function renderPhotoStripCanvas(
  canvas: HTMLCanvasElement,
  options: RenderStripOptions
): Promise<void> {
  const theme = FRAME_THEMES.find((t) => t.id === options.frameTheme) ?? FRAME_THEMES[0];
  const filterDef = PHOTO_FILTERS.find((f) => f.id === options.filter) ?? PHOTO_FILTERS[0];

  const isGrid = options.layout === 'grid-2x2';
  const isPolaroid = options.layout === 'polaroid-1';
  const slotCount = options.layout === 'strip-4' ? 4 : options.layout === 'grid-2x2' ? 4 : options.layout === 'strip-3' ? 3 : 1;

  // High-resolution print canvas dimensions
  const width = isGrid ? 920 : isPolaroid ? 780 : 620;
  const padding = isGrid ? 48 : isPolaroid ? 52 : 44;
  const gap = isGrid ? 24 : 24;
  const headerBand = 72;
  const footerBand = isPolaroid ? 148 : 118;

  let slotW = 0;
  let slotH = 0;
  let totalHeight = 0;

  if (isGrid) {
    slotW = (width - padding * 2 - gap) / 2;
    slotH = Math.round(slotW * 0.78);
    totalHeight = headerBand + padding + slotH * 2 + gap + footerBand;
  } else if (isPolaroid) {
    slotW = width - padding * 2;
    slotH = Math.round(slotW * 0.92);
    totalHeight = headerBand + padding * 0.4 + slotH + footerBand;
  } else {
    slotW = width - padding * 2;
    slotH = Math.round(slotW * 0.72);
    totalHeight = headerBand + slotCount * slotH + (slotCount - 1) * gap + footerBand;
  }

  canvas.width = width;
  canvas.height = totalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Main pastel frame canvas
  ctx.fillStyle = theme.frameBg;
  ctx.fillRect(0, 0, width, totalHeight);

  // Subtle decorative polka dots in frame margin
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  for (let y = 26; y < totalHeight; y += 52) {
    for (let x = 24; x < width; x += 52) {
      ctx.beginPath();
      ctx.arc(x + ((y / 52) % 2 === 0 ? 0 : 24), y, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Top & bottom crisp scalloped inner bands
  drawScallopEdge(ctx, width, 16, 18, theme.innerBorder, false);
  drawScallopEdge(ctx, width, totalHeight - 16, 18, theme.innerBorder, true);

  // Top boutique stamp
  ctx.save();
  ctx.fillStyle = theme.textColor;
  ctx.font = '600 22px "Playfair Display", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('DaisyBooth Studio', width / 2, 52);
  ctx.restore();

  // Load available images in parallel
  const loadedImages = await Promise.all(
    Array.from({ length: slotCount }).map(async (_, idx) => {
      const src = options.photos[idx];
      if (!src) return null;
      try {
        return await loadImage(src);
      } catch {
        return null;
      }
    })
  );

  // Draw each photo slot
  for (let i = 0; i < slotCount; i++) {
    let x = padding;
    let y = headerBand;

    if (isGrid) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      x = padding + col * (slotW + gap);
      y = headerBand + row * (slotH + gap);
    } else if (isPolaroid) {
      x = padding;
      y = headerBand + 8;
    } else {
      x = padding;
      y = headerBand + i * (slotH + gap);
    }

    // Crisp white inner photo mat
    ctx.save();
    ctx.shadowColor = 'rgba(53, 36, 45, 0.08)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = theme.innerBorder;
    drawRoundedRect(ctx, x - 8, y - 8, slotW + 16, slotH + 16, 18);
    ctx.fill();
    ctx.restore();

    const img = loadedImages[i];
    ctx.save();
    drawRoundedRect(ctx, x, y, slotW, slotH, 12);
    ctx.clip();

    if (img) {
      ctx.filter = filterDef.cssFilter;
      // Cover-crop math so portrait/landscape photos never stretch
      const imgAspect = img.width / img.height;
      const boxAspect = slotW / slotH;
      let drawW = slotW;
      let drawH = slotH;
      let offsetX = x;
      let offsetY = y;

      if (imgAspect > boxAspect) {
        drawH = slotH;
        drawW = slotH * imgAspect;
        offsetX = x - (drawW - slotW) / 2;
      } else {
        drawW = slotW;
        drawH = slotW / imgAspect;
        offsetY = y - (drawH - slotH) / 2;
      }
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      ctx.filter = 'none';
    } else {
      // Soft empty slot placeholder inside canvas preview
      ctx.fillStyle = '#FDF2F6';
      ctx.fillRect(x, y, slotW, slotH);
      ctx.fillStyle = '#9D7B8B';
      ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Pose ${i + 1}`, x + slotW / 2, y + slotH / 2 + 6);
    }
    ctx.restore();
  }

  // Sticker accents placed cleanly around corners & margins
  if (options.sticker !== 'none') {
    const stickerCoords = [
      { x: 42, y: 42, s: 24 },
      { x: width - 42, y: 44, s: 22 },
      { x: 48, y: totalHeight - 54, s: 26 },
      { x: width - 48, y: totalHeight - 54, s: 26 },
    ];

    stickerCoords.forEach((pt, idx) => {
      if (options.sticker === 'daisy') {
        drawDaisy(ctx, pt.x, pt.y, pt.s, theme.secondaryAccent);
      } else if (options.sticker === 'butterfly') {
        drawButterfly(ctx, pt.x, pt.y, pt.s, idx % 2 === 0 ? theme.secondaryAccent : theme.innerBorder);
      } else if (options.sticker === 'ribbon') {
        drawRibbonBow(ctx, pt.x, pt.y, pt.s, theme.accentColor);
      }
    });
  }

  // Footer caption & date
  const cleanCaption = options.caption.trim() || 'Sweet Memories';
  const dateText = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  ctx.save();
  ctx.fillStyle = theme.textColor;
  ctx.textAlign = 'center';
  ctx.font = 'italic 600 28px "Playfair Display", Georgia, serif';
  ctx.fillText(cleanCaption, width / 2, totalHeight - 64);

  ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
  ctx.globalAlpha = 0.78;
  ctx.fillText(`${theme.name}  ·  ${dateText}`, width / 2, totalHeight - 36);
  ctx.restore();
}
