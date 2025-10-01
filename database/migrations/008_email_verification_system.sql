-- =============================================
-- MIGRACIÓN: Sistema de Verificación de Email
-- Descripción: Crea las tablas necesarias para el sistema de verificación por email
-- Fecha: 2025-01-15
-- =============================================

-- Tabla para tokens de verificación de email
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_email ON email_verification_tokens(email);

-- Tabla para cola de emails
CREATE TABLE IF NOT EXISTS email_queue (
    email_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    subject VARCHAR(500) NOT NULL,
    html_body TEXT NOT NULL,
    text_body TEXT,
    email_type VARCHAR(50) NOT NULL, -- 'verification', 'password_reset', 'notification', etc.
    template_data JSONB,
    priority INTEGER DEFAULT 5, -- 1 = alta, 5 = normal, 10 = baja
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'sent', 'failed', 'cancelled'
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    last_error TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Datos relacionados
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    related_entity_type VARCHAR(50), -- 'user', 'song', 'comment', etc.
    related_entity_id INTEGER
);

-- Índices para optimizar el procesamiento de la cola
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_next_retry ON email_queue(next_retry_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_priority ON email_queue(priority);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_user_id ON email_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_email_type ON email_queue(email_type);

-- Tabla para logs de emails enviados
CREATE TABLE IF NOT EXISTS email_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID REFERENCES email_queue(email_id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'success', 'failed'
    response_message TEXT,
    response_code VARCHAR(10),
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para logs
CREATE INDEX IF NOT EXISTS idx_email_logs_email_id ON email_logs(email_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- Agregar campo de verificación de email a la tabla users si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'email_verified') THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'email_verified_at') THEN
        ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Función para limpiar tokens expirados
CREATE OR REPLACE FUNCTION cleanup_expired_verification_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM email_verification_tokens 
    WHERE expires_at < NOW() AND is_used = FALSE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener próximos emails a procesar
CREATE OR REPLACE FUNCTION get_next_emails_to_process(batch_size INTEGER DEFAULT 10)
RETURNS TABLE (
    email_id UUID,
    recipient_email VARCHAR(255),
    recipient_name VARCHAR(255),
    subject VARCHAR(500),
    html_body TEXT,
    text_body TEXT,
    email_type VARCHAR(50),
    template_data JSONB,
    attempts INTEGER,
    max_attempts INTEGER
) AS $$
BEGIN
    RETURN QUERY
    UPDATE email_queue 
    SET 
        status = 'processing',
        updated_at = NOW()
    WHERE email_queue.email_id IN (
        SELECT eq.email_id 
        FROM email_queue eq
        WHERE eq.status = 'pending' 
           OR (eq.status = 'failed' AND eq.next_retry_at <= NOW())
        ORDER BY eq.priority ASC, eq.created_at ASC
        LIMIT batch_size
        FOR UPDATE SKIP LOCKED
    )
    RETURNING 
        email_queue.email_id,
        email_queue.recipient_email,
        email_queue.recipient_name,
        email_queue.subject,
        email_queue.html_body,
        email_queue.text_body,
        email_queue.email_type,
        email_queue.template_data,
        email_queue.attempts,
        email_queue.max_attempts;
END;
$$ LANGUAGE plpgsql;

-- Función para marcar email como enviado
CREATE OR REPLACE FUNCTION mark_email_as_sent(
    p_email_id UUID,
    p_response_message TEXT DEFAULT NULL,
    p_response_code VARCHAR(10) DEFAULT NULL,
    p_processing_time_ms INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Actualizar estado del email
    UPDATE email_queue 
    SET 
        status = 'sent',
        sent_at = NOW(),
        updated_at = NOW()
    WHERE email_id = p_email_id;
    
    -- Registrar log exitoso
    INSERT INTO email_logs (
        email_id, 
        attempt_number, 
        status, 
        response_message, 
        response_code,
        processing_time_ms
    ) 
    SELECT 
        p_email_id,
        attempts + 1,
        'success',
        p_response_message,
        p_response_code,
        p_processing_time_ms
    FROM email_queue 
    WHERE email_id = p_email_id;
END;
$$ LANGUAGE plpgsql;

-- Función para marcar email como fallido
CREATE OR REPLACE FUNCTION mark_email_as_failed(
    p_email_id UUID,
    p_error_message TEXT,
    p_response_code VARCHAR(10) DEFAULT NULL,
    p_processing_time_ms INTEGER DEFAULT NULL,
    p_retry_delay_minutes INTEGER DEFAULT 1
)
RETURNS VOID AS $$
DECLARE
    current_attempts INTEGER;
    max_attempts INTEGER;
    next_retry TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Obtener información actual
    SELECT attempts, email_queue.max_attempts 
    INTO current_attempts, max_attempts
    FROM email_queue 
    WHERE email_id = p_email_id;
    
    -- Calcular próximo intento
    IF current_attempts + 1 < max_attempts THEN
        next_retry := NOW() + (p_retry_delay_minutes * INTERVAL '1 minute');
    ELSE
        next_retry := NULL;
    END IF;
    
    -- Actualizar estado del email
    UPDATE email_queue 
    SET 
        status = CASE 
            WHEN current_attempts + 1 >= max_attempts THEN 'failed'
            ELSE 'pending'
        END,
        attempts = current_attempts + 1,
        last_error = p_error_message,
        next_retry_at = next_retry,
        updated_at = NOW()
    WHERE email_id = p_email_id;
    
    -- Registrar log de fallo
    INSERT INTO email_logs (
        email_id, 
        attempt_number, 
        status, 
        response_message, 
        response_code,
        processing_time_ms
    ) VALUES (
        p_email_id,
        current_attempts + 1,
        'failed',
        p_error_message,
        p_response_code,
        p_processing_time_ms
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_email_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_email_queue_updated_at
    BEFORE UPDATE ON email_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_email_queue_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE email_verification_tokens IS 'Tokens para verificación de email de usuarios';
COMMENT ON TABLE email_queue IS 'Cola de emails pendientes de envío con sistema de reintentos';
COMMENT ON TABLE email_logs IS 'Logs de intentos de envío de emails';

COMMENT ON COLUMN email_queue.priority IS '1=Alta, 5=Normal, 10=Baja prioridad';
COMMENT ON COLUMN email_queue.status IS 'Estado: pending, processing, sent, failed, cancelled';
COMMENT ON COLUMN email_queue.template_data IS 'Datos JSON para renderizar templates de email';

-- Datos iniciales: configurar usuarios existentes como verificados (opcional)
-- UPDATE users SET email_verified = TRUE, email_verified_at = NOW() WHERE email IS NOT NULL;