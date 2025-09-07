import { apiClient } from '../api/client';
import { MusicalGenre, PaginatedResponse } from '../types/song';
import { CreateGenre, UpdateGenre, GenreFilters } from '../types/admin';

// =============================================
// SERVICIO DE GÉNEROS MUSICALES
// =============================================

export const genreService = {
  // Obtener todos los géneros con filtros
  async getGenres(filters?: GenreFilters): Promise<PaginatedResponse<MusicalGenre>> {
    try {
      const response = await apiClient.get<PaginatedResponse<MusicalGenre>>(
        '/genres',
        { params: filters }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener géneros');
    }
  },

  // Obtener todos los géneros sin paginación (para selects)
  async getAllGenres(): Promise<MusicalGenre[]> {
    try {
      const response = await apiClient.get<MusicalGenre[]>('/genres/all');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener todos los géneros');
    }
  },

  // Obtener un género específico
  async getGenre(genreId: string): Promise<MusicalGenre> {
    try {
      const response = await apiClient.get<MusicalGenre>(`/genres/${genreId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener género');
    }
  },

  // Crear nuevo género
  async createGenre(genreData: CreateGenre): Promise<MusicalGenre> {
    try {
      const response = await apiClient.post<MusicalGenre>('/genres', genreData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear género');
    }
  },

  // Actualizar género
  async updateGenre(genreId: string, updates: UpdateGenre): Promise<MusicalGenre> {
    try {
      const response = await apiClient.put<MusicalGenre>(`/genres/${genreId}`, updates);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar género');
    }
  },

  // Eliminar género
  async deleteGenre(genreId: string): Promise<void> {
    try {
      await apiClient.delete(`/genres/${genreId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar género');
    }
  },

  // Buscar géneros
  async searchGenres(query: string, limit: number = 20): Promise<MusicalGenre[]> {
    try {
      const response = await apiClient.get<MusicalGenre[]>('/genres/search', {
        params: { query, limit }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al buscar géneros');
    }
  },

  // Obtener géneros principales (sin padre)
  async getMainGenres(): Promise<MusicalGenre[]> {
    try {
      const response = await apiClient.get<MusicalGenre[]>('/genres/main');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener géneros principales');
    }
  },

  // Obtener subgéneros de un género
  async getSubGenres(parentGenreId: string): Promise<MusicalGenre[]> {
    try {
      const response = await apiClient.get<MusicalGenre[]>(`/genres/${parentGenreId}/subgenres`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener subgéneros');
    }
  },

  // Obtener géneros populares
  async getPopularGenres(limit: number = 10): Promise<MusicalGenre[]> {
    try {
      const response = await apiClient.get<MusicalGenre[]>('/genres/popular', {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener géneros populares');
    }
  },

  // Obtener estadísticas de un género
  async getGenreStats(genreId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/genres/${genreId}/stats`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas del género');
    }
  },

  // Activar/desactivar género
  async toggleGenreStatus(genreId: string, isActive: boolean): Promise<MusicalGenre> {
    try {
      const response = await apiClient.patch<MusicalGenre>(`/genres/${genreId}/status`, {
        isActive
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al cambiar estado del género');
    }
  },

  // Obtener canciones de un género
  async getGenreSongs(genreId: string, filters?: any): Promise<any> {
    try {
      const response = await apiClient.get(`/genres/${genreId}/songs`, {
        params: filters
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener canciones del género');
    }
  },

  // Obtener árbol jerárquico de géneros
  async getGenreTree(): Promise<MusicalGenre[]> {
    try {
      const response = await apiClient.get<MusicalGenre[]>('/genres/tree');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener árbol de géneros');
    }
  },

  // Exportar géneros
  async exportGenres(
    filters?: GenreFilters, 
    format: 'json' | 'csv' | 'excel' = 'json'
  ): Promise<Blob> {
    try {
      const response = await apiClient.get('/genres/export', {
        params: { ...filters, format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al exportar géneros');
    }
  },

  // Verificar si el nombre del género ya existe
  async checkGenreNameExists(name: string, excludeId?: string): Promise<boolean> {
    try {
      const response = await apiClient.get<{ exists: boolean }>('/genres/check-name', {
        params: { name, excludeId }
      });
      return response.data.exists;
    } catch (error: any) {
      return false;
    }
  },

  // Obtener géneros sugeridos basados en texto
  async getSuggestedGenres(text: string, limit: number = 5): Promise<MusicalGenre[]> {
    try {
      const response = await apiClient.get<MusicalGenre[]>('/genres/suggestions', {
        params: { text, limit }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener sugerencias de géneros');
    }
  },

  // Fusionar géneros duplicados
  async mergeGenres(primaryGenreId: string, duplicateGenreIds: string[]): Promise<MusicalGenre> {
    try {
      const response = await apiClient.post<MusicalGenre>(`/genres/${primaryGenreId}/merge`, {
        duplicateGenreIds
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al fusionar géneros');
    }
  },

  // Mover género a otro padre
  async moveGenre(genreId: string, newParentId?: string): Promise<MusicalGenre> {
    try {
      const response = await apiClient.patch<MusicalGenre>(`/genres/${genreId}/move`, {
        newParentId
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al mover género');
    }
  },

  // Obtener géneros relacionados
  async getRelatedGenres(genreId: string, limit: number = 5): Promise<MusicalGenre[]> {
    try {
      const response = await apiClient.get<MusicalGenre[]>(`/genres/${genreId}/related`, {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener géneros relacionados');
    }
  },

  // Reportar género
  async reportGenre(genreId: string, reason: string, description?: string): Promise<void> {
    try {
      await apiClient.post(`/genres/${genreId}/report`, {
        reason,
        description
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al reportar género');
    }
  },

  // Obtener tendencias de géneros
  async getGenreTrends(period: 'week' | 'month' | 'year' = 'month'): Promise<any> {
    try {
      const response = await apiClient.get('/genres/trends', {
        params: { period }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener tendencias de géneros');
    }
  },

  // Obtener historial de cambios de un género
  async getGenreHistory(genreId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/genres/${genreId}/history`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener historial del género');
    }
  }
};
