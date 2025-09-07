import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
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

  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,

  Avatar
} from '@mui/material';

import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Album as AlbumIcon,
  Person as ArtistIcon,
  CalendarToday as DateIcon,
  MusicNote as SongsIcon,
  Save as SaveIcon
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';

// Tipos para álbumes
interface Album {
  albumId: string;
  albumName: string;
  artistId?: string;
  artistName?: string;
  releaseYear?: number;
  albumCover?: string;
  description?: string;
  totalTracks?: number;
  isActive: boolean;
  createdAt: string;
}

interface CreateAlbum {
  albumName: string;
  artistId?: string;
  releaseYear?: number;
  albumCover?: string;
  description?: string;
}

interface UpdateAlbum extends CreateAlbum {
  albumId: string;
}

interface AlbumFilters {
  search?: string;
  artistId?: string;
  releaseYear?: number;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

const AdminAlbumsPage: React.FC = () => {
  const { user, hasRole } = useAuth();

  // Estados principales
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Estados de filtros
  const [filters, setFilters] = useState<AlbumFilters>({});

  // Estados de diálogos
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState<CreateAlbum>({
    albumName: '',
    artistId: '',
    releaseYear: new Date().getFullYear(),
    albumCover: '',
    description: ''
  });

  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && hasRole('admin')) {
      loadAlbums();
      loadArtists();
    }
  }, [user, page, rowsPerPage, filters]);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulación de datos - reemplazar con llamada real a la API
      const mockAlbums: Album[] = [
        {
          albumId: '1',
          albumName: 'Thriller',
          artistId: '1',
          artistName: 'Michael Jackson',
          releaseYear: 1982,
          albumCover: 'https://example.com/thriller.jpg',
          description: 'Álbum icónico de Michael Jackson',
          totalTracks: 9,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          albumId: '2',
          albumName: 'Back in Black',
          artistId: '2',
          artistName: 'AC/DC',
          releaseYear: 1980,
          albumCover: 'https://example.com/backinblack.jpg',
          description: 'Álbum clásico de rock',
          totalTracks: 10,
          isActive: true,
          createdAt: '2024-01-02T00:00:00Z'
        }
      ];

      setAlbums(mockAlbums);
      setTotalCount(mockAlbums.length);
    } catch (err: any) {
      setError(err.message || 'Error al cargar álbumes');
    } finally {
      setLoading(false);
    }
  };

  const loadArtists = async () => {
    try {
      // Simulación de datos - reemplazar con llamada real a la API
      const mockArtists = [
        { artistId: '1', artistName: 'Michael Jackson' },
        { artistId: '2', artistName: 'AC/DC' },
        { artistId: '3', artistName: 'The Beatles' }
      ];
      setArtists(mockArtists);
    } catch (err: any) {
      console.error('Error al cargar artistas:', err);
    }
  };

  const handleCreateAlbum = async () => {
    try {
      setSubmitting(true);
      
      // Aquí iría la llamada a la API para crear el álbum
      console.log('Creando álbum:', formData);
      
      // Simulación de creación exitosa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCreateDialogOpen(false);
      resetForm();
      loadAlbums();
    } catch (err: any) {
      setError(err.message || 'Error al crear álbum');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAlbum = async () => {
    if (!selectedAlbum) return;

    try {
      setSubmitting(true);
      
      // Aquí iría la llamada a la API para actualizar el álbum
      console.log('Actualizando álbum:', { ...formData, albumId: selectedAlbum.albumId });
      
      // Simulación de actualización exitosa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEditDialogOpen(false);
      resetForm();
      setSelectedAlbum(null);
      loadAlbums();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar álbum');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAlbum = async () => {
    if (!selectedAlbum) return;

    try {
      setSubmitting(true);
      
      // Aquí iría la llamada a la API para eliminar el álbum
      console.log('Eliminando álbum:', selectedAlbum.albumId);
      
      // Simulación de eliminación exitosa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDeleteDialogOpen(false);
      setSelectedAlbum(null);
      loadAlbums();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar álbum');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      albumName: '',
      artistId: '',
      releaseYear: new Date().getFullYear(),
      albumCover: '',
      description: ''
    });
  };

  const handleInputChange = (field: keyof CreateAlbum, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const openEditDialog = (album: Album) => {
    setSelectedAlbum(album);
    setFormData({
      albumName: album.albumName,
      artistId: album.artistId || '',
      releaseYear: album.releaseYear || new Date().getFullYear(),
      albumCover: album.albumCover || '',
      description: album.description || ''
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (album: Album) => {
    setSelectedAlbum(album);
    setDeleteDialogOpen(true);
  };

  const openViewDialog = (album: Album) => {
    setSelectedAlbum(album);
    setViewDialogOpen(true);
  };

  if (!user || !hasRole('admin')) {
    return (
      <AdminLayout title="Acceso Denegado">
        <Alert severity="error">
          No tienes permisos para acceder a la gestión de álbumes.
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Administración de Álbumes">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestión de Álbumes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setCreateDialogOpen(true);
          }}
        >
          Nuevo Álbum
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filtros
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            <TextField
              fullWidth
              label="Buscar álbumes"
              value={filters.search || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Artista</InputLabel>
              <Select
                value={filters.artistId || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, artistId: e.target.value }))}
                label="Artista"
              >
                <MenuItem value="">Todos los artistas</MenuItem>
                {artists.map((artist) => (
                  <MenuItem key={artist.artistId} value={artist.artistId}>
                    {artist.artistName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="number"
              label="Año de lanzamiento"
              value={filters.releaseYear || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, releaseYear: parseInt(e.target.value) || undefined }))}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Tabla de álbumes */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Portada</TableCell>
                <TableCell>Nombre del Álbum</TableCell>
                <TableCell>Artista</TableCell>
                <TableCell>Año</TableCell>
                <TableCell>Canciones</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : albums.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No se encontraron álbumes
                  </TableCell>
                </TableRow>
              ) : (
                albums.map((album) => (
                  <TableRow key={album.albumId}>
                    <TableCell>
                      <Avatar
                        src={album.albumCover}
                        alt={album.albumName}
                        variant="rounded"
                        sx={{ width: 56, height: 56 }}
                      >
                        <AlbumIcon />
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {album.albumName}
                      </Typography>
                      {album.description && (
                        <Typography variant="caption" color="text.secondary">
                          {album.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{album.artistName || 'Sin artista'}</TableCell>
                    <TableCell>{album.releaseYear || 'N/A'}</TableCell>
                    <TableCell>{album.totalTracks || 0}</TableCell>
                    <TableCell>
                      <Chip
                        label={album.isActive ? 'Activo' : 'Inactivo'}
                        color={album.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Ver detalles">
                        <IconButton onClick={() => openViewDialog(album)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton onClick={() => openEditDialog(album)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton onClick={() => openDeleteDialog(album)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      {/* Diálogo de creación */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Crear Nuevo Álbum</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Nombre del Álbum"
              value={formData.albumName}
              onChange={(e) => handleInputChange('albumName', e.target.value)}
              required
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Artista</InputLabel>
                <Select
                  value={formData.artistId || ''}
                  onChange={(e) => handleInputChange('artistId', e.target.value)}
                  label="Artista"
                >
                  <MenuItem value="">Sin artista</MenuItem>
                  {artists.map((artist) => (
                    <MenuItem key={artist.artistId} value={artist.artistId}>
                      {artist.artistName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                type="number"
                label="Año de Lanzamiento"
                value={formData.releaseYear}
                onChange={(e) => handleInputChange('releaseYear', parseInt(e.target.value))}
                inputProps={{ min: 1900, max: new Date().getFullYear() + 10 }}
              />
            </Box>
            <TextField
              fullWidth
              label="URL de la Portada"
              value={formData.albumCover}
              onChange={(e) => handleInputChange('albumCover', e.target.value)}
              placeholder="https://ejemplo.com/portada.jpg"
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Descripción"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateAlbum}
            variant="contained"
            disabled={submitting || !formData.albumName}
            startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {submitting ? 'Creando...' : 'Crear Álbum'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de edición */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Editar Álbum</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Nombre del Álbum"
              value={formData.albumName}
              onChange={(e) => handleInputChange('albumName', e.target.value)}
              required
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Artista</InputLabel>
                <Select
                  value={formData.artistId || ''}
                  onChange={(e) => handleInputChange('artistId', e.target.value)}
                  label="Artista"
                >
                  <MenuItem value="">Sin artista</MenuItem>
                  {artists.map((artist) => (
                    <MenuItem key={artist.artistId} value={artist.artistId}>
                      {artist.artistName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                type="number"
                label="Año de Lanzamiento"
                value={formData.releaseYear}
                onChange={(e) => handleInputChange('releaseYear', parseInt(e.target.value))}
                inputProps={{ min: 1900, max: new Date().getFullYear() + 10 }}
              />
            </Box>
            <TextField
              fullWidth
              label="URL de la Portada"
              value={formData.albumCover}
              onChange={(e) => handleInputChange('albumCover', e.target.value)}
              placeholder="https://ejemplo.com/portada.jpg"
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Descripción"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpdateAlbum}
            variant="contained"
            disabled={submitting || !formData.albumName}
            startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {submitting ? 'Actualizando...' : 'Actualizar Álbum'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el álbum "{selectedAlbum?.albumName}"?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteAlbum}
            color="error"
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {submitting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de visualización */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalles del Álbum</DialogTitle>
        <DialogContent>
          {selectedAlbum && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 2, mt: 1 }}>
              <Avatar
                src={selectedAlbum.albumCover}
                alt={selectedAlbum.albumName}
                variant="rounded"
                sx={{ width: '100%', height: 200 }}
              >
                <AlbumIcon sx={{ fontSize: 80 }} />
              </Avatar>
              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedAlbum.albumName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <ArtistIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Artista: {selectedAlbum.artistName || 'Sin artista'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <DateIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Año: {selectedAlbum.releaseYear || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <SongsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Canciones: {selectedAlbum.totalTracks || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Estado:
                  <Chip
                    label={selectedAlbum.isActive ? 'Activo' : 'Inactivo'}
                    color={selectedAlbum.isActive ? 'success' : 'error'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                {selectedAlbum.description && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Descripción:
                    </Typography>
                    <Typography variant="body2">
                      {selectedAlbum.description}
                    </Typography>
                  </Box>
                )}
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
    </AdminLayout>
  );
};

export default AdminAlbumsPage;
