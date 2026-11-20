import type { Article } from '@/vocab/types';
import type { Rating } from '@/srs/types';

export interface Palette {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  danger: string;
  success: string;
  /** Gender colours; always paired with the article text, never colour alone. */
  gender: Record<Article, string>;
  genderBg: Record<Article, string>;
  rating: Record<Rating, string>;
  onRating: string;
}

export const light: Palette = {
  bg: '#F7F7F5',
  surface: '#FFFFFF',
  surfaceAlt: '#EFEFEC',
  border: '#DEDED9',
  text: '#1B1B1A',
  textMuted: '#62625E',
  primary: '#2F5BD3',
  onPrimary: '#FFFFFF',
  danger: '#C0362C',
  success: '#2E7D4F',
  gender: { der: '#1F5FC4', die: '#C0306A', das: '#2E7D4F' },
  genderBg: { der: '#E3ECFB', die: '#FBE3EC', das: '#E2F2E8' },
  rating: { again: '#C0362C', hard: '#B36200', good: '#2E7D4F', easy: '#2F5BD3' },
  onRating: '#FFFFFF',
};

export const dark: Palette = {
  bg: '#121212',
  surface: '#1C1C1E',
  surfaceAlt: '#2A2A2D',
  border: '#38383C',
  text: '#F2F2F0',
  textMuted: '#A3A39E',
  primary: '#7FA2FF',
  onPrimary: '#0B1530',
  danger: '#FF7A70',
  success: '#6FD39A',
  gender: { der: '#86B2FF', die: '#FF8DB8', das: '#7EDBA2' },
  genderBg: { der: '#1A2A47', die: '#47192C', das: '#173525' },
  rating: { again: '#9E2C24', hard: '#8F4F00', good: '#22663F', easy: '#2847A6' },
  onRating: '#FFFFFF',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;
export const font = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 30,
  hero: 40,
} as const;
/** Minimum touch target (dp). */
export const TOUCH = 48;

export interface Theme {
  dark: boolean;
  c: Palette;
}
