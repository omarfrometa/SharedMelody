import { pool } from '../config/database';
import { createError } from '../middleware/errorHandler';

export interface ViewRecord {
  viewId: string;
  songId: number;
  userId?: number;
  ipAddress: string;
  userAgent?: string;
  sessionId?: string;
  referrer?: string;
  viewedAt: Date;
  createdDate: Date;
}

export interface TopSong {
  songId: number;
  title: string;
  artistName: string;
  genreName: string;
  playsCount: number;
  uniqueViews: number;
  uniqueVisitors: number;
  uploadDate: Date;
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

export const viewTrackingService = {
  // Registrar una visualización
  async recordView(
    songId: number,
    ipAddress: string,
    userId?: number,
    userAgent?: string,
    sessionId?: string,
    referrer?: string
  ): Promise<boolean> {
    try {
      const query = `SELECT record_song_view($1, $2, $3, $4, $5, $6)`;
      const result = await pool.query(query, [
        songId,
        ipAddress,
        userId || null,
        userAgent || null,
        sessionId || null,
        referrer || null
      ]);

      const wasRecorded = result.rows[0]?.record_song_view || false;
      
      if (wasRecorded) {
        console.log(`📊 Nueva visualización registrada: Canción ${songId} desde IP ${ipAddress}`);
      } else {
        console.log(`📊 Visualización duplicada ignorada: Canción ${songId} desde IP ${ipAddress} (mismo día)`);
      }

      return wasRecorded;
    } catch (error) {
      console.error('Error al registrar visualización:', error);
      throw createError('Error al registrar visualización', 500);
    }
  },

  // Obtener canciones más vistas
  async getTopSongs(limit: number = 10): Promise<TopSong[]> {
    try {
      const query = `SELECT * FROM get_top_songs($1)`;
      const result = await pool.query(query, [limit]);

      return result.rows.map(row => ({
        songId: row.song_id,
        title: row.title,
        artistName: row.artist_name || 'Artista desconocido',
        genreName: row.genre_name || 'Sin género',
        playsCount: parseInt(row.plays_count) || 0,
        uniqueViews: parseInt(row.unique_views) || 0,
        uniqueVisitors: parseInt(row.unique_visitors) || 0,
        uploadDate: row.upload_date
      }));
    } catch (error) {
      console.error('Error al obtener canciones más vistas:', error);
      throw createError('Error al obtener canciones más vistas', 500);
    }
  },

  // Obtener artistas más vistos
  async getTopArtists(limit: number = 5): Promise<TopArtist[]> {
    try {
      const query = `SELECT * FROM get_top_artists($1)`;
      const result = await pool.query(query, [limit]);

      return result.rows.map(row => ({
        authorId: row.author_id,
        authorName: row.author_name,
        totalSongs: parseInt(row.total_songs) || 0,
        totalPlays: parseInt(row.total_plays) || 0,
        totalUniqueViews: parseInt(row.total_unique_views) || 0,
        totalUniqueVisitors: parseInt(row.total_unique_visitors) || 0,
        avgPlaysPerSong: parseFloat(row.avg_plays_per_song) || 0
      }));
    } catch (error) {
      console.error('Error al obtener artistas más vistos:', error);
      throw createError('Error al obtener artistas más vistos', 500);
    }
  },

  // Obtener estadísticas de una canción específica
  async getSongViewStats(songId: number): Promise<SongViewStats> {
    try {
      const query = `SELECT * FROM get_song_view_stats($1)`;
      const result = await pool.query(query, [songId]);

      if (result.rows.length === 0) {
        return {
          totalViews: 0,
          uniqueVisitors: 0,
          viewsToday: 0,
          viewsThisWeek: 0,
          viewsThisMonth: 0,
          topCountries: [],
          hourlyDistribution: {}
        };
      }

      const row = result.rows[0];
      return {
        totalViews: parseInt(row.total_views) || 0,
        uniqueVisitors: parseInt(row.unique_visitors) || 0,
        viewsToday: parseInt(row.views_today) || 0,
        viewsThisWeek: parseInt(row.views_this_week) || 0,
        viewsThisMonth: parseInt(row.views_this_month) || 0,
        topCountries: [], // Simplificado por ahora
        hourlyDistribution: {} // Simplificado por ahora
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de canción:', error);
      throw createError('Error al obtener estadísticas de canción', 500);
    }
  },

  // Obtener visualizaciones recientes
  async getRecentViews(limit: number = 50): Promise<ViewRecord[]> {
    try {
      const query = `
        SELECT 
          view_id as "viewId",
          song_id as "songId",
          user_id as "userId",
          ip_address as "ipAddress",
          user_agent as "userAgent",
          session_id as "sessionId",
          referrer,
          viewed_at as "viewedAt",
          created_date as "createdDate"
        FROM song_views
        ORDER BY viewed_at DESC
        LIMIT $1
      `;
      
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener visualizaciones recientes:', error);
      throw createError('Error al obtener visualizaciones recientes', 500);
    }
  },

  // Obtener estadísticas generales
  async getGeneralStats(): Promise<{
    totalViews: number;
    uniqueVisitors: number;
    viewsToday: number;
    viewsThisWeek: number;
    viewsThisMonth: number;
    topSongs: TopSong[];
    topArtists: TopArtist[];
  }> {
    try {
      // Estadísticas generales
      const statsQuery = `
        SELECT 
          COUNT(*) as total_views,
          COUNT(DISTINCT ip_address) as unique_visitors,
          COUNT(CASE WHEN created_date = CURRENT_DATE THEN 1 END) as views_today,
          COUNT(CASE WHEN viewed_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as views_this_week,
          COUNT(CASE WHEN viewed_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as views_this_month
        FROM song_views
      `;
      
      const statsResult = await pool.query(statsQuery);
      const stats = statsResult.rows[0];

      // Top canciones y artistas
      const [topSongs, topArtists] = await Promise.all([
        this.getTopSongs(10),
        this.getTopArtists(5)
      ]);

      return {
        totalViews: parseInt(stats.total_views) || 0,
        uniqueVisitors: parseInt(stats.unique_visitors) || 0,
        viewsToday: parseInt(stats.views_today) || 0,
        viewsThisWeek: parseInt(stats.views_this_week) || 0,
        viewsThisMonth: parseInt(stats.views_this_month) || 0,
        topSongs,
        topArtists
      };
    } catch (error) {
      console.error('Error al obtener estadísticas generales:', error);
      throw createError('Error al obtener estadísticas generales', 500);
    }
  },

  // Limpiar visualizaciones antiguas (mantenimiento)
  async cleanupOldViews(): Promise<number> {
    try {
      const query = `
        DELETE FROM song_views 
        WHERE viewed_at < CURRENT_DATE - INTERVAL '2 years'
        RETURNING view_id
      `;
      
      const result = await pool.query(query);
      const deletedCount = result.rows.length;
      
      console.log(`🧹 Limpieza completada: ${deletedCount} visualizaciones antiguas eliminadas`);
      return deletedCount;
    } catch (error) {
      console.error('Error al limpiar visualizaciones antiguas:', error);
      throw createError('Error al limpiar visualizaciones antiguas', 500);
    }
  }
};
