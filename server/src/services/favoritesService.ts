import { pool } from '../config/database';
import { createError } from '../middleware/errorHandler';

export interface FavoriteSong {
  songId: number;
  title: string;
  artistName: string;
  genreName: string;
  uploadDate: Date;
  likeCount: number;
  playsCount: number;
  favoritedAt: Date;
}

export interface MostFavoritedSong {
  songId: number;
  title: string;
  artistName: string;
  genreName: string;
  likeCount: number;
  playsCount: number;
  uploadDate: Date;
  favoritesCount: number;
}

export const favoritesService = {
  // Agregar canción a favoritos
  async addToFavorites(userId: number, songId: number): Promise<boolean> {
    try {
      const query = `SELECT add_to_favorites($1, $2)`;
      const result = await pool.query(query, [userId, songId]);

      const wasAdded = result.rows[0]?.add_to_favorites || false;
      
      if (wasAdded) {
        console.log(`❤️ Canción ${songId} agregada a favoritos del usuario ${userId}`);
      } else {
        console.log(`❤️ Canción ${songId} ya estaba en favoritos del usuario ${userId}`);
      }

      return wasAdded;
    } catch (error) {
      console.error('Error al agregar a favoritos:', error);
      throw createError('Error al agregar canción a favoritos', 500);
    }
  },

  // Quitar canción de favoritos
  async removeFromFavorites(userId: number, songId: number): Promise<boolean> {
    try {
      const query = `SELECT remove_from_favorites($1, $2)`;
      const result = await pool.query(query, [userId, songId]);

      const wasRemoved = result.rows[0]?.remove_from_favorites || false;
      
      if (wasRemoved) {
        console.log(`💔 Canción ${songId} removida de favoritos del usuario ${userId}`);
      } else {
        console.log(`💔 Canción ${songId} no estaba en favoritos del usuario ${userId}`);
      }

      return wasRemoved;
    } catch (error) {
      console.error('Error al remover de favoritos:', error);
      throw createError('Error al remover canción de favoritos', 500);
    }
  },

  // Verificar si una canción está en favoritos
  async isSongFavorite(userId: number, songId: number): Promise<boolean> {
    try {
      const query = `SELECT is_song_favorite($1, $2)`;
      const result = await pool.query(query, [userId, songId]);

      return result.rows[0]?.is_song_favorite || false;
    } catch (error) {
      console.error('Error al verificar favorito:', error);
      throw createError('Error al verificar si la canción está en favoritos', 500);
    }
  },

  // Obtener favoritos de un usuario
  async getUserFavorites(
    userId: number, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<FavoriteSong[]> {
    try {
      const query = `SELECT * FROM get_user_favorites($1, $2, $3)`;
      const result = await pool.query(query, [userId, limit, offset]);

      return result.rows.map(row => ({
        songId: row.song_id,
        title: row.title,
        artistName: row.artist_name || 'Artista desconocido',
        genreName: row.genre_name || 'Sin género',
        uploadDate: row.upload_date,
        likeCount: parseInt(row.like_count) || 0,
        playsCount: parseInt(row.plays_count) || 0,
        favoritedAt: row.favorited_at
      }));
    } catch (error) {
      console.error('Error al obtener favoritos del usuario:', error);
      throw createError('Error al obtener favoritos del usuario', 500);
    }
  },

  // Obtener canciones más favoritas
  async getMostFavoritedSongs(limit: number = 10): Promise<MostFavoritedSong[]> {
    try {
      const query = `SELECT * FROM get_most_favorited_songs($1)`;
      const result = await pool.query(query, [limit]);

      return result.rows.map(row => ({
        songId: row.song_id,
        title: row.title,
        artistName: row.artist_name || 'Artista desconocido',
        genreName: row.genre_name || 'Sin género',
        likeCount: parseInt(row.like_count) || 0,
        playsCount: parseInt(row.plays_count) || 0,
        uploadDate: row.upload_date,
        favoritesCount: parseInt(row.favorites_count) || 0
      }));
    } catch (error) {
      console.error('Error al obtener canciones más favoritas:', error);
      throw createError('Error al obtener canciones más favoritas', 500);
    }
  },

  // Obtener estadísticas de favoritos de una canción
  async getSongFavoriteStats(songId: number): Promise<{
    totalFavorites: number;
    uniqueUsersFavorited: number;
    firstFavorited: Date | null;
    lastFavorited: Date | null;
  }> {
    try {
      const query = `
        SELECT 
          total_favorites,
          unique_users_favorited,
          first_favorited,
          last_favorited
        FROM favorites_stats 
        WHERE song_id = $1
      `;
      
      const result = await pool.query(query, [songId]);

      if (result.rows.length === 0) {
        return {
          totalFavorites: 0,
          uniqueUsersFavorited: 0,
          firstFavorited: null,
          lastFavorited: null
        };
      }

      const row = result.rows[0];
      return {
        totalFavorites: parseInt(row.total_favorites) || 0,
        uniqueUsersFavorited: parseInt(row.unique_users_favorited) || 0,
        firstFavorited: row.first_favorited,
        lastFavorited: row.last_favorited
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de favoritos:', error);
      throw createError('Error al obtener estadísticas de favoritos', 500);
    }
  },

  // Obtener conteo total de favoritos de un usuario
  async getUserFavoritesCount(userId: number): Promise<number> {
    try {
      const query = `
        SELECT COUNT(*) as total
        FROM user_favorites uf
        JOIN songs s ON uf.song_id = s.song_id
        WHERE uf.user_id = $1 
          AND s.is_public = true 
          AND s.is_approved = true
      `;
      
      const result = await pool.query(query, [userId]);
      return parseInt(result.rows[0]?.total) || 0;
    } catch (error) {
      console.error('Error al obtener conteo de favoritos:', error);
      throw createError('Error al obtener conteo de favoritos', 500);
    }
  },

  // Alternar estado de favorito (toggle)
  async toggleFavorite(userId: number, songId: number): Promise<{
    isFavorite: boolean;
    action: 'added' | 'removed';
  }> {
    try {
      // Verificar estado actual
      const currentlyFavorite = await this.isSongFavorite(userId, songId);
      
      if (currentlyFavorite) {
        // Remover de favoritos
        await this.removeFromFavorites(userId, songId);
        return { isFavorite: false, action: 'removed' };
      } else {
        // Agregar a favoritos
        await this.addToFavorites(userId, songId);
        return { isFavorite: true, action: 'added' };
      }
    } catch (error) {
      console.error('Error al alternar favorito:', error);
      throw createError('Error al alternar estado de favorito', 500);
    }
  }
};
