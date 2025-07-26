import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Alert,
  CircularProgress,
  Tooltip,
  Grid,
  Paper,
  Avatar
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MusicNote as MusicIcon,
  PlayArrow as PlayIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { SongDetailed } from '../../types/song';

const AdminSongsPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [songs, setSongs] = useState<SongDetailed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalSongs, setTotalSongs] = useState(0);
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    genre: '',
    language: '',
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // Estados para diálogos
  const [selectedSong, setSelectedSong] = useState<SongDetailed | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [moderateDialogOpen, setModerateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject' | ''>('');
  const [moderationNotes, setModerationNotes] = useState('');

  useEffect(() => {
    if (user && hasRole('admin')) {
      loadSongs();
    }
  }, [user, page, rowsPerPage, filters]);

  const loadSongs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular datos para demostración
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
          status: 'pending',
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
          updatedAt: '2024-01-16T09:15:00Z'
        }
      ];
      
      setSongs(mockSongs);
      setTotalSongs(mockSongs.length);
    } catch (err: any) {
      setError(err.message || 'Error al cargar canciones');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleModerateSong = async () => {
    if (!selectedSong || !moderationAction) return;

    try {
      // Aquí iría la llamada a la API para moderar la canción
      console.log('Moderating song:', selectedSong.songId, moderationAction, moderationNotes);
      
      // Actualizar el estado local
      setSongs(prev => prev.map(song => 
        song.songId === selectedSong.songId 
          ? { ...song, status: moderationAction === 'approve' ? 'approved' : 'rejected' }
          : song
      ));
      
      setModerateDialogOpen(false);
      setModerationAction('');
      setModerationNotes('');
      setSelectedSong(null);
    } catch (err: any) {
      setError(err.message || 'Error al moderar canción');
    }
  };

  const handleDeleteSong = async () => {
    if (!selectedSong) return;

    try {
      // Aquí iría la llamada a la API para eliminar la canción
      console.log('Deleting song:', selectedSong.songId);
      
      setSongs(prev => prev.filter(song => song.songId !== selectedSong.songId));
      setDeleteDialogOpen(false);
      setSelectedSong(null);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar canción');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!user || !hasRole('admin')) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          No tienes permisos para acceder a la gestión de canciones.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestión de Canciones
      </Typography>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Box sx={{ minWidth: 250, flex: '1 1 250px' }}>
              <TextField
                fullWidth
                label="Buscar"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Título, artista..."
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Box>

            <Box sx={{ minWidth: 150 }}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="pending">Pendiente</MenuItem>
                  <MenuItem value="approved">Aprobada</MenuItem>
                  <MenuItem value="rejected">Rechazada</MenuItem>
                  <MenuItem value="archived">Archivada</MenuItem>
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
              <Button
                variant="outlined"
                onClick={loadSongs}
                fullWidth
                startIcon={<FilterIcon />}
              >
                Aplicar Filtros
              </Button>
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

      {/* Tabla de canciones */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Canción</TableCell>
                <TableCell>Subido por</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Estadísticas</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : songs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No se encontraron canciones
                  </TableCell>
                </TableRow>
              ) : (
                songs.map((song) => (
                  <TableRow key={song.songId} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <MusicIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {song.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {song.artistName} • {formatDuration(song.durationSeconds || 0)}
                          </Typography>
                          {song.album && (
                            <Typography variant="caption" color="text.secondary">
                              {song.album}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {song.uploadedByName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          @{song.uploadedByUsername}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={song.status}
                        color={getStatusColor(song.status) as any}
                        size="small"
                      />
                      {song.explicitContent && (
                        <Chip
                          label="Explícito"
                          color="warning"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="caption" display="block">
                          {song.viewCount} vistas
                        </Typography>
                        <Typography variant="caption" display="block">
                          {song.likeCount} likes
                        </Typography>
                        <Typography variant="caption" display="block">
                          ⭐ {song.averageRating.toFixed(1)} ({song.ratingCount})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(song.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={0.5}>
                        <Tooltip title="Ver detalles">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedSong(song);
                              setViewDialogOpen(true);
                            }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        
                        {song.status === 'pending' && (
                          <>
                            <Tooltip title="Aprobar">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => {
                                  setSelectedSong(song);
                                  setModerationAction('approve');
                                  setModerateDialogOpen(true);
                                }}
                              >
                                <ApproveIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Rechazar">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setSelectedSong(song);
                                  setModerationAction('reject');
                                  setModerateDialogOpen(true);
                                }}
                              >
                                <RejectIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}

                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedSong(song);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={totalSongs}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </Paper>

      {/* Dialog para ver detalles */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalles de la Canción</DialogTitle>
        <DialogContent>
          {selectedSong && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="body2" color="text.secondary">Título:</Typography>
                  <Typography variant="body1">{selectedSong.title}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="body2" color="text.secondary">Artista:</Typography>
                  <Typography variant="body1">{selectedSong.artistName}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="body2" color="text.secondary">Álbum:</Typography>
                  <Typography variant="body1">{selectedSong.album || 'No especificado'}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="body2" color="text.secondary">Duración:</Typography>
                  <Typography variant="body1">{formatDuration(selectedSong.durationSeconds || 0)}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Etiquetas:</Typography>
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedSong.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para moderar */}
      <Dialog open={moderateDialogOpen} onClose={() => setModerateDialogOpen(false)}>
        <DialogTitle>
          {moderationAction === 'approve' ? 'Aprobar' : 'Rechazar'} Canción
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            ¿Estás seguro de que quieres {moderationAction === 'approve' ? 'aprobar' : 'rechazar'} 
            la canción "{selectedSong?.title}"?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notas de moderación (opcional)"
            value={moderationNotes}
            onChange={(e) => setModerationNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModerateDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleModerateSong} 
            variant="contained"
            color={moderationAction === 'approve' ? 'success' : 'error'}
          >
            {moderationAction === 'approve' ? 'Aprobar' : 'Rechazar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para eliminar */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Eliminar Canción</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar la canción "{selectedSong?.title}"?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteSong} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminSongsPage;
