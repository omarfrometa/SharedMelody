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
  Tooltip,
  Fab
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  PlayArrow as PlayIcon,
  Add as AddIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { SongRequest, SongRequestFilters, CreateSongRequest } from '../types/song';
import { songRequestService } from '../services/songRequestService';

const MyRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<SongRequestFilters>({
    page: 1,
    limit: 12,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [selectedRequest, setSelectedRequest] = useState<SongRequest | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newRequestDialogOpen, setNewRequestDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<CreateSongRequest>({
    title: '',
    artistName: '',
    album: '',
    authorName: '',
    genrePreference: '',
    comments: '',
    priorityLevel: 1
  });

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user, filters]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const requestFilters = { ...filters, requestedBy: user!.userId };
      const response = await songRequestService.getRequests(requestFilters);
      setRequests(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || 'Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof SongRequestFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1
    }));
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleCreateRequest = async () => {
    try {
      await songRequestService.createRequest(editFormData);
      await loadRequests();
      setNewRequestDialogOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Error al crear solicitud');
    }
  };

  const handleUpdateRequest = async () => {
    if (!selectedRequest) return;

    try {
      await songRequestService.updateRequest(selectedRequest.requestId, editFormData);
      await loadRequests();
      setEditDialogOpen(false);
      setSelectedRequest(null);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar solicitud');
    }
  };

  const handleDeleteRequest = async () => {
    if (!selectedRequest) return;

    try {
      await songRequestService.deleteRequest(selectedRequest.requestId);
      await loadRequests();
      setDeleteDialogOpen(false);
      setSelectedRequest(null);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar solicitud');
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await songRequestService.cancelRequest(requestId);
      await loadRequests();
    } catch (err: any) {
      setError(err.message || 'Error al cancelar solicitud');
    }
  };

  const resetForm = () => {
    setEditFormData({
      title: '',
      artistName: '',
      album: '',
      authorName: '',
      genrePreference: '',
      comments: '',
      priorityLevel: 1
    });
  };

  const openEditDialog = (request: SongRequest) => {
    setSelectedRequest(request);
    setEditFormData({
      title: request.title,
      artistName: request.artistName,
      album: request.album || '',
      authorName: request.authorName || '',
      genrePreference: request.genrePreference || '',
      comments: request.comments || '',
      priorityLevel: request.priorityLevel
    });
    setEditDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'primary'> = {
      pending: 'warning',
      in_progress: 'info',
      completed: 'success',
      rejected: 'error',
      cancelled: 'error'
    };
    return colors[status] || 'primary';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Pendiente',
      in_progress: 'En progreso',
      completed: 'Completada',
      rejected: 'Rechazada',
      cancelled: 'Cancelada'
    };
    return texts[status] || status;
  };

  const getPriorityText = (priority: number) => {
    const texts: Record<number, string> = {
      1: 'Baja',
      2: 'Media',
      3: 'Alta'
    };
    return texts[priority] || 'Baja';
  };

  const getPriorityColor = (priority: number) => {
    const colors: Record<number, 'success' | 'warning' | 'error'> = {
      1: 'success',
      2: 'warning',
      3: 'error'
    };
    return colors[priority] || 'success';
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Debes iniciar sesión para ver tus solicitudes.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mis Solicitudes
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Aquí puedes ver y gestionar todas las canciones que has solicitado.
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
                  <MenuItem value="in_progress">En progreso</MenuItem>
                  <MenuItem value="completed">Completada</MenuItem>
                  <MenuItem value="rejected">Rechazada</MenuItem>
                  <MenuItem value="cancelled">Cancelada</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ minWidth: 150 }}>
              <FormControl fullWidth>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={filters.priorityLevel || ''}
                  onChange={(e) => handleFilterChange('priorityLevel', e.target.value)}
                  label="Prioridad"
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value={1}>Baja</MenuItem>
                  <MenuItem value={2}>Media</MenuItem>
                  <MenuItem value={3}>Alta</MenuItem>
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
                  <MenuItem value="created_at">Fecha de solicitud</MenuItem>
                  <MenuItem value="title">Título</MenuItem>
                  <MenuItem value="artist">Artista</MenuItem>
                  <MenuItem value="priority_level">Prioridad</MenuItem>
                  <MenuItem value="updated_at">Última actualización</MenuItem>
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

      {/* Solicitudes */}
      {!loading && (
        <>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {requests.map((request) => (
              <Box sx={{ minWidth: 350, flex: '1 1 350px' }} key={request.requestId}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom noWrap>
                      {request.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      por {request.artistName}
                    </Typography>

                    {request.album && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Álbum: {request.album}
                      </Typography>
                    )}

                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={getStatusText(request.status)}
                        color={getStatusColor(request.status)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={`Prioridad ${getPriorityText(request.priorityLevel)}`}
                        color={getPriorityColor(request.priorityLevel)}
                        size="small"
                      />
                    </Box>

                    {request.comments && (
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {request.comments}
                      </Typography>
                    )}

                    {request.status === 'completed' && request.fulfilledSong && (
                      <Alert severity="success" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          ¡Solicitud cumplida! La canción está disponible.
                        </Typography>
                      </Alert>
                    )}

                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                      Solicitada el {new Date(request.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>

                  <CardActions>
                    {request.status === 'completed' && request.fulfilledSong && (
                      <Tooltip title="Ver canción">
                        <IconButton 
                          size="small" 
                          onClick={() => window.open(`/songs/${request.fulfilledSong?.songId}`, '_blank')}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    {(request.status === 'pending' || request.status === 'in_progress') && (
                      <>
                        <Tooltip title="Editar solicitud">
                          <IconButton size="small" onClick={() => openEditDialog(request)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Cancelar solicitud">
                          <IconButton 
                            size="small" 
                            color="warning"
                            onClick={() => handleCancelRequest(request.requestId)}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}

                    {request.status !== 'completed' && (
                      <Tooltip title="Eliminar solicitud">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => {
                            setSelectedRequest(request);
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

          {requests.length === 0 && !loading && (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No tienes solicitudes aún
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Comienza solicitando las canciones que te gustaría escuchar.
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => setNewRequestDialogOpen(true)}
                startIcon={<AddIcon />}
              >
                Nueva Solicitud
              </Button>
            </Box>
          )}
        </>
      )}

      {/* FAB para nueva solicitud */}
      <Fab
        color="primary"
        aria-label="nueva solicitud"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setNewRequestDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Dialog para nueva solicitud */}
      <Dialog open={newRequestDialogOpen} onClose={() => setNewRequestDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Solicitud de Canción</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Título de la canción"
              value={editFormData.title}
              onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
            <TextField
              fullWidth
              label="Artista"
              value={editFormData.artistName}
              onChange={(e) => setEditFormData(prev => ({ ...prev, artistName: e.target.value }))}
              required
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                <TextField
                  fullWidth
                  label="Álbum"
                  value={editFormData.album}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, album: e.target.value }))}
                />
              </Box>
              <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                <TextField
                  fullWidth
                  label="Autor/Compositor"
                  value={editFormData.authorName}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, authorName: e.target.value }))}
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                <TextField
                  fullWidth
                  label="Género preferido"
                  value={editFormData.genrePreference}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, genrePreference: e.target.value }))}
                />
              </Box>
              <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                <FormControl fullWidth>
                  <InputLabel>Prioridad</InputLabel>
                  <Select
                    value={editFormData.priorityLevel}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, priorityLevel: e.target.value as 1 | 2 | 3 }))}
                    label="Prioridad"
                  >
                    <MenuItem value={1}>Baja</MenuItem>
                    <MenuItem value={2}>Media</MenuItem>
                    <MenuItem value={3}>Alta</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            <TextField
              fullWidth
              label="Comentarios adicionales"
              value={editFormData.comments}
              onChange={(e) => setEditFormData(prev => ({ ...prev, comments: e.target.value }))}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewRequestDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateRequest} 
            variant="contained"
            disabled={!editFormData.title || !editFormData.artistName}
          >
            Crear Solicitud
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para editar solicitud */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Solicitud</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Título de la canción"
              value={editFormData.title}
              onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
            <TextField
              fullWidth
              label="Artista"
              value={editFormData.artistName}
              onChange={(e) => setEditFormData(prev => ({ ...prev, artistName: e.target.value }))}
              required
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                <TextField
                  fullWidth
                  label="Álbum"
                  value={editFormData.album}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, album: e.target.value }))}
                />
              </Box>
              <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                <TextField
                  fullWidth
                  label="Autor/Compositor"
                  value={editFormData.authorName}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, authorName: e.target.value }))}
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                <TextField
                  fullWidth
                  label="Género preferido"
                  value={editFormData.genrePreference}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, genrePreference: e.target.value }))}
                />
              </Box>
              <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                <FormControl fullWidth>
                  <InputLabel>Prioridad</InputLabel>
                  <Select
                    value={editFormData.priorityLevel}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, priorityLevel: e.target.value as 1 | 2 | 3 }))}
                    label="Prioridad"
                  >
                    <MenuItem value={1}>Baja</MenuItem>
                    <MenuItem value={2}>Media</MenuItem>
                    <MenuItem value={3}>Alta</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            <TextField
              fullWidth
              label="Comentarios adicionales"
              value={editFormData.comments}
              onChange={(e) => setEditFormData(prev => ({ ...prev, comments: e.target.value }))}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdateRequest} 
            variant="contained"
            disabled={!editFormData.title || !editFormData.artistName}
          >
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar la solicitud "{selectedRequest?.title}"?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteRequest} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyRequestsPage;
