import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import AppRoutes from './routes/Routes';
import MainLayout from './components/layout/MainLayout';
import { theme } from './theme/theme';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <LanguageProvider>
            <AuthProvider>
              <MainLayout>
                <AppRoutes />
              </MainLayout>
            </AuthProvider>
          </LanguageProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
