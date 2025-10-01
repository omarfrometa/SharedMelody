import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Divider,
  IconButton,
  Link
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import AppleIcon from '@mui/icons-material/Apple';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from '../../contexts/LanguageContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Handle OAuth errors from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get('error');
    const errorDescription = params.get('error_description');
    
    if (errorParam || errorDescription) {
      let errorMessage = '';
      if (errorDescription) {
        switch (errorDescription) {
          case 'google_auth_failed':
            errorMessage = t('auth.googleAuthFailed') || 'Google authentication failed';
            break;
          case 'microsoft_auth_failed':
            errorMessage = t('auth.microsoftAuthFailed') || 'Microsoft authentication failed';
            break;
          case 'apple_auth_failed':
            errorMessage = t('auth.appleAuthFailed') || 'Apple authentication failed';
            break;
          case 'token_processing_failed':
            errorMessage = t('auth.tokenProcessingFailed') || 'Token processing failed';
            break;
          case 'invalid_callback':
            errorMessage = t('auth.invalidCallback') || 'Invalid authentication callback';
            break;
          default:
            errorMessage = errorDescription;
        }
      } else if (errorParam) {
        errorMessage = errorParam;
      }
      setError(errorMessage);
    }
  }, [location.search, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ username: email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.message || t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider: string) => {
    // Clear any existing errors
    setError('');
    
    // Redirect to OAuth provider
    const baseUrl = process.env.REACT_APP_API_URL || 'https://api.sharedmelody.com';
    window.location.href = `${baseUrl}/api/auth/${provider}`;
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" sx={{ mb: 3 }}>
            {t('auth.login')}
          </Typography>
          
          {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}
          
          {/* OAuth Buttons */}
          <Box sx={{ mb: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={() => handleOAuthLogin('google')}
              sx={{
                mb: 1,
                borderColor: '#4285f4',
                color: '#4285f4',
                '&:hover': {
                  borderColor: '#3367d6',
                  backgroundColor: '#f8f9ff'
                }
              }}
            >
              {t('auth.loginWith')} Google
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<MicrosoftIcon />}
              onClick={() => handleOAuthLogin('microsoft')}
              sx={{
                mb: 1,
                borderColor: '#00a1f1',
                color: '#00a1f1',
                '&:hover': {
                  borderColor: '#0078d4',
                  backgroundColor: '#f3f9ff'
                }
              }}
            >
              {t('auth.loginWith')} Microsoft
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AppleIcon />}
              onClick={() => handleOAuthLogin('apple')}
              sx={{
                mb: 2,
                borderColor: '#000',
                color: '#000',
                '&:hover': {
                  borderColor: '#333',
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              {t('auth.loginWith')} Apple
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {t('common.or') || 'or'}
            </Typography>
          </Divider>
          
          {/* Traditional Login Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label={t('common.email')}
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t('common.password')}
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? t('common.loading') : t('auth.login')}
            </Button>

            <Box textAlign="center">
              <Link component={RouterLink} to="/auth/forgot-password" variant="body2">
                {t('auth.forgotPassword')}
              </Link>
            </Box>

            <Box textAlign="center" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {t('auth.dontHaveAccount')}{' '}
                <Link component={RouterLink} to="/register">
                  {t('auth.register')}
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;