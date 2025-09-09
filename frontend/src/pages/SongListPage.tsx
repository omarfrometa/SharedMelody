import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Rating,
  alpha,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewList as ListViewIcon,
  ViewModule as GridViewIcon,
  PlayArrow as PlayIcon,
  MusicNote as MusicIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { SongDetailed, PaginatedResponse } from '../types/song';
import { songService } from '../services/songService';

const SongListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();
  
  const [songs, setSongs] = useState<SongDetailed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filtros y búsqueda
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    genre: searchParams.get('genre') || '',
    language: searchParams.get('language') || '',
    sortBy: searchParams.get('sortBy') || 'created_at',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });
  
  // Paginación
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [totalSongs, setTotalSongs] = useState(0);

  useEffect(() => {
    loadSongs();
  }, [page, filters]);

  useEffect(() => {
    // Actualizar URL con parámetros de búsqueda
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.genre) params.set('genre', filters.genre);
    if (filters.language) params.set('language', filters.language);
    if (filters.sortBy !== 'created_at') params.set('sortBy', filters.sortBy);
    if (filters.sortOrder !== 'desc') params.set('sortOrder', filters.sortOrder);
    if (page !== 1) params.set('page', page.toString());
    
    setSearchParams(params);
  }, [filters, page, setSearchParams]);

  const loadSongs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: PaginatedResponse<SongDetailed> = await songService.getSongs({
        search: filters.search,
        genreId: filters.genre,
        language: filters.language,
        sortBy: filters.sortBy as any,
        sortOrder: filters.sortOrder as any,
        page,
        limit: 12
      });
      
      setSongs(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalSongs(response.pagination.total);
    } catch (err: any) {
      setError(err.message || 'Error al cargar canciones');
      
      // Datos de demostración en caso de error
      const mockSongs: SongDetailed[] = [
        {
          songId: '1',
          title: 'Bohemian Rhapsody',
          artistName: 'Queen',
          album: 'A Night at the Opera',
          releaseYear: 1975,
          lyrics: 'Is this the real life...',
          lyricsFormat: 'html',
          durationSeconds: 355,
          language: 'en',
          explicitContent: false,
          uploadedBy: 'user1',
          uploadedByUsername: 'musiclover',
          uploadedByName: 'Juan Pérez',
          isCollaboration: false,
          status: 'approved',
          viewCount: 1250,
          downloadCount: 89,
          likeCount: 156,
          averageRating: 4.7,
          ratingCount: 23,
          tags: ['rock', 'classic'],
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        },
        {
          songId: '2',
          title: 'Imagine',
          artistName: 'John Lennon',
          album: 'Imagine',
          releaseYear: 1971,
          lyrics: 'Imagine there\'s no heaven...',
          lyricsFormat: 'html',
          durationSeconds: 183,
          language: 'en',
          explicitContent: false,
          uploadedBy: 'user2',
          uploadedByUsername: 'peacemaker',
          uploadedByName: 'María García',
          isCollaboration: false,
          status: 'approved',
          viewCount: 890,
          downloadCount: 67,
          likeCount: 123,
          averageRating: 4.9,
          ratingCount: 18,
          tags: ['pop', 'peace'],
          createdAt: '2024-01-14T15:20:00Z',
          updatedAt: '2024-01-14T15:20:00Z'
        }
      ];
      
      setSongs(mockSongs);
      setTotalPages(1);
      setTotalSongs(mockSongs.length);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handleSearch = () => {
    setPage(1);
    loadSongs();
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleSongClick = (songId: string) => {
    navigate(`/songs/${songId}`);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Box>
        {/* Header Section */}
        <Box sx={{
          mb: 4,
          p: 4,
          mx: { xs: 1, sm: 2 }, // Espaciado horizontal responsivo
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          borderRadius: 3,
          textAlign: 'center'
        }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Biblioteca Musical
        </Typography>

        <Typography variant="h6" color="text.secondary" sx={{ mb: 3, fontWeight: 300 }}>
          Explora nuestra colección de canciones subidas por la comunidad
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={() => navigate('/upload')}
            sx={{ borderRadius: 3, px: 4 }}
          >
            Subir Canción
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/request')}
            sx={{ borderRadius: 3, px: 4 }}
          >
            Solicitar Canción
          </Button>
        </Box>
      </Box>

        {/* Filtros y búsqueda */}
        <Paper sx={{
          p: 3,
          mb: 4,
          mx: { xs: 1, sm: 2 }, // Espaciado horizontal responsivo
          borderRadius: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Box sx={{ minWidth: 300, flex: '1 1 300px' }}>
            <TextField
              fullWidth
              label="Buscar canciones"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearch}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              placeholder="Título, artista, álbum..."
            />
          </Box>
          
          <Box sx={{ minWidth: 150 }}>
            <FormControl fullWidth>
              <InputLabel>Género</InputLabel>
              <Select
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
                label="Género"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="rock">Rock</MenuItem>
                <MenuItem value="pop">Pop</MenuItem>
                <MenuItem value="jazz">Jazz</MenuItem>
                <MenuItem value="classical">Clásica</MenuItem>
                <MenuItem value="folk">Folk</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ minWidth: 150 }}>
            <FormControl fullWidth>
              <InputLabel>Idioma</InputLabel>
              <Select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                label="Idioma"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="es">Español</MenuItem>
                <MenuItem value="en">Inglés</MenuItem>
                <MenuItem value="fr">Francés</MenuItem>
                <MenuItem value="it">Italiano</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ minWidth: 150 }}>
            <FormControl fullWidth>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                label="Ordenar por"
              >
                <MenuItem value="created_at">Fecha</MenuItem>
                <MenuItem value="title">Título</MenuItem>
                <MenuItem value="artist">Artista</MenuItem>
                <MenuItem value="view_count">Vistas</MenuItem>
                <MenuItem value="like_count">Likes</MenuItem>
                <MenuItem value="average_rating">Valoración</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ minWidth: 100 }}>
            <Box display="flex" gap={1}>
              <IconButton
                onClick={() => setViewMode('grid')}
                color={viewMode === 'grid' ? 'primary' : 'default'}
              >
                <GridViewIcon />
              </IconButton>
              <IconButton
                onClick={() => setViewMode('list')}
                color={viewMode === 'list' ? 'primary' : 'default'}
              >
                <ListViewIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Paper>

        {/* Resultados */}
        <Box sx={{
          mb: 3,
          px: { xs: 1, sm: 2 } // Espaciado horizontal responsivo
        }}>
          <Typography variant="body2" color="text.secondary">
            {loading ? 'Cargando...' : `${totalSongs} canciones encontradas`}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{
            mb: 3,
            mx: { xs: 1, sm: 2 } // Espaciado horizontal responsivo
          }}>
            {error}
          </Alert>
        )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
        ) : viewMode === 'grid' ? (
          // Vista de cuadrícula
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 3,
            px: { xs: 1, sm: 2 } // Espaciado horizontal responsivo
          }}>
          {songs.map((song) => (
            <Card
              key={song.songId}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderRadius: 3,
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`
                }
              }}
              onClick={() => handleSongClick(String(song.songId))}
            >
              <CardMedia
                component="div"
                sx={{
                  height: 200,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <MusicIcon sx={{ fontSize: 60, color: '#ffffff', opacity: 0.8 }} />
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                  size="small"
                >
                  <PlayIcon />
                </IconButton>
              </CardMedia>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" noWrap gutterBottom fontWeight="bold">
                  {song.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap gutterBottom>
                  {song.artistName}
                </Typography>
                {song.album && (
                  <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ mb: 1 }}>
                    {song.album}
                  </Typography>
                )}

                <Box display="flex" alignItems="center" mt={2} mb={2}>
                  <Rating value={song.averageRating || 0} precision={0.1} size="small" readOnly />
                  <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                    ({song.ratingCount || 0})
                  </Typography>
                </Box>

                <Box display="flex" gap={0.5} mb={2} flexWrap="wrap">
                  {song.tags?.slice(0, 2).map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{
                        fontSize: '0.7rem',
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main
                      }}
                    />
                  ))}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatDuration(song.durationSeconds || 0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {song.viewCount || 0} vistas
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
        ) : (
          // Vista de lista
          <Paper sx={{
            mx: { xs: 1, sm: 2 } // Espaciado horizontal responsivo
          }}>
            <List sx={{
              px: { xs: 1, sm: 2 } // Espaciado interno del List
            }}>
              {songs.map((song, index) => (
                <ListItem
                  key={song.songId}
                  divider={index < songs.length - 1}
                  sx={{
                    cursor: 'pointer',
                    px: { xs: 2, sm: 3 }, // Espaciado horizontal responsivo
                    py: 2, // Espaciado vertical
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                  onClick={() => handleSongClick(String(song.songId))}
                >
                <ListItemAvatar>
                  <Avatar>
                    <MusicIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="body1" fontWeight="medium">
                        {song.title}
                      </Typography>
                      <Rating value={song.averageRating} precision={0.1} size="small" readOnly />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {song.artistName} {song.album && `• ${song.album}`}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        <Typography variant="caption">
                          {formatDuration(song.durationSeconds || 0)}
                        </Typography>
                        <Typography variant="caption">•</Typography>
                        <Typography variant="caption">
                          {song.viewCount} vistas
                        </Typography>
                        <Typography variant="caption">•</Typography>
                        <Typography variant="caption">
                          {song.likeCount} likes
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <IconButton>
                  <PlayIcon />
                </IconButton>
              </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={4} px={{ xs: 1, sm: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}

        {songs.length === 0 && !loading && (
          <Box textAlign="center" py={8} px={{ xs: 1, sm: 2 }}>
          <MusicIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No se encontraron canciones
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Intenta ajustar los filtros de búsqueda o explora otras categorías.
          </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default SongListPage;
