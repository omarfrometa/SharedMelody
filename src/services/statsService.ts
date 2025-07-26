import { apiClient } from '../api/client';

export interface TopSong {
  songId: number;
  title: string;
  artistName: string;
  genreName: string;
  playsCount: number;
  uniqueViews: number;
  uniqueVisitors: number;
  uploadDate: string;
}

export interface TopArtist {
  authorId: number;
  authorName: string;
  totalSongs: number;
  totalPlays: number;
  totalUniqueViews: number;
  totalUniqueVisitors: number;
  avgPlaysPerSong: number;
}

export interface SongViewStats {
  totalViews: number;
  uniqueVisitors: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  topCountries: string[];
  hourlyDistribution: Record<string, number>;
}

export interface GeneralStats {
  totalViews: number;
  uniqueVisitors: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  topSongs: TopSong[];
  topArtists: TopArtist[];
}

export const statsService = {
  // Obtener canciones más vistas
  async getTopSongs(limit: number = 10): Promise<TopSong[]> {
    try {
      const response = await apiClient.get(`/stats/top-songs`, {
        params: { limit }
      });
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener canciones más vistas');
    }
  },

  // Obtener artistas más vistos
  async getTopArtists(limit: number = 5): Promise<TopArtist[]> {
    try {
      const response = await apiClient.get(`/stats/top-artists`, {
        params: { limit }
      });
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener artistas más vistos');
    }
  },

  // Obtener estadísticas de una canción específica
  async getSongStats(songId: number): Promise<SongViewStats> {
    try {
      const response = await apiClient.get(`/stats/songs/${songId}`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data || {
        totalViews: 0,
        uniqueVisitors: 0,
        viewsToday: 0,
        viewsThisWeek: 0,
        viewsThisMonth: 0,
        topCountries: [],
        hourlyDistribution: {}
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas de canción');
    }
  },

  // Obtener estadísticas generales
  async getGeneralStats(): Promise<GeneralStats> {
    try {
      const response = await apiClient.get(`/stats/general`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data || {
        totalViews: 0,
        uniqueVisitors: 0,
        viewsToday: 0,
        viewsThisWeek: 0,
        viewsThisMonth: 0,
        topSongs: [],
        topArtists: []
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas generales');
    }
  },

  // Registrar visualización manualmente (para testing)
  async recordView(songId: number, userId?: number): Promise<{ recorded: boolean }> {
    try {
      const response = await apiClient.post(`/stats/songs/${songId}/view`, {
        userId
      });
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return { recorded: false };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al registrar visualización');
    }
  },

  // Obtener visualizaciones recientes (solo para admins)
  async getRecentViews(limit: number = 50): Promise<any[]> {
    try {
      const response = await apiClient.get(`/stats/recent-views`, {
        params: { limit }
      });
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener visualizaciones recientes');
    }
  },

  // Limpiar visualizaciones antiguas (solo para admins)
  async cleanupOldViews(): Promise<{ deletedCount: number }> {
    try {
      const response = await apiClient.delete(`/stats/cleanup`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return { deletedCount: 0 };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al limpiar visualizaciones antiguas');
    }
  }
};
