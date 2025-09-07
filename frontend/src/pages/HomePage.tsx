import {
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  Card,
  CardContent,
  Chip,
  Paper,
  Fade,
  Skeleton,
  Container,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  PlayArrow as PlayIcon,
  Add as AddIcon,
  MusicNote as MusicNoteIcon,
  GraphicEq as GraphicEqIcon,
  Headphones as HeadphonesIcon,
  Piano as PianoIcon,
  Mic as MicIcon,
  LibraryMusic as LibraryMusicIcon,
  Waves as WavesIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { songService } from '../services/songService';
import { statsService, TopSong, TopArtist } from '../services/statsService';
import { SongDetailed, PaginatedResponse } from '../types/song';
import { customStyles, colors } from '../theme/theme';

const HomePage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');

  const { data: songsResponse, isLoading } = useQuery<PaginatedResponse<SongDetailed>, Error>({
    queryKey: ['songs', search],
    queryFn: () => search ? songService.searchSongs(search) : songService.getSongs(),
  });

  const { data: topSongs, isLoading: isLoadingTopSongs } = useQuery<TopSong[], Error>({
    queryKey: ['topSongs'],
    queryFn: () => statsService.getTopSongs(10),
  });

  const songs = songsResponse?.data || [];

  const handleSearch = () => setSearch(query);

  // Premium stats for the hero section
  const stats = [
    { 
      icon: <LibraryMusicIcon sx={{ fontSize: 40 }} />,
      value: songs.length.toLocaleString(),
      label: 'Canciones Premium',
      color: colors.music.melody,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    { 
      icon: <HeadphonesIcon sx={{ fontSize: 40 }} />,
      value: songs.reduce((acc, song) => acc + (song.playsCount || 0), 0).toLocaleString(),
      label: 'Reproducciones Totales',
      color: colors.music.rhythm,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    { 
      icon: <MicIcon sx={{ fontSize: 40 }} />,
      value: new Set(songs.map(song => song.genreName)).size,
      label: 'Géneros Únicos',
      color: colors.music.harmony,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    }
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: colors.gradient.dark,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 🌟 ANIMATED BACKGROUND PARTICLES */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(34, 211, 238, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.2) 0%, transparent 50%)
        `,
        animation: 'float 8s ease-in-out infinite',
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' }
        }
      }} />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2, py: 4 }}>
        {/* 🚀 REVOLUTIONARY HERO SECTION */}
        <Box sx={{
          textAlign: 'center',
          py: { xs: 8, md: 12 },
          position: 'relative'
        }}>
          {/* Floating Music Icons */}
          <Box sx={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            animation: 'pulse 3s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { transform: 'scale(1)', opacity: 0.7 },
              '50%': { transform: 'scale(1.2)', opacity: 1 }
            }
          }}>
            <PianoIcon sx={{ fontSize: 40, color: colors.music.melody, opacity: 0.6 }} />
          </Box>
          <Box sx={{
            position: 'absolute',
            top: '20%',
            right: '15%',
            animation: 'pulse 4s ease-in-out infinite 1s',
          }}>
            <GraphicEqIcon sx={{ fontSize: 35, color: colors.music.rhythm, opacity: 0.6 }} />
          </Box>
          <Box sx={{
            position: 'absolute',
            bottom: '10%',
            left: '20%',
            animation: 'pulse 3.5s ease-in-out infinite 2s',
          }}>
            <WavesIcon sx={{ fontSize: 45, color: colors.music.bass, opacity: 0.6 }} />
          </Box>

          {/* Main Title with Gradient Animation */}
          <Typography
            variant="h1"
            component="h1"
            gutterBottom
            sx={{
              ...customStyles.gradientText,
              mb: 3,
              textShadow: '0 4px 20px rgba(168, 85, 247, 0.3)',
              animation: 'glow 2s ease-in-out infinite alternate',
              '@keyframes glow': {
                '0%': { textShadow: '0 4px 20px rgba(168, 85, 247, 0.3)' },
                '100%': { textShadow: '0 8px 40px rgba(168, 85, 247, 0.6)' }
              }
            }}
          >
            SharedMelody
          </Typography>

          <Typography
            variant="h4"
            sx={{
              mb: 6,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 300,
              letterSpacing: '0.02em'
            }}
          >
            La plataforma musical más avanzada del mundo
          </Typography>

          {/* 🔍 FUTURISTIC SEARCH BAR */}
          <Box sx={{
            maxWidth: 700,
            mx: 'auto',
            mb: 6,
            position: 'relative'
          }}>
            <Paper
              elevation={0}
              sx={{
                ...customStyles.glassCard,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.12)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 20px 60px rgba(168, 85, 247, 0.3)'
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <TextField
                fullWidth
                placeholder="Descubre tu próxima canción favorita..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSearch();
                  }
                }}
                variant="standard"
                slotProps={{
                  input: {
                    disableUnderline: true,
                    sx: { 
                      px: 3, 
                      py: 1,
                      fontSize: '1.2rem',
                      color: 'white',
                      '&::placeholder': {
                        color: 'rgba(255,255,255,0.6)'
                      }
                    }
                  }
                }}
              />
              <IconButton
                onClick={handleSearch}
                sx={{
                  ...customStyles.floatingButton,
                  width: 56,
                  height: 56,
                  mx: 1
                }}
              >
                <SearchIcon sx={{ fontSize: 24 }} />
              </IconButton>
            </Paper>

            {/* Search suggestions floating */}
            <Box sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              mt: 1,
              display: 'flex',
              gap: 1,
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {['Rock', 'Jazz', 'Pop', 'Classical', 'Blues'].map((genre, index) => (
                <Chip
                  key={genre}
                  label={genre}
                  onClick={() => {
                    setQuery(genre);
                    setSearch(genre);
                  }}
                  sx={{
                    ...customStyles.glassCard,
                    animation: `slideUp 0.6s ease-out ${index * 0.1}s both`,
                    '@keyframes slideUp': {
                      '0%': { opacity: 0, transform: 'translateY(20px)' },
                      '100%': { opacity: 1, transform: 'translateY(0)' }
                    }
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* 🎯 ACTION BUTTONS WITH PREMIUM EFFECTS */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            justifyContent="center"
            sx={{ mb: 8 }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => navigate('/request')}
              sx={{
                ...customStyles.floatingButton,
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                background: colors.gradient.primary,
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  transition: 'left 0.6s',
                },
                '&:hover::after': {
                  left: '100%',
                }
              }}
            >
              Solicitar Canción
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<MusicNoteIcon />}
              onClick={() => navigate('/upload')}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                borderRadius: '50px',
                border: '2px solid rgba(255,255,255,0.3)',
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  border: `2px solid ${colors.secondary[400]}`,
                  background: 'rgba(34, 211, 238, 0.15)',
                  transform: 'translateY(-2px) scale(1.02)',
                  boxShadow: '0 12px 40px rgba(34, 211, 238, 0.4)'
                }
              }}
            >
              Subir Canción
            </Button>
          </Stack>
        </Box>

        {/* 📊 PREMIUM STATS SECTION */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 4,
          mb: 8
        }}>
          {stats.map((stat, index) => (
            <Box key={index}>
              <Card
                sx={{
                  ...customStyles.glassCard,
                  p: 4,
                  textAlign: 'center',
                  background: stat.gradient,
                  border: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: `slideIn 0.8s ease-out ${index * 0.2}s both`,
                  '@keyframes slideIn': {
                    '0%': { opacity: 0, transform: 'translateY(30px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' }
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                  }
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{
                    mb: 3,
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    animation: 'bounce 2s ease-in-out infinite',
                    '@keyframes bounce': {
                      '0%, 100%': { transform: 'translateY(0)' },
                      '50%': { transform: 'translateY(-10px)' }
                    }
                  }}>
                    {stat.icon}
                  </Box>
                  <Typography 
                    variant="h3" 
                    fontWeight="900" 
                    sx={{ 
                      mb: 1, 
                      color: 'white',
                      textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 500
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Card>
            </Box>
          ))}
        </Box>

        {/* 🎵 TOP SONGS SECTION */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              ...customStyles.gradientText,
              mb: 6,
              textAlign: 'center',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -16,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 100,
                height: 4,
                background: colors.gradient.primary,
                borderRadius: 2
              }
            }}
          >
            🎵 Éxitos del Momento
          </Typography>

          {isLoadingTopSongs ? (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' },
              gap: 3
            }}>
              {[...Array(10)].map((_, index) => (
                <Card key={index} sx={{ ...customStyles.glassCard }}>
                  <Skeleton variant="rectangular" height={160} />
                  <CardContent sx={{ p: 3 }}>
                    <Skeleton variant="text" height={28} />
                    <Skeleton variant="text" height={24} width="70%" />
                    <Skeleton variant="text" height={20} width="50%" />
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' },
              gap: 3
            }}>
              {(topSongs || []).slice(0, 10).map((song, index) => (
                <Fade key={song.songId} in={true} timeout={400 + index * 100}>
                  <Card
                    sx={{
                      ...customStyles.glassCard,
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      animation: `slideUp 0.6s ease-out ${index * 0.1}s both`,
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.03)',
                        boxShadow: '0 25px 70px rgba(168, 85, 247, 0.4)',
                      },
                      '@keyframes slideUp': {
                        '0%': { opacity: 0, transform: 'translateY(30px)' },
                        '100%': { opacity: 1, transform: 'translateY(0)' }
                      }
                    }}
                    onClick={() => navigate(`/songs/${song.songId}`)}
                  >
                    <Box sx={{
                      height: 160,
                      background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.secondary[400]} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <MusicNoteIcon sx={{ 
                        fontSize: 48, 
                        color: 'white', 
                        opacity: 0.8,
                        animation: 'float 3s ease-in-out infinite'
                      }} />
                      
                      {/* Ranking Badge */}
                      <Box sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                      }}>
                        <Typography variant="caption" fontWeight="900" color="primary">
                          #{index + 1}
                        </Typography>
                      </Box>

                      {/* Play Button Overlay */}
                      <Box sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'all 0.3s ease',
                        '&:hover': { opacity: 1 }
                      }}>
                        <IconButton
                          sx={{
                            background: colors.gradient.primary,
                            color: 'white',
                            width: 56,
                            height: 56,
                            '&:hover': {
                              transform: 'scale(1.1)',
                            }
                          }}
                        >
                          <PlayIcon sx={{ fontSize: 28 }} />
                        </IconButton>
                      </Box>
                    </Box>

                    <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                      <Typography 
                        variant="h6" 
                        fontWeight="700" 
                        noWrap 
                        sx={{ 
                          mb: 1,
                          color: 'white',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)' 
                        }}
                      >
                        {song.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        noWrap 
                        sx={{ 
                          mb: 2,
                          color: 'rgba(255,255,255,0.8)'
                        }}
                      >
                        {song.artistName}
                      </Typography>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        color: 'rgba(255,255,255,0.7)'
                      }}>
                        <PlayIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption">
                          {song.playsCount?.toLocaleString()} vistas
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              ))}
            </Box>
          )}
        </Box>

        {/* Empty state for no results */}
        {songs.length === 0 && !isLoading && (
          <Card sx={{
            ...customStyles.glassCard,
            p: 8,
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.03)'
          }}>
            <MusicNoteIcon sx={{ 
              fontSize: 80, 
              color: 'rgba(255,255,255,0.3)', 
              mb: 3,
              animation: 'pulse 2s ease-in-out infinite'
            }} />
            <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>
              {search ? 'No se encontraron canciones' : 'No hay canciones disponibles'}
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.6)', mb: 4 }}>
              {search ? 'Intenta con otros términos de búsqueda' : 'Sé el primero en subir una canción'}
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => navigate('/upload')}
              sx={{
                ...customStyles.floatingButton,
                px: 6,
                py: 2
              }}
            >
              Subir Tu Primera Canción
            </Button>
          </Card>
        )}

      </Container>
    </Box>
  );
};

export default HomePage;