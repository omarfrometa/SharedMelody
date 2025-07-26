import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Paper,
  Chip
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as ThemeIcon,
  Language as LanguageIcon,
  PhotoCamera as CameraIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Formulario de perfil
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });

  // Formulario de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Configuración de notificaciones
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    requestFulfilled: true,
    collaborationInvites: true,
    songApproved: true,
    songRejected: true,
    systemUpdates: true,
    weeklyDigest: false,
    marketingEmails: false
  });

  // Configuración de privacidad
  const [privacySettings, setPrivacySettings] = useState({
    profilePublic: true,
    showEmail: false,
    showLocation: true,
    allowCollaborationInvites: true,
    allowDirectMessages: true
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleProfileSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Aquí iría la llamada a la API para actualizar el perfil
      // TODO: Implementar actualización de perfil
      console.log('Updating profile:', profileData);
      await refreshUser();
      
      setSuccess('Perfil actualizado exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Aquí iría la llamada a la API para cambiar contraseña
      console.log('Changing password...');
      
      setSuccess('Contraseña actualizada exitosamente');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (setting: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handlePrivacyChange = (setting: string, value: boolean) => {
    setPrivacySettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      // Aquí iría la llamada a la API para eliminar cuenta
      console.log('Deleting account...');
      
      // Redirigir al usuario después de eliminar la cuenta
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error al eliminar cuenta');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Debes iniciar sesión para acceder a la configuración.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Configuración
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Gestiona tu perfil, privacidad y preferencias de la cuenta.
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label="Perfil" icon={<PersonIcon />} />
            <Tab label="Seguridad" icon={<SecurityIcon />} />
            <Tab label="Notificaciones" icon={<NotificationsIcon />} />
            <Tab label="Privacidad" icon={<VisibilityIcon />} />
          </Tabs>
        </Box>

        {/* Tab 1: Perfil */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <Box sx={{ minWidth: 300, flex: '1 1 300px' }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                    src={user.avatarUrl || user.profilePictureUrl}
                  >
                    <PersonIcon sx={{ fontSize: 60 }} />
                  </Avatar>
                  {!user.isOAuthUser && (
                    <>
                      <IconButton
                        color="primary"
                        component="label"
                        sx={{ mb: 2 }}
                      >
                        <CameraIcon />
                        <input type="file" hidden accept="image/*" />
                      </IconButton>
                      <Typography variant="body2" color="text.secondary">
                        Haz clic para cambiar tu foto de perfil
                      </Typography>
                    </>
                  )}
                  {user.isOAuthUser && (
                    <Typography variant="body2" color="text.secondary">
                      Foto sincronizada desde {user.authProviders?.[0] || 'proveedor OAuth'}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ minWidth: 500, flex: '2 1 500px' }}>
              <Card>
                <CardHeader title="Información Personal" />
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                        <TextField
                          fullWidth
                          label="Nombre"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      </Box>
                      <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                        <TextField
                          fullWidth
                          label="Apellido"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                        <TextField
                          fullWidth
                          label="Nombre de usuario"
                          value={profileData.username}
                          onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                          disabled={user.isOAuthUser}
                          helperText={user.isOAuthUser ? `Gestionado por ${user.authProviders?.[0] || 'proveedor OAuth'}` : ''}
                        />
                      </Box>
                      <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                        <TextField
                          fullWidth
                          label="Email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          disabled={user.isOAuthUser}
                          helperText={user.isOAuthUser ? `Gestionado por ${user.authProviders?.[0] || 'proveedor OAuth'}` : ''}
                        />
                      </Box>
                    </Box>
                    <TextField
                      fullWidth
                      label="Biografía"
                      multiline
                      rows={3}
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Cuéntanos sobre ti..."
                    />

                  </Box>
                  
                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      onClick={handleProfileSubmit}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    >
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* Cuentas OAuth vinculadas */}
              {user.isOAuthUser && (
                <Card sx={{ mt: 3 }}>
                  <CardHeader title="Cuentas Vinculadas" />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Tu cuenta está vinculada con los siguientes proveedores:
                    </Typography>
                    {user.authProviders?.map((provider) => (
                      <Box
                        key={provider}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 2,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1
                        }}
                      >
                        {provider === 'google' && <GoogleIcon color="primary" />}
                        {provider === 'facebook' && <FacebookIcon color="primary" />}
                        {provider === 'microsoft' && <PersonIcon color="primary" />}
                        {provider === 'apple' && <PersonIcon color="primary" />}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                            {provider}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Cuenta vinculada - Email y nombre de usuario gestionados automáticamente
                          </Typography>
                        </Box>
                        <Chip
                          label="Conectado"
                          color="success"
                          size="small"
                        />
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              )}
            </Box>
          </Box>
        </TabPanel>

        {/* Tab 2: Seguridad */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <Box sx={{ minWidth: 400, flex: '1 1 400px' }}>
              <Card>
                <CardHeader title="Cambiar Contraseña" />
                <CardContent>
                  {user.isOAuthUser ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <SecurityIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Contraseña gestionada externamente
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Tu contraseña es gestionada por {user.authProviders?.[0] || 'tu proveedor OAuth'}.
                        Para cambiarla, debes hacerlo desde tu cuenta de {user.authProviders?.[0] || 'proveedor'}.
                      </Typography>
                      <Chip
                        label={`Gestionado por ${user.authProviders?.[0] || 'OAuth'}`}
                        color="info"
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          fullWidth
                          label="Contraseña actual"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          InputProps={{
                            endAdornment: (
                              <IconButton
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                edge="end"
                              >
                                {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            )
                          }}
                        />
                        <TextField
                          fullWidth
                          label="Nueva contraseña"
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          InputProps={{
                            endAdornment: (
                              <IconButton
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                edge="end"
                              >
                                {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            )
                          }}
                        />
                        <TextField
                          fullWidth
                          label="Confirmar nueva contraseña"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        />
                      </Box>

                      <Box sx={{ mt: 3 }}>
                        <Button
                          variant="contained"
                          onClick={handlePasswordSubmit}
                          disabled={loading || !passwordData.currentPassword || !passwordData.newPassword}
                          startIcon={loading ? <CircularProgress size={20} /> : <SecurityIcon />}
                        >
                          {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                        </Button>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ minWidth: 400, flex: '1 1 400px' }}>
              <Card>
                <CardHeader title="Zona de Peligro" />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, ten cuidado.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setDeleteDialogOpen(true)}
                    startIcon={<DeleteIcon />}
                  >
                    Eliminar Cuenta
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        {/* Tab 3: Notificaciones */}
        <TabPanel value={activeTab} index={2}>
          <Card>
            <CardHeader title="Preferencias de Notificación" />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Notificaciones por email"
                    secondary="Habilitar o deshabilitar todas las notificaciones por email"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemText
                    primary="Solicitudes cumplidas"
                    secondary="Cuando una de tus solicitudes sea cumplida"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notificationSettings.requestFulfilled}
                      onChange={(e) => handleNotificationChange('requestFulfilled', e.target.checked)}
                      disabled={!notificationSettings.emailNotifications}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Invitaciones a colaborar"
                    secondary="Cuando alguien te invite a colaborar"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notificationSettings.collaborationInvites}
                      onChange={(e) => handleNotificationChange('collaborationInvites', e.target.checked)}
                      disabled={!notificationSettings.emailNotifications}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Resumen semanal"
                    secondary="Un resumen semanal de actividad"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notificationSettings.weeklyDigest}
                      onChange={(e) => handleNotificationChange('weeklyDigest', e.target.checked)}
                      disabled={!notificationSettings.emailNotifications}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Tab 4: Privacidad */}
        <TabPanel value={activeTab} index={3}>
          <Card>
            <CardHeader title="Configuración de Privacidad" />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Perfil público"
                    secondary="Permitir que otros usuarios vean tu perfil"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={privacySettings.profilePublic}
                      onChange={(e) => handlePrivacyChange('profilePublic', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Mostrar email"
                    secondary="Mostrar tu email en tu perfil público"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={privacySettings.showEmail}
                      onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
                      disabled={!privacySettings.profilePublic}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Permitir invitaciones de colaboración"
                    secondary="Otros usuarios pueden invitarte a colaborar"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={privacySettings.allowCollaborationInvites}
                      onChange={(e) => handlePrivacyChange('allowCollaborationInvites', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Permitir mensajes directos"
                    secondary="Otros usuarios pueden enviarte mensajes"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={privacySettings.allowDirectMessages}
                      onChange={(e) => handlePrivacyChange('allowDirectMessages', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>

      {/* Dialog para confirmar eliminación de cuenta */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Eliminar Cuenta</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.
            Todos tus datos, canciones y colaboraciones se perderán permanentemente.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained">
            Eliminar Cuenta
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SettingsPage;
