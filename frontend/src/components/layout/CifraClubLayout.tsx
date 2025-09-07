import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  IconButton,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  alpha,
  CssBaseline,
  Button,
  InputBase,
  Chip,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  LibraryMusic as LibraryMusicIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  List as ListIcon,
  Group as GroupIcon,
  Message as MessageIcon,
  Edit as EditIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  MusicNote as MusicNoteIcon,
  Assignment as AssignmentIcon,
  Category as CategoryIcon,
  Settings as SettingsIcon,
  MoreVert as MoreIcon,
  Favorite as FavoriteIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation, useLanguage } from '../../contexts/LanguageContext';
import LanguageSelector from '../common/LanguageSelector';

// Géneros musicales como en CifraClub
const getMusicGenres = (t: any) => [
  t('genres.all'), t('genres.rock'), t('genres.pop'), t('genres.gospel'), t('genres.reggae'), t('common.more')
];

export const CifraClubLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasRole } = useAuth();
  const { t } = useTranslation();
  const { resetToDetectedLanguage } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const musicGenres = getMusicGenres(t);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchValue, setSearchValue] = useState('');

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleProfileMenuClose();
    navigate('/login');
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchValue.trim()) {
      navigate(`/songs?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Header similar a CifraClub */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          backgroundColor: '#ffffff',
          borderBottom: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
          color: theme.palette.text.primary
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ px: { xs: 0, sm: 0 }, minHeight: '64px !important' }}>
            {/* Logo */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                mr: 3
              }}
              onClick={() => navigate('/')}
            >
              <MusicNoteIcon 
                sx={{ 
                  fontSize: 32, 
                  color: theme.palette.primary.main,
                  mr: 1
                }} 
              />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                SharedMelody
              </Typography>
            </Box>

            {/* Barra de búsqueda central */}
            <Box 
              component="form" 
              onSubmit={handleSearch}
              sx={{ 
                flexGrow: 1, 
                maxWidth: 600,
                mx: { xs: 1, sm: 3 }
              }}
            >
              <Paper
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: alpha(theme.palette.grey[100], 0.8),
                  border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                  borderRadius: 2,
                  px: 2,
                  py: 0.5,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.grey[100], 1),
                  },
                  '&:focus-within': {
                    backgroundColor: '#ffffff',
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                  }
                }}
                elevation={0}
              >
                <InputBase
                  placeholder={t('common.search') + '...'}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  sx={{ 
                    flex: 1,
                    fontSize: '0.95rem',
                    '& input::placeholder': {
                      color: theme.palette.text.secondary,
                      opacity: 0.8
                    }
                  }}
                />
                <IconButton 
                  type="submit" 
                  sx={{ 
                    p: 1,
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      color: theme.palette.primary.main,
                    }
                  }}
                >
                  <SearchIcon />
                </IconButton>
              </Paper>
            </Box>

            {/* Menú de navegación derecha */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!user ? (
                <>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => navigate('/login')}
                    sx={{ 
                      display: { xs: 'none', sm: 'flex' },
                      borderColor: alpha(theme.palette.grey[400], 0.5),
                      color: theme.palette.text.primary,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      }
                    }}
                  >
                    {t('auth.login')}
                  </Button>
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={() => navigate('/register')}
                    sx={{ 
                      display: { xs: 'none', sm: 'flex' },
                      backgroundColor: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      }
                    }}
                  >
                    {t('auth.register')}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="text"
                    size="small"
                    sx={{ 
                      display: { xs: 'none', md: 'flex' },
                      color: theme.palette.text.primary,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      }
                    }}
                  >
                    Listas
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => navigate('/upload')}
                    sx={{ 
                      display: { xs: 'none', md: 'flex' },
                      color: theme.palette.text.primary,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      }
                    }}
                  >
                    Enviar acordes
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    sx={{ 
                      display: { xs: 'none', md: 'flex' },
                      color: theme.palette.text.primary,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      }
                    }}
                  >
                    {t('common.more')}
                  </Button>

                  {/* Avatar del usuario */}
                  <IconButton
                    onClick={handleProfileMenuOpen}
                    sx={{ 
                      p: 0.5,
                      ml: 1,
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                      }
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32,
                        backgroundColor: theme.palette.primary.main,
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}
                    >
                      {user.firstName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                </>
              )}

              {/* Selector de idioma - siempre visible */}
              <Box sx={{ ml: 2 }}>
                <LanguageSelector variant="button" size="small" showLabel={true} />
              </Box>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Menú Principal de Navegación */}
      <Box
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: '#ffffff',
          py: 1.5
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 2, md: 4 },
              overflowX: 'auto',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none'
            }}
          >
            <Button
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              sx={{
                color: '#ffffff',
                fontWeight: isActive('/') ? 600 : 400,
                backgroundColor: isActive('/') ? alpha('#ffffff', 0.15) : 'transparent',
                borderRadius: 2,
                px: 2,
                py: 0.8,
                minWidth: 'auto',
                whiteSpace: 'nowrap',
                '&:hover': {
                  backgroundColor: alpha('#ffffff', 0.1),
                }
              }}
            >
              {t('navigation.home')}
            </Button>

            <Button
              startIcon={<LibraryMusicIcon />}
              onClick={() => navigate('/songs')}
              sx={{
                color: '#ffffff',
                fontWeight: isActive('/songs') ? 600 : 400,
                backgroundColor: isActive('/songs') ? alpha('#ffffff', 0.15) : 'transparent',
                borderRadius: 2,
                px: 2,
                py: 0.8,
                minWidth: 'auto',
                whiteSpace: 'nowrap',
                '&:hover': {
                  backgroundColor: alpha('#ffffff', 0.1),
                }
              }}
            >
              {t('navigation.songs')}
            </Button>

            <Button
              startIcon={<TrendingUpIcon />}
              onClick={() => navigate('/trending')}
              sx={{
                color: '#ffffff',
                fontWeight: isActive('/trending') ? 600 : 400,
                backgroundColor: isActive('/trending') ? alpha('#ffffff', 0.15) : 'transparent',
                borderRadius: 2,
                px: 2,
                py: 0.8,
                minWidth: 'auto',
                whiteSpace: 'nowrap',
                '&:hover': {
                  backgroundColor: alpha('#ffffff', 0.1),
                }
              }}
            >
              {t('navigation.trending')}
            </Button>

            {user && (
              <>
                <Button
                  startIcon={<FavoriteIcon />}
                  onClick={() => navigate('/favorites')}
                  sx={{
                    color: '#ffffff',
                    fontWeight: isActive('/favorites') ? 600 : 400,
                    backgroundColor: isActive('/favorites') ? alpha('#ffffff', 0.15) : 'transparent',
                    borderRadius: 2,
                    px: 2,
                    py: 0.8,
                    minWidth: 'auto',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      backgroundColor: alpha('#ffffff', 0.1),
                    }
                  }}
                >
                  {t('navigation.favorites')}
                </Button>

                <Button
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/request')}
                  sx={{
                    color: '#ffffff',
                    fontWeight: isActive('/request') ? 600 : 400,
                    backgroundColor: isActive('/request') ? alpha('#ffffff', 0.15) : 'transparent',
                    borderRadius: 2,
                    px: 2,
                    py: 0.8,
                    minWidth: 'auto',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      backgroundColor: alpha('#ffffff', 0.1),
                    }
                  }}
                >
                  {t('navigation.request')}
                </Button>

                {hasRole && hasRole('admin') && (
                  <Button
                    startIcon={<DashboardIcon />}
                    onClick={() => navigate('/admin')}
                    sx={{
                      color: '#ffffff',
                      fontWeight: isActive('/admin') ? 600 : 400,
                      backgroundColor: isActive('/admin') ? alpha('#ffffff', 0.15) : 'transparent',
                      borderRadius: 2,
                      px: 2,
                      py: 0.8,
                      minWidth: 'auto',
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        backgroundColor: alpha('#ffffff', 0.1),
                      }
                    }}
                  >
                    {t('navigation.admin')}
                  </Button>
                )}
              </>
            )}
          </Box>
        </Container>
      </Box>

      {/* Menú de géneros musicales */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderBottom: `1px solid ${alpha(theme.palette.grey[200], 0.8)}`,
          py: 1
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 0.5 }}>
            {musicGenres.map((genre) => (
              <Chip
                key={genre}
                label={genre}
                variant={genre === 'Todos' ? 'filled' : 'outlined'}
                clickable
                sx={{
                  borderRadius: 2,
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  backgroundColor: genre === 'Todos' ? theme.palette.grey[900] : 'transparent',
                  color: genre === 'Todos' ? '#ffffff' : theme.palette.text.primary,
                  borderColor: alpha(theme.palette.grey[400], 0.5),
                  '&:hover': {
                    backgroundColor: genre === 'Todos'
                      ? theme.palette.grey[800]
                      : alpha(theme.palette.grey[100], 0.8),
                  },
                  whiteSpace: 'nowrap'
                }}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* Menú del perfil */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <MenuItem onClick={() => { navigate('/profile'); handleProfileMenuClose(); }}>
          <PersonIcon sx={{ mr: 2, fontSize: 20 }} />
          {t('navigation.profile')}
        </MenuItem>
        <MenuItem onClick={() => { navigate('/settings'); handleProfileMenuClose(); }}>
          <SettingsIcon sx={{ mr: 2, fontSize: 20 }} />
          {t('navigation.settings')}
        </MenuItem>
        {hasRole && hasRole('admin') && (
          <>
            <Divider />
            <MenuItem onClick={() => { navigate('/admin'); handleProfileMenuClose(); }}>
              <DashboardIcon sx={{ mr: 2, fontSize: 20 }} />
              {t('navigation.admin')}
            </MenuItem>
          </>
        )}
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
          {t('auth.logout')}
        </MenuItem>
      </Menu>

      {/* Contenido principal */}
      <Box component="main" sx={{ flexGrow: 1, backgroundColor: theme.palette.background.default }}>
        <Outlet />
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          backgroundColor: theme.palette.grey[900],
          color: '#ffffff',
          py: 6,
          mt: 'auto'
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '2fr 1fr 1fr 1fr'
              },
              gap: 4,
              mb: 4
            }}
          >
            {/* Columna 1: Información de la empresa */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MusicNoteIcon
                  sx={{
                    fontSize: 32,
                    color: theme.palette.primary.main,
                    mr: 1
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  SharedMelody
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2, color: theme.palette.grey[400] }}>
                La plataforma colaborativa de música donde artistas y aficionados comparten acordes,
                letras y melodías para crear juntos.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  sx={{
                    color: theme.palette.grey[400],
                    '&:hover': { color: '#1877F2' }
                  }}
                >
                  <FacebookIcon />
                </IconButton>
                <IconButton
                  sx={{
                    color: theme.palette.grey[400],
                    '&:hover': { color: '#1DA1F2' }
                  }}
                >
                  <TwitterIcon />
                </IconButton>
                <IconButton
                  sx={{
                    color: theme.palette.grey[400],
                    '&:hover': { color: '#E4405F' }
                  }}
                >
                  <InstagramIcon />
                </IconButton>
                <IconButton
                  sx={{
                    color: theme.palette.grey[400],
                    '&:hover': { color: '#FF0000' }
                  }}
                >
                  <YouTubeIcon />
                </IconButton>
              </Box>
            </Box>

            {/* Columna 2: Enlaces rápidos */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Enlaces Rápidos
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  onClick={() => navigate('/')}
                  sx={{
                    justifyContent: 'flex-start',
                    color: theme.palette.grey[400],
                    textTransform: 'none',
                    p: 0,
                    minWidth: 'auto',
                    '&:hover': { color: '#ffffff' }
                  }}
                >
                  {t('navigation.home')}
                </Button>
                <Button
                  onClick={() => navigate('/songs')}
                  sx={{
                    justifyContent: 'flex-start',
                    color: theme.palette.grey[400],
                    textTransform: 'none',
                    p: 0,
                    minWidth: 'auto',
                    '&:hover': { color: '#ffffff' }
                  }}
                >
                  {t('navigation.songs')}
                </Button>
                <Button
                  onClick={() => navigate('/request')}
                  sx={{
                    justifyContent: 'flex-start',
                    color: theme.palette.grey[400],
                    textTransform: 'none',
                    p: 0,
                    minWidth: 'auto',
                    '&:hover': { color: '#ffffff' }
                  }}
                >
                  {t('navigation.request')}
                </Button>
                {user && (
                  <Button
                    onClick={() => navigate('/favorites')}
                    sx={{
                      justifyContent: 'flex-start',
                      color: theme.palette.grey[400],
                      textTransform: 'none',
                      p: 0,
                      minWidth: 'auto',
                      '&:hover': { color: '#ffffff' }
                    }}
                  >
                    {t('navigation.favorites')}
                  </Button>
                )}
              </Box>
            </Box>

            {/* Columna 3: Soporte */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Soporte
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  sx={{
                    justifyContent: 'flex-start',
                    color: theme.palette.grey[400],
                    textTransform: 'none',
                    p: 0,
                    minWidth: 'auto',
                    '&:hover': { color: '#ffffff' }
                  }}
                >
                  Centro de Ayuda
                </Button>
                <Button
                  sx={{
                    justifyContent: 'flex-start',
                    color: theme.palette.grey[400],
                    textTransform: 'none',
                    p: 0,
                    minWidth: 'auto',
                    '&:hover': { color: '#ffffff' }
                  }}
                >
                  Términos de Servicio
                </Button>
                <Button
                  sx={{
                    justifyContent: 'flex-start',
                    color: theme.palette.grey[400],
                    textTransform: 'none',
                    p: 0,
                    minWidth: 'auto',
                    '&:hover': { color: '#ffffff' }
                  }}
                >
                  Política de Privacidad
                </Button>
                <Button
                  sx={{
                    justifyContent: 'flex-start',
                    color: theme.palette.grey[400],
                    textTransform: 'none',
                    p: 0,
                    minWidth: 'auto',
                    '&:hover': { color: '#ffffff' }
                  }}
                >
                  Contacto
                </Button>
              </Box>
            </Box>

            {/* Columna 4: Contacto */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Contacto
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon sx={{ fontSize: 18, color: theme.palette.grey[400] }} />
                  <Typography variant="body2" sx={{ color: theme.palette.grey[400] }}>
                    info@sharedmelody.com
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon sx={{ fontSize: 18, color: theme.palette.grey[400] }} />
                  <Typography variant="body2" sx={{ color: theme.palette.grey[400] }}>
                    +1 (555) 123-4567
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon sx={{ fontSize: 18, color: theme.palette.grey[400] }} />
                  <Typography variant="body2" sx={{ color: theme.palette.grey[400] }}>
                    San Francisco, CA
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Línea divisoria */}
          <Divider sx={{ borderColor: theme.palette.grey[700], mb: 3 }} />

          {/* Copyright y enlaces legales */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2
            }}
          >
            <Typography variant="body2" sx={{ color: theme.palette.grey[400] }}>
              © 2024 SharedMelody. Todos los derechos reservados.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Button
                sx={{
                  color: theme.palette.grey[400],
                  textTransform: 'none',
                  p: 0,
                  minWidth: 'auto',
                  fontSize: '0.875rem',
                  '&:hover': { color: '#ffffff' }
                }}
              >
                Privacidad
              </Button>
              <Button
                sx={{
                  color: theme.palette.grey[400],
                  textTransform: 'none',
                  p: 0,
                  minWidth: 'auto',
                  fontSize: '0.875rem',
                  '&:hover': { color: '#ffffff' }
                }}
              >
                Términos
              </Button>
              <Button
                sx={{
                  color: theme.palette.grey[400],
                  textTransform: 'none',
                  p: 0,
                  minWidth: 'auto',
                  fontSize: '0.875rem',
                  '&:hover': { color: '#ffffff' }
                }}
              >
                Cookies
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
