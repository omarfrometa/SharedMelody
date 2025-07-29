import { Request, Response } from 'express';
import { pool } from '../../config/database';

// Obtener todas las solicitudes con paginación y filtros
export const getRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 25,
      status,
      priority,
      search,
      sortBy = 'request_date',
      sortOrder = 'desc'
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Construir la consulta base
    let baseQuery = `
      SELECT
        r.request_id,
        r.title,
        r.artist,
        r.request_date,
        r.status,
        r.priority,
        r.fulfilled_date,
        u.first_name || ' ' || u.last_name as requester_name,
        u.username as requester_username,
        u.email as requester_email,
        fb.first_name || ' ' || fb.last_name as fulfilled_by_name,
        fb.username as fulfilled_by_username,
        s.title as fulfilled_song_title
      FROM requests r
      LEFT JOIN users u ON r.user_id = u.user_id
      LEFT JOIN users fb ON r.fulfilled_by = fb.user_id
      LEFT JOIN songs s ON r.fulfilled_with = s.song_id
    `;

    let countQuery = `
      SELECT COUNT(*) as total
      FROM requests r
      LEFT JOIN users u ON r.user_id = u.user_id
    `;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Filtros
    if (status) {
      conditions.push(`r.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (priority) {
      conditions.push(`r.priority = $${paramIndex}`);
      params.push(priority);
      paramIndex++;
    }

    if (search) {
      conditions.push(`(
        r.title ILIKE $${paramIndex} OR
        r.artist ILIKE $${paramIndex} OR
        u.first_name ILIKE $${paramIndex} OR
        u.last_name ILIKE $${paramIndex} OR
        u.username ILIKE $${paramIndex} OR
        u.email ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Agregar condiciones WHERE si existen
    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(' AND ')}`;
      baseQuery += whereClause;
      countQuery += whereClause;
    }

    // Ordenamiento
    const validSortFields = ['request_date', 'title', 'artist', 'status', 'priority'];
    const validSortOrders = ['asc', 'desc'];

    const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'request_date';
    const order = validSortOrders.includes(sortOrder as string) ? sortOrder : 'desc';

    baseQuery += ` ORDER BY r.${sortField} ${(order as string).toUpperCase()}`;

    // Paginación
    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), offset);

    // Ejecutar consultas
    const [requestsResult, countResult] = await Promise.all([
      pool.query(baseQuery, params),
      pool.query(countQuery, params.slice(0, -2)) // Excluir limit y offset del conteo
    ]);

    const requests = requestsResult.rows;
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      },
      message: 'Solicitudes obtenidas exitosamente'
    });

  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener solicitudes'
    });
  }
};

// Obtener una solicitud específica
export const getRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        r.*,
        u.first_name || ' ' || u.last_name as requester_name,
        u.username as requester_username,
        u.email as requester_email,
        fb.first_name || ' ' || fb.last_name as fulfilled_by_name,
        fb.username as fulfilled_by_username,
        s.title as fulfilled_song_title,
        s.song_id as fulfilled_song_id
      FROM requests r
      LEFT JOIN users u ON r.user_id = u.user_id
      LEFT JOIN users fb ON r.fulfilled_by = fb.user_id
      LEFT JOIN songs s ON r.fulfilled_with = s.song_id
      WHERE r.request_id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
      return;
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Solicitud obtenida exitosamente'
    });

  } catch (error) {
    console.error('Error al obtener solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener la solicitud'
    });
  }
};

// Actualizar el estado de una solicitud
export const updateRequestStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, fulfilled_with, priority } = req.body;
    const adminUserId = (req.user as any)?.user_id;

    // Validar estado
    const validStatuses = ['pending', 'fulfilled', 'canceled'];
    if (status && !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Estado inválido'
      });
      return;
    }

    // Validar prioridad
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (priority && !validPriorities.includes(priority)) {
      res.status(400).json({
        success: false,
        message: 'Prioridad inválida'
      });
      return;
    }

    // Construir la consulta de actualización
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      updates.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;

      if (status === 'fulfilled') {
        updates.push(`fulfilled_by = $${paramIndex}`);
        params.push(adminUserId);
        paramIndex++;

        updates.push(`fulfilled_date = CURRENT_TIMESTAMP`);

        if (fulfilled_with) {
          updates.push(`fulfilled_with = $${paramIndex}`);
          params.push(fulfilled_with);
          paramIndex++;
        }
      }
    }

    if (priority) {
      updates.push(`priority = $${paramIndex}`);
      params.push(priority);
      paramIndex++;
    }

    if (updates.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
      return;
    }

    const query = `
      UPDATE requests
      SET ${updates.join(', ')}
      WHERE request_id = $${paramIndex}
      RETURNING *
    `;
    params.push(id);

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
      return;
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Solicitud actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar la solicitud'
    });
  }
};

// Eliminar una solicitud
export const deleteRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM requests WHERE request_id = $1 RETURNING *';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Solicitud eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar la solicitud'
    });
  }
};
