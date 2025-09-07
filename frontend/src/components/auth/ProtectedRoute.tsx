import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin' | 'moderator';
  requiredPermission?: string;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
  redirectTo = '/login'
}) => {
  const { user, loading, isAuthenticated, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Verificar rol requerido
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Box p={3}>
        <Alert severity="error">
          No tienes permisos para acceder a esta página. 
          Se requiere el rol: {requiredRole}
        </Alert>
      </Box>
    );
  }

  // Verificar permiso requerido
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <Box p={3}>
        <Alert severity="error">
          No tienes permisos para acceder a esta página.
          Se requiere el permiso: {requiredPermission}
        </Alert>
      </Box>
    );
  }

  // Verificar si el email está verificado para ciertas rutas
  // NOTA: Comentado temporalmente para desarrollo
  // if (!user.emailVerified && location.pathname.includes('/admin')) {
  //   return (
  //     <Box p={3}>
  //       <Alert severity="warning">
  //         Debes verificar tu email antes de acceder a las funciones de administración.
  //       </Alert>
  //     </Box>
  //   );
  // }

  // Verificar si la cuenta está activa
  if (!user.isActive) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Tu cuenta ha sido desactivada. Contacta al administrador para más información.
        </Alert>
      </Box>
    );
  }

  // Si todas las verificaciones pasan, renderizar el componente hijo
  return <>{children}</>;
};
