import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Microsoft as MicrosoftIcon,
  MusicNote as MusicNoteIcon,
  Apple as AppleIcon
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberCredentials, setRememberCredentials] = useState(false);
  const [credentialsLoaded, setCredentialsLoaded] = useState(false);
  const [userIP, setUserIP] = useState<string>('');

  // Claves para localStorage
  const REMEMBER_CREDENTIALS_KEY = 'sharedmelody_remember_credentials';
  const SAVED_USERNAME_KEY = 'sharedmelody_saved_username';
  const SAVED_PASSWORD_KEY = 'sharedmelody_saved_password';

  // Función para obtener la IP del usuario
  const getUserIP = async () => {
    try {
      // Intentar obtener IP desde múltiples servicios
      const services = [
        'https://api.ipify.org?format=json',
        'https://ipapi.co/json/',
        'https://httpbin.org/ip'
      ];

      for (const service of services) {
        try {
          const response = await fetch(service);
          const data = await response.json();

          // Diferentes servicios devuelven la IP en diferentes campos
          const ip = data.ip || data.origin || data.query;
          if (ip) {
            setUserIP(ip);
            return;
          }
        } catch (error) {
          console.log(`Error with service ${service}:`, error);
          continue;
        }
      }

      // Si todos los servicios fallan, mostrar IP local
      setUserIP('IP no disponible');
    } catch (error) {
      console.error('Error obteniendo IP:', error);
      setUserIP('IP no disponible');
    }
  };

  // Cargar credenciales guardadas y obtener IP al montar el componente
  useEffect(() => {
    // Cargar credenciales guardadas
    const shouldRemember = localStorage.getItem(REMEMBER_CREDENTIALS_KEY) === 'true';
    if (shouldRemember) {
      const savedUsername = localStorage.getItem(SAVED_USERNAME_KEY) || '';
      const savedPassword = localStorage.getItem(SAVED_PASSWORD_KEY) || '';

      // Solo cargar si ambos campos tienen contenido
      if (savedUsername && savedPassword) {
        setFormData({
          username: savedUsername,
          password: savedPassword
        });
        setRememberCredentials(true);
        setCredentialsLoaded(true);

        // Mostrar mensaje temporal de que se cargaron las credenciales
        setTimeout(() => setCredentialsLoaded(false), 3000);
      } else {
        // Si los datos están incompletos, limpiar todo
        clearSavedCredentials();
      }
    }

    // Obtener IP del usuario
    getUserIP();
  }, []);

  // Guardar credenciales en localStorage
  const saveCredentials = (username: string, password: string) => {
    localStorage.setItem(REMEMBER_CREDENTIALS_KEY, 'true');
    localStorage.setItem(SAVED_USERNAME_KEY, username);
    localStorage.setItem(SAVED_PASSWORD_KEY, password);
  };

  // Limpiar credenciales guardadas
  const clearSavedCredentials = () => {
    localStorage.removeItem(REMEMBER_CREDENTIALS_KEY);
    localStorage.removeItem(SAVED_USERNAME_KEY);
    localStorage.removeItem(SAVED_PASSWORD_KEY);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Limpiar error al escribir
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData);

      // Guardar o limpiar credenciales según la opción seleccionada
      if (rememberCredentials) {
        saveCredentials(formData.username, formData.password);
      } else {
        clearSavedCredentials();
      }

      navigate('/'); // Redirigir a la página principal
    } catch (err: any) {
      setError(err.message || t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleRememberCredentialsChange = (checked: boolean) => {
    setRememberCredentials(checked);

    // Si se desmarca, limpiar las credenciales guardadas inmediatamente
    if (!checked) {
      clearSavedCredentials();
    }
  };

  const handleOAuthLogin = (provider: string) => {
    window.location.href = `https://sharedmelody.com/api/auth/${provider}`;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {credentialsLoaded && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Credenciales cargadas automáticamente
          </Alert>
        )}

        {/* Logo */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MusicNoteIcon
            sx={{
              fontSize: 48,
              color: 'primary.main',
              mr: 2
            }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: 'text.primary'
            }}
          >
            SharedMelody
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Access Control
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label={t('common.username')}
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
            disabled={loading}
          />

          <TextField
            fullWidth
            label={t('common.password')}
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
            disabled={loading}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={rememberCredentials}
                onChange={(e) => handleRememberCredentialsChange(e.target.checked)}
                color="primary"
                disabled={loading}
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                {t('auth.rememberCredentials') || 'Recordar credenciales'}
              </Typography>
            }
            sx={{ mb: 2, alignSelf: 'flex-start' }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mb: 2, py: 1.5 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t('auth.login')
            )}
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Link
            component={RouterLink}
            to="/forgot-password"
            variant="body2"
            color="primary"
          >
            {t('auth.forgotPassword')}
          </Link>
        </Box>

        <Divider sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            O
          </Typography>
        </Divider>

        <Box sx={{ mb: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={() => handleOAuthLogin('google')}
            sx={{ mb: 1 }}
            disabled={loading}
          >
            {t('auth.loginWith')} Google
          </Button>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<FacebookIcon />}
            onClick={() => handleOAuthLogin('facebook')}
            sx={{ mb: 1 }}
            disabled={loading}
          >
            {t('auth.loginWith')} Facebook
          </Button>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<MicrosoftIcon />}
            onClick={() => handleOAuthLogin('microsoft')}
            disabled={loading}
          >
            {t('auth.loginWith')} Microsoft
          </Button>
          <Button
           fullWidth
           variant="outlined"
           startIcon={<AppleIcon />}
           onClick={() => handleOAuthLogin('apple')}
           disabled={loading}
         >
           {t('auth.loginWith')} Apple
         </Button>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {t('auth.dontHaveAccount')}{' '}
            <Link
              component={RouterLink}
              to="/register"
              color="primary"
              fontWeight="medium"
            >
              {t('auth.register')}
            </Link>
          </Typography>
        </Box>

        {/* Información de IP */}
        <Box sx={{ textAlign: 'center', mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Tu dirección IP: <strong>{userIP || 'Obteniendo...'}</strong>
          </Typography>
        </Box>
      </Paper>
    </Container>
    </Box>
  );
};

export default LoginPage;