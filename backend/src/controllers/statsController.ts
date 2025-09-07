import { Request, Response, NextFunction } from 'express';
import { viewTrackingService } from '../services/viewTrackingService';

// Obtener canciones más vistas
export const getTopSongs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const topSongs = await viewTrackingService.getTopSongs(limit);

    res.json({
      success: true,
      data: topSongs,
      message: `Top ${topSongs.length} canciones más vistas obtenidas`
    });
  } catch (error) {
    next(error);
  }
};

// Obtener artistas más vistos
export const getTopArtists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const topArtists = await viewTrackingService.getTopArtists(limit);

    res.json({
      success: true,
      data: topArtists,
      message: `Top ${topArtists.length} artistas más vistos obtenidos`
    });
  } catch (error) {
    next(error);
  }
};

// Obtener estadísticas de una canción específica
export const getSongStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { songId } = req.params;
    const stats = await viewTrackingService.getSongViewStats(parseInt(songId));

    res.json({
      success: true,
      data: stats,
      message: 'Estadísticas de canción obtenidas'
    });
  } catch (error) {
    next(error);
  }
};

// Obtener estadísticas generales
export const getGeneralStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await viewTrackingService.getGeneralStats();

    res.json({
      success: true,
      data: stats,
      message: 'Estadísticas generales obtenidas'
    });
  } catch (error) {
    next(error);
  }
};

// Obtener visualizaciones recientes (solo para admins)
export const getRecentViews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const recentViews = await viewTrackingService.getRecentViews(limit);

    res.json({
      success: true,
      data: recentViews,
      message: `${recentViews.length} visualizaciones recientes obtenidas`
    });
  } catch (error) {
    next(error);
  }
};

// Registrar visualización manualmente (para testing)
export const recordView = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { songId } = req.params;
    const { userId } = req.body;
    
    const ipAddress = (req as any).clientIP || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';
    const sessionId = req.sessionID || '';
    const referrer = (req.headers.referer || req.headers.referrer || '') as string;

    const wasRecorded = await viewTrackingService.recordView(
      parseInt(songId),
      ipAddress,
      userId,
      userAgent,
      sessionId,
      referrer
    );

    res.json({
      success: true,
      data: { recorded: wasRecorded },
      message: wasRecorded ? 'Visualización registrada' : 'Visualización ya registrada para hoy'
    });
  } catch (error) {
    next(error);
  }
};

// Limpiar visualizaciones antiguas (solo para admins)
export const cleanupOldViews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deletedCount = await viewTrackingService.cleanupOldViews();

    res.json({
      success: true,
      data: { deletedCount },
      message: `${deletedCount} visualizaciones antiguas eliminadas`
    });
  } catch (error) {
    next(error);
  }
};
