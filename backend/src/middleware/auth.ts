import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';

// Los tipos están definidos en src/types/express.d.ts

const JWT_SECRET = process.env.JWT_SECRET || 'shared-melody-secret-key-2024';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
      return;
    }

    // Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Verificar que el usuario existe y está activo
    const client = await pool.connect();
    try {
      const userQuery = `
        SELECT user_id, username, email, role, is_active
        FROM users
        WHERE user_id = $1 AND is_active = true
      `;
      const userResult = await client.query(userQuery, [decoded.userId]);

      if (userResult.rows.length === 0) {
        res.status(401).json({
          success: false,
          message: 'Usuario no encontrado o inactivo'
        });
        return;
      }

      const user = userResult.rows[0];

      // Agregar información del usuario al request
      req.user = {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role
      };

      next();
    } finally {
      client.release();
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
      return;
    }

    console.error('Error en autenticación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
    return;
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No hay token, continuar sin autenticación
      return next();
    }

    // Verificar el token si existe
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Verificar que el usuario existe y está activo
    const client = await pool.connect();
    try {
      const userQuery = `
        SELECT user_id, username, email, role, is_active
        FROM users
        WHERE user_id = $1 AND is_active = true
      `;
      const userResult = await client.query(userQuery, [decoded.userId]);

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        req.user = {
          userId: user.user_id,
          username: user.username,
          email: user.email,
          role: user.role
        };
      }
    } finally {
      client.release();
    }

    next();
  } catch (error) {
    // Si hay error en el token opcional, continuar sin autenticación
    next();
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Autenticación requerida'
    });
    return;
  }

  if ((req.user as any).role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Permisos de administrador requeridos'
    });
    return;
  }

  next();
};

export const requireOwnerOrAdmin = (userIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
    if ((req.user as any).role === 'admin' || (req.user as any).userId.toString() === resourceUserId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'No tienes permisos para acceder a este recurso'
    });
  };
};
