import { apiClient } from '../api/client';
import { 
  SongRequest, 
  SongRequestDetailed,
  CreateSongRequest, 
  SongRequestFilters,
  PaginatedResponse,
  ApiResponse 
} from '../types/song';

// =============================================
// SERVICIO DE SOLICITUDES DE CANCIONES
// =============================================

export const songRequestService = {
  // Obtener todas las solicitudes con filtros
  async getRequests(filters?: SongRequestFilters): Promise<PaginatedResponse<SongRequestDetailed>> {
    try {
      const response = await apiClient.get<PaginatedResponse<SongRequestDetailed>>(
        '/song-requests',
        { params: filters }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener solicitudes');
    }
  },

  // Obtener solicitudes de un usuario específico
  async getUserRequests(
    userId: string, 
    filters?: SongRequestFilters
  ): Promise<PaginatedResponse<SongRequestDetailed>> {
    try {
      const response = await apiClient.get<PaginatedResponse<SongRequestDetailed>>(
        `/song-requests/user/${userId}`,
        { params: filters }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener solicitudes del usuario');
    }
  },

  // Obtener una solicitud específica
  async getRequest(requestId: string): Promise<SongRequestDetailed> {
    try {
      const response = await apiClient.get<SongRequestDetailed>(`/song-requests/${requestId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener solicitud');
    }
  },

  // Crear nueva solicitud
  async createRequest(requestData: CreateSongRequest): Promise<SongRequest> {
    try {
      const response = await apiClient.post<SongRequest>('/song-requests', requestData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear solicitud');
    }
  },

  // Actualizar solicitud
  async updateRequest(
    requestId: string, 
    updates: Partial<CreateSongRequest>
  ): Promise<SongRequest> {
    try {
      const response = await apiClient.put<SongRequest>(`/song-requests/${requestId}`, updates);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar solicitud');
    }
  },

  // Eliminar solicitud
  async deleteRequest(requestId: string): Promise<void> {
    try {
      await apiClient.delete(`/song-requests/${requestId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar solicitud');
    }
  },

  // Cancelar solicitud
  async cancelRequest(requestId: string): Promise<SongRequest> {
    try {
      const response = await apiClient.patch<SongRequest>(`/song-requests/${requestId}/cancel`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al cancelar solicitud');
    }
  },

  // Marcar solicitud como en progreso
  async markAsInProgress(requestId: string): Promise<SongRequest> {
    try {
      const response = await apiClient.patch<SongRequest>(`/song-requests/${requestId}/in-progress`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al marcar como en progreso');
    }
  },

  // Cumplir solicitud (vincular con canción)
  async fulfillRequest(requestId: string, songId: string): Promise<SongRequest> {
    try {
      const response = await apiClient.patch<SongRequest>(`/song-requests/${requestId}/fulfill`, {
        songId
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al cumplir solicitud');
    }
  },

  // Rechazar solicitud
  async rejectRequest(requestId: string, reason?: string): Promise<SongRequest> {
    try {
      const response = await apiClient.patch<SongRequest>(`/song-requests/${requestId}/reject`, {
        reason
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al rechazar solicitud');
    }
  },

  // Obtener solicitudes populares
  async getPopularRequests(limit: number = 10): Promise<SongRequestDetailed[]> {
    try {
      const response = await apiClient.get<SongRequestDetailed[]>('/song-requests/popular', {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener solicitudes populares');
    }
  },

  // Obtener solicitudes recientes
  async getRecentRequests(limit: number = 10): Promise<SongRequestDetailed[]> {
    try {
      const response = await apiClient.get<SongRequestDetailed[]>('/song-requests/recent', {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener solicitudes recientes');
    }
  },

  // Buscar solicitudes similares
  async findSimilarRequests(
    title: string, 
    artistName: string
  ): Promise<SongRequestDetailed[]> {
    try {
      const response = await apiClient.get<SongRequestDetailed[]>('/song-requests/similar', {
        params: { title, artistName }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al buscar solicitudes similares');
    }
  },

  // Votar por una solicitud (aumentar prioridad)
  async voteForRequest(requestId: string): Promise<void> {
    try {
      await apiClient.post(`/song-requests/${requestId}/vote`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al votar por solicitud');
    }
  },

  // Quitar voto de una solicitud
  async removeVoteFromRequest(requestId: string): Promise<void> {
    try {
      await apiClient.delete(`/song-requests/${requestId}/vote`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al quitar voto');
    }
  },

  // Obtener estadísticas de solicitudes
  async getRequestStats(userId?: string): Promise<any> {
    try {
      const url = userId ? `/song-requests/stats/${userId}` : '/song-requests/stats';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  },

  // Reportar solicitud
  async reportRequest(
    requestId: string, 
    reason: string, 
    description?: string
  ): Promise<void> {
    try {
      await apiClient.post(`/song-requests/${requestId}/report`, {
        reason,
        description
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al reportar solicitud');
    }
  },

  // Obtener solicitudes por género
  async getRequestsByGenre(
    genre: string, 
    filters?: SongRequestFilters
  ): Promise<PaginatedResponse<SongRequestDetailed>> {
    try {
      const response = await apiClient.get<PaginatedResponse<SongRequestDetailed>>(
        `/song-requests/genre/${genre}`,
        { params: filters }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener solicitudes por género');
    }
  },

  // Obtener solicitudes que el usuario puede cumplir
  async getRequestsUserCanFulfill(
    userId: string, 
    filters?: SongRequestFilters
  ): Promise<PaginatedResponse<SongRequestDetailed>> {
    try {
      const response = await apiClient.get<PaginatedResponse<SongRequestDetailed>>(
        `/song-requests/can-fulfill/${userId}`,
        { params: filters }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener solicitudes que puedes cumplir');
    }
  },

  // Exportar solicitudes
  async exportRequests(
    filters?: SongRequestFilters, 
    format: 'json' | 'csv' | 'excel' = 'json'
  ): Promise<Blob> {
    try {
      const response = await apiClient.get('/song-requests/export', {
        params: { ...filters, format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al exportar solicitudes');
    }
  },

  // Obtener tendencias de solicitudes
  async getRequestTrends(period: 'week' | 'month' | 'year' = 'month'): Promise<any> {
    try {
      const response = await apiClient.get('/song-requests/trends', {
        params: { period }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener tendencias');
    }
  },

  // Obtener solicitudes por estado
  async getRequestsByStatus(
    status: string, 
    filters?: SongRequestFilters
  ): Promise<PaginatedResponse<SongRequestDetailed>> {
    try {
      const response = await apiClient.get<PaginatedResponse<SongRequestDetailed>>(
        `/song-requests/status/${status}`,
        { params: filters }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener solicitudes por estado');
    }
  },

  // Duplicar solicitud
  async duplicateRequest(requestId: string): Promise<SongRequest> {
    try {
      const response = await apiClient.post<SongRequest>(`/song-requests/${requestId}/duplicate`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al duplicar solicitud');
    }
  },

  // Obtener historial de cambios de una solicitud
  async getRequestHistory(requestId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/song-requests/${requestId}/history`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener historial de solicitud');
    }
  }
};
