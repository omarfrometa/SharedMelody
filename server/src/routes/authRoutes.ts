import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';

const router = Router();

// Clave secreta para JWT (en producción debe estar en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'shared-melody-secret-key-2024';

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username y password son requeridos'
      });
    }

    // Buscar usuario en la base de datos
    const client = await pool.connect();
    try {
      const userQuery = `
        SELECT user_id, first_name, last_name, username, email, password_hash, role, is_active
        FROM users
        WHERE username = $1 OR email = $1
      `;
      const userResult = await client.query(userQuery, [username]);

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      const user = userResult.rows[0];

      // Verificar si el usuario está activo
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Cuenta desactivada'
        });
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Actualizar último login
      await client.query(
        'UPDATE users SET last_login = NOW() WHERE user_id = $1',
        [user.user_id]
      );

      // Generar JWT token
      const token = jwt.sign(
        {
          userId: user.user_id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Respuesta exitosa
      return res.json({
        success: true,
        message: 'Login exitoso',
        user: {
          userId: user.user_id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          isActive: user.is_active,
          role: {
            roleName: user.role
          }
        },
        accessToken: token
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, username, email, password, confirmPassword } = req.body;

    // Validaciones básicas
    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Las contraseñas no coinciden'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const client = await pool.connect();
    try {
      // Verificar si el usuario ya existe
      const existingUserQuery = `
        SELECT user_id FROM users WHERE username = $1 OR email = $2
      `;
      const existingUser = await client.query(existingUserQuery, [username, email]);

      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Usuario o email ya existe'
        });
      }

      // Hashear contraseña
      const hashedPassword = await bcrypt.hash(password, 12);

      // Crear usuario
      const createUserQuery = `
        INSERT INTO users (
          first_name,
          last_name,
          username,
          email,
          password_hash,
          role,
          is_active,
          registration_date
        )
        VALUES ($1, $2, $3, $4, $5, 'user', true, NOW())
        RETURNING user_id, username, email, first_name, last_name
      `;

      const result = await client.query(createUserQuery, [
        firstName,
        lastName,
        username,
        email,
        hashedPassword
      ]);

      const newUser = result.rows[0];

      // Generar JWT token
      const token = jwt.sign(
        {
          userId: newUser.user_id,
          username: newUser.username,
          email: newUser.email,
          role: 'user'
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        user: {
          userId: newUser.user_id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          isActive: true,
          role: {
            roleName: 'user'
          }
        },
        accessToken: token
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'Logout exitoso'
  });
});

// GET /api/auth/me - Obtener usuario actual
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const client = await pool.connect();
    try {
      const userQuery = `
        SELECT user_id, first_name, last_name, username, email, role, is_active
        FROM users
        WHERE user_id = $1 AND is_active = true
      `;
      const userResult = await client.query(userQuery, [decoded.userId]);

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      const user = userResult.rows[0];

      return res.json({
        userId: user.user_id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isActive: user.is_active,
        role: {
          roleName: user.role
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error en /me:', error);
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
});

export { router as authRoutes };
