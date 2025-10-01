import nodemailer from 'nodemailer';
import pool from '../config/database';
import { createError } from '../middleware/errorHandler';
import crypto from 'crypto';

// Interfaces
export interface EmailTemplate {
  subject: string;
  htmlBody: string;
  textBody?: string;
}

export interface EmailQueueItem {
  emailId: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  emailType: string;
  templateData?: any;
  priority: number;
  attempts: number;
  maxAttempts: number;
  userId?: number;
  relatedEntityType?: string;
  relatedEntityId?: number;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  fromName: string;
  fromEmail: string;
}

export interface EmailQueueConfig {
  baseRetryDelayMinutes: number;
  maxRetryAttempts: number;
  processingIntervalSeconds: number;
  batchSize: number;
  enableBackgroundProcessing: boolean;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig;
  private queueConfig: EmailQueueConfig;

  constructor() {
    this.config = {
      host: process.env.SMTP_HOST || 'smtp.office365.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USERNAME || '',
        pass: process.env.SMTP_PASSWORD || ''
      },
      fromName: process.env.SMTP_FROM_NAME || 'Sistema PROBUS',
      fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USERNAME || ''
    };

    this.queueConfig = {
      baseRetryDelayMinutes: parseInt(process.env.EMAIL_QUEUE_BASE_RETRY_DELAY_MINUTES || '1'),
      maxRetryAttempts: parseInt(process.env.EMAIL_QUEUE_MAX_RETRY_ATTEMPTS || '3'),
      processingIntervalSeconds: parseInt(process.env.EMAIL_QUEUE_PROCESSING_INTERVAL_SECONDS || '60'),
      batchSize: parseInt(process.env.EMAIL_QUEUE_BATCH_SIZE || '10'),
      enableBackgroundProcessing: process.env.EMAIL_QUEUE_ENABLE_BACKGROUND_PROCESSING === 'true'
    };

    this.initializeTransporter();
  }

  // Inicializar el transportador SMTP
  private initializeTransporter(): void {
    try {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.auth,
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false
        }
      });

      console.log('📧 Transportador SMTP inicializado:', {
        host: this.config.host,
        port: this.config.port,
        user: this.config.auth.user
      });
    } catch (error) {
      console.error('❌ Error al inicializar transportador SMTP:', error);
    }
  }

  // Verificar conexión SMTP
  async verifyConnection(): Promise<boolean> {
    try {
      if (!this.transporter) {
        throw new Error('Transportador SMTP no inicializado');
      }

      await this.transporter.verify();
      console.log('✅ Conexión SMTP verificada exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error al verificar conexión SMTP:', error);
      return false;
    }
  }

  // Agregar email a la cola
  async queueEmail(emailData: {
    recipientEmail: string;
    recipientName?: string;
    subject: string;
    htmlBody: string;
    textBody?: string;
    emailType: string;
    templateData?: any;
    priority?: number;
    userId?: number;
    relatedEntityType?: string;
    relatedEntityId?: number;
  }): Promise<string> {
    try {
      const query = `
        INSERT INTO email_queue (
          recipient_email, recipient_name, subject, html_body, text_body,
          email_type, template_data, priority, user_id, 
          related_entity_type, related_entity_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING email_id
      `;

      const values = [
        emailData.recipientEmail,
        emailData.recipientName || null,
        emailData.subject,
        emailData.htmlBody,
        emailData.textBody || null,
        emailData.emailType,
        emailData.templateData ? JSON.stringify(emailData.templateData) : null,
        emailData.priority || 5,
        emailData.userId || null,
        emailData.relatedEntityType || null,
        emailData.relatedEntityId || null
      ];

      const result = await pool.query(query, values);
      const emailId = result.rows[0].email_id;

      console.log('📮 Email agregado a la cola:', {
        emailId,
        recipientEmail: emailData.recipientEmail,
        emailType: emailData.emailType
      });

      return emailId;
    } catch (error) {
      console.error('❌ Error al agregar email a la cola:', error);
      throw createError('Error al programar envío de email', 500);
    }
  }

  // Enviar email directamente (sin cola)
  async sendEmailDirect(emailData: {
    recipientEmail: string;
    recipientName?: string;
    subject: string;
    htmlBody: string;
    textBody?: string;
  }): Promise<boolean> {
    try {
      if (!this.transporter) {
        throw new Error('Transportador SMTP no inicializado');
      }

      const mailOptions = {
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to: emailData.recipientName 
          ? `"${emailData.recipientName}" <${emailData.recipientEmail}>`
          : emailData.recipientEmail,
        subject: emailData.subject,
        html: emailData.htmlBody,
        text: emailData.textBody || emailData.htmlBody.replace(/<[^>]*>/g, '')
      };

      const startTime = Date.now();
      const info = await this.transporter.sendMail(mailOptions);
      const processingTime = Date.now() - startTime;

      console.log('✅ Email enviado directamente:', {
        messageId: info.messageId,
        recipientEmail: emailData.recipientEmail,
        processingTime: `${processingTime}ms`
      });

      return true;
    } catch (error) {
      console.error('❌ Error al enviar email directamente:', error);
      return false;
    }
  }

  // Procesar cola de emails
  async processEmailQueue(): Promise<void> {
    try {
      if (!this.transporter) {
        console.log('⚠️ Transportador SMTP no disponible, saltando procesamiento de cola');
        return;
      }

      // Obtener próximos emails a procesar
      const result = await pool.query(
        'SELECT * FROM get_next_emails_to_process($1)',
        [this.queueConfig.batchSize]
      );

      const emails = result.rows;

      if (emails.length === 0) {
        console.log('📭 No hay emails pendientes en la cola');
        return;
      }

      console.log(`📬 Procesando ${emails.length} emails de la cola`);

      for (const email of emails) {
        await this.processQueuedEmail(email);
      }
    } catch (error) {
      console.error('❌ Error al procesar cola de emails:', error);
    }
  }

  // Procesar un email específico de la cola
  private async processQueuedEmail(email: EmailQueueItem): Promise<void> {
    const startTime = Date.now();
    
    try {
      const mailOptions = {
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to: email.recipientName 
          ? `"${email.recipientName}" <${email.recipientEmail}>`
          : email.recipientEmail,
        subject: email.subject,
        html: email.htmlBody,
        text: email.textBody || email.htmlBody.replace(/<[^>]*>/g, '')
      };

      const info = await this.transporter!.sendMail(mailOptions);
      const processingTime = Date.now() - startTime;

      // Marcar como enviado exitosamente
      await pool.query(
        'SELECT mark_email_as_sent($1, $2, $3, $4)',
        [
          email.emailId,
          `Email enviado exitosamente. MessageID: ${info.messageId}`,
          '200',
          processingTime
        ]
      );

      console.log('✅ Email procesado exitosamente:', {
        emailId: email.emailId,
        recipientEmail: email.recipientEmail,
        messageId: info.messageId,
        processingTime: `${processingTime}ms`
      });

    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

      // Calcular delay para próximo intento
      const retryDelay = this.queueConfig.baseRetryDelayMinutes * Math.pow(2, email.attempts);

      // Marcar como fallido
      await pool.query(
        'SELECT mark_email_as_failed($1, $2, $3, $4, $5)',
        [
          email.emailId,
          errorMessage,
          'ERROR',
          processingTime,
          retryDelay
        ]
      );

      console.error('❌ Error al procesar email:', {
        emailId: email.emailId,
        recipientEmail: email.recipientEmail,
        error: errorMessage,
        attempts: email.attempts + 1,
        nextRetry: retryDelay
      });
    }
  }

  // Obtener estadísticas de la cola
  async getQueueStats(): Promise<any> {
    try {
      const query = `
        SELECT
          status,
          COUNT(*) as count,
          MIN(created_at) as oldest_email,
          MAX(created_at) as newest_email
        FROM email_queue
        GROUP BY status
        UNION ALL
        SELECT
          'total' as status,
          COUNT(*) as count,
          MIN(created_at) as oldest_email,
          MAX(created_at) as newest_email
        FROM email_queue
      `;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas de cola:', error);
      throw createError('Error al obtener estadísticas de cola', 500);
    }
  }

  // Limpiar tokens de verificación expirados
  async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await pool.query('SELECT cleanup_expired_verification_tokens()');
      const deletedCount = result.rows[0].cleanup_expired_verification_tokens;
      
      if (deletedCount > 0) {
        console.log(`🧹 Limpieza automática: ${deletedCount} tokens expirados eliminados`);
      }
      
      return deletedCount;
    } catch (error) {
      console.error('❌ Error al limpiar tokens expirados:', error);
      return 0;
    }
  }

  // Crear token de verificación de email
  async createVerificationToken(userId: number, email: string): Promise<string> {
    try {
      // Generar token único
      const token = crypto.randomBytes(32).toString('hex');
      
      // Establecer expiración (24 horas)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const query = `
        INSERT INTO email_verification_tokens (user_id, token, email, expires_at)
        VALUES ($1, $2, $3, $4)
        RETURNING token
      `;

      const result = await pool.query(query, [userId, token, email, expiresAt]);
      
      console.log('🔐 Token de verificación creado:', {
        userId,
        email,
        expiresAt: expiresAt.toISOString()
      });

      return result.rows[0].token;
    } catch (error) {
      console.error('❌ Error al crear token de verificación:', error);
      throw createError('Error al crear token de verificación', 500);
    }
  }

  // Verificar token de email
  async verifyEmailToken(token: string, ipAddress?: string, userAgent?: string): Promise<{
    success: boolean;
    userId?: number;
    email?: string;
    message: string;
  }> {
    try {
      // Buscar el token
      const tokenQuery = `
        SELECT 
          user_id, email, expires_at, is_used
        FROM email_verification_tokens
        WHERE token = $1
      `;

      const tokenResult = await pool.query(tokenQuery, [token]);

      if (tokenResult.rows.length === 0) {
        return {
          success: false,
          message: 'Token de verificación inválido'
        };
      }

      const tokenData = tokenResult.rows[0];

      // Verificar si ya fue usado
      if (tokenData.is_used) {
        return {
          success: false,
          message: 'Este token ya ha sido utilizado'
        };
      }

      // Verificar si expiró
      if (new Date() > new Date(tokenData.expires_at)) {
        return {
          success: false,
          message: 'El token de verificación ha expirado'
        };
      }

      // Marcar token como usado
      const updateTokenQuery = `
        UPDATE email_verification_tokens
        SET 
          is_used = true,
          used_at = NOW(),
          ip_address = $2,
          user_agent = $3
        WHERE token = $1
      `;

      await pool.query(updateTokenQuery, [token, ipAddress, userAgent]);

      // Marcar email del usuario como verificado
      const updateUserQuery = `
        UPDATE users
        SET 
          email_verified = true,
          email_verified_at = NOW()
        WHERE user_id = $1
      `;

      await pool.query(updateUserQuery, [tokenData.user_id]);

      console.log('✅ Email verificado exitosamente:', {
        userId: tokenData.user_id,
        email: tokenData.email
      });

      return {
        success: true,
        userId: tokenData.user_id,
        email: tokenData.email,
        message: 'Email verificado exitosamente'
      };

    } catch (error) {
      console.error('❌ Error al verificar token de email:', error);
      throw createError('Error al verificar email', 500);
    }
  }

  // Reenviar email de verificación
  async resendVerificationEmail(userId: number): Promise<boolean> {
    try {
      // Buscar datos del usuario
      const userQuery = `
        SELECT email, first_name, last_name, email_verified
        FROM users
        WHERE user_id = $1
      `;

      const userResult = await pool.query(userQuery, [userId]);

      if (userResult.rows.length === 0) {
        throw createError('Usuario no encontrado', 404);
      }

      const user = userResult.rows[0];

      if (user.email_verified) {
        throw createError('El email ya está verificado', 400);
      }

      // Invalidar tokens anteriores
      await pool.query(
        'UPDATE email_verification_tokens SET is_used = true WHERE user_id = $1 AND is_used = false',
        [userId]
      );

      // Crear nuevo token
      const token = await this.createVerificationToken(userId, user.email);

      // Enviar email de verificación
      await this.sendVerificationEmail(user.email, user.first_name, token);

      return true;
    } catch (error) {
      console.error('❌ Error al reenviar email de verificación:', error);
      if ((error as any).statusCode) {
        throw error;
      }
      throw createError('Error al reenviar email de verificación', 500);
    }
  }

  // Enviar email de verificación
  async sendVerificationEmail(email: string, firstName: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    const template = this.getVerificationEmailTemplate(firstName, verificationUrl);

    await this.queueEmail({
      recipientEmail: email,
      recipientName: firstName,
      subject: template.subject,
      htmlBody: template.htmlBody,
      textBody: template.textBody,
      emailType: 'verification',
      priority: 1, // Alta prioridad
      templateData: {
        firstName,
        verificationUrl,
        token
      }
    });
  }

  // Template de email de verificación
  private getVerificationEmailTemplate(firstName: string, verificationUrl: string): EmailTemplate {
    const subject = 'Verifica tu cuenta - Sistema PROBUS';
    
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificación de Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f8f9fa; }
          .button { 
            display: inline-block; 
            background: #28a745; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenido a Sistema PROBUS!</h1>
          </div>
          <div class="content">
            <h2>Hola ${firstName},</h2>
            <p>Gracias por registrarte en nuestro sistema. Para completar tu registro, necesitas verificar tu dirección de email.</p>
            <p>Haz clic en el siguiente botón para verificar tu cuenta:</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verificar Email</a>
            </p>
            <p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 3px;">
              ${verificationUrl}
            </p>
            <p><strong>Este enlace expirará en 24 horas.</strong></p>
            <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
          </div>
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            <p>&copy; ${new Date().getFullYear()} Sistema PROBUS. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textBody = `
      ¡Bienvenido a Sistema PROBUS!
      
      Hola ${firstName},
      
      Gracias por registrarte en nuestro sistema. Para completar tu registro, necesitas verificar tu dirección de email.
      
      Visita el siguiente enlace para verificar tu cuenta:
      ${verificationUrl}
      
      Este enlace expirará en 24 horas.
      
      Si no creaste esta cuenta, puedes ignorar este email.
      
      ---
      Este es un email automático, por favor no respondas a este mensaje.
      © ${new Date().getFullYear()} Sistema PROBUS. Todos los derechos reservados.
    `;

    return { subject, htmlBody, textBody };
  }

  // Obtener configuración actual
  getConfig(): { smtp: EmailConfig; queue: EmailQueueConfig } {
    return {
      smtp: this.config,
      queue: this.queueConfig
    };
  }
}

// Instancia singleton del servicio
export const emailService = new EmailService();