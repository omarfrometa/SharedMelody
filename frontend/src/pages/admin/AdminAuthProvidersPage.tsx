import React, { useState, useEffect } from 'react';
import {
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
  Switch,
  FormControlLabel
} from '@mui/material';

import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Security as SecurityIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  GitHub as GitHubIcon,
  Twitter as TwitterIcon,
  Save as SaveIcon
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';

// Tipos para proveedores de autenticación
interface AuthProvider {
  providerId: string;
  providerName: string;
  providerType: 'oauth2' | 'saml' | 'ldap' | 'custom';
  displayName: string;
  clientId?: string;
  clientSecret?: string;
  authUrl?: string;
  tokenUrl?: string;
  userInfoUrl?: string;
  scopes?: string[];
  isEnabled: boolean;
  isConfigured: boolean;
  totalUsers?: number;
  createdAt: string;
}

interface CreateAuthProvider {
  providerName: string;
  providerType: 'oauth2' | 'saml' | 'ldap' | 'custom';
  displayName: string;
  clientId?: string;
  clientSecret?: string;
  authUrl?: string;
  tokenUrl?: string;
  userInfoUrl?: string;
  scopes?: string[];
  isEnabled: boolean;
}

const PROVIDER_TYPES = [
  { value: 'oauth2', label: 'OAuth 2.0' },
  { value: 'saml', label: 'SAML' },
  { value: 'ldap', label: 'LDAP' },
  { value: 'custom', label: 'Personalizado' }
];

const PROVIDER_ICONS: { [key: string]: React.ReactNode } = {
  google: <GoogleIcon />,
  facebook: <FacebookIcon />,
  github: <GitHubIcon />,
  twitter: <TwitterIcon />,
  default: <SecurityIcon />
};

const AdminAuthProvidersPage: React.FC = () => {
  const { user, hasRole } = useAuth();

  // Estados principales
  const [providers, setProviders] = useState<AuthProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Estados de diálogos
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState<CreateAuthProvider>({
    providerName: '',
    providerType: 'oauth2',
    displayName: '',
    clientId: '',
    clientSecret: '',
    authUrl: '',
    tokenUrl: '',
    userInfoUrl: '',
    scopes: [],
    isEnabled: true
  });

  const [selectedProvider, setSelectedProvider] = useState<AuthProvider | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && hasRole('admin')) {
      loadProviders();
    }
  }, [user, page, rowsPerPage, searchTerm, typeFilter]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulación de datos - reemplazar con llamada real a la API
      const mockProviders: AuthProvider[] = [
        {
          providerId: '1',
          providerName: 'google',
          providerType: 'oauth2',
          displayName: 'Google',
          clientId: 'google-client-id',
          clientSecret: '***hidden***',
          authUrl: 'https://accounts.google.com/oauth/authorize',
          tokenUrl: 'https://oauth2.googleapis.com/token',
          userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
          scopes: ['openid', 'email', 'profile'],
          isEnabled: true,
          isConfigured: true,
          totalUsers: 45,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          providerId: '2',
          providerName: 'facebook',
          providerType: 'oauth2',
          displayName: 'Facebook',
          clientId: 'facebook-app-id',
          clientSecret: '***hidden***',
          authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
          tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
          userInfoUrl: 'https://graph.facebook.com/me',
          scopes: ['email', 'public_profile'],
          isEnabled: false,
          isConfigured: true,
          totalUsers: 12,
          createdAt: '2024-01-02T00:00:00Z'
        },
        {
          providerId: '3',
          providerName: 'github',
          providerType: 'oauth2',
          displayName: 'GitHub',
          clientId: 'github-client-id',
          clientSecret: '***hidden***',
          authUrl: 'https://github.com/login/oauth/authorize',
          tokenUrl: 'https://github.com/login/oauth/access_token',
          userInfoUrl: 'https://api.github.com/user',
          scopes: ['user:email'],
          isEnabled: true,
          isConfigured: true,
          totalUsers: 8,
          createdAt: '2024-01-03T00:00:00Z'
        },
        {
          providerId: '4',
          providerName: 'company-ldap',
          providerType: 'ldap',
          displayName: 'LDAP Corporativo',
          authUrl: 'ldap://company.local:389',
          isEnabled: false,
          isConfigured: false,
          totalUsers: 0,
          createdAt: '2024-01-04T00:00:00Z'
        }
      ];

      // Aplicar filtros
      let filteredProviders = mockProviders;
      
      if (searchTerm) {
        filteredProviders = filteredProviders.filter(provider =>
          provider.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          provider.providerName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (typeFilter) {
        filteredProviders = filteredProviders.filter(provider => provider.providerType === typeFilter);
      }

      setProviders(filteredProviders);
      setTotalCount(filteredProviders.length);
    } catch (err: any) {
      setError(err.message || 'Error al cargar proveedores de autenticación');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProvider = async () => {
    try {
      setSubmitting(true);
      
      // Aquí iría la llamada a la API para crear el proveedor
      console.log('Creando proveedor:', formData);
      
      // Simulación de creación exitosa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCreateDialogOpen(false);
      resetForm();
      loadProviders();
    } catch (err: any) {
      setError(err.message || 'Error al crear proveedor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProvider = async () => {
    if (!selectedProvider) return;

    try {
      setSubmitting(true);
      
      // Aquí iría la llamada a la API para actualizar el proveedor
      console.log('Actualizando proveedor:', { ...formData, providerId: selectedProvider.providerId });
      
      // Simulación de actualización exitosa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEditDialogOpen(false);
      resetForm();
      setSelectedProvider(null);
      loadProviders();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar proveedor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProvider = async () => {
    if (!selectedProvider) return;

    try {
      setSubmitting(true);
      
      // Aquí iría la llamada a la API para eliminar el proveedor
      console.log('Eliminando proveedor:', selectedProvider.providerId);
      
      // Simulación de eliminación exitosa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDeleteDialogOpen(false);
      setSelectedProvider(null);
      loadProviders();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar proveedor');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      providerName: '',
      providerType: 'oauth2',
      displayName: '',
      clientId: '',
      clientSecret: '',
      authUrl: '',
      tokenUrl: '',
      userInfoUrl: '',
      scopes: [],
      isEnabled: true
    });
  };

  const handleInputChange = (field: keyof CreateAuthProvider, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const openEditDialog = (provider: AuthProvider) => {
    setSelectedProvider(provider);
    setFormData({
      providerName: provider.providerName,
      providerType: provider.providerType,
      displayName: provider.displayName,
      clientId: provider.clientId || '',
      clientSecret: '', // No mostrar el secreto por seguridad
      authUrl: provider.authUrl || '',
      tokenUrl: provider.tokenUrl || '',
      userInfoUrl: provider.userInfoUrl || '',
      scopes: provider.scopes || [],
      isEnabled: provider.isEnabled
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (provider: AuthProvider) => {
    setSelectedProvider(provider);
    setDeleteDialogOpen(true);
  };

  const openViewDialog = (provider: AuthProvider) => {
    setSelectedProvider(provider);
    setViewDialogOpen(true);
  };

  const getProviderIcon = (providerName: string) => {
    return PROVIDER_ICONS[providerName.toLowerCase()] || PROVIDER_ICONS.default;
  };

  if (!user || !hasRole('admin')) {
    return (
      <AdminLayout title="Acceso Denegado">
        <Alert severity="error">
          No tienes permisos para acceder a la gestión de proveedores de autenticación.
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Proveedores de Autenticación">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Proveedores de Autenticación
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setCreateDialogOpen(true);
          }}
        >
          Nuevo Proveedor
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
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
            <TextField
              fullWidth
              label="Buscar proveedores"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              placeholder="Buscar por nombre o tipo..."
            />
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Tipo"
              >
                <MenuItem value="">Todos los tipos</MenuItem>
                {PROVIDER_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Tabla de proveedores */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Proveedor</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Configurado</TableCell>
                <TableCell>Usuarios</TableCell>
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
              ) : providers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No se encontraron proveedores
                  </TableCell>
                </TableRow>
              ) : (
                providers.map((provider) => (
                  <TableRow key={provider.providerId}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {getProviderIcon(provider.providerName)}
                        <Box sx={{ ml: 1 }}>
                          <Typography variant="subtitle2">
                            {provider.displayName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {provider.providerName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={PROVIDER_TYPES.find(t => t.value === provider.providerType)?.label || provider.providerType}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={provider.isEnabled ? 'Habilitado' : 'Deshabilitado'}
                        color={provider.isEnabled ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={provider.isConfigured ? 'Configurado' : 'Sin configurar'}
                        color={provider.isConfigured ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{provider.totalUsers || 0}</TableCell>
                    <TableCell>
                      <Tooltip title="Ver configuración">
                        <IconButton onClick={() => openViewDialog(provider)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton onClick={() => openEditDialog(provider)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton onClick={() => openDeleteDialog(provider)} color="error">
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
        <DialogTitle>Crear Nuevo Proveedor de Autenticación</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Nombre del Proveedor"
                value={formData.providerName}
                onChange={(e) => handleInputChange('providerName', e.target.value)}
                required
                placeholder="google, facebook, github..."
              />
              <TextField
                fullWidth
                label="Nombre para Mostrar"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                required
                placeholder="Google, Facebook, GitHub..."
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>Tipo de Proveedor</InputLabel>
                <Select
                  value={formData.providerType}
                  onChange={(e) => handleInputChange('providerType', e.target.value)}
                  label="Tipo de Proveedor"
                >
                  {PROVIDER_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isEnabled}
                    onChange={(e) => handleInputChange('isEnabled', e.target.checked)}
                  />
                }
                label="Habilitado"
              />
            </Box>

            {formData.providerType === 'oauth2' && (
              <>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Client ID"
                    value={formData.clientId}
                    onChange={(e) => handleInputChange('clientId', e.target.value)}
                  />
                  <TextField
                    fullWidth
                    type="password"
                    label="Client Secret"
                    value={formData.clientSecret}
                    onChange={(e) => handleInputChange('clientSecret', e.target.value)}
                  />
                </Box>
                <TextField
                  fullWidth
                  label="URL de Autorización"
                  value={formData.authUrl}
                  onChange={(e) => handleInputChange('authUrl', e.target.value)}
                  placeholder="https://provider.com/oauth/authorize"
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    fullWidth
                    label="URL de Token"
                    value={formData.tokenUrl}
                    onChange={(e) => handleInputChange('tokenUrl', e.target.value)}
                    placeholder="https://provider.com/oauth/token"
                  />
                  <TextField
                    fullWidth
                    label="URL de Información de Usuario"
                    value={formData.userInfoUrl}
                    onChange={(e) => handleInputChange('userInfoUrl', e.target.value)}
                    placeholder="https://provider.com/api/user"
                  />
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateProvider}
            variant="contained"
            disabled={submitting || !formData.providerName || !formData.displayName}
            startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {submitting ? 'Creando...' : 'Crear Proveedor'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminAuthProvidersPage;
