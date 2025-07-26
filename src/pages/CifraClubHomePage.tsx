import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Chip,
  Button,
  alpha,
  useTheme,
  Paper,
  IconButton,
  Skeleton,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Verified as VerifiedIcon,
  TrendingUp as TrendingIcon,
  MusicNote as MusicNoteIcon,
  Event as EventIcon,
  Album as AlbumIcon,
  NewReleases as NewReleasesIcon,
  Star as StarIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { songService } from '../services/songService';
import { statsService, TopSong, TopArtist } from '../services/statsService';

// Datos de los banners del carrusel
const banners = [
  {
    id: 1,
    type: 'song',
    title: 'Sparks',
    subtitle: 'Coldplay',
    description: 'Aprende a tocar esta increíble canción',
    buttonText: 'Ver Acordes',
    buttonAction: '/songs',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: <PlayIcon />
  },
  {
    id: 2,
    type: 'concert',
    title: 'Concierto Exclusivo',
    subtitle: 'The Beatles Tribute',
    description: 'No te pierdas este evento único - 15 de Marzo',
    buttonText: 'Comprar Boletos',
    buttonAction: '/events',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=300&fit=crop',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: <EventIcon />
  },
  {
    id: 3,
    type: 'album',
    title: 'Nuevo Álbum',
    subtitle: 'Ed Sheeran - Subtract',
    description: 'Ya disponible con todos los acordes',
    buttonText: 'Explorar Álbum',
    buttonAction: '/albums',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: <AlbumIcon />
  },
  {
    id: 4,
    type: 'new-song',
    title: 'Nuevo Lanzamiento',
    subtitle: 'Taylor Swift - Karma',
    description: 'Aprende la canción más popular del momento',
    buttonText: 'Tocar Ahora',
    buttonAction: '/songs/new',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=300&fit=crop',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    icon: <NewReleasesIcon />
  },
  {
    id: 5,
    type: 'featured',
    title: 'Artista Destacado',
    subtitle: 'John Mayer',
    description: 'Descubre su colección completa de canciones',
    buttonText: 'Ver Perfil',
    buttonAction: '/artists/john-mayer',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    icon: <StarIcon />
  }
];

const CifraClubHomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Estado del carrusel
  const [currentBanner, setCurrentBanner] = useState(0);

  // Queries para obtener datos reales de la base de datos
  const { data: topSongs, isLoading: isLoadingTopSongs } = useQuery<TopSong[], Error>({
    queryKey: ['topSongs'],
    queryFn: () => statsService.getTopSongs(10),
  });

  const { data: topArtists, isLoading: isLoadingTopArtists } = useQuery<TopArtist[], Error>({
    queryKey: ['topArtists'],
    queryFn: () => statsService.getTopArtists(5),
  });

  // Efecto para el carrusel automático
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 10000); // Cambia cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  // Función para navegar manualmente en el carrusel
  const goToBanner = (index: number) => {
    setCurrentBanner(index);
  };

  const goToPrevious = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  return (
    <Box>
      {/* Hero Section - Carrusel de Banners */}
      <Box
        sx={{
          background: banners[currentBanner].gradient,
          color: '#ffffff',
          minHeight: { xs: '500px', md: '600px' },
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          transition: 'background 0.8s ease-in-out'
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={banners[currentBanner].icon}
                  sx={{
                    color: '#ffffff',
                    borderColor: alpha('#ffffff', 0.3),
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#ffffff',
                      backgroundColor: alpha('#ffffff', 0.1)
                    }
                  }}
                >
                  {banners[currentBanner].type.toUpperCase()}
                </Button>
              </Box>
              <Typography
                variant="h1"
                key={`title-${currentBanner}`}
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  fontWeight: 800,
                  lineHeight: 1.1,
                  mb: 2,
                  opacity: 0,
                  animation: 'fadeInUp 0.8s ease-out 0.2s forwards'
                }}
              >
                {banners[currentBanner].title}
              </Typography>
              <Typography
                variant="h4"
                key={`subtitle-${currentBanner}`}
                sx={{
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  fontWeight: 400,
                  color: alpha('#ffffff', 0.9),
                  mb: 3,
                  opacity: 0,
                  animation: 'fadeInUp 0.8s ease-out 0.4s forwards'
                }}
              >
                {banners[currentBanner].subtitle}
              </Typography>
              <Typography
                variant="body1"
                key={`description-${currentBanner}`}
                sx={{
                  fontSize: '1.1rem',
                  mb: 3,
                  opacity: 0,
                  animation: 'fadeInUp 0.8s ease-out 0.6s forwards'
                }}
              >
                {banners[currentBanner].description}
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayIcon />}
                key={`button-${currentBanner}`}
                onClick={() => navigate(banners[currentBanner].buttonAction)}
                sx={{
                  backgroundColor: '#ffffff',
                  color: theme.palette.text.primary,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  opacity: 0,
                  animation: 'fadeInUp 0.8s ease-out 0.8s forwards',
                  '&:hover': {
                    backgroundColor: alpha('#ffffff', 0.9),
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
                  }
                }}
              >
                {banners[currentBanner].buttonText}
              </Button>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <Box
                  component="img"
                  src={banners[currentBanner].image}
                  alt={banners[currentBanner].title}
                  key={`image-${currentBanner}`}
                  sx={{
                    width: '100%',
                    maxWidth: { xs: 300, md: 400 },
                    height: { xs: 250, md: 320 },
                    objectFit: 'cover',
                    borderRadius: 3,
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                    opacity: 0,
                    animation: 'fadeInScale 0.8s ease-out 0.4s forwards'
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Controles del carrusel */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1,
              alignItems: 'center'
            }}
          >
            {/* Botón anterior */}
            <IconButton
              onClick={goToPrevious}
              sx={{
                color: '#ffffff',
                backgroundColor: alpha('#ffffff', 0.2),
                '&:hover': {
                  backgroundColor: alpha('#ffffff', 0.3)
                }
              }}
            >
              <ChevronLeftIcon />
            </IconButton>

            {/* Indicadores de puntos */}
            {banners.map((_, index) => (
              <Box
                key={index}
                onClick={() => goToBanner(index)}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: index === currentBanner ? '#ffffff' : alpha('#ffffff', 0.4),
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#ffffff',
                    transform: 'scale(1.2)'
                  }
                }}
              />
            ))}

            {/* Botón siguiente */}
            <IconButton
              onClick={goToNext}
              sx={{
                color: '#ffffff',
                backgroundColor: alpha('#ffffff', 0.2),
                '&:hover': {
                  backgroundColor: alpha('#ffffff', 0.3)
                }
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Container>

        {/* Estilos CSS para animaciones */}
        <style>
          {`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes fadeInScale {
              from {
                opacity: 0;
                transform: scale(0.8);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
          `}
        </style>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Los más vistos - Sección completa */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: theme.palette.text.primary
            }}
          >
            {t('home.mostViewed')}
          </Typography>

            {isLoadingTopSongs ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                {[...Array(10)].map((_, index) => (
                  <Card key={index} sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                    <Skeleton variant="text" width={40} height={40} sx={{ mr: 2 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Skeleton variant="text" height={24} />
                      <Skeleton variant="text" height={20} width="60%" />
                      <Skeleton variant="text" height={16} width="40%" />
                    </Box>
                    <Skeleton variant="circular" width={40} height={40} />
                  </Card>
                ))}
              </Box>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                {(topSongs || []).map((song, index) => (
                  <Box key={song.songId}>
                    <Card
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        cursor: 'pointer',
                        border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                          borderColor: theme.palette.primary.main
                        }
                      }}
                      onClick={() => navigate(`/songs/${song.songId}`)}
                    >
                      <Typography
                        variant="h3"
                        sx={{
                          fontSize: '2rem',
                          fontWeight: 700,
                          color: (index + 1) <= 3 ? theme.palette.primary.main : theme.palette.text.secondary,
                          mr: 2,
                          minWidth: 40
                        }}
                      >
                        {index + 1}
                      </Typography>
                      <Box sx={{ flexGrow: 1 }}>
                        <Tooltip title={song.title} arrow placement="top">
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              fontSize: '1.1rem',
                              mb: 0.5,
                              color: theme.palette.text.primary,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              cursor: 'pointer'
                            }}
                          >
                            {song.title}
                            {(index + 1) <= 5 && (
                              <VerifiedIcon
                                sx={{
                                  ml: 1,
                                  fontSize: 16,
                                  color: theme.palette.primary.main
                                }}
                              />
                            )}
                          </Typography>
                        </Tooltip>
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                            mb: 0.5
                          }}
                        >
                          {song.artistName}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: '0.75rem'
                          }}
                        >
                          {song.playsCount} vistas
                        </Typography>
                      </Box>
                      <IconButton
                        sx={{
                          color: theme.palette.text.secondary,
                          '&:hover': {
                            color: theme.palette.primary.main
                          }
                        }}
                      >
                        <PlayIcon />
                      </IconButton>
                    </Card>
                  </Box>
                ))}
              </Box>
            )}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/songs')}
              sx={{
                borderColor: alpha(theme.palette.grey[400], 0.5),
                color: theme.palette.text.primary,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05)
                }
              }}
            >
              Ver más canciones →
            </Button>
          </Box>
        </Box>

        {/* Artistas destacados - Sección separada */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: theme.palette.text.primary
            }}
          >
            {t('home.featuredArtists')}
          </Typography>

          {isLoadingTopArtists ? (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
              gap: 3
            }}>
              {[...Array(5)].map((_, index) => (
                <Card key={index} sx={{ p: 3, textAlign: 'center' }}>
                  <Skeleton variant="circular" width={64} height={64} sx={{ mx: 'auto', mb: 2 }} />
                  <Skeleton variant="text" height={24} />
                  <Skeleton variant="text" height={16} width="60%" sx={{ mx: 'auto' }} />
                  <Skeleton variant="text" height={16} width="80%" sx={{ mx: 'auto' }} />
                </Card>
              ))}
            </Box>
          ) : (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
              gap: 3
            }}>
              {(topArtists || []).map((artist, index) => (
                <Card
                  key={artist.authorId}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                      borderColor: theme.palette.primary.main
                    }
                  }}
                  onClick={() => navigate(`/artists/${artist.authorId}`)}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'inline-block',
                      mb: 2
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        backgroundColor: theme.palette.primary.main,
                        fontSize: '2rem',
                        mx: 'auto'
                      }}
                    >
                      <MusicNoteIcon />
                    </Avatar>
                    <Chip
                      label={index + 1}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        backgroundColor: theme.palette.primary.main,
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        minWidth: 24,
                        height: 24
                      }}
                    />
                  </Box>
                  <Tooltip title={artist.authorName} arrow placement="top">
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                      }}
                    >
                      {artist.authorName}
                    </Typography>
                  </Tooltip>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      mb: 0.5
                    }}
                  >
                    {artist.totalSongs} canciones
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary
                    }}
                  >
                    {artist.totalPlays} vistas totales
                  </Typography>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default CifraClubHomePage;
