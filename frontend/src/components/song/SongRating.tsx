import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Rating as MuiRating, 
  TextField, 
  Button, 
  Paper,
  Stack,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
  Chip
} from '@mui/material';
import { 
  Star as StarIcon, 
  StarBorder as StarBorderIcon,
  Send as SendIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon 
} from '@mui/icons-material';
import { songService } from '../../services/songService';
import { SongRating as SongRatingType, CreateSongRating } from '../../types/song';
import { useAuth } from '../../contexts/AuthContext';

interface SongRatingProps {
  songId: string | number;
  averageRating?: number;
  ratingCount?: number;
  showRatingsList?: boolean;
  compact?: boolean;
}

interface RatingWithUser extends SongRatingType {
  username?: string;
  firstName?: string;
  lastName?: string;
}

const SongRating: React.FC<SongRatingProps> = ({
  songId,
  averageRating = 0,
  ratingCount = 0,
  showRatingsList = true,
  compact = false
}) => {
  const { user, isAuthenticated } = useAuth();
  
  // Estados
  const [userRating, setUserRating] = useState<SongRatingType | null>(null);
  const [currentRating, setCurrentRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [ratings, setRatings] = useState<RatingWithUser[]>([]);
  
  // Estados de carga
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loadingRatings, setLoadingRatings] = useState<boolean>(false);
  const [loadingLike, setLoadingLike] = useState<boolean>(false);
  
  // Estados de error
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Cargar datos iniciales
  useEffect(() => {
    if (isAuthenticated && songId) {
      loadUserRating();
      checkIfLiked();
    }
    if (showRatingsList && songId) {
      loadRatings();
    }
  }, [songId, isAuthenticated, showRatingsList]);

  // Cargar rating del usuario
  const loadUserRating = async () => {
    try {
      setLoading(true);
      const rating = await songService.getUserRating(songId.toString());
      if (rating) {
        setUserRating(rating);
        setCurrentRating(rating.rating);
        setReviewComment(rating.reviewComment || '');
      }
    } catch (error: any) {
      console.error('Error al cargar rating del usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verificar si está en favoritos
  const checkIfLiked = async () => {
    try {
      const liked = await songService.checkIfLiked(songId.toString());
      setIsLiked(liked);
    } catch (error: any) {
      console.error('Error al verificar favoritos:', error);
    }
  };

  // Cargar todas las calificaciones
  const loadRatings = async () => {
    try {
      setLoadingRatings(true);
      // Nota: El servicio actual no tiene este método, se puede implementar más tarde
      // const ratingsData = await songService.getSongRatings(songId.toString());
      // setRatings(ratingsData.data || []);
    } catch (error: any) {
      console.error('Error al cargar ratings:', error);
    } finally {
      setLoadingRatings(false);
    }
  };

  // Enviar calificación
  const handleSubmitRating = async () => {
    if (!isAuthenticated) {
      setError('Debes iniciar sesión para calificar');
      return;
    }

    if (currentRating === 0) {
      setError('Debes seleccionar una calificación');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const ratingData: CreateSongRating = {
        songId: songId.toString(),
        rating: currentRating as 1 | 2 | 3 | 4 | 5,
        reviewComment: reviewComment.trim() || undefined
      };

      const result = await songService.rateSong(songId.toString(), ratingData);
      setUserRating(result);
      setSuccess(userRating ? 'Calificación actualizada' : 'Calificación enviada');
      
      // Recargar ratings si se muestran
      if (showRatingsList) {
        loadRatings();
      }
    } catch (error: any) {
      setError(error.message || 'Error al enviar calificación');
    } finally {
      setSubmitting(false);
    }
  };

  // Manejar like/unlike
  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      setError('Debes iniciar sesión para dar me gusta');
      return;
    }

    try {
      setLoadingLike(true);
      setError('');

      // Optimistic update
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);

      if (newLikedState) {
        // Intentar dar like
        try {
          await songService.likeSong(songId.toString());
          setSuccess('Me gusta agregado');
        } catch (likeError: any) {
          // Si ya existe, mantener el estado positivo
          if (likeError.message?.includes('Ya has dado me gusta')) {
            setSuccess('Ya te gusta esta canción');
          } else {
            // Revertir el estado optimista si hay otro error
            setIsLiked(false);
            throw likeError;
          }
        }
      } else {
        // Quitar like
        await songService.unlikeSong(songId.toString());
        setSuccess('Me gusta removido');
      }
    } catch (error: any) {
      console.error('Error en toggle like:', error);
      setError(error.message || 'Error al procesar me gusta');
      // Recargar el estado real desde el servidor
      await checkIfLiked();
    } finally {
      setLoadingLike(false);
    }
  };

  // Limpiar mensajes
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Mensajes de error y éxito */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Información general de rating */}
      <Paper elevation={1} sx={{ p: compact ? 2 : 3, mb: 2 }}>
        <Stack spacing={2}>
          {/* Promedio y estadísticas */}
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <Box display="flex" alignItems="center" gap={1}>
              <MuiRating
                value={averageRating}
                readOnly
                precision={0.1}
                icon={<StarIcon fontSize="inherit" />}
                emptyIcon={<StarBorderIcon fontSize="inherit" />}
              />
              <Typography variant="body2" color="text.secondary">
                {averageRating.toFixed(1)}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              ({ratingCount} {ratingCount === 1 ? 'calificación' : 'calificaciones'})
            </Typography>

            {/* Botón de like */}
            <Button
              variant={isLiked ? "contained" : "outlined"}
              startIcon={
                loadingLike ? (
                  <CircularProgress size={16} />
                ) : isLiked ? (
                  <FavoriteIcon />
                ) : (
                  <FavoriteBorderIcon />
                )
              }
              onClick={handleToggleLike}
              disabled={!isAuthenticated || loadingLike}
              size="small"
              sx={{
                backgroundColor: isLiked ? '#4caf50' : 'transparent',
                color: isLiked ? 'white' : 'primary.main',
                borderColor: isLiked ? '#4caf50' : 'primary.main',
                '&:hover': {
                  backgroundColor: isLiked ? '#388e3c' : 'rgba(25, 118, 210, 0.04)',
                  color: isLiked ? 'white' : 'primary.main',
                },
                '&.Mui-disabled': {
                  backgroundColor: isLiked ? '#81c784' : 'transparent',
                  color: isLiked ? 'white' : 'text.disabled',
                  borderColor: isLiked ? '#81c784' : 'rgba(0, 0, 0, 0.12)',
                }
              }}
            >
              {isLiked ? 'Te gusta' : 'Me gusta'}
            </Button>
          </Box>

          {/* Formulario de calificación del usuario */}
          {isAuthenticated && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  {userRating ? 'Tu calificación:' : 'Califica esta canción:'}
                </Typography>
                
                <Stack spacing={2}>
                  <MuiRating
                    name="song-rating"
                    value={currentRating}
                    onChange={(event, newValue) => {
                      console.log('Rating changed:', newValue);
                      setCurrentRating(newValue || 0);
                    }}
                    icon={<StarIcon fontSize="inherit" />}
                    emptyIcon={<StarBorderIcon fontSize="inherit" />}
                    disabled={submitting}
                    size="large"
                    sx={{
                      fontSize: '2rem',
                      '& .MuiRating-icon': {
                        color: '#ffc107'
                      },
                      '& .MuiRating-iconEmpty': {
                        color: '#e0e0e0'
                      },
                      '& .MuiRating-iconHover': {
                        color: '#ffb300'
                      }
                    }}
                  />

                  <TextField
                    multiline
                    rows={3}
                    placeholder="Escribe un comentario sobre esta canción (opcional)"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    disabled={submitting}
                    size="small"
                    fullWidth
                  />

                  <Button
                    variant="contained"
                    startIcon={submitting ? <CircularProgress size={16} /> : <SendIcon />}
                    onClick={handleSubmitRating}
                    disabled={submitting || currentRating === 0}
                    size="small"
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    {submitting ? 'Enviando...' : (userRating ? 'Actualizar' : 'Enviar calificación')}
                  </Button>
                </Stack>
              </Box>
            </>
          )}

          {/* Mensaje para usuarios no autenticados */}
          {!isAuthenticated && (
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Inicia sesión para calificar esta canción y agregar a favoritos
            </Typography>
          )}
        </Stack>
      </Paper>

      {/* Lista de calificaciones */}
      {showRatingsList && !compact && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Calificaciones y reseñas
          </Typography>
          
          {loadingRatings ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress size={24} />
            </Box>
          ) : ratings.length > 0 ? (
            <Stack spacing={2}>
              {ratings.map((rating) => (
                <Paper key={rating.ratingId} elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Stack spacing={1}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {rating.username?.[0]?.toUpperCase() || '?'}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="subtitle2">
                          {rating.firstName && rating.lastName 
                            ? `${rating.firstName} ${rating.lastName}` 
                            : rating.username || 'Usuario anónimo'}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <MuiRating
                            value={rating.rating}
                            readOnly
                            size="small"
                            icon={<StarIcon fontSize="inherit" />}
                            emptyIcon={<StarBorderIcon fontSize="inherit" />}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(rating.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    {rating.reviewComment && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {rating.reviewComment}
                      </Typography>
                    )}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
              Aún no hay calificaciones para esta canción
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SongRating;