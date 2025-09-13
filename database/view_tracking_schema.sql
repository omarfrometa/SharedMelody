-- =============================================
-- VIEW TRACKING SCHEMA
-- Sistema de seguimiento de visualizaciones de canciones
-- =============================================

-- Eliminar tablas existentes si existen para evitar conflictos
DROP TABLE IF EXISTS song_views CASCADE;
DROP TABLE IF EXISTS unique_visitors CASCADE;

-- =============================================
-- TABLA: song_views (Registro de visualizaciones)
-- =============================================
CREATE TABLE song_views (
    view_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identificación de la canción y usuario
    song_id INTEGER NOT NULL, -- FK a songs.song_id (usando INTEGER para compatibilidad)
    user_id INTEGER, -- Sin foreign key por compatibilidad
    
    -- Información de la conexión
    ip_address_public INET NOT NULL, -- IP pública del usuario
    ip_address_private INET, -- IP privada (si está disponible)
    user_agent TEXT,
    session_id VARCHAR(255),
    referrer TEXT,
    
    -- Información geográfica (opcional)
    country_code VARCHAR(3),
    region VARCHAR(100),
    city VARCHAR(100),
    
    -- Información temporal
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_date DATE DEFAULT CURRENT_DATE,
    
    -- Metadatos adicionales
    device_type VARCHAR(50), -- mobile, desktop, tablet
    browser VARCHAR(100),
    os VARCHAR(100)
);

-- =============================================
-- TABLA: unique_visitors (Visitantes únicos por día)
-- =============================================
CREATE TABLE unique_visitors (
    visitor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identificación única del visitante
    ip_address_public INET NOT NULL,
    ip_address_private INET,
    user_id INTEGER, -- Sin foreign key por compatibilidad
    
    -- Información de primera visita
    first_visit_date DATE NOT NULL,
    last_visit_date DATE NOT NULL,
    total_visits INTEGER DEFAULT 1,
    
    -- Información geográfica
    country_code VARCHAR(3),
    region VARCHAR(100),
    city VARCHAR(100),
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Restricción de unicidad
    UNIQUE (ip_address_public, first_visit_date)
);

-- =============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =============================================

-- Índices para song_views
CREATE INDEX IF NOT EXISTS idx_song_views_song_id ON song_views(song_id);
CREATE INDEX IF NOT EXISTS idx_song_views_ip_date ON song_views(ip_address_public, created_date);
CREATE INDEX IF NOT EXISTS idx_song_views_user_id ON song_views(user_id);
CREATE INDEX IF NOT EXISTS idx_song_views_viewed_at ON song_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_song_views_created_date ON song_views(created_date);

-- Índices para unique_visitors
CREATE INDEX IF NOT EXISTS idx_unique_visitors_ip ON unique_visitors(ip_address_public);
CREATE INDEX IF NOT EXISTS idx_unique_visitors_date ON unique_visitors(first_visit_date);
CREATE INDEX IF NOT EXISTS idx_unique_visitors_user ON unique_visitors(user_id);

-- =============================================
-- FUNCIÓN: record_song_view
-- Registra una nueva visualización de canción
-- =============================================

-- Eliminar función existente si existe
DROP FUNCTION IF EXISTS record_song_view CASCADE;
DROP FUNCTION IF EXISTS get_song_view_stats CASCADE;
DROP FUNCTION IF EXISTS get_top_songs CASCADE;
DROP FUNCTION IF EXISTS get_top_artists CASCADE;

CREATE OR REPLACE FUNCTION record_song_view(
    p_song_id INTEGER,
    p_ip_address_public INET,
    p_user_id INTEGER DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_session_id VARCHAR(255) DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_existing_view_count INTEGER;
    v_view_recorded BOOLEAN := FALSE;
BEGIN
    -- Verificar si ya existe una visualización del mismo IP para la misma canción en el mismo día
    SELECT COUNT(*)
    INTO v_existing_view_count
    FROM song_views
    WHERE song_id = p_song_id
      AND ip_address_public = p_ip_address_public
      AND created_date = CURRENT_DATE;
    
    -- Solo registrar si no existe una visualización previa del mismo IP en el mismo día
    IF v_existing_view_count = 0 THEN
        -- Insertar nueva visualización
        INSERT INTO song_views (
            song_id,
            user_id,
            ip_address_public,
            user_agent,
            session_id,
            referrer,
            viewed_at,
            created_date
        ) VALUES (
            p_song_id,
            p_user_id,
            p_ip_address_public,
            p_user_agent,
            p_session_id,
            p_referrer,
            CURRENT_TIMESTAMP,
            CURRENT_DATE
        );
        
        -- Actualizar contador de reproducciones en la tabla songs
        UPDATE songs 
        SET view_count = view_count + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE song_id = p_song_id;
        
        -- Registrar visitante único si es necesario
        INSERT INTO unique_visitors (
            ip_address_public,
            user_id,
            first_visit_date,
            last_visit_date,
            total_visits
        ) VALUES (
            p_ip_address_public,
            p_user_id,
            CURRENT_DATE,
            CURRENT_DATE,
            1
        ) ON CONFLICT (ip_address_public, first_visit_date) DO UPDATE SET
            last_visit_date = CURRENT_DATE,
            total_visits = unique_visitors.total_visits + 1,
            updated_at = CURRENT_TIMESTAMP;
        
        v_view_recorded := TRUE;
        
        -- Log para debugging
        RAISE NOTICE 'Nueva visualización registrada: Canción % desde IP % en fecha %', 
                     p_song_id, p_ip_address_public, CURRENT_DATE;
    ELSE
        -- Log para debugging
        RAISE NOTICE 'Visualización duplicada ignorada: Canción % desde IP % en fecha %', 
                     p_song_id, p_ip_address_public, CURRENT_DATE;
    END IF;
    
    RETURN v_view_recorded;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNCIÓN: get_song_view_stats
-- Obtiene estadísticas de visualizaciones de una canción
-- =============================================
CREATE OR REPLACE FUNCTION get_song_view_stats(p_song_id INTEGER)
RETURNS TABLE (
    total_views BIGINT,
    unique_visitors BIGINT,
    views_today BIGINT,
    views_this_week BIGINT,
    views_this_month BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_views,
        COUNT(DISTINCT ip_address_public) as unique_visitors,
        COUNT(CASE WHEN created_date = CURRENT_DATE THEN 1 END) as views_today,
        COUNT(CASE WHEN viewed_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as views_this_week,
        COUNT(CASE WHEN viewed_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as views_this_month
    FROM song_views
    WHERE song_id = p_song_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNCIÓN: get_top_songs
-- Obtiene las canciones más vistas
-- =============================================
CREATE OR REPLACE FUNCTION get_top_songs(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    song_id INTEGER,
    title VARCHAR(255),
    artist_name VARCHAR(255),
    genre_name VARCHAR(100),
    plays_count BIGINT,
    unique_views BIGINT,
    unique_visitors BIGINT,
    upload_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.song_id::INTEGER,
        s.title,
        s.artist_name,
        COALESCE(g.genre_name, 'Sin género') as genre_name,
        COALESCE(s.view_count, 0)::BIGINT as plays_count,
        COALESCE(view_stats.total_views, 0)::BIGINT as unique_views,
        COALESCE(view_stats.unique_visitors, 0)::BIGINT as unique_visitors,
        s.created_at as upload_date
    FROM songs s
    LEFT JOIN musical_genres g ON s.genre_id = g.genre_id
    LEFT JOIN (
        SELECT
            sv.song_id,
            COUNT(*) as total_views,
            COUNT(DISTINCT sv.ip_address_public) as unique_visitors
        FROM song_views sv
        GROUP BY sv.song_id
    ) view_stats ON s.song_id = view_stats.song_id
    WHERE s.status = 'approved'
    ORDER BY COALESCE(view_stats.total_views, 0) DESC, s.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNCIÓN: get_top_artists
-- Obtiene los artistas más vistos
-- =============================================
CREATE OR REPLACE FUNCTION get_top_artists(p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
    author_id INTEGER,
    author_name VARCHAR(255),
    total_songs BIGINT,
    total_plays BIGINT,
    total_unique_views BIGINT,
    total_unique_visitors BIGINT,
    avg_plays_per_song NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        1 as author_id, -- Simple placeholder ID
        s.artist_name as author_name,
        COUNT(DISTINCT s.song_id)::BIGINT as total_songs,
        SUM(COALESCE(s.view_count, 0))::BIGINT as total_plays,
        SUM(COALESCE(view_stats.total_views, 0))::BIGINT as total_unique_views,
        COUNT(DISTINCT view_stats.ip_address)::BIGINT as total_unique_visitors,
        AVG(COALESCE(s.view_count, 0))::NUMERIC as avg_plays_per_song
    FROM songs s
    LEFT JOIN (
        SELECT
            sv.song_id,
            COUNT(*) as total_views,
            sv.ip_address_public as ip_address
        FROM song_views sv
        GROUP BY sv.song_id, sv.ip_address_public
    ) view_stats ON s.song_id = view_stats.song_id
    WHERE s.status = 'approved'
    GROUP BY s.artist_name
    HAVING COUNT(DISTINCT s.song_id) > 0
    ORDER BY SUM(COALESCE(view_stats.total_views, 0)) DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- =============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para unique_visitors
CREATE TRIGGER update_unique_visitors_updated_at
    BEFORE UPDATE ON unique_visitors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- COMENTARIOS EN TABLAS
-- =============================================

COMMENT ON TABLE song_views IS 'Registro de todas las visualizaciones de canciones con información detallada del visitante';
COMMENT ON TABLE unique_visitors IS 'Registro de visitantes únicos por día para tracking de audiencia';
COMMENT ON FUNCTION record_song_view IS 'Registra una nueva visualización de canción evitando duplicados del mismo IP en el mismo día';
COMMENT ON FUNCTION get_song_view_stats IS 'Obtiene estadísticas completas de visualizaciones para una canción específica';
COMMENT ON FUNCTION get_top_songs IS 'Retorna las canciones más vistas ordenadas por número de visualizaciones únicas';
COMMENT ON FUNCTION get_top_artists IS 'Retorna los artistas más populares basado en visualizaciones de sus canciones';