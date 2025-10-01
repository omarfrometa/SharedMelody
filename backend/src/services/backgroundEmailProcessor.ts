import { emailService } from './emailService';

export class BackgroundEmailProcessor {
  private interval: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private readonly intervalMs: number;
  private readonly enableProcessing: boolean;

  constructor() {
    this.intervalMs = parseInt(process.env.EMAIL_QUEUE_PROCESSING_INTERVAL_SECONDS || '60') * 1000;
    this.enableProcessing = process.env.EMAIL_QUEUE_ENABLE_BACKGROUND_PROCESSING === 'true';
  }

  // Iniciar el procesamiento en background
  start(): void {
    if (!this.enableProcessing) {
      console.log('⏸️ Procesamiento de cola de emails deshabilitado por configuración');
      return;
    }

    if (this.interval) {
      console.log('⚠️ El procesador de emails ya está ejecutándose');
      return;
    }

    console.log(`🚀 Iniciando procesador de cola de emails (intervalo: ${this.intervalMs / 1000}s)`);

    // Procesar inmediatamente al iniciar
    this.processQueue();

    // Configurar procesamiento periódico
    this.interval = setInterval(() => {
      this.processQueue();
    }, this.intervalMs);

    // Configurar limpieza periódica de tokens (cada hora)
    setInterval(() => {
      this.cleanupExpiredTokens();
    }, 60 * 60 * 1000); // 1 hora
  }

  // Detener el procesamiento en background
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('⏹️ Procesador de cola de emails detenido');
    }
  }

  // Procesar la cola (método privado para uso interno)
  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      console.log('🔄 Ya hay un procesamiento en curso, saltando...');
      return;
    }

    this.isProcessing = true;

    try {
      await emailService.processEmailQueue();
    } catch (error) {
      console.error('❌ Error en procesamiento de cola de emails:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Limpiar tokens expirados
  private async cleanupExpiredTokens(): Promise<void> {
    try {
      const deletedCount = await emailService.cleanupExpiredTokens();
      if (deletedCount > 0) {
        console.log(`🧹 Limpieza automática: ${deletedCount} tokens expirados eliminados`);
      }
    } catch (error) {
      console.error('❌ Error en limpieza de tokens:', error);
    }
  }

  // Procesar cola manualmente (para uso en endpoints)
  async processNow(): Promise<void> {
    console.log('🔄 Procesamiento manual de cola solicitado');
    await this.processQueue();
  }

  // Obtener estado del procesador
  getStatus(): {
    isRunning: boolean;
    isProcessing: boolean;
    intervalMs: number;
    enableProcessing: boolean;
  } {
    return {
      isRunning: this.interval !== null,
      isProcessing: this.isProcessing,
      intervalMs: this.intervalMs,
      enableProcessing: this.enableProcessing
    };
  }

  // Verificar conexión SMTP
  async healthCheck(): Promise<{
    smtp: boolean;
    processing: boolean;
    lastProcessing?: Date;
  }> {
    try {
      const smtpStatus = await emailService.verifyConnection();
      
      return {
        smtp: smtpStatus,
        processing: this.interval !== null,
        lastProcessing: this.isProcessing ? new Date() : undefined
      };
    } catch (error) {
      return {
        smtp: false,
        processing: false
      };
    }
  }
}

// Instancia singleton del procesador
export const backgroundEmailProcessor = new BackgroundEmailProcessor();