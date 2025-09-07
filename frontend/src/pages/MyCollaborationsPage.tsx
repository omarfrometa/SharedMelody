import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { Collaboration, Song, SongFilters } from '../types/song';
import { collaborationService } from '../services/collaborationService';
import { songService } from '../services/songService';

const MyCollaborationsPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<SongFilters>({
    page: 1,
    limit: 12,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [selectedCollaboration, setSelectedCollaboration] = useState<Collaboration | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadCollaborations();
    }
  }, [user, filters]);

  const loadCollaborations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await collaborationService.getUserCollaborations(user!.userId, filters);
      setCollaborations(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || 'Error al cargar colaboraciones');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof SongFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset page when filters change
    }));
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleDeleteCollaboration = async () => {
    if (!selectedCollaboration) return;

    try {
      await collaborationService.removeCollaboration(selectedCollaboration.collaborationId);
      await loadCollaborations();
      setDeleteDialogOpen(false);
      setSelectedCollaboration(null);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar colaboración');
    }
  };

  const handlePlaySong = (song: Song) => {
    // Implementar reproductor de música
    console.log('Reproducir canción:', song.title);
  };

  const handleDownloadSong = async (song: Song) => {
    if (song.audioFileUrl) {
      try {
        await songService.downloadSong(String(song.songId));
      } catch (err: any) {
        setError(err.message || 'Error al descargar canción');
      }
    }
  };

  const handleShareSong = (song: Song) => {
    const shareUrl = `${window.location.origin}/songs/${song.songId}`;
    navigator.clipboard.writeText(shareUrl);
    // Mostrar notificación de éxito
  };

  const getCollaborationTypeColor = (type: string) => {
    const colors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
      uploader: 'primary',
      lyricist: 'secondary',
      composer: 'success',
      performer: 'warning',
      editor: 'error',
      contributor: 'primary'
    };
    return colors[type] || 'primary';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      approved: 'success',
      pending: 'warning',
      rejected: 'error',
      archived: 'info'
    };
    return colors[status] || 'info';
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Debes iniciar sesión para ver tus colaboraciones.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mis Colaboraciones
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Aquí puedes ver y gestionar todas las canciones en las que has colaborado.
      </Typography>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Box sx={{ minWidth: 250, flex: '1 1 250px' }}>
              <TextField
                fullWidth
                label="Buscar"
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Título, artista..."
              />
            </Box>

            <Box sx={{ minWidth: 200 }}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="pending">Pendiente</MenuItem>
                  <MenuItem value="approved">Aprobado</MenuItem>
                  <MenuItem value="rejected">Rechazado</MenuItem>
                  <MenuItem value="archived">Archivado</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ minWidth: 200 }}>
              <FormControl fullWidth>
                <InputLabel>Ordenar por</InputLabel>
                <Select
                  value={filters.sortBy || 'created_at'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  label="Ordenar por"
                >
                  <MenuItem value="created_at">Fecha de creación</MenuItem>
                  <MenuItem value="title">Título</MenuItem>
                  <MenuItem value="artist_name">Artista</MenuItem>
                  <MenuItem value="view_count">Reproducciones</MenuItem>
                  <MenuItem value="like_count">Me gusta</MenuItem>
                  <MenuItem value="average_rating">Calificación</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ minWidth: 150 }}>
              <FormControl fullWidth>
                <InputLabel>Orden</InputLabel>
                <Select
                  value={filters.sortOrder || 'desc'}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  label="Orden"
                >
                  <MenuItem value="desc">Descendente</MenuItem>
                  <MenuItem value="asc">Ascendente</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Colaboraciones */}
      {!loading && (
        <>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {collaborations.map((collaboration) => (
              <Box sx={{ minWidth: 350, flex: '1 1 350px' }} key={collaboration.collaborationId}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom noWrap>
                      {collaboration.song?.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      por {collaboration.song?.artistName}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={collaboration.collaborationType}
                        color={getCollaborationTypeColor(collaboration.collaborationType)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={collaboration.song?.status}
                        color={getStatusColor(collaboration.song?.status || '')}
                        size="small"
                      />
                    </Box>

                    {collaboration.contributionDescription && (
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {collaboration.contributionDescription}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {collaboration.song?.viewCount} reproducciones
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {collaboration.song?.likeCount} me gusta
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions>
                    <Tooltip title="Ver detalles">
                      <IconButton size="small" onClick={() => window.open(`/songs/${collaboration.song?.songId}`, '_blank')}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>

                    {collaboration.song?.audioFileUrl && (
                      <Tooltip title="Reproducir">
                        <IconButton size="small" onClick={() => handlePlaySong(collaboration.song!)}>
                          <PlayIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    {collaboration.song?.audioFileUrl && (
                      <Tooltip title="Descargar">
                        <IconButton size="small" onClick={() => handleDownloadSong(collaboration.song!)}>
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Tooltip title="Compartir">
                      <IconButton size="small" onClick={() => handleShareSong(collaboration.song!)}>
                        <ShareIcon />
                      </IconButton>
                    </Tooltip>

                    {collaboration.status === 'active' && (
                      <Tooltip title="Eliminar colaboración">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => {
                            setSelectedCollaboration(collaboration);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>

          {/* Paginación */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}

          {collaborations.length === 0 && !loading && (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No tienes colaboraciones aún
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Comienza colaborando en canciones o sube tu propia música.
              </Typography>
              <Button variant="contained" href="/upload">
                Subir Canción
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Dialog de confirmación para eliminar */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar tu colaboración en "{selectedCollaboration?.song?.title}"?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteCollaboration} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyCollaborationsPage;
