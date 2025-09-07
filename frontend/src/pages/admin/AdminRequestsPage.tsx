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
  Paper
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { SongRequestDetailed } from '../../types/song';
import { adminService } from '../../services/adminService';

const AdminRequestsPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [requests, setRequests] = useState<SongRequestDetailed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalRequests, setTotalRequests] = useState(0);
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // Estados para diálogos
  const [selectedRequest, setSelectedRequest] = useState<SongRequestDetailed | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [moderateDialogOpen, setModerateDialogOpen] = useState(false);
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject' | ''>('');
  const [moderationNotes, setModerationNotes] = useState('');

  useEffect(() => {
    if (user && hasRole('admin')) {
      loadRequests();
    }
  }, [user, page, rowsPerPage, filters]);

  // Funciones auxiliares para mapear datos
  const mapBackendStatusToFrontend = (status: string): "pending" | "completed" | "rejected" | "in_progress" | "cancelled" => {
    const statusMap: { [key: string]: "pending" | "completed" | "rejected" | "in_progress" | "cancelled" } = {
      'pending': 'pending',
      'fulfilled': 'completed',
      'canceled': 'rejected'
    };
    return statusMap[status] || 'pending';
  };

  const mapPriorityToLevel = (priority: string): 1 | 2 | 3 => {
    const priorityMap: { [key: string]: 1 | 2 | 3 } = {
      'low': 1,
      'normal': 2,
      'high': 3,
      'urgent': 3 // Mapear urgent a 3 también ya que el tipo solo acepta 1, 2, 3
    };
    return priorityMap[priority] || 2;
  };

  const mapLevelToPriority = (level: number): string => {
    const levelMap: { [key: number]: string } = {
      1: 'low',
      2: 'normal',
      3: 'high',
      4: 'urgent'
    };
    return levelMap[level] || 'normal';
  };

  const mapFrontendStatusToBackend = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      'pending': 'pending',
      'completed': 'fulfilled',
      'rejected': 'canceled'
    };
    return statusMap[status] || status;
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminService.getRequests({
        page: page + 1, // La API usa páginas basadas en 1
        limit: rowsPerPage,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        search: filters.search || undefined,
        sortBy: 'request_date',
        sortOrder: 'desc'
      });

      // Mapear los datos del backend al formato esperado por el frontend
      const mappedRequests: SongRequestDetailed[] = response.data.map((request: any) => ({
        requestId: request.request_id.toString(),
        title: request.title,
        artistName: request.artist,
        requestedBy: request.user_id?.toString() || '',
        requestedByUsername: request.requester_username || '',
        requestedByName: request.requester_name || '',
        requestedByEmail: request.requester_email || '',
        status: mapBackendStatusToFrontend(request.status),
        priorityLevel: mapPriorityToLevel(request.priority),
        fulfilledBy: request.fulfilled_by?.toString() || undefined,
        fulfilledByUsername: request.fulfilled_by_username || undefined,
        fulfilledByName: request.fulfilled_by_name || undefined,
        fulfilledWith: request.fulfilled_song_title || undefined,
        createdAt: request.request_date,
        updatedAt: request.fulfilled_date || request.request_date,
        notificationSent: false, // Este campo no existe en la BD, usar false por defecto
        comments: '', // Este campo no existe en la BD, usar string vacío
        album: '', // Este campo no existe en la BD
        authorName: '', // Este campo no existe en la BD
        genrePreference: '' // Este campo no existe en la BD
      })) as SongRequestDetailed[];

      setRequests(mappedRequests);
      setTotalRequests(response.pagination.total);
    } catch (err: any) {
      setError(err.message || 'Error al cargar solicitudes');
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

  const handleModerateRequest = async () => {
    if (!selectedRequest || !moderationAction) return;

    try {
      const newStatus = moderationAction === 'approve' ? 'fulfilled' : 'canceled';

      await adminService.updateRequestStatus(selectedRequest.requestId, {
        status: newStatus
      });

      // Recargar las solicitudes para obtener los datos actualizados
      await loadRequests();

      setModerateDialogOpen(false);
      setModerationAction('');
      setModerationNotes('');
      setSelectedRequest(null);
    } catch (err: any) {
      setError(err.message || 'Error al moderar solicitud');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'success';
      case 2: return 'warning';
      case 3: return 'error';
      default: return 'default';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Baja';
      case 2: return 'Media';
      case 3: return 'Alta';
      default: return 'Normal';
    }
  };

  if (!user || !hasRole('admin')) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          No tienes permisos para acceder a la gestión de solicitudes.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestión de Solicitudes de Canciones
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
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  label="Prioridad"
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="low">Baja</MenuItem>
                  <MenuItem value="normal">Media</MenuItem>
                  <MenuItem value="high">Alta</MenuItem>
                  <MenuItem value="urgent">Urgente</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ minWidth: 150 }}>
              <Button
                variant="outlined"
                onClick={loadRequests}
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

      {/* Tabla de solicitudes */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Canción</TableCell>
                <TableCell>Solicitante</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Prioridad</TableCell>
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
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No se encontraron solicitudes
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.requestId} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {request.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {request.artistName}
                          {request.album && ` - ${request.album}`}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {request.requestedByName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          @{request.requestedByUsername}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.status}
                        color={getStatusColor(request.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getPriorityLabel(request.priorityLevel)}
                        color={getPriorityColor(request.priorityLevel) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={0.5}>
                        <Tooltip title="Ver detalles">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedRequest(request);
                              setViewDialogOpen(true);
                            }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        
                        {request.status === 'pending' && (
                          <>
                            <Tooltip title="Aprobar">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => {
                                  setSelectedRequest(request);
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
                                  setSelectedRequest(request);
                                  setModerationAction('reject');
                                  setModerateDialogOpen(true);
                                }}
                              >
                                <RejectIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
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
          count={totalRequests}
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
        <DialogTitle>Detalles de la Solicitud</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                  <Typography variant="body2" color="text.secondary">Título:</Typography>
                  <Typography variant="body1">{selectedRequest.title}</Typography>
                </Box>
                <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                  <Typography variant="body2" color="text.secondary">Artista:</Typography>
                  <Typography variant="body1">{selectedRequest.artistName}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Comentarios:</Typography>
                <Typography variant="body1">{selectedRequest.comments || 'Sin comentarios'}</Typography>
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
          {moderationAction === 'approve' ? 'Aprobar' : 'Rechazar'} Solicitud
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            ¿Estás seguro de que quieres {moderationAction === 'approve' ? 'aprobar' : 'rechazar'} 
            la solicitud "{selectedRequest?.title}"?
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
            onClick={handleModerateRequest} 
            variant="contained"
            color={moderationAction === 'approve' ? 'success' : 'error'}
          >
            {moderationAction === 'approve' ? 'Aprobar' : 'Rechazar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminRequestsPage;
