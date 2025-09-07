import { Express } from 'express';
import { songRoutes } from './songRoutes';
import { authRoutes } from './authRoutes';
import { userRoutes } from './userRoutes';
import { genreRoutes } from './genreRoutes';
import { authorRoutes } from './authorRoutes';
import statsRoutes from './statsRoutes';
import { favoritesRoutes, publicFavoritesRoutes } from './favoritesRoutes';
import adminRoutes from './adminRoutes';

export const setupRoutes = (app: Express) => {
  // Rutas de la API
  app.use('/api/auth', authRoutes);
  app.use('/api/songs', songRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/genres', genreRoutes);
  app.use('/api/authors', authorRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/favorites', favoritesRoutes);
  app.use('/api/favorites', publicFavoritesRoutes);
  app.use('/api/admin', adminRoutes);

  // Ruta raíz de la API
  app.get('/api', (req, res) => {
    res.json({
      message: 'SharedMelody API',
      version: '1.0.0',
      status: 'active',
      endpoints: {
        auth: '/api/auth',
        songs: '/api/songs',
        users: '/api/users',
        genres: '/api/genres',
        authors: '/api/authors',
        stats: '/api/stats',
        favorites: '/api/favorites',
        admin: '/api/admin',
        health: '/health'
      }
    });
  });
};
