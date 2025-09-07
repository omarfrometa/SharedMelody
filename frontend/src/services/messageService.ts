import { apiClient } from '../api/client';
import { 
  UserMessage, 
  UserMessageDetailed 
} from '../types/user';
import { PaginatedResponse } from '../types/song';

// =============================================
// SERVICIO DE MENSAJES
// =============================================

export const messageService = {
  // Obtener mensajes del usuario actual
  async getUserMessages(filters?: {
    messageType?: string;
    isRead?: string;
    isArchived?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<UserMessageDetailed>> {
    try {
      const response = await apiClient.get<PaginatedResponse<UserMessageDetailed>>(
        '/messages',
        { params: filters }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener mensajes');
    }
  },

  // Obtener un mensaje específico
  async getMessage(messageId: string): Promise<UserMessageDetailed> {
    try {
      const response = await apiClient.get<UserMessageDetailed>(`/messages/${messageId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener mensaje');
    }
  },

  // Marcar mensaje como leído
  async markAsRead(messageId: string): Promise<void> {
    try {
      await apiClient.patch(`/messages/${messageId}/read`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al marcar como leído');
    }
  },

  // Marcar todos los mensajes como leídos
  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.patch('/messages/read-all');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al marcar todos como leídos');
    }
  },

  // Archivar mensaje
  async archiveMessage(messageId: string): Promise<void> {
    try {
      await apiClient.patch(`/messages/${messageId}/archive`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al archivar mensaje');
    }
  },

  // Desarchivar mensaje
  async unarchiveMessage(messageId: string): Promise<void> {
    try {
      await apiClient.patch(`/messages/${messageId}/unarchive`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al desarchivar mensaje');
    }
  },

  // Eliminar mensaje
  async deleteMessage(messageId: string): Promise<void> {
    try {
      await apiClient.delete(`/messages/${messageId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar mensaje');
    }
  },

  // Obtener contador de mensajes no leídos
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get<{ count: number }>('/messages/unread-count');
      return response.data.count;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener contador de no leídos');
    }
  },

  // Obtener mensajes no leídos
  async getUnreadMessages(limit?: number): Promise<UserMessageDetailed[]> {
    try {
      const response = await apiClient.get<UserMessageDetailed[]>('/messages/unread', {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener mensajes no leídos');
    }
  },

  // Obtener mensajes archivados
  async getArchivedMessages(filters?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<UserMessageDetailed>> {
    try {
      const response = await apiClient.get<PaginatedResponse<UserMessageDetailed>>(
        '/messages/archived',
        { params: filters }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener mensajes archivados');
    }
  },

  // Obtener mensajes por tipo
  async getMessagesByType(
    messageType: string,
    filters?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<PaginatedResponse<UserMessageDetailed>> {
    try {
      const response = await apiClient.get<PaginatedResponse<UserMessageDetailed>>(
        `/messages/type/${messageType}`,
        { params: filters }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener mensajes por tipo');
    }
  },

  // Crear mensaje (para administradores)
  async createMessage(messageData: {
    userId: string;
    messageType: string;
    title: string;
    content: string;
    relatedSongId?: string;
    relatedRequestId?: string;
    relatedCollaborationId?: string;
    expiresAt?: string;
  }): Promise<UserMessage> {
    try {
      const response = await apiClient.post<UserMessage>('/messages', messageData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear mensaje');
    }
  },

  // Enviar mensaje a múltiples usuarios (para administradores)
  async sendBulkMessage(messageData: {
    userIds: string[];
    messageType: string;
    title: string;
    content: string;
    expiresAt?: string;
  }): Promise<void> {
    try {
      await apiClient.post('/messages/bulk', messageData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al enviar mensajes masivos');
    }
  },

  // Obtener estadísticas de mensajes
  async getMessageStats(): Promise<{
    total: number;
    unread: number;
    archived: number;
    byType: Record<string, number>;
  }> {
    try {
      const response = await apiClient.get('/messages/stats');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas de mensajes');
    }
  },

  // Limpiar mensajes expirados
  async cleanupExpiredMessages(): Promise<{ deletedCount: number }> {
    try {
      const response = await apiClient.delete('/messages/cleanup-expired');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al limpiar mensajes expirados');
    }
  },

  // Exportar mensajes
  async exportMessages(
    filters?: {
      messageType?: string;
      isRead?: boolean;
      isArchived?: boolean;
      dateFrom?: string;
      dateTo?: string;
    },
    format: 'json' | 'csv' | 'excel' = 'json'
  ): Promise<Blob> {
    try {
      const response = await apiClient.get('/messages/export', {
        params: { ...filters, format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al exportar mensajes');
    }
  },

  // Configurar preferencias de notificaciones
  async updateNotificationPreferences(preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    messageTypes: string[];
  }): Promise<void> {
    try {
      await apiClient.put('/messages/notification-preferences', preferences);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar preferencias');
    }
  },

  // Obtener preferencias de notificaciones
  async getNotificationPreferences(): Promise<{
    emailNotifications: boolean;
    pushNotifications: boolean;
    messageTypes: string[];
  }> {
    try {
      const response = await apiClient.get('/messages/notification-preferences');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener preferencias');
    }
  },

  // Buscar mensajes
  async searchMessages(
    query: string,
    filters?: {
      messageType?: string;
      isRead?: boolean;
      isArchived?: boolean;
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<UserMessageDetailed>> {
    try {
      const response = await apiClient.get<PaginatedResponse<UserMessageDetailed>>(
        '/messages/search',
        { params: { query, ...filters } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al buscar mensajes');
    }
  },

  // Obtener mensajes relacionados con una canción
  async getMessagesForSong(songId: string): Promise<UserMessageDetailed[]> {
    try {
      const response = await apiClient.get<UserMessageDetailed[]>(`/messages/song/${songId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener mensajes de la canción');
    }
  },

  // Obtener mensajes relacionados con una solicitud
  async getMessagesForRequest(requestId: string): Promise<UserMessageDetailed[]> {
    try {
      const response = await apiClient.get<UserMessageDetailed[]>(`/messages/request/${requestId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener mensajes de la solicitud');
    }
  },

  // Marcar mensajes como leídos por lotes
  async markMultipleAsRead(messageIds: string[]): Promise<void> {
    try {
      await apiClient.patch('/messages/batch-read', { messageIds });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al marcar mensajes como leídos');
    }
  },

  // Archivar mensajes por lotes
  async archiveMultiple(messageIds: string[]): Promise<void> {
    try {
      await apiClient.patch('/messages/batch-archive', { messageIds });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al archivar mensajes');
    }
  },

  // Eliminar mensajes por lotes
  async deleteMultiple(messageIds: string[]): Promise<void> {
    try {
      await apiClient.delete('/messages/batch-delete', { data: { messageIds } });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar mensajes');
    }
  }
};
