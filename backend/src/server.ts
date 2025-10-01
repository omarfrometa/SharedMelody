import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from './config/passport';
import { testConnection } from './config/database';
import { setupRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { captureClientIP, logImportantRequest } from './middleware/ipCapture';
import { backgroundEmailProcessor } from './services/backgroundEmailProcessor';
import { emailService } from './services/emailService';

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
  origin: process.env.FRONTEND_URL || 'https://sharedmelody.com:3000',
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

// Configuración de Sesión
app.use(session({
    secret: process.env.SESSION_SECRET || 'a-secret-key-for-session',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Inicialización de Passport
app.use(passport.initialize());
app.use(passport.session());

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

    // Inicializar servicios de email
    try {
      console.log('📧 Inicializando servicios de email...');
      
      // Verificar conexión SMTP
      const smtpConnected = await emailService.verifyConnection();
      if (smtpConnected) {
        console.log('✅ Conexión SMTP verificada exitosamente');
      } else {
        console.log('⚠️ Conexión SMTP falló, pero el servidor continuará');
      }
      
      // Iniciar procesador de cola de emails
      backgroundEmailProcessor.start();
      console.log('🔄 Procesador de cola de emails iniciado');
      
    } catch (emailError) {
      console.error('⚠️ Error al inicializar servicios de email:', emailError);
      console.log('🔄 El servidor continuará sin servicios de email');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API disponible en: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`📧 Email queue processing: ${process.env.EMAIL_QUEUE_ENABLE_BACKGROUND_PROCESSING === 'true' ? 'ENABLED' : 'DISABLED'}`);
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recibido, cerrando servidor...');
  backgroundEmailProcessor.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recibido, cerrando servidor...');
  backgroundEmailProcessor.stop();
  process.exit(0);
});

// Iniciar servidor
startServer();

export default app;
