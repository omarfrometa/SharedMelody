import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  isSongFavorite,
  getUserFavorites,
  getMostFavoritedSongs,
  getSongFavoriteStats
} from '../controllers/favoritesController';

const router = Router();

// Rutas que requieren autenticación
router.use(authenticateToken);

// POST /api/favorites/songs/:songId - Agregar canción a favoritos
router.post('/songs/:songId', addToFavorites);

// DELETE /api/favorites/songs/:songId - Quitar canción de favoritos
router.delete('/songs/:songId', removeFromFavorites);

// PUT /api/favorites/songs/:songId/toggle - Alternar estado de favorito
router.put('/songs/:songId/toggle', toggleFavorite);

// GET /api/favorites/songs/:songId/check - Verificar si está en favoritos
router.get('/songs/:songId/check', isSongFavorite);

// GET /api/favorites/my-favorites - Obtener favoritos del usuario autenticado
router.get('/my-favorites', getUserFavorites);

// GET /api/favorites/songs/:songId/stats - Obtener estadísticas de favoritos de una canción
router.get('/songs/:songId/stats', getSongFavoriteStats);

// Rutas públicas (no requieren autenticación)
const publicRouter = Router();

// GET /api/favorites/most-favorited - Obtener canciones más favoritas
publicRouter.get('/most-favorited', getMostFavoritedSongs);

export { router as favoritesRoutes, publicRouter as publicFavoritesRoutes };
