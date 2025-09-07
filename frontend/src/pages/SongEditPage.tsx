import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Grid
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { songService } from '../services/songService';
import { authorService } from '../services/authorService';
import { genreService } from '../services/genreService';
import { SongDetailed, UpdateSong } from '../types/song';
import { Author } from '../types/song';
import { MusicalGenre } from '../types/song';
import { ArtistAutocomplete } from '../components/common/ArtistAutocomplete';

// Tipo para compatibilidad con ArtistAutocomplete
interface ArtistOption {
  authorId: string;
  authorName: string;
}

const SongEditPage: React.FC = () => {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  // Estados
  const [song, setSong] = useState<SongDetailed | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    title: '',
    artistId: '',
    albumId: '',
    genreId: '',
    lyrics: '',
    isExplicit: false,
    isPublic: true
  });

  // Datos de referencia
  const [authors, setAuthors] = useState<Author[]>([]);
  const [genres, setGenres] = useState<MusicalGenre[]>([]);

  // Estados para el autocomplete de artista
  const [selectedArtist, setSelectedArtist] = useState<ArtistOption | null>(null);
  const [artistName, setArtistName] = useState('');

  useEffect(() => {
    if (!hasRole('admin')) {
      navigate('/');
      return;
    }

    if (songId) {
      loadSong();
      loadReferenceData();
    }
  }, [songId, hasRole, navigate]);

  const loadSong = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!songId) {
        throw new Error('ID de canción no válido');
      }

      const numericSongId = parseInt(songId);
      if (isNaN(numericSongId)) {
        throw new Error('ID de canción debe ser un número válido');
      }

      const response = await songService.getSongById(numericSongId);
      const songData = response.data;

      setSong(songData);
      setFormData({
        title: songData.title || '',
        artistId: songData.artistId?.toString() || '',
        albumId: songData.albumId?.toString() || '',
        genreId: songData.genreId?.toString() || '',
        lyrics: songData.lyrics || '',
        isExplicit: songData.isExplicit || false,
        isPublic: songData.isPublic !== false
      });

      // Establecer el nombre del artista para el autocomplete
      setArtistName(songData.artistName || '');

      // Si hay un authorId, buscar el autor correspondiente
      if (songData.authorId) {
        try {
          const authorResponse = await authorService.getAuthor(songData.authorId);
          // Convertir Author a ArtistOption
          setSelectedArtist({
            authorId: authorResponse.authorId,
            authorName: authorResponse.authorName
          });
        } catch (error) {
          console.warn('No se pudo cargar el autor:', error);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar la canción');
    } finally {
      setLoading(false);
    }
  };

  const loadReferenceData = async () => {
    try {
      const [authorsResponse, genresResponse] = await Promise.all([
        authorService.getAuthors({ limit: 100 }),
        genreService.getGenres({ limit: 100 })
      ]);

      setAuthors(authorsResponse.data || []);
      setGenres(genresResponse.data || []);
    } catch (err) {
      console.error('Error cargando datos de referencia:', err);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!songId) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const updateData: any = {
        title: formData.title,
        artistId: formData.artistId ? parseInt(formData.artistId) : undefined,
        albumId: formData.albumId ? parseInt(formData.albumId) : undefined,
        genreId: formData.genreId ? parseInt(formData.genreId) : undefined,
        lyrics: formData.lyrics,
        isExplicit: formData.isExplicit,
        isPublic: formData.isPublic
      };

      await songService.updateSong(songId, updateData);
      
      setSuccess('Canción actualizada exitosamente');
      
      // Redirigir a la página de detalle después de un breve delay
      setTimeout(() => {
        navigate(`/songs/${songId}`);
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Error al actualizar la canción');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/songs/${songId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !song) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/')}
          variant="outlined"
        >
          Volver al inicio
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(`/songs/${songId}`)}
          sx={{ mb: 2 }}
        >
          Volver a la canción
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Editar Canción
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary">
          {song?.title}
        </Typography>
      </Box>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Formulario */}
      <Paper elevation={2} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Título */}
            <TextField
              fullWidth
              label="Título de la canción"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              variant="outlined"
            />

            {/* Artista y Género */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 5 }}>
                <ArtistAutocomplete
                  value={artistName}
                  onChange={setArtistName}
                  onAuthorSelect={(author) => {
                    setSelectedArtist(author);
                    if (author) {
                      handleInputChange('artistId', author.authorId.toString());
                    } else {
                      handleInputChange('artistId', '');
                    }
                  }}
                  label="Artista/Intérprete"
                  placeholder="Buscar o escribir nombre del artista..."
                  required
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, md: 7 }}>
                <FormControl fullWidth>
                  <InputLabel>Género</InputLabel>
                  <Select
                    value={formData.genreId}
                    onChange={(e) => handleInputChange('genreId', e.target.value)}
                    label="Género"
                  >
                    <MenuItem value="">
                      <em>Seleccionar género</em>
                    </MenuItem>
                    {genres.map((genre) => (
                      <MenuItem key={genre.genreId} value={genre.genreId}>
                        {genre.genreName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Letra */}
            <TextField
              fullWidth
              label="Letra de la canción"
              value={formData.lyrics}
              onChange={(e) => handleInputChange('lyrics', e.target.value)}
              multiline
              rows={10}
              variant="outlined"
              placeholder="Escribe aquí la letra de la canción..."
            />

            {/* Switches */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isExplicit}
                    onChange={(e) => handleInputChange('isExplicit', e.target.checked)}
                  />
                }
                label="Contenido explícito"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPublic}
                    onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                  />
                }
                label="Canción pública"
              />
            </Box>

            {/* Botones */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                startIcon={<CancelIcon />}
                disabled={saving}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default SongEditPage;
