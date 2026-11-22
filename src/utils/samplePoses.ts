// Menghasilkan 5 pose contoh langsung lewat HTML5 Canvas tanpa file gambar JPG/PNG/SVG eksternal

interface SamplePoseConfig {
  bgTop: string;
  bgBottom: string;
  accent: string;
  badge: string;
  expression: string;
  label: string;
}

const SAMPLE_CONFIGS: SamplePoseConfig[] = [
  {
    bgTop: '#FCE4EE',
    bgBottom: '#F9C5DA',
    accent: '#EA7BA6',
    badge: 'POSE 01',
    expression: '✌(◕‿◕)✌',
    label: 'Peace Pose',
  },
  {
    bgTop: '#EAE8FA',
    bgBottom: '#C8C6F2',
    accent: '#8B87D8',
    badge: 'POSE 02',
    expression: '( ˘ ³˘)♥',
    label: 'Finger Heart',
  },
  {
    bgTop: '#FFF8E3',
    bgBottom: '#FBE5AE',
    accent: '#D99E32',
    badge: 'POSE 03',
    expression: '(ﾉ◕ヮ◕)ﾉ',
    label: 'Sweet Smile',
  },
  {
    bgTop: '#E2F5EA',
    bgBottom: '#BFE8CE',
    accent: '#54A372',
    badge: 'POSE 04',
    expression: '(づ｡◕‿‿◕｡)づ',
    label: 'Cheek Heart',
  },
  {
    bgTop: '#FDE9F0',
    bgBottom: '#F4A6C4',
    accent: '#D66591',
    badge: 'POSE 05',
    expression: '(★‿★)',
    label: 'Star Wink',
  },
];

export function generateSamplePoses(): string[] {
  return SAMPLE_CONFIGS.map((cfg) => {
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 540;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, cfg.bgTop);
    grad.addColorStop(1, cfg.bgBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Soft pastel studio bokeh circles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.arc(130, 110, 88, 0, Math.PI * 2);
    ctx.arc(600, 420, 110, 0, Math.PI * 2);
    ctx.fill();

    // Inner studio frame card
    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.beginPath();
    ctx.roundRect(70, 66, 580, 408, 28);
    ctx.fill();

    ctx.strokeStyle = cfg.accent;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Top badge text
    ctx.fillStyle = cfg.accent;
    ctx.font = '700 22px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(cfg.badge, canvas.width / 2, 134);

    // Center kawaii face expression
    ctx.fillStyle = '#2F2128';
    ctx.font = '700 66px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(cfg.expression, canvas.width / 2, 278);

    // Bottom pose label
    ctx.fillStyle = '#5E4652';
    ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(cfg.label, canvas.width / 2, 372);

    ctx.fillStyle = '#8B6A7A';
    ctx.font = '500 18px "JetBrains Mono", monospace';
    ctx.fillText('DaisyBooth Studio Sample', canvas.width / 2, 418);

    return canvas.toDataURL('image/png');
  });
}
