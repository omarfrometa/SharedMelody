// =============================================
// TIPOS PARA ADMINISTRACIÓN
// =============================================

import { User, UserRole } from './user';
import { Song, SongRequest, Author, MusicalGenre } from './song';

// =============================================
// TIPOS PARA GESTIÓN DE USUARIOS
// =============================================

export interface AdminUserFilters {
  search?: string;
  roleId?: string;
  countryId?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  registrationDateFrom?: string;
  registrationDateTo?: string;
  lastLoginFrom?: string;
  lastLoginTo?: string;
  sortBy?: 'username' | 'email' | 'created_at' | 'last_login' | 'first_name' | 'last_name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UpdateUserRole {
  userId: string;
  roleId: string;
  reason?: string;
}

export interface UpdateUserStatus {
  userId: string;
  isActive: boolean;
  reason?: string;
}

// =============================================
// TIPOS PARA MODERACIÓN DE CONTENIDO
// =============================================

export interface ModerationAction {
  actionId: string;
  moderatorId: string;
  moderator?: User;
  targetType: 'song' | 'song_request' | 'user' | 'author' | 'genre';
  targetId: string;
  action: 'approve' | 'reject' | 'archive' | 'restore' | 'delete' | 'suspend' | 'unsuspend';
  reason?: string;
  notes?: string;
  createdAt: string;
}

export interface ModerateContent {
  targetType: 'song' | 'song_request' | 'user' | 'author' | 'genre';
  targetId: string;
  action: 'approve' | 'reject' | 'archive' | 'restore' | 'delete' | 'suspend' | 'unsuspend';
  reason?: string;
  notes?: string;
}

export interface ContentModerationQueue {
  songs: {
    pending: Song[];
    reported: Song[];
    total: number;
  };
  requests: {
    pending: SongRequest[];
    reported: SongRequest[];
    total: number;
  };
  users: {
    reported: User[];
    suspended: User[];
    total: number;
  };
}

// =============================================
// TIPOS PARA GESTIÓN DE AUTORES
// =============================================

export interface CreateAuthor {
  authorName: string;
  authorBio?: string;
  birthDate?: string;
  deathDate?: string;
  countryId?: string;
  websiteUrl?: string;
  imageUrl?: string;
}

export interface UpdateAuthor extends Partial<CreateAuthor> {
  authorId: string;
}

export interface AuthorFilters {
  search?: string;
  countryId?: string;
  isActive?: boolean;
  createdBy?: string;
  birthYearFrom?: number;
  birthYearTo?: number;
  sortBy?: 'author_name' | 'created_at' | 'updated_at' | 'birth_date';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// =============================================
// TIPOS PARA GESTIÓN DE GÉNEROS
// =============================================

export interface CreateGenre {
  genreName: string;
  genreDescription?: string;
  parentGenreId?: string;
}

export interface UpdateGenre extends Partial<CreateGenre> {
  genreId: string;
}

export interface GenreFilters {
  search?: string;
  parentGenreId?: string;
  isActive?: boolean;
  createdBy?: string;
  sortBy?: 'genre_name' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// =============================================
// TIPOS PARA ANALYTICS Y ESTADÍSTICAS
// =============================================

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    byRole: Record<string, number>;
    byCountry: Record<string, number>;
  };
  songs: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    newThisMonth: number;
    byGenre: Record<string, number>;
    byType: Record<string, number>;
    totalViews: number;
    totalDownloads: number;
    totalLikes: number;
  };
  requests: {
    total: number;
    pending: number;
    completed: number;
    rejected: number;
    newThisMonth: number;
    completionRate: number;
    averageCompletionTime: number;
  };
  collaborations: {
    total: number;
    activeUsers: number;
    byType: Record<string, number>;
  };
  system: {
    totalStorage: number;
    usedStorage: number;
    emailsSent: number;
    emailsFailed: number;
    activeSessions: number;
  };
}

export interface UserActivityStats {
  userId: string;
  user?: User;
  songsUploaded: number;
  requestsMade: number;
  requestsFulfilled: number;
  collaborations: number;
  ratingsGiven: number;
  likesGiven: number;
  messagesReceived: number;
  lastActivity: string;
  joinDate: string;
  totalViews: number;
  totalDownloads: number;
  averageRating: number;
}

export interface ContentStats {
  period: 'day' | 'week' | 'month' | 'year';
  startDate: string;
  endDate: string;
  data: {
    date: string;
    songsUploaded: number;
    requestsMade: number;
    requestsFulfilled: number;
    newUsers: number;
    totalViews: number;
    totalDownloads: number;
    totalLikes: number;
  }[];
}

// =============================================
// TIPOS PARA CONFIGURACIÓN DEL SISTEMA
// =============================================

export interface SystemConfig {
  configId: string;
  configKey: string;
  configValue: string;
  configType: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  category: 'general' | 'email' | 'oauth' | 'storage' | 'moderation' | 'limits';
  isPublic: boolean;
  updatedBy?: string;
  updatedAt: string;
}

export interface UpdateSystemConfig {
  configKey: string;
  configValue: string;
  reason?: string;
}

// =============================================
// TIPOS PARA LOGS DE AUDITORÍA
// =============================================

export interface AuditLog {
  logId: string;
  userId?: string;
  user?: User;
  action: string;
  tableName?: string;
  recordId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  tableName?: string;
  recordId?: string;
  ipAddress?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'created_at' | 'action' | 'table_name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// =============================================
// TIPOS PARA REPORTES
// =============================================

export interface ReportRequest {
  reportType: 'users' | 'songs' | 'requests' | 'collaborations' | 'activity' | 'content_stats';
  format: 'json' | 'csv' | 'excel' | 'pdf';
  filters?: Record<string, any>;
  dateFrom?: string;
  dateTo?: string;
  includeDetails?: boolean;
}

export interface ReportResponse {
  reportId: string;
  reportType: string;
  format: string;
  status: 'generating' | 'completed' | 'failed';
  downloadUrl?: string;
  generatedAt?: string;
  expiresAt?: string;
  fileSize?: number;
  recordCount?: number;
  error?: string;
}
