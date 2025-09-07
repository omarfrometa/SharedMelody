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
    role_id UUID REFERENCES user_roles(role_id),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
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
-- TABLA: songs (Canciones)
-- =============================================
CREATE TABLE IF NOT EXISTS songs (
    song_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Información básica
    title VARCHAR(255) NOT NULL,
    artist_name VARCHAR(255) NOT NULL, -- Nombre del artista/intérprete
    album VARCHAR(255),
    release_year INTEGER,
    
    -- Clasificación
    genre_id UUID REFERENCES musical_genres(genre_id),
    
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
CREATE INDEX IF NOT EXISTS idx_songs_status ON songs(status);
CREATE INDEX IF NOT EXISTS idx_songs_uploaded_by ON songs(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_songs_created_at ON songs(created_at);