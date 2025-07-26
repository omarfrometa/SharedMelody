import { Router } from 'express';
import { getSongs, getSongById, searchSongs, createSong, updateSong, getSongHistory, getSongVersion } from '../controllers/songController';
import { toggleFavorite, isSongFavorite } from '../controllers/favoritesController';
import { authenticateToken } from '../middleware/auth';
// import { authenticateToken, optionalAuth, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// GET /api/songs - Obtener todas las canciones (solo aceptadas para público general)
router.get('/', getSongs);

// GET /api/songs/search - Buscar canciones
router.get('/search', searchSongs);

// GET /api/songs/:id - Obtener canción por ID
router.get('/:id', getSongById);

// POST /api/songs - Crear nueva canción (requiere autenticación)
router.post('/', createSong);

// PUT /api/songs/:id - Editar canción (requiere autenticación y ser admin o propietario)
router.put('/:id', updateSong);

// GET /api/songs/:id/history - Obtener historial de versiones (solo admins)
router.get('/:id/history', getSongHistory);

// GET /api/songs/versions/:versionId - Obtener versión específica (solo admins)
router.get('/versions/:versionId', getSongVersion);

// Rutas de favoritos para canciones específicas
// PUT /api/songs/:id/like - Alternar favorito (requiere autenticación)
router.put('/:id/like', authenticateToken, (req, res) => {
  // Mapear id a songId para compatibilidad con el controlador
  const modifiedReq = { ...req, params: { ...req.params, songId: req.params.id } };
  toggleFavorite(modifiedReq as any, res);
});

// GET /api/songs/:id/is-liked - Verificar si está en favoritos (requiere autenticación)
router.get('/:id/is-liked', authenticateToken, (req, res) => {
  // Mapear id a songId para compatibilidad con el controlador
  const modifiedReq = { ...req, params: { ...req.params, songId: req.params.id } };
  isSongFavorite(modifiedReq as any, res);
});

// TODO: Implementar rutas de moderación
// GET /api/songs/pending - Obtener canciones pendientes (solo admins)
// router.get('/pending', authenticateToken, requireAdmin, getPendingSongs);

// PUT /api/songs/:id/status - Cambiar estado de canción (solo admins)
// router.put('/:id/status', authenticateToken, requireAdmin, updateSongStatus);

export { router as songRoutes };
