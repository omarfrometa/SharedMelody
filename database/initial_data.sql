-- =============================================
-- SHARED MELODY - DATOS INICIALES
-- =============================================

-- Insertar países básicos
INSERT INTO countries (country_code, country_name) VALUES
('USA', 'United States'),
('ESP', 'Spain'),
('MEX', 'Mexico'),
('ARG', 'Argentina'),
('COL', 'Colombia'),
('PER', 'Peru'),
('CHL', 'Chile'),
('BRA', 'Brazil'),
('GBR', 'United Kingdom'),
('FRA', 'France'),
('DEU', 'Germany'),
('ITA', 'Italy')
ON CONFLICT (country_code) DO NOTHING;

-- Insertar roles básicos
INSERT INTO user_roles (role_name, role_description, permissions) VALUES
('user', 'Usuario regular', '{"create_songs": true, "view_songs": true, "edit_own_songs": true}'),
('admin', 'Administrador del sistema', '{"all": true}'),
('moderator', 'Moderador de contenido', '{"moderate_songs": true, "view_all_songs": true, "ban_users": true}')
ON CONFLICT (role_name) DO NOTHING;

-- Insertar géneros musicales básicos
INSERT INTO musical_genres (genre_name, genre_description) VALUES
('Rock', 'Género musical caracterizado por el uso de guitarras eléctricas'),
('Pop', 'Música popular mainstream'),
('Jazz', 'Género musical que se originó a finales del siglo XIX'),
('Blues', 'Género musical vocal e instrumental'),
('Classical', 'Música clásica occidental'),
('Electronic', 'Música producida usando instrumentos electrónicos'),
('Hip Hop', 'Género musical que se desarrolló en Estados Unidos'),
('Country', 'Género musical que se originó en el sur de Estados Unidos'),
('Reggae', 'Género musical que se originó en Jamaica'),
('Folk', 'Música tradicional o folclórica'),
('R&B', 'Rhythm and Blues'),
('Funk', 'Género musical que mezcla soul, jazz y R&B'),
('Punk', 'Género musical derivado del rock'),
('Metal', 'Género musical derivado del hard rock'),
('Latin', 'Música latinoamericana')
ON CONFLICT (genre_name) DO NOTHING;

-- Crear usuario administrador por defecto (password: admin123)
-- Nota: En producción esto debe ser cambiado
INSERT INTO users (
    display_name,
    first_name,
    last_name,
    email,
    username,
    password_hash,
    email_verified,
    role_id,
    is_active
) VALUES (
    'System Administrator',
    'System',
    'Administrator',
    'admin@sharedmelody.com',
    'admin',
    '$2b$10$8K1p4CJw4QzP5G5J2vL2yOkFHwV7sJ9XcR4tZ8qW1NpE6mA3L5vSm', -- admin123
    true,
    (SELECT role_id FROM user_roles WHERE role_name = 'admin'),
    true
) ON CONFLICT (email) DO NOTHING;