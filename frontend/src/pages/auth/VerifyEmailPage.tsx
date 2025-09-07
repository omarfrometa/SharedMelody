import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { authService } from '../../services/authService';

const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (token && email) {
      verifyEmail();
    } else {
      setError('Enlace de verificación inválido');
      setLoading(false);
    }
  }, []);

  const verifyEmail = async () => {
    try {
      setLoading(true);
      setError(null);

      await authService.verifyEmail(token!);
      setSuccess(true);
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Email verificado exitosamente. Ya puedes iniciar sesión.' 
          }
        });
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Error al verificar el email');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Email no disponible para reenvío');
      return;
    }

    try {
      setResendLoading(true);
      setError(null);

      await authService.sendEmailVerification(email);
      setResendSuccess(true);
      
      setTimeout(() => {
        setResendSuccess(false);
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Error al reenviar email de verificación');
    } finally {
      setResendLoading(false);
    }
  };

  if (loading) {
    return (
      <Container component="main" maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box textAlign="center">
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Verificando email...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Por favor espera mientras verificamos tu dirección de email.
            </Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

  if (success) {
    return (
      <Container component="main" maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box textAlign="center">
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
            <Typography component="h1" variant="h4" gutterBottom>
              ¡Email verificado!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Tu dirección de email <strong>{email}</strong> ha sido verificada exitosamente.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Ya puedes acceder a todas las funciones de SharedMelody.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Serás redirigido al inicio de sesión en unos segundos...
            </Typography>
            
            <Box mt={4}>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                size="large"
              >
                Ir al inicio de sesión
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center">
          <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 3 }} />
          <Typography component="h1" variant="h4" gutterBottom>
            Error de verificación
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              {error}
            </Alert>
          )}

          {resendSuccess && (
            <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
              Email de verificación reenviado exitosamente. Por favor revisa tu bandeja de entrada.
            </Alert>
          )}

          <Typography variant="body1" color="text.secondary" paragraph>
            No pudimos verificar tu dirección de email. Esto puede deberse a:
          </Typography>
          
          <Box textAlign="left" mb={3}>
            <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 2 }}>
              <li>El enlace ha expirado (los enlaces expiran después de 24 horas)</li>
              <li>El enlace ya fue utilizado anteriormente</li>
              <li>El enlace está malformado o es inválido</li>
            </Typography>
          </Box>

          <Box mt={4} display="flex" flexDirection="column" gap={2}>
            {email && (
              <Button
                variant="contained"
                onClick={handleResendVerification}
                disabled={resendLoading}
                startIcon={resendLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
              >
                {resendLoading ? 'Reenviando...' : 'Reenviar email de verificación'}
              </Button>
            )}
            
            <Button
              component={Link}
              to="/login"
              variant="outlined"
            >
              Volver al inicio de sesión
            </Button>
            
            <Button
              component={Link}
              to="/register"
              variant="text"
            >
              Crear nueva cuenta
            </Button>
          </Box>

          <Box mt={4} p={2} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="body2" color="text.secondary">
              <EmailIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 16 }} />
              <strong>¿No encuentras el email?</strong>
              <br />
              Revisa tu carpeta de spam o correo no deseado. 
              Los emails pueden tardar unos minutos en llegar.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default VerifyEmailPage;
