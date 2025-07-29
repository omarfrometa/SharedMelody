import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';

// =============================================
// CONTROLADOR DE ADMINISTRACIÓN
// =============================================

// Obtener estadísticas del dashboard
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await pool.connect();
    
    try {
      // Estadísticas de usuarios
      const usersQuery = `
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active,
          COUNT(CASE WHEN registration_date >= NOW() - INTERVAL '30 days' THEN 1 END) as new_this_month
        FROM users
      `;
      const usersResult = await client.query(usersQuery);
      const usersStats = usersResult.rows[0];

      // Usuarios por rol
      const usersByRoleQuery = `
        SELECT role, COUNT(user_id) as count
        FROM users
        GROUP BY role
      `;
      const usersByRoleResult = await client.query(usersByRoleQuery);
      const byRole: Record<string, number> = {};
      usersByRoleResult.rows.forEach(row => {
        byRole[row.role] = parseInt(row.count);
      });

      // Usuarios por país
      const usersByCountryQuery = `
        SELECT country, COUNT(user_id) as count
        FROM users
        WHERE country IS NOT NULL
        GROUP BY country
        ORDER BY count DESC
        LIMIT 5
      `;
      const usersByCountryResult = await client.query(usersByCountryQuery);
      const byCountry: Record<string, number> = {};
      usersByCountryResult.rows.forEach(row => {
        byCountry[row.country] = parseInt(row.count);
      });

      // Estadísticas de canciones
      const songsQuery = `
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'accepted' THEN 1 END) as approved,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
          COUNT(CASE WHEN upload_date >= NOW() - INTERVAL '30 days' THEN 1 END) as new_this_month
        FROM songs
      `;
      const songsResult = await client.query(songsQuery);
      const songsStats = songsResult.rows[0];

      // Canciones por género
      const songsByGenreQuery = `
        SELECT g.name, COUNT(s.song_id) as count
        FROM genres g
        LEFT JOIN songs s ON g.genre_id = s.genre_id
        GROUP BY g.name
        ORDER BY count DESC
        LIMIT 10
      `;
      const songsByGenreResult = await client.query(songsByGenreQuery);
      const byGenre: Record<string, number> = {};
      songsByGenreResult.rows.forEach(row => {
        byGenre[row.name] = parseInt(row.count);
      });

      // Canciones por tipo
      const songsByTypeQuery = `
        SELECT st.name, COUNT(s.song_id) as count
        FROM song_types st
        LEFT JOIN songs s ON st.type_id = s.type_id
        GROUP BY st.name
      `;
      const songsByTypeResult = await client.query(songsByTypeQuery);
      const byType: Record<string, number> = {};
      songsByTypeResult.rows.forEach(row => {
        byType[row.name] = parseInt(row.count);
      });

      // Estadísticas de solicitudes
      const requestsQuery = `
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'fulfilled' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'canceled' THEN 1 END) as rejected,
          COUNT(CASE WHEN request_date >= NOW() - INTERVAL '30 days' THEN 1 END) as new_this_month
        FROM requests
      `;
      const requestsResult = await client.query(requestsQuery);
      const requestsStats = requestsResult.rows[0];

      // Calcular tasa de completitud
      const completionRate = requestsStats.total > 0 
        ? (parseInt(requestsStats.completed) / parseInt(requestsStats.total)) * 100 
        : 0;

      // Estadísticas del sistema
      const systemStats = {
        totalStorage: 50000000000, // 50GB - placeholder
        usedStorage: 12500000000,  // 12.5GB - placeholder
        emailsSent: 0, // placeholder
        emailsFailed: 0, // placeholder
        activeSessions: 0 // placeholder
      };

      const dashboardStats = {
        users: {
          total: parseInt(usersStats.total),
          active: parseInt(usersStats.active),
          newThisMonth: parseInt(usersStats.new_this_month),
          byRole,
          byCountry
        },
        songs: {
          total: parseInt(songsStats.total),
          approved: parseInt(songsStats.approved),
          pending: parseInt(songsStats.pending),
          rejected: parseInt(songsStats.rejected),
          newThisMonth: parseInt(songsStats.new_this_month),
          byGenre,
          byType,
          totalViews: 0, // placeholder
          totalDownloads: 0, // placeholder
          totalLikes: 0 // placeholder
        },
        requests: {
          total: parseInt(requestsStats.total),
          pending: parseInt(requestsStats.pending),
          completed: parseInt(requestsStats.completed),
          rejected: parseInt(requestsStats.rejected),
          newThisMonth: parseInt(requestsStats.new_this_month),
          completionRate: Math.round(completionRate * 100) / 100,
          averageCompletionTime: 7.2 // placeholder
        },
        collaborations: {
          total: 0, // placeholder
          activeUsers: 0, // placeholder
          byType: {} // placeholder
        },
        system: systemStats
      };

      res.json({
        success: true,
        data: dashboardStats,
        message: 'Estadísticas del dashboard obtenidas exitosamente'
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    next(error);
  }
};

// Obtener usuarios con filtros
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      search,
      roleId,
      countryId,
      isActive,
      emailVerified,
      page = 1,
      limit = 25,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const client = await pool.connect();
    
    try {
      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      // Construir condiciones WHERE
      if (search) {
        whereConditions.push(`(
          u.first_name ILIKE $${paramIndex} OR
          u.last_name ILIKE $${paramIndex} OR
          u.email ILIKE $${paramIndex} OR
          u.username ILIKE $${paramIndex}
        )`);
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      if (roleId) {
        whereConditions.push(`u.role = $${paramIndex}`);
        queryParams.push(roleId);
        paramIndex++;
      }

      if (countryId) {
        whereConditions.push(`u.country = $${paramIndex}`);
        queryParams.push(countryId);
        paramIndex++;
      }

      if (isActive !== undefined) {
        whereConditions.push(`u.is_active = $${paramIndex}`);
        queryParams.push(isActive === 'true');
        paramIndex++;
      }

      // Note: email_verified no existe en la estructura actual, omitimos esta condición
      // if (emailVerified !== undefined) {
      //   whereConditions.push(`u.email_verified = $${paramIndex}`);
      //   queryParams.push(emailVerified === 'true');
      //   paramIndex++;
      // }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      // Validar sortBy
      const validSortFields = ['username', 'email', 'registration_date', 'last_login', 'first_name', 'last_name'];
      const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'registration_date';
      const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

      // Calcular offset
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      // Query principal
      const usersQuery = `
        SELECT
          u.user_id,
          u.first_name,
          u.last_name,
          u.email,
          u.username,
          u.country,
          u.birth_date,
          u.avatar_url,
          u.role,
          u.is_active,
          u.last_login,
          u.registration_date
        FROM users u
        ${whereClause}
        ORDER BY u.${sortField} ${sortDirection}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(parseInt(limit as string), offset);

      const usersResult = await client.query(usersQuery, queryParams);

      // Query para contar total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM users u
        ${whereClause}
      `;

      const countResult = await client.query(countQuery, queryParams.slice(0, -2));
      const total = parseInt(countResult.rows[0].total);

      // Formatear usuarios
      const users = usersResult.rows.map(row => ({
        userId: row.user_id.toString(),
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        username: row.username,
        emailVerified: true, // placeholder - no existe en la BD actual
        countryId: row.country || null,
        country: row.country ? {
          countryId: row.country,
          countryCode: 'XX', // placeholder
          countryName: row.country,
          createdAt: new Date().toISOString()
        } : null,
        phone: null, // no existe en la BD actual
        dateOfBirth: row.birth_date,
        profilePictureUrl: row.avatar_url,
        bio: null, // no existe en la BD actual
        roleId: row.role,
        role: {
          roleId: row.role,
          roleName: row.role,
          roleDescription: row.role === 'admin' ? 'Administrador' : 'Usuario regular',
          permissions: {},
          createdAt: new Date().toISOString()
        },
        isActive: row.is_active,
        lastLogin: row.last_login,
        createdAt: row.registration_date,
        updatedAt: row.registration_date, // placeholder
        authProviders: ['local'], // placeholder
        isOAuthUser: false // placeholder
      }));

      res.json({
        success: true,
        data: users,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string))
        },
        message: `${users.length} usuarios obtenidos exitosamente`
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    next(error);
  }
};
