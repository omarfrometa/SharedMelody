// =============================================
// CONFIGURACIÓN DE BASE DE DATOS - FRONTEND
// Nota: En React, las variables de entorno deben empezar con REACT_APP_
// Este archivo generalmente NO se usaría en el frontend ya que
// el frontend no se conecta directamente a la base de datos,
// sino que se conecta a través del API backend.
// =============================================

export const dbConfig = {
  // Estas variables generalmente no se usan en el frontend,
  // pero se mantienen por compatibilidad si fuesen necesarias
  host: process.env.REACT_APP_DB_HOST || 'localhost',
  database: process.env.REACT_APP_DB_NAME || 'sharedmelody_db',
  port: parseInt(process.env.REACT_APP_DB_PORT || '5432'),
  username: process.env.REACT_APP_DB_USER || 'postgres',
  password: process.env.REACT_APP_DB_PASSWORD || '',
  pool: {
    max: parseInt(process.env.REACT_APP_DB_POOL_MAX || '5'),
    min: parseInt(process.env.REACT_APP_DB_POOL_MIN || '0'),
    acquire: parseInt(process.env.REACT_APP_DB_ACQUIRE_TIMEOUT || '30000'),
    idle: parseInt(process.env.REACT_APP_DB_IDLE_TIMEOUT || '10000')
  }
};

// ADVERTENCIA: En aplicaciones React normales, el frontend NO debe
// conectarse directamente a la base de datos por razones de seguridad.
// Todas las operaciones de base de datos deben hacerse a través del backend API.

// Esquema de Base de Datos PostgreSQL para SharedMelody
export const DATABASE_SCHEMA = `
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
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
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
    provider_name VARCHAR(255),
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

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para tablas con updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON songs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_song_requests_updated_at BEFORE UPDATE ON song_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON authors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_song_ratings_updated_at BEFORE UPDATE ON song_ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_oauth_accounts_updated_at BEFORE UPDATE ON user_oauth_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TRIGGERS PARA ESTADÍSTICAS DE CANCIONES
-- =============================================

-- Función para actualizar estadísticas de rating
CREATE OR REPLACE FUNCTION update_song_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE songs SET
            average_rating = (
                SELECT COALESCE(AVG(rating), 0)
                FROM song_ratings
                WHERE song_id = NEW.song_id
            ),
            rating_count = (
                SELECT COUNT(*)
                FROM song_ratings
                WHERE song_id = NEW.song_id
            )
        WHERE song_id = NEW.song_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE songs SET
            average_rating = (
                SELECT COALESCE(AVG(rating), 0)
                FROM song_ratings
                WHERE song_id = OLD.song_id
            ),
            rating_count = (
                SELECT COUNT(*)
                FROM song_ratings
                WHERE song_id = OLD.song_id
            )
        WHERE song_id = OLD.song_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger para actualizar estadísticas de rating
CREATE TRIGGER update_song_rating_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON song_ratings
    FOR EACH ROW EXECUTE FUNCTION update_song_rating_stats();

-- Función para actualizar contador de likes
CREATE OR REPLACE FUNCTION update_song_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE songs SET like_count = like_count + 1 WHERE song_id = NEW.song_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE songs SET like_count = like_count - 1 WHERE song_id = OLD.song_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger para actualizar contador de likes
CREATE TRIGGER update_song_like_count_trigger
    AFTER INSERT OR DELETE ON song_likes
    FOR EACH ROW EXECUTE FUNCTION update_song_like_count();
-- =============================================
-- DATOS INICIALES
-- =============================================

-- Insertar roles de usuario
INSERT INTO user_roles (role_name, role_description, permissions) VALUES
('user', 'Usuario regular del sistema', '{"can_request_songs": true, "can_upload_songs": true, "can_rate_songs": true, "can_like_songs": true}'),
('admin', 'Administrador del sistema', '{"can_request_songs": true, "can_upload_songs": true, "can_rate_songs": true, "can_like_songs": true, "can_moderate_content": true, "can_manage_users": true, "can_manage_authors": true, "can_manage_genres": true, "can_view_analytics": true}'),
('moderator', 'Moderador de contenido', '{"can_request_songs": true, "can_upload_songs": true, "can_rate_songs": true, "can_like_songs": true, "can_moderate_content": true}')
ON CONFLICT (role_name) DO NOTHING;

-- Insertar proveedores OAuth
INSERT INTO oauth_providers (provider_name, provider_display_name, authorization_url, token_url, user_info_url, scopes) VALUES
('google', 'Google', 'https://accounts.google.com/o/oauth2/v2/auth', 'https://oauth2.googleapis.com/token', 'https://www.googleapis.com/oauth2/v2/userinfo', ARRAY['openid', 'email', 'profile']),
('facebook', 'Facebook', 'https://www.facebook.com/v18.0/dialog/oauth', 'https://graph.facebook.com/v18.0/oauth/access_token', 'https://graph.facebook.com/me', ARRAY['email', 'public_profile']),
('microsoft', 'Microsoft', 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize', 'https://login.microsoftonline.com/common/oauth2/v2.0/token', 'https://graph.microsoft.com/v1.0/me', ARRAY['openid', 'email', 'profile']),
('apple', 'Apple', 'https://appleid.apple.com/auth/authorize', 'https://appleid.apple.com/auth/token', 'https://appleid.apple.com/auth/userinfo', ARRAY['name', 'email'])
ON CONFLICT (provider_name) DO NOTHING;

-- Insertar algunos países comunes
INSERT INTO countries (country_code, country_name) VALUES
('USA', 'Estados Unidos'),
('MEX', 'México'),
('ESP', 'España'),
('ARG', 'Argentina'),
('COL', 'Colombia'),
('PER', 'Perú'),
('CHL', 'Chile'),
('VEN', 'Venezuela'),
('ECU', 'Ecuador'),
('URY', 'Uruguay'),
('PRY', 'Paraguay'),
('BOL', 'Bolivia'),
('CRI', 'Costa Rica'),
('PAN', 'Panamá'),
('GTM', 'Guatemala'),
('HND', 'Honduras'),
('SLV', 'El Salvador'),
('NIC', 'Nicaragua'),
('CUB', 'Cuba'),
('DOM', 'República Dominicana'),
('PRI', 'Puerto Rico'),
('CAN', 'Canadá'),
('BRA', 'Brasil'),
('FRA', 'Francia'),
('DEU', 'Alemania'),
('ITA', 'Italia'),
('GBR', 'Reino Unido'),
('JPN', 'Japón'),
('CHN', 'China'),
('IND', 'India'),
('RUS', 'Rusia'),
('AUS', 'Australia'),
('NZL', 'Nueva Zelanda')
ON CONFLICT (country_code) DO NOTHING;

-- Insertar géneros musicales básicos
INSERT INTO musical_genres (genre_name, genre_description) VALUES
('Rock', 'Género musical caracterizado por el uso de guitarras eléctricas, bajo y batería'),
('Pop', 'Música popular contemporánea con melodías pegadizas'),
('Jazz', 'Género musical que se originó en las comunidades afroamericanas'),
('Blues', 'Género musical vocal e instrumental'),
('Country', 'Género musical que se originó en el sur de Estados Unidos'),
('Folk', 'Música tradicional que se transmite oralmente'),
('Classical', 'Música clásica occidental'),
('Electronic', 'Música creada usando instrumentos electrónicos'),
('Hip Hop', 'Género musical que incluye rap, DJing, breakdancing y graffiti'),
('R&B', 'Rhythm and Blues'),
('Reggae', 'Género musical que se originó en Jamaica'),
('Punk', 'Género de rock que emergió en los años 70'),
('Metal', 'Género de rock pesado'),
('Indie', 'Música independiente'),
('Alternative', 'Rock alternativo'),
('Funk', 'Género musical que se originó en los años 60'),
('Soul', 'Género musical que combina elementos del gospel y R&B'),
('Gospel', 'Música cristiana'),
('Latin', 'Música latina'),
('Reggaeton', 'Género musical que se originó en Puerto Rico'),
('Salsa', 'Género musical caribeño'),
('Bachata', 'Género musical de República Dominicana'),
('Merengue', 'Género musical de República Dominicana'),
('Cumbia', 'Género musical de Colombia'),
('Tango', 'Género musical de Argentina'),
('Flamenco', 'Género musical de España'),
('Bossa Nova', 'Género musical de Brasil'),
('Samba', 'Género musical de Brasil'),
('Mariachi', 'Género musical de México'),
('Ranchera', 'Género musical de México')
ON CONFLICT (genre_name) DO NOTHING;

-- Insertar tipos de canción
INSERT INTO song_types (type_name, type_description) VALUES
('Original', 'Composición original del artista'),
('Cover', 'Interpretación de una canción existente'),
('Remix', 'Versión modificada de una canción existente'),
('Instrumental', 'Versión sin letra de una canción'),
('Acoustic', 'Versión acústica de una canción'),
('Live', 'Grabación en vivo'),
('Demo', 'Grabación de demostración'),
('Karaoke', 'Versión para karaoke sin voz principal'),
('Mashup', 'Combinación de múltiples canciones'),
('Tribute', 'Homenaje a otro artista')
ON CONFLICT (type_name) DO NOTHING;

-- =============================================
-- VISTAS ÚTILES
-- =============================================

-- Vista para canciones con información completa
CREATE OR REPLACE VIEW songs_detailed AS
SELECT
    s.song_id,
    s.title,
    s.artist_name,
    a.author_name,
    s.album,
    s.release_year,
    g.genre_name,
    st.type_name,
    s.lyrics,
    s.duration_seconds,
    s.language,
    s.view_count,
    s.download_count,
    s.like_count,
    s.average_rating,
    s.rating_count,
    s.status,
    u.username as uploaded_by_username,
    u.first_name || ' ' || u.last_name as uploaded_by_name,
    s.created_at,
    s.updated_at
FROM songs s
LEFT JOIN authors a ON s.author_id = a.author_id
LEFT JOIN musical_genres g ON s.genre_id = g.genre_id
LEFT JOIN song_types st ON s.type_id = st.type_id
LEFT JOIN users u ON s.uploaded_by = u.user_id;

-- Vista para solicitudes con información del usuario
CREATE OR REPLACE VIEW song_requests_detailed AS
SELECT
    sr.request_id,
    sr.title,
    sr.artist_name,
    sr.album,
    sr.author_name,
    sr.genre_preference,
    sr.comments,
    sr.priority_level,
    sr.status,
    u.username as requested_by_username,
    u.first_name || ' ' || u.last_name as requested_by_name,
    u.email as requested_by_email,
    fu.username as fulfilled_by_username,
    fu.first_name || ' ' || fu.last_name as fulfilled_by_name,
    s.title as fulfilled_song_title,
    sr.fulfilled_at,
    sr.notification_sent,
    sr.created_at,
    sr.updated_at
FROM song_requests sr
LEFT JOIN users u ON sr.requested_by = u.user_id
LEFT JOIN users fu ON sr.fulfilled_by = fu.user_id
LEFT JOIN songs s ON sr.fulfilled_song_id = s.song_id;

-- Vista para mensajes de usuario con información relacionada
CREATE OR REPLACE VIEW user_messages_detailed AS
SELECT
    um.message_id,
    um.user_id,
    u.username,
    u.email,
    um.message_type,
    um.title,
    um.content,
    um.is_read,
    um.read_at,
    um.is_archived,
    s.title as related_song_title,
    sr.title as related_request_title,
    sender.username as sent_by_username,
    um.created_at,
    um.expires_at
FROM user_messages um
LEFT JOIN users u ON um.user_id = u.user_id
LEFT JOIN songs s ON um.related_song_id = s.song_id
LEFT JOIN song_requests sr ON um.related_request_id = sr.request_id
LEFT JOIN users sender ON um.sent_by = sender.user_id;

-- =============================================
-- FUNCIONES ÚTILES
-- =============================================

-- Función para crear un mensaje de notificación
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_message_type VARCHAR(50),
    p_title VARCHAR(255),
    p_content TEXT,
    p_related_song_id UUID DEFAULT NULL,
    p_related_request_id UUID DEFAULT NULL,
    p_sent_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_message_id UUID;
BEGIN
    INSERT INTO user_messages (
        user_id, message_type, title, content,
        related_song_id, related_request_id, sent_by
    ) VALUES (
        p_user_id, p_message_type, p_title, p_content,
        p_related_song_id, p_related_request_id, p_sent_by
    ) RETURNING message_id INTO new_message_id;

    RETURN new_message_id;
END;
$$ LANGUAGE plpgsql;

-- Función para marcar una solicitud como cumplida
CREATE OR REPLACE FUNCTION fulfill_song_request(
    p_request_id UUID,
    p_song_id UUID,
    p_fulfilled_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    request_user_id UUID;
    song_title VARCHAR(255);
    request_title VARCHAR(255);
BEGIN
    -- Obtener información de la solicitud
    SELECT requested_by, title INTO request_user_id, request_title
    FROM song_requests
    WHERE request_id = p_request_id AND status = 'pending';

    IF request_user_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Obtener título de la canción
    SELECT title INTO song_title FROM songs WHERE song_id = p_song_id;

    -- Actualizar la solicitud
    UPDATE song_requests SET
        status = 'completed',
        fulfilled_by = p_fulfilled_by,
        fulfilled_song_id = p_song_id,
        fulfilled_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE request_id = p_request_id;

    -- Crear notificación para el usuario
    PERFORM create_notification(
        request_user_id,
        'request_fulfilled',
        'Tu solicitud ha sido cumplida',
        'La canción "' || song_title || '" ha sido subida en respuesta a tu solicitud de "' || request_title || '".',
        p_song_id,
        p_request_id,
        p_fulfilled_by
    );

    -- Programar email de notificación
    INSERT INTO email_notifications (
        user_id, email_address, subject, body_html, body_text,
        related_song_id, related_request_id
    )
    SELECT
        u.user_id,
        u.email,
        'Tu solicitud de canción ha sido cumplida - SharedMelody',
        '<h2>¡Tu solicitud ha sido cumplida!</h2><p>La canción <strong>' || song_title || '</strong> ha sido subida en respuesta a tu solicitud.</p><p>Puedes escucharla ahora en SharedMelody.</p>',
        'Tu solicitud de la canción "' || song_title || '" ha sido cumplida. Puedes escucharla ahora en SharedMelody.',
        p_song_id,
        p_request_id
    FROM users u
    WHERE u.user_id = request_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMENTARIOS FINALES
-- =============================================

-- Este esquema proporciona:
-- 1. Gestión completa de usuarios con autenticación local y OAuth
-- 2. Sistema de roles y permisos
-- 3. Gestión de canciones con metadatos completos
-- 4. Sistema de solicitudes y colaboraciones
-- 5. Notificaciones por email y mensajes internos
-- 6. Auditoría completa de acciones
-- 7. Estadísticas y ratings
-- 8. Mantenimiento de autores y géneros
-- 9. Optimización con índices apropiados
-- 10. Triggers para mantener consistencia de datos
`;