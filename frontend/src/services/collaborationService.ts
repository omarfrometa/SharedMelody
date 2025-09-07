import { apiClient } from '../api/client';
import { 
  Collaboration, 
  CreateCollaboration, 
  SongFilters,
  PaginatedResponse,
  ApiResponse 
} from '../types/song';

// =============================================
// SERVICIO DE COLABORACIONES
// =============================================

export const collaborationService = {
  // Obtener colaboraciones de un usuario
  async getUserCollaborations(
    userId: string, 
    filters?: SongFilters
  ): Promise<PaginatedResponse<Collaboration>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Collaboration>>(
        `/collaborations/user/${userId}`,
        { params: filters }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener colaboraciones');
    }
  },

  // Obtener colaboraciones de una canción
  async getSongCollaborations(songId: string): Promise<Collaboration[]> {
    try {
      const response = await apiClient.get<Collaboration[]>(`/collaborations/song/${songId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener colaboraciones de la canción');
    }
  },

  // Crear nueva colaboración
  async createCollaboration(collaborationData: CreateCollaboration): Promise<Collaboration> {
    try {
      const response = await apiClient.post<Collaboration>('/collaborations', collaborationData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear colaboración');
    }
  },

  // Actualizar colaboración
  async updateCollaboration(
    collaborationId: string, 
    updates: Partial<CreateCollaboration>
  ): Promise<Collaboration> {
    try {
      const response = await apiClient.put<Collaboration>(
        `/collaborations/${collaborationId}`, 
        updates
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar colaboración');
    }
  },

  // Eliminar colaboración
  async removeCollaboration(collaborationId: string): Promise<void> {
    try {
      await apiClient.delete(`/collaborations/${collaborationId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar colaboración');
    }
  },

  // Invitar a colaborar
  async inviteCollaborator(songId: string, userId: string, message?: string): Promise<void> {
    try {
      await apiClient.post('/collaborations/invite', {
        songId,
        userId,
        message
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al enviar invitación');
    }
  },

  // Aceptar invitación de colaboración
  async acceptCollaborationInvite(
    inviteId: string, 
    collaborationType: string
  ): Promise<Collaboration> {
    try {
      const response = await apiClient.post<Collaboration>(`/collaborations/invite/${inviteId}/accept`, {
        collaborationType
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al aceptar invitación');
    }
  },

  // Rechazar invitación de colaboración
  async rejectCollaborationInvite(inviteId: string): Promise<void> {
    try {
      await apiClient.post(`/collaborations/invite/${inviteId}/reject`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al rechazar invitación');
    }
  },

  // Obtener invitaciones pendientes
  async getPendingInvites(): Promise<any[]> {
    try {
      const response = await apiClient.get('/collaborations/invites/pending');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener invitaciones pendientes');
    }
  },

  // Obtener estadísticas de colaboraciones
  async getCollaborationStats(userId?: string): Promise<any> {
    try {
      const url = userId ? `/collaborations/stats/${userId}` : '/collaborations/stats';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  },

  // Buscar colaboradores potenciales
  async searchPotentialCollaborators(query: string, songId?: string): Promise<any[]> {
    try {
      const response = await apiClient.get('/collaborations/search-collaborators', {
        params: { query, songId }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al buscar colaboradores');
    }
  },

  // Obtener historial de colaboraciones
  async getCollaborationHistory(
    userId: string, 
    filters?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<any>> {
    try {
      const response = await apiClient.get<PaginatedResponse<any>>(
        `/collaborations/history/${userId}`,
        { params: filters }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener historial');
    }
  },

  // Cambiar estado de colaboración
  async changeCollaborationStatus(
    collaborationId: string, 
    status: 'active' | 'inactive' | 'removed'
  ): Promise<Collaboration> {
    try {
      const response = await apiClient.patch<Collaboration>(
        `/collaborations/${collaborationId}/status`,
        { status }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al cambiar estado de colaboración');
    }
  },

  // Obtener colaboraciones por tipo
  async getCollaborationsByType(
    type: string, 
    filters?: SongFilters
  ): Promise<PaginatedResponse<Collaboration>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Collaboration>>(
        `/collaborations/type/${type}`,
        { params: filters }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener colaboraciones por tipo');
    }
  },

  // Verificar si el usuario puede colaborar en una canción
  async canCollaborate(songId: string, userId?: string): Promise<boolean> {
    try {
      const response = await apiClient.get<{ canCollaborate: boolean }>(
        `/collaborations/can-collaborate/${songId}`,
        { params: { userId } }
      );
      return response.data.canCollaborate;
    } catch (error: any) {
      return false;
    }
  },

  // Obtener tipos de colaboración disponibles
  async getCollaborationTypes(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>('/collaborations/types');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener tipos de colaboración');
    }
  },

  // Reportar colaboración
  async reportCollaboration(
    collaborationId: string, 
    reason: string, 
    description?: string
  ): Promise<void> {
    try {
      await apiClient.post(`/collaborations/${collaborationId}/report`, {
        reason,
        description
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al reportar colaboración');
    }
  },

  // Obtener colaboraciones destacadas
  async getFeaturedCollaborations(limit: number = 10): Promise<Collaboration[]> {
    try {
      const response = await apiClient.get<Collaboration[]>('/collaborations/featured', {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener colaboraciones destacadas');
    }
  },

  // Exportar colaboraciones del usuario
  async exportUserCollaborations(
    userId: string, 
    format: 'json' | 'csv' | 'excel' = 'json'
  ): Promise<Blob> {
    try {
      const response = await apiClient.get(`/collaborations/export/${userId}`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al exportar colaboraciones');
    }
  }
};
