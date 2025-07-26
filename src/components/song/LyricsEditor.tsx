import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import {
  MusicNote as ChordIcon,
  Lyrics as LyricsIcon,
  Visibility as PreviewIcon,
  Code as CodeIcon,
  PlayArrow as PlayIcon,
  Timer as TimestampIcon,
  VolumeUp as VolumeIcon,
  Mic as VocalIcon,
  Piano as InstrumentIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { RichTextEditor } from '../common/RichTextEditor';

interface LyricsEditorProps {
  value: string;
  onChange: (value: string) => void;
  chords?: string;
  onChordsChange?: (chords: string) => void;
  structure?: SongStructure[];
  onStructureChange?: (structure: SongStructure[]) => void;
}

interface SongStructure {
  id: string;
  type: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro' | 'solo';
  label: string;
  content: string;
  chords?: string;
  timestamp?: string;
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
      id={`lyrics-tabpanel-${index}`}
      aria-labelledby={`lyrics-tab-${index}`}
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

export const LyricsEditor: React.FC<LyricsEditorProps> = ({
  value,
  onChange,
  chords = '',
  onChordsChange,
  structure = [],
  onStructureChange
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [structureDialogOpen, setStructureDialogOpen] = useState(false);
  const [newStructure, setNewStructure] = useState<Partial<SongStructure>>({
    type: 'verse',
    label: '',
    content: ''
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleChordInsert = useCallback((chord: string) => {
    console.log('Acorde insertado:', chord);
  }, []);

  const handleTimestampInsert = useCallback((timestamp: string) => {
    console.log('Timestamp insertado:', timestamp);
  }, []);

  const addStructureSection = () => {
    if (newStructure.type && newStructure.label && onStructureChange) {
      const section: SongStructure = {
        id: Date.now().toString(),
        type: newStructure.type as SongStructure['type'],
        label: newStructure.label,
        content: newStructure.content || '',
        chords: newStructure.chords || '',
        timestamp: newStructure.timestamp
      };
      
      onStructureChange([...structure, section]);
      setNewStructure({ type: 'verse', label: '', content: '' });
      setStructureDialogOpen(false);
    }
  };

  const updateStructureSection = (id: string, updates: Partial<SongStructure>) => {
    if (onStructureChange) {
      const updatedStructure = structure.map(section =>
        section.id === id ? { ...section, ...updates } : section
      );
      onStructureChange(updatedStructure);
    }
  };

  const removeStructureSection = (id: string) => {
    if (onStructureChange) {
      const updatedStructure = structure.filter(section => section.id !== id);
      onStructureChange(updatedStructure);
    }
  };

  const getSectionIcon = (type: SongStructure['type']) => {
    switch (type) {
      case 'verse': return <LyricsIcon />;
      case 'chorus': return <VolumeIcon />;
      case 'bridge': return <ChordIcon />;
      case 'intro': return <PlayIcon />;
      case 'outro': return <PlayIcon style={{ transform: 'rotate(180deg)' }} />;
      case 'solo': return <InstrumentIcon />;
      default: return <LyricsIcon />;
    }
  };

  const getSectionColor = (type: SongStructure['type']) => {
    switch (type) {
      case 'verse': return 'primary';
      case 'chorus': return 'secondary';
      case 'bridge': return 'success';
      case 'intro': return 'info';
      case 'outro': return 'warning';
      case 'solo': return 'error';
      default: return 'default';
    }
  };

  const generatePreview = () => {
    let preview = '';
    structure.forEach(section => {
      preview += `\n[${section.label}]\n`;
      if (section.chords) {
        preview += `Acordes: ${section.chords}\n`;
      }
      preview += `${section.content}\n`;
    });
    return preview || value;
  };

  return (
    <Paper sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="editor de letras">
          <Tab label="Letra" icon={<LyricsIcon />} />
          <Tab label="Acordes" icon={<ChordIcon />} />
          <Tab label="Estructura" icon={<CodeIcon />} />
          <Tab label="Vista previa" icon={<PreviewIcon />} />
        </Tabs>
      </Box>

      {/* Tab 1: Letra */}
      <TabPanel value={activeTab} index={0}>
        <RichTextEditor
          value={value}
          onChange={onChange}
          mode="lyrics"
          showMusicTools={true}
          onChordInsert={handleChordInsert}
          onTimestampInsert={handleTimestampInsert}
          placeholder="Escribe la letra de la canción aquí..."
          minHeight={300}
          allowedFormats={['bold', 'italic', 'underline', 'align']}
        />
      </TabPanel>

      {/* Tab 2: Acordes */}
      <TabPanel value={activeTab} index={1}>
        <RichTextEditor
          value={chords}
          onChange={onChordsChange || (() => {})}
          mode="chords"
          showMusicTools={true}
          onChordInsert={handleChordInsert}
          placeholder="Escribe los acordes de la canción aquí..."
          minHeight={300}
          allowedFormats={['bold', 'italic', 'align']}
        />
      </TabPanel>

      {/* Tab 3: Estructura */}
      <TabPanel value={activeTab} index={2}>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setStructureDialogOpen(true)}
          >
            Agregar Sección
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {structure.map((section, index) => (
            <Box key={section.id} sx={{ minWidth: 300, maxWidth: 500, flex: '1 1 300px' }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center">
                      {getSectionIcon(section.type)}
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        {section.label}
                      </Typography>
                      <Chip
                        label={section.type}
                        color={getSectionColor(section.type) as any}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => removeStructureSection(section.id)}
                        color="error"
                      >
                        ×
                      </IconButton>
                    </Box>
                  </Box>

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={section.content}
                    onChange={(e) => updateStructureSection(section.id, { content: e.target.value })}
                    placeholder="Contenido de la sección..."
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    value={section.chords || ''}
                    onChange={(e) => updateStructureSection(section.id, { chords: e.target.value })}
                    placeholder="Acordes (opcional)"
                    size="small"
                  />

                  {section.timestamp && (
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        icon={<TimestampIcon />}
                        label={section.timestamp}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {structure.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No hay secciones definidas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Agrega secciones para organizar mejor la estructura de tu canción
            </Typography>
          </Box>
        )}
      </TabPanel>

      {/* Tab 4: Vista previa */}
      <TabPanel value={activeTab} index={3}>
        <Paper variant="outlined" sx={{ p: 3, minHeight: 300, backgroundColor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            Vista previa de la canción
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography
            component="pre"
            sx={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              lineHeight: 1.6
            }}
          >
            {generatePreview()}
          </Typography>
        </Paper>
      </TabPanel>

      {/* Dialog para agregar estructura */}
      <Dialog open={structureDialogOpen} onClose={() => setStructureDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Sección</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Tipo de sección</InputLabel>
                <Select
                  value={newStructure.type || 'verse'}
                  onChange={(e) => setNewStructure(prev => ({ ...prev, type: e.target.value as SongStructure['type'] }))}
                  label="Tipo de sección"
                >
                  <MenuItem value="verse">Verso</MenuItem>
                  <MenuItem value="chorus">Coro</MenuItem>
                  <MenuItem value="bridge">Puente</MenuItem>
                  <MenuItem value="intro">Intro</MenuItem>
                  <MenuItem value="outro">Outro</MenuItem>
                  <MenuItem value="solo">Solo</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Etiqueta"
                value={newStructure.label || ''}
                onChange={(e) => setNewStructure(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Ej: Verso 1, Coro, etc."
              />
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Contenido"
              value={newStructure.content || ''}
              onChange={(e) => setNewStructure(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Letra de esta sección..."
            />
            <TextField
              fullWidth
              label="Acordes (opcional)"
              value={newStructure.chords || ''}
              onChange={(e) => setNewStructure(prev => ({ ...prev, chords: e.target.value }))}
              placeholder="C - Am - F - G"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStructureDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={addStructureSection}
            variant="contained"
            disabled={!newStructure.type || !newStructure.label}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
