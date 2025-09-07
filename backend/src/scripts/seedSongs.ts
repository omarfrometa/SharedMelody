import pool from '../config/database';

const sampleSongs = [
  {
    title: "Bohemian Rhapsody",
    artistName: "Queen",
    album: "A Night at the Opera",
    genreId: null,
    languageCode: "en",
    durationSeconds: 355,
    viewCount: 1500000,
    likeCount: 45000,
    averageRating: 4.8,
    ratingCount: 12000
  },
  {
    title: "Hotel California",
    artistName: "Eagles",
    album: "Hotel California",
    genreId: null,
    languageCode: "en",
    durationSeconds: 391,
    viewCount: 1200000,
    likeCount: 38000,
    averageRating: 4.7,
    ratingCount: 9500
  },
  {
    title: "Imagine",
    artistName: "John Lennon",
    album: "Imagine",
    genreId: null,
    languageCode: "en",
    durationSeconds: 183,
    viewCount: 980000,
    likeCount: 42000,
    averageRating: 4.9,
    ratingCount: 11000
  },
  {
    title: "Stairway to Heaven",
    artistName: "Led Zeppelin",
    album: "Led Zeppelin IV",
    genreId: null,
    languageCode: "en",
    durationSeconds: 482,
    viewCount: 1800000,
    likeCount: 55000,
    averageRating: 4.8,
    ratingCount: 15000
  },
  {
    title: "Billie Jean",
    artistName: "Michael Jackson",
    album: "Thriller",
    genreId: null,
    languageCode: "en",
    durationSeconds: 294,
    viewCount: 1350000,
    likeCount: 48000,
    averageRating: 4.6,
    ratingCount: 13500
  },
  {
    title: "Like a Rolling Stone",
    artistName: "Bob Dylan",
    album: "Highway 61 Revisited",
    genreId: null,
    languageCode: "en",
    durationSeconds: 369,
    viewCount: 750000,
    likeCount: 28000,
    averageRating: 4.5,
    ratingCount: 8200
  },
  {
    title: "Smells Like Teen Spirit",
    artistName: "Nirvana",
    album: "Nevermind",
    genreId: null,
    languageCode: "en",
    durationSeconds: 301,
    viewCount: 890000,
    likeCount: 35000,
    averageRating: 4.4,
    ratingCount: 9800
  },
  {
    title: "Hey Jude",
    artistName: "The Beatles",
    album: "Hey Jude",
    genreId: null,
    languageCode: "en",
    durationSeconds: 431,
    viewCount: 1650000,
    likeCount: 52000,
    averageRating: 4.7,
    ratingCount: 14200
  },
  {
    title: "Purple Haze",
    artistName: "Jimi Hendrix",
    album: "Are You Experienced",
    genreId: null,
    languageCode: "en",
    durationSeconds: 169,
    viewCount: 720000,
    likeCount: 31000,
    averageRating: 4.6,
    ratingCount: 7800
  },
  {
    title: "What's Going On",
    artistName: "Marvin Gaye",
    album: "What's Going On",
    genreId: null,
    languageCode: "en",
    durationSeconds: 233,
    viewCount: 650000,
    likeCount: 26000,
    averageRating: 4.5,
    ratingCount: 6900
  }
];

export const seedSongs = async () => {
  try {
    console.log('🌱 Iniciando inserción de canciones de prueba...');

    // Verificar si ya existen canciones
    const existingCount = await pool.query('SELECT COUNT(*) FROM songs');
    const count = parseInt(existingCount.rows[0].count);

    if (count > 0) {
      console.log(`ℹ️  Ya existen ${count} canciones en la base de datos`);
      return;
    }

    // Insertar canciones de prueba
    for (const song of sampleSongs) {
      const query = `
        INSERT INTO songs (
          title, artist_name, album, genre_id, language_code, 
          duration_seconds, view_count, like_count, average_rating, rating_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING song_id, title, artist_name
      `;

      const values = [
        song.title,
        song.artistName,
        song.album,
        song.genreId,
        song.languageCode,
        song.durationSeconds,
        song.viewCount,
        song.likeCount,
        song.averageRating,
        song.ratingCount
      ];

      const result = await pool.query(query, values);
      console.log(`✅ Insertada: ${result.rows[0].title} - ${result.rows[0].artist_name}`);
    }

    console.log(`🎉 Se insertaron ${sampleSongs.length} canciones de prueba exitosamente`);

  } catch (error) {
    console.error('❌ Error al insertar canciones de prueba:', error);
    throw error;
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  seedSongs()
    .then(() => {
      console.log('✅ Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}
