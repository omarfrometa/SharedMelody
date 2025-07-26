import { Request, Response } from 'express';
import { favoritesService } from '../services/favoritesService';
import { createError } from '../middleware/errorHandler';

// Agregar canción a favoritos
export const addToFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const songId = parseInt(req.params.songId);

    if (!userId) {
      throw createError('Usuario no autenticado', 401);
    }

    if (!songId || isNaN(songId)) {
      throw createError('ID de canción inválido', 400);
    }

    const wasAdded = await favoritesService.addToFavorites(userId, songId);

    res.status(200).json({
      success: true,
      message: wasAdded ? 'Canción agregada a favoritos' : 'La canción ya estaba en favoritos',
      data: {
        songId,
        isFavorite: true,
        wasAdded
      }
    });
  } catch (error: any) {
    console.error('Error en addToFavorites:', error);
    res.status(error?.statusCode || 500).json({
      success: false,
      message: error?.message || 'Error interno del servidor'
    });
  }
};

// Quitar canción de favoritos
export const removeFromFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const songId = parseInt(req.params.songId);

    if (!userId) {
      throw createError('Usuario no autenticado', 401);
    }

    if (!songId || isNaN(songId)) {
      throw createError('ID de canción inválido', 400);
    }

    const wasRemoved = await favoritesService.removeFromFavorites(userId, songId);

    res.status(200).json({
      success: true,
      message: wasRemoved ? 'Canción removida de favoritos' : 'La canción no estaba en favoritos',
      data: {
        songId,
        isFavorite: false,
        wasRemoved
      }
    });
  } catch (error: any) {
    console.error('Error en removeFromFavorites:', error);
    res.status(error?.statusCode || 500).json({
      success: false,
      message: error?.message || 'Error interno del servidor'
    });
  }
};

// Alternar estado de favorito
export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const songId = parseInt(req.params.songId);

    if (!userId) {
      throw createError('Usuario no autenticado', 401);
    }

    if (!songId || isNaN(songId)) {
      throw createError('ID de canción inválido', 400);
    }

    const result = await favoritesService.toggleFavorite(userId, songId);

    res.status(200).json({
      success: true,
      message: result.action === 'added' 
        ? 'Canción agregada a favoritos' 
        : 'Canción removida de favoritos',
      data: {
        songId,
        isFavorite: result.isFavorite,
        action: result.action
      }
    });
  } catch (error: any) {
    console.error('Error en toggleFavorite:', error);
    res.status(error?.statusCode || 500).json({
      success: false,
      message: error?.message || 'Error interno del servidor'
    });
  }
};

// Verificar si una canción está en favoritos
export const isSongFavorite = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const songId = parseInt(req.params.songId);

    if (!userId) {
      throw createError('Usuario no autenticado', 401);
    }

    if (!songId || isNaN(songId)) {
      throw createError('ID de canción inválido', 400);
    }

    const isFavorite = await favoritesService.isSongFavorite(userId, songId);

    res.status(200).json({
      success: true,
      data: {
        songId,
        isFavorite
      }
    });
  } catch (error: any) {
    console.error('Error en isSongFavorite:', error);
    res.status(error?.statusCode || 500).json({
      success: false,
      message: error?.message || 'Error interno del servidor'
    });
  }
};

// Obtener favoritos del usuario
export const getUserFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      throw createError('Usuario no autenticado', 401);
    }

    if (limit < 1 || limit > 100) {
      throw createError('Límite debe estar entre 1 y 100', 400);
    }

    if (offset < 0) {
      throw createError('Offset debe ser mayor o igual a 0', 400);
    }

    const favorites = await favoritesService.getUserFavorites(userId, limit, offset);
    const totalCount = await favoritesService.getUserFavoritesCount(userId);

    res.status(200).json({
      success: true,
      data: {
        favorites,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + favorites.length < totalCount
        }
      }
    });
  } catch (error: any) {
    console.error('Error en getUserFavorites:', error);
    res.status(error?.statusCode || 500).json({
      success: false,
      message: error?.message || 'Error interno del servidor'
    });
  }
};

// Obtener canciones más favoritas
export const getMostFavoritedSongs = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    if (limit < 1 || limit > 50) {
      throw createError('Límite debe estar entre 1 y 50', 400);
    }

    const songs = await favoritesService.getMostFavoritedSongs(limit);

    res.status(200).json({
      success: true,
      data: {
        songs,
        count: songs.length
      }
    });
  } catch (error: any) {
    console.error('Error en getMostFavoritedSongs:', error);
    res.status(error?.statusCode || 500).json({
      success: false,
      message: error?.message || 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de favoritos de una canción
export const getSongFavoriteStats = async (req: Request, res: Response) => {
  try {
    const songId = parseInt(req.params.songId);

    if (!songId || isNaN(songId)) {
      throw createError('ID de canción inválido', 400);
    }

    const stats = await favoritesService.getSongFavoriteStats(songId);

    res.status(200).json({
      success: true,
      data: {
        songId,
        stats
      }
    });
  } catch (error: any) {
    console.error('Error en getSongFavoriteStats:', error);
    res.status(error?.statusCode || 500).json({
      success: false,
      message: error?.message || 'Error interno del servidor'
    });
  }
};
