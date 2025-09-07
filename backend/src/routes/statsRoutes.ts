import { Router } from 'express';
import { 
  getTopSongs, 
  getTopArtists, 
  getSongStats, 
  getGeneralStats, 
  getRecentViews, 
  recordView, 
  cleanupOldViews 
} from '../controllers/statsController';

const router = Router();

// =============================================
// RUTAS PÚBLICAS DE ESTADÍSTICAS
// =============================================

// GET /api/stats/top-songs - Obtener canciones más vistas
router.get('/top-songs', getTopSongs);

// GET /api/stats/top-artists - Obtener artistas más vistos
router.get('/top-artists', getTopArtists);

// GET /api/stats/general - Obtener estadísticas generales
router.get('/general', getGeneralStats);

// GET /api/stats/songs/:songId - Obtener estadísticas de una canción específica
router.get('/songs/:songId', getSongStats);

// =============================================
// RUTAS DE ADMINISTRACIÓN (requieren autenticación)
// =============================================

// GET /api/stats/recent-views - Obtener visualizaciones recientes (solo admins)
// router.get('/recent-views', authenticateToken, requireAdmin, getRecentViews);

// POST /api/stats/songs/:songId/view - Registrar visualización manualmente (para testing)
router.post('/songs/:songId/view', recordView);

// DELETE /api/stats/cleanup - Limpiar visualizaciones antiguas (solo admins)
// router.delete('/cleanup', authenticateToken, requireAdmin, cleanupOldViews);

// =============================================
// RUTAS TEMPORALES PARA DESARROLLO
// =============================================

// Estas rutas están disponibles sin autenticación solo para desarrollo
if (process.env.NODE_ENV === 'development') {
  router.get('/recent-views', getRecentViews);
  router.delete('/cleanup', cleanupOldViews);
}

export default router;
