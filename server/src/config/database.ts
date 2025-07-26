import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de la base de datos
const dbConfig: PoolConfig = {
  host: process.env.DB_HOST || '154.12.227.234',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'sharedmelody_db',
  user: process.env.DB_USER || 'postgresroot',
  password: process.env.DB_PASSWORD || '69dMb7HBjJLL',
  max: parseInt(process.env.DB_POOL_MAX || '20'),
  min: parseInt(process.env.DB_POOL_MIN || '0'),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '10000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Pool de conexiones
export const pool = new Pool(dbConfig);

// Función para probar la conexión
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    return false;
  }
};

// Función para cerrar el pool
export const closePool = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('🔌 Pool de conexiones cerrado');
  } catch (error) {
    console.error('Error al cerrar el pool:', error);
  }
};

// Manejo de eventos del pool
pool.on('connect', () => {
  console.log('🔗 Nueva conexión establecida con la base de datos');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de conexiones:', err);
  process.exit(-1);
});

export default pool;
