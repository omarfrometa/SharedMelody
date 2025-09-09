import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  Divider,
  Chip,
  IconButton,
  Grid,
  Paper,
  Skeleton
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Person as PersonIcon,
  MusicNote as MusicNoteIcon,
  Album as AlbumIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { songService } from '../services/songService';
import { SongDetailed } from '../types/song';
import { customStyles, colors } from '../theme/theme';
import { useTranslation } from '../contexts/LanguageContext';

const ArtistPage: React.FC = () => {
  const { artistName } = useParams<{ artistName: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const decodedArtistName = artistName ? decodeURIComponent(artistName) : '';

  const { data: artistSongs, isLoading } = useQuery<SongDetailed[], Error>({
    queryKey: ['artistSongs', decodedArtistName],
    queryFn: () => songService.getSongsByArtist(decodedArtistName),
    enabled: !!decodedArtistName
  });

  const songs = artistSongs || [];
  const totalSongs = songs.length;
  const totalViews = songs.reduce((sum, song) => sum + (song.viewCount || 0), 0);

  // Group songs by album if available
  const albumGroups = songs.reduce((acc, song) => {
    const album = song.album || 'Singles';
    if (!acc[album]) {
      acc[album] = [];
    }
    acc[album].push(song);
    return acc;
  }, {} as Record<string, SongDetailed[]>);

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Artist Header - CifraClub Style */}
      <Paper 
        sx={{ 
          ...customStyles.heroGradient,
          mb: 3,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 3,
          p: 4
        }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              fontSize: '2.5rem',
              fontWeight: 700,
              background: colors.gradient.primary,
              border: '4px solid rgba(255,255,255,0.3)'
            }}
          >
            {decodedArtistName.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h3" 
              fontWeight={800} 
              sx={{ 
                color: 'white',
                mb: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              {decodedArtistName}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={600} sx={{ color: 'white' }}>
                  {totalSongs}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {t('songs.title') || 'Canciones'}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={600} sx={{ color: 'white' }}>
                  {totalViews.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {t('songs.views') || 'Visualizaciones'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<PlayIcon />}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                  }
                }}
              >
                {t('songs.playSong') || 'Reproducir'}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<FavoriteIcon />}
                sx={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: 'rgba(255,255,255,0.7)',
                  }
                }}
              >
                {t('songs.addToFavorites') || 'Seguir'}
              </Button>

              <IconButton
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                  }
                }}
              >
                <ShareIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Main Content */}
        <Box sx={{ flex: 1 }}>
          {/* Popular Songs */}
          <Card sx={{ ...customStyles.cleanCard, mb: 3 }}>
            <Box sx={customStyles.sidebarSection}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon sx={{ color: colors.primary[600] }} />
                {t('songs.title') || 'Canciones Populares'}
              </Box>
            </Box>
            
            <List>
              {isLoading ? (
                [...Array(10)].map((_, index) => (
                  <ListItem key={index}>
                    <Skeleton variant="text" width="100%" height={60} />
                  </ListItem>
                ))
              ) : (
                songs.slice(0, 20).map((song, index) => (
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
                      <Typography 
                        variant="body1" 
                        fontWeight={600} 
                        sx={{ 
                          color: colors.secondary[800],
                          cursor: 'pointer',
                          '&:hover': {
                            color: colors.primary[600],
                            textDecoration: 'underline'
                          }
                        }}
                        onClick={() => navigate(`/songs/${song.songId}`)}
                      >
                        {song.title}
                      </Typography>
                      
                      {song.album && (
                        <Typography variant="body2" sx={{ color: colors.secondary[600] }}>
                          {song.album}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        {song.genre && (
                          <Chip
                            label={String(song.genre)}
                            size="small"
                            sx={{
                              backgroundColor: colors.secondary[100],
                              color: colors.secondary[700],
                              fontSize: '0.7rem'
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {song.viewCount && (
                        <Typography variant="caption" sx={{ color: colors.secondary[500], mr: 2 }}>
                          {song.viewCount.toLocaleString()} views
                        </Typography>
                      )}
                      
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
                        onClick={() => navigate(`/songs/${song.songId}`)}
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
                    </Box>
                  </ListItem>
                ))
              )}
            </List>
          </Card>
        </Box>

        {/* Right Sidebar */}
        <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: '300px' } }}>
          {/* Artist Info */}
          <Card sx={{ ...customStyles.cleanCard, mb: 2 }}>
            <Box sx={customStyles.sidebarSection}>
              {t('common.info') || 'Información'}
            </Box>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: colors.secondary[600] }}>
                    Total de canciones:
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: colors.secondary[800] }}>
                    {totalSongs}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: colors.secondary[600] }}>
                    Visualizaciones totales:
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: colors.secondary[800] }}>
                    {totalViews.toLocaleString()}
                  </Typography>
                </Box>

                <Divider />

                {/* Genres */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: colors.secondary[700] }}>
                    Géneros:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {Array.from(new Set(songs.map(song => song.genre).filter(Boolean))).map((genre) => (
                      <Chip
                        key={String(genre)}
                        label={String(genre)}
                        size="small"
                        sx={{
                          backgroundColor: colors.secondary[100],
                          color: colors.secondary[700],
                          fontSize: '0.7rem'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Albums */}
          {Object.keys(albumGroups).length > 1 && (
            <Card sx={{ ...customStyles.cleanCard }}>
              <Box sx={customStyles.sidebarSection}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AlbumIcon sx={{ color: colors.primary[600] }} />
                  Álbumes
                </Box>
              </Box>
              <CardContent>
                {Object.entries(albumGroups).map(([album, albumSongs]) => (
                  <Box 
                    key={album}
                    sx={{ 
                      mb: 2,
                      pb: 2,
                      borderBottom: `1px solid ${colors.secondary[100]}`
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600} sx={{ color: colors.secondary[700] }}>
                      {album}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.secondary[500] }}>
                      {albumSongs.length} {albumSongs.length === 1 ? 'canción' : 'canciones'}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default ArtistPage;