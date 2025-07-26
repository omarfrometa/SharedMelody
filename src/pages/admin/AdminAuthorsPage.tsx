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
  Avatar,

  Paper,
  Fab
} from '@mui/material';

import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Public as CountryIcon,
  CalendarToday as DateIcon,
  MusicNote as SongsIcon,
  Image as ImageIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { Author } from '../../types/song';
import { CreateAuthor, UpdateAuthor, AuthorFilters } from '../../types/admin';
import { authorService } from '../../services/authorService';

const AdminAuthorsPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalAuthors, setTotalAuthors] = useState(0);
  const [filters, setFilters] = useState<AuthorFilters>({
    page: 1,
    limit: 25,
    sortBy: 'author_name',
    sortOrder: 'asc'
  });

  // Estados para diálogos
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // Estados para formularios
  const [formData, setFormData] = useState<CreateAuthor>({
    authorName: '',
    authorBio: '',
    birthDate: '',
    deathDate: '',
    countryId: '',
    websiteUrl: '',
    imageUrl: ''
  });

  // Países disponibles (simplificado)
  const [countries] = useState([
    { countryId: '1', countryName: 'Estados Unidos', countryCode: 'USA' },
    { countryId: '2', countryName: 'México', countryCode: 'MEX' },
    { countryId: '3', countryName: 'España', countryCode: 'ESP' },
    { countryId: '4', countryName: 'Argentina', countryCode: 'ARG' },
    { countryId: '5', countryName: 'Colombia', countryCode: 'COL' },
    { countryId: '6', countryName: 'Reino Unido', countryCode: 'GBR' },
    { countryId: '7', countryName: 'Francia', countryCode: 'FRA' },
    { countryId: '8', countryName: 'Brasil', countryCode: 'BRA' }
  ]);

  useEffect(() => {
    if (user && hasRole('admin')) {
      loadAuthors();
    }
  }, [user, filters]);

  const loadAuthors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authorService.getAuthors(filters);
      setAuthors(response.data);
      setTotalAuthors(response.pagination.total);
    } catch (err: any) {
      setError(err.message || 'Error al cargar autores');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof AuthorFilters, value: any) => {
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
      authorName: '',
      authorBio: '',
      birthDate: '',
      deathDate: '',
      countryId: '',
      websiteUrl: '',
      imageUrl: ''
    });
  };

  const handleCreateAuthor = async () => {
    try {
      await authorService.createAuthor(formData);
      await loadAuthors();
      setCreateDialogOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Error al crear autor');
    }
  };

  const handleUpdateAuthor = async () => {
    if (!selectedAuthor) return;

    try {
      const updateData: UpdateAuthor = {
        authorId: selectedAuthor.authorId,
        ...formData
      };
      await authorService.updateAuthor(selectedAuthor.authorId, updateData);
      await loadAuthors();
      setEditDialogOpen(false);
      setSelectedAuthor(null);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar autor');
    }
  };

  const handleDeleteAuthor = async () => {
    if (!selectedAuthor) return;

    try {
      await authorService.deleteAuthor(selectedAuthor.authorId);
      await loadAuthors();
      setDeleteDialogOpen(false);
      setSelectedAuthor(null);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar autor');
    }
  };

  const handleToggleAuthorStatus = async (author: Author) => {
    try {
      await authorService.toggleAuthorStatus(author.authorId, !author.isActive);
      await loadAuthors();
    } catch (err: any) {
      setError(err.message || 'Error al cambiar estado del autor');
    }
  };

  const openEditDialog = (author: Author) => {
    setSelectedAuthor(author);
    setFormData({
      authorName: author.authorName,
      authorBio: author.authorBio || '',
      birthDate: author.birthDate || '',
      deathDate: author.deathDate || '',
      countryId: author.countryId || '',
      websiteUrl: author.websiteUrl || '',
      imageUrl: author.imageUrl || ''
    });
    setEditDialogOpen(true);
  };

  const getCountryName = (countryId?: string) => {
    const country = countries.find(c => c.countryId === countryId);
    return country?.countryName || 'No especificado';
  };

  if (!user || !hasRole('admin')) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          No tienes permisos para acceder a la gestión de autores.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestión de Autores
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setCreateDialogOpen(true);
          }}
        >
          Nuevo Autor
        </Button>
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
                placeholder="Nombre del autor..."
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Box>

            <Box sx={{ minWidth: 200 }}>
              <FormControl fullWidth>
                <InputLabel>País</InputLabel>
                <Select
                  value={filters.countryId || ''}
                  onChange={(e) => handleFilterChange('countryId', e.target.value)}
                  label="País"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {countries.map((country) => (
                    <MenuItem key={country.countryId} value={country.countryId}>
                      {country.countryName}
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
                onClick={loadAuthors}
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

      {/* Tabla de autores */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Autor</TableCell>
                <TableCell>País</TableCell>
                <TableCell>Fecha de nacimiento</TableCell>
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
              ) : authors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No se encontraron autores
                  </TableCell>
                </TableRow>
              ) : (
                authors.map((author) => (
                  <TableRow key={author.authorId} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          src={author.imageUrl}
                          sx={{ mr: 2, width: 40, height: 40 }}
                        >
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {author.authorName}
                          </Typography>
                          {author.authorBio && (
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {author.authorBio.substring(0, 50)}...
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <CountryIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {getCountryName(author.countryId)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <DateIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {author.birthDate 
                            ? new Date(author.birthDate).toLocaleDateString()
                            : 'No especificada'
                          }
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={author.isActive ? 'Activo' : 'Inactivo'}
                        color={author.isActive ? 'success' : 'error'}
                        size="small"
                        onClick={() => handleToggleAuthorStatus(author)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <SongsIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          0 {/* TODO: Implementar contador de canciones */}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={0.5}>
                        <Tooltip title="Ver detalles">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedAuthor(author);
                              setViewDialogOpen(true);
                            }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(author)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedAuthor(author);
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
          count={totalAuthors}
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

      {/* FAB para crear autor */}
      <Fab
        color="primary"
        aria-label="nuevo autor"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => {
          resetForm();
          setCreateDialogOpen(true);
        }}
      >
        <AddIcon />
      </Fab>

      {/* Dialog para crear autor */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Crear Nuevo Autor</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Nombre del autor"
                value={formData.authorName}
                onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
                required
              />
              <FormControl fullWidth>
                <InputLabel>País</InputLabel>
                <Select
                  value={formData.countryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, countryId: e.target.value }))}
                  label="País"
                >
                  <MenuItem value="">Seleccionar país</MenuItem>
                  {countries.map((country) => (
                    <MenuItem key={country.countryId} value={country.countryId}>
                      {country.countryName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Fecha de nacimiento"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Fecha de fallecimiento"
                type="date"
                value={formData.deathDate}
                onChange={(e) => setFormData(prev => ({ ...prev, deathDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <TextField
              fullWidth
              label="Biografía"
              value={formData.authorBio}
              onChange={(e) => setFormData(prev => ({ ...prev, authorBio: e.target.value }))}
              multiline
              rows={3}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Sitio web"
                value={formData.websiteUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                type="url"
              />
              <TextField
                fullWidth
                label="URL de imagen"
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                type="url"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} startIcon={<CancelIcon />}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateAuthor} 
            variant="contained"
            disabled={!formData.authorName}
            startIcon={<SaveIcon />}
          >
            Crear Autor
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para editar autor */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Editar Autor</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Nombre del autor"
                value={formData.authorName}
                onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
                required
              />
              <FormControl fullWidth>
                <InputLabel>País</InputLabel>
                <Select
                  value={formData.countryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, countryId: e.target.value }))}
                  label="País"
                >
                  <MenuItem value="">Seleccionar país</MenuItem>
                  {countries.map((country) => (
                    <MenuItem key={country.countryId} value={country.countryId}>
                      {country.countryName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Fecha de nacimiento"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Fecha de fallecimiento"
                type="date"
                value={formData.deathDate}
                onChange={(e) => setFormData(prev => ({ ...prev, deathDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <TextField
              fullWidth
              label="Biografía"
              value={formData.authorBio}
              onChange={(e) => setFormData(prev => ({ ...prev, authorBio: e.target.value }))}
              multiline
              rows={3}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Sitio web"
                value={formData.websiteUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                type="url"
              />
              <TextField
                fullWidth
                label="URL de imagen"
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                type="url"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} startIcon={<CancelIcon />}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdateAuthor} 
            variant="contained"
            disabled={!formData.authorName}
            startIcon={<SaveIcon />}
          >
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para eliminar autor */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Eliminar Autor</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar al autor "{selectedAuthor?.authorName}"?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteAuthor} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para ver detalles */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalles del Autor</DialogTitle>
        <DialogContent>
          {selectedAuthor && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="body2" color="text.secondary">Nombre:</Typography>
                  <Typography variant="body1">{selectedAuthor.authorName}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="body2" color="text.secondary">País:</Typography>
                  <Typography variant="body1">{getCountryName(selectedAuthor.countryId)}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="body2" color="text.secondary">Fecha de nacimiento:</Typography>
                  <Typography variant="body1">
                    {selectedAuthor.birthDate
                      ? new Date(selectedAuthor.birthDate).toLocaleDateString()
                      : 'No especificada'
                    }
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="body2" color="text.secondary">Fecha de fallecimiento:</Typography>
                  <Typography variant="body1">
                    {selectedAuthor.deathDate
                      ? new Date(selectedAuthor.deathDate).toLocaleDateString()
                      : 'No especificada'
                    }
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Biografía:</Typography>
                <Typography variant="body1">{selectedAuthor.authorBio || 'No especificada'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="body2" color="text.secondary">Sitio web:</Typography>
                  <Typography variant="body1">
                    {selectedAuthor.websiteUrl ? (
                      <a href={selectedAuthor.websiteUrl} target="_blank" rel="noopener noreferrer">
                        {selectedAuthor.websiteUrl}
                      </a>
                    ) : 'No especificado'}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="body2" color="text.secondary">Fecha de creación:</Typography>
                  <Typography variant="body1">{new Date(selectedAuthor.createdAt).toLocaleString()}</Typography>
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
    </Container>
  );
};

export default AdminAuthorsPage;
