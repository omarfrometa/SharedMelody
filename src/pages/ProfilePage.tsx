import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Grid,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Tab,
  Tabs,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  MusicNote as MusicIcon,
  Favorite as FavoriteIcon,
  Star as StarIcon,
  Edit as EditIcon,
  Settings as SettingsIcon
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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
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

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Debes iniciar sesión para ver tu perfil.
        </Alert>
      </Container>
    );
  }

  const userStats = {
    songsUploaded: 12,
    collaborations: 8,
    requestsMade: 5,
    requestsFulfilled: 3,
    totalViews: 1250,
    totalLikes: 89,
    averageRating: 4.2
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header del perfil */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Avatar
            sx={{ width: 120, height: 120 }}
            src={user.profilePictureUrl}
          >
            <PersonIcon sx={{ fontSize: 60 }} />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Typography variant="h4" gutterBottom>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              @{user.username}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip 
                icon={<PersonIcon />} 
                label={user.role?.roleName || 'Usuario'} 
                color="primary" 
                size="small" 
              />
              {user.emailVerified && (
                <Chip 
                  icon={<EmailIcon />} 
                  label="Email verificado" 
                  color="success" 
                  size="small" 
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
              <Box textAlign="center">
                <Typography variant="h6" color="primary">
                  {userStats.songsUploaded}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Canciones
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" color="primary">
                  {userStats.collaborations}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Colaboraciones
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" color="primary">
                  {userStats.totalViews}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vistas totales
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" color="primary">
                  {userStats.averageRating.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Valoración promedio
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate('/settings')}
              >
                Editar Perfil
              </Button>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => navigate('/settings')}
              >
                Configuración
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Información detallada */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        <Box sx={{ minWidth: 300, flex: '1 1 300px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información Personal
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={user.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Miembro desde"
                    secondary={new Date(user.createdAt).toLocaleDateString()}
                  />
                </ListItem>
                {user.country && (
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="País"
                      secondary={user.country.countryName}
                    />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Último acceso"
                    secondary={user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Nunca'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ minWidth: 500, flex: '2 1 500px' }}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Actividad Reciente" icon={<MusicIcon />} />
                <Tab label="Estadísticas" icon={<StarIcon />} />
                <Tab label="Favoritos" icon={<FavoriteIcon />} />
              </Tabs>
            </Box>

            {/* Tab 1: Actividad Reciente */}
            <TabPanel value={activeTab} index={0}>
              <Typography variant="h6" gutterBottom>
                Actividad Reciente
              </Typography>
              <List>
                <ListItem divider>
                  <ListItemIcon>
                    <MusicIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Subió una nueva canción"
                    secondary="'Melodía del Atardecer' - Hace 2 días"
                  />
                </ListItem>
                <ListItem divider>
                  <ListItemIcon>
                    <FavoriteIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Colaboró en una canción"
                    secondary="'Ritmos de la Ciudad' con @usuario123 - Hace 5 días"
                  />
                </ListItem>
                <ListItem divider>
                  <ListItemIcon>
                    <StarIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Cumplió una solicitud"
                    secondary="'Canción de Cuna' solicitada por @maria_music - Hace 1 semana"
                  />
                </ListItem>
              </List>
            </TabPanel>

            {/* Tab 2: Estadísticas */}
            <TabPanel value={activeTab} index={1}>
              <Typography variant="h6" gutterBottom>
                Estadísticas Detalladas
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ minWidth: 150, flex: '1 1 150px' }}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {userStats.songsUploaded}
                    </Typography>
                    <Typography variant="body2">
                      Canciones subidas
                    </Typography>
                  </Paper>
                </Box>
                <Box sx={{ minWidth: 150, flex: '1 1 150px' }}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="secondary">
                      {userStats.requestsFulfilled}
                    </Typography>
                    <Typography variant="body2">
                      Solicitudes cumplidas
                    </Typography>
                  </Paper>
                </Box>
                <Box sx={{ minWidth: 150, flex: '1 1 150px' }}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {userStats.totalLikes}
                    </Typography>
                    <Typography variant="body2">
                      Likes recibidos
                    </Typography>
                  </Paper>
                </Box>
                <Box sx={{ minWidth: 150, flex: '1 1 150px' }}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {userStats.totalViews}
                    </Typography>
                    <Typography variant="body2">
                      Vistas totales
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            </TabPanel>

            {/* Tab 3: Favoritos */}
            <TabPanel value={activeTab} index={2}>
              <Typography variant="h6" gutterBottom>
                Canciones Favoritas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aquí aparecerán las canciones que has marcado como favoritas.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Alert severity="info">
                  Funcionalidad de favoritos próximamente disponible.
                </Alert>
              </Box>
            </TabPanel>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default ProfilePage;
