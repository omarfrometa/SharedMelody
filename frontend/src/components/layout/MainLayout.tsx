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
import { useTranslation } from '../../contexts/LanguageContext';
import { customStyles, colors } from '../../theme/theme';
import LanguageSelector from '../common/LanguageSelector';
import Breadcrumb from '../common/Breadcrumb';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const { t } = useTranslation();
  
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
    { path: '/', label: t('navigation.home'), icon: <HomeIcon /> },
    { path: '/songs', label: t('navigation.songs'), icon: <LibraryMusicIcon /> },
    { path: '/upload', label: t('navigation.upload'), icon: <UploadIcon /> },
    { path: '/request', label: t('navigation.request'), icon: <AddIcon /> },
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
        <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 1200, width: '100%', mx: 'auto', py: 1 }}>
          {/* Logo Section - Aligned to the left */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h4"
              component="div"
              onClick={() => navigate('/')}
              sx={{
                ...customStyles.primaryText,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                fontSize: '1.75rem',
                letterSpacing: '-0.02em',
                '&:hover': {
                  transform: 'scale(1.03)'
                },
                transition: 'transform 0.2s ease'
              }}
            >
              <MusicNoteIcon sx={{ fontSize: '2.5rem', color: colors.primary[600] }} />
              SharedMelody
            </Typography>
          </Box>

          {/* Center Navigation - Desktop only */}
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

          {/* Right Side Actions - All buttons aligned to the right */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Language Selector */}
            <LanguageSelector variant="icon" />
            {isAuthenticated ? (
              <>
                <Tooltip title={t('navigation.messages')}>
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

                <Tooltip title={t('navigation.favorites')}>
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
                  <Tooltip title={t('navigation.admin')}>
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
                  {t('navigation.login')}
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
          {t('navigation.profile')}
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
          {t('navigation.settings')}
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
          {t('navigation.logout')}
        </MenuItem>
      </Menu>

      {/* Breadcrumb Navigation */}
      <Box sx={{ marginTop: '80px' }}>
        <Breadcrumb />
      </Box>

      {/* Main Content with CifraClub background */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: colors.secondary[50],
          paddingTop: 3
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;