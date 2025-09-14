import { apiClient, apiUtils } from '../api/client';
import {
  Song,
  SongDetailed,
  CreateSong,
  UpdateSong,
  SongFilters,
  SongRating,
  CreateSongRating,
  SongLike,
  PaginatedResponse,
  ApiResponse
} from '../types/song';

// =============================================
// SERVICIO DE CANCIONES
// =============================================

export const songService = {
  // Obtener todas las canciones con filtros
  async getSongs(filters?: SongFilters): Promise<PaginatedResponse<SongDetailed>> {
    try {
      const response = await apiClient.get<PaginatedResponse<SongDetailed>>(
        '/songs',
        { params: filters }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener canciones');
    }
  },

  // Obtener una canción específica
  async getSong(songId: string): Promise<SongDetailed> {
    try {
      const response = await apiClient.get<SongDetailed>(`/songs/${songId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener canción');
    }
  },

  // Alias para getSong (compatibilidad) - devuelve la respuesta completa del backend
  async getSongById(songId: number): Promise<any> {
    try {
      const response = await apiClient.get(`/songs/${songId}`);
      return response.data; // Esto incluye { success: true, data: {...} }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener canción');
    }
  },

  // Crear nueva canción
  async createSong(songData: CreateSong): Promise<Song> {
    try {
      const response = await apiClient.post('/songs', songData);
      // El backend devuelve { success: true, data: {...} }
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear canción');
    }
  },

  // Actualizar canción
  async updateSong(songId: string, updates: UpdateSong): Promise<Song> {
    try {
      const response = await apiClient.put(`/songs/${songId}`, updates);
      // El backend devuelve { success: true, data: {...} }
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar canción');
    }
  },

  // Eliminar canción
  async deleteSong(songId: string): Promise<void> {
    try {
      await apiClient.delete(`/songs/${songId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar canción');
    }
  },

  // Buscar canciones
  async searchSongs(query: string, filters?: SongFilters): Promise<PaginatedResponse<SongDetailed>> {
    try {
      const response = await apiClient.get<PaginatedResponse<SongDetailed>>('/songs/search', {
        params: { query, ...filters }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al buscar canciones');
    }
  },

  // Obtener canciones populares
  async getPopularSongs(limit: number = 10): Promise<SongDetailed[]> {
    try {
      const response = await apiClient.get<SongDetailed[]>('/songs/popular', {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener canciones populares');
    }
  },

  // Obtener canciones recientes
  async getRecentSongs(limit: number = 10): Promise<SongDetailed[]> {
    try {
      const response = await apiClient.get<SongDetailed[]>('/songs/recent', {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener canciones recientes');
    }
  },

  // Obtener canciones recomendadas
  async getRecommendedSongs(userId?: string, limit: number = 10): Promise<SongDetailed[]> {
    try {
      const response = await apiClient.get<SongDetailed[]>('/songs/recommended', {
        params: { userId, limit }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener canciones recomendadas');
    }
  },

  // Obtener canciones por género
  async getSongsByGenre(genreId: string, filters?: SongFilters): Promise<PaginatedResponse<SongDetailed>> {
    try {
      const response = await apiClient.get<PaginatedResponse<SongDetailed>>(`/songs/genre/${genreId}`, {
        params: filters
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener canciones por género');
    }
  },

  // Obtener canciones por autor
  async getSongsByAuthor(authorId: string, filters?: SongFilters): Promise<PaginatedResponse<SongDetailed>> {
    try {
      const response = await apiClient.get<PaginatedResponse<SongDetailed>>(`/songs/author/${authorId}`, {
        params: filters
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener canciones por autor');
    }
  },

  // Obtener canciones por artista
  async getSongsByArtist(artistName: string, filters?: SongFilters): Promise<SongDetailed[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<SongDetailed>>('/songs/search', {
        params: { query: artistName, artist: artistName, ...filters }
      });
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener canciones por artista');
    }
  },

  // Obtener artistas con más canciones
  async getTopArtists(limit: number = 5): Promise<{artistName: string, songCount: number}[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<SongDetailed>>('/songs', {
        params: { limit: 1000 } // Get many songs to calculate artist stats
      });
      
      const songs = response.data.data || [];
      
      // Group songs by artist and count
      const artistCounts = songs.reduce((acc, song) => {
        const artist = song.artistName;
        if (artist) {
          acc[artist] = (acc[artist] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      // Sort by song count and get top artists
      return Object.entries(artistCounts)
        .map(([artistName, songCount]) => ({ artistName, songCount }))
        .sort((a, b) => b.songCount - a.songCount)
        .slice(0, limit);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener artistas principales');
    }
  },

  // Obtener estadísticas generales del sitio
  async getSiteStats(): Promise<{
    totalSongs: number;
    totalArtists: number;
    totalUsers: number;
    totalViews: number;
  }> {
    try {
      const response = await apiClient.get<PaginatedResponse<SongDetailed>>('/songs', {
        params: { limit: 10000 } // Get all songs for accurate stats
      });
      
      const songs = response.data.data || [];
      
      // Calculate stats
      const totalSongs = songs.length;
      const uniqueArtists = new Set(songs.map(song => song.artistName)).size;
      const totalViews = songs.reduce((sum, song) => sum + (song.viewCount || 0), 0);
      
      // For users, we'll use a reasonable estimate based on songs
      // In a real app, this would come from a dedicated stats endpoint
      const totalUsers = Math.floor(totalSongs * 0.8) || 1200;
      
      return {
        totalSongs,
        totalArtists: uniqueArtists,
        totalUsers,
        totalViews
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas del sitio');
    }
  },

  // Obtener canciones destacadas con información completa
  async getFeaturedSongs(limit: number = 5): Promise<SongDetailed[]> {
    try {
      // Usar el mismo endpoint que en la homepage para consistencia
      const response = await apiClient.get<PaginatedResponse<SongDetailed>>('/songs');
      
      const songs = response.data.data || [];
      
      // Si no hay canciones, retornar array vacío
      if (songs.length === 0) {
        return [];
      }
      
      // Intentar ordenar por viewCount, pero si no existe, usar orden original
      let sortedSongs = songs;
      
      const songsWithViews = songs.filter(song => song.viewCount && song.viewCount > 0);
      
      if (songsWithViews.length > 0) {
        // Si hay canciones con views, ordenar por views
        sortedSongs = songsWithViews.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      } else {
        // Si no hay views, usar las primeras canciones
        sortedSongs = songs.slice(0, limit);
      }
      
      return sortedSongs.slice(0, limit);
    } catch (error: any) {
      console.error('Error fetching featured songs:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener canciones destacadas');
    }
  },

  // Obtener canciones de un usuario
  async getUserSongs(userId: string, filters?: SongFilters): Promise<PaginatedResponse<SongDetailed>> {
    try {
      const response = await apiClient.get<PaginatedResponse<SongDetailed>>(`/songs/user/${userId}`, {
        params: filters
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener canciones del usuario');
    }
  },

  // Subir archivo de audio
  async uploadAudioFile(songId: string, file: File): Promise<{ audioFileUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('audio', file);

      const response = await apiClient.post<{ audioFileUrl: string }>(
        `/songs/${songId}/upload-audio`,
        formData,
        apiUtils.getUploadConfig()
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al subir archivo de audio');
    }
  },

  // Subir archivo de video
  async uploadVideoFile(songId: string, file: File): Promise<{ videoFileUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await apiClient.post<{ videoFileUrl: string }>(
        `/songs/${songId}/upload-video`,
        formData,
        apiUtils.getUploadConfig()
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al subir archivo de video');
    }
  },

  // Subir partitura
  async uploadSheetMusic(songId: string, file: File): Promise<{ sheetMusicUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('sheetMusic', file);

      const response = await apiClient.post<{ sheetMusicUrl: string }>(
        `/songs/${songId}/upload-sheet-music`,
        formData,
        apiUtils.getUploadConfig()
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al subir partitura');
    }
  },

  // Incrementar contador de reproducciones
  async incrementViewCount(songId: string): Promise<void> {
    try {
      await apiClient.post(`/songs/${songId}/view`);
    } catch (error: any) {
      // No lanzar error para no interrumpir la reproducción
      console.error('Error al incrementar contador de reproducciones:', error);
    }
  },

  // Incrementar contador de descargas
  async incrementDownloadCount(songId: string): Promise<void> {
    try {
      await apiClient.post(`/songs/${songId}/download`);
    } catch (error: any) {
      console.error('Error al incrementar contador de descargas:', error);
    }
  },

  // Descargar canción
  async downloadSong(songId: string): Promise<void> {
    try {
      await this.incrementDownloadCount(songId);
      await apiUtils.downloadFile(`/songs/${songId}/download-file`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al descargar canción');
    }
  },

  // Dar me gusta a una canción
  async likeSong(songId: string): Promise<SongLike> {
    try {
      const response = await apiClient.post<{ success: boolean; data: SongLike }>(`/songs/${songId}/like`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al dar me gusta');
    }
  },

  // Quitar me gusta de una canción
  async unlikeSong(songId: string): Promise<void> {
    try {
      await apiClient.delete(`/songs/${songId}/like`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al quitar me gusta');
    }
  },

  // Calificar canción
  async rateSong(songId: string, ratingData: CreateSongRating): Promise<SongRating> {
    try {
      const response = await apiClient.post<{ success: boolean; data: SongRating }>(`/songs/${songId}/rate`, ratingData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al calificar canción');
    }
  },

  // Obtener calificación del usuario para una canción
  async getUserRating(songId: string): Promise<SongRating | null> {
    try {
      const response = await apiClient.get<{ success: boolean; data: SongRating }>(`/songs/${songId}/my-rating`);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(error.response?.data?.message || 'Error al obtener calificación');
    }
  },

  // Verificar si el usuario dio me gusta a una canción
  async checkIfLiked(songId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<{ success: boolean; data: { liked: boolean } }>(`/songs/${songId}/is-liked`);
      return response.data.data?.liked || false;
    } catch (error: any) {
      console.error('Error al verificar like:', error);
      return false;
    }
  },

  // Reportar canción
  async reportSong(songId: string, reason: string, description?: string): Promise<void> {
    try {
      await apiClient.post(`/songs/${songId}/report`, {
        reason,
        description
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al reportar canción');
    }
  },

  // Obtener estadísticas de una canción
  async getSongStats(songId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/songs/${songId}/stats`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  },

  // Obtener canciones similares
  async getSimilarSongs(songId: string, limit: number = 5): Promise<SongDetailed[]> {
    try {
      const response = await apiClient.get<SongDetailed[]>(`/songs/${songId}/similar`, {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener canciones similares');
    }
  },

  // Exportar canciones
  async exportSongs(
    filters?: SongFilters,
    format: 'json' | 'csv' | 'excel' = 'json'
  ): Promise<Blob> {
    try {
      const response = await apiClient.get('/songs/export', {
        params: { ...filters, format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al exportar canciones');
    }
  },

  // Solicitar canción
  async requestSong(requestData: any): Promise<any> {
    try {
      const response = await apiClient.post('/song-requests', requestData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al solicitar canción');
    }
  },

  // Obtener historial de versiones de una canción
  async getSongHistory(songId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/songs/${songId}/history`);
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener historial de canción');
    }
  },

  // Obtener una versión específica de una canción
  async getSongVersion(versionId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/songs/versions/${versionId}`);
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener versión de canción');
    }
  }
};