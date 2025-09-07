import { apiClient } from '../api/client';
import { 
  DashboardStats,
  AdminUserFilters,
  UpdateUserRole,
  UpdateUserStatus,
  ModerationAction,
  ModerateContent,
  ContentModerationQueue,
  UserActivityStats,
  ContentStats,
  SystemConfig,
  UpdateSystemConfig,
  AuditLog,
  AuditLogFilters,
  ReportRequest,
  ReportResponse
} from '../types/admin';
import { User } from '../types/user';
import { Song, SongRequest, PaginatedResponse } from '../types/song';

// =============================================
// SERVICIO DE ADMINISTRACIÓN
// =============================================

export const adminService = {
  // Dashboard y estadísticas
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get<{success: boolean, data: DashboardStats, message: string}>('/admin/dashboard/stats');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas del dashboard');
    }
  },

  async getContentStats(period: 'day' | 'week' | 'month' | 'year', startDate?: string, endDate?: string): Promise<ContentStats> {
    try {
      const response = await apiClient.get<ContentStats>('/admin/stats/content', {
        params: { period, startDate, endDate }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas de contenido');
    }
  },

  async getUserActivityStats(userId: string): Promise<UserActivityStats> {
    try {
      const response = await apiClient.get<UserActivityStats>(`/admin/stats/user/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas de actividad del usuario');
    }
  },

  // Gestión de usuarios
  async getUsers(filters?: AdminUserFilters): Promise<PaginatedResponse<User>> {
    try {
      const response = await apiClient.get<{success: boolean, data: User[], pagination: any, message: string}>('/admin/users', {
        params: filters
      });
      return {
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener usuarios');
    }
  },

  async getUser(userId: string): Promise<User> {
    try {
      const response = await apiClient.get<User>(`/admin/users/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener usuario');
    }
  },

  async updateUserRole(data: UpdateUserRole): Promise<User> {
    try {
      const response = await apiClient.patch<User>(`/admin/users/${data.userId}/role`, {
        roleId: data.roleId,
        reason: data.reason
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar rol del usuario');
    }
  },

  async updateUserStatus(data: UpdateUserStatus): Promise<User> {
    try {
      const response = await apiClient.patch<User>(`/admin/users/${data.userId}/status`, {
        isActive: data.isActive,
        reason: data.reason
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar estado del usuario');
    }
  },

  async deleteUser(userId: string, reason?: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/users/${userId}`, {
        data: { reason }
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar usuario');
    }
  },

  // Moderación de contenido
  async getModerationQueue(): Promise<ContentModerationQueue> {
    try {
      const response = await apiClient.get<ContentModerationQueue>('/admin/moderation/queue');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener cola de moderación');
    }
  },

  async moderateContent(data: ModerateContent): Promise<ModerationAction> {
    try {
      const response = await apiClient.post<ModerationAction>('/admin/moderation/moderate', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al moderar contenido');
    }
  },

  async getModerationHistory(filters?: {
    moderatorId?: string;
    targetType?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ModerationAction>> {
    try {
      const response = await apiClient.get<PaginatedResponse<ModerationAction>>('/admin/moderation/history', {
        params: filters
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener historial de moderación');
    }
  },

  // Gestión de canciones
  async getSongsForModeration(filters?: {
    status?: string;
    uploadedBy?: string;
    genre?: string;
    reportedOnly?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Song>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Song>>('/admin/songs', {
        params: filters
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener canciones para moderación');
    }
  },

  async approveSong(songId: string, notes?: string): Promise<Song> {
    try {
      const response = await apiClient.patch<Song>(`/admin/songs/${songId}/approve`, {
        notes
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al aprobar canción');
    }
  },

  async rejectSong(songId: string, reason: string, notes?: string): Promise<Song> {
    try {
      const response = await apiClient.patch<Song>(`/admin/songs/${songId}/reject`, {
        reason,
        notes
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al rechazar canción');
    }
  },

  async archiveSong(songId: string, reason?: string): Promise<Song> {
    try {
      const response = await apiClient.patch<Song>(`/admin/songs/${songId}/archive`, {
        reason
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al archivar canción');
    }
  },

  // Gestión de solicitudes
  async getRequestsForModeration(filters?: {
    status?: string;
    requestedBy?: string;
    priorityLevel?: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<SongRequest>> {
    try {
      const response = await apiClient.get<PaginatedResponse<SongRequest>>('/admin/requests', {
        params: filters
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener solicitudes para moderación');
    }
  },

  async approveRequest(requestId: string): Promise<SongRequest> {
    try {
      const response = await apiClient.patch<SongRequest>(`/admin/requests/${requestId}/approve`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al aprobar solicitud');
    }
  },

  async rejectRequest(requestId: string, reason: string): Promise<SongRequest> {
    try {
      const response = await apiClient.patch<SongRequest>(`/admin/requests/${requestId}/reject`, {
        reason
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al rechazar solicitud');
    }
  },

  // Configuración del sistema
  async getSystemConfig(): Promise<SystemConfig[]> {
    try {
      const response = await apiClient.get<SystemConfig[]>('/admin/config');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener configuración del sistema');
    }
  },

  async updateSystemConfig(data: UpdateSystemConfig): Promise<SystemConfig> {
    try {
      const response = await apiClient.put<SystemConfig>('/admin/config', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar configuración');
    }
  },

  // Logs de auditoría
  async getAuditLogs(filters?: AuditLogFilters): Promise<PaginatedResponse<AuditLog>> {
    try {
      const response = await apiClient.get<PaginatedResponse<AuditLog>>('/admin/audit-logs', {
        params: filters
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener logs de auditoría');
    }
  },

  // Reportes
  async generateReport(request: ReportRequest): Promise<ReportResponse> {
    try {
      const response = await apiClient.post<ReportResponse>('/admin/reports/generate', request);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al generar reporte');
    }
  },

  async getReportStatus(reportId: string): Promise<ReportResponse> {
    try {
      const response = await apiClient.get<ReportResponse>(`/admin/reports/${reportId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estado del reporte');
    }
  },

  async downloadReport(reportId: string): Promise<Blob> {
    try {
      const response = await apiClient.get(`/admin/reports/${reportId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al descargar reporte');
    }
  },

  // Notificaciones masivas
  async sendBulkNotification(data: {
    userIds?: string[];
    userFilters?: AdminUserFilters;
    title: string;
    content: string;
    messageType: string;
    expiresAt?: string;
  }): Promise<{ sentCount: number }> {
    try {
      const response = await apiClient.post('/admin/notifications/bulk', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al enviar notificaciones masivas');
    }
  },

  // Mantenimiento del sistema
  async cleanupExpiredData(): Promise<{ deletedCount: number }> {
    try {
      const response = await apiClient.post('/admin/maintenance/cleanup');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al limpiar datos expirados');
    }
  },

  async optimizeDatabase(): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.post('/admin/maintenance/optimize-db');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al optimizar base de datos');
    }
  },

  async getSystemHealth(): Promise<{
    database: 'healthy' | 'warning' | 'error';
    storage: 'healthy' | 'warning' | 'error';
    email: 'healthy' | 'warning' | 'error';
    overall: 'healthy' | 'warning' | 'error';
  }> {
    try {
      const response = await apiClient.get('/admin/health');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estado del sistema');
    }
  },

  // Gestión de solicitudes
  async getRequests(filters?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<PaginatedResponse<any>> {
    try {
      const response = await apiClient.get<{success: boolean, data: any[], pagination: any, message: string}>('/admin/requests', {
        params: filters
      });
      return {
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener solicitudes');
    }
  },

  async getRequestById(id: string): Promise<any> {
    try {
      const response = await apiClient.get<{success: boolean, data: any, message: string}>(`/admin/requests/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener solicitud');
    }
  },

  async updateRequestStatus(id: string, data: {
    status?: string;
    priority?: string;
    fulfilled_with?: number;
  }): Promise<any> {
    try {
      const response = await apiClient.put<{success: boolean, data: any, message: string}>(`/admin/requests/${id}/status`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar solicitud');
    }
  },

  async deleteRequest(id: string): Promise<void> {
    try {
      await apiClient.delete<{success: boolean, message: string}>(`/admin/requests/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar solicitud');
    }
  }
};
