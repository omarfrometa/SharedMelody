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
    ipAddressPublic: string,
    userId?: number,
    userAgent?: string,
    sessionId?: string,
    referrer?: string,
    ipAddressPrivate?: string
  ): Promise<boolean> {
    console.log('🚀 TRACKING COMPLETO: Iniciando registro completo de visita...');
    
    try {
      // 1. Crear tabla de logs independiente (sin relación con songs)
      const createLogTableQuery = `
        CREATE TABLE IF NOT EXISTS visit_logs (
          id SERIAL PRIMARY KEY,
          song_id INTEGER NOT NULL,
          ip_address VARCHAR(45) NOT NULL,
          visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          user_agent TEXT,
          session_id VARCHAR(255),
          referrer TEXT,
          date_only DATE DEFAULT CURRENT_DATE
        )
      `;
      
      await pool.query(createLogTableQuery);
      console.log('✅ Tabla visit_logs verificada/creada');

      // 2. VERIFICAR DUPLICADOS: Evitar registros duplicados en los últimos 30 segundos
      const duplicateCheckQuery = `
        SELECT id, visited_at
        FROM visit_logs
        WHERE song_id = $1
          AND ip_address = $2
          AND visited_at > (CURRENT_TIMESTAMP - INTERVAL '30 seconds')
        ORDER BY visited_at DESC
        LIMIT 1
      `;
      
      const duplicateCheck = await pool.query(duplicateCheckQuery, [songId, ipAddressPublic]);
      
      if (duplicateCheck.rows.length > 0) {
        const lastVisit = duplicateCheck.rows[0];
        console.log('⚠️ DUPLICADO DETECTADO: Visita reciente encontrada', {
          songId,
          ip: ipAddressPublic,
          lastVisitId: lastVisit.id,
          lastVisitTime: lastVisit.visited_at,
          message: 'Saltando registro para evitar duplicados'
        });
        return false; // No registrar duplicado
      }

      console.log('✅ No hay duplicados recientes, procediendo con el registro...');

      // 3. Insertar log de visita
      const insertLogQuery = `
        INSERT INTO visit_logs (song_id, ip_address, user_agent, session_id, referrer)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, visited_at
      `;
      
      const logResult = await pool.query(insertLogQuery, [
        songId,
        ipAddressPublic,
        userAgent || null,
        sessionId || null,
        referrer || null
      ]);
      
      console.log('✅ Log registrado:', {
        logId: logResult.rows[0]?.id,
        timestamp: logResult.rows[0]?.visited_at
      });

      // 4. Actualizar contador plays_count en tabla songs
      try {
        const updateSongQuery = `
          UPDATE songs
          SET plays_count = COALESCE(plays_count, 0) + 1
          WHERE song_id = $1
          RETURNING song_id, plays_count
        `;
        
        const songResult = await pool.query(updateSongQuery, [songId]);
        console.log('✅ Contador songs actualizado:', {
          songId: songResult.rows[0]?.song_id,
          newCount: songResult.rows[0]?.plays_count
        });
      } catch (error) {
        console.error('⚠️ Error actualizando contador songs:', (error as any).message);
      }

      // 5. Insertar en song_views
      try {
        const insertViewQuery = `
          INSERT INTO song_views (
            view_id, song_id, user_id, ip_address_public, ip_address_private,
            user_agent, session_id, referrer, viewed_at, created_date
          ) VALUES (
            gen_random_uuid(), $1, $2, $3::inet, $4::inet,
            $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_DATE
          )
          RETURNING view_id
        `;
        
        const viewResult = await pool.query(insertViewQuery, [
          songId,
          userId || null,
          ipAddressPublic,
          ipAddressPrivate || ipAddressPublic,
          userAgent || null,
          sessionId || null,
          referrer || null
        ]);
        
        console.log('✅ Vista detallada registrada:', {
          viewId: viewResult.rows[0]?.view_id
        });
      } catch (error) {
        console.error('⚠️ Error insertando en song_views:', (error as any).message);
      }

      // 6. Actualizar/crear unique_visitors
      try {
        // Primero verificar si ya existe el visitante
        const checkVisitorQuery = `
          SELECT visitor_id, total_visits
          FROM unique_visitors
          WHERE ip_address_public = $1::inet
        `;
        
        const existingVisitor = await pool.query(checkVisitorQuery, [ipAddressPublic]);
        
        if (existingVisitor.rows.length > 0) {
          // Actualizar visitante existente
          const updateVisitorQuery = `
            UPDATE unique_visitors
            SET
              last_visit_date = CURRENT_DATE,
              total_visits = total_visits + 1,
              updated_at = CURRENT_TIMESTAMP
            WHERE ip_address_public = $1::inet
            RETURNING visitor_id, total_visits
          `;
          
          const visitorResult = await pool.query(updateVisitorQuery, [ipAddressPublic]);
          console.log('✅ Visitante existente actualizado:', {
            visitorId: visitorResult.rows[0]?.visitor_id,
            totalVisits: visitorResult.rows[0]?.total_visits
          });
        } else {
          // Crear nuevo visitante
          const insertVisitorQuery = `
            INSERT INTO unique_visitors (
              visitor_id, ip_address_public, ip_address_private, user_id,
              first_visit_date, last_visit_date, total_visits, created_at, updated_at
            ) VALUES (
              gen_random_uuid(), $1::inet, $2::inet, $3,
              CURRENT_DATE, CURRENT_DATE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
            RETURNING visitor_id, total_visits
          `;
          
          const visitorResult = await pool.query(insertVisitorQuery, [
            ipAddressPublic,
            ipAddressPrivate || ipAddressPublic,
            userId || null
          ]);
          
          console.log('✅ Nuevo visitante creado:', {
            visitorId: visitorResult.rows[0]?.visitor_id,
            totalVisits: visitorResult.rows[0]?.total_visits
          });
        }
      } catch (error) {
        console.error('⚠️ Error gestionando unique_visitors:', (error as any).message);
      }

      console.log('🎉 TRACKING COMPLETO EXITOSO para canción:', songId);
      return true;

    } catch (error) {
      console.error('❌ Error en tracking completo:', {
        songId,
        error: (error as any).message,
        code: (error as any).code
      });
      
      // Incluso si falla, no romper la aplicación
      return false;
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
