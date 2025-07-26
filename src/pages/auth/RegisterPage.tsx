import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  Divider,
  FormControlLabel,
  Checkbox,
  CircularProgress
} from '@mui/material';
import { Google as GoogleIcon, Facebook as FacebookIcon, MusicNote as MusicNoteIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { authService, oauthService } from '../../services/authService';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
  acceptPrivacy?: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userIP, setUserIP] = useState<string>('');

  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptPrivacy: false
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Función para obtener la IP del usuario
  const getUserIP = async () => {
    try {
      const services = [
        'https://api.ipify.org?format=json',
        'https://ipapi.co/json/',
        'https://httpbin.org/ip'
      ];

      for (const service of services) {
        try {
          const response = await fetch(service);
          const data = await response.json();
          const ip = data.ip || data.origin || data.query;
          if (ip) {
            setUserIP(ip);
            return;
          }
        } catch (error) {
          continue;
        }
      }
      setUserIP('IP no disponible');
    } catch (error) {
      setUserIP('IP no disponible');
    }
  };

  // Obtener IP al montar el componente
  useEffect(() => {
    getUserIP();
  }, []);

  const handleInputChange = (field: keyof RegisterFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
    }

    if (!formData.acceptPrivacy) {
      newErrors.acceptPrivacy = 'Debes aceptar la política de privacidad';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await authService.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      // Cuenta creada exitosamente
      setSuccess(
        'Cuenta creada exitosamente. Por favor revisa tu email para verificar tu cuenta.'
      );
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook' | 'microsoft' | 'apple') => {
    try {
      setLoading(true);
      setError(null);
      
      // Guardar la página de destino
      localStorage.setItem('oauth_redirect', '/dashboard');
      
      // Iniciar flujo OAuth
      const authUrl = await oauthService.initiateOAuth(provider);
      window.location.href = authUrl;
    } catch (err: any) {
      setError(err.message || `Error al iniciar sesión con ${provider}`);
      setLoading(false);
    }
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
      <Container component="main" maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4 }}>
        {/* Logo */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 4
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

        <Box textAlign="center" mb={3}>
          <Typography component="h1" variant="h4" gutterBottom>
            Crear Cuenta
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Únete a SharedMelody y comienza a colaborar
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={formData.firstName}
                  onChange={handleInputChange('firstName')}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  disabled={loading}
                />
              </Box>
              <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                <TextField
                  fullWidth
                  label="Apellido"
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  disabled={loading}
                />
              </Box>
            </Box>
            <TextField
              fullWidth
              label="Nombre de usuario"
              value={formData.username}
              onChange={handleInputChange('username')}
              error={!!errors.username}
              helperText={errors.username}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Confirmar contraseña"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              disabled={loading}
            />
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.acceptTerms}
                    onChange={handleInputChange('acceptTerms')}
                    disabled={loading}
                  />
                }
                label={
                  <Typography variant="body2">
                    Acepto los{' '}
                    <Link to="/terms" target="_blank">
                      términos y condiciones
                    </Link>
                  </Typography>
                }
              />
              {errors.acceptTerms && (
                <Typography variant="caption" color="error" display="block">
                  {errors.acceptTerms}
                </Typography>
              )}
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.acceptPrivacy}
                    onChange={handleInputChange('acceptPrivacy')}
                    disabled={loading}
                  />
                }
                label={
                  <Typography variant="body2">
                    Acepto la{' '}
                    <Link to="/privacy" target="_blank">
                      política de privacidad
                    </Link>
                  </Typography>
                }
              />
              {errors.acceptPrivacy && (
                <Typography variant="caption" color="error" display="block">
                  {errors.acceptPrivacy}
                </Typography>
              )}
            </Box>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </Button>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              O regístrate con
            </Typography>
          </Divider>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={() => handleOAuthLogin('google')}
                disabled={loading}
              >
                Google
              </Button>
            </Box>
            <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FacebookIcon />}
                onClick={() => handleOAuthLogin('facebook')}
                disabled={loading}
              >
                Facebook
              </Button>
            </Box>
          </Box>

          <Box textAlign="center" mt={3}>
            <Typography variant="body2">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login">
                Inicia sesión
              </Link>
            </Typography>
          </Box>

          {/* Información de IP */}
          <Box sx={{ textAlign: 'center', mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              Tu dirección IP: <strong>{userIP || 'Obteniendo...'}</strong>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
    </Box>
  );
};

export default RegisterPage;
