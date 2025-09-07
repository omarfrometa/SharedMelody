import { createTheme } from '@mui/material/styles';

// 🎨 ULTRA-MODERN MUSIC PLATFORM COLOR PALETTE
// Inspirado en Spotify, Apple Music y las mejores plataformas musicales
const colors = {
  // 🎵 Primary: Deep Musical Purple with Neon Accents
  primary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c2d12',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },
  // 🌟 Secondary: Electric Cyan/Teal
  secondary: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344',
  },
  // ⚡ Accent: Electric Lime/Yellow
  accent: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
    950: '#422006',
  },
  // 🎭 Gradient Colors for Advanced Effects
  gradient: {
    primary: 'linear-gradient(135deg, #a855f7 0%, #ec4899 25%, #06b6d4 50%, #10b981 75%, #f59e0b 100%)',
    secondary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    accent: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    dark: 'linear-gradient(135deg, #0f0f23 0%, #2d1b69 100%)',
    glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  },
  // 🌌 Dark Theme Colors
  dark: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  // 🎨 Music-specific Colors
  music: {
    beat: '#ff6b6b',
    rhythm: '#4ecdc4',
    melody: '#45b7d1',
    harmony: '#96ceb4',
    bass: '#feca57',
    treble: '#ff9ff3',
  }
};

// 🎭 GLASSMORPHISM & NEUMORPHISM EFFECTS
const glassEffect = {
  background: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
};

const neumorphismLight = {
  background: '#f0f0f3',
  boxShadow: '20px 20px 60px #d1d1d4, -20px -20px 60px #ffffff',
};

const neumorphismDark = {
  background: '#2c2c54',
  boxShadow: '20px 20px 60px #1a1a2e, -20px -20px 60px #3e3e7a',
};

// 🚀 REVOLUTIONARY MUSIC PLATFORM THEME
export const theme = createTheme({
  palette: {
    mode: 'dark', // Starting with dark theme for that premium feel
    primary: {
      main: colors.primary[500],
      light: colors.primary[300],
      dark: colors.primary[700],
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondary[400],
      light: colors.secondary[300],
      dark: colors.secondary[600],
      contrastText: '#ffffff',
    },
    success: {
      main: colors.music.harmony,
      light: colors.music.melody,
      dark: colors.music.bass,
      contrastText: '#ffffff',
    },
    warning: {
      main: colors.accent[400],
      light: colors.accent[300],
      dark: colors.accent[600],
      contrastText: '#000000',
    },
    error: {
      main: colors.music.beat,
      light: '#ff8a80',
      dark: '#d32f2f',
      contrastText: '#ffffff',
    },
    background: {
      default: 'linear-gradient(135deg, #0f0f23 0%, #2d1b69 100%)',
      paper: 'rgba(255, 255, 255, 0.05)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    divider: 'rgba(255, 255, 255, 0.1)',
  },
  typography: {
    fontFamily: '"Space Grotesk", "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: {
      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
      fontWeight: 900,
      lineHeight: 1.1,
      letterSpacing: '-0.05em',
      background: colors.gradient.primary,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    h2: {
      fontSize: 'clamp(2rem, 4vw, 3rem)',
      fontWeight: 800,
      lineHeight: 1.2,
      letterSpacing: '-0.03em',
    },
    h3: {
      fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: 'clamp(1.125rem, 1.5vw, 1.25rem)',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      fontWeight: 400,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 20,
  },
  shadows: [
    'none',
    '0 2px 8px rgba(168, 85, 247, 0.15)',
    '0 4px 12px rgba(168, 85, 247, 0.15)',
    '0 8px 24px rgba(168, 85, 247, 0.15)',
    '0 12px 32px rgba(168, 85, 247, 0.18)',
    '0 16px 40px rgba(168, 85, 247, 0.2)',
    '0 20px 48px rgba(168, 85, 247, 0.22)',
    '0 24px 56px rgba(168, 85, 247, 0.25)',
    // Enhanced shadows continue...
    '0 28px 64px rgba(168, 85, 247, 0.3)',
    '0 32px 72px rgba(168, 85, 247, 0.35)',
    '0 36px 80px rgba(168, 85, 247, 0.4)',
    '0 40px 88px rgba(168, 85, 247, 0.45)',
    '0 44px 96px rgba(168, 85, 247, 0.5)',
    '0 48px 104px rgba(168, 85, 247, 0.55)',
    '0 52px 112px rgba(168, 85, 247, 0.6)',
    '0 56px 120px rgba(168, 85, 247, 0.65)',
    '0 60px 128px rgba(168, 85, 247, 0.7)',
    '0 64px 136px rgba(168, 85, 247, 0.75)',
    '0 68px 144px rgba(168, 85, 247, 0.8)',
    '0 72px 152px rgba(168, 85, 247, 0.85)',
    '0 76px 160px rgba(168, 85, 247, 0.9)',
    '0 80px 168px rgba(168, 85, 247, 0.95)',
    '0 84px 176px rgba(168, 85, 247, 1.0)',
    '0 88px 184px rgba(168, 85, 247, 1.0)',
    '0 92px 192px rgba(168, 85, 247, 1.0)',
  ],
  components: {
    // 🎯 REVOLUTIONARY BUTTON DESIGN
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 32px',
          fontSize: '0.95rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            transition: 'left 0.6s',
          },
          '&:hover::before': {
            left: '100%',
          },
        },
        contained: {
          background: colors.gradient.primary,
          boxShadow: '0 8px 32px rgba(168, 85, 247, 0.4)',
          '&:hover': {
            transform: 'translateY(-2px) scale(1.02)',
            boxShadow: '0 12px 40px rgba(168, 85, 247, 0.6)',
          },
        },
        outlined: {
          border: '2px solid transparent',
          background: `${glassEffect.background}`,
          backdropFilter: glassEffect.backdropFilter,
          '&:hover': {
            border: `2px solid ${colors.primary[500]}`,
            background: 'rgba(168, 85, 247, 0.1)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    // 🎨 GLASSMORPHIC CARDS
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          background: glassEffect.background,
          backdropFilter: glassEffect.backdropFilter,
          border: glassEffect.border,
          boxShadow: glassEffect.boxShadow,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 20px 60px rgba(168, 85, 247, 0.3)',
          },
        },
      },
    },
    // 📄 MODERN PAPERS
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          background: glassEffect.background,
          backdropFilter: glassEffect.backdropFilter,
          border: glassEffect.border,
        },
      },
    },
    // 📝 FUTURISTIC TEXT FIELDS
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.08)',
            },
            '&.Mui-focused': {
              background: 'rgba(255, 255, 255, 0.1)',
              boxShadow: `0 0 0 2px ${colors.primary[500]}`,
            },
          },
        },
      },
    },
    // 🏷️ MODERN CHIPS
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
          background: glassEffect.background,
          backdropFilter: glassEffect.backdropFilter,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            background: 'rgba(168, 85, 247, 0.2)',
          },
        },
      },
    },
    // 📱 FLOATING APP BAR
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: glassEffect.background,
          backdropFilter: glassEffect.backdropFilter,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: 'none',
        },
      },
    },
  },
});

// 🌟 ADDITIONAL CUSTOM STYLES FOR COMPONENTS
export const customStyles = {
  glassCard: {
    ...glassEffect,
    borderRadius: '24px',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-8px) scale(1.02)',
      boxShadow: '0 20px 60px rgba(168, 85, 247, 0.3)',
    },
  },
  gradientText: {
    background: colors.gradient.primary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  floatingButton: {
    background: colors.gradient.primary,
    borderRadius: '50px',
    padding: '16px 32px',
    boxShadow: '0 8px 32px rgba(168, 85, 247, 0.4)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-4px) scale(1.05)',
      boxShadow: '0 16px 48px rgba(168, 85, 247, 0.6)',
    },
  },
  pulseAnimation: {
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    '@keyframes pulse': {
      '0%, 100%': {
        opacity: 1,
      },
      '50%': {
        opacity: 0.5,
      },
    },
  },
  parallaxContainer: {
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: colors.gradient.primary,
      opacity: 0.1,
      animation: 'float 6s ease-in-out infinite',
    },
    '@keyframes float': {
      '0%, 100%': {
        transform: 'translateY(0px)',
      },
      '50%': {
        transform: 'translateY(-20px)',
      },
    },
  },
};

// Export colors for use in components
export { colors, glassEffect, neumorphismLight, neumorphismDark };
