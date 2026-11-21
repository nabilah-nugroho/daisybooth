export type FrameThemeId = 'blush-daisy' | 'lavender-cloud' | 'buttercream' | 'berry-sorbet';

export type StripLayoutId =
  | 'house-studio'
  | 'kid-again'
  | 'birthday-cal'
  | 'crossword-cute'
  | 'strip-4'
  | 'grid-2x2'
  | 'polaroid-1';

export type PhotoFilterId =
  | 'original'
  | 'soft-peach'
  | 'cotton-candy'
  | 'dreamy-film'
  | 'rosy-glow'
  | 'bw-editorial';

export type StickerMotifId = 'daisy' | 'butterfly' | 'ribbon' | 'mascot' | 'none';

export interface FrameTheme {
  id: FrameThemeId;
  name: string;
  tagline: string;
  frameBg: string;
  innerBorder: string;
  accentColor: string;
  secondaryAccent: string;
  textColor: string;
  flowerCloudBg: string;
  flowerCloudText: string;
}

export interface StripLayout {
  id: StripLayoutId;
  name: string;
  slots: number;
  aspectLabel: string;
  category: 'scrapbook' | 'classic';
  description: string;
}

export interface PhotoFilter {
  id: PhotoFilterId;
  name: string;
  cssFilter: string;
}

export interface SavedStrip {
  id: string;
  title: string;
  frameTheme: FrameThemeId;
  layout: StripLayoutId;
  filter: PhotoFilterId;
  sticker: StickerMotifId;
  imageUrl: string;
  createdAt: string;
}

export interface LaravelFile {
  key: string;
  label: string;
  relPath: string;
  language: string;
  content: string;
}
