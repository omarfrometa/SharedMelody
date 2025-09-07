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
  Person as PersonIcon,
  Save as SaveIcon
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';

// Tipos para artistas
interface Artist {
  artistId: string;
  artistName: string;
  realName?: string;
  countryId?: string;
  countryName?: string;
  birthDate?: string;
  biography?: string;
  profileImage?: string;
  totalSongs?: number;
  totalAlbums?: number;
  isActive: boolean;
  createdAt: string;
}

interface CreateArtist {
  artistName: string;
  realName?: string;
  countryId?: string;
  birthDate?: string;
  biography?: string;
  profileImage?: string;
}

interface UpdateArtist extends CreateArtist {
  artistId: string;
}

interface ArtistFilters {
  search?: string;
  countryId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

const AdminArtistsPage: React.FC = () => {
  const { user, hasRole } = useAuth();

  // Estados principales
  const [artists, setArtists] = useState<Artist[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Estados de filtros
  const [filters, setFilters] = useState<ArtistFilters>({});

  // Estados de diálogos
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState<CreateArtist>({
    artistName: '',
    realName: '',
    countryId: '',
    birthDate: '',
    biography: '',
    profileImage: ''
  });

  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && hasRole('admin')) {
      loadArtists();
      loadCountries();
    }
  }, [user, page, rowsPerPage, filters]);

  const loadArtists = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulación de datos - reemplazar con llamada real a la API
      const mockArtists: Artist[] = [
        {
          artistId: '1',
          artistName: 'Michael Jackson',
          realName: 'Michael Joseph Jackson',
          countryId: '1',
          countryName: 'Estados Unidos',
          birthDate: '1958-08-29',
          biography: 'El Rey del Pop, uno de los artistas más influyentes de todos los tiempos.',
          profileImage: 'https://example.com/mj.jpg',
          totalSongs: 150,
          totalAlbums: 10,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          artistId: '2',
          artistName: 'AC/DC',
          realName: 'AC/DC',
          countryId: '2',
          countryName: 'Australia',
          birthDate: '1973-01-01',
          biography: 'Banda de rock australiana formada en 1973.',
          profileImage: 'https://example.com/acdc.jpg',
          totalSongs: 200,
          totalAlbums: 17,
          isActive: true,
          createdAt: '2024-01-02T00:00:00Z'
        }
      ];

      setArtists(mockArtists);
      setTotalCount(mockArtists.length);
    } catch (err: any) {
      setError(err.message || 'Error al cargar artistas');
    } finally {
      setLoading(false);
    }
  };

  const loadCountries = async () => {
    try {
      // Simulación de datos - reemplazar con llamada real a la API
      const mockCountries = [
        { countryId: '1', countryName: 'Estados Unidos' },
        { countryId: '2', countryName: 'Australia' },
        { countryId: '3', countryName: 'Reino Unido' },
        { countryId: '4', countryName: 'España' },
        { countryId: '5', countryName: 'México' }
      ];
      setCountries(mockCountries);
    } catch (err: any) {
      console.error('Error al cargar países:', err);
    }
  };

  const handleCreateArtist = async () => {
    try {
      setSubmitting(true);
      
      // Aquí iría la llamada a la API para crear el artista
      console.log('Creando artista:', formData);
      
      // Simulación de creación exitosa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCreateDialogOpen(false);
      resetForm();
      loadArtists();
    } catch (err: any) {
      setError(err.message || 'Error al crear artista');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateArtist = async () => {
    if (!selectedArtist) return;

    try {
      setSubmitting(true);
      
      // Aquí iría la llamada a la API para actualizar el artista
      console.log('Actualizando artista:', { ...formData, artistId: selectedArtist.artistId });
      
      // Simulación de actualización exitosa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEditDialogOpen(false);
      resetForm();
      setSelectedArtist(null);
      loadArtists();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar artista');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteArtist = async () => {
    if (!selectedArtist) return;

    try {
      setSubmitting(true);
      
      // Aquí iría la llamada a la API para eliminar el artista
      console.log('Eliminando artista:', selectedArtist.artistId);
      
      // Simulación de eliminación exitosa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDeleteDialogOpen(false);
      setSelectedArtist(null);
      loadArtists();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar artista');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      artistName: '',
      realName: '',
      countryId: '',
      birthDate: '',
      biography: '',
      profileImage: ''
    });
  };

  const handleInputChange = (field: keyof CreateArtist, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const openEditDialog = (artist: Artist) => {
    setSelectedArtist(artist);
    setFormData({
      artistName: artist.artistName,
      realName: artist.realName || '',
      countryId: artist.countryId || '',
      birthDate: artist.birthDate || '',
      biography: artist.biography || '',
      profileImage: artist.profileImage || ''
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (artist: Artist) => {
    setSelectedArtist(artist);
    setDeleteDialogOpen(true);
  };

  const openViewDialog = (artist: Artist) => {
    setSelectedArtist(artist);
    setViewDialogOpen(true);
  };

  if (!user || !hasRole('admin')) {
    return (
      <AdminLayout title="Acceso Denegado">
        <Alert severity="error">
          No tienes permisos para acceder a la gestión de artistas.
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Administración de Artistas">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestión de Artistas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setCreateDialogOpen(true);
          }}
        >
          Nuevo Artista
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
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              fullWidth
              label="Buscar artistas"
              value={filters.search || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <FormControl fullWidth>
              <InputLabel>País</InputLabel>
              <Select
                value={filters.countryId || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, countryId: e.target.value }))}
                label="País"
              >
                <MenuItem value="">Todos los países</MenuItem>
                {countries.map((country) => (
                  <MenuItem key={country.countryId} value={country.countryId}>
                    {country.countryName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Tabla de artistas */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Foto</TableCell>
                <TableCell>Nombre Artístico</TableCell>
                <TableCell>Nombre Real</TableCell>
                <TableCell>País</TableCell>
                <TableCell>Canciones</TableCell>
                <TableCell>Álbumes</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : artists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No se encontraron artistas
                  </TableCell>
                </TableRow>
              ) : (
                artists.map((artist) => (
                  <TableRow key={artist.artistId}>
                    <TableCell>
                      <Avatar
                        src={artist.profileImage}
                        alt={artist.artistName}
                        sx={{ width: 56, height: 56 }}
                      >
                        <PersonIcon />
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {artist.artistName}
                      </Typography>
                      {artist.birthDate && (
                        <Typography variant="caption" color="text.secondary">
                          Nacido: {new Date(artist.birthDate).toLocaleDateString()}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{artist.realName || 'N/A'}</TableCell>
                    <TableCell>{artist.countryName || 'N/A'}</TableCell>
                    <TableCell>{artist.totalSongs || 0}</TableCell>
                    <TableCell>{artist.totalAlbums || 0}</TableCell>
                    <TableCell>
                      <Chip
                        label={artist.isActive ? 'Activo' : 'Inactivo'}
                        color={artist.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Ver detalles">
                        <IconButton onClick={() => openViewDialog(artist)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton onClick={() => openEditDialog(artist)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton onClick={() => openDeleteDialog(artist)} color="error">
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

      {/* Diálogos - Crear */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Crear Nuevo Artista</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Nombre Artístico"
                value={formData.artistName}
                onChange={(e) => handleInputChange('artistName', e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Nombre Real"
                value={formData.realName}
                onChange={(e) => handleInputChange('realName', e.target.value)}
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>País</InputLabel>
                <Select
                  value={formData.countryId || ''}
                  onChange={(e) => handleInputChange('countryId', e.target.value)}
                  label="País"
                >
                  <MenuItem value="">Sin especificar</MenuItem>
                  {countries.map((country) => (
                    <MenuItem key={country.countryId} value={country.countryId}>
                      {country.countryName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                type="date"
                label="Fecha de Nacimiento"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <TextField
              fullWidth
              label="URL de la Foto"
              value={formData.profileImage}
              onChange={(e) => handleInputChange('profileImage', e.target.value)}
              placeholder="https://ejemplo.com/foto.jpg"
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Biografía"
              value={formData.biography}
              onChange={(e) => handleInputChange('biography', e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateArtist}
            variant="contained"
            disabled={submitting || !formData.artistName}
            startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {submitting ? 'Creando...' : 'Crear Artista'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminArtistsPage;
