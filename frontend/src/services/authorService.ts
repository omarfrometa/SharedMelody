import { apiClient } from '../api/client';
import { Author, PaginatedResponse } from '../types/song';
import { CreateAuthor, UpdateAuthor, AuthorFilters } from '../types/admin';

// =============================================
// SERVICIO DE AUTORES
// =============================================

export const authorService = {
  // Obtener todos los autores con filtros
  async getAuthors(filters?: AuthorFilters): Promise<PaginatedResponse<Author>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Author>>(
        '/authors',
        { params: filters }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener autores');
    }
  },

  // Obtener un autor específico
  async getAuthor(authorId: string): Promise<Author> {
    try {
      const response = await apiClient.get<Author>(`/authors/${authorId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener autor');
    }
  },

  // Crear nuevo autor
  async createAuthor(authorData: CreateAuthor): Promise<Author> {
    try {
      const response = await apiClient.post<Author>('/authors', authorData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear autor');
    }
  },

  // Actualizar autor
  async updateAuthor(authorId: string, updates: UpdateAuthor): Promise<Author> {
    try {
      const response = await apiClient.put<Author>(`/authors/${authorId}`, updates);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar autor');
    }
  },

  // Eliminar autor
  async deleteAuthor(authorId: string): Promise<void> {
    try {
      await apiClient.delete(`/authors/${authorId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar autor');
    }
  },

  // Buscar autores
  async searchAuthors(query: string, limit: number = 20): Promise<Author[]> {
    try {
      const response = await apiClient.get<Author[]>('/authors/search', {
        params: { query, limit }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al buscar autores');
    }
  },

  // Buscar autores para autocompletado (solo nombre e ID)
  async searchAuthorsAutocomplete(query: string, limit: number = 10): Promise<{authorId: string, authorName: string}[]> {
    try {
      const response = await apiClient.get<{success: boolean, data: {authorId: string, authorName: string}[]}>('/authors/search', {
        params: { query, limit }
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al buscar autores');
    }
  },

  // Obtener autores populares
  async getPopularAuthors(limit: number = 10): Promise<Author[]> {
    try {
      const response = await apiClient.get<Author[]>('/authors/popular', {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener autores populares');
    }
  },

  // Obtener autores por país
  async getAuthorsByCountry(countryId: string, filters?: AuthorFilters): Promise<PaginatedResponse<Author>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Author>>(`/authors/country/${countryId}`, {
        params: filters
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener autores por país');
    }
  },

  // Obtener estadísticas de un autor
  async getAuthorStats(authorId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/authors/${authorId}/stats`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas del autor');
    }
  },

  // Subir imagen del autor
  async uploadAuthorImage(authorId: string, file: File): Promise<{ imageUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await apiClient.post<{ imageUrl: string }>(
        `/authors/${authorId}/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al subir imagen del autor');
    }
  },

  // Activar/desactivar autor
  async toggleAuthorStatus(authorId: string, isActive: boolean): Promise<Author> {
    try {
      const response = await apiClient.patch<Author>(`/authors/${authorId}/status`, {
        isActive
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al cambiar estado del autor');
    }
  },

  // Obtener canciones de un autor
  async getAuthorSongs(authorId: string, filters?: any): Promise<any> {
    try {
      const response = await apiClient.get(`/authors/${authorId}/songs`, {
        params: filters
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener canciones del autor');
    }
  },

  // Exportar autores
  async exportAuthors(
    filters?: AuthorFilters, 
    format: 'json' | 'csv' | 'excel' = 'json'
  ): Promise<Blob> {
    try {
      const response = await apiClient.get('/authors/export', {
        params: { ...filters, format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al exportar autores');
    }
  },

  // Verificar si el nombre del autor ya existe
  async checkAuthorNameExists(name: string, excludeId?: string): Promise<boolean> {
    try {
      const response = await apiClient.get<{ exists: boolean }>('/authors/check-name', {
        params: { name, excludeId }
      });
      return response.data.exists;
    } catch (error: any) {
      return false;
    }
  },

  // Obtener autores sugeridos basados en texto
  async getSuggestedAuthors(text: string, limit: number = 5): Promise<Author[]> {
    try {
      const response = await apiClient.get<Author[]>('/authors/suggestions', {
        params: { text, limit }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener sugerencias de autores');
    }
  },

  // Fusionar autores duplicados
  async mergeAuthors(primaryAuthorId: string, duplicateAuthorIds: string[]): Promise<Author> {
    try {
      const response = await apiClient.post<Author>(`/authors/${primaryAuthorId}/merge`, {
        duplicateAuthorIds
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al fusionar autores');
    }
  },

  // Obtener autores duplicados potenciales
  async findPotentialDuplicates(authorId: string): Promise<Author[]> {
    try {
      const response = await apiClient.get<Author[]>(`/authors/${authorId}/potential-duplicates`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al buscar duplicados potenciales');
    }
  },

  // Reportar autor
  async reportAuthor(authorId: string, reason: string, description?: string): Promise<void> {
    try {
      await apiClient.post(`/authors/${authorId}/report`, {
        reason,
        description
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al reportar autor');
    }
  },

  // Obtener historial de cambios de un autor
  async getAuthorHistory(authorId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/authors/${authorId}/history`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener historial del autor');
    }
  }
};
