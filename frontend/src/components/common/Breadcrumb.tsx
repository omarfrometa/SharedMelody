import React from 'react';
import {
  Box,
  Breadcrumbs,
  Typography,
  Link,
  Chip
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  MusicNote as MusicNoteIcon,
  LibraryMusic as LibraryMusicIcon
} from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../contexts/LanguageContext';
import { colors } from '../../theme/theme';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { t } = useTranslation();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with Home
    breadcrumbs.push({
      label: t('navigation.home') || 'Inicio',
      href: '/',
      icon: <HomeIcon sx={{ fontSize: 16 }} />
    });

    // Handle different routes
    switch (true) {
      case location.pathname === '/':
        // Home page - no additional breadcrumbs needed
        break;

      case location.pathname === '/songs':
        breadcrumbs.push({
          label: t('navigation.songs') || 'Canciones',
          icon: <LibraryMusicIcon sx={{ fontSize: 16 }} />,
          isActive: true
        });
        break;

      case location.pathname.startsWith('/songs/') && !location.pathname.includes('/edit'):
        const songId = pathnames[1];
        breadcrumbs.push({
          label: t('navigation.songs') || 'Canciones',
          href: '/songs',
          icon: <LibraryMusicIcon sx={{ fontSize: 16 }} />
        });
        breadcrumbs.push({
          label: `${t('songs.song') || 'Canción'} #${songId}`,
          icon: <MusicNoteIcon sx={{ fontSize: 16 }} />,
          isActive: true
        });
        break;

      case location.pathname.startsWith('/artist/'):
        const artistName = params.artistName ? decodeURIComponent(params.artistName) : '';
        breadcrumbs.push({
          label: artistName,
          icon: <PersonIcon sx={{ fontSize: 16 }} />,
          isActive: true
        });
        break;

      case location.pathname === '/upload':
        breadcrumbs.push({
          label: t('navigation.upload') || 'Subir',
          isActive: true
        });
        break;

      case location.pathname === '/request':
        breadcrumbs.push({
          label: t('navigation.request') || 'Solicitar',
          isActive: true
        });
        break;

      case location.pathname === '/profile':
        breadcrumbs.push({
          label: t('navigation.profile') || 'Perfil',
          isActive: true
        });
        break;

      case location.pathname === '/settings':
        breadcrumbs.push({
          label: t('navigation.settings') || 'Configuración',
          isActive: true
        });
        break;

      case location.pathname === '/messages':
        breadcrumbs.push({
          label: t('navigation.messages') || 'Mensajes',
          isActive: true
        });
        break;

      case location.pathname.startsWith('/admin'):
        breadcrumbs.push({
          label: t('navigation.admin') || 'Administración',
          href: '/admin',
          isActive: pathnames.length === 1
        });
        
        if (pathnames.length > 1) {
          const adminSection = pathnames[1];
          const adminLabels: Record<string, string> = {
            'users': 'Usuarios',
            'songs': t('navigation.songs') || 'Canciones',
            'artists': 'Artistas',
            'genres': 'Géneros',
            'requests': 'Solicitudes'
          };
          
          breadcrumbs.push({
            label: adminLabels[adminSection] || adminSection,
            isActive: true
          });
        }
        break;

      default:
        // Generic handler for other routes
        pathnames.forEach((pathname, index) => {
          const href = '/' + pathnames.slice(0, index + 1).join('/');
          const isLast = index === pathnames.length - 1;
          
          breadcrumbs.push({
            label: pathname.charAt(0).toUpperCase() + pathname.slice(1),
            href: isLast ? undefined : href,
            isActive: isLast
          });
        });
        break;
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumb on home page unless there's more than just home
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <Box
      sx={{
        backgroundColor: colors.secondary[50],
        borderBottom: `1px solid ${colors.secondary[200]}`,
        py: 1.5,
        px: 2
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Breadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: 16, color: colors.secondary[400] }} />}
          aria-label="breadcrumb"
          sx={{
            '& .MuiBreadcrumbs-separator': {
              mx: 1
            }
          }}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            if (isLast || crumb.isActive) {
              return (
                <Box 
                  key={index}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5 
                  }}
                >
                  {crumb.icon}
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.primary[600],
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }}
                  >
                    {crumb.label}
                  </Typography>
                </Box>
              );
            }

            return (
              <Link
                key={index}
                onClick={() => crumb.href && navigate(crumb.href)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: colors.secondary[600],
                  textDecoration: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  '&:hover': {
                    color: colors.primary[600],
                    textDecoration: 'underline'
                  },
                  transition: 'color 0.2s ease'
                }}
              >
                {crumb.icon}
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      </Box>
    </Box>
  );
};

export default Breadcrumb;