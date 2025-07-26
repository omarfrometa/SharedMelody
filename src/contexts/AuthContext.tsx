import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  OAuthProvider,
  UserSession
} from '../types/user';
import { authService, oauthService, authUtils } from '../services/authService';

interface AuthContextType {
  // Estado de autenticación
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  // Autenticación local
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (userData: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;

  // OAuth
  oauthProviders: OAuthProvider[];
  initiateOAuth: (provider: string) => Promise<void>;
  linkOAuthAccount: (provider: string, code: string) => Promise<void>;
  unlinkOAuthAccount: (accountId: string) => Promise<void>;

  // Gestión de cuenta
  refreshUser: () => Promise<void>;
  sendEmailVerification: (email?: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;

  // Sesiones
  sessions: UserSession[];
  refreshSessions: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeAllSessions: () => Promise<void>;

  // Utilidades
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  setAuthDataFromToken: (token: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [oauthProviders, setOauthProviders] = useState<OAuthProvider[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);

  const isAuthenticated = !!user && authUtils.isAuthenticated();

  useEffect(() => {
    initializeAuth();
    loadOAuthProviders();
    authUtils.setupTokenInterceptor();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        await loadSessions();
      }
    } catch (error) {
      console.error('Error al inicializar autenticación:', error);
      authUtils.clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const loadOAuthProviders = async () => {
    try {
      const providers = await oauthService.getProviders();
      setOauthProviders(providers.filter(p => p.isActive));
    } catch (error) {
      console.error('Error al cargar proveedores OAuth:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const userSessions = await authService.getSessions();
      setSessions(userSessions);
    } catch (error) {
      console.error('Error al cargar sesiones:', error);
    }
  };

  // Autenticación local
  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      // TODO: Implementar loadSessions cuando el endpoint esté disponible
      // await loadSessions();
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      // TODO: Implementar loadSessions cuando el endpoint esté disponible
      // await loadSessions();
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
      setSessions([]);
      authUtils.clearAuthData();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Limpiar datos locales incluso si falla la llamada al servidor
      setUser(null);
      setSessions([]);
      authUtils.clearAuthData();
    }
  };

  // OAuth
  const initiateOAuth = async (provider: string): Promise<void> => {
    try {
      const authUrl = await oauthService.initiateOAuth(provider);
      window.location.href = authUrl;
    } catch (error) {
      throw error;
    }
  };

  const linkOAuthAccount = async (provider: string, code: string): Promise<void> => {
    try {
      await oauthService.linkOAuthAccount(provider, code);
      await refreshUser();
    } catch (error) {
      throw error;
    }
  };

  const unlinkOAuthAccount = async (accountId: string): Promise<void> => {
    try {
      await oauthService.unlinkOAuthAccount(accountId);
      await refreshUser();
    } catch (error) {
      throw error;
    }
  };

  // Gestión de cuenta
  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  };

  const sendEmailVerification = async (email?: string): Promise<void> => {
    try {
      const emailToVerify = email || user?.email;
      if (!emailToVerify) {
        throw new Error('Email no disponible');
      }
      await authService.sendEmailVerification(emailToVerify);
    } catch (error) {
      throw error;
    }
  };

  const verifyEmail = async (token: string): Promise<void> => {
    try {
      await authService.verifyEmail(token);
      await refreshUser();
    } catch (error) {
      throw error;
    }
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    try {
      await authService.sendPasswordReset(email);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      await authService.resetPassword(token, newPassword);
    } catch (error) {
      throw error;
    }
  };

  // Sesiones
  const refreshSessions = async (): Promise<void> => {
    await loadSessions();
  };

  const revokeSession = async (sessionId: string): Promise<void> => {
    try {
      await authService.revokeSession(sessionId);
      await loadSessions();
    } catch (error) {
      throw error;
    }
  };

  const revokeAllSessions = async (): Promise<void> => {
    try {
      await authService.revokeAllSessions();
      setSessions([]);
      // Cerrar sesión actual también
      await logout();
    } catch (error) {
      throw error;
    }
  };

  // Utilidades
  const hasRole = (role: string): boolean => {
    return authUtils.hasRole(user, role);
  };

  const hasPermission = (permission: string): boolean => {
    return authUtils.hasPermission(user, permission);
  };

  const setAuthDataFromToken = async (token: string): Promise<void> => {
 try {
   setLoading(true);
   authUtils.setAccessToken(token);
   await initializeAuth();
 } catch (error) {
     console.error("Error setting auth data from token:", error);
     authUtils.clearAuthData();
   } finally {
     setLoading(false);
   }
  };

  const value: AuthContextType = {
    // Estado
    user,
    loading,
    isAuthenticated,

    // Autenticación local
    login,
    register,
    logout,

    // OAuth
    oauthProviders,
    initiateOAuth,
    linkOAuthAccount,
    unlinkOAuthAccount,

    // Gestión de cuenta
    refreshUser,
    sendEmailVerification,
    verifyEmail,
    sendPasswordReset,
    resetPassword,

    // Sesiones
    sessions,
    refreshSessions,
    revokeSession,
    revokeAllSessions,

    // Utilidades
    hasRole,
    hasPermission,
    setAuthDataFromToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};