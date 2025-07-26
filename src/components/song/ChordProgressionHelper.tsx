import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Divider
} from '@mui/material';

import {
  MusicNote as ChordIcon,
  Add as AddIcon,
  PlayArrow as PlayIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Shuffle as RandomIcon,
  Piano as PianoIcon
} from '@mui/icons-material';

interface ChordProgressionHelperProps {
  onChordSelect?: (chord: string) => void;
  onProgressionSelect?: (progression: string[]) => void;
}

interface ChordProgression {
  name: string;
  chords: string[];
  key: string;
  genre: string;
  description: string;
}

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
      id={`chord-tabpanel-${index}`}
      aria-labelledby={`chord-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export const ChordProgressionHelper: React.FC<ChordProgressionHelperProps> = ({
  onChordSelect,
  onProgressionSelect
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedKey, setSelectedKey] = useState('C');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [customProgression, setCustomProgression] = useState<string[]>([]);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [newChord, setNewChord] = useState('');

  // Acordes básicos por tonalidad
  const chordsByKey: Record<string, string[]> = {
    'C': ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
    'G': ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
    'D': ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
    'A': ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
    'E': ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'],
    'B': ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim'],
    'F#': ['F#', 'G#m', 'A#m', 'B', 'C#', 'D#m', 'E#dim'],
    'F': ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'],
    'Bb': ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'Adim'],
    'Eb': ['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm', 'Ddim'],
    'Ab': ['Ab', 'Bbm', 'Cm', 'Db', 'Eb', 'Fm', 'Gdim'],
    'Db': ['Db', 'Ebm', 'Fm', 'Gb', 'Ab', 'Bbm', 'Cdim']
  };

  // Progresiones comunes
  const commonProgressions: ChordProgression[] = [
    {
      name: 'I-V-vi-IV',
      chords: ['C', 'G', 'Am', 'F'],
      key: 'C',
      genre: 'pop',
      description: 'La progresión más popular en música pop'
    },
    {
      name: 'vi-IV-I-V',
      chords: ['Am', 'F', 'C', 'G'],
      key: 'C',
      genre: 'pop',
      description: 'Progresión emotiva muy usada en baladas'
    },
    {
      name: 'I-vi-IV-V',
      chords: ['C', 'Am', 'F', 'G'],
      key: 'C',
      genre: 'classic',
      description: 'Progresión clásica de los años 50-60'
    },
    {
      name: 'ii-V-I',
      chords: ['Dm', 'G', 'C'],
      key: 'C',
      genre: 'jazz',
      description: 'Progresión fundamental del jazz'
    },
    {
      name: 'I-VII-♭VI-♭VII',
      chords: ['C', 'Bb', 'Ab', 'Bb'],
      key: 'C',
      genre: 'rock',
      description: 'Progresión de rock clásico'
    },
    {
      name: 'i-♭VII-♭VI-♭VII',
      chords: ['Am', 'G', 'F', 'G'],
      key: 'Am',
      genre: 'rock',
      description: 'Progresión menor de rock'
    },
    {
      name: 'I-V-vi-iii-IV-I-IV-V',
      chords: ['C', 'G', 'Am', 'Em', 'F', 'C', 'F', 'G'],
      key: 'C',
      genre: 'classic',
      description: 'Canon de Pachelbel'
    },
    {
      name: 'i-iv-V-i',
      chords: ['Am', 'Dm', 'G', 'Am'],
      key: 'Am',
      genre: 'classical',
      description: 'Progresión menor clásica'
    }
  ];

  const keys = Object.keys(chordsByKey);
  const genres = ['all', 'pop', 'rock', 'jazz', 'classical', 'classic'];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const transposeProgression = (progression: ChordProgression, targetKey: string) => {
    // Simplificado: solo cambia la tonalidad base
    const keyIndex = keys.indexOf(progression.key);
    const targetIndex = keys.indexOf(targetKey);
    const difference = targetIndex - keyIndex;
    
    if (difference === 0) return progression.chords;
    
    // Para simplificar, retornamos los acordes de la nueva tonalidad
    return chordsByKey[targetKey] || progression.chords;
  };

  const getFilteredProgressions = () => {
    return commonProgressions.filter(prog => 
      selectedGenre === 'all' || prog.genre === selectedGenre
    );
  };

  const addToCustomProgression = (chord: string) => {
    setCustomProgression(prev => [...prev, chord]);
  };

  const removeFromCustomProgression = (index: number) => {
    setCustomProgression(prev => prev.filter((_, i) => i !== index));
  };

  const clearCustomProgression = () => {
    setCustomProgression([]);
  };

  const addCustomChord = () => {
    if (newChord && !customProgression.includes(newChord)) {
      addToCustomProgression(newChord);
      setNewChord('');
      setCustomDialogOpen(false);
    }
  };

  const copyProgression = (chords: string[]) => {
    navigator.clipboard.writeText(chords.join(' - '));
  };

  const generateRandomProgression = () => {
    const availableChords = chordsByKey[selectedKey] || chordsByKey['C'];
    const length = Math.floor(Math.random() * 4) + 4; // 4-7 acordes
    const random = [];
    
    for (let i = 0; i < length; i++) {
      const randomChord = availableChords[Math.floor(Math.random() * availableChords.length)];
      random.push(randomChord);
    }
    
    setCustomProgression(random);
  };

  return (
    <Paper sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Acordes" icon={<ChordIcon />} />
          <Tab label="Progresiones" icon={<PianoIcon />} />
          <Tab label="Personalizada" icon={<AddIcon />} />
        </Tabs>
      </Box>

      {/* Controles de tonalidad y género */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Box sx={{ minWidth: 200 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Tonalidad</InputLabel>
              <Select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                label="Tonalidad"
              >
                {keys.map(key => (
                  <MenuItem key={key} value={key}>{key}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ minWidth: 200 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Género</InputLabel>
              <Select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                label="Género"
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="pop">Pop</MenuItem>
                <MenuItem value="rock">Rock</MenuItem>
                <MenuItem value="jazz">Jazz</MenuItem>
                <MenuItem value="classical">Clásico</MenuItem>
                <MenuItem value="classic">Vintage</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Button
              variant="outlined"
              startIcon={<RandomIcon />}
              onClick={generateRandomProgression}
              size="small"
            >
              Generar Aleatoria
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Tab 1: Acordes individuales */}
      <TabPanel value={activeTab} index={0}>
        <Typography variant="h6" gutterBottom>
          Acordes en {selectedKey}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {(chordsByKey[selectedKey] || []).map((chord, index) => (
            <Chip
              key={chord}
              label={chord}
              onClick={() => onChordSelect?.(chord)}
              color={index === 0 ? 'primary' : 'default'}
              sx={{
                cursor: 'pointer',
                fontSize: '1rem',
                height: 40,
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: '#ffffff'
                }
              }}
            />
          ))}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Acordes extendidos
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {['7', 'maj7', 'min7', 'sus2', 'sus4', 'add9', 'dim', 'aug'].map(extension => (
            <Chip
              key={extension}
              label={`${selectedKey}${extension}`}
              onClick={() => onChordSelect?.(`${selectedKey}${extension}`)}
              variant="outlined"
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'secondary.light',
                  color: '#ffffff'
                }
              }}
            />
          ))}
        </Box>
      </TabPanel>

      {/* Tab 2: Progresiones comunes */}
      <TabPanel value={activeTab} index={1}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {getFilteredProgressions().map((progression, index) => (
            <Box key={index} sx={{ minWidth: 300, maxWidth: 400, flex: '1 1 300px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {progression.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {progression.description}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip label={progression.genre} size="small" color="primary" />
                    <Chip label={`Tonalidad: ${progression.key}`} size="small" sx={{ ml: 1 }} />
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {transposeProgression(progression, selectedKey).map((chord, chordIndex) => (
                      <Chip
                        key={chordIndex}
                        label={chord}
                        size="small"
                        variant="outlined"
                        onClick={() => onChordSelect?.(chord)}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<PlayIcon />}
                    onClick={() => onProgressionSelect?.(transposeProgression(progression, selectedKey))}
                  >
                    Usar
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => copyProgression(transposeProgression(progression, selectedKey))}
                  >
                    <CopyIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      </TabPanel>

      {/* Tab 3: Progresión personalizada */}
      <TabPanel value={activeTab} index={2}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Tu progresión personalizada
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setCustomDialogOpen(true)}
            >
              Agregar Acorde
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={clearCustomProgression}
              disabled={customProgression.length === 0}
            >
              Limpiar
            </Button>
            <Button
              variant="contained"
              startIcon={<PlayIcon />}
              onClick={() => onProgressionSelect?.(customProgression)}
              disabled={customProgression.length === 0}
            >
              Usar Progresión
            </Button>
          </Box>
        </Box>

        {customProgression.length > 0 ? (
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {customProgression.map((chord, index) => (
                <Chip
                  key={index}
                  label={chord}
                  onDelete={() => removeFromCustomProgression(index)}
                  color="primary"
                  sx={{ fontSize: '1rem', height: 36 }}
                />
              ))}
            </Box>
          </Paper>
        ) : (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No hay acordes en tu progresión personalizada
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Agrega acordes para crear tu propia progresión
            </Typography>
          </Box>
        )}

        <Typography variant="subtitle1" gutterBottom>
          Acordes rápidos en {selectedKey}:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {(chordsByKey[selectedKey] || []).map(chord => (
            <Chip
              key={chord}
              label={chord}
              onClick={() => addToCustomProgression(chord)}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      </TabPanel>

      {/* Dialog para agregar acorde personalizado */}
      <Dialog open={customDialogOpen} onClose={() => setCustomDialogOpen(false)}>
        <DialogTitle>Agregar Acorde Personalizado</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Acorde"
            value={newChord}
            onChange={(e) => setNewChord(e.target.value)}
            placeholder="Ej: Cmaj7, F#m, Bb7sus4"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={addCustomChord} variant="contained" disabled={!newChord}>
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
