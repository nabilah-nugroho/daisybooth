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
  placeholderLabel: string
): void {
  if (img) {
    ctx.save();
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
    ctx.restore();
  } else {
    ctx.fillStyle = '#FDF2F6';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#9D7B8B';
    ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(placeholderLabel, x + w / 2, y + h / 2 + 6);
  }
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
      ctx.drawImage(hugImg, 16, height - 114, 90, 94);
      ctx.drawImage(fanImg, width - 102, height - 114, 84, 94);
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

// 1. "Rumah Polka" (inspired by image_fc630c08 & image_c6e81a88)
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

  // Polka dot background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Soft pastel sky band at top
  const topGrad = ctx.createLinearGradient(0, 0, width, 420);
  topGrad.addColorStop(0, theme.frameBg);
  topGrad.addColorStop(1, theme.secondaryAccent);
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, width, 410);

  // Crisp polka dots below sky
  ctx.save();
  ctx.fillStyle = '#241B20';
  for (let y = 435; y < height; y += 54) {
    const shift = ((y - 435) / 54) % 2 === 0 ? 0 : 27;
    for (let x = 22 + shift; x < width; x += 54) {
      ctx.beginPath();
      ctx.arc(x, y, 5.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Scattered 4-point sparkle stars in sky
  drawSparkle4(ctx, 130, 120, 18, '#FFFFFF', '#241B20', 0.2);
  drawSparkle4(ctx, 220, 230, 14, '#FFFFFF', '#241B20', 0.1);
  drawSparkle4(ctx, 630, 110, 16, '#FFFFFF', '#241B20', -0.2);
  drawSparkle4(ctx, 815, 290, 18, '#FFFFFF', '#241B20', 0.3);

  // House body (warm cream card with crisp dark outline)
  const houseX = 115;
  const houseY = 470;
  const houseW = 670;
  const houseH = 560;

  ctx.save();
  ctx.shadowColor = 'rgba(36, 27, 32, 0.12)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = '#FFFCE8';
  ctx.fillRect(houseX, houseY, houseW, houseH);
  ctx.restore();

  ctx.strokeStyle = '#241B20';
  ctx.lineWidth = 3;
  ctx.strokeRect(houseX, houseY, houseW, houseH);

  // Chimney
  ctx.fillStyle = theme.frameBg;
  ctx.fillRect(625, 195, 110, 210);
  ctx.strokeRect(625, 195, 110, 210);

  // Pitched Roof Triangle
  ctx.beginPath();
  ctx.moveTo(45, 470);
  ctx.lineTo(450, 110);
  ctx.lineTo(855, 470);
  ctx.closePath();
  ctx.fillStyle = theme.frameBg;
  ctx.fill();
  ctx.stroke();

  // Mascot peeking above chimney/roof if mascot sticker is selected
  if (options.sticker === 'mascot') {
    try {
      const peekUrl = await getCroppedMascotUrl('windowPeek');
      const peekImg = await loadImage(peekUrl);
      ctx.drawImage(peekImg, 135, 118, 175, 165);
    } catch {
      // Optional
    }
  }

  // Roof Title & Sub-handle
  const titleText = options.caption.trim() || 'Daisy House!';
  const subText = options.subCaption?.trim() || '@daisybooth';
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = theme.textColor;
  ctx.font = 'italic 700 54px "Playfair Display", Georgia, serif';
  ctx.fillText(titleText, width / 2, 368);

  ctx.font = '500 22px "JetBrains Mono", "Courier New", monospace';
  ctx.fillText(subText, width / 2, 424);
  ctx.restore();

  // Inside house labels: "with" & "us" + green tag ribbons
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#241B20';
  ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('with', 285, 530);
  ctx.fillText('us', 615, 530);

  // Green tag pills above photos
  ctx.fillStyle = '#4E9A54';
  ctx.fillRect(195, 548, 180, 32);
  ctx.fillRect(525, 548, 180, 32);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 18px "JetBrains Mono", monospace';
  ctx.fillText('1  ·  2  ·  3', 285, 570);
  ctx.fillText('#daisybooth', 615, 570);
  ctx.restore();

  // 2 side-by-side portrait slots
  const photoW = 266;
  const photoH = 342;
  const leftX = 152;
  const rightX = 482;
  const photoY = 584;

  [
    { x: leftX, img: images[0], label: 'Pose 1' },
    { x: rightX, img: images[1], label: 'Pose 2' },
  ].forEach((slot) => {
    ctx.fillStyle = theme.frameBg;
    ctx.fillRect(slot.x - 6, photoY - 6, photoW + 12, photoH + 12);
    drawCoverImage(ctx, slot.img, slot.x, photoY, photoW, photoH, filterCss, slot.label);
  });

  // Decorative sparkles around house corners
  drawSparkle4(ctx, 128, 492, 42, '#C8F59B', '#241B20', 0.15);
  drawSparkle4(ctx, 718, 495, 42, '#C8F59B', '#241B20', -0.2);
  drawSparkle4(ctx, 450, 622, 26, '#FFF080', '#241B20', 0.1);
  drawSparkle4(ctx, 138, 912, 20, '#FFF080', '#241B20', 0.25);
  drawSparkle4(ctx, 732, 932, 22, '#FFF080', '#241B20', -0.15);

  // Cute coral badge on left ("Sweet Memories")
  ctx.save();
  ctx.translate(76, 706);
  ctx.rotate(-0.2);
  ctx.fillStyle = '#EA5C5E';
  ctx.beginPath();
  ctx.ellipse(0, 0, 56, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'italic 700 18px "Playfair Display", serif';
  ctx.textAlign = 'center';
  ctx.fillText('Sweet', 0, -1);
  ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('MOMENTS', 0, 14);
  ctx.restore();

  // Dotted "?" on right
  ctx.save();
  ctx.translate(822, 596);
  ctx.rotate(0.22);
  ctx.fillStyle = '#241B20';
  ctx.font = '800 92px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('?', 0, 0);
  ctx.restore();

  // Bottom typewriter line inside house
  ctx.save();
  ctx.fillStyle = '#241B20';
  ctx.font = '500 22px "JetBrains Mono", "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('here, there, everywhere', width / 2, 992);
  ctx.restore();

  if (options.sticker !== 'mascot') {
    await applyStickerCornerAccents(ctx, width, height, options.sticker, theme, [
      { x: 96, y: 1030, s: 28 },
      { x: width - 96, y: 1030, s: 28 },
    ]);
  } else {
    try {
      const hugUrl = await getCroppedMascotUrl('cameraHug');
      const hugImg = await loadImage(hugUrl);
      ctx.drawImage(hugImg, 730, 960, 128, 134);
    } catch {
      // Optional
    }
  }
}

// 2. "Nostalgia Polaroid" (inspired by image_800dce84)
async function renderKidAgain(
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

  // Vintage paper canvas
  ctx.fillStyle = '#F5F4F2';
  ctx.fillRect(0, 0, width, height);

  // Subtle horizontal fold crease across middle
  ctx.fillStyle = 'rgba(0,0,0,0.03)';
  ctx.fillRect(0, 622, width, 3);

  // Big pastel pink hearts peeking from left & right edges
  drawHeart(ctx, 44, 345, 250, theme.frameBg, '#35242D', -0.15);
  drawHeart(ctx, 845, 760, 265, theme.frameBg, '#35242D', 0.14);

  // Title at top in typewriter font
  const headline = options.caption.trim() || 'i wanna be a kid again';
  ctx.save();
  ctx.fillStyle = '#241B20';
  ctx.textAlign = 'center';
  ctx.font = '700 42px "JetBrains Mono", "Courier New", monospace';
  // Split into 2 balanced lines if long
  if (headline.length > 16) {
    const words = headline.split(' ');
    const mid = Math.ceil(words.length / 2);
    ctx.fillText(words.slice(0, mid).join(' '), width / 2, 112);
    ctx.fillText(words.slice(mid).join(' '), width / 2, 162);
  } else {
    ctx.fillText(headline, width / 2, 138);
  }
  ctx.restore();

  // 5 staggered tilted Polaroid frames
  const polaroids = [
    { cx: 280, cy: 382, rot: -0.11, w: 235, h: 270, dotColor: '#FFD12E', img: images[0], label: 'Pose 1' },
    { cx: 598, cy: 382, rot: 0.11, w: 235, h: 270, dotColor: '#6D1D8D', img: images[1], label: 'Pose 2' },
    { cx: 455, cy: 568, rot: 0.0, w: 215, h: 248, dotColor: '#FF6B1A', img: images[2], label: 'Pose 3' },
    { cx: 266, cy: 822, rot: 0.0, w: 235, h: 272, dotColor: '#FF2A9D', img: images[3], label: 'Pose 4' },
    { cx: 632, cy: 760, rot: -0.05, w: 235, h: 272, dotColor: '#199DF2', img: images[4] ?? images[0], label: 'Pose 5' },
  ];

  // Draw center one behind bottom two, matching overlap depth
  const drawOrder = [0, 1, 2, 3, 4];
  drawOrder.forEach((idx) => {
    const p = polaroids[idx];
    ctx.save();
    ctx.translate(p.cx, p.cy);
    ctx.rotate(p.rot);

    ctx.shadowColor = 'rgba(0,0,0,0.12)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();

    ctx.save();
    ctx.translate(p.cx, p.cy);
    ctx.rotate(p.rot);
    const pad = 16;
    const imgW = p.w - pad * 2;
    const imgH = p.h - pad * 2 - 22;
    drawCoverImage(ctx, p.img, -imgW / 2, -p.h / 2 + pad, imgW, imgH, filterCss, p.label);

    // Cute signature colorful cheek dot sticker on corner of photo frame
    ctx.fillStyle = p.dotColor;
    ctx.beginPath();
    ctx.arc(-imgW / 2 + 16, -p.h / 2 + pad + imgH - 14, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Left & Right typewriter side notes
  const subNote = options.subCaption?.trim() || '20 11 26';
  ctx.save();
  ctx.fillStyle = '#241B20';
  ctx.font = '500 22px "JetBrains Mono", "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('since', 52, 535);
  ctx.fillText(subNote, 52, 565);

  ctx.textAlign = 'right';
  ctx.fillText('till', width - 58, 525);
  ctx.fillText('forever', width - 58, 555);

  // Bottom typewriter line
  ctx.textAlign = 'left';
  ctx.font = '500 20px "JetBrains Mono", "Courier New", monospace';
  ctx.fillText('much love from little', 38, 1094);
  ctx.textAlign = 'right';
  ctx.fillText('daisybooth · sweet memories', width - 38, 1094);
  ctx.restore();

  // Scattered vibrant 5-point stars
  const stars = [
    { x: 64, y: 68, c: '#FF1F8F' },
    { x: 215, y: 102, c: '#FFD12E' },
    { x: 446, y: 38, c: '#FF1F8F' },
    { x: 660, y: 84, c: '#FFD12E' },
    { x: 825, y: 190, c: '#7C2AE8' },
    { x: 120, y: 205, c: '#7C2AE8' },
    { x: 448, y: 274, c: '#16A5F5' },
    { x: 726, y: 238, c: '#FF1F8F' },
    { x: 48, y: 344, c: '#FF1F8F' },
    { x: 158, y: 380, c: '#16A5F5' },
    { x: 60, y: 492, c: '#7C2AE8' },
    { x: 728, y: 515, c: '#FF6F1F' },
    { x: 830, y: 602, c: '#FF1F8F' },
    { x: 405, y: 814, c: '#FFD12E' },
    { x: 84, y: 822, c: '#16A5F5' },
    { x: 40, y: 954, c: '#FF1F8F' },
    { x: 132, y: 1044, c: '#3BE03B' },
    { x: 325, y: 1010, c: '#7C2AE8' },
    { x: 500, y: 974, c: '#FF6F1F' },
    { x: 676, y: 960, c: '#3BE03B' },
    { x: 774, y: 896, c: '#FF1F8F' },
    { x: 840, y: 1018, c: '#7C2AE8' },
  ];
  stars.forEach((s) => drawStar5(ctx, s.x, s.y, 17, 7, s.c));

  await applyStickerCornerAccents(ctx, width, height, options.sticker, theme, [
    { x: 790, y: 74, s: 24 },
    { x: 112, y: 690, s: 24 },
  ]);
}

// 3. "Kalender & Strip" (inspired by image_cd18f5e4)
async function renderBirthdayCal(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  images: (HTMLImageElement | null)[],
  theme: FrameTheme,
  filterCss: string,
  options: RenderStripOptions
): Promise<void> {
  const width = 1120;
  const height = 880;
  canvas.width = width;
  canvas.height = height;

  // Left half: Lavender pastel top
  ctx.fillStyle = '#D9C8F5';
  ctx.fillRect(0, 0, 570, height);

  // Right half: Mint green with lavender polka dots
  ctx.fillStyle = '#D1F0DC';
  ctx.fillRect(570, 0, 550, height);

  ctx.save();
  ctx.fillStyle = '#C3B6EA';
  for (let y = 26; y < height; y += 52) {
    const shift = ((y - 26) / 52) % 2 === 0 ? 0 : 26;
    for (let x = 594 + shift; x < width; x += 52) {
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Left header card
  ctx.fillStyle = '#E8F7E8';
  ctx.fillRect(36, 72, 494, 128);
  ctx.strokeStyle = '#DF9576';
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 72, 494, 128);

  const mainTitle = options.caption.trim() || 'Happy';
  const subTag = options.subCaption?.trim() || 'special day';

  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = 'italic 700 84px "Playfair Display", Georgia, serif';
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#FFFFFF';
  ctx.strokeText(mainTitle, 285, 160);
  ctx.fillStyle = '#A799DE';
  ctx.fillText(mainTitle, 285, 160);

  // Coral tilted tag under headline
  ctx.translate(185, 212);
  ctx.rotate(-0.07);
  ctx.fillStyle = '#EA7A68';
  ctx.fillRect(-115, -24, 230, 48);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 30px "Playfair Display", serif';
  ctx.fillText(subTag.slice(0, 14), 0, 11);
  ctx.restore();

  // Spiral Calendar Sheet on Left
  const calX = 34;
  const calY = 304;
  const calW = 502;
  const calH = 576;

  ctx.save();
  ctx.shadowColor = 'rgba(39,35,67,0.1)';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, calX, calY, calW, calH, 24);
  ctx.fill();
  ctx.restore();

  // Silver spiral rings at top of calendar
  for (let i = 0; i < 10; i++) {
    const rx = calX + 38 + i * 47;
    ctx.fillStyle = '#9EA4B0';
    ctx.beginPath();
    ctx.arc(rx, calY + 26, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5B6270';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(rx, calY + 8, 18, Math.PI * 0.9, Math.PI * 2.1);
    ctx.stroke();
  }

  const now = new Date();
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
  const yearStr = String(now.getFullYear());
  const todayDate = now.getDate();

  ctx.save();
  ctx.fillStyle = '#8F6A52';
  ctx.font = 'italic 700 44px "Playfair Display", Georgia, serif';
  ctx.fillText(monthName, calX + 36, calY + 104);
  ctx.font = '700 34px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(yearStr, calX + calW - 36, calY + 102);
  ctx.restore();

  // Calendar grid lines & dates
  const gridY = calY + 132;
  ctx.strokeStyle = '#B89B87';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(calX, gridY + 40);
  ctx.lineTo(calX + calW, gridY + 40);
  ctx.moveTo(calX, gridY + 210);
  ctx.lineTo(calX + calW, gridY + 210);
  ctx.moveTo(calX + 167, gridY + 40);
  ctx.lineTo(calX + 167, calY + calH);
  ctx.moveTo(calX + 334, gridY + 40);
  ctx.lineTo(calX + 334, calY + calH);
  ctx.stroke();

  const days = ['selasa', 'rabu', 'kamis'];
  ctx.save();
  ctx.fillStyle = '#8F6A52';
  ctx.font = '500 22px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  days.forEach((d, idx) => {
    ctx.fillText(d, calX + 83 + idx * 167, gridY + 26);
  });

  // Big yellow star highlighting Pose 1 on the middle date
  const starCx = calX + 278;
  const starCy = gridY + 164;
  drawStar5(ctx, starCx, starCy, 86, 42, '#FFF176');

  const baseDay = Math.max(1, todayDate - 1);
  const dateNums = [baseDay, todayDate, baseDay + 2, baseDay + 3, baseDay + 4, baseDay + 5];
  ctx.fillStyle = '#6B9E5C';
  ctx.font = 'italic 700 32px "Playfair Display", serif';
  ctx.textAlign = 'left';
  dateNums.forEach((num, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    ctx.fillText(String(num), calX + 20 + col * 167, gridY + 86 + row * 170);
  });
  ctx.restore();

  // Circular Pose 1 inside the star!
  ctx.save();
  ctx.beginPath();
  ctx.arc(starCx - 22, starCy + 10, 56, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  drawCoverImage(ctx, images[0], starCx - 78, starCy - 46, 112, 112, filterCss, 'Pose 1');
  ctx.restore();

  // Right Half: Tilted 3-Pose Vertical Strip
  ctx.save();
  ctx.translate(856, 444);
  ctx.rotate(-0.025);

  const stripW = 290;
  const stripH = 812;
  ctx.shadowColor = 'rgba(39,35,67,0.16)';
  ctx.shadowBlur = 22;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-stripW / 2, -stripH / 2, stripW, stripH);
  ctx.restore();

  ctx.save();
  ctx.translate(856, 444);
  ctx.rotate(-0.025);

  // Top striped lilac background + bottom ruled notebook area
  ctx.fillStyle = '#E8DCF8';
  ctx.fillRect(-stripW / 2, -stripH / 2, stripW, 595);
  ctx.fillStyle = '#FFFFFF';
  for (let sx = -stripW / 2 + 12; sx < stripW / 2; sx += 26) {
    ctx.fillRect(sx, -stripH / 2, 12, 595);
  }

  // Ruled lavender lines at bottom of strip
  ctx.fillStyle = '#E6ECF5';
  ctx.fillRect(-stripW / 2, 188, stripW, stripH / 2 - 188);
  ctx.strokeStyle = 'rgba(130, 150, 185, 0.35)';
  ctx.lineWidth = 1.5;
  for (let ly = 212; ly < stripH / 2 - 12; ly += 22) {
    ctx.beginPath();
    ctx.moveTo(-stripW / 2 + 12, ly);
    ctx.lineTo(stripW / 2 - 12, ly);
    ctx.stroke();
  }

  ctx.strokeStyle = '#6D5852';
  ctx.lineWidth = 2;
  ctx.strokeRect(-stripW / 2, -stripH / 2, stripW, stripH);

  // 3 photo slots on the strip (Pose 2, 3, 4)
  const slotW = 236;
  const slotH = 166;
  [0, 1, 2].forEach((i) => {
    const sy = -stripH / 2 + 24 + i * 192;
    const img = images[i + 1] ?? images[0];
    ctx.save();
    if (i === 0 || i === 2) {
      // Rounded oval/pill frame like reference
      drawRoundedRect(ctx, -slotW / 2, sy, slotW, slotH, 68);
      ctx.clip();
    } else {
      drawRoundedRect(ctx, -slotW / 2, sy, slotW, slotH, 10);
      ctx.clip();
    }
    drawCoverImage(ctx, img, -slotW / 2, sy, slotW, slotH, filterCss, `Pose ${i + 2}`);
    ctx.restore();

    ctx.strokeStyle = '#E38462';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, -slotW / 2, sy, slotW, slotH, i === 1 ? 10 : 68);
    ctx.stroke();
  });

  // "yey!" sticker + footer box on strip
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#4B3C42';
  ctx.lineWidth = 2;
  ctx.font = '700 26px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.strokeText('yey!', -122, 182);
  ctx.fillText('yey!', -122, 182);

  // Lilac & mint caption plates at strip footer
  ctx.fillStyle = '#C98AD8';
  ctx.fillRect(-94, 232, 188, 50);
  ctx.strokeRect(-94, 232, 188, 50);
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.font = 'italic 700 32px "Playfair Display", serif';
  ctx.fillText(theme.name.split(' ')[0], 0, 268);

  ctx.fillStyle = '#B8E0B4';
  ctx.fillRect(-52, 286, 104, 34);
  ctx.strokeRect(-52, 286, 104, 34);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 20px "JetBrains Mono", monospace';
  ctx.fillText('day', 0, 310);

  ctx.fillStyle = '#6D5852';
  ctx.font = '500 15px "Playfair Display", serif';
  ctx.fillText(subTag, 0, 368);
  ctx.restore();

  // Scattered small stars
  drawStar5(ctx, 646, 374, 22, 10, '#FFFFFF', '#6D5852');
  drawStar5(ctx, 1068, 128, 22, 10, '#FFFFFF', '#6D5852');
  drawStar5(ctx, 1064, 336, 20, 9, '#FFFFFF', '#6D5852');
  drawStar5(ctx, 636, 754, 22, 10, '#FFFFFF', '#6D5852');

  await applyStickerCornerAccents(ctx, width, height, options.sticker, theme, [
    { x: 500, y: 245, s: 22 },
    { x: 640, y: 560, s: 24 },
  ]);
}

// 4. "Teka-Teki CUTE" Crossword Grid (inspired by image_f7e41acc)
async function renderCrosswordCute(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  images: (HTMLImageElement | null)[],
  theme: FrameTheme,
  filterCss: string,
  options: RenderStripOptions
): Promise<void> {
  const width = 900;
  const height = 1120;
  canvas.width = width;
  canvas.height = height;

  // Soft pastel gradient backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#FCEEF4');
  bgGrad.addColorStop(0.5, theme.frameBg);
  bgGrad.addColorStop(1, '#FDE3EE');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Scattered pastel outline stars
  const outlineStars = [
    { x: 175, y: 230, c: '#B8EB9D' },
    { x: 560, y: 196, c: '#F8B9CD' },
    { x: 432, y: 365, c: '#F9F2A8' },
    { x: 160, y: 422, c: '#F8B9CD' },
    { x: 562, y: 446, c: '#B8EB9D' },
    { x: 184, y: 545, c: '#B8DCF8' },
    { x: 848, y: 536, c: '#F9F2A8' },
    { x: 54, y: 676, c: '#F9F2A8' },
    { x: 445, y: 690, c: '#B8DCF8' },
    { x: 174, y: 822, c: '#B8EB9D' },
    { x: 836, y: 816, c: '#F8B9CD' },
    { x: 316, y: 958, c: '#F9F2A8' },
    { x: 452, y: 1030, c: '#B8DCF8' },
  ];
  outlineStars.forEach((s) => drawStar5(ctx, s.x, s.y, 18, 8, s.c, '#35242D'));

  // Crossword Grid Geometry (6 columns x 7 rows)
  const tile = 122;
  const startX = 112;
  const startY = 148;

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
    { col: 2, row: 5, fill: '#EAE6FA', heartTag: false },
    { col: 3, row: 5, fill: '#FF9EC7', heartTag: true },
    { col: 4, row: 5, fill: '#EAE6FA' },
    { col: 2, row: 6, fill: '#EAE6FA' },
  ];

  tiles.forEach((t) => {
    const tx = startX + t.col * tile;
    const ty = startY + t.row * tile;

    ctx.fillStyle = t.fill;
    ctx.fillRect(tx, ty, tile, tile);
    ctx.strokeStyle = '#35242D';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(tx, ty, tile, tile);

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
      ctx.font = '700 62px "Playfair Display", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.strokeText(t.letter, tx + tile / 2, ty + tile / 2 + 22);
      ctx.fillText(t.letter, tx + tile / 2, ty + tile / 2 + 22);
      ctx.restore();
    } else if (t.heartTag) {
      ctx.save();
      ctx.fillStyle = '#73F2FF';
      ctx.font = '700 38px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('<333', tx + tile / 2, ty + tile / 2 + 14);
      ctx.restore();
    }
  });

  // Top-right scalloped frame cutout for Pose 4!
  const topCircleX = 708;
  const topCircleY = 258;
  ctx.save();
  ctx.fillStyle = '#F7DC6F';
  ctx.beginPath();
  ctx.arc(topCircleX, topCircleY, 108, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#E6B933';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(topCircleX, topCircleY, 82, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  drawCoverImage(ctx, images[3] ?? images[0], topCircleX - 82, topCircleY - 82, 164, 164, filterCss, 'Pose 4');
  ctx.restore();

  // Bottom-left scalloped green frame cutout echoing Pose 1!
  const botCircleX = 148;
  const botCircleY = 982;
  ctx.save();
  ctx.fillStyle = '#9ED57A';
  ctx.beginPath();
  ctx.arc(botCircleX, botCircleY, 92, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#72AD50';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(botCircleX, botCircleY, 70, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  drawCoverImage(ctx, images[0], botCircleX - 70, botCircleY - 70, 140, 140, filterCss, 'Pose 1');
  ctx.restore();

  // Cute flower button inside tile (2, 5)
  drawDaisy(ctx, startX + 2.5 * tile, startY + 5.5 * tile, 34, '#C5E1B8');

  // Caption stamp at top & bottom
  const cap = options.caption.trim() || 'CUTE TOO <3';
  ctx.save();
  ctx.fillStyle = theme.textColor;
  ctx.textAlign = 'center';
  ctx.font = 'italic 700 32px "Playfair Display", Georgia, serif';
  ctx.fillText(cap, width / 2, 86);
  ctx.font = '500 16px "JetBrains Mono", monospace';
  ctx.fillText(options.subCaption?.trim() || 'DaisyBooth Crossword Edition', width / 2, height - 34);
  ctx.restore();

  await applyStickerCornerAccents(ctx, width, height, options.sticker, theme, [
    { x: 760, y: 980, s: 28 },
    { x: 90, y: 120, s: 24 },
  ]);
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
  ctx.font = '600 22px "Playfair Display", Georgia, serif';
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
  ctx.font = 'italic 600 28px "Playfair Display", Georgia, serif';
  ctx.fillText(cleanCaption, width / 2, totalHeight - 64);

  ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
  ctx.globalAlpha = 0.78;
  ctx.fillText(`${theme.name}  ·  ${dateText}`, width / 2, totalHeight - 36);
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
