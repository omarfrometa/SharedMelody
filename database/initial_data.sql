-- =============================================
-- DATOS INICIALES PARA SHARED MELODY
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

-- Insertar algunos autores famosos como ejemplos
INSERT INTO authors (author_name, author_bio, birth_date, country_id) VALUES
('John Lennon', 'Músico, cantante y compositor británico, miembro de The Beatles', '1940-10-09', (SELECT country_id FROM countries WHERE country_code = 'GBR')),
('Paul McCartney', 'Músico, cantante y compositor británico, miembro de The Beatles', '1942-06-18', (SELECT country_id FROM countries WHERE country_code = 'GBR')),
('Bob Dylan', 'Cantautor, músico, artista y escritor estadounidense', '1941-05-24', (SELECT country_id FROM countries WHERE country_code = 'USA')),
('Leonard Cohen', 'Poeta, novelista, cantante y compositor canadiense', '1934-09-21', (SELECT country_id FROM countries WHERE country_code = 'CAN')),
('Joni Mitchell', 'Cantautora y pintora canadiense', '1943-11-07', (SELECT country_id FROM countries WHERE country_code = 'CAN')),
('Manu Chao', 'Músico franco-español', '1961-06-21', (SELECT country_id FROM countries WHERE country_code = 'FRA')),
('Shakira', 'Cantante, compositora y bailarina colombiana', '1977-02-02', (SELECT country_id FROM countries WHERE country_code = 'COL')),
('Manu Negra', 'Banda de rock alternativo franco-española', NULL, (SELECT country_id FROM countries WHERE country_code = 'FRA')),
('Café Tacvba', 'Banda mexicana de rock alternativo', NULL, (SELECT country_id FROM countries WHERE country_code = 'MEX')),
('Soda Stereo', 'Banda argentina de rock', NULL, (SELECT country_id FROM countries WHERE country_code = 'ARG'))
ON CONFLICT (author_name) DO NOTHING;
