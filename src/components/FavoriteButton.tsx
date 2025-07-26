import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Typography
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import { useFavorites } from '../hooks/useFavorites';

interface FavoriteButtonProps {
  songId: number;
  songTitle?: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  color?: 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  variant?: 'icon' | 'button';
  disabled?: boolean;
  onFavoriteChange?: (isFavorite: boolean, songId: number) => void;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  songId,
  songTitle,
  size = 'medium',
  showLabel = false,
  color = 'error',
  variant = 'icon',
  disabled = false,
  onFavoriteChange
}) => {
  const {
    toggleFavorite,
    checkIsFavorite,
    loading,
    error,
    clearError,
    isLoggedIn
  } = useFavorites();

  // DEBUG: Log del estado
  console.log('🔘 FavoriteButton render - songId:', songId, 'isLoggedIn:', isLoggedIn, 'loading:', loading);

  const [isFavorite, setIsFavorite] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Verificar estado inicial de favorito
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (isLoggedIn) {
        setIsChecking(true);
        const favoriteStatus = await checkIsFavorite(songId);
        setIsFavorite(favoriteStatus);
        setIsChecking(false);
      } else {
        setIsFavorite(false);
        setIsChecking(false);
      }
    };

    checkFavoriteStatus();
  }, [songId, isLoggedIn, checkIsFavorite]);

  // Manejar click en el botón
  const handleToggleFavorite = async () => {
    console.log('🖱️ handleToggleFavorite clicked - isLoggedIn:', isLoggedIn, 'disabled:', disabled, 'loading:', loading);

    if (!isLoggedIn) {
      console.log('❌ Not logged in, showing error');
      setSnackbarMessage('Debes iniciar sesión para agregar favoritos');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      return;
    }

    if (disabled || loading) {
      console.log('❌ Button disabled or loading');
      return;
    }

    console.log('🔄 Calling toggleFavorite for song:', songId);
    const result = await toggleFavorite(songId);
    
    if (result && result.success) {
      const newFavoriteState = result.data.isFavorite;
      setIsFavorite(newFavoriteState);
      
      // Mensaje de éxito
      const action = result.data.isFavorite ? 'agregada a' : 'removida de';
      setSnackbarMessage(
        `${songTitle || 'Canción'} ${action} favoritos`
      );
      setSnackbarSeverity('success');
      setShowSnackbar(true);

      // Callback opcional
      onFavoriteChange?.(newFavoriteState, songId);
    } else {
      // Mostrar error
      setSnackbarMessage(error || 'Error al actualizar favorito');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    }
  };

  // Cerrar snackbar
  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
    clearError();
  };

  // Determinar el icono a mostrar
  const getIcon = () => {
    if (isChecking || loading) {
      return <CircularProgress size={size === 'small' ? 16 : size === 'large' ? 28 : 20} />;
    }
    
    return isFavorite ? (
      <FavoriteIcon color={color === 'inherit' ? 'error' : color} />
    ) : (
      <FavoriteBorderIcon color={color === 'inherit' ? 'error' : color} />
    );
  };

  // Determinar el tooltip
  const getTooltip = () => {
    if (!isLoggedIn) {
      return 'Inicia sesión para agregar favoritos';
    }
    
    if (isChecking) {
      return 'Verificando...';
    }
    
    if (loading) {
      return 'Actualizando...';
    }
    
    return isFavorite ? 'Remover de favoritos' : 'Agregar a favoritos';
  };

  // Renderizar como botón con texto
  if (variant === 'button') {
    return (
      <>
        <Box
          component="button"
          onClick={handleToggleFavorite}
          disabled={disabled || loading || isChecking}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            padding: '8px 16px',
            border: '1px solid',
            borderColor: isFavorite ? 'error.main' : 'grey.300',
            borderRadius: 1,
            backgroundColor: isFavorite ? 'error.light' : 'transparent',
            color: isFavorite ? 'error.contrastText' : 'text.primary',
            cursor: disabled || loading || isChecking ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: isFavorite ? 'error.main' : 'grey.100',
              transform: disabled || loading || isChecking ? 'none' : 'translateY(-1px)',
            },
            '&:disabled': {
              opacity: 0.6,
            }
          }}
        >
          {getIcon()}
          {showLabel && (
            <Typography variant="body2">
              {isFavorite ? 'En Favoritos' : 'Agregar a Favoritos'}
            </Typography>
          )}
        </Box>

        <Snackbar
          open={showSnackbar}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbarSeverity}
            variant="filled"
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </>
    );
  }

  // Renderizar como IconButton (default)
  return (
    <>
      <Tooltip title={getTooltip()}>
        <span>
          <IconButton
            onClick={handleToggleFavorite}
            disabled={disabled || loading || isChecking || !isLoggedIn}
            size={size}
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: disabled || loading || isChecking ? 'none' : 'scale(1.1)',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
              },
              '&:disabled': {
                opacity: 0.6,
              }
            }}
          >
            {getIcon()}
          </IconButton>
        </span>
      </Tooltip>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};
