import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  People as UsersIcon,
  MusicNote as SongsIcon,
  Album as AlbumsIcon,
  Person as ArtistsIcon,
  Edit as AuthorsIcon,
  Category as GenresIcon,
  RequestPage as RequestsIcon,
  Public as CountriesIcon,
  AdminPanelSettings as RolesIcon,
  Security as AuthProvidersIcon,
  ExpandLess,
  ExpandMore,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 280;

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

interface MenuItemType {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItemType[];
  badge?: number;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = 'Panel de Administración' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(!isMobile);
  const [expandedItems, setExpandedItems] = useState<string[]>(['content']);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const menuItems: MenuItemType[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/admin'
    },
    {
      id: 'content',
      label: 'Gestión de Contenido',
      icon: <SongsIcon />,
      children: [
        {
          id: 'songs',
          label: 'Canciones',
          icon: <SongsIcon />,
          path: '/admin/songs'
        },
        {
          id: 'albums',
          label: 'Álbumes',
          icon: <AlbumsIcon />,
          path: '/admin/albums'
        },
        {
          id: 'artists',
          label: 'Artistas',
          icon: <ArtistsIcon />,
          path: '/admin/artists'
        },
        {
          id: 'authors',
          label: 'Autores',
          icon: <AuthorsIcon />,
          path: '/admin/authors'
        },
        {
          id: 'genres',
          label: 'Géneros',
          icon: <GenresIcon />,
          path: '/admin/genres'
        }
      ]
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: <UsersIcon />,
      path: '/admin/users'
    },
    {
      id: 'requests',
      label: 'Solicitudes',
      icon: <RequestsIcon />,
      path: '/admin/requests',
      badge: 5 // Ejemplo de badge para solicitudes pendientes
    },
    {
      id: 'system',
      label: 'Sistema',
      icon: <SettingsIcon />,
      children: [
        {
          id: 'countries',
          label: 'Países',
          icon: <CountriesIcon />,
          path: '/admin/countries'
        },
        {
          id: 'roles',
          label: 'Roles',
          icon: <RolesIcon />,
          path: '/admin/roles'
        },
        {
          id: 'auth-providers',
          label: 'Proveedores de Auth',
          icon: <AuthProvidersIcon />,
          path: '/admin/auth-providers'
        }
      ]
    }
  ];

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleItemClick = (item: MenuItemType) => {
    if (item.children) {
      const isExpanded = expandedItems.includes(item.id);
      if (isExpanded) {
        setExpandedItems(expandedItems.filter(id => id !== item.id));
      } else {
        setExpandedItems([...expandedItems, item.id]);
      }
    } else if (item.path) {
      navigate(item.path);
      if (isMobile) {
        setOpen(false);
      }
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const renderMenuItem = (item: MenuItemType, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = item.path ? isActive(item.path) : false;

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
              pl: level > 0 ? 4 : 2.5,
              backgroundColor: active ? 'action.selected' : 'transparent',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
                color: active ? 'primary.main' : 'inherit'
              }}
            >
              {item.badge ? (
                <Badge badgeContent={item.badge} color="error">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              sx={{
                opacity: open ? 1 : 0,
                color: active ? 'primary.main' : 'inherit'
              }}
            />
            {hasChildren && open && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>
        {hasChildren && (
          <Collapse in={isExpanded && open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawer = (
    <Box>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: [1],
          minHeight: '64px !important'
        }}
      >
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          {open && 'Admin Panel'}
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map(item => renderMenuItem(item))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { lg: `calc(100% - ${open ? drawerWidth : theme.spacing(7)})` },
          ml: { lg: `${open ? drawerWidth : theme.spacing(7)}px` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{
              marginRight: 5,
              display: { lg: 'none' }
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'A'}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { lg: open ? drawerWidth : theme.spacing(7) }, flexShrink: { lg: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={open}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: open ? drawerWidth : theme.spacing(7),
              boxSizing: 'border-box',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { lg: `calc(100% - ${open ? drawerWidth : theme.spacing(7)})` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        {children}
      </Box>

      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <AccountIcon fontSize="small" />
          </ListItemIcon>
          Mi Perfil
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Configuración
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Cerrar Sesión
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AdminLayout;
