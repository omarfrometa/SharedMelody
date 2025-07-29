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
  Tooltip,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';

import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  AdminPanelSettings as RoleIcon,
  Save as SaveIcon,
  Security as PermissionIcon,
  Check as CheckIcon
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';

// Tipos para roles
interface Role {
  roleId: string;
  roleName: string;
  description?: string;
  permissions: string[];
  totalUsers?: number;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
}

interface CreateRole {
  roleName: string;
  description?: string;
  permissions: string[];
}

const AVAILABLE_PERMISSIONS = [
  { id: 'users.read', name: 'Ver usuarios', description: 'Puede ver la lista de usuarios' },
  { id: 'users.create', name: 'Crear usuarios', description: 'Puede crear nuevos usuarios' },
  { id: 'users.update', name: 'Editar usuarios', description: 'Puede modificar usuarios existentes' },
  { id: 'users.delete', name: 'Eliminar usuarios', description: 'Puede eliminar usuarios' },
  { id: 'songs.read', name: 'Ver canciones', description: 'Puede ver la lista de canciones' },
  { id: 'songs.create', name: 'Crear canciones', description: 'Puede crear nuevas canciones' },
  { id: 'songs.update', name: 'Editar canciones', description: 'Puede modificar canciones existentes' },
  { id: 'songs.delete', name: 'Eliminar canciones', description: 'Puede eliminar canciones' },
  { id: 'songs.moderate', name: 'Moderar canciones', description: 'Puede aprobar/rechazar canciones' },
  { id: 'albums.manage', name: 'Gestionar álbumes', description: 'Puede gestionar álbumes' },
  { id: 'artists.manage', name: 'Gestionar artistas', description: 'Puede gestionar artistas' },
  { id: 'admin.access', name: 'Acceso admin', description: 'Puede acceder al panel de administración' },
  { id: 'system.manage', name: 'Gestión sistema', description: 'Puede gestionar configuración del sistema' }
];

const AdminRolesPage: React.FC = () => {
  const { user, hasRole } = useAuth();

  // Estados principales
  const [roles, setRoles] = useState<Role[]>([]);
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
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState<CreateRole>({
    roleName: '',
    description: '',
    permissions: []
  });

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && hasRole('admin')) {
      loadRoles();
    }
  }, [user, page, rowsPerPage, searchTerm]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulación de datos - reemplazar con llamada real a la API
      const mockRoles: Role[] = [
        {
          roleId: '1',
          roleName: 'admin',
          description: 'Administrador del sistema con todos los permisos',
          permissions: AVAILABLE_PERMISSIONS.map(p => p.id),
          totalUsers: 2,
          isActive: true,
          isSystem: true,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          roleId: '2',
          roleName: 'moderator',
          description: 'Moderador de contenido',
          permissions: ['songs.read', 'songs.moderate', 'users.read', 'admin.access'],
          totalUsers: 5,
          isActive: true,
          isSystem: false,
          createdAt: '2024-01-02T00:00:00Z'
        },
        {
          roleId: '3',
          roleName: 'user',
          description: 'Usuario estándar',
          permissions: ['songs.read', 'songs.create'],
          totalUsers: 150,
          isActive: true,
          isSystem: true,
          createdAt: '2024-01-03T00:00:00Z'
        },
        {
          roleId: '4',
          roleName: 'artist',
          description: 'Artista verificado',
          permissions: ['songs.read', 'songs.create', 'songs.update', 'albums.manage', 'artists.manage'],
          totalUsers: 25,
          isActive: true,
          isSystem: false,
          createdAt: '2024-01-04T00:00:00Z'
        }
      ];

      // Filtrar por término de búsqueda
      const filteredRoles = searchTerm
        ? mockRoles.filter(role =>
            role.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            role.description?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : mockRoles;

      setRoles(filteredRoles);
      setTotalCount(filteredRoles.length);
    } catch (err: any) {
      setError(err.message || 'Error al cargar roles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      setSubmitting(true);
      
      // Aquí iría la llamada a la API para crear el rol
      console.log('Creando rol:', formData);
      
      // Simulación de creación exitosa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCreateDialogOpen(false);
      resetForm();
      loadRoles();
    } catch (err: any) {
      setError(err.message || 'Error al crear rol');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;

    try {
      setSubmitting(true);
      
      // Aquí iría la llamada a la API para actualizar el rol
      console.log('Actualizando rol:', { ...formData, roleId: selectedRole.roleId });
      
      // Simulación de actualización exitosa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEditDialogOpen(false);
      resetForm();
      setSelectedRole(null);
      loadRoles();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar rol');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      setSubmitting(true);
      
      // Aquí iría la llamada a la API para eliminar el rol
      console.log('Eliminando rol:', selectedRole.roleId);
      
      // Simulación de eliminación exitosa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDeleteDialogOpen(false);
      setSelectedRole(null);
      loadRoles();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar rol');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      roleName: '',
      description: '',
      permissions: []
    });
  };

  const handleInputChange = (field: keyof CreateRole, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      roleName: role.roleName,
      description: role.description || '',
      permissions: [...role.permissions]
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (role: Role) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  const openViewDialog = (role: Role) => {
    setSelectedRole(role);
    setViewDialogOpen(true);
  };

  const getPermissionName = (permissionId: string) => {
    const permission = AVAILABLE_PERMISSIONS.find(p => p.id === permissionId);
    return permission ? permission.name : permissionId;
  };

  if (!user || !hasRole('admin')) {
    return (
      <AdminLayout title="Acceso Denegado">
        <Alert severity="error">
          No tienes permisos para acceder a la gestión de roles.
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Administración de Roles">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestión de Roles
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setCreateDialogOpen(true);
          }}
        >
          Nuevo Rol
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
            label="Buscar roles"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            placeholder="Buscar por nombre o descripción..."
          />
        </CardContent>
      </Card>

      {/* Tabla de roles */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre del Rol</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Permisos</TableCell>
                <TableCell>Usuarios</TableCell>
                <TableCell>Tipo</TableCell>
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
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No se encontraron roles
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.roleId}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <RoleIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="subtitle2">
                          {role.roleName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {role.description || 'Sin descripción'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${role.permissions.length} permisos`}
                        variant="outlined"
                        size="small"
                        onClick={() => openViewDialog(role)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </TableCell>
                    <TableCell>{role.totalUsers || 0}</TableCell>
                    <TableCell>
                      <Chip
                        label={role.isSystem ? 'Sistema' : 'Personalizado'}
                        color={role.isSystem ? 'default' : 'primary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={role.isActive ? 'Activo' : 'Inactivo'}
                        color={role.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Ver permisos">
                        <IconButton onClick={() => openViewDialog(role)}>
                          <PermissionIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton 
                          onClick={() => openEditDialog(role)}
                          disabled={role.isSystem}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={role.isSystem ? "No se puede eliminar rol del sistema" : "Eliminar"}>
                        <span>
                          <IconButton 
                            onClick={() => openDeleteDialog(role)} 
                            color="error"
                            disabled={role.isSystem}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </span>
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
        <DialogTitle>Crear Nuevo Rol</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Nombre del Rol"
              value={formData.roleName}
              onChange={(e) => handleInputChange('roleName', e.target.value)}
              required
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Descripción"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
            <Box>
              <Typography variant="h6" gutterBottom>
                Permisos
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <List dense>
                  {AVAILABLE_PERMISSIONS.map((permission) => (
                    <ListItem key={permission.id}>
                      <ListItemIcon>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.permissions.includes(permission.id)}
                              onChange={() => handlePermissionToggle(permission.id)}
                            />
                          }
                          label=""
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={permission.name}
                        secondary={permission.description}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateRole}
            variant="contained"
            disabled={submitting || !formData.roleName}
            startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {submitting ? 'Creando...' : 'Crear Rol'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de visualización de permisos */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Permisos del Rol: {selectedRole?.roleName}
        </DialogTitle>
        <DialogContent>
          {selectedRole && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedRole.description}
              </Typography>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Permisos ({selectedRole.permissions.length})
              </Typography>
              <List dense>
                {selectedRole.permissions.map((permissionId) => (
                  <ListItem key={permissionId}>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={getPermissionName(permissionId)}
                      secondary={AVAILABLE_PERMISSIONS.find(p => p.id === permissionId)?.description}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el rol "{selectedRole?.roleName}"?
            {selectedRole?.totalUsers && selectedRole.totalUsers > 0 && (
              <>
                <br />
                <strong>Advertencia:</strong> Este rol tiene {selectedRole.totalUsers} usuarios asignados.
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
            onClick={handleDeleteRole}
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

export default AdminRolesPage;
