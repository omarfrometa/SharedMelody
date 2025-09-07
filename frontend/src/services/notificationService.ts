import { apiClient } from '../api/client';
import { EmailNotification } from '../types/song';

// =============================================
// SERVICIO DE NOTIFICACIONES
// =============================================

export const notificationService = {
  // Obtener notificaciones por email del usuario
  async getEmailNotifications(filters?: {
    status?: 'pending' | 'sent' | 'failed' | 'cancelled';
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: EmailNotification[]; pagination: any }> {
    try {
      const response = await apiClient.get('/notifications/email', {
        params: filters
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener notificaciones por email');
    }
  },

  // Obtener una notificación específica
  async getEmailNotification(notificationId: string): Promise<EmailNotification> {
    try {
      const response = await apiClient.get<EmailNotification>(`/notifications/email/${notificationId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener notificación');
    }
  },

  // Crear notificación por email
  async createEmailNotification(data: {
    userId: string;
    emailAddress: string;
    subject: string;
    bodyHtml?: string;
    bodyText?: string;
    relatedSongId?: string;
    relatedRequestId?: string;
    scheduledFor?: string;
  }): Promise<EmailNotification> {
    try {
      const response = await apiClient.post<EmailNotification>('/notifications/email', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear notificación por email');
    }
  },

  // Enviar notificación inmediatamente
  async sendEmailNotification(notificationId: string): Promise<void> {
    try {
      await apiClient.post(`/notifications/email/${notificationId}/send`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al enviar notificación');
    }
  },

  // Cancelar notificación pendiente
  async cancelEmailNotification(notificationId: string): Promise<void> {
    try {
      await apiClient.patch(`/notifications/email/${notificationId}/cancel`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al cancelar notificación');
    }
  },

  // Reenviar notificación fallida
  async retryEmailNotification(notificationId: string): Promise<void> {
    try {
      await apiClient.post(`/notifications/email/${notificationId}/retry`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al reintentar notificación');
    }
  },

  // Obtener estadísticas de notificaciones
  async getEmailNotificationStats(): Promise<{
    total: number;
    pending: number;
    sent: number;
    failed: number;
    cancelled: number;
    successRate: number;
  }> {
    try {
      const response = await apiClient.get('/notifications/email/stats');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas de notificaciones');
    }
  },

  // Notificaciones específicas del sistema
  async sendWelcomeEmail(userId: string): Promise<void> {
    try {
      await apiClient.post('/notifications/welcome', { userId });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al enviar email de bienvenida');
    }
  },

  async sendRequestFulfilledNotification(requestId: string, songId: string): Promise<void> {
    try {
      await apiClient.post('/notifications/request-fulfilled', {
        requestId,
        songId
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al enviar notificación de solicitud cumplida');
    }
  },

  async sendCollaborationInviteNotification(
    songId: string, 
    invitedUserId: string, 
    inviterUserId: string,
    message?: string
  ): Promise<void> {
    try {
      await apiClient.post('/notifications/collaboration-invite', {
        songId,
        invitedUserId,
        inviterUserId,
        message
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al enviar invitación de colaboración');
    }
  },

  async sendSongApprovedNotification(songId: string): Promise<void> {
    try {
      await apiClient.post('/notifications/song-approved', { songId });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al enviar notificación de canción aprobada');
    }
  },

  async sendSongRejectedNotification(songId: string, reason: string): Promise<void> {
    try {
      await apiClient.post('/notifications/song-rejected', {
        songId,
        reason
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al enviar notificación de canción rechazada');
    }
  },

  async sendPasswordResetNotification(email: string, resetToken: string): Promise<void> {
    try {
      await apiClient.post('/notifications/password-reset', {
        email,
        resetToken
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al enviar notificación de restablecimiento de contraseña');
    }
  },

  async sendEmailVerificationNotification(userId: string, verificationToken: string): Promise<void> {
    try {
      await apiClient.post('/notifications/email-verification', {
        userId,
        verificationToken
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al enviar notificación de verificación de email');
    }
  },

  // Configuración de preferencias de notificación
  async getNotificationPreferences(): Promise<{
    emailNotifications: boolean;
    requestFulfilled: boolean;
    collaborationInvites: boolean;
    songApproved: boolean;
    songRejected: boolean;
    systemUpdates: boolean;
    weeklyDigest: boolean;
    marketingEmails: boolean;
  }> {
    try {
      const response = await apiClient.get('/notifications/preferences');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener preferencias de notificación');
    }
  },

  async updateNotificationPreferences(preferences: {
    emailNotifications?: boolean;
    requestFulfilled?: boolean;
    collaborationInvites?: boolean;
    songApproved?: boolean;
    songRejected?: boolean;
    systemUpdates?: boolean;
    weeklyDigest?: boolean;
    marketingEmails?: boolean;
  }): Promise<void> {
    try {
      await apiClient.put('/notifications/preferences', preferences);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar preferencias de notificación');
    }
  },

  // Plantillas de email
  async getEmailTemplates(): Promise<Array<{
    templateId: string;
    templateName: string;
    subject: string;
    bodyHtml: string;
    bodyText: string;
    variables: string[];
    isActive: boolean;
  }>> {
    try {
      const response = await apiClient.get('/notifications/templates');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener plantillas de email');
    }
  },

  async getEmailTemplate(templateId: string): Promise<{
    templateId: string;
    templateName: string;
    subject: string;
    bodyHtml: string;
    bodyText: string;
    variables: string[];
    isActive: boolean;
  }> {
    try {
      const response = await apiClient.get(`/notifications/templates/${templateId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener plantilla de email');
    }
  },

  async previewEmailTemplate(templateId: string, variables: Record<string, string>): Promise<{
    subject: string;
    bodyHtml: string;
    bodyText: string;
  }> {
    try {
      const response = await apiClient.post(`/notifications/templates/${templateId}/preview`, {
        variables
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al previsualizar plantilla');
    }
  },

  // Notificaciones masivas (solo para administradores)
  async sendBulkNotification(data: {
    userIds?: string[];
    userFilters?: any;
    templateId: string;
    variables?: Record<string, string>;
    scheduledFor?: string;
  }): Promise<{ notificationIds: string[]; estimatedRecipients: number }> {
    try {
      const response = await apiClient.post('/notifications/bulk', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al enviar notificaciones masivas');
    }
  },

  // Suscripciones y listas de correo
  async subscribeToNewsletter(email: string, preferences?: {
    weeklyDigest?: boolean;
    newFeatures?: boolean;
    communityUpdates?: boolean;
  }): Promise<void> {
    try {
      await apiClient.post('/notifications/newsletter/subscribe', {
        email,
        preferences
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al suscribirse al newsletter');
    }
  },

  async unsubscribeFromNewsletter(email: string, token?: string): Promise<void> {
    try {
      await apiClient.post('/notifications/newsletter/unsubscribe', {
        email,
        token
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al desuscribirse del newsletter');
    }
  },

  // Limpieza y mantenimiento
  async cleanupOldNotifications(olderThanDays: number = 90): Promise<{ deletedCount: number }> {
    try {
      const response = await apiClient.delete('/notifications/cleanup', {
        params: { olderThanDays }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al limpiar notificaciones antiguas');
    }
  },

  async retryFailedNotifications(maxRetries: number = 3): Promise<{ retriedCount: number }> {
    try {
      const response = await apiClient.post('/notifications/retry-failed', {
        maxRetries
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al reintentar notificaciones fallidas');
    }
  }
};
