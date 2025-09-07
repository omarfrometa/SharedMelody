import {
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Paper,
  alpha,
  useTheme,
  Fade,
  Skeleton
} from '@mui/material';
import {
  Search as SearchIcon,
  PlayArrow as PlayIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Add as AddIcon,
  TrendingUp as TrendingIcon,
  MusicNote as MusicNoteIcon,
  Album as AlbumIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { songService } from '../services/songService';
import { statsService, TopSong, TopArtist } from '../services/statsService';
import { SongDetailed, PaginatedResponse } from '../types/song';

const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
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

  const { data: topArtists, isLoading: isLoadingTopArtists } = useQuery<TopArtist[], Error>({
    queryKey: ['topArtists'],
    queryFn: () => statsService.getTopArtists(5),
  });

  const songs = songsResponse?.data || [];

  const handleSearch = () => setSearch(query);

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{
        textAlign: 'center',
        mb: 6,
        py: 4,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23000" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.5
        }} />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            SharedMelody
          </Typography>

          <Typography
            variant="h5"
            color="text.secondary"
            gutterBottom
            sx={{ mb: 4, fontWeight: 300 }}
          >
            Descubre, comparte y colabora en la música que amas
          </Typography>

          {/* Search Bar */}
          <Paper
            elevation={0}
            sx={{
              p: 1,
              display: 'flex',
              alignItems: 'center',
              maxWidth: 600,
              mx: 'auto',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: 3,
              '&:hover': {
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`
              },
              transition: 'all 0.3s ease'
            }}
          >
            <TextField
              fullWidth
              placeholder="Buscar canciones, artistas, géneros..."
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
                  sx: { px: 2, fontSize: '1.1rem' }
                }
              }}
            />
            <IconButton
              onClick={handleSearch}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <SearchIcon />
            </IconButton>
          </Paper>

          {/* Action Buttons */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => navigate('/request')}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`
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
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              Subir Canción
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Stats Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 3
        }}>
          <Card sx={{
            textAlign: 'center',
            p: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: '#ffffff'
          }}>
            <TrendingIcon sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h4" fontWeight="bold">{songs.length}</Typography>
            <Typography variant="body1">Canciones Disponibles</Typography>
          </Card>

          <Card sx={{
            textAlign: 'center',
            p: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
            color: '#ffffff'
          }}>
            <MusicNoteIcon sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h4" fontWeight="bold">
              {songs.reduce((acc, song) => acc + (song.playsCount || 0), 0)}
            </Typography>
            <Typography variant="body1">Total Reproducciones</Typography>
          </Card>

          <Card sx={{
            textAlign: 'center',
            p: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
            color: '#ffffff'
          }}>
            <AlbumIcon sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h4" fontWeight="bold">
              {new Set(songs.map(song => song.genreName)).size}
            </Typography>
            <Typography variant="body1">Géneros Musicales</Typography>
          </Card>
        </Box>
      </Box>

      {/* Top Songs Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
          🎵 Canciones Más Vistas
        </Typography>

        {isLoadingTopSongs ? (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' },
            gap: 2
          }}>
            {[...Array(5)].map((_, index) => (
              <Card key={index} sx={{ borderRadius: 2 }}>
                <Skeleton variant="rectangular" height={120} />
                <CardContent sx={{ p: 2 }}>
                  <Skeleton variant="text" height={24} />
                  <Skeleton variant="text" height={20} width="60%" />
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' },
            gap: 2
          }}>
            {(topSongs || []).slice(0, 10).map((song, index) => (
              <Card
                key={song.songId}
                sx={{
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`
                  }
                }}
                onClick={() => navigate(`/songs/${song.songId}`)}
              >
                <Box sx={{
                  height: 120,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <MusicNoteIcon sx={{ fontSize: 40, color: '#ffffff', opacity: 0.8 }} />
                  <Box sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Typography variant="caption" fontWeight="bold" color="primary">
                      {index + 1}
                    </Typography>
                  </Box>
                </Box>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" noWrap>
                    {song.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {song.artistName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <PlayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {song.playsCount} vistas
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {/* Top Artists Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
          🎤 Artistas Más Vistos
        </Typography>

        {isLoadingTopArtists ? (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
            gap: 3
          }}>
            {[...Array(5)].map((_, index) => (
              <Card key={index} sx={{ borderRadius: 3, p: 3, textAlign: 'center' }}>
                <Skeleton variant="circular" width={80} height={80} sx={{ mx: 'auto', mb: 2 }} />
                <Skeleton variant="text" height={24} />
                <Skeleton variant="text" height={20} width="60%" sx={{ mx: 'auto' }} />
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
                  borderRadius: 3,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${alpha(theme.palette.secondary.main, 0.15)}`
                  }
                }}
                onClick={() => navigate(`/artists/${artist.authorId}`)}
              >
                <Box sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  position: 'relative'
                }}>
                  <MusicNoteIcon sx={{ fontSize: 32, color: '#ffffff' }} />
                  <Box sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: theme.palette.primary.main,
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Typography variant="caption" fontWeight="bold">
                      {index + 1}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h6" fontWeight="bold" noWrap>
                  {artist.authorName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {artist.totalSongs} canciones
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {artist.totalPlays} vistas totales
                </Typography>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {/* Songs Section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            {search ? `Resultados para "${search}"` : 'Canciones Populares'}
          </Typography>
          <Button
            variant="text"
            onClick={() => navigate('/songs')}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Ver todas →
          </Button>
        </Box>

        {isLoading ? (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 3
          }}>
            {[...Array(6)].map((_, index) => (
              <Card key={index} sx={{ borderRadius: 3 }}>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={24} width="60%" />
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 3
          }}>
            {songs.slice(0, 6).map((song, index) => (
              <Fade key={song.songId} in={true} timeout={300 + index * 100}>
                <Card sx={{
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`
                  }
                }}>
                  <Box sx={{
                    height: 200,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <MusicNoteIcon sx={{ fontSize: 64, color: '#ffffff', opacity: 0.8 }} />
                    <Box sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      display: 'flex',
                      gap: 1
                    }}>
                      <Chip
                        label={song.genreName || 'Sin género'}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: '#ffffff',
                          fontWeight: 500
                        }}
                      />
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                      {song.title || 'Sin título'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
                      {song.artistName || 'Artista desconocido'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PlayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {song.playsCount || 0}
                        </Typography>
                      </Box>
                      {song.albumName && (
                        <Chip
                          label={song.albumName}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  </CardContent>

                  <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
                    <Button
                      size="small"
                      startIcon={<PlayIcon />}
                      sx={{ textTransform: 'none' }}
                    >
                      Reproducir
                    </Button>
                    <IconButton size="small">
                      <FavoriteIcon />
                    </IconButton>
                    <IconButton size="small">
                      <ShareIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Fade>
            ))}
          </Box>
        )}

        {songs.length === 0 && !isLoading && (
          <Paper sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.5)
          }}>
            <MusicNoteIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {search ? 'No se encontraron canciones' : 'No hay canciones disponibles'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {search ? 'Intenta con otros términos de búsqueda' : 'Sé el primero en subir una canción'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/upload')}
              sx={{ mt: 2, borderRadius: 2 }}
            >
              Subir Canción
            </Button>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default HomePage;