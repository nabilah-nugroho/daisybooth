import { FRAME_THEMES, PHOTO_FILTERS } from '../data/themes';
import { getCroppedMascotUrl } from '../components/MascotSprite';
import { FrameTheme, FrameThemeId, PhotoFilterId, StickerMotifId, StripLayoutId } from '../types/photobooth';

export interface RenderStripOptions {
  photos: (string | null)[];
  layout: StripLayoutId;
  frameTheme: FrameThemeId;
  filter: PhotoFilterId;
  sticker: StickerMotifId;
  caption: string;
  subCaption?: string;
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

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number,
  y: number,
  w: number,
  h: number,
  filterCss: string,
  placeholderLabel: string,
  cornerRadius = 0
): void {
  ctx.save();
  if (cornerRadius > 0) {
    drawRoundedRect(ctx, x, y, w, h, cornerRadius);
  } else {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
  }
  ctx.clip();

  if (img) {
    ctx.filter = filterCss;
    const imgAspect = img.width / img.height;
    const boxAspect = w / h;
    let drawW = w;
    let drawH = h;
    let offsetX = x;
    let offsetY = y;

    if (imgAspect > boxAspect) {
      drawH = h;
      drawW = h * imgAspect;
      offsetX = x - (drawW - w) / 2;
    } else {
      drawW = w;
      drawH = w / imgAspect;
      offsetY = y - (drawH - h) / 2;
    }
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    ctx.filter = 'none';
  } else {
    ctx.fillStyle = '#FDF2F6';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#9D7B8B';
    ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(placeholderLabel, x + w / 2, y + h / 2 + 6);
  }
  ctx.restore();
}

function drawStar5(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  fill: string,
  stroke?: string
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

function drawSparkle4(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  fill: string,
  stroke?: string,
  rot = 0
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const rad = i % 2 === 0 ? r : r * 0.36;
    const a = (i * Math.PI) / 4;
    if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
    else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

function drawHeart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  fill: string,
  stroke?: string,
  rot = 0
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(0, size * 0.3);
  ctx.bezierCurveTo(-size * 0.55, -size * 0.35, -size, size * 0.15, 0, size * 0.85);
  ctx.bezierCurveTo(size, size * 0.15, size * 0.55, -size * 0.35, 0, size * 0.3);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
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

  ctx.beginPath();
  ctx.ellipse(-size * 0.34, -size * 0.18, size * 0.36, size * 0.26, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(-size * 0.26, size * 0.24, size * 0.26, size * 0.2, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(size * 0.34, -size * 0.18, size * 0.36, size * 0.26, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(size * 0.26, size * 0.24, size * 0.26, size * 0.2, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

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

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 0.75, -size * 0.55, -size * 0.85, size * 0.45, 0, size * 0.08);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(size * 0.75, -size * 0.55, size * 0.85, size * 0.45, 0, size * 0.08);
  ctx.fill();
  ctx.stroke();

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

async function applyStickerCornerAccents(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  sticker: StickerMotifId,
  theme: FrameTheme,
  positions: { x: number; y: number; s: number }[]
): Promise<void> {
  if (sticker === 'none') return;

  if (sticker === 'mascot') {
    try {
      const [hugUrl, fanUrl] = await Promise.all([
        getCroppedMascotUrl('cameraHug'),
        getCroppedMascotUrl('photoFan'),
      ]);
      const [hugImg, fanImg] = await Promise.all([loadImage(hugUrl), loadImage(fanUrl)]);
      ctx.drawImage(hugImg, 16, height - 112, 86, 90);
      ctx.drawImage(fanImg, width - 98, height - 112, 80, 90);
      return;
    } catch {
      // Fall back to vector daisy
    }
  }

  positions.forEach((pt, idx) => {
    if (sticker === 'daisy' || sticker === 'mascot') {
      drawDaisy(ctx, pt.x, pt.y, pt.s, theme.secondaryAccent);
    } else if (sticker === 'butterfly') {
      drawButterfly(ctx, pt.x, pt.y, pt.s, idx % 2 === 0 ? theme.secondaryAccent : theme.innerBorder);
    } else if (sticker === 'ribbon') {
      drawRibbonBow(ctx, pt.x, pt.y, pt.s, theme.accentColor);
    }
  });
}

// 1. "Rumah Polka" — clean non-overlapping geometry
async function renderHouseStudio(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  images: (HTMLImageElement | null)[],
  theme: FrameTheme,
  filterCss: string,
  options: RenderStripOptions
): Promise<void> {
  const width = 900;
  const height = 1140;
  canvas.width = width;
  canvas.height = height;

  // White base + soft pastel sky band
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  const topGrad = ctx.createLinearGradient(0, 0, width, 400);
  topGrad.addColorStop(0, theme.frameBg);
  topGrad.addColorStop(1, theme.secondaryAccent);
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, width, 390);

  // Polka dots below sky band
  ctx.save();
  ctx.fillStyle = '#241B20';
  for (let y = 418; y < height; y += 54) {
    const shift = ((y - 418) / 54) % 2 === 0 ? 0 : 27;
    for (let x = 24 + shift; x < width; x += 54) {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Outer sky sparkles (well clear of the roof!)
  drawSparkle4(ctx, 110, 110, 18, '#FFFFFF', '#241B20', 0.2);
  drawSparkle4(ctx, 175, 225, 14, '#FFFFFF', '#241B20', 0.1);
  drawSparkle4(ctx, 780, 120, 16, '#FFFFFF', '#241B20', -0.2);
  drawSparkle4(ctx, 818, 280, 18, '#FFFFFF', '#241B20', 0.3);

  // House body (clean spacing inside)
  const houseX = 116;
  const houseY = 430;
  const houseW = 668;
  const houseH = 594; // ends at 1024

  ctx.save();
  ctx.shadowColor = 'rgba(36, 27, 32, 0.11)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = '#FFFCE8';
  ctx.fillRect(houseX, houseY, houseW, houseH);
  ctx.restore();

  ctx.strokeStyle = '#241B20';
  ctx.lineWidth = 3;
  ctx.strokeRect(houseX, houseY, houseW, houseH);

  // Chimney on right roof slope (drawn before roof so roof sits cleanly in front)
  ctx.fillStyle = theme.frameBg;
  ctx.fillRect(620, 172, 102, 200);
  ctx.strokeRect(620, 172, 102, 200);

  // Mascot peeking cleanly from top of chimney!
  if (options.sticker === 'mascot') {
    try {
      const peekUrl = await getCroppedMascotUrl('windowPeek');
      const peekImg = await loadImage(peekUrl);
      ctx.drawImage(peekImg, 608, 44, 130, 124);
    } catch {
      // Optional
    }
  }

  // Pitched Roof Triangle
  ctx.beginPath();
  ctx.moveTo(52, 430);
  ctx.lineTo(450, 96);
  ctx.lineTo(848, 430);
  ctx.closePath();
  ctx.fillStyle = theme.frameBg;
  ctx.fill();
  ctx.stroke();

  // Roof Title & Sub-handle safely inside wide lower half of roof
  const titleText = options.caption.trim() || 'Daisy House!';
  const subText = options.subCaption?.trim() || '@daisybooth';
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = theme.textColor;
  ctx.font = 'italic 700 46px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(titleText, width / 2, 332, 460);

  ctx.font = '500 20px "JetBrains Mono", "Courier New", monospace';
  ctx.fillText(subText, width / 2, 386, 360);
  ctx.restore();

  // House interior labels: generous vertical gaps
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#241B20';
  ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('with', 292, 480);
  ctx.fillText('us', 608, 480);

  // Green tag ribbons (y = 496..528)
  ctx.fillStyle = '#4E9A54';
  ctx.fillRect(202, 496, 180, 32);
  ctx.fillRect(518, 496, 180, 32);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 17px "JetBrains Mono", monospace';
  ctx.fillText('1  ·  2  ·  3', 292, 518);
  ctx.fillText('#daisybooth', 608, 518);
  ctx.restore();

  // 2 side-by-side portrait slots (y = 550..898 -> 22px below green ribbons!)
  const photoW = 266;
  const photoH = 344;
  const leftX = 158;
  const rightX = 476;
  const photoY = 550;

  [
    { x: leftX, img: images[0], label: 'Pose 1' },
    { x: rightX, img: images[1], label: 'Pose 2' },
  ].forEach((slot) => {
    // Draw photo clipped behind crisp pastel + white frame border
    drawCoverImage(ctx, slot.img, slot.x, photoY, photoW, photoH, filterCss, slot.label, 4);
    ctx.strokeStyle = theme.frameBg;
    ctx.lineWidth = 10;
    ctx.strokeRect(slot.x - 5, photoY - 5, photoW + 10, photoH + 10);
    ctx.strokeStyle = '#241B20';
    ctx.lineWidth = 2;
    ctx.strokeRect(slot.x - 10, photoY - 10, photoW + 20, photoH + 20);
  });

  // Corner sparkles placed cleanly on outer house eaves / margins (zero photo overlap!)
  drawSparkle4(ctx, 114, 430, 36, '#C8F59B', '#241B20', 0.15);
  drawSparkle4(ctx, 786, 430, 36, '#C8F59B', '#241B20', -0.2);
  drawSparkle4(ctx, 450, 722, 18, '#FFF080', '#241B20', 0.1);

  // Outer-margin badges (left & right outside the house walls)
  ctx.save();
  ctx.translate(60, 680);
  ctx.rotate(-0.18);
  ctx.fillStyle = '#EA5C5E';
  ctx.beginPath();
  ctx.ellipse(0, 0, 48, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'italic 700 16px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Sweet', 0, -1);
  ctx.font = '600 9px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('MOMENTS', 0, 12);
  ctx.restore();

  ctx.save();
  ctx.translate(838, 608);
  ctx.rotate(0.2);
  ctx.fillStyle = '#241B20';
  ctx.font = '800 76px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('?', 0, 0);
  ctx.restore();

  // Bottom typewriter line cleanly centered with ample margin below photos (970 vs 894)
  ctx.save();
  ctx.fillStyle = '#241B20';
  ctx.font = '500 22px "JetBrains Mono", "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('here, there, everywhere', width / 2, 968);
  ctx.restore();

  if (options.sticker !== 'mascot') {
    await applyStickerCornerAccents(ctx, width, height, options.sticker, theme, [
      { x: 64, y: 1054, s: 26 },
      { x: width - 64, y: 1054, s: 26 },
    ]);
  } else {
    try {
      const hugUrl = await getCroppedMascotUrl('cameraHug');
      const hugImg = await loadImage(hugUrl);
      ctx.drawImage(hugImg, 756, 986, 118, 124);
    } catch {
      // Optional
    }
  }
}

// 2. "Nostalgia Polaroid" — balanced 2-1-2 grid with zero overlapping photos or text
async function renderKidAgain(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  images: (HTMLImageElement | null)[],
  theme: FrameTheme,
  filterCss: string,
  options: RenderStripOptions
): Promise<void> {
  const width = 900;
  const height = 1160;
  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = '#F5F4F2';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(0,0,0,0.025)';
  ctx.fillRect(0, 610, width, 2);

  // Pastel hearts peeking cleanly on far left & right edges
  drawHeart(ctx, 22, 340, 200, theme.frameBg, '#35242D', -0.15);
  drawHeart(ctx, 878, 760, 210, theme.frameBg, '#35242D', 0.14);

  // Title at top
  const headline = options.caption.trim() || 'i wanna be a kid again';
  ctx.save();
  ctx.fillStyle = '#241B20';
  ctx.textAlign = 'center';
  ctx.font = '700 38px "JetBrains Mono", "Courier New", monospace';
  if (headline.length > 18) {
    const words = headline.split(' ');
    const mid = Math.ceil(words.length / 2);
    ctx.fillText(words.slice(0, mid).join(' '), width / 2, 92, 620);
    ctx.fillText(words.slice(mid).join(' '), width / 2, 138, 620);
  } else {
    ctx.fillText(headline, width / 2, 118, 620);
  }
  ctx.restore();

  // 5 non-overlapping Polaroids in clean 2 - 1 - 2 scrapbook rhythm
  const polaroids = [
    { cx: 286, cy: 332, rot: -0.06, w: 224, h: 258, dotColor: '#FFD12E', img: images[0], label: 'Pose 1' },
    { cx: 614, cy: 332, rot: 0.06, w: 224, h: 258, dotColor: '#6D1D8D', img: images[1], label: 'Pose 2' },
    { cx: 450, cy: 604, rot: -0.015, w: 228, h: 262, dotColor: '#FF6B1A', img: images[2], label: 'Pose 3' },
    { cx: 286, cy: 878, rot: 0.045, w: 224, h: 258, dotColor: '#FF2A9D', img: images[3], label: 'Pose 4' },
    { cx: 614, cy: 878, rot: -0.045, w: 224, h: 258, dotColor: '#199DF2', img: images[4] ?? images[0], label: 'Pose 5' },
  ];

  polaroids.forEach((p) => {
    ctx.save();
    ctx.translate(p.cx, p.cy);
    ctx.rotate(p.rot);
    ctx.shadowColor = 'rgba(0,0,0,0.11)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();

    ctx.save();
    ctx.translate(p.cx, p.cy);
    ctx.rotate(p.rot);
    const pad = 15;
    const imgW = p.w - pad * 2;
    const imgH = p.h - pad * 2 - 26;
    drawCoverImage(ctx, p.img, -imgW / 2, -p.h / 2 + pad, imgW, imgH, filterCss, p.label, 2);

    // Inner Polaroid frame cutout outline on top of photo
    ctx.strokeStyle = 'rgba(47, 33, 40, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-imgW / 2, -p.h / 2 + pad, imgW, imgH);

    ctx.fillStyle = p.dotColor;
    ctx.beginPath();
    ctx.arc(-imgW / 2 + 15, -p.h / 2 + pad + imgH - 13, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Left & Right side notes placed strictly in open side lanes
  const subNote = options.subCaption?.trim() || '20 11 26';
  ctx.save();
  ctx.fillStyle = '#241B20';
  ctx.font = '500 22px "JetBrains Mono", "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('since', 52, 592);
  ctx.fillText(subNote, 52, 622, 230);

  ctx.textAlign = 'right';
  ctx.fillText('till', width - 52, 592);
  ctx.fillText('forever', width - 52, 622);

  // Centered bottom typewriter line with generous side margin for corner mascots/stickers
  ctx.textAlign = 'center';
  ctx.font = '500 19px "JetBrains Mono", "Courier New", monospace';
  ctx.fillText('much love · daisybooth · sweet memories', width / 2, 1104, width - 250);
  ctx.restore();

  // Scattered 5-point stars ONLY in safe margin areas (zero overlap with Polaroids or text)
  const stars = [
    { x: 66, y: 66, c: '#FF1F8F' },
    { x: 185, y: 112, c: '#FFD12E' },
    { x: 718, y: 92, c: '#FFD12E' },
    { x: 834, y: 158, c: '#7C2AE8' },
    { x: 96, y: 218, c: '#16A5F5' },
    { x: 450, y: 230, c: '#FF1F8F' },
    { x: 808, y: 310, c: '#FF6F1F' },
    { x: 88, y: 472, c: '#7C2AE8' },
    { x: 816, y: 486, c: '#3BE03B' },
    { x: 112, y: 710, c: '#FFD12E' },
    { x: 786, y: 710, c: '#FF1F8F' },
    { x: 88, y: 968, c: '#3BE03B' },
    { x: 816, y: 968, c: '#7C2AE8' },
    { x: 450, y: 1036, c: '#16A5F5' },
  ];
  stars.forEach((s) => drawStar5(ctx, s.x, s.y, 16, 6.5, s.c));

  await applyStickerCornerAccents(ctx, width, height, options.sticker, theme, [
    { x: 810, y: 64, s: 24 },
    { x: 86, y: 840, s: 24 },
  ]);
}

// 3. "Kalender & Strip" — crisp calendar cells + roomy strip footer
async function renderBirthdayCal(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  images: (HTMLImageElement | null)[],
  theme: FrameTheme,
  filterCss: string,
  options: RenderStripOptions
): Promise<void> {
  const width = 1140;
  const height = 920;
  canvas.width = width;
  canvas.height = height;

  // Left half: Lavender pastel
  ctx.fillStyle = '#D9C8F5';
  ctx.fillRect(0, 0, 580, height);

  // Right half: Mint green with lavender polka dots
  ctx.fillStyle = '#D1F0DC';
  ctx.fillRect(580, 0, 560, height);

  ctx.save();
  ctx.fillStyle = '#C3B6EA';
  for (let y = 26; y < height; y += 52) {
    const shift = ((y - 26) / 52) % 2 === 0 ? 0 : 26;
    for (let x = 604 + shift; x < width; x += 52) {
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Left header card
  ctx.fillStyle = '#E8F7E8';
  ctx.fillRect(40, 52, 500, 120);
  ctx.strokeStyle = '#DF9576';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 52, 500, 120);

  const mainTitle = options.caption.trim() || 'Happy';
  const subTag = options.subCaption?.trim() || 'special day';

  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = 'italic 700 74px "Plus Jakarta Sans", sans-serif';
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#FFFFFF';
  ctx.strokeText(mainTitle, 290, 134, 460);
  ctx.fillStyle = '#A799DE';
  ctx.fillText(mainTitle, 290, 134, 460);

  // Coral tilted tag neatly tucked below header without colliding with spirals
  ctx.translate(185, 198);
  ctx.rotate(-0.05);
  ctx.fillStyle = '#EA7A68';
  ctx.fillRect(-115, -22, 230, 44);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(subTag.slice(0, 15), 0, 9);
  ctx.restore();

  // Spiral Calendar Sheet on Left (40..540, y: 274..878)
  const calX = 40;
  const calY = 274;
  const calW = 500;
  const calH = 604;

  ctx.save();
  ctx.shadowColor = 'rgba(39,35,67,0.1)';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, calX, calY, calW, calH, 24);
  ctx.fill();
  ctx.restore();

  // Silver spiral rings
  for (let i = 0; i < 10; i++) {
    const rx = calX + 36 + i * 47;
    ctx.fillStyle = '#9EA4B0';
    ctx.beginPath();
    ctx.arc(rx, calY + 24, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5B6270';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(rx, calY + 8, 16, Math.PI * 0.9, Math.PI * 2.1);
    ctx.stroke();
  }

  const now = new Date();
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
  const yearStr = String(now.getFullYear());
  const todayDate = now.getDate();

  ctx.save();
  ctx.fillStyle = '#8F6A52';
  ctx.font = 'italic 700 42px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(monthName, calX + 34, calY + 98);
  ctx.font = '700 32px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(yearStr, calX + calW - 34, calY + 96);
  ctx.restore();

  // Calendar grid lines
  const gridY = calY + 126;
  ctx.strokeStyle = '#B89B87';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(calX, gridY + 42);
  ctx.lineTo(calX + calW, gridY + 42);
  ctx.moveTo(calX, gridY + 242);
  ctx.lineTo(calX + calW, gridY + 242);
  ctx.moveTo(calX + 166, gridY + 42);
  ctx.lineTo(calX + 166, calY + calH);
  ctx.moveTo(calX + 333, gridY + 42);
  ctx.lineTo(calX + 333, calY + calH);
  ctx.stroke();

  const days = ['selasa', 'rabu', 'kamis'];
  ctx.save();
  ctx.fillStyle = '#8F6A52';
  ctx.font = '500 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  days.forEach((d, idx) => {
    ctx.fillText(d, calX + 83 + idx * 166, gridY + 28);
  });

  // Yellow star + circular Pose 1 centered in middle-top cell (col 1, row 0) BELOW date number
  const starCx = calX + 250;
  const starCy = gridY + 156;
  drawStar5(ctx, starCx, starCy, 74, 36, '#FFF176');

  const baseDay = Math.max(1, todayDate - 1);
  const dateNums = [baseDay, todayDate, baseDay + 2, baseDay + 3, baseDay + 4, baseDay + 5];
  ctx.fillStyle = '#6B9E5C';
  ctx.font = 'italic 700 28px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  dateNums.forEach((num, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    ctx.fillText(String(num), calX + 16 + col * 166, gridY + 78 + row * 200);
  });
  ctx.restore();

  // Circular Pose 1 strictly below the date number inside cell (col 1, row 0)
  ctx.save();
  ctx.beginPath();
  ctx.arc(starCx, starCy + 4, 52, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  drawCoverImage(ctx, images[0], starCx - 52, starCy - 48, 104, 104, filterCss, 'Pose 1');
  ctx.restore();

  // Right Half: Tilted 3-Pose Vertical Strip cleanly framed within canvas
  ctx.save();
  ctx.translate(866, 460);
  ctx.rotate(-0.02);

  const stripW = 296;
  const stripH = 824;
  ctx.shadowColor = 'rgba(39,35,67,0.16)';
  ctx.shadowBlur = 22;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-stripW / 2, -stripH / 2, stripW, stripH);
  ctx.restore();

  ctx.save();
  ctx.translate(866, 460);
  ctx.rotate(-0.02);

  // Striped lilac upper area (top 588px) + ruled notepad footer (bottom 236px)
  ctx.fillStyle = '#E8DCF8';
  ctx.fillRect(-stripW / 2, -stripH / 2, stripW, 588);
  ctx.fillStyle = '#FFFFFF';
  for (let sx = -stripW / 2 + 12; sx < stripW / 2; sx += 26) {
    ctx.fillRect(sx, -stripH / 2, 12, 588);
  }

  ctx.fillStyle = '#E6ECF5';
  ctx.fillRect(-stripW / 2, 176, stripW, stripH / 2 - 176);
  ctx.strokeStyle = 'rgba(130, 150, 185, 0.35)';
  ctx.lineWidth = 1.5;
  for (let ly = 200; ly < stripH / 2 - 12; ly += 22) {
    ctx.beginPath();
    ctx.moveTo(-stripW / 2 + 12, ly);
    ctx.lineTo(stripW / 2 - 12, ly);
    ctx.stroke();
  }

  ctx.strokeStyle = '#6D5852';
  ctx.lineWidth = 2;
  ctx.strokeRect(-stripW / 2, -stripH / 2, stripW, stripH);

  // 3 photo slots (Pose 2, 3, 4) ending cleanly at y = 166
  const slotW = 238;
  const slotH = 164;
  [0, 1, 2].forEach((i) => {
    const sy = -stripH / 2 + 24 + i * 184;
    const img = images[i + 1] ?? images[0];
    ctx.save();
    drawRoundedRect(ctx, -slotW / 2, sy, slotW, slotH, i === 1 ? 10 : 64);
    ctx.clip();
    drawCoverImage(ctx, img, -slotW / 2, sy, slotW, slotH, filterCss, `Pose ${i + 2}`);
    ctx.restore();

    ctx.strokeStyle = '#E38462';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, -slotW / 2, sy, slotW, slotH, i === 1 ? 10 : 64);
    ctx.stroke();
  });

  // "yey!" badge + lilac/mint plates neatly spaced in footer
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#4B3C42';
  ctx.lineWidth = 2;
  ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.strokeText('yey!', -124, 212);
  ctx.fillText('yey!', -124, 212);

  ctx.fillStyle = '#C98AD8';
  ctx.fillRect(-94, 238, 188, 48);
  ctx.strokeRect(-94, 238, 188, 48);
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.font = 'italic 700 30px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(theme.name.split(' ')[0], 0, 272);

  ctx.fillStyle = '#B8E0B4';
  ctx.fillRect(-52, 294, 104, 32);
  ctx.strokeRect(-52, 294, 104, 32);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 18px "JetBrains Mono", monospace';
  ctx.fillText('day', 0, 316);

  ctx.fillStyle = '#6D5852';
  ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(subTag, 0, 368, 250);
  ctx.restore();

  // Scattered small stars in safe mint margins
  drawStar5(ctx, 646, 360, 20, 9, '#FFFFFF', '#6D5852');
  drawStar5(ctx, 1076, 132, 20, 9, '#FFFFFF', '#6D5852');
  drawStar5(ctx, 1074, 340, 18, 8, '#FFFFFF', '#6D5852');
  drawStar5(ctx, 642, 756, 20, 9, '#FFFFFF', '#6D5852');

  if (options.sticker === 'mascot') {
    try {
      const [hugUrl, fanUrl] = await Promise.all([
        getCroppedMascotUrl('cameraHug'),
        getCroppedMascotUrl('photoFan'),
      ]);
      const [hugImg, fanImg] = await Promise.all([loadImage(hugUrl), loadImage(fanUrl)]);
      ctx.drawImage(hugImg, 446, 168, 92, 96);
      ctx.drawImage(fanImg, 1028, 796, 86, 98);
    } catch {
      // Optional
    }
  } else if (options.sticker !== 'none') {
    await applyStickerCornerAccents(ctx, width, height, options.sticker, theme, [
      { x: 492, y: 215, s: 22 },
      { x: 642, y: 550, s: 24 },
    ]);
  }
}

// 4. "Teka-Teki CUTE" Crossword Grid — zero overlap between grid, circles, stars, and mascot
async function renderCrosswordCute(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  images: (HTMLImageElement | null)[],
  theme: FrameTheme,
  filterCss: string,
  options: RenderStripOptions
): Promise<void> {
  const width = 900;
  const height = 1140;
  canvas.width = width;
  canvas.height = height;

  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#FCEEF4');
  bgGrad.addColorStop(0.5, theme.frameBg);
  bgGrad.addColorStop(1, '#FDE3EE');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Crossword Grid Geometry (6 columns x 7 rows, tile = 112)
  const tile = 112;
  const startX = 110;
  const startY = 128;

  type TileDef = {
    col: number;
    row: number;
    fill: string;
    letter?: string;
    photoIdx?: number;
    heartTag?: boolean;
  };

  const tiles: TileDef[] = [
    { col: 1, row: 0, fill: '#FEF9D7', letter: 'C' },
    { col: 2, row: 0, fill: '#EAE6FA' },
    { col: 1, row: 1, fill: '#FFFFFF', photoIdx: 0 },
    { col: 1, row: 2, fill: '#FEF9D7', letter: 'U' },
    { col: 1, row: 3, fill: '#FEF9D7', letter: 'T' },
    { col: 2, row: 3, fill: '#FEF9D7', letter: 'O' },
    { col: 3, row: 3, fill: '#FEF9D7', letter: 'O' },
    { col: 4, row: 3, fill: '#FFFFFF', photoIdx: 1 },
    { col: 0, row: 4, fill: '#EAE6FA' },
    { col: 1, row: 4, fill: '#FFFFFF', photoIdx: 2 },
    { col: 1, row: 5, fill: '#FEF9D7', letter: 'E' },
    { col: 2, row: 5, fill: '#EAE6FA' },
    { col: 3, row: 5, fill: '#FF9EC7', heartTag: true },
    { col: 4, row: 5, fill: '#EAE6FA' },
    { col: 2, row: 6, fill: '#EAE6FA' },
  ];

  tiles.forEach((t) => {
    const tx = startX + t.col * tile;
    const ty = startY + t.row * tile;

    ctx.fillStyle = t.fill;
    ctx.fillRect(tx, ty, tile, tile);

    if (typeof t.photoIdx === 'number') {
      drawCoverImage(
        ctx,
        images[t.photoIdx] ?? images[0],
        tx + 3,
        ty + 3,
        tile - 6,
        tile - 6,
        filterCss,
        `Pose ${t.photoIdx + 1}`
      );
    } else if (t.letter) {
      ctx.save();
      ctx.fillStyle = '#FFFDFB';
      ctx.strokeStyle = '#4B2838';
      ctx.lineWidth = 3;
      ctx.font = '700 58px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeText(t.letter, tx + tile / 2, ty + tile / 2 + 20);
      ctx.fillText(t.letter, tx + tile / 2, ty + tile / 2 + 20);
      ctx.restore();
    } else if (t.heartTag) {
      ctx.save();
      ctx.fillStyle = '#73F2FF';
      ctx.font = '700 34px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('<333', tx + tile / 2, ty + tile / 2 + 12);
      ctx.restore();
    }

    // Draw tile frame outline ON TOP of clipped photo so borders are razor sharp
    ctx.strokeStyle = '#35242D';
    ctx.lineWidth = 2;
    ctx.strokeRect(tx, ty, tile, tile);
  });

  // Top-right scalloped frame cutout for Pose 4 (x: 618..814, y: 146..342)
  const topCircleX = 716;
  const topCircleY = 244;
  ctx.save();
  ctx.fillStyle = '#F7DC6F';
  ctx.beginPath();
  ctx.arc(topCircleX, topCircleY, 96, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#E6B933';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(topCircleX, topCircleY, 74, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  drawCoverImage(ctx, images[3] ?? images[0], topCircleX - 74, topCircleY - 74, 148, 148, filterCss, 'Pose 4');
  ctx.restore();

  // Bottom-left scalloped green frame cutout echoing Pose 1 (x: 54..226, y: 864..1036)
  const botCircleX = 140;
  const botCircleY = 950;
  ctx.save();
  ctx.fillStyle = '#9ED57A';
  ctx.beginPath();
  ctx.arc(botCircleX, botCircleY, 84, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#72AD50';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(botCircleX, botCircleY, 64, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  drawCoverImage(ctx, images[0], botCircleX - 64, botCircleY - 64, 128, 128, filterCss, 'Pose 1');
  ctx.restore();

  // Cute flower button inside tile (2, 5)
  drawDaisy(ctx, startX + 2.5 * tile, startY + 5.5 * tile, 30, '#C5E1B8');

  // Outline stars ONLY in completely empty whitespace outside tiles & circles
  const outlineStars = [
    { x: 130, y: 215, c: '#B8EB9D' },
    { x: 525, y: 204, c: '#F8B9CD' },
    { x: 432, y: 348, c: '#F9F2A8' },
    { x: 132, y: 410, c: '#F8B9CD' },
    { x: 538, y: 396, c: '#B8EB9D' },
    { x: 794, y: 424, c: '#B8DCF8' },
    { x: 64, y: 534, c: '#F9F2A8' },
    { x: 836, y: 560, c: '#F9F2A8' },
    { x: 422, y: 632, c: '#B8DCF8' },
    { x: 762, y: 742, c: '#F8B9CD' },
    { x: 586, y: 924, c: '#B8EB9D' },
  ];
  outlineStars.forEach((s) => drawStar5(ctx, s.x, s.y, 16, 7, s.c, '#35242D'));

  // Title & footer captions in clean top & bottom bands
  const cap = options.caption.trim() || 'CUTE TOO <3';
  ctx.save();
  ctx.fillStyle = theme.textColor;
  ctx.textAlign = 'center';
  ctx.font = 'italic 700 32px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(cap, width / 2, 76, 620);
  ctx.font = '500 16px "JetBrains Mono", monospace';
  ctx.fillText(options.subCaption?.trim() || 'DaisyBooth Crossword Edition', width / 2, height - 34, 520);
  ctx.restore();

  // Place mascot cleanly in empty bottom-right area (x: 720..850, y: 880..1030)
  if (options.sticker === 'mascot') {
    try {
      const hugUrl = await getCroppedMascotUrl('cameraHug');
      const hugImg = await loadImage(hugUrl);
      ctx.drawImage(hugImg, 728, 882, 126, 132);
    } catch {
      // Optional
    }
  } else {
    await applyStickerCornerAccents(ctx, width, height, options.sticker, theme, [
      { x: 782, y: 950, s: 28 },
      { x: 96, y: 108, s: 22 },
    ]);
  }
}

// 5. Classic Strips & Bento Grids
async function renderClassicStrip(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  images: (HTMLImageElement | null)[],
  theme: FrameTheme,
  filterCss: string,
  options: RenderStripOptions
): Promise<void> {
  const isGrid = options.layout === 'grid-2x2';
  const isPolaroid = options.layout === 'polaroid-1';
  const slotCount = options.layout === 'strip-4' ? 4 : options.layout === 'grid-2x2' ? 4 : 1;

  const width = isGrid ? 920 : isPolaroid ? 780 : 620;
  const padding = isGrid ? 48 : isPolaroid ? 52 : 44;
  const gap = 24;
  const headerBand = 72;
  const footerBand = isPolaroid ? 148 : 122;

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

  ctx.fillStyle = theme.frameBg;
  ctx.fillRect(0, 0, width, totalHeight);

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

  drawScallopEdge(ctx, width, 16, 18, theme.innerBorder, false);
  drawScallopEdge(ctx, width, totalHeight - 16, 18, theme.innerBorder, true);

  ctx.save();
  ctx.fillStyle = theme.textColor;
  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DaisyBooth Studio', width / 2, 52);
  ctx.restore();

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

    ctx.save();
    ctx.shadowColor = 'rgba(53, 36, 45, 0.08)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = theme.innerBorder;
    drawRoundedRect(ctx, x - 8, y - 8, slotW + 16, slotH + 16, 18);
    ctx.fill();
    ctx.restore();

    ctx.save();
    drawRoundedRect(ctx, x, y, slotW, slotH, 12);
    ctx.clip();
    drawCoverImage(ctx, images[i], x, y, slotW, slotH, filterCss, `Pose ${i + 1}`);
    ctx.restore();
  }

  await applyStickerCornerAccents(ctx, width, totalHeight, options.sticker, theme, [
    { x: 42, y: 42, s: 24 },
    { x: width - 42, y: 44, s: 22 },
    { x: 48, y: totalHeight - 54, s: 26 },
    { x: width - 48, y: totalHeight - 54, s: 26 },
  ]);

  const cleanCaption = options.caption.trim() || 'Sweet Memories';
  const dateText =
    options.subCaption?.trim() ||
    new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date());

  ctx.save();
  ctx.fillStyle = theme.textColor;
  ctx.textAlign = 'center';
  ctx.font = 'italic 600 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(cleanCaption, width / 2, totalHeight - 66, width - 220);

  ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
  ctx.globalAlpha = 0.78;
  ctx.fillText(`${theme.name}  ·  ${dateText}`, width / 2, totalHeight - 36, width - 220);
  ctx.restore();
}

export async function renderPhotoStripCanvas(
  canvas: HTMLCanvasElement,
  options: RenderStripOptions
): Promise<void> {
  const theme = FRAME_THEMES.find((t) => t.id === options.frameTheme) ?? FRAME_THEMES[0];
  const filterDef = PHOTO_FILTERS.find((f) => f.id === options.filter) ?? PHOTO_FILTERS[0];

  const maxSlots =
    options.layout === 'kid-again'
      ? 5
      : options.layout === 'house-studio'
      ? 2
      : options.layout === 'polaroid-1'
      ? 1
      : 4;

  const images = await Promise.all(
    Array.from({ length: maxSlots }).map(async (_, idx) => {
      const src = options.photos[idx];
      if (!src) return null;
      try {
        return await loadImage(src);
      } catch {
        return null;
      }
    })
  );

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (options.layout === 'house-studio') {
    await renderHouseStudio(canvas, ctx, images, theme, filterDef.cssFilter, options);
  } else if (options.layout === 'kid-again') {
    await renderKidAgain(canvas, ctx, images, theme, filterDef.cssFilter, options);
  } else if (options.layout === 'birthday-cal') {
    await renderBirthdayCal(canvas, ctx, images, theme, filterDef.cssFilter, options);
  } else if (options.layout === 'crossword-cute') {
    await renderCrosswordCute(canvas, ctx, images, theme, filterDef.cssFilter, options);
  } else {
    await renderClassicStrip(canvas, ctx, images, theme, filterDef.cssFilter, options);
  }
}
