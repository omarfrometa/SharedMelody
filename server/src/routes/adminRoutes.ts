import { Router } from 'express';
import { getDashboardStats, getUsers } from '../controllers/adminController';
import requestsRouter from './admin/requests';
// import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// =============================================
// RUTAS DE ADMINISTRACIÓN
// =============================================

// Dashboard y estadísticas
router.get('/dashboard/stats', getDashboardStats);

// Gestión de usuarios
router.get('/users', getUsers);

// Gestión de solicitudes
router.use('/requests', requestsRouter);

// TODO: Implementar rutas adicionales de administración
// router.put('/users/:id/role', authenticateToken, requireAdmin, updateUserRole);
// router.put('/users/:id/status', authenticateToken, requireAdmin, updateUserStatus);
// router.delete('/users/:id', authenticateToken, requireAdmin, deleteUser);

// Gestión de canciones
// router.get('/songs', authenticateToken, requireAdmin, getAdminSongs);
// router.put('/songs/:id/status', authenticateToken, requireAdmin, updateSongStatus);

// Gestión de solicitudes
// router.get('/requests', authenticateToken, requireAdmin, getAdminRequests);
// router.put('/requests/:id/status', authenticateToken, requireAdmin, updateRequestStatus);

// Gestión de géneros
// router.get('/genres', authenticateToken, requireAdmin, getGenres);
// router.post('/genres', authenticateToken, requireAdmin, createGenre);
// router.put('/genres/:id', authenticateToken, requireAdmin, updateGenre);
// router.delete('/genres/:id', authenticateToken, requireAdmin, deleteGenre);

// Gestión de países
// router.get('/countries', authenticateToken, requireAdmin, getCountries);
// router.post('/countries', authenticateToken, requireAdmin, createCountry);
// router.put('/countries/:id', authenticateToken, requireAdmin, updateCountry);
// router.delete('/countries/:id', authenticateToken, requireAdmin, deleteCountry);

// Gestión de roles
// router.get('/roles', authenticateToken, requireAdmin, getRoles);
// router.post('/roles', authenticateToken, requireAdmin, createRole);
// router.put('/roles/:id', authenticateToken, requireAdmin, updateRole);
// router.delete('/roles/:id', authenticateToken, requireAdmin, deleteRole);

export default router;
