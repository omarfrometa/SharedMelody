import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import * as authController from '../controllers/authController';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'shared-melody-secret-key-2024';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://sharedmelody.com:3000';

// Rutas de autenticación local
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.get('/me', authController.getMe);

// Email verification routes
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationEmail);

// Admin email management routes
router.get('/email/queue-stats', authController.getEmailQueueStats);
router.post('/email/process-queue', authController.processEmailQueueManually);
router.get('/email/test-connection', authController.testEmailConnection);

// Session management routes
router.get('/sessions', authController.getSessions);
router.delete('/sessions/:sessionId', authController.revokeSession);
router.delete('/sessions', authController.revokeAllSessions);

// OAuth provider management routes
router.get('/oauth/providers', authController.getOAuthProviders);

// Debug route to check table structure
router.get('/debug/table-structure', authController.checkTableStructure);

// Rutas de autenticación con Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login?error=google_auth_failed` }),
  (req, res) => {
    // Generar token y redirigir
    const user: any = req.user;
    const token = jwt.sign({ userId: user.user_id, username: user.username, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Rutas de autenticación con Microsoft
router.get('/microsoft', passport.authenticate('microsoft'));

router.get('/microsoft/callback',
  passport.authenticate('microsoft', { failureRedirect: `${FRONTEND_URL}/login?error=microsoft_auth_failed` }),
  (req, res) => {
    const user: any = req.user;
    const token = jwt.sign({ userId: user.user_id, username: user.username, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Rutas de autenticación con Apple
router.get('/apple', passport.authenticate('apple'));

router.post('/apple/callback',
  passport.authenticate('apple', { failureRedirect: `${FRONTEND_URL}/login?error=apple_auth_failed` }),
  (req, res) => {
    const user: any = req.user;
    const token = jwt.sign({ userId: user.user_id, username: user.username, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

export { router as authRoutes };
