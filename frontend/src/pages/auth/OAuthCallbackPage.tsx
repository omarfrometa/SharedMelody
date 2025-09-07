import React, { useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';

const OAuthCallbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');

    console.log('OAuth Callback - Token:', token ? 'Present' : 'Missing');
    console.log('OAuth Callback - Error:', error);

    if (token) {
      // Guardar el token y los datos del usuario
      console.log('OAuth Callback - Processing token...');
      authContext?.setAuthDataFromToken(token).then(() => {
        console.log('OAuth Callback - Token processed successfully, navigating to home');
        // Redirigir a la página principal
        navigate('/');
      }).catch((err) => {
        console.error('OAuth Callback - Error processing token:', err);
        navigate('/login?error_description=token_processing_failed');
      });
    } else if (error) {
      // Manejar error de autenticación
      console.error("OAuth Error:", error);
      // Redirigir a la página de login con un mensaje de error
      navigate(`/login?error_description=${error}`);
    } else {
      // Si no hay token ni error, redirigir a login
      console.log('OAuth Callback - No token or error found, redirecting to login');
      navigate('/login?error_description=invalid_callback');
    }
  }, [location, navigate, authContext]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'background.default'
      }}
    >
      <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress />
        <Typography>Procesando autenticación...</Typography>
      </Paper>
    </Box>
  );
};

export default OAuthCallbackPage;
