import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { authService, oauthService } from '../../services/authService';

const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const provider = searchParams.get('provider') || 'google';

      // Verificar si hay errores en la URL
      if (error) {
        throw new Error(`Error de OAuth: ${error}`);
      }

      // Verificar que tenemos el código de autorización
      if (!code) {
        throw new Error('Código de autorización no encontrado');
      }

      // Verificar el estado para prevenir ataques CSRF
      const storedState = localStorage.getItem('oauth_state');
      if (state !== storedState) {
        throw new Error('Estado de OAuth inválido');
      }

      // Limpiar el estado almacenado
      localStorage.removeItem('oauth_state');

      // Intercambiar el código por tokens
      const response = await oauthService.handleOAuthCallback(provider as any, code, state || '');

      // Iniciar sesión con los datos del usuario
      await login({ username: response.user.email, password: '' });

      // Redirigir al usuario
      const redirectTo = localStorage.getItem('oauth_redirect') || '/dashboard';
      localStorage.removeItem('oauth_redirect');
      navigate(redirectTo, { replace: true });

    } catch (err: any) {
      console.error('Error en callback OAuth:', err);
      setError(err.message || 'Error al procesar la autenticación');
      setLoading(false);
      
      // Redirigir al login después de un error
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    }
  };

  const getProviderName = () => {
    const provider = searchParams.get('provider') || 'google';
    switch (provider) {
      case 'google': return 'Google';
      case 'facebook': return 'Facebook';
      case 'microsoft': return 'Microsoft';
      case 'apple': return 'Apple';
      default: return 'OAuth';
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            textAlign="center"
            py={4}
          >
            {loading ? (
              <>
                <CircularProgress size={60} sx={{ mb: 3 }} />
                <Typography variant="h5" gutterBottom>
                  Procesando autenticación...
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Estamos completando tu inicio de sesión con {getProviderName()}.
                  Por favor espera un momento.
                </Typography>
              </>
            ) : error ? (
              <>
                <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
                  {error}
                </Alert>
                <Typography variant="h5" gutterBottom>
                  Error de autenticación
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Serás redirigido a la página de inicio de sesión en unos segundos.
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="h5" gutterBottom color="success.main">
                  ¡Autenticación exitosa!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Redirigiendo...
                </Typography>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default OAuthCallbackPage;
