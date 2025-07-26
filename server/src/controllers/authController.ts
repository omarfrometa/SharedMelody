import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'shared-melody-secret-key-2024';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    console.log(`[AUTH DEBUG] Intentando login para el usuario: ${username}`);

    if (!username || !password) {
      console.log('[AUTH DEBUG] Error: Faltan usuario o contraseña.');
      return res.status(400).json({
        success: false,
        message: 'Username y password son requeridos'
      });
    }

    const client = await pool.connect();
    try {
      const userQuery = `
        SELECT u.user_id, u.first_name, u.last_name, u.username, u.email, u.password_hash, u.role, u.is_active
        FROM users u
        WHERE (u.username = $1 OR u.email = $1)
      `;
      const userResult = await client.query(userQuery, [username]);
      console.log(`[AUTH DEBUG] Se encontraron ${userResult.rows.length} usuarios con ese nombre de usuario/email.`);

      if (userResult.rows.length === 0) {
        console.log('[AUTH DEBUG] Error: Usuario no encontrado.');
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      const user = userResult.rows[0];
      console.log('[AUTH DEBUG] Usuario encontrado:', { userId: user.user_id, username: user.username, isActive: user.is_active });

      if (!user.is_active) {
        console.log('[AUTH DEBUG] Error: La cuenta del usuario no está activa.');
        return res.status(401).json({
          success: false,
          message: 'Cuenta desactivada'
        });
      }

      if (!user.password_hash) {
        console.log('[AUTH DEBUG] Error: El usuario no tiene un hash de contraseña (probablemente es una cuenta de OAuth).');
        return res.status(401).json({
            success: false,
            message: 'La cuenta no tiene una contraseña configurada. Intente iniciar sesión con un proveedor de OAuth.'
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      console.log(`[AUTH DEBUG] La comparación de la contraseña es: ${isPasswordValid}`);
      if (!isPasswordValid) {
        console.log('[AUTH DEBUG] Error: La contraseña es inválida.');
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      await client.query(
        'UPDATE users SET last_login = NOW() WHERE user_id = $1',
        [user.user_id]
      );

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
    console.error('[AUTH DEBUG] Error catastrófico en el bloque de login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, username, email, password, confirmPassword } = req.body;

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

      const hashedPassword = await bcrypt.hash(password, 12);
      
      const defaultRoleResult = await client.query("SELECT role_id FROM user_roles WHERE role_name = 'user'");
      if (defaultRoleResult.rows.length === 0) {
          throw new Error("Default 'user' role not found in user_roles table.");
      }
      const defaultRoleId = defaultRoleResult.rows[0].role_id;

      const createUserQuery = `
        INSERT INTO users (
          first_name,
          last_name,
          username,
          email,
          password_hash,
          role_id,
          is_active,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
        RETURNING user_id, username, email, first_name, last_name
      `;

      const result = await client.query(createUserQuery, [
        firstName,
        lastName,
        username,
        email,
        hashedPassword,
        defaultRoleId
      ]);

      const newUser = result.rows[0];

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
};

export const getMe = async (req: Request, res: Response) => {
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
                SELECT u.user_id, u.first_name, u.last_name, u.username, u.email, u.role, u.is_active
                FROM users u
                WHERE u.user_id = $1 AND u.is_active = true
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
};

export const logout = (req: Request, res: Response) => {
    return res.json({
        success: true,
        message: 'Logout exitoso'
    });
};