import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { emailService } from '../services/emailService';
import { backgroundEmailProcessor } from '../services/backgroundEmailProcessor';

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

      // TODO: Add email verification logic when the email_verified column is added to the database
      // For now, we'll skip this check

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
        VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
        RETURNING user_id, username, email, first_name, last_name
      `;

      const result = await client.query(createUserQuery, [
        firstName,
        lastName,
        username,
        email,
        hashedPassword,
        'user' // Default role as string
      ]);

      const newUser = result.rows[0];

      // Crear token de verificación y enviar email
      try {
        const verificationToken = await emailService.createVerificationToken(newUser.user_id, newUser.email);
        await emailService.sendVerificationEmail(newUser.email, newUser.first_name, verificationToken);
        
        console.log('📧 Email de verificación enviado a:', newUser.email);
      } catch (emailError) {
        console.error('❌ Error al enviar email de verificación:', emailError);
        // No fallar el registro por error de email, solo loggearlo
      }

      return res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente. Se ha enviado un email de verificación a tu correo.',
        user: {
          userId: newUser.user_id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          isActive: true,
          emailVerified: true, // TODO: Set to false when email verification is implemented
          role: {
            roleName: 'user'
          }
        },
        requiresEmailVerification: true
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
                SELECT u.user_id, u.first_name, u.last_name, u.username, u.email, u.role, u.is_active, u.avatar_url
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

            // Check if user has OAuth providers
            const oauthQuery = `
                SELECT provider_name
                FROM auth_providers
                WHERE user_id = $1
            `;
            const oauthResult = await client.query(oauthQuery, [user.user_id]);
            const oauthProviders = oauthResult.rows.map(row => row.provider_name);

            return res.json({
                userId: user.user_id,
                username: user.username,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                isActive: user.is_active,
                avatarUrl: user.avatar_url,
                role: {
                    roleName: user.role
                },
                authProviders: oauthProviders,
                isOAuthUser: oauthProviders.length > 0
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

// OAuth Providers endpoints
export const getOAuthProviders = async (req: Request, res: Response) => {
    try {
        // Return static list of OAuth providers with their status
        const providers = [
            {
                id: 'google',
                name: 'Google',
                displayName: 'Google',
                isActive: true,
                clientId: process.env.GOOGLE_CLIENT_ID ? 'configured' : null,
                authUrl: '/api/auth/google',
                scopes: ['profile', 'email']
            },
            {
                id: 'microsoft',
                name: 'Microsoft',
                displayName: 'Microsoft',
                isActive: !!process.env.MICROSOFT_CLIENT_ID,
                clientId: process.env.MICROSOFT_CLIENT_ID ? 'configured' : null,
                authUrl: '/api/auth/microsoft',
                scopes: ['profile', 'email']
            },
            {
                id: 'apple',
                name: 'Apple',
                displayName: 'Apple',
                isActive: !!process.env.APPLE_CLIENT_ID,
                clientId: process.env.APPLE_CLIENT_ID ? 'configured' : null,
                authUrl: '/api/auth/apple',
                scopes: ['profile', 'email']
            }
        ];

        res.json(providers.filter(p => p.isActive));
    } catch (error) {
        console.error('Error getting OAuth providers:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener proveedores OAuth'
        });
    }
};

// Session management endpoints
export const getSessions = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as any;
        
        // For now, return a mock session list since we don't have session storage implemented
        // This matches what the frontend expects
        const mockSessions = [
            {
                sessionId: 'current-session',
                deviceInfo: 'Current Browser',
                ipAddress: req.ip || '127.0.0.1',
                location: 'Unknown',
                lastActivity: new Date().toISOString(),
                isCurrentSession: true,
                createdAt: new Date().toISOString()
            }
        ];

        res.json(mockSessions);
    } catch (error) {
        console.error('Error getting sessions:', error);
        res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }
};

export const revokeSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sessionId } = req.params;
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
            return;
        }

        jwt.verify(token, JWT_SECRET);
        
        // For now, just return success since we don't have session storage implemented
        res.json({
            success: true,
            message: 'Sesión revocada exitosamente'
        });
    } catch (error) {
        console.error('Error revoking session:', error);
        res.status(500).json({
            success: false,
            message: 'Error al revocar sesión'
        });
    }
};

export const revokeAllSessions = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
            return;
        }

        jwt.verify(token, JWT_SECRET);
        
        // For now, just return success since we don't have session storage implemented
        res.json({
            success: true,
            message: 'Todas las sesiones han sido revocadas'
        });
    } catch (error) {
        console.error('Error revoking all sessions:', error);
        res.status(500).json({
            success: false,
            message: 'Error al revocar todas las sesiones'
        });
    }
};

// Email verification endpoints
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token de verificación es requerido'
      });
    }

    const result = await emailService.verifyEmailToken(token, ipAddress, userAgent);

    if (result.success) {
      return res.json({
        success: true,
        message: result.message,
        user: {
          userId: result.userId,
          email: result.email,
          emailVerified: true
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

  } catch (error) {
    console.error('Error en verificación de email:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { userId, email } = req.body;

    if (!userId && !email) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere userId o email'
      });
    }

    let targetUserId = userId;

    // Si solo se proporciona email, buscar el userId
    if (!targetUserId && email) {
      const client = await pool.connect();
      try {
        const userQuery = 'SELECT user_id, email_verified FROM users WHERE email = $1';
        const userResult = await client.query(userQuery, [email]);
        
        if (userResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Usuario no encontrado'
          });
        }

        const user = userResult.rows[0];
        if (user.email_verified) {
          return res.status(400).json({
            success: false,
            message: 'El email ya está verificado'
          });
        }

        targetUserId = user.user_id;
      } finally {
        client.release();
      }
    }

    await emailService.resendVerificationEmail(targetUserId);

    return res.json({
      success: true,
      message: 'Email de verificación reenviado exitosamente'
    });

  } catch (error) {
    console.error('Error al reenviar email de verificación:', error);
    if ((error as any).statusCode) {
      return res.status((error as any).statusCode).json({
        success: false,
        message: (error as any).message
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const getEmailQueueStats = async (req: Request, res: Response) => {
  try {
    // Verificar que el usuario sea admin
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Solo admins pueden ver estadísticas de cola
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado'
      });
    }

    const stats = await emailService.getQueueStats();
    const processorStatus = backgroundEmailProcessor.getStatus();
    const healthCheck = await backgroundEmailProcessor.healthCheck();

    return res.json({
      success: true,
      data: {
        queueStats: stats,
        processorStatus,
        healthCheck
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de cola:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const processEmailQueueManually = async (req: Request, res: Response) => {
  try {
    // Verificar que el usuario sea admin
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Solo admins pueden procesar la cola manualmente
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado'
      });
    }

    await backgroundEmailProcessor.processNow();

    return res.json({
      success: true,
      message: 'Procesamiento de cola iniciado'
    });

  } catch (error) {
    console.error('Error al procesar cola manualmente:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const testEmailConnection = async (req: Request, res: Response) => {
  try {
    // Verificar que el usuario sea admin
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Solo admins pueden testear la conexión
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado'
      });
    }

    const isConnected = await emailService.verifyConnection();
    const config = emailService.getConfig();

    return res.json({
      success: true,
      data: {
        connected: isConnected,
        config: {
          smtp: {
            host: config.smtp.host,
            port: config.smtp.port,
            secure: config.smtp.secure,
            user: config.smtp.auth.user,
            fromName: config.smtp.fromName,
            fromEmail: config.smtp.fromEmail
          },
          queue: config.queue
        }
      }
    });

  } catch (error) {
    console.error('Error al testear conexión de email:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Debug endpoint to check table structure
export const checkTableStructure = async (req: Request, res: Response) => {
  try {
    const client = await pool.connect();
    try {
      // Check the structure of users table
      const result = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position;
      `);
      
      return res.json({
        success: true,
        columns: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error checking table structure:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};