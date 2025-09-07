import {
  LoginCredentials,
  RegisterData,
  User,
  AuthResponse,
  OAuthProvider,
  UserSession
} from '../types/user';
import { ApiResponse } from '../types/song';
import { apiClient } from '../api/client';

// =============================================
// SERVICIO DE AUTENTICACIÓN LOCAL
// =============================================

export const authService = {
  // Autenticación local
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', userData);

      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al registrarse');
    }
  },

  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await apiClient.post('/auth/logout');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        return null;
      }

      // Verificar si el token sigue siendo válido y obtener datos del usuario
      const response = await apiClient.get<User>('/auth/me');

      // Guardar los datos del usuario en localStorage para futuras consultas
      localStorage.setItem('user', JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      // Si el token no es válido, limpiar el almacenamiento local
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return null;
    }
  },

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return null;
      }

      const response = await apiClient.post<{ accessToken: string; refreshToken?: string }>('/auth/refresh', {
        refreshToken
      });

      localStorage.setItem('accessToken', response.data.accessToken);
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }

      return response.data.accessToken;
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return null;
    }
  },

  // Verificación de email
  async sendEmailVerification(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/send-verification', { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al enviar verificación de email');
    }
  },

  async verifyEmail(token: string): Promise<void> {
    try {
      await apiClient.post('/auth/verify-email', { token });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al verificar email');
    }
  },

  // Recuperación de contraseña
  async sendPasswordReset(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/forgot-password', { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al enviar recuperación de contraseña');
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post('/auth/reset-password', { token, newPassword });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al restablecer contraseña');
    }
  },

  // Gestión de sesiones
  async getSessions(): Promise<UserSession[]> {
    try {
      const response = await apiClient.get<UserSession[]>('/auth/sessions');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener sesiones');
    }
  },

  async revokeSession(sessionId: string): Promise<void> {
    try {
      await apiClient.delete(`/auth/sessions/${sessionId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al revocar sesión');
    }
  },

  async revokeAllSessions(): Promise<void> {
    try {
      await apiClient.delete('/auth/sessions');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al revocar todas las sesiones');
    }
  }
};

// =============================================
// SERVICIO DE AUTENTICACIÓN OAUTH
// =============================================

export const oauthService = {
  // Obtener proveedores OAuth disponibles
  async getProviders(): Promise<OAuthProvider[]> {
    try {
      const response = await apiClient.get<OAuthProvider[]>('/auth/oauth/providers');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener proveedores OAuth');
    }
  },

  // Iniciar autenticación OAuth
  async initiateOAuth(providerName: string, redirectUrl?: string): Promise<string> {
    try {
      const response = await apiClient.post<{ authUrl: string }>('/auth/oauth/initiate', {
        provider: providerName,
        redirectUrl: redirectUrl || window.location.origin + '/auth/callback'
      });

      return response.data.authUrl;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al iniciar autenticación OAuth');
    }
  },

  // Manejar callback de OAuth
  async handleOAuthCallback(provider: string, code: string, state?: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/oauth/callback', {
        provider,
        code,
        state
      });

      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error en callback OAuth');
    }
  },

  // Vincular cuenta OAuth a usuario existente
  async linkOAuthAccount(provider: string, code: string): Promise<void> {
    try {
      await apiClient.post('/auth/oauth/link', {
        provider,
        code
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al vincular cuenta OAuth');
    }
  },

  // Desvincular cuenta OAuth
  async unlinkOAuthAccount(oauthAccountId: string): Promise<void> {
    try {
      await apiClient.delete(`/auth/oauth/unlink/${oauthAccountId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al desvincular cuenta OAuth');
    }
  },

  // Obtener cuentas OAuth vinculadas del usuario actual
  async getLinkedAccounts(): Promise<any[]> {
    try {
      const response = await apiClient.get('/auth/oauth/linked');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener cuentas vinculadas');
    }
  }
};

// =============================================
// UTILIDADES DE AUTENTICACIÓN
// =============================================

export const authUtils = {
  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Obtener token de acceso
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  setAccessToken(token: string): void {
   localStorage.setItem('accessToken', token);
  },

  // Obtener usuario del almacenamiento local
  getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  },

  // Verificar si el usuario tiene un rol específico
  hasRole(user: User | null, role: string): boolean {
    return user?.role?.roleName === role;
  },

  // Verificar si el usuario tiene un permiso específico
  hasPermission(user: User | null, permission: string): boolean {
    if (!user?.role?.permissions) return false;
    return (user.role.permissions as any)[permission] === true;
  },

  // Limpiar datos de autenticación
  clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Configurar interceptor para renovar token automáticamente
  setupTokenInterceptor(): void {
    apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await authService.refreshToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return apiClient(originalRequest);
            }
          } catch (refreshError) {
            authUtils.clearAuthData();
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }
};