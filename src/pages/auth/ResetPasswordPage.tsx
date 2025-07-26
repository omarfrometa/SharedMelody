import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { authService } from '../../services/authService';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: ''
  });

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    validateResetToken();
  }, []);

  const validateResetToken = async () => {
    if (!token || !email) {
      setError('Enlace de recuperación inválido o expirado');
      setValidatingToken(false);
      return;
    }

    try {
      // Token validation is handled by the backend when resetting
      // await authService.validatePasswordResetToken(token, email);
      setTokenValid(true);
    } catch (err: any) {
      setError(err.message || 'El enlace de recuperación es inválido o ha expirado');
    } finally {
      setValidatingToken(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors = { password: '', confirmPassword: '' };

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

    setErrors(newErrors);
    return !newErrors.password && !newErrors.confirmPassword;
  };

  const handleInputChange = (field: 'password' | 'confirmPassword') => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await authService.resetPassword(token!, formData.password);
      setSuccess(true);
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <Container component="main" maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box textAlign="center">
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Validando enlace...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Por favor espera mientras validamos tu enlace de recuperación.
            </Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

  if (!tokenValid) {
    return (
      <Container component="main" maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box textAlign="center">
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Typography variant="h5" gutterBottom>
              Enlace inválido
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              El enlace de recuperación es inválido o ha expirado.
            </Typography>
            <Box mt={3}>
              <Button
                component={Link}
                to="/forgot-password"
                variant="contained"
                sx={{ mr: 2 }}
              >
                Solicitar nuevo enlace
              </Button>
              <Button
                component={Link}
                to="/login"
                variant="outlined"
              >
                Volver al login
              </Button>
            </Box>
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
            <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography component="h1" variant="h4" gutterBottom>
              ¡Contraseña restablecida!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Tu contraseña ha sido restablecida exitosamente.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Serás redirigido al inicio de sesión en unos segundos...
            </Typography>
            
            <Box mt={3}>
              <Button
                component={Link}
                to="/login"
                variant="contained"
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
        <Box textAlign="center" mb={3}>
          <LockIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography component="h1" variant="h4" gutterBottom>
            Nueva Contraseña
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ingresa tu nueva contraseña para <strong>{email}</strong>
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
            label="Nueva contraseña"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange('password')}
            error={!!errors.password}
            helperText={errors.password}
            disabled={loading}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              )
            }}
          />

          <TextField
            fullWidth
            label="Confirmar nueva contraseña"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            disabled={loading}
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              )
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mb: 2 }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <LockIcon />}
          >
            {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
          </Button>

          <Box textAlign="center">
            <Button
              component={Link}
              to="/login"
              variant="text"
              disabled={loading}
            >
              Volver al inicio de sesión
            </Button>
          </Box>
        </Box>

        <Box mt={4} p={2} bgcolor="info.light" borderRadius={1}>
          <Typography variant="body2" color="info.contrastText">
            <strong>Consejos para una contraseña segura:</strong>
            <br />
            • Al menos 8 caracteres de longitud
            <br />
            • Combina letras mayúsculas y minúsculas
            <br />
            • Incluye números y símbolos
            <br />
            • Evita información personal
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPasswordPage;
