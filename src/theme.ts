'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366F1',
      dark: '#4F46E5',
    },
    secondary: {
      main: '#9333EA',
    },
    text: {
      primary: '#334155',
      secondary: '#64748B',
    },
    grey: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
    background: {
      default: '#F8FAFC',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.7,
      color: '#334155',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#64748B',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 500,
      color: '#64748B',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '1rem',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#F1F5F9',
          },
        },
        sizeSmall: {
          padding: 4,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 28,
          height: 28,
          fontSize: '0.875rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '1.5rem',
        },
      },
    },
  },
});

export default theme; 