import { Router } from 'express';

const router = Router();

// GET /api/users/profile
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    message: 'User profile endpoint - En desarrollo'
  });
});

export { router as userRoutes };
