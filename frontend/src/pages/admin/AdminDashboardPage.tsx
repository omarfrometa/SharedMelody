import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  CircularProgress,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  People as UsersIcon,
  MusicNote as SongsIcon,
  RequestPage as RequestsIcon,
  Group as CollaborationsIcon,
  TrendingUp as TrendingIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Cancel as CancelIcon,
  Album as AlbumsIcon,
  Person as ArtistsIcon,
  Security as AuthProvidersIcon,
  Edit as AuthorsIcon,
  Public as CountriesIcon,
  AdminPanelSettings as RolesIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardStats } from '../../types/admin';
import { adminService } from '../../services/adminService';

const AdminDashboardPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && hasRole && hasRole('admin')) {
      loadDashboardStats();
    }
  }, [user, hasRole]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const dashboardStats = await adminService.getDashboardStats();
      setStats(dashboardStats);
    } catch (err: any) {
      console.error('Error al cargar estadísticas:', err);
      setError(err.message || 'Error al cargar estadísticas');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !hasRole('admin')) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          No tienes permisos para acceder al panel de administración.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={loadDashboardStats}>
            Reintentar
          </Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!stats) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          No se pudieron cargar las estadísticas del dashboard.
        </Alert>
        <Button variant="contained" onClick={loadDashboardStats}>
          Cargar estadísticas
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Panel de Administración
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Bienvenido al panel de administración de SharedMelody. Aquí puedes gestionar usuarios, canciones, solicitudes y más.
      </Typography>

      {/* Menú de opciones de administración */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 3 }}>
          Opciones de Administración
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3 }}>
          {/* Gestión de Contenido */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SongsIcon color="primary" />
              Gestión de Contenido
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<SongsIcon />}
                href="/admin/songs"
                sx={{ justifyContent: 'flex-start' }}
              >
                Canciones
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<AlbumsIcon />}
                href="/admin/albums"
                sx={{ justifyContent: 'flex-start' }}
              >
                Álbumes
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<ArtistsIcon />}
                href="/admin/artists"
                sx={{ justifyContent: 'flex-start' }}
              >
                Artistas
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<AuthorsIcon />}
                href="/admin/authors"
                sx={{ justifyContent: 'flex-start' }}
              >
                Autores
              </Button>
            </Box>
          </Card>

          {/* Gestión de Usuarios */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <UsersIcon color="primary" />
              Gestión de Usuarios
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<UsersIcon />}
                href="/admin/users"
                sx={{ justifyContent: 'flex-start' }}
              >
                Usuarios
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<RolesIcon />}
                href="/admin/roles"
                sx={{ justifyContent: 'flex-start' }}
              >
                Roles
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<RequestsIcon />}
                href="/admin/requests"
                sx={{ justifyContent: 'flex-start' }}
              >
                Solicitudes
              </Button>
            </Box>
          </Card>

          {/* Configuración del Sistema */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AuthProvidersIcon color="primary" />
              Configuración del Sistema
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<CountriesIcon />}
                href="/admin/countries"
                sx={{ justifyContent: 'flex-start' }}
              >
                Países
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<AuthProvidersIcon />}
                href="/admin/auth-providers"
                sx={{ justifyContent: 'flex-start' }}
              >
                Proveedores de Autenticación
              </Button>
            </Box>
          </Card>
        </Box>
      </Box>

      {stats && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Estadísticas principales */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ minWidth: 250, flex: '1 1 250px' }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <UsersIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" component="div">
                        {stats.users.total.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Usuarios totales
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        +{stats.users.newThisMonth} este mes
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" href="/admin/users">Ver usuarios</Button>
                </CardActions>
              </Card>
            </Box>

            <Box sx={{ minWidth: 250, flex: '1 1 250px' }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <SongsIcon color="secondary" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" component="div">
                        {stats.songs.total.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Canciones totales
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        +{stats.songs.newThisMonth} este mes
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" href="/admin/songs">Ver canciones</Button>
                </CardActions>
              </Card>
            </Box>

            <Box sx={{ minWidth: 250, flex: '1 1 250px' }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <RequestsIcon color="info" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" component="div">
                        {stats.requests.total.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Solicitudes totales
                      </Typography>
                      <Typography variant="caption" color="warning.main">
                        {stats.requests.pending} pendientes
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" href="/admin/requests">Ver solicitudes</Button>
                </CardActions>
              </Card>
            </Box>

            <Box sx={{ minWidth: 250, flex: '1 1 250px' }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <CollaborationsIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" component="div">
                        {stats.collaborations.total.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Colaboraciones
                      </Typography>
                      <Typography variant="caption" color="info.main">
                        {stats.collaborations.activeUsers} usuarios activos
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Estado de canciones */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ minWidth: 400, flex: '1 1 400px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Estado de las Canciones
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2">Aprobadas</Typography>
                      <Chip
                        icon={<CheckIcon />}
                        label={stats.songs.approved}
                        color="success"
                        size="small"
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(stats.songs.approved / stats.songs.total) * 100}
                      color="success"
                      sx={{ mb: 2 }}
                    />

                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2">Pendientes</Typography>
                      <Chip
                        icon={<PendingIcon />}
                        label={stats.songs.pending}
                        color="warning"
                        size="small"
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(stats.songs.pending / stats.songs.total) * 100}
                      color="warning"
                      sx={{ mb: 2 }}
                    />

                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2">Rechazadas</Typography>
                      <Chip
                        icon={<CancelIcon />}
                        label={stats.songs.rejected}
                        color="error"
                        size="small"
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(stats.songs.rejected / stats.songs.total) * 100}
                      color="error"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Estadísticas de solicitudes */}
            <Box sx={{ minWidth: 400, flex: '1 1 400px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Rendimiento de Solicitudes
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tasa de cumplimiento
                    </Typography>
                    <Typography variant="h4" color="primary.main">
                      {stats.requests.completionRate.toFixed(1)}%
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tiempo promedio de cumplimiento
                    </Typography>
                    <Typography variant="h6">
                      {Math.round(stats.requests.averageCompletionTime)} días
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" justifyContent="space-between">
                    <Box textAlign="center">
                      <Typography variant="h6" color="success.main">
                        {stats.requests.completed}
                      </Typography>
                      <Typography variant="caption">Completadas</Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography variant="h6" color="warning.main">
                        {stats.requests.pending}
                      </Typography>
                      <Typography variant="caption">Pendientes</Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography variant="h6" color="error.main">
                        {stats.requests.rejected}
                      </Typography>
                      <Typography variant="caption">Rechazadas</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Géneros más populares */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ minWidth: 400, flex: '1 1 400px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Géneros Más Populares
                  </Typography>
                  <List dense>
                    {Object.entries(stats.songs.byGenre)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([genre, count]) => (
                        <ListItem key={genre} divider>
                          <ListItemIcon>
                            <TrendingIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={genre}
                            secondary={`${count} canciones`}
                          />
                        </ListItem>
                      ))}
                  </List>
                </CardContent>
              </Card>
            </Box>

            {/* Información del sistema */}
            <Box sx={{ minWidth: 400, flex: '1 1 400px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Estado del Sistema
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Almacenamiento utilizado
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      <LinearProgress
                        variant="determinate"
                        value={(stats.system.usedStorage / stats.system.totalStorage) * 100}
                        sx={{ flexGrow: 1, mr: 2 }}
                      />
                      <Typography variant="body2">
                        {((stats.system.usedStorage / stats.system.totalStorage) * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="success.main">
                        {stats.system.emailsSent}
                      </Typography>
                      <Typography variant="caption">Emails enviados</Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography variant="h6" color="error.main">
                        {stats.system.emailsFailed}
                      </Typography>
                      <Typography variant="caption">Emails fallidos</Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography variant="h6" color="info.main">
                        {stats.system.activeSessions}
                      </Typography>
                      <Typography variant="caption">Sesiones activas</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Acciones rápidas */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Módulos de Administración
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<UsersIcon />}
                    href="/admin/users"
                    sx={{ justifyContent: 'flex-start', p: 2 }}
                  >
                    Administración de Usuarios
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<SongsIcon />}
                    href="/admin/songs"
                    sx={{ justifyContent: 'flex-start', p: 2 }}
                  >
                    Administración de Canciones
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AlbumsIcon />}
                    href="/admin/albums"
                    sx={{ justifyContent: 'flex-start', p: 2 }}
                  >
                    Administración de Álbumes
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ArtistsIcon />}
                    href="/admin/artists"
                    sx={{ justifyContent: 'flex-start', p: 2 }}
                  >
                    Administración de Artistas
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AuthorsIcon />}
                    href="/admin/authors"
                    sx={{ justifyContent: 'flex-start', p: 2 }}
                  >
                    Administración de Autores
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CountriesIcon />}
                    href="/admin/countries"
                    sx={{ justifyContent: 'flex-start', p: 2 }}
                  >
                    Administración de Países
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AuthProvidersIcon />}
                    href="/admin/auth-providers"
                    sx={{ justifyContent: 'flex-start', p: 2 }}
                  >
                    Proveedores de Autenticación
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<RolesIcon />}
                    href="/admin/roles"
                    sx={{ justifyContent: 'flex-start', p: 2 }}
                  >
                    Administración de Roles
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<RequestsIcon />}
                    href="/admin/requests"
                    sx={{ justifyContent: 'flex-start', p: 2 }}
                  >
                    Ver Solicitudes
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default AdminDashboardPage;
