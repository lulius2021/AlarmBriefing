// Jarvis Blue Design System
export const Colors = {
  bg: '#0a0e1a',
  bgCard: '#111827',
  bgCardHover: '#1a2235',
  bgInput: '#0d1220',
  border: '#1e2a42',
  borderFocus: '#3b82f6',

  // Blues
  blue: '#3b82f6',
  blueLight: '#60a5fa',
  blueDark: '#1d4ed8',
  blueGlow: 'rgba(59, 130, 246, 0.4)',
  blueGlowStrong: 'rgba(59, 130, 246, 0.6)',
  blueMuted: 'rgba(59, 130, 246, 0.15)',

  // Text
  text: '#e2e8f0',
  textDim: '#64748b',
  textMuted: '#475569',

  // Status
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',

  // Misc
  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: {
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
};
