import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  Avatar,
  IconButton,
  useTheme,
  alpha,
  InputAdornment,
  Skeleton,
  Pagination,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  PlayArrow as PlayIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Verified as VerifiedIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { songService } from '../services/songService';

interface Song {
  songId: string;
  title: string;
  artist: string;
  genre: string;
  views: number;
  imageUrl?: string;
  isVerified?: boolean;
  difficulty?: 'Fácil' | 'Intermedio' | 'Difícil';
  duration?: string;
}

const CifraClubSongListPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [page, setPage] = useState(1);

  const genres = ['Todos', 'Rock', 'Pop', 'Música Religiosa', 'Reggaeton', 'Folk', 'Blues', 'Jazz'];
  const sortOptions = [
    { value: 'popularity', label: 'Más populares' },
    { value: 'newest', label: 'Más recientes' },
    { value: 'title', label: 'Título A-Z' },
    { value: 'artist', label: 'Artista A-Z' }
  ];

  useEffect(() => {
    const loadSongs = async () => {
      try {
        setLoading(true);
        const response = await songService.getSongs();
        // Simular datos adicionales para el ejemplo
        const songsWithData = (response.data || []).map((song: any, index: number) => ({
          ...song,
          views: Math.floor(Math.random() * 50000) + 1000,
          isVerified: index < 5,
          difficulty: ['Fácil', 'Intermedio', 'Difícil'][Math.floor(Math.random() * 3)],
          duration: `${Math.floor(Math.random() * 3) + 2}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
        }));
        setSongs(songsWithData);
      } catch (error) {
        console.error('Error loading songs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSongs();
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchValue.trim()) {
      setSearchParams({ search: searchValue.trim() });
    } else {
      setSearchParams({});
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k visualizaciones`;
    }
    return `${views} visualizaciones`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return theme.palette.success.main;
      case 'Intermedio': return theme.palette.warning.main;
      case 'Difícil': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const filteredSongs = songs.filter(song => {
    const matchesSearch = !searchValue ||
      (song.title && song.title.toLowerCase().includes(searchValue.toLowerCase())) ||
      (song.artist && song.artist.toLowerCase().includes(searchValue.toLowerCase()));
    const matchesGenre = !selectedGenre || selectedGenre === 'Todos' || song.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header con filtros */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 3,
            color: theme.palette.text.primary
          }}
        >
          Explorar Canciones
        </Typography>

        {/* Barra de búsqueda y filtros */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
            mb: 3
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
            <Box sx={{ flex: 2 }}>
              <Box component="form" onSubmit={handleSearch}>
                <TextField
                  fullWidth
                  placeholder="Buscar canciones o artistas..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ minWidth: 150 }}>
              <FormControl fullWidth>
                <InputLabel>Género</InputLabel>
                <Select
                  value={selectedGenre}
                  label="Género"
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {genres.map((genre) => (
                    <MenuItem key={genre} value={genre === 'Todos' ? '' : genre}>
                      {genre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ minWidth: 150 }}>
              <FormControl fullWidth>
                <InputLabel>Ordenar por</InputLabel>
                <Select
                  value={sortBy}
                  label="Ordenar por"
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <IconButton
                  onClick={() => setViewMode('list')}
                  sx={{
                    backgroundColor: viewMode === 'list' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    color: viewMode === 'list' ? theme.palette.primary.main : theme.palette.text.secondary,
                  }}
                >
                  <ViewListIcon />
                </IconButton>
                <IconButton
                  onClick={() => setViewMode('grid')}
                  sx={{
                    backgroundColor: viewMode === 'grid' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    color: viewMode === 'grid' ? theme.palette.primary.main : theme.palette.text.secondary,
                  }}
                >
                  <ViewModuleIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Resultados */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
            {filteredSongs.length} canciones encontradas
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {searchValue && (
              <Chip
                label={`Búsqueda: "${searchValue}"`}
                onDelete={() => {
                  setSearchValue('');
                  setSearchParams({});
                }}
                sx={{ borderRadius: 2 }}
              />
            )}
            {selectedGenre && (
              <Chip
                label={`Género: ${selectedGenre}`}
                onDelete={() => setSelectedGenre('')}
                sx={{ borderRadius: 2 }}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Lista de canciones */}
      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: viewMode === 'grid' ? 'repeat(2, 1fr)' : '1fr', md: viewMode === 'grid' ? 'repeat(3, 1fr)' : '1fr' }, gap: 2 }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Box key={index}>
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={20} />
                  <Skeleton variant="text" width="30%" height={16} />
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: viewMode === 'grid' ? 'repeat(2, 1fr)' : '1fr', md: viewMode === 'grid' ? 'repeat(3, 1fr)' : '1fr' }, gap: 2 }}>
          {filteredSongs.map((song) => (
            <Box key={song.songId}>
              <Card
                sx={{
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
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          fontSize: '1.1rem',
                          mb: 0.5,
                          color: theme.palette.text.primary,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        {song.title || 'Título desconocido'}
                        {song.isVerified && (
                          <VerifiedIcon
                            sx={{
                              fontSize: 16,
                              color: theme.palette.primary.main
                            }}
                          />
                        )}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 16 }} />
                        {song.artist || 'Artista desconocido'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        {song.genre && (
                          <Chip
                            label={song.genre}
                            size="small"
                            sx={{
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              borderRadius: 1,
                              fontSize: '0.75rem'
                            }}
                          />
                        )}
                        {song.difficulty && (
                          <Chip
                            label={song.difficulty}
                            size="small"
                            sx={{
                              backgroundColor: alpha(getDifficultyColor(song.difficulty), 0.1),
                              color: getDifficultyColor(song.difficulty),
                              borderRadius: 1,
                              fontSize: '0.75rem'
                            }}
                          />
                        )}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: '0.75rem'
                        }}
                      >
                        {formatViews(song.views || 0)} • {song.duration || 'N/A'}
                      </Typography>
                    </Box>
                    <IconButton
                      sx={{
                        color: theme.palette.text.secondary,
                        '&:hover': {
                          color: theme.palette.primary.main,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
                        }
                      }}
                    >
                      <PlayIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {/* Paginación */}
      {filteredSongs.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={Math.ceil(filteredSongs.length / 12)}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
            size="large"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 2,
              }
            }}
          />
        </Box>
      )}
    </Container>
  );
};

export default CifraClubSongListPage;
