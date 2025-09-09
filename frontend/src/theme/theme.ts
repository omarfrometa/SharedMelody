import { createTheme } from '@mui/material/styles';

// 🎸 CIFRACLUB-INSPIRED COLOR PALETTE
// Basado en la estructura limpia y funcional de CifraClub
const colors = {
  // 🎵 Primary: Clean Green (como CifraClub pero verde)
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Verde principal
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  // 🌟 Secondary: Neutral grays for clean interface
  secondary: {
    50: '#f8f9fa',
    100: '#e9ecef',
    200: '#dee2e6',
    300: '#ced4da',
    400: '#adb5bd',
    500: '#6c757d',
    600: '#495057',
    700: '#343a40',
    800: '#212529',
    900: '#0d1117',
    950: '#010409',
  },
  // ⚡ Accent: Supporting colors
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
  // 🎭 Simple gradients for CifraClub style
  gradient: {
    primary: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    secondary: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    accent: 'linear-gradient(135deg, #22c55e 0%, #20c997 100%)',
    dark: '#f8f9fa',
    glass: 'rgba(255,255,255,0.1)',
  },
  // 🌌 Light theme colors (CifraClub uses light theme)
  light: {
    50: '#ffffff',
    100: '#f8f9fa',
    200: '#e9ecef',
    300: '#dee2e6',
    400: '#ced4da',
    500: '#adb5bd',
    600: '#6c757d',
    700: '#495057',
    800: '#343a40',
    900: '#212529',
    950: '#0d1117',
  },
  // 🎨 Music-specific colors adapted to clean style
  music: {
    beat: '#dc3545',
    rhythm: '#17a2b8',
    melody: '#007bff',
    harmony: '#28a745',
    bass: '#ffc107',
    treble: '#6f42c1',
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

// 🎸 CIFRACLUB-INSPIRED CLEAN THEME
export const theme = createTheme({
  palette: {
    mode: 'light', // CifraClub uses light theme
    primary: {
      main: colors.primary[600], // #16a34a
      light: colors.primary[500],
      dark: colors.primary[700],
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondary[500], // #6c757d
      light: colors.secondary[300],
      dark: colors.secondary[700],
      contrastText: '#ffffff',
    },
    success: {
      main: colors.primary[600],
      light: colors.primary[400],
      dark: colors.primary[800],
      contrastText: '#ffffff',
    },
    warning: {
      main: colors.accent[500],
      light: colors.accent[300],
      dark: colors.accent[700],
      contrastText: '#ffffff',
    },
    error: {
      main: colors.music.beat,
      light: '#ff8a80',
      dark: '#d32f2f',
      contrastText: '#ffffff',
    },
    background: {
      default: colors.secondary[50], // #f8f9fa
      paper: '#ffffff',
    },
    text: {
      primary: colors.secondary[800], // #212529
      secondary: colors.secondary[500], // #6c757d
    },
    divider: colors.secondary[200], // #dee2e6
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 800,
      lineHeight: 1.2,
      color: colors.primary[600],
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
      color: colors.secondary[800],
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: colors.secondary[800],
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: colors.secondary[700],
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: colors.secondary[700],
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: colors.secondary[700],
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      fontWeight: 400,
      color: colors.secondary[800],
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      fontWeight: 400,
      color: colors.secondary[700],
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
      fontSize: '0.9rem',
    },
  },
  shape: {
    borderRadius: 8, // CifraClub uses smaller border radius
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    '0 4px 8px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
    '0 5px 10px rgba(0,0,0,0.12), 0 3px 6px rgba(0,0,0,0.08)',
    '0 6px 12px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.10)',
    '0 8px 16px rgba(0,0,0,0.15), 0 6px 12px rgba(0,0,0,0.10)',
    '0 10px 20px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.10)',
    '0 12px 24px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.10)',
    '0 14px 28px rgba(0,0,0,0.15), 0 12px 24px rgba(0,0,0,0.10)',
    '0 16px 32px rgba(0,0,0,0.15), 0 14px 28px rgba(0,0,0,0.10)',
    '0 18px 36px rgba(0,0,0,0.15), 0 16px 32px rgba(0,0,0,0.10)',
    '0 20px 40px rgba(0,0,0,0.15), 0 18px 36px rgba(0,0,0,0.10)',
    '0 22px 44px rgba(0,0,0,0.15), 0 20px 40px rgba(0,0,0,0.10)',
    '0 24px 48px rgba(0,0,0,0.15), 0 22px 44px rgba(0,0,0,0.10)',
    '0 26px 52px rgba(0,0,0,0.15), 0 24px 48px rgba(0,0,0,0.10)',
    '0 28px 56px rgba(0,0,0,0.15), 0 26px 52px rgba(0,0,0,0.10)',
    '0 30px 60px rgba(0,0,0,0.15), 0 28px 56px rgba(0,0,0,0.10)',
    '0 32px 64px rgba(0,0,0,0.15), 0 30px 60px rgba(0,0,0,0.10)',
    '0 34px 68px rgba(0,0,0,0.15), 0 32px 64px rgba(0,0,0,0.10)',
    '0 36px 72px rgba(0,0,0,0.15), 0 34px 68px rgba(0,0,0,0.10)',
    '0 38px 76px rgba(0,0,0,0.15), 0 36px 72px rgba(0,0,0,0.10)',
    '0 40px 80px rgba(0,0,0,0.15), 0 38px 76px rgba(0,0,0,0.10)',
    '0 42px 84px rgba(0,0,0,0.15), 0 40px 80px rgba(0,0,0,0.10)',
    '0 44px 88px rgba(0,0,0,0.15), 0 42px 84px rgba(0,0,0,0.10)',
  ],
  components: {
    // 🎯 CIFRACLUB BUTTON STYLE
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
          fontSize: '0.9rem',
          transition: 'all 0.2s ease',
        },
        contained: {
          backgroundColor: colors.primary[600],
          color: '#ffffff',
          boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)',
          '&:hover': {
            backgroundColor: colors.primary[700],
            boxShadow: '0 4px 8px rgba(22, 163, 74, 0.3)',
          },
        },
        outlined: {
          borderColor: colors.secondary[300],
          color: colors.secondary[700],
          '&:hover': {
            borderColor: colors.primary[600],
            backgroundColor: colors.primary[50],
            color: colors.primary[700],
          },
        },
      },
    },
    // 🎨 CLEAN CARDS
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#ffffff',
          border: `1px solid ${colors.secondary[200]}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderColor: colors.secondary[300],
          },
        },
      },
    },
    // 📄 CLEAN PAPERS
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#ffffff',
          border: `1px solid ${colors.secondary[200]}`,
        },
      },
    },
    // 📝 CLEAN TEXT FIELDS
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            backgroundColor: '#ffffff',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.primary[500],
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.primary[600],
                borderWidth: 2,
              },
            },
          },
        },
      },
    },
    // 🏷️ CLEAN CHIPS
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 400,
          backgroundColor: colors.secondary[100],
          color: colors.secondary[700],
          border: `1px solid ${colors.secondary[200]}`,
          '&:hover': {
            backgroundColor: colors.primary[50],
            borderColor: colors.primary[300],
            color: colors.primary[700],
          },
        },
      },
    },
    // 📱 CLEAN APP BAR
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderBottom: `1px solid ${colors.secondary[200]}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          color: colors.secondary[800],
        },
      },
    },
  },
});

// 🌟 CIFRACLUB-INSPIRED CUSTOM STYLES
export const customStyles = {
  cleanCard: {
    backgroundColor: '#ffffff',
    border: `1px solid ${colors.secondary[200]}`,
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      borderColor: colors.secondary[300],
    },
  },
  primaryText: {
    color: colors.primary[600],
    fontWeight: 600,
  },
  greenButton: {
    backgroundColor: colors.primary[600],
    color: '#ffffff',
    borderRadius: '6px',
    padding: '8px 16px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: colors.primary[700],
      transform: 'translateY(-1px)',
    },
  },
  sidebarSection: {
    backgroundColor: colors.secondary[50],
    borderBottom: `1px solid ${colors.secondary[200]}`,
    padding: '12px 16px',
    fontSize: '0.85rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: colors.secondary[500],
    letterSpacing: '0.5px',
  },
  sidebarLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    color: colors.secondary[600],
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    gap: '10px',
    '&:hover': {
      backgroundColor: colors.primary[50],
      color: colors.primary[700],
    },
    '&.active': {
      backgroundColor: colors.primary[50],
      color: colors.primary[700],
      fontWeight: 600,
    },
  },
  heroGradient: {
    background: colors.gradient.primary,
    color: 'white',
    padding: '40px',
    borderRadius: '12px',
    textAlign: 'center',
  },
};

// Export colors for use in components
export { colors };
