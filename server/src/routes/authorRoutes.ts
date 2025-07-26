import { Router, Request, Response } from 'express';
import { pool } from '../config/database';

const router = Router();

// GET /api/authors - Obtener autores con paginación
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    const client = await pool.connect();
    try {
      let query = `
        SELECT 
          author_id as "authorId",
          author_name as "authorName",
          biography,
          birth_date as "birthDate",
          country,
          website_url as "websiteUrl",
          image_url as "imageUrl",
          is_active as "isActive",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM authors 
      `;
      
      let countQuery = 'SELECT COUNT(*) FROM authors';
      let params: any[] = [];
      
      if (search) {
        query += ' WHERE author_name ILIKE $1';
        countQuery += ' WHERE author_name ILIKE $1';
        params.push(`%${search}%`);
      }
      
      query += ` ORDER BY author_name LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
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
    console.error('Error al obtener autores:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/authors/search - Buscar autores para autocompletado
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Query de búsqueda requerido'
      });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT
          author_id as "authorId",
          author_name as "authorName"
        FROM authors
        WHERE author_name ILIKE $1 AND is_active = true
        ORDER BY author_name
        LIMIT $2
      `, [`%${query}%`, Number(limit)]);

      return res.json({
        success: true,
        data: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al buscar autores:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/authors/:id - Obtener autor por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          author_id as "authorId",
          author_name as "authorName",
          biography,
          birth_date as "birthDate",
          country,
          website_url as "websiteUrl",
          image_url as "imageUrl",
          is_active as "isActive",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM authors 
        WHERE author_id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Autor no encontrado'
        });
      }
      
      return res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al obtener autor:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/authors - Crear nuevo autor
router.post('/', async (req: Request, res: Response) => {
  try {
    const { 
      authorName, 
      biography, 
      birthDate, 
      country, 
      websiteUrl, 
      imageUrl 
    } = req.body;
    
    if (!authorName) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del autor es requerido'
      });
    }
    
    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO authors (
          author_name, 
          biography, 
          birth_date, 
          country, 
          website_url, 
          image_url,
          is_active,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
        RETURNING 
          author_id as "authorId",
          author_name as "authorName",
          biography,
          birth_date as "birthDate",
          country,
          website_url as "websiteUrl",
          image_url as "imageUrl",
          is_active as "isActive",
          created_at as "createdAt",
          updated_at as "updatedAt"
      `, [
        authorName, 
        biography || null, 
        birthDate || null, 
        country || null, 
        websiteUrl || null, 
        imageUrl || null
      ]);
      
      return res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Autor creado exitosamente'
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error al crear autor:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/authors/:id - Actualizar autor
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      authorName, 
      biography, 
      birthDate, 
      country, 
      websiteUrl, 
      imageUrl 
    } = req.body;
    
    if (!authorName) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del autor es requerido'
      });
    }
    
    const client = await pool.connect();
    try {
      const result = await client.query(`
        UPDATE authors 
        SET 
          author_name = $1,
          biography = $2,
          birth_date = $3,
          country = $4,
          website_url = $5,
          image_url = $6,
          updated_at = NOW()
        WHERE author_id = $7
        RETURNING 
          author_id as "authorId",
          author_name as "authorName",
          biography,
          birth_date as "birthDate",
          country,
          website_url as "websiteUrl",
          image_url as "imageUrl",
          is_active as "isActive",
          created_at as "createdAt",
          updated_at as "updatedAt"
      `, [
        authorName, 
        biography || null, 
        birthDate || null, 
        country || null, 
        websiteUrl || null, 
        imageUrl || null,
        id
      ]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Autor no encontrado'
        });
      }
      
      return res.json({
        success: true,
        data: result.rows[0],
        message: 'Autor actualizado exitosamente'
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error al actualizar autor:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE /api/authors/:id - Eliminar autor
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    try {
      const result = await client.query(`
        DELETE FROM authors 
        WHERE author_id = $1
        RETURNING author_id
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Autor no encontrado'
        });
      }
      
      return res.json({
        success: true,
        message: 'Autor eliminado exitosamente'
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error al eliminar autor:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

export { router as authorRoutes };
