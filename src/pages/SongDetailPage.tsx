import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Paper,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Rating,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Collapse,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Download as DownloadIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Person as PersonIcon,
  MusicNote as MusicIcon,
  Album as AlbumIcon,
  CalendarToday as CalendarIcon,
  Language as LanguageIcon,
  Visibility as ViewIcon,
  ThumbUp as ThumbUpIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  TextIncrease as TextIncreaseIcon,
  TextDecrease as TextDecreaseIcon,
  MusicOff as ChordIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  BugReport as CorrectIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { SongDetailed } from '../types/song';
import { songService } from '../services/songService';
import { statsService } from '../services/statsService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FavoriteButton } from '../components/FavoriteButton';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`song-tabpanel-${index}`}
      aria-labelledby={`song-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const SongDetailPage: React.FC = () => {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();

  const [song, setSong] = useState<SongDetailed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [comment, setComment] = useState('');
  const [chords, setChords] = useState<string[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showDetailedStats, setShowDetailedStats] = useState(false);

  // Estados para el menú flotante
  const [fontSize, setFontSize] = useState(16);
  const [chordTranspose, setChordTranspose] = useState(0);

  // Query para obtener estadísticas de visualización
  const { data: songStats } = useQuery({
    queryKey: ['songStats', songId],
    queryFn: () => songId ? statsService.getSongStats(parseInt(songId)) : null,
    enabled: !!songId
  });

  // Query para obtener la valoración del usuario
  const { data: userRating } = useQuery({
    queryKey: ['userRating', songId, user?.userId],
    queryFn: () => songId ? songService.getUserRating(songId) : null,
    enabled: !!songId && !!user
  });

  // Mutación para valorar canción
  const ratingMutation = useMutation({
    mutationFn: async (rating: number) => {
      if (!songId) throw new Error('No song ID');
      await songService.rateSong(songId, {
        songId,
        rating: rating as 1 | 2 | 3 | 4 | 5,
        reviewComment: ''
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRating', songId] });
      loadSong(); // Recargar para actualizar contadores
    }
  });

  useEffect(() => {
    if (songId) {
      loadSong();
      loadMockComments();
    }
    loadChords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songId]); // loadSong se define dentro del componente, no necesita estar en dependencias

  // Cargar comentarios simulados (temporal)
  const loadMockComments = () => {
    const mockComments = [
      {
        userName: 'María González',
        text: '¡Excelente canción! Me encanta cómo están resaltados los acordes, hace que sea muy fácil de tocar.',
        rating: 5,
        date: 'Hace 2 horas'
      },
      {
        userName: 'Carlos Rodríguez',
        text: 'Muy buena letra y los acordes están perfectos. Gracias por compartir.',
        rating: 4,
        date: 'Hace 1 día'
      },
      {
        userName: 'Ana Martínez',
        text: 'Me gusta mucho esta versión. ¿Podrían agregar más canciones de este estilo?',
        rating: 5,
        date: 'Hace 3 días'
      }
    ];
    setComments(mockComments);
  };

  // Cargar acordes desde el archivo JSON
  const loadChords = async () => {
    try {
      const response = await fetch('/chords.json');
      const data = await response.json();
      const chordList = data.acordes.map((chord: any) => chord.acorde);
      setChords(chordList);
    } catch (error) {
      console.error('Error cargando acordes:', error);
    }
  };

  // Función para transponer un acorde
  const transposeChord = (chord: string, semitones: number): string => {
    // Mapeo de notas básicas
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteAliases: { [key: string]: string } = {
      'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
    };

    // Limpiar espacios y extraer la nota raíz del acorde
    const cleanChord = chord.replace(/\s+/g, ''); // Remover espacios
    let rootNote = '';
    let chordSuffix = '';

    // Buscar la nota raíz (puede ser de 1 o 2 caracteres)
    if (cleanChord.length >= 2 && (cleanChord[1] === '#' || cleanChord[1] === 'b')) {
      rootNote = cleanChord.substring(0, 2);
      chordSuffix = cleanChord.substring(2);
    } else {
      rootNote = cleanChord.substring(0, 1);
      chordSuffix = cleanChord.substring(1);
    }

    // Convertir alias a nota estándar
    const standardNote = noteAliases[rootNote] || rootNote;

    // Encontrar el índice de la nota en el array
    const noteIndex = notes.indexOf(standardNote);
    if (noteIndex === -1) {
      return chord; // Si no se encuentra la nota, devolver el acorde original
    }

    // Calcular la nueva posición con la transposición
    let newIndex = (noteIndex + semitones) % 12;
    if (newIndex < 0) {
      newIndex += 12;
    }

    // Construir el nuevo acorde (sin espacios)
    const newRootNote = notes[newIndex];
    return newRootNote + chordSuffix;
  };

  // Función para determinar si una línea contiene acordes o letra
  const isChordLine = (line: string): boolean => {
    // Dividir la línea en palabras (separadas por espacios)
    const words = line.trim().split(/\s+/).filter(word => word.length > 0);

    // Si no hay palabras, no es línea de acordes
    if (words.length === 0) {
      return false;
    }

    let chordCount = 0;
    let nonChordWords = 0;

    for (const word of words) {
      // Limpiar la palabra de caracteres especiales al inicio y final
      const cleanWord = word.replace(/^[^\w#b]+|[^\w#b]+$/g, '');

      if (cleanWord.length === 0) continue;

      // Verificar si es un acorde válido
      const isValidChord = chords.some(chord => {
        // Comparación exacta
        if (chord.toLowerCase() === cleanWord.toLowerCase()) return true;

        // Verificar si es una variación del acorde
        const wordRoot = cleanWord.match(/^[A-G][#b]?/)?.[0];
        const chordRoot = chord.match(/^[A-G][#b]?/)?.[0];

        return wordRoot && chordRoot &&
               wordRoot.toLowerCase() === chordRoot.toLowerCase();
      });

      if (isValidChord) {
        chordCount++;
      } else {
        nonChordWords++;
      }
    }

    // Lógica mejorada:
    // 1. Si TODAS las palabras son acordes válidos, es línea de acordes
    if (chordCount === words.length) {
      return true;
    }

    // 2. Si hay más de 3 palabras Y hay palabras que no son acordes, probablemente es letra
    if (words.length > 3 && nonChordWords > 0) {
      return false;
    }

    // 3. Para líneas cortas (≤3 palabras), es línea de acordes si al menos 70% son acordes
    return (chordCount / words.length) >= 0.7;
  };

  // Función para resaltar acordes en el texto
  const highlightChords = (text: string): React.ReactNode => {
    if (!text || chords.length === 0) {
      return text;
    }

    // Procesar el texto línea por línea
    const lines = text.split('\n');
    const result: (string | React.ReactElement)[] = [];

    lines.forEach((line, lineIndex) => {
      if (lineIndex > 0) {
        result.push('\n'); // Agregar salto de línea entre líneas
      }

      // Determinar si esta línea contiene acordes
      if (isChordLine(line)) {
        // Es una línea de acordes, procesarla para formatear acordes
        const processedLine = processChordLine(line, lineIndex);
        result.push(...processedLine);
      } else {
        // Es una línea de letra, agregarla sin formatear
        result.push(line);
      }
    });

    return result;
  };

  // Función para procesar una línea que contiene acordes
  const processChordLine = (line: string, lineIndex: number): (string | React.ReactElement)[] => {
    const result: (string | React.ReactElement)[] = [];
    let currentIndex = 0;

    // Buscar todas las notas musicales en la línea
    const notePattern = /([A-G])/g;
    let noteMatch;

    while ((noteMatch = notePattern.exec(line)) !== null) {
      const noteStart = noteMatch.index;
      const note = noteMatch[1];

      // Agregar texto antes de la nota
      if (noteStart > currentIndex) {
        result.push(line.substring(currentIndex, noteStart));
      }

      // Buscar qué viene después de la nota
      let chordEnd = noteStart + 1;
      let possibleChord = note;

      // Verificar si hay alteración (# o b) después de la nota (con o sin espacios)
      let nextIndex = chordEnd;
      while (nextIndex < line.length && /\s/.test(line[nextIndex])) {
        nextIndex++; // Saltar espacios
      }

      if (nextIndex < line.length && /[#b]/.test(line[nextIndex])) {
        possibleChord += line[nextIndex];
        chordEnd = nextIndex + 1;
      }

      // Buscar sufijos del acorde (m, maj, 7, etc.)
      while (chordEnd < line.length && /[a-z0-9]/.test(line[chordEnd])) {
        possibleChord += line[chordEnd];
        chordEnd++;
      }

      // Verificar si es un acorde válido
      const isValidChord = chords.some(chord => {
        // Comparación exacta
        if (chord.toLowerCase() === possibleChord.toLowerCase()) return true;

        // Verificar si es una variación del acorde
        const chordRoot = possibleChord.match(/^[A-G][#b]?/)?.[0];
        const knownChordRoot = chord.match(/^[A-G][#b]?/)?.[0];

        return chordRoot && knownChordRoot &&
               chordRoot.toLowerCase() === knownChordRoot.toLowerCase();
      });

      if (isValidChord) {
        // Es un acorde válido, aplicar transposición y formateo
        const transposedChord = chordTranspose !== 0 ?
          transposeChord(possibleChord, chordTranspose) :
          possibleChord;

        result.push(
          <span
            key={`chord-${lineIndex}-${noteStart}`}
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#4caf50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              padding: '2px 4px',
              borderRadius: '4px',
              margin: '0 1px'
            }}
          >
            {transposedChord}
          </span>
        );
        currentIndex = chordEnd;

        // Actualizar la posición del regex para evitar procesar el mismo texto
        notePattern.lastIndex = chordEnd;
      } else {
        // No es un acorde, agregar solo la nota como texto normal
        result.push(note);
        currentIndex = noteStart + 1;
      }
    }

    // Agregar cualquier texto restante de la línea
    if (currentIndex < line.length) {
      result.push(line.substring(currentIndex));
    }

    return result;
  };

  const loadSong = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!songId) {
        throw new Error('ID de canción no válido');
      }

      console.log('🔍 Cargando canción con ID:', songId);

      // Validar que songId es un número válido
      const numericSongId = parseInt(songId);
      if (isNaN(numericSongId)) {
        throw new Error('ID de canción debe ser un número válido');
      }

      // Cargar datos reales de la canción usando el servicio
      const response = await songService.getSongById(numericSongId);
      console.log('📡 Respuesta del backend:', response);

      if (!response || !response.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      const songData = response.data;
      console.log('🎵 Datos de la canción:', songData);

      // Convertir los datos del backend al formato esperado por el frontend
      const detailedSong: SongDetailed = {
        songId: songData.songId?.toString() || songId,
        title: songData.title || 'Título desconocido',
        artistName: songData.artistName || 'Artista desconocido',
        album: songData.albumName || undefined,
        releaseYear: undefined, // No disponible en el backend actual
        lyrics: songData.lyrics || '',
        lyricsFormat: 'plain',
        audioFileUrl: songData.fileUrl || undefined,
        durationSeconds: songData.duration ? parseInt(songData.duration) : 0,
        language: 'es', // Por defecto español
        explicitContent: songData.isExplicit || false,
        uploadedBy: songData.uploadedBy?.toString() || '',
        uploadedByUsername: 'usuario', // No disponible en el backend actual
        uploadedByName: 'Usuario', // No disponible en el backend actual
        isCollaboration: false, // No disponible en el backend actual
        status: songData.isApproved ? 'approved' : 'pending',
        viewCount: parseInt(songData.playsCount) || 0,
        downloadCount: 0, // No disponible en el backend actual
        likeCount: 0, // No disponible en el backend actual
        averageRating: 0, // No disponible en el backend actual
        ratingCount: 0, // No disponible en el backend actual
        comments: '', // No disponible en el backend actual
        tags: [songData.genreName].filter(Boolean), // Usar el género como tag
        createdAt: songData.uploadDate || new Date().toISOString(),
        updatedAt: songData.uploadDate || new Date().toISOString()
      };

      setSong(detailedSong);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la canción');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Aquí iría la lógica para reproducir/pausar el audio
  };



  const handleDownload = async () => {
    if (!songId) return;
    try {
      await songService.downloadSong(songId);
    } catch (error) {
      console.error('Error downloading song:', error);
      alert('Error al descargar la canción');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: song?.title,
        text: `Escucha "${song?.title}" de ${song?.artistName}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  const handleRating = (_event: React.SyntheticEvent, newValue: number | null) => {
    if (!user) {
      alert('Debes iniciar sesión para valorar una canción');
      return;
    }
    if (newValue) {
      ratingMutation.mutate(newValue);
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      alert('Debes iniciar sesión para comentar');
      return;
    }
    if (!comment.trim()) {
      alert('Por favor escribe un comentario');
      return;
    }

    setSubmittingComment(true);
    try {
      // Aquí iría la lógica para enviar el comentario
      // Por ahora solo simulamos
      await new Promise(resolve => setTimeout(resolve, 1000));
      setComment('');
      alert('Comentario enviado exitosamente');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Error al enviar el comentario');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Funciones para el menú flotante
  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12));
  };

  const transposeUp = () => {
    setChordTranspose(prev => Math.min(prev + 1, 6));
  };

  const transposeDown = () => {
    setChordTranspose(prev => Math.max(prev - 1, -6));
  };

  const handleCorrect = () => {
    if (!user) {
      alert('Debes iniciar sesión para reportar correcciones');
      return;
    }
    // Aquí iría la lógica para reportar correcciones
    alert('Función de corrección en desarrollo');
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !song) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'Canción no encontrada'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} className="print-container">
      {/* Encabezado para impresión */}
      <div className="print-only song-header">
        <img
          src="/logo.png"
          alt="Logo"
          className="song-logo"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="song-title">{song.title}</div>
        <div className="song-info">
          <div className="song-artist">Artista: {song.artistName}</div>
          <div className="song-singer">Intérprete: {song.artistName}</div>
        </div>
      </div>

      {/* Header de la canción */}
      <Card sx={{ mb: 4 }} className="no-print">
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          <Box sx={{ minWidth: 300, flex: '1 1 300px', maxWidth: { xs: '100%', md: '33.333%' } }}>
            <CardMedia
              component="div"
              sx={{
                height: 300,
                backgroundColor: 'grey.300',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <MusicIcon sx={{ fontSize: 80, color: 'grey.600' }} />
            </CardMedia>
          </Box>
          <Box sx={{ minWidth: 400, flex: '2 1 400px' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {song.title}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {song.artistName}
              </Typography>
              
              {song.album && (
                <Box display="flex" alignItems="center" mb={1}>
                  <AlbumIcon sx={{ mr: 1, fontSize: 16 }} />
                  <Typography variant="body2">
                    {song.album} {song.releaseYear && `(${song.releaseYear})`}
                  </Typography>
                </Box>
              )}

              <Box display="flex" alignItems="center" mb={2}>
                <CalendarIcon sx={{ mr: 1, fontSize: 16 }} />
                <Typography variant="body2" sx={{ mr: 3 }}>
                  Duración: {formatDuration(song.durationSeconds || 0)}
                </Typography>
                <LanguageIcon sx={{ mr: 1, fontSize: 16 }} />
                <Typography variant="body2">
                  {song.language === 'es' ? 'Español' : 'Inglés'}
                </Typography>
              </Box>

              <Box display="flex" gap={1} mb={2}>
                {song.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" />
                ))}
              </Box>

              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Rating
                  value={song.averageRating}
                  precision={0.1}
                  readOnly
                  size="small"
                />
                <Typography variant="body2">
                  {song.averageRating.toFixed(1)} ({song.ratingCount} valoraciones)
                </Typography>
              </Box>

              <Box display="flex" gap={2} mt="auto">
                <Button
                  variant="contained"
                  startIcon={isPlaying ? <PauseIcon /> : <PlayIcon />}
                  onClick={handlePlayPause}
                  disabled={!song.audioFileUrl}
                >
                  {isPlaying ? 'Pausar' : 'Reproducir'}
                </Button>
                
                <FavoriteButton
                  songId={parseInt(songId!)}
                  songTitle={song.title}
                  size="medium"
                  onFavoriteChange={(isFavorite, songId) => {
                    console.log(`Canción ${songId} ${isFavorite ? 'agregada a' : 'removida de'} favoritos`);
                    // Recargar datos de la canción para actualizar contadores
                    loadSong();
                  }}
                />

                <IconButton onClick={handleDownload}>
                  <DownloadIcon />
                </IconButton>

                <IconButton onClick={handleShare}>
                  <ShareIcon />
                </IconButton>

                {/* Botones de administración solo para administradores */}
                {hasRole('admin') && (
                  <>
                    <IconButton
                      onClick={() => navigate(`/songs/${songId}/edit`)}
                      color="primary"
                      title="Editar canción"
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      onClick={() => navigate(`/songs/${songId}/history`)}
                      color="secondary"
                      title="Ver historial de versiones"
                    >
                      <HistoryIcon />
                    </IconButton>
                  </>
                )}
              </Box>
            </CardContent>
          </Box>
        </Box>
      </Card>

      {/* Estadísticas */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }} className="no-print">
        <Box sx={{ minWidth: 150, flex: '1 1 150px' }}>
          <Tooltip title="Click para ver estadísticas detalladas">
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText'
                }
              }}
              onClick={() => setShowDetailedStats(!showDetailedStats)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <ViewIcon color="inherit" />
                {showDetailedStats ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Box>
              <Typography variant="h6">
                {songStats?.totalViews || song.viewCount || 0}
              </Typography>
              <Typography variant="body2">
                Vistas Totales
              </Typography>
            </Paper>
          </Tooltip>
        </Box>
        <Box sx={{ minWidth: 150, flex: '1 1 150px' }}>
          <Paper sx={{
            p: 2,
            textAlign: 'center',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 2
            }
          }}>
            <PersonIcon color="info" />
            <Typography variant="h6">
              {songStats?.uniqueVisitors || 0}
            </Typography>
            <Typography variant="body2">Visitantes Únicos</Typography>
          </Paper>
        </Box>
        <Box sx={{ minWidth: 150, flex: '1 1 150px' }}>
          <Paper sx={{
            p: 2,
            textAlign: 'center',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 2
            }
          }}>
            <FavoriteIcon color="error" />
            <Typography variant="h6">{song.likeCount || 0}</Typography>
            <Typography variant="body2">Favoritos</Typography>
          </Paper>
        </Box>
        <Box sx={{ minWidth: 150, flex: '1 1 150px' }}>
          <Paper sx={{
            p: 2,
            textAlign: 'center',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 2
            }
          }}>
            <ThumbUpIcon color="success" />
            <Typography variant="h6">{song.ratingCount || 0}</Typography>
            <Typography variant="body2">Valoraciones</Typography>
          </Paper>
        </Box>
      </Box>

      {/* Estadísticas adicionales de visualización */}
      <Collapse in={showDetailedStats} timeout={500} className="no-print">
        {songStats && (
          <Box sx={{
            mb: 4,
            p: 3,
            backgroundColor: 'grey.50',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200'
          }}>
            <Typography variant="h6" gutterBottom sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'primary.main'
            }}>
              📊 Estadísticas Detalladas de Visualización
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              <Box sx={{ minWidth: 120, flex: '1 1 120px' }}>
                <Paper sx={{
                  p: 2,
                  textAlign: 'center',
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}>
                  <Typography variant="h6">{songStats.viewsToday}</Typography>
                  <Typography variant="body2">Hoy</Typography>
                </Paper>
              </Box>
              <Box sx={{ minWidth: 120, flex: '1 1 120px' }}>
                <Paper sx={{
                  p: 2,
                  textAlign: 'center',
                  backgroundColor: 'secondary.main',
                  color: 'secondary.contrastText',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}>
                  <Typography variant="h6">{songStats.viewsThisWeek}</Typography>
                  <Typography variant="body2">Esta Semana</Typography>
                </Paper>
              </Box>
              <Box sx={{ minWidth: 120, flex: '1 1 120px' }}>
                <Paper sx={{
                  p: 2,
                  textAlign: 'center',
                  backgroundColor: 'success.main',
                  color: 'success.contrastText',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}>
                  <Typography variant="h6">{songStats.viewsThisMonth}</Typography>
                  <Typography variant="body2">Este Mes</Typography>
                </Paper>
              </Box>
              <Box sx={{ minWidth: 120, flex: '1 1 120px' }}>
                <Paper sx={{
                  p: 2,
                  textAlign: 'center',
                  backgroundColor: 'info.main',
                  color: 'info.contrastText',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}>
                  <Typography variant="h6">{songStats.uniqueVisitors}</Typography>
                  <Typography variant="body2">Visitantes Únicos</Typography>
                </Paper>
              </Box>
            </Box>

            {/* Información adicional */}
            <Box sx={{ mt: 3, p: 2, backgroundColor: 'white', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                💡 Las estadísticas se actualizan en tiempo real.
              </Typography>
            </Box>
          </Box>
        )}
      </Collapse>

      {/* Contenido con pestañas */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }} className="no-print">
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Letras & Acordes" />
            <Tab label="Información" />
            <Tab label="Comentarios" />
          </Tabs>
        </Box>

        {/* Tab 1: Letra */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ position: 'relative' }}>
            <Typography variant="h6" gutterBottom className="no-print">
              &nbsp;
            </Typography>
            {song.lyrics ? (
              <Box sx={{
                whiteSpace: 'pre-wrap',
                lineHeight: 1.8,
                fontSize: `${fontSize}px`,
                transition: 'font-size 0.3s ease',
                pr: { md: '120px' } // Espacio para el menú flotante en desktop
              }} className="song-content">
                <Typography variant="body1" component="div" sx={{ fontSize: 'inherit' }} className="song-lyrics">
                  {highlightChords(song.lyrics)}
                </Typography>
              </Box>
            ) : (
              <Typography color="text.secondary">
                No hay letra disponible para esta canción.
              </Typography>
            )}

            {/* Menú flotante - Solo visible en el tab de Letras & Acordes */}
            {activeTab === 0 && (
              <Box
                sx={{
                  position: 'fixed',
                  right: { xs: 24, md: 40 },
                  top: '60%',
                  transform: 'translateY(-50%)',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  '@media (max-width: 768px)': {
                    right: 16,
                    gap: 0.5
                  }
                }}
                className="floating-menu no-print"
              >
                {/* Contenedor del menú */}
                <Paper
                  elevation={8}
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    minWidth: { xs: 70, md: 90 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  {/* Sección Texto */}
                  <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.7rem' }}>
                      TEXTO
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <Tooltip title="Aumentar tamaño del texto" placement="left">
                        <IconButton
                          size="small"
                          onClick={increaseFontSize}
                          disabled={fontSize >= 24}
                          sx={{
                            backgroundColor: fontSize >= 24 ? 'grey.200' : 'primary.main',
                            color: fontSize >= 24 ? 'grey.500' : 'white',
                            '&:hover': {
                              backgroundColor: fontSize >= 24 ? 'grey.300' : 'primary.dark'
                            },
                            width: 36,
                            height: 36
                          }}
                        >
                          <TextIncreaseIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Typography variant="caption" sx={{ textAlign: 'center', fontSize: '0.7rem', color: 'text.secondary', fontWeight: 500 }}>
                        {fontSize}px
                      </Typography>
                      <Tooltip title="Disminuir tamaño del texto" placement="left">
                        <IconButton
                          size="small"
                          onClick={decreaseFontSize}
                          disabled={fontSize <= 12}
                          sx={{
                            backgroundColor: fontSize <= 12 ? 'grey.200' : 'primary.main',
                            color: fontSize <= 12 ? 'grey.500' : 'white',
                            '&:hover': {
                              backgroundColor: fontSize <= 12 ? 'grey.300' : 'primary.dark'
                            },
                            width: 36,
                            height: 36
                          }}
                        >
                          <TextDecreaseIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Sección Acordes */}
                  <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.7rem' }}>
                      ACORDES
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <Tooltip title="Subir medio tono" placement="left">
                        <IconButton
                          size="small"
                          onClick={transposeUp}
                          disabled={chordTranspose >= 6}
                          sx={{
                            backgroundColor: chordTranspose >= 6 ? 'grey.200' : 'secondary.main',
                            color: chordTranspose >= 6 ? 'grey.500' : 'white',
                            '&:hover': {
                              backgroundColor: chordTranspose >= 6 ? 'grey.300' : 'secondary.dark'
                            },
                            width: 36,
                            height: 36
                          }}
                        >
                          <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Typography variant="caption" sx={{ textAlign: 'center', fontSize: '0.7rem', color: 'text.secondary', fontWeight: 500 }}>
                        {chordTranspose > 0 ? `+${chordTranspose}` : chordTranspose}
                      </Typography>
                      <Tooltip title="Bajar medio tono" placement="left">
                        <IconButton
                          size="small"
                          onClick={transposeDown}
                          disabled={chordTranspose <= -6}
                          sx={{
                            backgroundColor: chordTranspose <= -6 ? 'grey.200' : 'secondary.main',
                            color: chordTranspose <= -6 ? 'grey.500' : 'white',
                            '&:hover': {
                              backgroundColor: chordTranspose <= -6 ? 'grey.300' : 'secondary.dark'
                            },
                            width: 36,
                            height: 36
                          }}
                        >
                          <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Sección Acciones */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.7rem' }}>
                      ACCIONES
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <Tooltip title="Reportar corrección" placement="left">
                        <IconButton
                          size="small"
                          onClick={handleCorrect}
                          sx={{
                            backgroundColor: 'warning.main',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'warning.dark'
                            },
                            width: 36,
                            height: 36
                          }}
                        >
                          <CorrectIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Imprimir" placement="left">
                        <IconButton
                          size="small"
                          onClick={handlePrint}
                          sx={{
                            backgroundColor: 'success.main',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'success.dark'
                            },
                            width: 36,
                            height: 36
                          }}
                        >
                          <PrintIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Tab 2: Información */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom>
            Información de la canción
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ minWidth: 250, flex: '1 1 250px' }}>
                <Typography variant="body2" color="text.secondary">Subido por:</Typography>
                <Box display="flex" alignItems="center" mt={1}>
                  <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body1">{song.uploadedByName}</Typography>
                    <Typography variant="caption">@{song.uploadedByUsername}</Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ minWidth: 250, flex: '1 1 250px' }}>
                <Typography variant="body2" color="text.secondary">Fecha de subida:</Typography>
                <Typography variant="body1">
                  {new Date(song.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Comentarios del colaborador:</Typography>
              <Typography variant="body1">
                {song.comments || 'Sin comentarios adicionales'}
              </Typography>
            </Box>
          </Box>
        </TabPanel>

        {/* Tab 3: Comentarios */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>
            Valoración y comentarios
          </Typography>
          
          {user && (
            <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tu valoración:
              </Typography>
              <Rating
                value={userRating?.rating || 0}
                onChange={handleRating}
                size="large"
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Escribe un comentario sobre esta canción..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                sx={{ mt: 2 }}
                disabled={submittingComment}
              />
              <Button
                variant="contained"
                sx={{ mt: 1 }}
                onClick={handleSubmitComment}
                disabled={submittingComment || !comment.trim()}
              >
                {submittingComment ? <CircularProgress size={20} /> : 'Enviar comentario'}
              </Button>
            </Box>
          )}

          {/* Lista de comentarios */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              💬 Comentarios ({comments.length})
            </Typography>

            {comments.length > 0 ? (
              <List>
                {comments.map((comment, index) => (
                  <ListItem key={index} alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">
                            {comment.userName || 'Usuario'}
                          </Typography>
                          {comment.rating && (
                            <Rating value={comment.rating} size="small" readOnly />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {comment.text}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {comment.date || 'Hace un momento'}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'grey.50' }}>
                <Typography variant="body2" color="text.secondary">
                  Aún no hay comentarios para esta canción.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ¡Sé el primero en comentar!
                </Typography>
              </Paper>
            )}
          </Box>
        </TabPanel>
      </Card>
    </Container>
  );
};

export default SongDetailPage;
