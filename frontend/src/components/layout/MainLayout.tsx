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
      {/* CifraClub-style Header */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: '#ffffff',
          borderBottom: `1px solid ${colors.secondary[200]}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          color: colors.secondary[800],
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 1200, width: '100%', mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography
              variant="h6"
              component="div"
              onClick={() => navigate('/')}
              sx={{
                ...customStyles.primaryText,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': {
                  transform: 'scale(1.02)'
                },
                transition: 'transform 0.2s ease'
              }}
            >
              <MusicNoteIcon />
              SharedMelody
            </Typography>

            {/* Desktop Navigation - CifraClub style */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 0 }}>
                {navigationItems.map((item) => (
                  <Button
                    key={item.path}
                    startIcon={item.icon}
                    onClick={() => navigate(item.path)}
                    sx={{
                      color: location.pathname === item.path ? colors.primary[600] : colors.secondary[500],
                      borderBottom: location.pathname === item.path
                        ? `3px solid ${colors.primary[600]}`
                        : '3px solid transparent',
                      borderRadius: 0,
                      px: 2,
                      py: 2.5,
                      fontWeight: 500,
                      '&:hover': {
                        color: colors.primary[600],
                        backgroundColor: 'transparent',
                        borderBottomColor: colors.primary[600],
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}
          </Box>

          {/* User Actions - Clean style */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isAuthenticated ? (
              <>
                <Tooltip title="Mensajes">
                  <IconButton
                    onClick={() => navigate('/messages')}
                    sx={{
                      color: colors.secondary[500],
                      '&:hover': {
                        color: colors.primary[600],
                        backgroundColor: colors.primary[50]
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
                      color: colors.secondary[500],
                      '&:hover': {
                        color: colors.primary[600],
                        backgroundColor: colors.primary[50]
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
                        color: colors.secondary[500],
                        '&:hover': {
                          color: colors.primary[600],
                          backgroundColor: colors.primary[50]
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
                    '&:hover': {
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease'
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
                  onClick={() => navigate('/login')}
                  sx={{
                    color: colors.secondary[600],
                    border: `1px solid ${colors.secondary[300]}`,
                    borderRadius: '6px',
                    px: 2,
                    py: 1,
                    '&:hover': {
                      backgroundColor: colors.secondary[50],
                      borderColor: colors.primary[600],
                      color: colors.primary[600]
                    }
                  }}
                >
                  Entrar
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* User Menu - Clean style */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        sx={{
          '& .MuiPaper-root': {
            ...customStyles.cleanCard,
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
            color: colors.secondary[700],
            '&:hover': {
              backgroundColor: colors.primary[50],
              color: colors.primary[700]
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
            color: colors.secondary[700],
            '&:hover': {
              backgroundColor: colors.primary[50],
              color: colors.primary[700]
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
              backgroundColor: 'rgba(220, 53, 69, 0.1)'
            }
          }}
        >
          <LogoutIcon sx={{ mr: 2 }} />
          Cerrar Sesión
        </MenuItem>
      </Menu>

      {/* Main Content with CifraClub background */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginTop: '64px',
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: colors.secondary[50]
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;