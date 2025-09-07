import { Router } from 'express';
import {
  getRequests,
  getRequestById,
  updateRequestStatus,
  deleteRequest
} from '../../controllers/admin/requestsController';
import { authenticateToken, requireAdmin } from '../../middleware/auth';

const router = Router();

// Aplicar middleware de autenticación y autorización a todas las rutas
router.use(authenticateToken);
router.use(requireAdmin);

// Rutas para gestión de solicitudes
router.get('/', getRequests);
router.get('/:id', getRequestById);
router.put('/:id/status', updateRequestStatus);
router.delete('/:id', deleteRequest);

export default router;
