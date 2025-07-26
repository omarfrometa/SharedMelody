import { Router, Request, Response } from 'express';
import { pool } from '../config/database';

const router = Router();

// GET /api/genres/all - Obtener todos los géneros sin paginación
router.get('/all', async (req: Request, res: Response) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT
          genre_id as "genreId",
          name as "genreName",
          description as "genreDescription",
          parent_genre_id as "parentGenreId"
        FROM genres
        ORDER BY name
      `);
      
      return res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al obtener géneros:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/genres - Obtener géneros con paginación
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    const client = await pool.connect();
    try {
      let query = `
        SELECT
          genre_id as "genreId",
          name as "genreName",
          description as "genreDescription",
          parent_genre_id as "parentGenreId"
        FROM genres
      `;

      let countQuery = 'SELECT COUNT(*) FROM genres';
      let params: any[] = [];
      
      if (search) {
        query += ' WHERE name ILIKE $1';
        countQuery += ' WHERE name ILIKE $1';
        params.push(`%${search}%`);
      }

      query += ` ORDER BY name LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(Number(limit), offset);
      
      const [result, countResult] = await Promise.all([
        client.query(query, params),
        client.query(countQuery, search ? [`%${search}%`] : [])
      ]);
      
      const total = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(total / Number(limit));
      
      return res.json({
        data: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al obtener géneros:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/genres/:id - Obtener género por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT
          genre_id as "genreId",
          name as "genreName",
          description as "genreDescription",
          parent_genre_id as "parentGenreId"
        FROM genres
        WHERE genre_id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Género no encontrado'
        });
      }
      
      return res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al obtener género:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/genres - Crear nuevo género
router.post('/', async (req: Request, res: Response) => {
  try {
    const { genreName, genreDescription, parentGenreId } = req.body;
    
    if (!genreName) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del género es requerido'
      });
    }
    
    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO genres (name, description, parent_genre_id)
        VALUES ($1, $2, $3)
        RETURNING
          genre_id as "genreId",
          name as "genreName",
          description as "genreDescription",
          parent_genre_id as "parentGenreId"
      `, [genreName, genreDescription, parentGenreId || null]);
      
      return res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Género creado exitosamente'
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error al crear género:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({
        success: false,
        message: 'Ya existe un género con ese nombre'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

export { router as genreRoutes };
