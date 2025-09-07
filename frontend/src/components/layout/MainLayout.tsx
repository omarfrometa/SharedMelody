import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useTheme,
  useMediaQuery,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  MusicNote as MusicNoteIcon,
  Upload as UploadIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  Message as MessageIcon,
  Favorite as FavoriteIcon,
  Add as AddIcon,
  LibraryMusic as LibraryMusicIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { customStyles, colors } from '../../theme/theme';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
    navigate('/');
  };

  const navigationItems = [
    { path: '/', label: 'Inicio', icon: <HomeIcon /> },
    { path: '/songs', label: 'Canciones', icon: <LibraryMusicIcon /> },
    { path: '/upload', label: 'Subir', icon: <UploadIcon /> },
    { path: '/request', label: 'Solicitar', icon: <AddIcon /> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar 
        position="fixed" 
        sx={{
          ...customStyles.glassCard,
          background: 'rgba(15, 15, 35, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography 
            variant="h6" 
            component="div" 
            onClick={() => navigate('/')}
            sx={{ 
              ...customStyles.gradientText,
              fontWeight: 800,
              cursor: 'pointer',
              '&:hover': {
                transform: 'scale(1.05)'
              },
              transition: 'transform 0.2s ease'
            }}
          >
            SharedMelody
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  sx={{
                    color: 'white',
                    backgroundColor: location.pathname === item.path 
                      ? 'rgba(168, 85, 247, 0.2)' 
                      : 'transparent',
                    border: location.pathname === item.path 
                      ? '1px solid rgba(168, 85, 247, 0.5)'
                      : '1px solid transparent',
                    borderRadius: '20px',
                    px: 3,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* User Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isAuthenticated ? (
              <>
                <Tooltip title="Mensajes">
                  <IconButton 
                    onClick={() => navigate('/messages')}
                    sx={{ 
                      color: 'white',
                      '&:hover': { 
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <MessageIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Favoritos">
                  <IconButton 
                    onClick={() => navigate('/favorites')}
                    sx={{ 
                      color: 'white',
                      '&:hover': { 
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <FavoriteIcon />
                  </IconButton>
                </Tooltip>

                {hasRole('admin') && (
                  <Tooltip title="Admin">
                    <IconButton 
                      onClick={() => navigate('/admin')}
                      sx={{ 
                        color: colors.secondary[400],
                        '&:hover': { 
                          backgroundColor: 'rgba(34, 211, 238, 0.1)',
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <AdminIcon />
                    </IconButton>
                  </Tooltip>
                )}

                <IconButton
                  onClick={handleUserMenuOpen}
                  sx={{ 
                    p: 0,
                    ml: 1,
                    border: '2px solid rgba(255,255,255,0.2)',
                    '&:hover': {
                      border: '2px solid rgba(168, 85, 247, 0.8)',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Avatar 
                    src={user?.profilePictureUrl || user?.avatarUrl} 
                    sx={{ 
                      width: 36, 
                      height: 36,
                      background: colors.gradient.primary
                    }}
                  >
                    {user?.firstName?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.3)',
                    borderRadius: '20px',
                    '&:hover': {
                      borderColor: 'rgba(168, 85, 247, 0.8)',
                      backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    }
                  }}
                >
                  Iniciar Sesión
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/register')}
                  sx={{
                    ...customStyles.floatingButton,
                    borderRadius: '20px',
                    px: 3
                  }}
                >
                  Registrarse
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        sx={{
          '& .MuiPaper-root': {
            ...customStyles.glassCard,
            background: 'rgba(15, 15, 35, 0.95)',
            color: 'white',
            minWidth: 200,
            mt: 1
          }
        }}
      >
        <MenuItem 
          onClick={() => {
            handleUserMenuClose();
            navigate('/profile');
          }}
          sx={{ 
            '&:hover': { 
              backgroundColor: 'rgba(255,255,255,0.1)' 
            }
          }}
        >
          <PersonIcon sx={{ mr: 2 }} />
          Mi Perfil
        </MenuItem>
        <MenuItem 
          onClick={() => {
            handleUserMenuClose();
            navigate('/settings');
          }}
          sx={{ 
            '&:hover': { 
              backgroundColor: 'rgba(255,255,255,0.1)' 
            }
          }}
        >
          <SettingsIcon sx={{ mr: 2 }} />
          Configuración
        </MenuItem>
        <MenuItem 
          onClick={handleLogout}
          sx={{ 
            color: colors.music.beat,
            '&:hover': { 
              backgroundColor: 'rgba(255,107,107,0.1)' 
            }
          }}
        >
          <LogoutIcon sx={{ mr: 2 }} />
          Cerrar Sesión
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginTop: '64px',
          minHeight: 'calc(100vh - 64px)',
          background: colors.gradient.dark
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;