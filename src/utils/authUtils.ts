import { User } from '../types/user';

// =============================================
// UTILIDADES DE AUTENTICACIÓN
// =============================================

export const authUtils = {
  /**
   * Verifica si un usuario tiene un rol específico
   */
  hasRole: (user: User | null, role: string): boolean => {
    if (!user || !user.role) {
      return false;
    }
    
    return user.role.roleName === role;
  },

  /**
   * Verifica si un usuario tiene un permiso específico
   */
  hasPermission: (user: User | null, permission: string): boolean => {
    if (!user) {
      return false;
    }

    if (!user.role) {
      return false;
    }

    // Los administradores tienen todos los permisos
    const roleName = user.role.roleName?.trim?.() || user.role.roleName;
    if (roleName === 'admin') {
      return true;
    }

    // Mapeo de permisos por rol
    const rolePermissions: Record<string, string[]> = {
      admin: [
        'can_upload_songs',
        'can_edit_songs',
        'can_delete_songs',
        'can_manage_users',
        'can_manage_genres',
        'can_manage_requests',
        'can_view_analytics',
        'can_moderate_content',
        'can_manage_system'
      ],
      moderator: [
        'can_upload_songs',
        'can_edit_songs',
        'can_moderate_content',
        'can_manage_requests'
      ],
      contributor: [
        'can_upload_songs'
      ],
      user: []
    };

    const userPermissions = rolePermissions[roleName] || [];
    return userPermissions.includes(permission);
  },

  /**
   * Verifica si un usuario está autenticado
   */
  isAuthenticated: (user: User | null): boolean => {
    return user !== null;
  },

  /**
   * Verifica si un usuario es administrador
   */
  isAdmin: (user: User | null): boolean => {
    return authUtils.hasRole(user, 'admin');
  },

  /**
   * Verifica si un usuario es moderador
   */
  isModerator: (user: User | null): boolean => {
    return authUtils.hasRole(user, 'moderator');
  },

  /**
   * Verifica si un usuario puede subir canciones
   */
  canUploadSongs: (user: User | null): boolean => {
    return authUtils.hasPermission(user, 'can_upload_songs');
  },

  /**
   * Verifica si un usuario puede editar canciones
   */
  canEditSongs: (user: User | null): boolean => {
    return authUtils.hasPermission(user, 'can_edit_songs');
  },

  /**
   * Verifica si un usuario puede eliminar canciones
   */
  canDeleteSongs: (user: User | null): boolean => {
    return authUtils.hasPermission(user, 'can_delete_songs');
  },

  /**
   * Verifica si un usuario puede gestionar otros usuarios
   */
  canManageUsers: (user: User | null): boolean => {
    return authUtils.hasPermission(user, 'can_manage_users');
  },

  /**
   * Verifica si un usuario puede moderar contenido
   */
  canModerateContent: (user: User | null): boolean => {
    return authUtils.hasPermission(user, 'can_moderate_content');
  },

  /**
   * Obtiene el nombre completo del usuario
   */
  getFullName: (user: User | null): string => {
    if (!user) {
      return '';
    }
    
    return `${user.firstName} ${user.lastName}`.trim();
  },

  /**
   * Obtiene las iniciales del usuario
   */
  getInitials: (user: User | null): string => {
    if (!user) {
      return '';
    }
    
    const firstName = user.firstName?.charAt(0) || '';
    const lastName = user.lastName?.charAt(0) || '';
    
    return `${firstName}${lastName}`.toUpperCase();
  },

  /**
   * Verifica si el token está expirado
   */
  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  },

  /**
   * Obtiene la información del token
   */
  getTokenInfo: (token: string): any => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      return null;
    }
  },

  /**
   * Obtiene el token de acceso del almacenamiento local
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  /**
   * Guarda el token de acceso en el almacenamiento local
   */
  setAccessToken: (token: string): void => {
    localStorage.setItem('accessToken', token);
  },

  /**
   * Elimina el token de acceso del almacenamiento local
   */
  removeAccessToken: (): void => {
    localStorage.removeItem('accessToken');
  }
};
