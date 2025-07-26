import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  Switch,
  Button,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  MusicNote as MusicIcon,
  Group as CollaborationIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Info as InfoIcon,
  TrendingUp as DigestIcon,
  Campaign as MarketingIcon,
  Save as SaveIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { notificationService } from '../services/notificationService';
import { EmailNotification } from '../types/song';

const NotificationSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Preferencias de notificación
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    requestFulfilled: true,
    collaborationInvites: true,
    songApproved: true,
    songRejected: true,
    systemUpdates: true,
    weeklyDigest: false,
    marketingEmails: false
  });

  // Historial de notificaciones
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [notificationStats, setNotificationStats] = useState({
    total: 0,
    pending: 0,
    sent: 0,
    failed: 0,
    cancelled: 0,
    successRate: 0
  });

  // Estados para diálogos
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [newsletterDialogOpen, setNewsletterDialogOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  useEffect(() => {
    if (user) {
      loadPreferences();
      loadNotificationStats();
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      const prefs = await notificationService.getNotificationPreferences();
      setPreferences(prefs);
    } catch (err: any) {
      setError(err.message || 'Error al cargar preferencias');
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationStats = async () => {
    try {
      const stats = await notificationService.getEmailNotificationStats();
      setNotificationStats(stats);
    } catch (err: any) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  const loadNotificationHistory = async () => {
    try {
      const response = await notificationService.getEmailNotifications({
        limit: 20
      });
      setNotifications(response.data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar historial de notificaciones');
    }
  };

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      setError(null);
      await notificationService.updateNotificationPreferences(preferences);
      setSuccess('Preferencias guardadas exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar preferencias');
    } finally {
      setSaving(false);
    }
  };

  const handleSubscribeNewsletter = async () => {
    try {
      await notificationService.subscribeToNewsletter(newsletterEmail, {
        weeklyDigest: preferences.weeklyDigest,
        newFeatures: true,
        communityUpdates: true
      });
      setSuccess('Suscripción al newsletter exitosa');
      setNewsletterDialogOpen(false);
      setNewsletterEmail('');
    } catch (err: any) {
      setError(err.message || 'Error al suscribirse al newsletter');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'request_fulfilled': return <MusicIcon color="success" />;
      case 'collaboration_invite': return <CollaborationIcon color="info" />;
      case 'song_approved': return <ApprovedIcon color="success" />;
      case 'song_rejected': return <RejectedIcon color="error" />;
      case 'system_notification': return <InfoIcon color="warning" />;
      case 'weekly_digest': return <DigestIcon color="primary" />;
      case 'marketing': return <MarketingIcon color="secondary" />;
      default: return <NotificationsIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Debes iniciar sesión para gestionar tus preferencias de notificación.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Configuración de Notificaciones
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Gestiona cómo y cuándo quieres recibir notificaciones de SharedMelody.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Configuración principal */}
          <Box sx={{ minWidth: 500, flex: '2 1 500px' }}>
            <Card>
              <CardHeader
                title="Preferencias de Notificación"
                subheader="Configura qué notificaciones quieres recibir por email"
                avatar={<EmailIcon color="primary" />}
              />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Notificaciones por email"
                      secondary="Habilitar o deshabilitar todas las notificaciones por email"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={preferences.emailNotifications}
                        onChange={() => handlePreferenceChange('emailNotifications')}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <Divider />

                  <ListItem sx={{ opacity: preferences.emailNotifications ? 1 : 0.5 }}>
                    <ListItemText
                      primary="Solicitudes cumplidas"
                      secondary="Cuando una de tus solicitudes de canciones sea cumplida"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={preferences.requestFulfilled && preferences.emailNotifications}
                        onChange={() => handlePreferenceChange('requestFulfilled')}
                        disabled={!preferences.emailNotifications}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem sx={{ opacity: preferences.emailNotifications ? 1 : 0.5 }}>
                    <ListItemText
                      primary="Invitaciones a colaborar"
                      secondary="Cuando alguien te invite a colaborar en una canción"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={preferences.collaborationInvites && preferences.emailNotifications}
                        onChange={() => handlePreferenceChange('collaborationInvites')}
                        disabled={!preferences.emailNotifications}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem sx={{ opacity: preferences.emailNotifications ? 1 : 0.5 }}>
                    <ListItemText
                      primary="Canciones aprobadas"
                      secondary="Cuando una de tus canciones sea aprobada por moderación"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={preferences.songApproved && preferences.emailNotifications}
                        onChange={() => handlePreferenceChange('songApproved')}
                        disabled={!preferences.emailNotifications}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem sx={{ opacity: preferences.emailNotifications ? 1 : 0.5 }}>
                    <ListItemText
                      primary="Canciones rechazadas"
                      secondary="Cuando una de tus canciones sea rechazada por moderación"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={preferences.songRejected && preferences.emailNotifications}
                        onChange={() => handlePreferenceChange('songRejected')}
                        disabled={!preferences.emailNotifications}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem sx={{ opacity: preferences.emailNotifications ? 1 : 0.5 }}>
                    <ListItemText
                      primary="Actualizaciones del sistema"
                      secondary="Notificaciones importantes sobre el funcionamiento de la plataforma"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={preferences.systemUpdates && preferences.emailNotifications}
                        onChange={() => handlePreferenceChange('systemUpdates')}
                        disabled={!preferences.emailNotifications}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <Divider sx={{ my: 2 }} />

                  <ListItem sx={{ opacity: preferences.emailNotifications ? 1 : 0.5 }}>
                    <ListItemText
                      primary="Resumen semanal"
                      secondary="Un resumen semanal de la actividad en la plataforma"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={preferences.weeklyDigest && preferences.emailNotifications}
                        onChange={() => handlePreferenceChange('weeklyDigest')}
                        disabled={!preferences.emailNotifications}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem sx={{ opacity: preferences.emailNotifications ? 1 : 0.5 }}>
                    <ListItemText
                      primary="Emails promocionales"
                      secondary="Información sobre nuevas funciones y promociones"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={preferences.marketingEmails && preferences.emailNotifications}
                        onChange={() => handlePreferenceChange('marketingEmails')}
                        disabled={!preferences.emailNotifications}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleSavePreferences}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  >
                    {saving ? 'Guardando...' : 'Guardar Preferencias'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={() => {
                      loadNotificationHistory();
                      setHistoryDialogOpen(true);
                    }}
                    startIcon={<HistoryIcon />}
                  >
                    Ver Historial
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Estadísticas */}
          <Box sx={{ minWidth: 300, flex: '1 1 300px' }}>
            <Card>
              <CardHeader
                title="Estadísticas de Notificaciones"
                subheader="Resumen de tus notificaciones por email"
              />
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h4" color="primary.main">
                    {notificationStats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total de notificaciones
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" color="success.main">
                    {notificationStats.successRate.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tasa de entrega exitosa
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Enviadas</Typography>
                  <Chip label={notificationStats.sent} color="success" size="small" />
                </Box>

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Pendientes</Typography>
                  <Chip label={notificationStats.pending} color="warning" size="small" />
                </Box>

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Fallidas</Typography>
                  <Chip label={notificationStats.failed} color="error" size="small" />
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Canceladas</Typography>
                  <Chip label={notificationStats.cancelled} color="default" size="small" />
                </Box>
              </CardContent>
            </Card>

            {/* Newsletter */}
            <Card sx={{ mt: 3 }}>
              <CardHeader
                title="Newsletter"
                subheader="Suscríbete a nuestro newsletter"
              />
              <CardContent>
                <Typography variant="body2" paragraph>
                  Recibe las últimas noticias, nuevas funciones y contenido destacado de SharedMelody.
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    setNewsletterEmail(user.email);
                    setNewsletterDialogOpen(true);
                  }}
                >
                  Suscribirse al Newsletter
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Dialog para historial de notificaciones */}
      <Dialog open={historyDialogOpen} onClose={() => setHistoryDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Historial de Notificaciones</DialogTitle>
        <DialogContent>
          <List>
            {notifications.map((notification) => (
              <ListItem key={notification.notificationId} divider>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      {getNotificationIcon('email')}
                      <Typography variant="body1">
                        {notification.subject}
                      </Typography>
                      <Chip
                        label={notification.status}
                        color={getStatusColor(notification.status) as any}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Para: {notification.emailAddress}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notification.sentAt 
                          ? `Enviado: ${new Date(notification.sentAt).toLocaleString()}`
                          : `Programado: ${new Date(notification.scheduledFor).toLocaleString()}`
                        }
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para suscripción al newsletter */}
      <Dialog open={newsletterDialogOpen} onClose={() => setNewsletterDialogOpen(false)}>
        <DialogTitle>Suscribirse al Newsletter</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Email"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            type="email"
            sx={{ mt: 2 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Recibirás un email de confirmación para completar tu suscripción.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewsletterDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubscribeNewsletter} 
            variant="contained"
            disabled={!newsletterEmail}
          >
            Suscribirse
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NotificationSettingsPage;
