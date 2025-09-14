import pool from '../config/database';
import fs from 'fs';
import path from 'path';

async function setupRatingTables() {
  try {
    console.log('🚀 Iniciando setup de tablas de rating...');

    // Leer el script SQL de rating tables
    const sqlFilePath = path.join(__dirname, '../../../database/rating_tables.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    // Ejecutar el script
    await pool.query(sqlScript);

    console.log('✅ Tablas de rating creadas exitosamente');

    // Verificar que las tablas fueron creadas
    const checkTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('song_ratings', 'song_likes')
    `);

    console.log('📋 Tablas encontradas:', checkTables.rows.map(row => row.table_name));

    // Verificar estructura de las tablas
    const ratingTableStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'song_ratings'
      ORDER BY ordinal_position
    `);

    console.log('📊 Estructura de song_ratings:');
    ratingTableStructure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    const likesTableStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'song_likes'
      ORDER BY ordinal_position
    `);

    console.log('📊 Estructura de song_likes:');
    likesTableStructure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

  } catch (error) {
    console.error('❌ Error al setup tablas de rating:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupRatingTables()
    .then(() => {
      console.log('🎉 Setup completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en setup:', error);
      process.exit(1);
    });
}

export default setupRatingTables;