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

  Paper
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as ActivateIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as ExportIcon,
  PersonAdd as AddUserIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { User, UserRole } from '../../types/user';
import { AdminUserFilters, UpdateUserRole, UpdateUserStatus } from '../../types/admin';
import { adminService } from '../../services/adminService';

const AdminUsersPage: React.FC = () => {
  const { user: currentUser, hasRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filters, setFilters] = useState<AdminUserFilters>({
    page: 1,
    limit: 25,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // Estados para diálogos
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editRoleDialogOpen, setEditRoleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // Estados para formularios
  const [newRole, setNewRole] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [statusChangeReason, setStatusChangeReason] = useState('');

  // Roles disponibles
  const [availableRoles] = useState<UserRole[]>([
    { roleId: '1', roleName: 'user', roleDescription: 'Usuario regular', permissions: {}, createdAt: '' },
    { roleId: '2', roleName: 'moderator', roleDescription: 'Moderador', permissions: {}, createdAt: '' },
    { roleId: '3', roleName: 'admin', roleDescription: 'Administrador', permissions: {}, createdAt: '' }
  ]);

  useEffect(() => {
    if (currentUser && hasRole('admin')) {
      loadUsers();
    }
  }, [currentUser, filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getUsers(filters);
      setUsers(response.data);
      setTotalUsers(response.pagination.total);
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof AdminUserFilters, value: any) => {
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

  const handleUpdateUserRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      const updateData: UpdateUserRole = {
        userId: selectedUser.userId,
        roleId: newRole,
        reason: `Cambio de rol realizado por ${currentUser?.username}`
      };
      
      await adminService.updateUserRole(updateData);
      await loadUsers();
      setEditRoleDialogOpen(false);
      setSelectedUser(null);
      setNewRole('');
    } catch (err: any) {
      setError(err.message || 'Error al actualizar rol');
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      const updateData: UpdateUserStatus = {
        userId: user.userId,
        isActive: !user.isActive,
        reason: statusChangeReason || `Cambio de estado realizado por ${currentUser?.username}`
      };
      
      await adminService.updateUserStatus(updateData);
      await loadUsers();
      setStatusChangeReason('');
    } catch (err: any) {
      setError(err.message || 'Error al cambiar estado del usuario');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await adminService.deleteUser(selectedUser.userId, deleteReason);
      await loadUsers();
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      setDeleteReason('');
    } catch (err: any) {
      setError(err.message || 'Error al eliminar usuario');
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'admin': return 'error';
      case 'moderator': return 'warning';
      case 'user': return 'primary';
      default: return 'default';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  if (!currentUser || !hasRole('admin')) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          No tienes permisos para acceder a la gestión de usuarios.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestión de Usuarios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddUserIcon />}
          onClick={() => {/* Implementar crear usuario */}}
        >
          Nuevo Usuario
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
                placeholder="Email, username..."
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Box>

            <Box sx={{ minWidth: 150 }}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={filters.roleId || ''}
                  onChange={(e) => handleFilterChange('roleId', e.target.value)}
                  label="Rol"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {availableRoles.map((role) => (
                    <MenuItem key={role.roleId} value={role.roleId}>
                      {role.roleName}
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
              <FormControl fullWidth>
                <InputLabel>Email verificado</InputLabel>
                <Select
                  value={filters.emailVerified?.toString() || ''}
                  onChange={(e) => handleFilterChange('emailVerified', e.target.value === 'true')}
                  label="Email verificado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="true">Verificados</MenuItem>
                  <MenuItem value="false">No verificados</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ minWidth: 200 }}>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={loadUsers}
                  fullWidth
                >
                  Filtrar
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  onClick={() => {/* Implementar exportar */}}
                >
                  Exportar
                </Button>
              </Box>
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

      {/* Tabla de usuarios */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Registro</TableCell>
                <TableCell>Último acceso</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.userId} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          src={user.profilePictureUrl}
                          sx={{ mr: 2, width: 32, height: 32 }}
                        >
                          {user.firstName[0]}{user.lastName[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{user.username}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {user.email}
                        </Typography>
                        {!user.emailVerified && (
                          <Chip label="No verificado" size="small" color="warning" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role?.roleName || 'user'}
                        color={getRoleColor(user.role?.roleName || 'user') as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Activo' : 'Inactivo'}
                        color={getStatusColor(user.isActive) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.lastLogin 
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : 'Nunca'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={0.5}>
                        <Tooltip title="Ver detalles">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedUser(user);
                              setViewDialogOpen(true);
                            }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Editar rol">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.roleId);
                              setEditRoleDialogOpen(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title={user.isActive ? 'Desactivar' : 'Activar'}>
                          <IconButton
                            size="small"
                            color={user.isActive ? 'warning' : 'success'}
                            onClick={() => handleToggleUserStatus(user)}
                          >
                            {user.isActive ? <BlockIcon /> : <ActivateIcon />}
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedUser(user);
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
          count={totalUsers}
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

      {/* Dialog para editar rol */}
      <Dialog open={editRoleDialogOpen} onClose={() => setEditRoleDialogOpen(false)}>
        <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Usuario: {selectedUser?.firstName} {selectedUser?.lastName} (@{selectedUser?.username})
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Nuevo Rol</InputLabel>
            <Select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              label="Nuevo Rol"
            >
              {availableRoles.map((role) => (
                <MenuItem key={role.roleId} value={role.roleId}>
                  {role.roleName} - {role.roleDescription}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditRoleDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdateUserRole} 
            variant="contained"
            disabled={!newRole}
          >
            Actualizar Rol
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para eliminar usuario */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Eliminar Usuario</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            ¿Estás seguro de que quieres eliminar al usuario {selectedUser?.firstName} {selectedUser?.lastName}?
            Esta acción no se puede deshacer.
          </Typography>
          <TextField
            fullWidth
            label="Razón de eliminación"
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            multiline
            rows={3}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteUser} 
            color="error" 
            variant="contained"
            disabled={!deleteReason}
          >
            Eliminar Usuario
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para ver detalles */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalles del Usuario</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="body2" color="text.secondary">Nombre completo:</Typography>
                  <Typography variant="body1">{selectedUser.firstName} {selectedUser.lastName}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="body2" color="text.secondary">Username:</Typography>
                  <Typography variant="body1">@{selectedUser.username}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="body2" color="text.secondary">Email:</Typography>
                  <Typography variant="body1">{selectedUser.email}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="body2" color="text.secondary">Teléfono:</Typography>
                  <Typography variant="body1">{selectedUser.phone || 'No especificado'}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="body2" color="text.secondary">País:</Typography>
                  <Typography variant="body1">{selectedUser.country?.countryName || 'No especificado'}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="body2" color="text.secondary">Fecha de nacimiento:</Typography>
                  <Typography variant="body1">
                    {selectedUser.dateOfBirth
                      ? new Date(selectedUser.dateOfBirth).toLocaleDateString()
                      : 'No especificada'
                    }
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Biografía:</Typography>
                <Typography variant="body1">{selectedUser.bio || 'No especificada'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="body2" color="text.secondary">Fecha de registro:</Typography>
                  <Typography variant="body1">{new Date(selectedUser.createdAt).toLocaleString()}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="body2" color="text.secondary">Último acceso:</Typography>
                  <Typography variant="body1">
                    {selectedUser.lastLogin
                      ? new Date(selectedUser.lastLogin).toLocaleString()
                      : 'Nunca'
                    }
                  </Typography>
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

export default AdminUsersPage;
