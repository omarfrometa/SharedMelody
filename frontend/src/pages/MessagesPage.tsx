import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper
} from '@mui/material';
import {
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Visibility as ViewIcon,
  MusicNote as MusicIcon,
  RequestPage as RequestIcon,
  Group as CollaborationIcon,
  Notifications as NotificationIcon,
  AdminPanelSettings as AdminIcon,
  WavingHand as WelcomeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { UserMessage, UserMessageDetailed } from '../types/user';
import { messageService } from '../services/messageService';

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<UserMessageDetailed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    messageType: '',
    isRead: '',
    isArchived: false,
    page: 1,
    limit: 20,
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [selectedMessage, setSelectedMessage] = useState<UserMessageDetailed | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadMessages();
      loadUnreadCount();
    }
  }, [user, filters]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await messageService.getUserMessages(filters);
      setMessages(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || 'Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await messageService.getUnreadCount();
      setUnreadCount(count);
    } catch (err: any) {
      console.error('Error al cargar contador de no leídos:', err);
    }
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1
    }));
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await messageService.markAsRead(messageId);
      await loadMessages();
      await loadUnreadCount();
    } catch (err: any) {
      setError(err.message || 'Error al marcar como leído');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await messageService.markAllAsRead();
      await loadMessages();
      await loadUnreadCount();
    } catch (err: any) {
      setError(err.message || 'Error al marcar todos como leídos');
    }
  };

  const handleArchiveMessage = async (messageId: string) => {
    try {
      await messageService.archiveMessage(messageId);
      await loadMessages();
    } catch (err: any) {
      setError(err.message || 'Error al archivar mensaje');
    }
  };

  const handleUnarchiveMessage = async (messageId: string) => {
    try {
      await messageService.unarchiveMessage(messageId);
      await loadMessages();
    } catch (err: any) {
      setError(err.message || 'Error al desarchivar mensaje');
    }
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    try {
      await messageService.deleteMessage(selectedMessage.messageId);
      await loadMessages();
      await loadUnreadCount();
      setDeleteDialogOpen(false);
      setSelectedMessage(null);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar mensaje');
    }
  };

  const openMessageDialog = async (message: UserMessageDetailed) => {
    setSelectedMessage(message);
    setMessageDialogOpen(true);
    
    // Marcar como leído si no lo está
    if (!message.isRead) {
      await handleMarkAsRead(message.messageId);
    }
  };

  const getMessageIcon = (type: string) => {
    const icons: Record<string, React.ReactElement> = {
      request_fulfilled: <RequestIcon color="success" />,
      collaboration_invite: <CollaborationIcon color="info" />,
      system_notification: <NotificationIcon color="warning" />,
      admin_message: <AdminIcon color="error" />,
      welcome: <WelcomeIcon color="primary" />,
      reminder: <RefreshIcon color="secondary" />
    };
    return icons[type] || <NotificationIcon />;
  };

  const getMessageTypeText = (type: string) => {
    const texts: Record<string, string> = {
      request_fulfilled: 'Solicitud cumplida',
      collaboration_invite: 'Invitación a colaborar',
      system_notification: 'Notificación del sistema',
      admin_message: 'Mensaje de administrador',
      welcome: 'Bienvenida',
      reminder: 'Recordatorio'
    };
    return texts[type] || type;
  };

  const getMessageTypeColor = (type: string) => {
    const colors: Record<string, 'success' | 'info' | 'warning' | 'error' | 'primary' | 'secondary'> = {
      request_fulfilled: 'success',
      collaboration_invite: 'info',
      system_notification: 'warning',
      admin_message: 'error',
      welcome: 'primary',
      reminder: 'secondary'
    };
    return colors[type] || 'primary';
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Debes iniciar sesión para ver tus mensajes.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Mensajes
          {unreadCount > 0 && (
            <Badge badgeContent={unreadCount} color="error" sx={{ ml: 2 }}>
              <Box />
            </Badge>
          )}
        </Typography>
        
        <Box>
          <Button
            variant="outlined"
            onClick={loadMessages}
            startIcon={<RefreshIcon />}
            sx={{ mr: 2 }}
          >
            Actualizar
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="contained"
              onClick={handleMarkAllAsRead}
              startIcon={<MarkReadIcon />}
            >
              Marcar todos como leídos
            </Button>
          )}
        </Box>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
              <FormControl fullWidth>
                <InputLabel>Tipo de mensaje</InputLabel>
                <Select
                  value={filters.messageType}
                  onChange={(e) => handleFilterChange('messageType', e.target.value)}
                  label="Tipo de mensaje"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="request_fulfilled">Solicitud cumplida</MenuItem>
                  <MenuItem value="collaboration_invite">Invitación a colaborar</MenuItem>
                  <MenuItem value="system_notification">Notificación del sistema</MenuItem>
                  <MenuItem value="admin_message">Mensaje de administrador</MenuItem>
                  <MenuItem value="welcome">Bienvenida</MenuItem>
                  <MenuItem value="reminder">Recordatorio</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ minWidth: 150 }}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filters.isRead}
                  onChange={(e) => handleFilterChange('isRead', e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="false">No leídos</MenuItem>
                  <MenuItem value="true">Leídos</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ minWidth: 150 }}>
              <FormControl fullWidth>
                <InputLabel>Archivo</InputLabel>
                <Select
                  value={filters.isArchived}
                  onChange={(e) => handleFilterChange('isArchived', e.target.value)}
                  label="Archivo"
                >
                  <MenuItem value="false">Activos</MenuItem>
                  <MenuItem value="true">Archivados</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ minWidth: 150 }}>
              <FormControl fullWidth>
                <InputLabel>Ordenar por</InputLabel>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  label="Ordenar por"
                >
                  <MenuItem value="created_at">Fecha</MenuItem>
                  <MenuItem value="title">Título</MenuItem>
                  <MenuItem value="message_type">Tipo</MenuItem>
                </Select>
              </FormControl>
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

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Mensajes */}
      {!loading && (
        <>
          <Paper>
            <List>
              {messages.map((message, index) => (
                <React.Fragment key={message.messageId}>
                  <ListItem
                    sx={{
                      backgroundColor: message.isRead ? 'transparent' : 'action.hover',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.selected'
                      }
                    }}
                    onClick={() => openMessageDialog(message)}
                  >
                    <ListItemIcon>
                      {getMessageIcon(message.messageType)}
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: message.isRead ? 'normal' : 'bold',
                              flexGrow: 1
                            }}
                          >
                            {message.title}
                          </Typography>
                          <Chip
                            label={getMessageTypeText(message.messageType)}
                            color={getMessageTypeColor(message.messageType)}
                            size="small"
                          />
                          {message.isArchived && (
                            <Chip label="Archivado" size="small" variant="outlined" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              mb: 1
                            }}
                          >
                            {message.content}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(message.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />

                    <Box display="flex" gap={1}>
                      {!message.isRead && (
                        <Tooltip title="Marcar como leído">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(message.messageId);
                            }}
                          >
                            <MarkReadIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      {message.isArchived ? (
                        <Tooltip title="Desarchivar">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnarchiveMessage(message.messageId);
                            }}
                          >
                            <UnarchiveIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Archivar">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchiveMessage(message.messageId);
                            }}
                          >
                            <ArchiveIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMessage(message);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItem>
                  {index < messages.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>

          {/* Paginación */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}

          {messages.length === 0 && !loading && (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {filters.isArchived ? 'No tienes mensajes archivados' : 'No tienes mensajes'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filters.isArchived 
                  ? 'Los mensajes archivados aparecerán aquí.'
                  : 'Cuando recibas notificaciones aparecerán aquí.'
                }
              </Typography>
            </Box>
          )}
        </>
      )}

      {/* Dialog para ver mensaje completo */}
      <Dialog 
        open={messageDialogOpen} 
        onClose={() => setMessageDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            {selectedMessage && getMessageIcon(selectedMessage.messageType)}
            <Typography variant="h6" component="span">
              {selectedMessage?.title}
            </Typography>
            {selectedMessage && (
              <Chip
                label={getMessageTypeText(selectedMessage.messageType)}
                color={getMessageTypeColor(selectedMessage.messageType)}
                size="small"
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedMessage && (
            <Box>
              <Typography variant="body1" paragraph>
                {selectedMessage.content}
              </Typography>
              
              {selectedMessage.relatedSongTitle && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Canción relacionada: <strong>{selectedMessage.relatedSongTitle}</strong>
                  </Typography>
                </Alert>
              )}

              {selectedMessage.relatedRequestTitle && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Solicitud relacionada: <strong>{selectedMessage.relatedRequestTitle}</strong>
                  </Typography>
                </Alert>
              )}

              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                Recibido el {new Date(selectedMessage.createdAt).toLocaleString()}
                {selectedMessage.sentByUsername && (
                  <> • Enviado por {selectedMessage.sentByUsername}</>
                )}
              </Typography>

              {selectedMessage.expiresAt && (
                <Typography variant="caption" color="warning.main" display="block">
                  Expira el {new Date(selectedMessage.expiresAt).toLocaleString()}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedMessage?.relatedSongId && (
            <Button
              onClick={() => window.open(`/songs/${selectedMessage.relatedSongId}`, '_blank')}
              startIcon={<ViewIcon />}
            >
              Ver Canción
            </Button>
          )}
          <Button onClick={() => setMessageDialogOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar este mensaje?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteMessage} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MessagesPage;
