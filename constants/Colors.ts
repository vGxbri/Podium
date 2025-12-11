/**
 * Podium Color Palette
 * Primary: #FFEAD7 (Cream) - Backgrounds
 * Accent: #404461 (Navy) - Buttons, text, accents
 */

export const Colors = {
  // Primary Colors
  primary: '#404461',
  primaryLight: '#5B5D7A',
  primaryDark: '#2D2F45',
  
  // Background Colors
  background: '#FFEAD7',
  backgroundLight: '#FFF5ED',
  backgroundDark: '#F5DCC8',
  
  // Surface Colors (for cards, modals)
  surface: '#FFFFFF',
  surfaceElevated: 'rgba(255, 255, 255, 0.85)',
  
  // Text Colors
  text: '#404461',
  textSecondary: '#5B5D7A',
  textLight: '#8B8DA3',
  textOnPrimary: '#FFFFFF',
  
  // Status Colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Misc
  border: 'rgba(64, 68, 97, 0.15)',
  shadow: 'rgba(64, 68, 97, 0.1)',
  overlay: 'rgba(64, 68, 97, 0.5)',
  
  // Award/Trophy Colors
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
};

export type ColorName = keyof typeof Colors;
