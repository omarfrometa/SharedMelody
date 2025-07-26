-- =============================================
-- SHARED MELODY DATABASE SCHEMA
-- Sistema de gestión de canciones colaborativo
-- =============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- TABLA: countries (Países)
-- =============================================
CREATE TABLE IF NOT EXISTS countries (
    country_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_code VARCHAR(3) UNIQUE NOT NULL, -- ISO 3166-1 alpha-3
    country_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: user_roles (Roles de Usuario)
-- =============================================
CREATE TABLE IF NOT EXISTS user_roles (
    role_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name VARCHAR(50) UNIQUE NOT NULL, -- 'user', 'admin', 'moderator'
    role_description TEXT,
    permissions JSONB, -- Permisos específicos del rol
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: users (Usuarios)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Información básica
    display_name VARCHAR(200),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    
    -- Autenticación local
    password_hash VARCHAR(255), -- NULL para usuarios OAuth únicamente
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    
    -- Información adicional
    country_id UUID REFERENCES countries(country_id),
    phone VARCHAR(20),
    date_of_birth DATE,
    profile_picture_url TEXT,
    bio TEXT,
    
    -- Configuración de cuenta
    role_id UUID REFERENCES user_roles(role_id) DEFAULT (SELECT role_id FROM user_roles WHERE role_name = 'user'),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- =============================================
-- TABLA: oauth_providers (Proveedores OAuth)
-- =============================================
CREATE TABLE IF NOT EXISTS oauth_providers (
    provider_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_name VARCHAR(50) UNIQUE NOT NULL, -- 'google', 'facebook', 'microsoft', 'apple'
    provider_display_name VARCHAR(100) NOT NULL,
    client_id VARCHAR(255),
    client_secret VARCHAR(255),
    authorization_url TEXT,
    token_url TEXT,
    user_info_url TEXT,
    scopes TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: user_oauth_accounts (Cuentas OAuth de Usuarios)
-- =============================================
CREATE TABLE IF NOT EXISTS user_oauth_accounts (
    oauth_account_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    provider_id UUID REFERENCES oauth_providers(provider_id),
    provider_user_id VARCHAR(255) NOT NULL, -- ID del usuario en el proveedor
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    provider_email VARCHAR(255),
    provider_picture_url TEXT,
    raw_user_data JSONB, -- Datos completos del proveedor
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(provider_id, provider_user_id)
);

-- =============================================
-- TABLA: musical_genres (Géneros Musicales)
-- =============================================
CREATE TABLE IF NOT EXISTS musical_genres (
    genre_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    genre_name VARCHAR(100) UNIQUE NOT NULL,
    genre_description TEXT,
    parent_genre_id UUID REFERENCES musical_genres(genre_id), -- Para subgéneros
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(user_id)
);

-- =============================================
-- TABLA: authors (Autores/Compositores)
-- =============================================
CREATE TABLE IF NOT EXISTS authors (
    author_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_name VARCHAR(255) NOT NULL,
    author_bio TEXT,
    birth_date DATE,
    death_date DATE,
    country_id UUID REFERENCES countries(country_id),
    website_url TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(user_id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(user_id)
);

-- =============================================
-- TABLA: song_types (Tipos de Canción)
-- =============================================
CREATE TABLE IF NOT EXISTS song_types (
    type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_name VARCHAR(100) UNIQUE NOT NULL, -- 'original', 'cover', 'remix', 'instrumental', etc.
    type_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: songs (Canciones)
-- =============================================
CREATE TABLE IF NOT EXISTS songs (
    song_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Información básica
    title VARCHAR(255) NOT NULL,
    artist_name VARCHAR(255) NOT NULL, -- Nombre del artista/intérprete
    author_id UUID REFERENCES authors(author_id), -- Compositor/Autor
    album VARCHAR(255),
    release_year INTEGER,
    
    -- Clasificación
    genre_id UUID REFERENCES musical_genres(genre_id),
    type_id UUID REFERENCES song_types(type_id),
    
    -- Contenido
    lyrics TEXT, -- Campo rich text para la letra completa
    lyrics_format VARCHAR(20) DEFAULT 'html', -- 'html', 'markdown', 'plain'
    
    -- Archivos multimedia
    audio_file_url TEXT,
    video_file_url TEXT,
    sheet_music_url TEXT,
    
    -- Metadatos
    duration_seconds INTEGER,
    language VARCHAR(10), -- Código ISO 639-1
    explicit_content BOOLEAN DEFAULT FALSE,
    
    -- Información de colaboración
    uploaded_by UUID REFERENCES users(user_id),
    is_collaboration BOOLEAN DEFAULT FALSE,
    original_request_id UUID, -- Se definirá la referencia más adelante
    
    -- Estado y moderación
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'archived'
    moderation_notes TEXT,
    moderated_by UUID REFERENCES users(user_id),
    moderated_at TIMESTAMP WITH TIME ZONE,
    
    -- Estadísticas
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    
    -- Comentarios adicionales
    comments TEXT,
    tags TEXT[], -- Array de etiquetas
    
    -- Metadatos del sistema
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices y restricciones
    CONSTRAINT songs_release_year_check CHECK (release_year >= 1000 AND release_year <= EXTRACT(YEAR FROM CURRENT_DATE) + 10),
    CONSTRAINT songs_rating_check CHECK (average_rating >= 0.00 AND average_rating <= 5.00),
    CONSTRAINT songs_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'archived'))
);

-- =============================================
-- TABLA: song_requests (Solicitudes de Canciones)
-- =============================================
CREATE TABLE IF NOT EXISTS song_requests (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Información de la solicitud
    title VARCHAR(255) NOT NULL,
    artist_name VARCHAR(255) NOT NULL,
    album VARCHAR(255),
    author_name VARCHAR(255),
    genre_preference VARCHAR(100),
    
    -- Detalles adicionales
    comments TEXT,
    priority_level INTEGER DEFAULT 1, -- 1=baja, 2=media, 3=alta
    
    -- Usuario solicitante
    requested_by UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Estado de la solicitud
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'rejected', 'cancelled'
    
    -- Cumplimiento de la solicitud
    fulfilled_by UUID REFERENCES users(user_id), -- Usuario que cumplió la solicitud
    fulfilled_song_id UUID REFERENCES songs(song_id), -- Canción que cumple la solicitud
    fulfilled_at TIMESTAMP WITH TIME ZONE,
    
    -- Notificaciones
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT song_requests_priority_check CHECK (priority_level BETWEEN 1 AND 3),
    CONSTRAINT song_requests_status_check CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'cancelled'))
);

-- =============================================
-- TABLA: collaborations (Colaboraciones)
-- =============================================
CREATE TABLE IF NOT EXISTS collaborations (
    collaboration_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    song_id UUID REFERENCES songs(song_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Tipo de colaboración
    collaboration_type VARCHAR(50) NOT NULL, -- 'uploader', 'lyricist', 'composer', 'performer', 'editor'
    contribution_description TEXT,
    
    -- Estado
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'removed'
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(user_id),
    
    UNIQUE(song_id, user_id, collaboration_type),
    CONSTRAINT collaborations_type_check CHECK (collaboration_type IN ('uploader', 'lyricist', 'composer', 'performer', 'editor', 'contributor'))
);

-- =============================================
-- TABLA: user_messages (Mensajes de Usuario)
-- =============================================
CREATE TABLE IF NOT EXISTS user_messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Destinatario
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Contenido del mensaje
    message_type VARCHAR(50) NOT NULL, -- 'request_fulfilled', 'collaboration_invite', 'system_notification', 'admin_message'
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    
    -- Referencias opcionales
    related_song_id UUID REFERENCES songs(song_id),
    related_request_id UUID REFERENCES song_requests(request_id),
    related_collaboration_id UUID REFERENCES collaborations(collaboration_id),
    
    -- Estado del mensaje
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    is_archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMP WITH TIME ZONE,
    
    -- Remitente (opcional, para mensajes de admin)
    sent_by UUID REFERENCES users(user_id),
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE, -- Para mensajes temporales
    
    CONSTRAINT user_messages_type_check CHECK (message_type IN ('request_fulfilled', 'collaboration_invite', 'system_notification', 'admin_message', 'welcome', 'reminder'))
);

-- =============================================
-- TABLA: song_ratings (Calificaciones de Canciones)
-- =============================================
CREATE TABLE IF NOT EXISTS song_ratings (
    rating_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    song_id UUID REFERENCES songs(song_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    review_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(song_id, user_id),
    CONSTRAINT song_ratings_rating_check CHECK (rating BETWEEN 1 AND 5)
);

-- =============================================
-- TABLA: song_likes (Me Gusta de Canciones)
-- =============================================
CREATE TABLE IF NOT EXISTS song_likes (
    like_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    song_id UUID REFERENCES songs(song_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(song_id, user_id)
);

-- =============================================
-- TABLA: user_sessions (Sesiones de Usuario)
-- =============================================
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- =============================================
-- TABLA: audit_logs (Logs de Auditoría)
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id),
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', etc.
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: email_notifications (Notificaciones por Email)
-- =============================================
CREATE TABLE IF NOT EXISTS email_notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    email_address VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT,
    body_text TEXT,

    -- Referencias opcionales
    related_song_id UUID REFERENCES songs(song_id),
    related_request_id UUID REFERENCES song_requests(request_id),

    -- Estado del envío
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
    sent_at TIMESTAMP WITH TIME ZONE,
    failed_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,

    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT email_notifications_status_check CHECK (status IN ('pending', 'sent', 'failed', 'cancelled'))
);

-- =============================================
-- REFERENCIAS FALTANTES
-- =============================================

-- Agregar referencia de songs a song_requests
ALTER TABLE songs
ADD CONSTRAINT fk_songs_original_request
FOREIGN KEY (original_request_id) REFERENCES song_requests(request_id);

-- Actualizar tabla songs para incluir artist_id
ALTER TABLE songs 
ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES authors(author_id);

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_songs_artist_id ON songs(artist_id);

-- =============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =============================================

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Índices para canciones
CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title);
CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist_name);
CREATE INDEX IF NOT EXISTS idx_songs_genre ON songs(genre_id);
CREATE INDEX IF NOT EXISTS idx_songs_author ON songs(author_id);
CREATE INDEX IF NOT EXISTS idx_songs_status ON songs(status);
CREATE INDEX IF NOT EXISTS idx_songs_uploaded_by ON songs(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_songs_created_at ON songs(created_at);

-- Índices para solicitudes
CREATE INDEX IF NOT EXISTS idx_song_requests_user ON song_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_song_requests_status ON song_requests(status);
CREATE INDEX IF NOT EXISTS idx_song_requests_created_at ON song_requests(created_at);

-- Índices para colaboraciones
CREATE INDEX IF NOT EXISTS idx_collaborations_song ON collaborations(song_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_user ON collaborations(user_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_type ON collaborations(collaboration_type);

-- Índices para mensajes
CREATE INDEX IF NOT EXISTS idx_user_messages_user ON user_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_type ON user_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_user_messages_read ON user_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_user_messages_created_at ON user_messages(created_at);

-- Índices para sesiones
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
