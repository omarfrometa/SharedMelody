import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  Divider,
  Paper
} from '@mui/material';

import {
  CloudUpload as UploadIcon,
  MusicNote as MusicIcon,
  VideoLibrary as VideoIcon,
  Description as SheetMusicIcon,
  Save as SaveIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CreateSong, MusicalGenre, Author, SongType } from '../types/song';
import { songService } from '../services/songService';
import { authorService } from '../services/authorService';
import { genreService } from '../services/genreService';
import { SongContentEditor } from '../components/song/SongContentEditor';
import { ArtistAutocomplete } from '../components/common/ArtistAutocomplete';

const SongUploadPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Datos del formulario
  const [formData, setFormData] = useState<CreateSong>({
    title: '',
    artistName: '',
    album: '',
    releaseYear: new Date().getFullYear(),
    lyrics: '',
    lyricsFormat: 'html',
    durationSeconds: 0,
    language: 'es',
    explicitContent: false,
    isCollaboration: false,
    comments: '',
    tags: []
  });

  // Datos adicionales del editor de contenido (comentados temporalmente)
  // const [songChords, setSongChords] = useState('');
  // const [songNotes, setSongNotes] = useState('');
  // const [songStructure, setSongStructure] = useState<any[]>([]);

  // Archivos
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [sheetMusicFile, setSheetMusicFile] = useState<File | null>(null);

  // Datos de catálogos
  const [genres, setGenres] = useState<MusicalGenre[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [songTypes, setSongTypes] = useState<SongType[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<MusicalGenre | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [selectedType, setSelectedType] = useState<SongType | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<{authorId: string, authorName: string} | null>(null);

  // const steps = [
  //   'Información básica',
  //   'Detalles musicales',
  //   'Contenido y archivos',
  //   'Revisión y publicación'
  // ];

  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    try {
      const [genresData, authorsData] = await Promise.all([
        genreService.getAllGenres(),
        authorService.getAuthors({ limit: 1000 })
      ]);
      
      setGenres(genresData);
      setAuthors(authorsData.data);
      
      // Tipos de canción hardcodeados por ahora
      setSongTypes([
        { typeId: '1', typeName: 'Original', typeDescription: 'Composición original', isActive: true, createdAt: '' },
        { typeId: '2', typeName: 'Cover', typeDescription: 'Interpretación de canción existente', isActive: true, createdAt: '' },
        { typeId: '3', typeName: 'Remix', typeDescription: 'Versión modificada', isActive: true, createdAt: '' },
        { typeId: '4', typeName: 'Instrumental', typeDescription: 'Versión sin letra', isActive: true, createdAt: '' },
        { typeId: '5', typeName: 'Acoustic', typeDescription: 'Versión acústica', isActive: true, createdAt: '' }
      ]);
    } catch (err: any) {
      setError(err.message || 'Error al cargar catálogos');
    }
  };

  const handleInputChange = (field: keyof CreateSong, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (type: 'audio' | 'video' | 'sheetMusic', file: File | null) => {
    switch (type) {
      case 'audio':
        setAudioFile(file);
        break;
      case 'video':
        setVideoFile(file);
        break;
      case 'sheetMusic':
        setSheetMusicFile(file);
        break;
    }
  };

  const handleTagsChange = (event: any, newValue: string[]) => {
    handleInputChange('tags', newValue);
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (!formData.title || !formData.artistName) {
          setError('Título y artista son obligatorios');
          return false;
        }
        break;
      case 1:
        // Validaciones opcionales para detalles musicales
        break;
      case 2:
        if (!audioFile && !formData.lyrics) {
          setError('Debes subir al menos un archivo de audio o agregar la letra');
          return false;
        }
        break;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Preparar datos de la canción
      const songData: CreateSong = {
        ...formData,
        genreId: selectedGenre?.genreId,
        authorId: selectedArtist?.authorId, // ID del artista seleccionado
        typeId: selectedType?.typeId
      };

      console.log('🎵 Datos a enviar:', songData);
      console.log('🎤 Artista seleccionado:', selectedArtist);
      console.log('🆔 Author ID a guardar:', selectedArtist?.authorId);

      // Crear la canción
      const createdSong = await songService.createSong(songData);
      console.log('🎵 Canción creada:', createdSong);
      console.log('🆔 ID de la canción:', createdSong.songId);

      // Subir archivos si existen
      if (audioFile) {
        await songService.uploadAudioFile(String(createdSong.songId), audioFile);
      }

      if (videoFile) {
        await songService.uploadVideoFile(String(createdSong.songId), videoFile);
      }

      if (sheetMusicFile) {
        await songService.uploadSheetMusic(String(createdSong.songId), sheetMusicFile);
      }

      const successMessage = isAdmin
        ? 'Canción publicada exitosamente'
        : 'Canción enviada para revisión exitosamente';
      setSuccess(successMessage);

      // Redirigir a la página de la canción después de un breve delay
      const songId = createdSong.songId;
      console.log('🔗 Redirigiendo a:', `/songs/${songId}`);
      setTimeout(() => {
        navigate(`/songs/${songId}`);
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Error al subir canción');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Debes iniciar sesión para subir canciones.
        </Alert>
      </Container>
    );
  }

  // Verificación temporal: permitir acceso a admins directamente
  const isAdmin = user?.role?.roleName === 'admin';
  const canUpload = hasPermission('can_upload_songs') || isAdmin;

  if (!canUpload) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          No tienes permisos para subir canciones.
          <br />
          <small>Usuario: {user?.username}, Rol: {user?.role?.roleName}, Es Admin: {isAdmin}</small>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Subir Nueva Canción
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Comparte tu música con la comunidad de SharedMelody.
      </Typography>

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

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Paso 1: Información básica */}
          <Step>
            <StepLabel>Información básica</StepLabel>
            <StepContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ minWidth: 300, flex: '1 1 300px' }}>
                    <TextField
                      fullWidth
                      label="Título de la canción"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                    />
                  </Box>
                  <Box sx={{ minWidth: 300, flex: '1 1 300px' }}>
                    <ArtistAutocomplete
                      value={formData.artistName}
                      onChange={(value) => handleInputChange('artistName', value)}
                      onAuthorSelect={(artist) => setSelectedArtist(artist)}
                      required
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ minWidth: 300, flex: '1 1 300px' }}>
                    <TextField
                      fullWidth
                      label="Álbum"
                      value={formData.album}
                      onChange={(e) => handleInputChange('album', e.target.value)}
                    />
                  </Box>
                  <Box sx={{ minWidth: 300, flex: '1 1 300px' }}>
                    <TextField
                      fullWidth
                      label="Año de lanzamiento"
                      type="number"
                      value={formData.releaseYear}
                      onChange={(e) => handleInputChange('releaseYear', parseInt(e.target.value))}
                      inputProps={{ min: 1900, max: new Date().getFullYear() + 10 }}
                    />
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ mr: 1 }}
                >
                  Siguiente
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Paso 2: Detalles musicales */}
          <Step>
            <StepLabel>Detalles musicales</StepLabel>
            <StepContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ minWidth: 300, flex: '1 1 300px' }}>
                    <Autocomplete
                      options={genres}
                      getOptionLabel={(option) => option.genreName}
                      value={selectedGenre}
                      onChange={(event, newValue) => setSelectedGenre(newValue)}
                      renderInput={(params) => (
                        <TextField {...params} label="Género musical" />
                      )}
                    />
                  </Box>
                  <Box sx={{ minWidth: 300, flex: '1 1 300px' }}>
                    <Autocomplete
                      options={authors}
                      getOptionLabel={(option) => option.authorName}
                      value={selectedAuthor}
                      onChange={(event, newValue) => setSelectedAuthor(newValue)}
                      renderInput={(params) => (
                        <TextField {...params} label="Autor/Compositor" />
                      )}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ minWidth: 300, flex: '1 1 300px' }}>
                    <FormControl fullWidth>
                      <InputLabel>Tipo de canción</InputLabel>
                      <Select
                        value={selectedType?.typeId || ''}
                        onChange={(e) => {
                          const type = songTypes.find(t => t.typeId === e.target.value);
                          setSelectedType(type || null);
                        }}
                        label="Tipo de canción"
                      >
                        {songTypes.map((type) => (
                          <MenuItem key={type.typeId} value={type.typeId}>
                            {type.typeName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ minWidth: 300, flex: '1 1 300px' }}>
                    <FormControl fullWidth>
                      <InputLabel>Idioma</InputLabel>
                      <Select
                        value={formData.language}
                        onChange={(e) => handleInputChange('language', e.target.value)}
                        label="Idioma"
                      >
                        <MenuItem value="es">Español</MenuItem>
                        <MenuItem value="en">Inglés</MenuItem>
                        <MenuItem value="fr">Francés</MenuItem>
                        <MenuItem value="it">Italiano</MenuItem>
                        <MenuItem value="pt">Portugués</MenuItem>
                        <MenuItem value="de">Alemán</MenuItem>
                        <MenuItem value="other">Otro</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={formData.tags || []}
                  onChange={handleTagsChange}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Etiquetas"
                      placeholder="Agrega etiquetas..."
                      helperText="Presiona Enter para agregar etiquetas"
                    />
                  )}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.explicitContent}
                        onChange={(e) => handleInputChange('explicitContent', e.target.checked)}
                      />
                    }
                    label="Contenido explícito"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isCollaboration}
                        onChange={(e) => handleInputChange('isCollaboration', e.target.checked)}
                      />
                    }
                    label="Esta es una colaboración"
                  />
                </Box>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ mr: 1 }}
                >
                  Siguiente
                </Button>
                <Button onClick={handleBack}>
                  Atrás
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Paso 3: Contenido y archivos */}
          <Step>
            <StepLabel>Contenido y archivos</StepLabel>
            <StepContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Contenido de la canción
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Utiliza el editor avanzado para agregar letra, acordes, estructura y notas sobre la canción.
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={15}
                    label="Letra de la canción"
                    value={formData.lyrics || ''}
                    onChange={(e) => handleInputChange('lyrics', e.target.value)}
                    placeholder="Escribe aquí la letra de tu canción..."
                    variant="outlined"
                    sx={{
                      '& .MuiInputBase-root': {
                        fontFamily: 'monospace',
                        fontSize: '0.95rem'
                      }
                    }}
                  />
                </Box>

                <Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Archivos multimedia
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {/* Audio File */}
                  <Box sx={{ minWidth: 300, flex: '1 1 300px' }}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <MusicIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          Archivo de audio
                        </Typography>
                        <input
                          accept="audio/*"
                          style={{ display: 'none' }}
                          id="audio-upload"
                          type="file"
                          onChange={(e) => handleFileChange('audio', e.target.files?.[0] || null)}
                        />
                        <label htmlFor="audio-upload">
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<UploadIcon />}
                            fullWidth
                          >
                            Subir Audio
                          </Button>
                        </label>
                        {audioFile && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {audioFile.name}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Box>

                  {/* Video File */}
                  <Box sx={{ minWidth: 300, flex: '1 1 300px' }}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <VideoIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          Video (opcional)
                        </Typography>
                        <input
                          accept="video/*"
                          style={{ display: 'none' }}
                          id="video-upload"
                          type="file"
                          onChange={(e) => handleFileChange('video', e.target.files?.[0] || null)}
                        />
                        <label htmlFor="video-upload">
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<UploadIcon />}
                            fullWidth
                          >
                            Subir Video
                          </Button>
                        </label>
                        {videoFile && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {videoFile.name}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Box>

                  {/* Sheet Music */}
                  <Box sx={{ minWidth: 300, flex: '1 1 300px' }}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <SheetMusicIcon sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          Partitura (opcional)
                        </Typography>
                        <input
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          style={{ display: 'none' }}
                          id="sheet-music-upload"
                          type="file"
                          onChange={(e) => handleFileChange('sheetMusic', e.target.files?.[0] || null)}
                        />
                        <label htmlFor="sheet-music-upload">
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<UploadIcon />}
                            fullWidth
                          >
                            Subir Partitura
                          </Button>
                        </label>
                        {sheetMusicFile && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {sheetMusicFile.name}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                </Box>

                <TextField
                  fullWidth
                  label="Comentarios adicionales"
                  value={formData.comments}
                  onChange={(e) => handleInputChange('comments', e.target.value)}
                  multiline
                  rows={3}
                  placeholder="Agrega cualquier información adicional sobre la canción..."
                />
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ mr: 1 }}
                >
                  Siguiente
                </Button>
                <Button onClick={handleBack}>
                  Atrás
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Paso 4: Revisión y publicación */}
          <Step>
            <StepLabel>Revisión y publicación</StepLabel>
            <StepContent>
              <Typography variant="h6" gutterBottom>
                Resumen de la canción
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <Typography variant="body2" color="text.secondary">Título:</Typography>
                    <Typography variant="body1">{formData.title}</Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <Typography variant="body2" color="text.secondary">Artista:</Typography>
                    <Typography variant="body1">{formData.artistName}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <Typography variant="body2" color="text.secondary">Género:</Typography>
                    <Typography variant="body1">{selectedGenre?.genreName || 'No especificado'}</Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <Typography variant="body2" color="text.secondary">Tipo:</Typography>
                    <Typography variant="body1">{selectedType?.typeName || 'No especificado'}</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Archivos:</Typography>
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {audioFile && <Chip label={`Audio: ${audioFile.name}`} />}
                    {videoFile && <Chip label={`Video: ${videoFile.name}`} />}
                    {sheetMusicFile && <Chip label={`Partitura: ${sheetMusicFile.name}`} />}
                    {formData.lyrics && <Chip label="Letra incluida" />}
                  </Box>
                </Box>
              </Box>

              {!isAdmin && (
                <Alert severity="info" sx={{ mt: 3 }}>
                  Tu canción será revisada por nuestro equipo antes de ser publicada.
                  Recibirás una notificación cuando esté disponible.
                </Alert>
              )}
              
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{ mr: 1 }}
                >
                  {loading ? 'Subiendo...' : 'Publicar Canción'}
                </Button>
                <Button onClick={handleBack} disabled={loading}>
                  Atrás
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>
      </Paper>
    </Container>
  );
};

export default SongUploadPage;
