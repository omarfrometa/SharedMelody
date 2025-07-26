import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import { setupRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { captureClientIP, logImportantRequest } from './middleware/ipCapture';

// Cargar variables de entorno
dotenv.config();
console.log('🔧 Puerto configurado:', process.env.PORT);
console.log('🔧 Archivo .env cargado desde:', process.cwd());

const app = express();
const PORT = process.env.PORT || 3001;

// =============================================
// MIDDLEWARE GLOBAL
// =============================================

// Seguridad
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compresión
app.use(compression());

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Parseo de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Captura de IP del cliente
app.use(captureClientIP);
app.use(logImportantRequest);

// =============================================
// HEALTH CHECK
// =============================================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// =============================================
// RUTAS DE LA API
// =============================================

setupRoutes(app);

// =============================================
// MIDDLEWARE DE MANEJO DE ERRORES
// =============================================

app.use(notFoundHandler);
app.use(errorHandler);

// =============================================
// INICIO DEL SERVIDOR
// =============================================

const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API disponible en: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recibido, cerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
startServer();

export default app;
