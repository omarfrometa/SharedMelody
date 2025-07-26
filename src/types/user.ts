// =============================================
// TIPOS PARA AUTENTICACIÓN
// =============================================

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  countryId?: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface OAuthProvider {
  providerId: string;
  providerName: 'google' | 'facebook' | 'microsoft' | 'apple';
  providerDisplayName: string;
  clientId?: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scopes: string[];
  isActive: boolean;
}

export interface OAuthAccount {
  oauthAccountId: string;
  userId: string;
  providerId: string;
  providerUserId: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  providerEmail?: string;
  providerName?: string;
  providerPictureUrl?: string;
  rawUserData?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// =============================================
// TIPOS PARA USUARIOS
// =============================================

export interface Country {
  countryId: string;
  countryCode: string;
  countryName: string;
  createdAt: string;
}

export interface UserRole {
  roleId: string;
  roleName: 'user' | 'admin' | 'moderator';
  roleDescription?: string;
  permissions: {
    can_request_songs?: boolean;
    can_upload_songs?: boolean;
    can_rate_songs?: boolean;
    can_like_songs?: boolean;
    can_moderate_content?: boolean;
    can_manage_users?: boolean;
    can_manage_authors?: boolean;
    can_manage_genres?: boolean;
    can_view_analytics?: boolean;
  };
  createdAt: string;
}

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  emailVerified: boolean;
  countryId?: string;
  country?: Country;
  phone?: string;
  dateOfBirth?: string;
  profilePictureUrl?: string;
  avatarUrl?: string;
  bio?: string;
  roleId: string;
  role?: UserRole;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  authProviders?: string[];
  isOAuthUser?: boolean;
}

export interface UserSession {
  sessionId: string;
  userId: string;
  sessionToken: string;
  refreshToken?: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: string;
  createdAt: string;
  lastActivity: string;
  isActive: boolean;
}

export interface AuthResponse {
  user: User;
  session: UserSession;
  accessToken: string;
  refreshToken?: string;
}

// =============================================
// TIPOS PARA MENSAJES DE USUARIO
// =============================================

export interface UserMessage {
  messageId: string;
  userId: string;
  messageType: 'request_fulfilled' | 'collaboration_invite' | 'system_notification' | 'admin_message' | 'welcome' | 'reminder';
  title: string;
  content: string;
  relatedSongId?: string;
  relatedRequestId?: string;
  relatedCollaborationId?: string;
  isRead: boolean;
  readAt?: string;
  isArchived: boolean;
  archivedAt?: string;
  sentBy?: string;
  sentByUser?: User;
  createdAt: string;
  expiresAt?: string;
}

export interface UserMessageDetailed extends UserMessage {
  username: string;
  email: string;
  relatedSongTitle?: string;
  relatedRequestTitle?: string;
  sentByUsername?: string;
}