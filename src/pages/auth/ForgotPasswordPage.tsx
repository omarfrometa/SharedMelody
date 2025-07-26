import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { Email as EmailIcon, ArrowBack as ArrowBackIcon, MusicNote as MusicNoteIcon } from '@mui/icons-material';
import { authService } from '../../services/authService';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userIP, setUserIP] = useState<string>('');

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!email.trim()) {
      setError('Por favor ingresa tu email');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await authService.sendPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el email de recuperación');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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

          <Box textAlign="center">
            <EmailIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography component="h1" variant="h4" gutterBottom>
              Email Enviado
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Hemos enviado un enlace de recuperación de contraseña a <strong>{email}</strong>.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Por favor revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
              Si no ves el email, revisa tu carpeta de spam.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              El enlace expirará en 1 hora por seguridad.
            </Typography>
            
            <Box mt={4}>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                startIcon={<ArrowBackIcon />}
              >
                Volver al inicio de sesión
              </Button>
            </Box>
            
            <Box mt={2}>
              <Button
                variant="text"
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
              >
                Enviar a otro email
              </Button>
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
  }

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
            Recuperar Contraseña
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            disabled={loading}
            sx={{ mb: 3 }}
            placeholder="tu@email.com"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mb: 2 }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <EmailIcon />}
          >
            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </Button>

          <Box textAlign="center">
            <Button
              component={Link}
              to="/login"
              variant="text"
              startIcon={<ArrowBackIcon />}
              disabled={loading}
            >
              Volver al inicio de sesión
            </Button>
          </Box>
        </Box>

        <Box mt={4} p={2} bgcolor="grey.50" borderRadius={1}>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            <strong>¿No tienes una cuenta?</strong>
            <br />
            <Link to="/register">
              Regístrate aquí
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

export default ForgotPasswordPage;
