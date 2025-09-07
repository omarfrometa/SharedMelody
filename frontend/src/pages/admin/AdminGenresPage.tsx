import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
  Grid,
  Paper,
  Fab,

  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Add as AddIcon,
  MusicNote as GenreIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AccountTree as TreeIcon,
  List as ListIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { MusicalGenre } from '../../types/song';
import { CreateGenre, UpdateGenre, GenreFilters } from '../../types/admin';
import { genreService } from '../../services/genreService';

const AdminGenresPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [genres, setGenres] = useState<MusicalGenre[]>([]);
  const [genreTree, setGenreTree] = useState<MusicalGenre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalGenres, setTotalGenres] = useState(0);
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');
  const [filters, setFilters] = useState<GenreFilters>({
    page: 1,
    limit: 25,
    sortBy: 'genre_name',
    sortOrder: 'asc'
  });

  // Estados para diálogos
  const [selectedGenre, setSelectedGenre] = useState<MusicalGenre | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // Estados para formularios
  const [formData, setFormData] = useState<CreateGenre>({
    genreName: '',
    genreDescription: '',
    parentGenreId: ''
  });

  useEffect(() => {
    if (user && hasRole('admin')) {
      loadGenres();
      loadGenreTree();
    }
  }, [user, filters]);

  const loadGenres = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await genreService.getGenres(filters);
      setGenres(response.data);
      setTotalGenres(response.pagination.total);
    } catch (err: any) {
      setError(err.message || 'Error al cargar géneros');
    } finally {
      setLoading(false);
    }
  };

  const loadGenreTree = async () => {
    try {
      const tree = await genreService.getGenreTree();
      setGenreTree(tree);
    } catch (err: any) {
      console.error('Error al cargar árbol de géneros:', err);
    }
  };

  const handleFilterChange = (field: keyof GenreFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1
    }));
    setPage(0);
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
    setFilters(prev => ({ ...prev, page: newPage + 1 }));
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setFilters(prev => ({ ...prev, limit: newRowsPerPage, page: 1 }));
    setPage(0);
  };

  const resetForm = () => {
    setFormData({
      genreName: '',
      genreDescription: '',
      parentGenreId: ''
    });
  };

  const handleCreateGenre = async () => {
    try {
      await genreService.createGenre(formData);
      await loadGenres();
      await loadGenreTree();
      setCreateDialogOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Error al crear género');
    }
  };

  const handleUpdateGenre = async () => {
    if (!selectedGenre) return;

    try {
      const updateData: UpdateGenre = {
        genreId: selectedGenre.genreId,
        ...formData
      };
      await genreService.updateGenre(selectedGenre.genreId, updateData);
      await loadGenres();
      await loadGenreTree();
      setEditDialogOpen(false);
      setSelectedGenre(null);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar género');
    }
  };

  const handleDeleteGenre = async () => {
    if (!selectedGenre) return;

    try {
      await genreService.deleteGenre(selectedGenre.genreId);
      await loadGenres();
      await loadGenreTree();
      setDeleteDialogOpen(false);
      setSelectedGenre(null);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar género');
    }
  };

  const handleToggleGenreStatus = async (genre: MusicalGenre) => {
    try {
      await genreService.toggleGenreStatus(genre.genreId, !genre.isActive);
      await loadGenres();
      await loadGenreTree();
    } catch (err: any) {
      setError(err.message || 'Error al cambiar estado del género');
    }
  };

  const openEditDialog = (genre: MusicalGenre) => {
    setSelectedGenre(genre);
    setFormData({
      genreName: genre.genreName,
      genreDescription: genre.genreDescription || '',
      parentGenreId: genre.parentGenreId || ''
    });
    setEditDialogOpen(true);
  };

  const getParentGenreName = (parentGenreId?: string) => {
    const parentGenre = genres.find(g => g.genreId === parentGenreId);
    return parentGenre?.genreName || 'Género principal';
  };

  const renderGenreTree = (genreList: MusicalGenre[], level: number = 0) => {
    return genreList.map((genre) => (
      <Box key={genre.genreId} sx={{ ml: level * 2 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 1,
            backgroundColor: level > 0 ? 'grey.50' : '#ffffff'
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <GenreIcon sx={{ mr: 1, fontSize: 16 }} />
              <Typography variant="body2">
                {genre.genreName}
              </Typography>
              <Chip
                label={genre.isActive ? 'Activo' : 'Inactivo'}
                color={genre.isActive ? 'success' : 'error'}
                size="small"
                sx={{ ml: 1 }}
              />
            </Box>
            <Box>
              <IconButton size="small" onClick={() => openEditDialog(genre)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  setSelectedGenre(genre);
                  setDeleteDialogOpen(true);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Paper>
        {/* Render child genres */}
        {genres.filter(g => g.parentGenreId === genre.genreId).length > 0 &&
          renderGenreTree(genres.filter(g => g.parentGenreId === genre.genreId), level + 1)
        }
      </Box>
    ));
  };

  if (!user || !hasRole('admin')) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          No tienes permisos para acceder a la gestión de géneros.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestión de Géneros Musicales
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            startIcon={<ListIcon />}
            onClick={() => setViewMode('table')}
          >
            Tabla
          </Button>
          <Button
            variant={viewMode === 'tree' ? 'contained' : 'outlined'}
            startIcon={<TreeIcon />}
            onClick={() => setViewMode('tree')}
          >
            Árbol
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setCreateDialogOpen(true);
            }}
          >
            Nuevo Género
          </Button>
        </Box>
      </Box>

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
                placeholder="Nombre del género..."
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Box>

            <Box sx={{ minWidth: 200 }}>
              <FormControl fullWidth>
                <InputLabel>Género padre</InputLabel>
                <Select
                  value={filters.parentGenreId || ''}
                  onChange={(e) => handleFilterChange('parentGenreId', e.target.value)}
                  label="Género padre"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="null">Géneros principales</MenuItem>
                  {genres.filter(g => !g.parentGenreId).map((genre) => (
                    <MenuItem key={genre.genreId} value={genre.genreId}>
                      {genre.genreName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ minWidth: 150 }}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filters.isActive?.toString() || ''}
                  onChange={(e) => handleFilterChange('isActive', e.target.value === 'true')}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="true">Activos</MenuItem>
                  <MenuItem value="false">Inactivos</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ minWidth: 150 }}>
              <Button
                variant="outlined"
                onClick={loadGenres}
                fullWidth
                startIcon={<SearchIcon />}
              >
                Buscar
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

      {/* Vista de tabla */}
      {viewMode === 'table' && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Género</TableCell>
                  <TableCell>Género padre</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Canciones</TableCell>
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
                ) : genres.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No se encontraron géneros
                    </TableCell>
                  </TableRow>
                ) : (
                  genres.map((genre) => (
                    <TableRow key={genre.genreId} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <GenreIcon sx={{ mr: 2, color: 'primary.main' }} />
                          <Typography variant="body1" fontWeight="medium">
                            {genre.genreName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getParentGenreName(genre.parentGenreId)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {genre.genreDescription || 'Sin descripción'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={genre.isActive ? 'Activo' : 'Inactivo'}
                          color={genre.isActive ? 'success' : 'error'}
                          size="small"
                          onClick={() => handleToggleGenreStatus(genre)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          0 {/* TODO: Implementar contador de canciones */}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={0.5}>
                          <Tooltip title="Ver detalles">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedGenre(genre);
                                setViewDialogOpen(true);
                              }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => openEditDialog(genre)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setSelectedGenre(genre);
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
            count={totalGenres}
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
      )}

      {/* Vista de árbol */}
      {viewMode === 'tree' && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Jerarquía de Géneros Musicales
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ maxHeight: 600, overflowY: 'auto' }}>
              {renderGenreTree(genreTree)}
            </Box>
          )}
        </Paper>
      )}

      {/* FAB para crear género */}
      <Fab
        color="primary"
        aria-label="nuevo género"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => {
          resetForm();
          setCreateDialogOpen(true);
        }}
      >
        <AddIcon />
      </Fab>

      {/* Dialog para crear género */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nuevo Género</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Nombre del género"
              value={formData.genreName}
              onChange={(e) => setFormData(prev => ({ ...prev, genreName: e.target.value }))}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Género padre (opcional)</InputLabel>
              <Select
                value={formData.parentGenreId}
                onChange={(e) => setFormData(prev => ({ ...prev, parentGenreId: e.target.value }))}
                label="Género padre (opcional)"
              >
                <MenuItem value="">Ninguno (género principal)</MenuItem>
                {genres.filter(g => !g.parentGenreId).map((genre) => (
                  <MenuItem key={genre.genreId} value={genre.genreId}>
                    {genre.genreName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Descripción"
              value={formData.genreDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, genreDescription: e.target.value }))}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} startIcon={<CancelIcon />}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateGenre} 
            variant="contained"
            disabled={!formData.genreName}
            startIcon={<SaveIcon />}
          >
            Crear Género
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para editar género */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Género</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Nombre del género"
              value={formData.genreName}
              onChange={(e) => setFormData(prev => ({ ...prev, genreName: e.target.value }))}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Género padre (opcional)</InputLabel>
              <Select
                value={formData.parentGenreId}
                onChange={(e) => setFormData(prev => ({ ...prev, parentGenreId: e.target.value }))}
                label="Género padre (opcional)"
              >
                <MenuItem value="">Ninguno (género principal)</MenuItem>
                {genres.filter(g => !g.parentGenreId && g.genreId !== selectedGenre?.genreId).map((genre) => (
                  <MenuItem key={genre.genreId} value={genre.genreId}>
                    {genre.genreName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Descripción"
              value={formData.genreDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, genreDescription: e.target.value }))}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} startIcon={<CancelIcon />}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdateGenre} 
            variant="contained"
            disabled={!formData.genreName}
            startIcon={<SaveIcon />}
          >
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para eliminar género */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Eliminar Género</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar el género "{selectedGenre?.genreName}"?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteGenre} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para ver detalles */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles del Género</DialogTitle>
        <DialogContent>
          {selectedGenre && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Nombre:</Typography>
                <Typography variant="body1">{selectedGenre.genreName}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Género padre:</Typography>
                <Typography variant="body1">{getParentGenreName(selectedGenre.parentGenreId)}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Descripción:</Typography>
                <Typography variant="body1">{selectedGenre.genreDescription || 'Sin descripción'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Estado:</Typography>
                <Chip
                  label={selectedGenre.isActive ? 'Activo' : 'Inactivo'}
                  color={selectedGenre.isActive ? 'success' : 'error'}
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Fecha de creación:</Typography>
                <Typography variant="body1">{new Date(selectedGenre.createdAt).toLocaleString()}</Typography>
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
    </Container>
  );
};

export default AdminGenresPage;
