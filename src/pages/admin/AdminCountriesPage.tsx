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
  Chip,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';

import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Public as CountryIcon,
  Save as SaveIcon
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';

// Tipos para países
interface Country {
  countryId: string;
  countryName: string;
  countryCode?: string;
  continent?: string;
  totalArtists?: number;
  isActive: boolean;
  createdAt: string;
}

interface CreateCountry {
  countryName: string;
  countryCode?: string;
  continent?: string;
}

const AdminCountriesPage: React.FC = () => {
  const { user, hasRole } = useAuth();

  // Estados principales
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');

  // Estados de diálogos
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState<CreateCountry>({
    countryName: '',
    countryCode: '',
    continent: ''
  });

  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && hasRole('admin')) {
      loadCountries();
    }
  }, [user, page, rowsPerPage, searchTerm]);

  const loadCountries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulación de datos - reemplazar con llamada real a la API
      const mockCountries: Country[] = [
        {
          countryId: '1',
          countryName: 'Estados Unidos',
          countryCode: 'US',
          continent: 'América del Norte',
          totalArtists: 150,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          countryId: '2',
          countryName: 'España',
          countryCode: 'ES',
          continent: 'Europa',
          totalArtists: 85,
          isActive: true,
          createdAt: '2024-01-02T00:00:00Z'
        },
        {
          countryId: '3',
          countryName: 'México',
          countryCode: 'MX',
          continent: 'América del Norte',
          totalArtists: 120,
          isActive: true,
          createdAt: '2024-01-03T00:00:00Z'
        },
        {
          countryId: '4',
          countryName: 'Reino Unido',
          countryCode: 'GB',
          continent: 'Europa',
          totalArtists: 200,
          isActive: true,
          createdAt: '2024-01-04T00:00:00Z'
        },
        {
          countryId: '5',
          countryName: 'Australia',
          countryCode: 'AU',
          continent: 'Oceanía',
          totalArtists: 45,
          isActive: true,
          createdAt: '2024-01-05T00:00:00Z'
        }
      ];

      // Filtrar por término de búsqueda
      const filteredCountries = searchTerm
        ? mockCountries.filter(country =>
            country.countryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            country.countryCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            country.continent?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : mockCountries;

      setCountries(filteredCountries);
      setTotalCount(filteredCountries.length);
    } catch (err: any) {
      setError(err.message || 'Error al cargar países');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCountry = async () => {
    try {
      setSubmitting(true);
      
      // Aquí iría la llamada a la API para crear el país
      console.log('Creando país:', formData);
      
      // Simulación de creación exitosa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCreateDialogOpen(false);
      resetForm();
      loadCountries();
    } catch (err: any) {
      setError(err.message || 'Error al crear país');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCountry = async () => {
    if (!selectedCountry) return;

    try {
      setSubmitting(true);
      
      // Aquí iría la llamada a la API para actualizar el país
      console.log('Actualizando país:', { ...formData, countryId: selectedCountry.countryId });
      
      // Simulación de actualización exitosa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEditDialogOpen(false);
      resetForm();
      setSelectedCountry(null);
      loadCountries();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar país');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCountry = async () => {
    if (!selectedCountry) return;

    try {
      setSubmitting(true);
      
      // Aquí iría la llamada a la API para eliminar el país
      console.log('Eliminando país:', selectedCountry.countryId);
      
      // Simulación de eliminación exitosa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDeleteDialogOpen(false);
      setSelectedCountry(null);
      loadCountries();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar país');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      countryName: '',
      countryCode: '',
      continent: ''
    });
  };

  const handleInputChange = (field: keyof CreateCountry, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const openEditDialog = (country: Country) => {
    setSelectedCountry(country);
    setFormData({
      countryName: country.countryName,
      countryCode: country.countryCode || '',
      continent: country.continent || ''
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (country: Country) => {
    setSelectedCountry(country);
    setDeleteDialogOpen(true);
  };

  if (!user || !hasRole('admin')) {
    return (
      <AdminLayout title="Acceso Denegado">
        <Alert severity="error">
          No tienes permisos para acceder a la gestión de países.
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Administración de Países">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestión de Países
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setCreateDialogOpen(true);
          }}
        >
          Nuevo País
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
          <TextField
            fullWidth
            label="Buscar países"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            placeholder="Buscar por nombre, código o continente..."
          />
        </CardContent>
      </Card>

      {/* Tabla de países */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre del País</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Continente</TableCell>
                <TableCell>Total Artistas</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : countries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No se encontraron países
                  </TableCell>
                </TableRow>
              ) : (
                countries.map((country) => (
                  <TableRow key={country.countryId}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <CountryIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="subtitle2">
                          {country.countryName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={country.countryCode || 'N/A'}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{country.continent || 'N/A'}</TableCell>
                    <TableCell>{country.totalArtists || 0}</TableCell>
                    <TableCell>
                      <Chip
                        label={country.isActive ? 'Activo' : 'Inactivo'}
                        color={country.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Editar">
                        <IconButton onClick={() => openEditDialog(country)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton onClick={() => openDeleteDialog(country)} color="error">
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
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nuevo País</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Nombre del País"
              value={formData.countryName}
              onChange={(e) => handleInputChange('countryName', e.target.value)}
              required
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Código del País"
                value={formData.countryCode}
                onChange={(e) => handleInputChange('countryCode', e.target.value.toUpperCase())}
                placeholder="US, ES, MX..."
                inputProps={{ maxLength: 3 }}
              />
              <TextField
                fullWidth
                label="Continente"
                value={formData.continent}
                onChange={(e) => handleInputChange('continent', e.target.value)}
                placeholder="América, Europa, Asia..."
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateCountry}
            variant="contained"
            disabled={submitting || !formData.countryName}
            startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {submitting ? 'Creando...' : 'Crear País'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de edición */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar País</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Nombre del País"
              value={formData.countryName}
              onChange={(e) => handleInputChange('countryName', e.target.value)}
              required
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Código del País"
                value={formData.countryCode}
                onChange={(e) => handleInputChange('countryCode', e.target.value.toUpperCase())}
                placeholder="US, ES, MX..."
                inputProps={{ maxLength: 3 }}
              />
              <TextField
                fullWidth
                label="Continente"
                value={formData.continent}
                onChange={(e) => handleInputChange('continent', e.target.value)}
                placeholder="América, Europa, Asia..."
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpdateCountry}
            variant="contained"
            disabled={submitting || !formData.countryName}
            startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {submitting ? 'Actualizando...' : 'Actualizar País'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el país "{selectedCountry?.countryName}"?
            {selectedCountry?.totalArtists && selectedCountry.totalArtists > 0 && (
              <>
                <br />
                <strong>Advertencia:</strong> Este país tiene {selectedCountry.totalArtists} artistas asociados.
              </>
            )}
            <br />
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteCountry}
            color="error"
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {submitting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCountriesPage;
