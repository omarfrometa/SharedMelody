-- =============================================
-- TABLAS ADICIONALES PARA SISTEMA DE RATING
-- =============================================

-- Tabla para almacenar las calificaciones individuales de los usuarios
CREATE TABLE IF NOT EXISTS song_ratings (
    rating_id SERIAL PRIMARY KEY,
    song_id INTEGER NOT NULL REFERENCES songs(song_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Un usuario solo puede calificar una canción una vez
    CONSTRAINT unique_user_song_rating UNIQUE (song_id, user_id)
);

-- Tabla para almacenar los "me gusta" de los usuarios
CREATE TABLE IF NOT EXISTS song_likes (
    like_id SERIAL PRIMARY KEY,
    song_id INTEGER NOT NULL REFERENCES songs(song_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Un usuario solo puede dar "me gusta" una vez por canción
    CONSTRAINT unique_user_song_like UNIQUE (song_id, user_id)
);

-- Índices para optimizar las consultas
CREATE INDEX IF NOT EXISTS idx_song_ratings_song_id ON song_ratings(song_id);
CREATE INDEX IF NOT EXISTS idx_song_ratings_user_id ON song_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_song_ratings_rating ON song_ratings(rating);
CREATE INDEX IF NOT EXISTS idx_song_ratings_created_at ON song_ratings(created_at);

CREATE INDEX IF NOT EXISTS idx_song_likes_song_id ON song_likes(song_id);
CREATE INDEX IF NOT EXISTS idx_song_likes_user_id ON song_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_song_likes_created_at ON song_likes(created_at);

-- Función para actualizar automáticamente updated_at en song_ratings
CREATE OR REPLACE FUNCTION update_song_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS trigger_update_song_ratings_updated_at ON song_ratings;
CREATE TRIGGER trigger_update_song_ratings_updated_at
    BEFORE UPDATE ON song_ratings
    FOR EACH ROW
    EXECUTE PROCEDURE update_song_ratings_updated_at();

-- Función para actualizar las estadísticas de rating en la tabla songs
CREATE OR REPLACE FUNCTION update_song_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar las estadísticas de la canción afectada
    IF TG_OP = 'DELETE' THEN
        UPDATE songs 
        SET 
            average_rating = COALESCE((
                SELECT AVG(rating)::DECIMAL(3,2) 
                FROM song_ratings 
                WHERE song_id = OLD.song_id
            ), 0.00),
            rating_count = (
                SELECT COUNT(*) 
                FROM song_ratings 
                WHERE song_id = OLD.song_id
            )
        WHERE song_id = OLD.song_id;
        RETURN OLD;
    ELSE
        UPDATE songs 
        SET 
            average_rating = COALESCE((
                SELECT AVG(rating)::DECIMAL(3,2) 
                FROM song_ratings 
                WHERE song_id = NEW.song_id
            ), 0.00),
            rating_count = (
                SELECT COUNT(*) 
                FROM song_ratings 
                WHERE song_id = NEW.song_id
            )
        WHERE song_id = NEW.song_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Triggers para mantener las estadísticas actualizadas
DROP TRIGGER IF EXISTS trigger_song_rating_stats_insert ON song_ratings;
CREATE TRIGGER trigger_song_rating_stats_insert
    AFTER INSERT ON song_ratings
    FOR EACH ROW
    EXECUTE PROCEDURE update_song_rating_stats();

DROP TRIGGER IF EXISTS trigger_song_rating_stats_update ON song_ratings;
CREATE TRIGGER trigger_song_rating_stats_update
    AFTER UPDATE ON song_ratings
    FOR EACH ROW
    EXECUTE PROCEDURE update_song_rating_stats();

DROP TRIGGER IF EXISTS trigger_song_rating_stats_delete ON song_ratings;
CREATE TRIGGER trigger_song_rating_stats_delete
    AFTER DELETE ON song_ratings
    FOR EACH ROW
    EXECUTE PROCEDURE update_song_rating_stats();

-- Función para actualizar el contador de likes en la tabla songs
CREATE OR REPLACE FUNCTION update_song_like_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar el contador de likes de la canción afectada
    IF TG_OP = 'DELETE' THEN
        UPDATE songs 
        SET like_count = (
            SELECT COUNT(*) 
            FROM song_likes 
            WHERE song_id = OLD.song_id
        )
        WHERE song_id = OLD.song_id;
        RETURN OLD;
    ELSE
        UPDATE songs 
        SET like_count = (
            SELECT COUNT(*) 
            FROM song_likes 
            WHERE song_id = NEW.song_id
        )
        WHERE song_id = NEW.song_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Triggers para mantener el contador de likes actualizado
DROP TRIGGER IF EXISTS trigger_song_like_count_insert ON song_likes;
CREATE TRIGGER trigger_song_like_count_insert
    AFTER INSERT ON song_likes
    FOR EACH ROW
    EXECUTE PROCEDURE update_song_like_count();

DROP TRIGGER IF EXISTS trigger_song_like_count_delete ON song_likes;
CREATE TRIGGER trigger_song_like_count_delete
    AFTER DELETE ON song_likes
    FOR EACH ROW
    EXECUTE PROCEDURE update_song_like_count();

-- Comentarios para documentación
COMMENT ON TABLE song_ratings IS 'Almacena las calificaciones individuales que los usuarios dan a las canciones (1-5 estrellas)';
COMMENT ON TABLE song_likes IS 'Almacena los "me gusta" que los usuarios dan a las canciones';
COMMENT ON FUNCTION update_song_rating_stats() IS 'Función que actualiza automáticamente average_rating y rating_count en la tabla songs';
COMMENT ON FUNCTION update_song_like_count() IS 'Función que actualiza automáticamente like_count en la tabla songs';