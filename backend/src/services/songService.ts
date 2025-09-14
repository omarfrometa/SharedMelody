import pool from '../config/database';
import { createError } from '../middleware/errorHandler';

export interface Song {
  songId: number;
  title: string;
  artistId?: number;
  artistName?: string;
  albumId?: number;
  albumName?: string;
  genreId?: number;
  genreName?: string;
  lyrics?: string;
  duration?: string;
  fileUrl: string;
  fileSize?: number;
  fileFormat?: string;
  isExplicit: boolean;
  isPublic: boolean;
  isApproved: boolean;
  playsCount: number;
  uploadDate: string;
  uploadedBy?: number;
}

export interface SongFilters {
  page?: number;
  limit?: number;
  genre?: string;
  language?: string;
  sortBy?: string;
}

export interface PaginatedSongs {
  songs: Song[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const songService = {
  // Obtener canciones con filtros
  async getSongs(filters: SongFilters = {}): Promise<PaginatedSongs> {
    try {
      const {
        page = 1,
        limit = 20,
        genre,
        language,
        sortBy = 'created_at'
      } = filters;

      const offset = (page - 1) * limit;
      
      let query = `
        SELECT
          s.song_id as "songId",
          s.title,
          s.artist_id as "artistId",
          COALESCE(a.name, 'Artista Desconocido') as "artistName",
          s.album_id as "albumId",
          COALESCE(al.title, 'Álbum Desconocido') as "albumName",
          s.genre_id as "genreId",
          COALESCE(g.name, 'Sin Género') as "genreName",
          s.lyrics,
          s.duration,
          s.file_url as "fileUrl",
          s.file_size as "fileSize",
          s.file_format as "fileFormat",
          s.is_explicit as "isExplicit",
          s.is_public as "isPublic",
          s.is_approved as "isApproved",
          s.plays_count as "playsCount",
          s.upload_date as "uploadDate",
          s.uploaded_by as "uploadedBy"
        FROM songs s
        LEFT JOIN artists a ON s.artist_id = a.artist_id
        LEFT JOIN albums al ON s.album_id = al.album_id
        LEFT JOIN genres g ON s.genre_id = g.genre_id
        WHERE s.is_public = true
      `;

      const params: any[] = [];
      let paramCount = 0;

      if (genre) {
        paramCount++;
        query += ` AND s.genre_id = $${paramCount}`;
        params.push(genre);
      }

      if (language) {
        paramCount++;
        query += ` AND s.language_code = $${paramCount}`;
        params.push(language);
      }

      // Ordenamiento
      const validSortFields = ['upload_date', 'title', 'plays_count'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'upload_date';
      query += ` ORDER BY s.${sortField} DESC`;

      // Paginación
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(limit);

      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push(offset);

      const result = await pool.query(query, params);

      // Contar total de registros
      let countQuery = `
        SELECT COUNT(DISTINCT s.song_id) as total
        FROM songs s
        WHERE s.is_public = true
      `;

      const countParams: any[] = [];
      let countParamCount = 0;

      if (genre) {
        countParamCount++;
        countQuery += ` AND s.genre_id = $${countParamCount}`;
        countParams.push(genre);
      }

      if (language) {
        countParamCount++;
        countQuery += ` AND s.language_code = $${countParamCount}`;
        countParams.push(language);
      }

      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      return {
        songs: result.rows,
        page,
        limit,
        total,
        totalPages
      };
    } catch (error) {
      console.error('Error al obtener canciones:', error);
      throw createError('Error al obtener canciones', 500);
    }
  },

  // Buscar canciones
  async searchSongs(searchQuery: string, filters: SongFilters = {}): Promise<PaginatedSongs> {
    try {
      const { page = 1, limit = 20 } = filters;
      const offset = (page - 1) * limit;

      const query = `
        SELECT
          s.song_id as "songId",
          s.title,
          s.artist_id as "artistId",
          a.name as "artistName",
          s.album_id as "albumId",
          al.title as "albumName",
          s.genre_id as "genreId",
          g.name as "genreName",
          s.lyrics,
          s.duration,
          s.file_url as "fileUrl",
          s.file_size as "fileSize",
          s.file_format as "fileFormat",
          s.is_explicit as "isExplicit",
          s.is_public as "isPublic",
          s.is_approved as "isApproved",
          s.plays_count as "playsCount",
          s.upload_date as "uploadDate",
          s.uploaded_by as "uploadedBy"
        FROM songs s
        LEFT JOIN artists a ON s.artist_id = a.artist_id
        LEFT JOIN albums al ON s.album_id = al.album_id
        LEFT JOIN genres g ON s.genre_id = g.genre_id
        WHERE s.is_public = true
        AND (
          s.title ILIKE $1
          OR a.name ILIKE $1
          OR al.title ILIKE $1
        )
        GROUP BY s.song_id, a.name, al.title, g.name
        ORDER BY s.plays_count DESC, s.upload_date DESC
        LIMIT $2 OFFSET $3
      `;

      const searchPattern = `%${searchQuery}%`;
      const result = await pool.query(query, [searchPattern, limit, offset]);

      // Contar total de resultados
      const countQuery = `
        SELECT COUNT(DISTINCT s.song_id) as total
        FROM songs s
        LEFT JOIN artists a ON s.artist_id = a.artist_id
        LEFT JOIN albums al ON s.album_id = al.album_id
        WHERE s.is_public = true
        AND (
          s.title ILIKE $1
          OR a.name ILIKE $1
          OR al.title ILIKE $1
        )
      `;

      const countResult = await pool.query(countQuery, [searchPattern]);
      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      return {
        songs: result.rows,
        page,
        limit,
        total,
        totalPages
      };
    } catch (error) {
      console.error('Error al buscar canciones:', error);
      throw createError('Error al buscar canciones', 500);
    }
  },

  // Obtener canción por ID
  async getSongById(songId: string): Promise<Song | null> {
    try {
      const query = `
        SELECT
          s.song_id as "songId",
          s.title,
          s.artist_id as "artistId",
          ar.name as "artistName",
          s.author_id as "authorId",
          a.author_name as "authorName",
          s.album_id as "albumId",
          al.title as "albumTitle",
          s.release_year as "releaseYear",
          s.genre_id as "genreId",
          g.name as "genreName",
          s.lyrics,
          s.duration,
          s.file_url as "fileUrl",
          s.file_size as "fileSize",
          s.file_format as "fileFormat",
          s.is_explicit as "isExplicit",
          s.is_public as "isPublic",
          s.is_approved as "isApproved",
          s.status,
          s.upload_date as "uploadDate",
          s.plays_count as "playsCount",
          s.like_count as "likeCount"
        FROM songs s
        LEFT JOIN artists ar ON s.artist_id = ar.artist_id
        LEFT JOIN authors a ON s.author_id = a.author_id
        LEFT JOIN albums al ON s.album_id = al.album_id
        LEFT JOIN genres g ON s.genre_id = g.genre_id
        WHERE s.song_id = $1
      `;

      const result = await pool.query(query, [songId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error al obtener canción por ID:', error);
      throw createError('Error al obtener canción', 500);
    }
  },

  // Crear nueva canción
  async createSong(songData: any): Promise<Song> {
    try {
      const {
        title,
        artistName,
        authorId, // ID del artista/autor seleccionado
        album,
        releaseYear,
        genreId,
        typeId,
        lyrics,
        durationSeconds,
        explicitContent = false,
        comments,
        uploadedBy
      } = songData;

      console.log('🎵 Creando canción con datos:', {
        title,
        artistName,
        authorId,
        genreId
      });

      // Si no se proporciona authorId pero sí artistName, crear o buscar el artista
      let finalArtistId = authorId;
      if (!finalArtistId && artistName) {
        // Buscar si ya existe un artista con ese nombre
        const existingArtist = await pool.query(
          'SELECT artist_id FROM artists WHERE LOWER(name) = LOWER($1)',
          [artistName]
        );

        if (existingArtist.rows.length > 0) {
          finalArtistId = existingArtist.rows[0].artist_id;
          console.log('🎤 Artista existente encontrado:', finalArtistId);
        } else {
          // Crear nuevo artista
          const newArtist = await pool.query(
            'INSERT INTO artists (name, biography) VALUES ($1, $2) RETURNING artist_id',
            [artistName, `Artista: ${artistName}`]
          );
          finalArtistId = newArtist.rows[0].artist_id;
          console.log('🎤 Nuevo artista creado:', finalArtistId);
        }
      }

      // Si se proporciona album, crear o buscar el álbum
      let finalAlbumId = null;
      if (album) {
        // Buscar si ya existe un álbum con ese nombre
        const existingAlbum = await pool.query(
          'SELECT album_id FROM albums WHERE LOWER(title) = LOWER($1)',
          [album]
        );

        if (existingAlbum.rows.length > 0) {
          finalAlbumId = existingAlbum.rows[0].album_id;
          console.log('💿 Álbum existente encontrado:', finalAlbumId);
        } else {
          // Crear nuevo álbum
          const newAlbum = await pool.query(
            'INSERT INTO albums (title, artist_id, release_year) VALUES ($1, $2, $3) RETURNING album_id',
            [album, finalArtistId, releaseYear]
          );
          finalAlbumId = newAlbum.rows[0].album_id;
          console.log('💿 Nuevo álbum creado:', finalAlbumId);
        }
      }

      const query = `
        INSERT INTO songs (
          title, artist_id, album_id, release_year,
          genre_id, type_id, lyrics, duration,
          is_explicit, comments,
          uploaded_by, status, file_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', '')
        RETURNING
          song_id as "songId",
          title,
          artist_id as "artistId",
          album_id as "albumId",
          release_year as "releaseYear",
          genre_id as "genreId",
          type_id as "typeId",
          lyrics,
          duration,
          is_explicit as "explicitContent",
          status,
          upload_date as "createdAt"
      `;

      const result = await pool.query(query, [
        title,
        finalArtistId || null,
        finalAlbumId || null,
        releaseYear || null,
        genreId || null,
        typeId || null,
        lyrics || null,
        durationSeconds ? `${durationSeconds} seconds` : null, // Convertir a interval
        explicitContent,
        comments || null,
        uploadedBy || null
      ]);

      console.log('✅ Canción creada:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error al crear canción:', error);
      throw createError('Error al crear canción', 500);
    }
  },

  // Actualizar canción existente
  async updateSong(songId: string, songData: any, userId?: number): Promise<Song> {
    try {
      const {
        title,
        artistId,
        albumId,
        genreId,
        lyrics,
        fileUrl,
        fileSize,
        fileFormat,
        isExplicit = false,
        isPublic = true
      } = songData;

      // Configurar el usuario actual para el trigger de versionado
      if (userId) {
        await pool.query('SELECT set_config($1, $2, true)', ['app.current_user_id', userId.toString()]);
      }

      // Si se proporciona un artistId, verificar que existe en la tabla artists
      // Si no existe, crearlo basándose en los datos de authors
      if (artistId) {
        const artistExists = await pool.query('SELECT artist_id FROM artists WHERE artist_id = $1', [artistId]);

        if (artistExists.rows.length === 0) {
          // El artista no existe en la tabla artists, buscar en authors
          const authorData = await pool.query('SELECT author_name FROM authors WHERE author_id = $1', [artistId]);

          if (authorData.rows.length > 0) {
            // Crear el artista en la tabla artists basándose en los datos del author
            await pool.query(`
              INSERT INTO artists (artist_id, name, is_active, created_at)
              VALUES ($1, $2, true, NOW())
              ON CONFLICT (artist_id) DO NOTHING
            `, [artistId, authorData.rows[0].author_name]);

            console.log(`🎤 Artista creado automáticamente: ID ${artistId}, Nombre: ${authorData.rows[0].author_name}`);
          }
        }
      }

      const query = `
        UPDATE songs SET
          title = $1,
          artist_id = $2,
          album_id = $3,
          genre_id = $4,
          lyrics = $5,
          file_url = $6,
          file_size = $7,
          file_format = $8,
          is_explicit = $9,
          is_public = $10
        WHERE song_id = $11
        RETURNING
          song_id as "songId",
          title,
          artist_id as "artistId",
          album_id as "albumId",
          genre_id as "genreId",
          lyrics,
          file_url as "fileUrl",
          file_size as "fileSize",
          file_format as "fileFormat",
          is_explicit as "isExplicit",
          is_public as "isPublic",
          is_approved as "isApproved",
          plays_count as "playsCount",
          upload_date as "uploadDate",
          uploaded_by as "uploadedBy"
      `;

      const result = await pool.query(query, [
        title,
        artistId,
        albumId,
        genreId,
        lyrics || '',
        fileUrl || '',
        fileSize,
        fileFormat,
        isExplicit,
        isPublic,
        songId
      ]);

      if (result.rows.length === 0) {
        throw createError('Canción no encontrada', 404);
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error al actualizar canción:', error);
      throw createError('Error al actualizar canción', 500);
    }
  },

  // Obtener historial de versiones de una canción
  async getSongHistory(songId: string): Promise<any[]> {
    try {
      const query = `SELECT * FROM get_song_history($1)`;
      const result = await pool.query(query, [songId]);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener historial de canción:', error);
      throw createError('Error al obtener historial de canción', 500);
    }
  },

  // Obtener una versión específica de una canción
  async getSongVersion(versionId: string): Promise<any> {
    try {
      const query = `
        SELECT
          sv.*,
          a.author_name as artist_name,
          g.name as genre_name,
          u.username as changed_by_username,
          u.first_name || ' ' || u.last_name as changed_by_name
        FROM song_versions sv
        LEFT JOIN authors a ON sv.artist_id = a.author_id
        LEFT JOIN genres g ON sv.genre_id = g.genre_id
        LEFT JOIN users u ON sv.changed_by = u.user_id
        WHERE sv.version_id = $1
      `;

      const result = await pool.query(query, [versionId]);

      if (result.rows.length === 0) {
        throw createError('Versión de canción no encontrada', 404);
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error al obtener versión de canción:', error);
      throw createError('Error al obtener versión de canción', 500);
    }
  },

  // Eliminar canción
  async deleteSong(songId: string): Promise<void> {
    try {
      console.log('🗑️ Intentando eliminar canción con ID:', songId, 'Tipo:', typeof songId);
      
      // Primero verificar si existen versiones de la canción
      const checkVersionsQuery = `
        SELECT COUNT(*) as count
        FROM public.song_versions
        WHERE song_id = $1
      `;

      console.log('🔍 Verificando si existen versiones de la canción...');
      const versionsCheck = await pool.query(checkVersionsQuery, [songId]);
      const versionCount = parseInt(versionsCheck.rows[0].count);
      console.log('🔍 Número de versiones encontradas:', versionCount);

      // Si hay versiones, eliminarlas primero
      if (versionCount > 0) {
        console.log('🗑️ Eliminando versiones de la canción...');
        const deleteVersionsQuery = `
          DELETE FROM public.song_versions
          WHERE song_id = $1
        `;

        const versionsResult = await pool.query(deleteVersionsQuery, [songId]);
        console.log('🔍 Versiones eliminadas:', versionsResult.rowCount);

        // Verificar que todas las versiones fueron eliminadas
        if (versionsResult.rowCount !== versionCount) {
          console.log('❌ Error: No se pudieron eliminar todas las versiones');
          throw createError('Error al eliminar las versiones de la canción', 500);
        }

        console.log('✅ Todas las versiones fueron eliminadas exitosamente');
      } else {
        console.log('ℹ️ No se encontraron versiones para eliminar');
      }

      // Solo después de confirmar que las versiones fueron eliminadas, eliminar la canción principal
      const deleteSongQuery = `
        DELETE FROM songs
        WHERE song_id = $1
        RETURNING song_id
      `;

      console.log('🔍 Ejecutando query de eliminación de canción:', deleteSongQuery);
      console.log('🔍 Parámetros:', [songId]);
      
      const result = await pool.query(deleteSongQuery, [songId]);
      
      console.log('🔍 Resultado del query:', result.rows);
      console.log('🔍 Número de filas afectadas:', result.rowCount);

      if (result.rows.length === 0) {
        console.log('❌ No se encontró canción con ID:', songId);
        throw createError('Canción no encontrada', 404);
      }

      console.log('✅ Canción eliminada exitosamente después de eliminar sus versiones:', songId);
    } catch (error) {
      console.error('❌ Error detallado al eliminar canción:', {
        message: (error as any).message,
        stack: (error as any).stack,
        code: (error as any).code,
        detail: (error as any).detail
      });
      
      // Re-lanzar el error original si es un error de createError
      if ((error as any).statusCode) {
        throw error;
      }
      
      throw createError('Error al eliminar canción', 500);
    }
  },

  // Calificar canción
  async rateSong(songId: string, userId: number, rating: number, reviewComment?: string): Promise<any> {
    try {
      // Verificar que el rating esté entre 1 y 5
      if (rating < 1 || rating > 5) {
        throw createError('El rating debe estar entre 1 y 5', 400);
      }

      // Verificar si el usuario ya calificó esta canción
      const existingRating = await pool.query(`
        SELECT rating_id FROM song_ratings
        WHERE song_id = $1 AND user_id = $2
      `, [songId, userId]);

      let result;
      
      if (existingRating.rows.length > 0) {
        // Actualizar rating existente
        const updateQuery = `
          UPDATE song_ratings
          SET rating = $1, review_comment = $2, updated_at = NOW()
          WHERE song_id = $3 AND user_id = $4
          RETURNING rating_id as "ratingId", song_id as "songId",
                    user_id as "userId", rating, review_comment as "reviewComment",
                    created_at as "createdAt", updated_at as "updatedAt"
        `;
        result = await pool.query(updateQuery, [rating, reviewComment, songId, userId]);
      } else {
        // Crear nuevo rating
        const insertQuery = `
          INSERT INTO song_ratings (song_id, user_id, rating, review_comment)
          VALUES ($1, $2, $3, $4)
          RETURNING rating_id as "ratingId", song_id as "songId",
                    user_id as "userId", rating, review_comment as "reviewComment",
                    created_at as "createdAt", updated_at as "updatedAt"
        `;
        result = await pool.query(insertQuery, [songId, userId, rating, reviewComment]);
      }

      // Actualizar el promedio de rating de la canción
      await this.updateSongRatingStats(songId);

      return result.rows[0];
    } catch (error) {
      console.error('Error al calificar canción:', error);
      throw createError('Error al calificar canción', 500);
    }
  },

  // Obtener rating del usuario para una canción
  async getUserRating(songId: string, userId: number): Promise<any | null> {
    try {
      const query = `
        SELECT
          sr.rating_id as "ratingId",
          sr.song_id as "songId",
          sr.user_id as "userId",
          sr.rating,
          sr.review_comment as "reviewComment",
          sr.created_at as "createdAt",
          sr.updated_at as "updatedAt",
          u.username,
          u.first_name as "firstName",
          u.last_name as "lastName"
        FROM song_ratings sr
        LEFT JOIN users u ON sr.user_id = u.user_id
        WHERE sr.song_id = $1 AND sr.user_id = $2
      `;
      
      const result = await pool.query(query, [songId, userId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error al obtener rating del usuario:', error);
      throw createError('Error al obtener rating del usuario', 500);
    }
  },

  // Obtener todos los ratings de una canción
  async getSongRatings(songId: string, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT
          sr.rating_id as "ratingId",
          sr.song_id as "songId",
          sr.user_id as "userId",
          sr.rating,
          sr.review_comment as "reviewComment",
          sr.created_at as "createdAt",
          sr.updated_at as "updatedAt",
          u.username,
          u.first_name as "firstName",
          u.last_name as "lastName"
        FROM song_ratings sr
        LEFT JOIN users u ON sr.user_id = u.user_id
        WHERE sr.song_id = $1
        ORDER BY sr.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await pool.query(query, [songId, limit, offset]);
      
      // Contar total de ratings
      const countQuery = `
        SELECT COUNT(*) as total FROM song_ratings WHERE song_id = $1
      `;
      const countResult = await pool.query(countQuery, [songId]);
      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);
      
      return {
        ratings: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error al obtener ratings de la canción:', error);
      throw createError('Error al obtener ratings de la canción', 500);
    }
  },

  // Actualizar estadísticas de rating de una canción
  async updateSongRatingStats(songId: string): Promise<void> {
    try {
      const query = `
        UPDATE songs
        SET
          average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM song_ratings
            WHERE song_id = $1
          ),
          rating_count = (
            SELECT COUNT(*)
            FROM song_ratings
            WHERE song_id = $1
          )
        WHERE song_id = $1
      `;
      
      await pool.query(query, [songId]);
    } catch (error) {
      console.error('Error al actualizar estadísticas de rating:', error);
      // No lanzar error para no interrumpir el proceso principal
    }
  },

  // Dar like a una canción
  async likeSong(songId: string, userId: number): Promise<any> {
    try {
      // Verificar si ya existe el like
      const existingLike = await pool.query(`
        SELECT like_id FROM song_likes
        WHERE song_id = $1 AND user_id = $2
      `, [songId, userId]);

      if (existingLike.rows.length > 0) {
        throw createError('Ya has dado me gusta a esta canción', 400);
      }

      // Crear el like
      const insertQuery = `
        INSERT INTO song_likes (song_id, user_id)
        VALUES ($1, $2)
        RETURNING like_id as "likeId", song_id as "songId",
                  user_id as "userId", created_at as "createdAt"
      `;
      
      const result = await pool.query(insertQuery, [songId, userId]);

      // Actualizar contador de likes en la canción
      await pool.query(`
        UPDATE songs
        SET like_count = (
          SELECT COUNT(*) FROM song_likes WHERE song_id = $1
        )
        WHERE song_id = $1
      `, [songId]);

      return result.rows[0];
    } catch (error) {
      console.error('Error al dar like a canción:', error);
      if ((error as any).statusCode) {
        throw error;
      }
      throw createError('Error al dar me gusta', 500);
    }
  },

  // Quitar like de una canción
  async unlikeSong(songId: string, userId: number): Promise<void> {
    try {
      const result = await pool.query(`
        DELETE FROM song_likes
        WHERE song_id = $1 AND user_id = $2
        RETURNING like_id
      `, [songId, userId]);

      if (result.rows.length === 0) {
        throw createError('No has dado me gusta a esta canción', 400);
      }

      // Actualizar contador de likes en la canción
      await pool.query(`
        UPDATE songs
        SET like_count = (
          SELECT COUNT(*) FROM song_likes WHERE song_id = $1
        )
        WHERE song_id = $1
      `, [songId]);
    } catch (error) {
      console.error('Error al quitar like de canción:', error);
      if ((error as any).statusCode) {
        throw error;
      }
      throw createError('Error al quitar me gusta', 500);
    }
  },

  // Verificar si el usuario dio like a una canción
  async checkIfLiked(songId: string, userId: number): Promise<boolean> {
    try {
      const result = await pool.query(`
        SELECT like_id FROM song_likes
        WHERE song_id = $1 AND user_id = $2
      `, [songId, userId]);

      return result.rows.length > 0;
    } catch (error) {
      console.error('Error al verificar like:', error);
      return false;
    }
  }
};
