import { Request, Response, NextFunction } from 'express';
import { songService } from '../services/songService';
import { viewTrackingService } from '../services/viewTrackingService';
import { createError } from '../middleware/errorHandler';

// Obtener todas las canciones
export const getSongs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const genre = req.query.genre as string;
    const language = req.query.language as string;
    const sortBy = req.query.sortBy as string || 'created_at';

    const result = await songService.getSongs({
      page,
      limit,
      genre,
      language,
      sortBy
    });

    res.json({
      success: true,
      data: result.songs,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

// Buscar canciones
export const searchSongs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.query as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!query) {
      throw createError('Query de búsqueda requerido', 400);
    }

    const result = await songService.searchSongs(query, { page, limit });

    res.json({
      success: true,
      data: result.songs,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener canción por ID
export const getSongById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const song = await songService.getSongById(id);

    if (!song) {
      throw createError('Canción no encontrada', 404);
    }

    // Registrar visualización automáticamente
    try {
      const ipAddress = (req as any).clientIP || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || '';
      const sessionId = req.sessionID || '';
      const referrer = (req.headers.referer || req.headers.referrer || '') as string;

      // TODO: Obtener userId del token de autenticación cuando esté implementado
      // const userId = req.user?.userId;

      await viewTrackingService.recordView(
        parseInt(id),
        ipAddress,
        undefined, // userId
        userAgent,
        sessionId,
        referrer
      );
    } catch (viewError) {
      // No fallar la respuesta si hay error en el tracking
      console.error('Error al registrar visualización:', viewError);
    }

    res.json({
      success: true,
      data: song
    });
  } catch (error) {
    next(error);
  }
};

// Crear nueva canción
export const createSong = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const songData = req.body;
    const song = await songService.createSong(songData);

    res.status(201).json({
      success: true,
      data: song,
      message: 'Canción creada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar canción existente
export const updateSong = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const songData = req.body;

    // Verificar que la canción existe
    const existingSong = await songService.getSongById(id);
    if (!existingSong) {
      throw createError('Canción no encontrada', 404);
    }

    // TODO: Agregar verificación de permisos (admin o propietario)
    // const user = req.user;
    // if (user.role !== 'admin' && existingSong.uploadedBy !== user.userId) {
    //   throw createError('No tienes permisos para editar esta canción', 403);
    // }

    // TODO: Obtener userId del token de autenticación
    // const userId = req.user?.userId;
    const userId = 1; // Admin por defecto para testing

    const updatedSong = await songService.updateSong(id, songData, userId);

    res.json({
      success: true,
      data: updatedSong,
      message: 'Canción actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Obtener historial de versiones de una canción
export const getSongHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const history = await songService.getSongHistory(id);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

// Obtener una versión específica de una canción
export const getSongVersion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { versionId } = req.params;
    const version = await songService.getSongVersion(versionId);

    res.json({
      success: true,
      data: version
    });
  } catch (error) {
    next(error);
  }
};


