import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Tooltip,
  Drawer,
  AppBar,
  Toolbar,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import {
  Lyrics as LyricsIcon,
  MusicNote as ChordIcon,
  Description as NotesIcon,
  Help as HelpIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Close as CloseIcon,
  Piano as PianoIcon
} from '@mui/icons-material';
import { RichTextEditor } from '../common/RichTextEditor';
import { LyricsEditor } from './LyricsEditor';
import { ChordProgressionHelper } from './ChordProgressionHelper';

interface SongContentEditorProps {
  lyrics: string;
  onLyricsChange: (lyrics: string) => void;
  chords?: string;
  onChordsChange?: (chords: string) => void;
  notes?: string;
  onNotesChange?: (notes: string) => void;
  structure?: any[];
  onStructureChange?: (structure: any[]) => void;
  onSave?: () => void;
  readOnly?: boolean;
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
      id={`song-editor-tabpanel-${index}`}
      aria-labelledby={`song-editor-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export const SongContentEditor: React.FC<SongContentEditorProps> = ({
  lyrics,
  onLyricsChange,
  chords = '',
  onChordsChange,
  notes = '',
  onNotesChange,
  structure = [],
  onStructureChange,
  onSave,
  readOnly = false
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [chordHelperOpen, setChordHelperOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleLyricsChange = useCallback((newLyrics: string) => {
    onLyricsChange(newLyrics);
    setHasUnsavedChanges(true);
  }, [onLyricsChange]);

  const handleChordsChange = useCallback((newChords: string) => {
    if (onChordsChange) {
      onChordsChange(newChords);
      setHasUnsavedChanges(true);
    }
  }, [onChordsChange]);

  const handleNotesChange = useCallback((newNotes: string) => {
    if (onNotesChange) {
      onNotesChange(newNotes);
      setHasUnsavedChanges(true);
    }
  }, [onNotesChange]);

  const handleStructureChange = useCallback((newStructure: any[]) => {
    if (onStructureChange) {
      onStructureChange(newStructure);
      setHasUnsavedChanges(true);
    }
  }, [onStructureChange]);

  const handleChordSelect = useCallback((chord: string) => {
    // Insertar acorde en el editor activo
    console.log('Acorde seleccionado:', chord);
  }, []);

  const handleProgressionSelect = useCallback((progression: string[]) => {
    const progressionText = progression.join(' - ');
    if (activeTab === 0 && onChordsChange) {
      // Agregar progresión a los acordes
      const newChords = chords ? `${chords}\n${progressionText}` : progressionText;
      handleChordsChange(newChords);
    }
  }, [activeTab, chords, onChordsChange, handleChordsChange]);

  const handleSave = () => {
    if (onSave) {
      onSave();
      setHasUnsavedChanges(false);
    }
  };

  const generateFullPreview = () => {
    let preview = '';
    
    if (structure.length > 0) {
      structure.forEach(section => {
        preview += `\n[${section.label}]\n`;
        if (section.chords) {
          preview += `Acordes: ${section.chords}\n`;
        }
        preview += `${section.content}\n`;
      });
    } else {
      if (lyrics) {
        preview += 'LETRA:\n' + lyrics + '\n\n';
      }
      if (chords) {
        preview += 'ACORDES:\n' + chords + '\n\n';
      }
      if (notes) {
        preview += 'NOTAS:\n' + notes + '\n\n';
      }
    }
    
    return preview || 'No hay contenido para mostrar.';
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header con controles */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar variant="dense">
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Editor de Canción
          </Typography>
          
          {hasUnsavedChanges && (
            <Chip 
              label="Cambios sin guardar" 
              color="warning" 
              size="small" 
              sx={{ mr: 2 }} 
            />
          )}

          <Tooltip title="Ayuda con acordes">
            <IconButton
              onClick={() => setChordHelperOpen(true)}
              color="primary"
            >
              <PianoIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={previewMode ? "Modo edición" : "Vista previa"}>
            <IconButton
              onClick={() => setPreviewMode(!previewMode)}
              color={previewMode ? "primary" : "default"}
            >
              <PreviewIcon />
            </IconButton>
          </Tooltip>

          {!readOnly && onSave && (
            <Tooltip title="Guardar cambios">
              <IconButton
                onClick={handleSave}
                color="primary"
                disabled={!hasUnsavedChanges}
              >
                <SaveIcon />
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>

      {/* Contenido principal */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {previewMode ? (
          // Vista previa
          <Paper sx={{ flexGrow: 1, m: 2, p: 3, overflow: 'auto' }}>
            <Typography variant="h5" gutterBottom>
              Vista Previa de la Canción
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Typography
              component="pre"
              sx={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '0.95rem',
                lineHeight: 1.8,
                backgroundColor: 'grey.50',
                p: 2,
                borderRadius: 1
              }}
            >
              {generateFullPreview()}
            </Typography>
          </Paper>
        ) : (
          // Editor
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
                <Tab 
                  label="Letra y Estructura" 
                  icon={<LyricsIcon />} 
                  disabled={readOnly}
                />
                <Tab 
                  label="Notas y Comentarios" 
                  icon={<NotesIcon />} 
                  disabled={readOnly}
                />
              </Tabs>
            </Box>

            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              {/* Tab 1: Letra y estructura */}
              <TabPanel value={activeTab} index={0}>
                <Box sx={{ height: '100%', p: 2 }}>
                  <LyricsEditor
                    value={lyrics}
                    onChange={handleLyricsChange}
                    chords={chords}
                    onChordsChange={handleChordsChange}
                    structure={structure}
                    onStructureChange={handleStructureChange}
                  />
                </Box>
              </TabPanel>

              {/* Tab 2: Notas y comentarios */}
              <TabPanel value={activeTab} index={1}>
                <Box sx={{ height: '100%', p: 2 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" gutterBottom>
                        Notas y Comentarios
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Agrega notas sobre la interpretación, arreglos, o cualquier información adicional sobre la canción.
                      </Typography>
                      <Box sx={{ flexGrow: 1, mt: 2 }}>
                        <RichTextEditor
                          value={notes}
                          onChange={handleNotesChange}
                          placeholder="Escribe notas sobre la canción, arreglos, interpretación, etc..."
                          minHeight={400}
                          mode="notes"
                          allowedFormats={['bold', 'italic', 'underline', 'list', 'link']}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </TabPanel>
            </Box>
          </>
        )}
      </Box>

      {/* Drawer para ayuda con acordes */}
      <Drawer
        anchor="right"
        open={chordHelperOpen}
        onClose={() => setChordHelperOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 400, md: 500 },
            maxWidth: '90vw'
          }
        }}
      >
        <AppBar position="static" color="primary" elevation={0}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Ayuda con Acordes
            </Typography>
            <IconButton
              color="inherit"
              onClick={() => setChordHelperOpen(false)}
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <ChordProgressionHelper
            onChordSelect={handleChordSelect}
            onProgressionSelect={handleProgressionSelect}
          />
        </Box>
      </Drawer>

      {/* Alertas y notificaciones */}
      {readOnly && (
        <Alert severity="info" sx={{ m: 2 }}>
          Estás viendo la canción en modo de solo lectura.
        </Alert>
      )}
    </Box>
  );
};
