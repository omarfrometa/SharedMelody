import {
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  Card,
  CardContent,
  Chip,
  Container,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  Skeleton
} from '@mui/material';
import {
  Search as SearchIcon,
  PlayArrow as PlayIcon,
  Add as AddIcon,
  MusicNote as MusicNoteIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  History as HistoryIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  LibraryMusic as LibraryMusicIcon,
  VideoLibrary as VideoLibraryIcon,
  School as SchoolIcon,
  Mic as MicIcon
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

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* CifraClub-style Layout */}
      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Left Sidebar - CifraClub style */}
        <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: '300px' } }}>
          <Box sx={{ ...customStyles.cleanCard, overflow: 'hidden' }}>
            {/* Biblioteca Section */}
            <Box sx={customStyles.sidebarSection}>
              Biblioteca
            </Box>
            <List dense>
              <ListItem
                sx={{
                  ...customStyles.sidebarLink,
                  justifyContent: 'flex-start',
                  cursor: 'pointer'
                }}
                className="active"
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <TrendingUpIcon sx={{ fontSize: 18, color: colors.primary[600] }} />
                </ListItemIcon>
                <ListItemText primary="Mais tocadas" />
              </ListItem>
              <ListItem sx={{ ...customStyles.sidebarLink, cursor: 'pointer' }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <FavoriteIcon sx={{ fontSize: 18, color: colors.secondary[500] }} />
                </ListItemIcon>
                <ListItemText primary="Favoritas" />
              </ListItem>
              <ListItem sx={{ ...customStyles.sidebarLink, cursor: 'pointer' }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <HistoryIcon sx={{ fontSize: 18, color: colors.secondary[500] }} />
                </ListItemIcon>
                <ListItemText primary="Histórico" />
              </ListItem>
              <ListItem sx={{ ...customStyles.sidebarLink, cursor: 'pointer' }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <AccessTimeIcon sx={{ fontSize: 18, color: colors.secondary[500] }} />
                </ListItemIcon>
                <ListItemText primary="Tocadas recentemente" />
              </ListItem>
            </List>

            <Divider />

            {/* Artistas Section */}
            <Box sx={customStyles.sidebarSection}>
              Artistas
            </Box>
            <List dense>
              {['Legião Urbana', 'Caetano Veloso', 'Chico Buarque', 'Tom Jobim'].map((artist, index) => (
                <ListItem key={artist} sx={{ ...customStyles.sidebarLink, cursor: 'pointer' }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PersonIcon sx={{ fontSize: 18, color: colors.secondary[500] }} />
                  </ListItemIcon>
                  <ListItemText primary={artist} />
                  <Chip
                    label={[142, 98, 87, 76][index]}
                    size="small"
                    sx={{
                      backgroundColor: colors.secondary[100],
                      color: colors.secondary[600],
                      fontSize: '0.75rem'
                    }}
                  />
                </ListItem>
              ))}
            </List>

            <Divider />

            {/* Géneros Section */}
            <Box sx={customStyles.sidebarSection}>
              Géneros
            </Box>
            <List dense>
              {['MPB', 'Rock Nacional', 'Sertanejo', 'Gospel', 'Pop Rock'].map((genre) => (
                <ListItem key={genre} sx={{ ...customStyles.sidebarLink, cursor: 'pointer' }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <MusicNoteIcon sx={{ fontSize: 18, color: colors.secondary[500] }} />
                  </ListItemIcon>
                  <ListItemText primary={genre} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Hero Banner - CifraClub style */}
          <Box sx={{ 
            ...customStyles.heroGradient,
            mb: 2,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Typography variant="h3" fontWeight={800} sx={{ mb: 2 }}>
              SharedMelody
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              Aprende a tocar tus canciones favoritas
            </Typography>
            
            <Box sx={{ maxWidth: 500, mx: 'auto', position: 'relative' }}>
              <TextField
                fullWidth
                placeholder="Busque por músicas ou artistas"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSearch();
                  }
                }}
                sx={{
                  backgroundColor: 'white',
                  borderRadius: '50px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '50px',
                    '& fieldset': {
                      border: 'none'
                    }
                  }
                }}
              />
              <IconButton
                onClick={handleSearch}
                sx={{
                  position: 'absolute',
                  right: 4,
                  top: 4,
                  backgroundColor: colors.primary[600],
                  color: 'white',
                  width: 48,
                  height: 48,
                  '&:hover': {
                    backgroundColor: colors.primary[700],
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <SearchIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Cifras mais acessadas */}
          <Box sx={{ ...customStyles.cleanCard, overflow: 'hidden' }}>
            <Box sx={{
              ...customStyles.sidebarSection,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon sx={{ color: colors.primary[600] }} />
                Cifras mais acessadas
              </Box>
              <Button size="small" sx={{ color: colors.primary[600] }}>
                Ver todas
              </Button>
            </Box>

            <List>
              {isLoading ? (
                [...Array(5)].map((_, index) => (
                  <ListItem key={index}>
                    <Skeleton variant="text" width="100%" height={60} />
                  </ListItem>
                ))
              ) : (
                songs.slice(0, 5).map((song, index) => (
                  <ListItem 
                    key={song.songId} 
                    sx={{ 
                      borderBottom: `1px solid ${colors.secondary[100]}`,
                      '&:hover': { 
                        backgroundColor: colors.secondary[50] 
                      },
                      '&:last-child': {
                        borderBottom: 'none'
                      }
                    }}
                  >
                    <Box sx={{ 
                      width: 24, 
                      color: colors.primary[600], 
                      fontWeight: 700, 
                      mr: 2 
                    }}>
                      {index + 1}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight={600} sx={{ color: colors.secondary[800] }}>
                        {song.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.secondary[600] }}>
                        {song.artistName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        sx={{ 
                          border: `1px solid ${colors.secondary[300]}`,
                          '&:hover': { 
                            backgroundColor: colors.primary[600],
                            color: 'white',
                            borderColor: colors.primary[600] 
                          }
                        }}
                      >
                        <PlayIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        sx={{ 
                          border: `1px solid ${colors.secondary[300]}`,
                          '&:hover': { 
                            backgroundColor: colors.primary[600],
                            color: 'white',
                            borderColor: colors.primary[600] 
                          }
                        }}
                      >
                        <FavoriteIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        sx={{ 
                          border: `1px solid ${colors.secondary[300]}`,
                          '&:hover': { 
                            backgroundColor: colors.primary[600],
                            color: 'white',
                            borderColor: colors.primary[600] 
                          }
                        }}
                      >
                        <ShareIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))
              )}
            </List>
          </Box>
        </Box>

        {/* Right Sidebar */}
        <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: '300px' } }}>
          {/* Estadísticas */}
          <Box sx={{ ...customStyles.cleanCard, mb: 2, overflow: 'hidden' }}>
            <Box sx={customStyles.sidebarSection}>
              Estatísticas
            </Box>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box sx={{ textAlign: 'center', p: 1, backgroundColor: colors.secondary[50], borderRadius: 1 }}>
                  <Typography variant="h5" fontWeight={700} sx={{ color: colors.primary[600] }}>
                    284K
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.secondary[600] }}>
                    Cifras
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 1, backgroundColor: colors.secondary[50], borderRadius: 1 }}>
                  <Typography variant="h5" fontWeight={700} sx={{ color: colors.primary[600] }}>
                    52K
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.secondary[600] }}>
                    Artistas
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 1, backgroundColor: colors.secondary[50], borderRadius: 1 }}>
                  <Typography variant="h5" fontWeight={700} sx={{ color: colors.primary[600] }}>
                    1.2M
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.secondary[600] }}>
                    Usuários
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 1, backgroundColor: colors.secondary[50], borderRadius: 1 }}>
                  <Typography variant="h5" fontWeight={700} sx={{ color: colors.primary[600] }}>
                    850K
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.secondary[600] }}>
                    Vídeos
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Artistas em destaque */}
          <Box sx={{ ...customStyles.cleanCard, mb: 2, overflow: 'hidden' }}>
            <Box sx={customStyles.sidebarSection}>
              Artistas em destaque
            </Box>
            <Box sx={{ p: 2 }}>
              {['Legião Urbana', 'Caetano Veloso', 'Chico Buarque', 'Tom Jobim'].map((artist, index) => (
                <Box key={artist} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  py: 1.5,
                  borderBottom: index < 3 ? `1px solid ${colors.secondary[100]}` : 'none'
                }}>
                  <Avatar sx={{ 
                    width: 40, 
                    height: 40, 
                    background: colors.gradient.primary,
                    fontWeight: 600
                  }}>
                    {artist.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ color: colors.secondary[800] }}>
                      {artist}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.secondary[600] }}>
                      {[142, 98, 87, 76][index]} cifras
                    </Typography>
                  </Box>
                  <Button 
                    size="small" 
                    variant="outlined"
                    sx={{ 
                      fontSize: '0.75rem',
                      py: 0.5,
                      px: 1.5,
                      borderColor: colors.primary[600],
                      color: colors.primary[600],
                      '&:hover': {
                        backgroundColor: colors.primary[600],
                        color: 'white'
                      }
                    }}
                  >
                    Seguir
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Tags populares */}
          <Box sx={{ ...customStyles.cleanCard, overflow: 'hidden' }}>
            <Box sx={customStyles.sidebarSection}>
              Tags populares
            </Box>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {['rock nacional', 'mpb', 'sertanejo', 'gospel', 'pop rock', 'bossa nova', 'blues', 'country', 'forró', 'reggae'].map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      backgroundColor: colors.secondary[100],
                      color: colors.secondary[700],
                      fontSize: '0.75rem',
                      '&:hover': {
                        backgroundColor: colors.primary[50],
                        color: colors.primary[700],
                        cursor: 'pointer'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;