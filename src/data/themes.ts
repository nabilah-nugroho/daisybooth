import { FrameTheme, PhotoFilter, StickerMotifId, StripLayout } from '../types/photobooth';

export const STUDIO_ASSETS = {
  heroLeft: '/src/assets/images/hero_polaroid_left_1795235848206.jpg',
  heroRight: '/src/assets/images/hero_polaroid_right_1795235848608.jpg',
  samplePose1: '/src/assets/images/sample_pose_one_1795235847881.jpg',
  samplePose2: '/src/assets/images/sample_pose_two_1795235847909.jpg',
};

export const SAMPLE_POSES: string[] = [
  STUDIO_ASSETS.samplePose1,
  STUDIO_ASSETS.samplePose2,
  STUDIO_ASSETS.heroLeft,
  STUDIO_ASSETS.heroRight,
  STUDIO_ASSETS.samplePose1,
];

export const FRAME_THEMES: FrameTheme[] = [
  {
    id: 'blush-daisy',
    name: 'Blush Daisy',
    tagline: 'Merah muda lembut dengan kelopak daisy putih',
    frameBg: '#F9C5DA',
    innerBorder: '#FFFDFB',
    accentColor: '#EA7BA6',
    secondaryAccent: '#F8E59E',
    textColor: '#35242D',
    flowerCloudBg: '#FCE4EE',
    flowerCloudText: '#4B2838',
  },
  {
    id: 'lavender-cloud',
    name: 'Lavender Cloud',
    tagline: 'Ungu pastel periwinkle bernuansa mimpi',
    frameBg: '#C8C6F2',
    innerBorder: '#FFFFFF',
    accentColor: '#8B87D8',
    secondaryAccent: '#F9C5DA',
    textColor: '#272343',
    flowerCloudBg: '#FBF8F3',
    flowerCloudText: '#383059',
  },
  {
    id: 'buttercream',
    name: 'Buttercream',
    tagline: 'Krim hangat klasik dengan sentuhan mentega',
    frameBg: '#FFF4DC',
    innerBorder: '#FFFFFF',
    accentColor: '#E5B454',
    secondaryAccent: '#F7BBD4',
    textColor: '#3A2B22',
    flowerCloudBg: '#F8E3A3',
    flowerCloudText: '#423121',
  },
  {
    id: 'berry-sorbet',
    name: 'Berry Sorbet',
    tagline: 'Stroberi pastel ceria dengan pita manis',
    frameBg: '#F4A6C4',
    innerBorder: '#FFF9FB',
    accentColor: '#D66591',
    secondaryAccent: '#C8C6F2',
    textColor: '#351D28',
    flowerCloudBg: '#F49FB8',
    flowerCloudText: '#3D1928',
  },
];

export const STRIP_LAYOUTS: StripLayout[] = [
  {
    id: 'house-studio',
    name: 'Rumah Polka',
    slots: 2,
    aspectLabel: '2 Pose · Rumah',
    category: 'scrapbook',
    description: 'Latar polka dot dengan atap rumah pastel & tag imut',
  },
  {
    id: 'kid-again',
    name: 'Nostalgia Polaroid',
    slots: 5,
    aspectLabel: '5 Pose · Kolase',
    category: 'scrapbook',
    description: '5 Polaroid miring, hati pastel, bintang & teks mesin tik',
  },
  {
    id: 'birthday-cal',
    name: 'Kalender & Strip',
    slots: 4,
    aspectLabel: '4 Pose · Kalender',
    category: 'scrapbook',
    description: 'Kalender tanggal spesial + strip miring polka mint',
  },
  {
    id: 'crossword-cute',
    name: 'Teka-Teki CUTE',
    slots: 4,
    aspectLabel: '4 Pose · Grid',
    category: 'scrapbook',
    description: 'Kolase kotak teka-teki huruf C-U-T-E & bingkai bulat',
  },
  {
    id: 'strip-4',
    name: '4-Pose Strip',
    slots: 4,
    aspectLabel: '1 × 4 Vertikal',
    category: 'classic',
    description: 'Strip klasik vertikal empat bingkai',
  },
  {
    id: 'grid-2x2',
    name: '2×2 Bento',
    slots: 4,
    aspectLabel: '2 × 2 Kotak',
    category: 'classic',
    description: 'Kolase grid empat kotak seimbang',
  },
  {
    id: 'polaroid-1',
    name: '1 Polaroid',
    slots: 1,
    aspectLabel: '1 × 1 Klasik',
    category: 'classic',
    description: 'Bingkai instan satu foto ukuran penuh',
  },
];

export const PHOTO_FILTERS: PhotoFilter[] = [
  { id: 'original', name: 'Natural', cssFilter: 'none' },
  { id: 'soft-peach', name: 'Soft Peach', cssFilter: 'brightness(1.06) contrast(0.95) saturate(1.12) sepia(0.12)' },
  { id: 'cotton-candy', name: 'Cotton Candy', cssFilter: 'brightness(1.08) contrast(0.92) saturate(1.18) hue-rotate(-6deg)' },
  { id: 'dreamy-film', name: 'Dreamy Film', cssFilter: 'brightness(1.04) contrast(0.88) saturate(0.92) sepia(0.08)' },
  { id: 'rosy-glow', name: 'Rosy Glow', cssFilter: 'brightness(1.05) contrast(1.02) saturate(1.22) hue-rotate(-10deg)' },
  { id: 'bw-editorial', name: 'Monokrom', cssFilter: 'grayscale(1) contrast(1.08) brightness(1.04)' },
];

export const STICKER_MOTIFS: { id: StickerMotifId; name: string }[] = [
  { id: 'mascot', name: 'Maskot DaisyBooth' },
  { id: 'daisy', name: 'Bunga Daisy' },
  { id: 'butterfly', name: 'Kupu-Kupu' },
  { id: 'ribbon', name: 'Pita Satin' },
  { id: 'none', name: 'Polos Minimalis' },
];
