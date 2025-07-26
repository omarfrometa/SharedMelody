import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Toolbar,
  IconButton,
  Divider,
  Typography,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Chip,
  Menu,
  ListItemIcon,
  ListItemText,
  Slider
} from '@mui/material';
import {
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatUnderlined as UnderlineIcon,
  FormatListBulleted as BulletListIcon,
  FormatListNumbered as NumberListIcon,
  FormatAlignLeft as AlignLeftIcon,
  FormatAlignCenter as AlignCenterIcon,
  FormatAlignRight as AlignRightIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Code as CodeIcon,
  FormatColorText as TextColorIcon,
  FormatColorFill as BackgroundColorIcon,
  FormatSize as FontSizeIcon,
  MusicNote as ChordIcon,
  Lyrics as LyricsIcon,
  Timer as TimestampIcon,
  VolumeUp as VolumeIcon,
  Mic as VocalIcon,
  Piano as InstrumentIcon
} from '@mui/icons-material';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  disabled?: boolean;
  mode?: 'general' | 'lyrics' | 'chords' | 'notes';
  showMusicTools?: boolean;
  onChordInsert?: (chord: string) => void;
  onTimestampInsert?: (timestamp: string) => void;
  allowedFormats?: string[];
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Escribe aquí...',
  minHeight = 200,
  maxHeight = 500,
  disabled = false,
  mode = 'general',
  showMusicTools = false,
  onChordInsert,
  onTimestampInsert,
  allowedFormats = ['bold', 'italic', 'underline', 'list', 'align', 'link', 'image']
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [currentFormat, setCurrentFormat] = useState<string[]>([]);

  // Music-specific states
  const [chordDialogOpen, setChordDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [colorMenuAnchor, setColorMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedChord, setSelectedChord] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  // Common chord progressions for quick access
  const commonChords = [
    'C', 'D', 'E', 'F', 'G', 'A', 'B',
    'Cm', 'Dm', 'Em', 'Fm', 'Gm', 'Am', 'Bm',
    'C7', 'D7', 'E7', 'F7', 'G7', 'A7', 'B7',
    'Cmaj7', 'Dmaj7', 'Emaj7', 'Fmaj7', 'Gmaj7', 'Amaj7', 'Bmaj7'
  ];

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateFormatState();
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const updateFormatState = () => {
    const formats: string[] = [];
    
    if (document.queryCommandState('bold')) formats.push('bold');
    if (document.queryCommandState('italic')) formats.push('italic');
    if (document.queryCommandState('underline')) formats.push('underline');
    
    setCurrentFormat(formats);
  };

  const handleFormatToggle = (event: React.MouseEvent<HTMLElement>, newFormats: string[]) => {
    const format = (event.target as HTMLElement).closest('button')?.getAttribute('data-format');
    if (format) {
      handleCommand(format);
    }
  };

  const insertLink = () => {
    const url = prompt('Ingresa la URL:');
    if (url) {
      handleCommand('createLink', url);
    }
  };

  const insertImage = () => {
    setImageDialogOpen(true);
  };

  const insertChord = (chord: string) => {
    const chordElement = `<span class="chord" style="color: #1976d2; font-weight: bold; background: #e3f2fd; padding: 2px 4px; border-radius: 3px; margin: 0 2px;">${chord}</span>`;
    handleCommand('insertHTML', chordElement);
    if (onChordInsert) {
      onChordInsert(chord);
    }
  };

  const insertTimestamp = () => {
    const timestamp = new Date().toLocaleTimeString();
    const timestampElement = `<span class="timestamp" style="color: #666; font-size: 0.9em; background: #f5f5f5; padding: 2px 4px; border-radius: 3px; margin: 0 2px;">[${timestamp}]</span>`;
    handleCommand('insertHTML', timestampElement);
    if (onTimestampInsert) {
      onTimestampInsert(timestamp);
    }
  };

  const insertVocalDirection = (direction: string) => {
    const directionElement = `<span class="vocal-direction" style="color: #d32f2f; font-style: italic; background: #ffebee; padding: 2px 4px; border-radius: 3px; margin: 0 2px;">(${direction})</span>`;
    handleCommand('insertHTML', directionElement);
  };

  const insertInstrumentNote = (instrument: string, note: string) => {
    const noteElement = `<span class="instrument-note" style="color: #388e3c; background: #e8f5e8; padding: 2px 4px; border-radius: 3px; margin: 0 2px;">${instrument}: ${note}</span>`;
    handleCommand('insertHTML', noteElement);
  };

  const handleLinkInsert = () => {
    if (linkUrl && linkText) {
      const linkElement = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      handleCommand('insertHTML', linkElement);
      setLinkDialogOpen(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  const handleImageInsert = () => {
    if (imageUrl) {
      const imgElement = `<img src="${imageUrl}" alt="${imageAlt}" style="max-width: 100%; height: auto; border-radius: 4px; margin: 8px 0;" />`;
      handleCommand('insertHTML', imgElement);
      setImageDialogOpen(false);
      setImageUrl('');
      setImageAlt('');
    }
  };

  const applyTextColor = (color: string) => {
    handleCommand('foreColor', color);
    setTextColor(color);
  };

  const applyBackgroundColor = (color: string) => {
    handleCommand('backColor', color);
    setBackgroundColor(color);
  };

  const applyFontSize = (size: number) => {
    // Convert pixel size to HTML font size (1-7)
    const htmlSize = Math.min(7, Math.max(1, Math.round(size / 4)));
    handleCommand('fontSize', htmlSize.toString());
    setFontSize(size);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Atajos de teclado
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'b':
          event.preventDefault();
          handleCommand('bold');
          break;
        case 'i':
          event.preventDefault();
          handleCommand('italic');
          break;
        case 'u':
          event.preventDefault();
          handleCommand('underline');
          break;
        case 'z':
          event.preventDefault();
          if (event.shiftKey) {
            handleCommand('redo');
          } else {
            handleCommand('undo');
          }
          break;
      }
    }
  };

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      {/* Toolbar */}
      <Toolbar variant="dense" sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 48, flexWrap: 'wrap' }}>
        {/* Formato de texto básico */}
        {allowedFormats.includes('bold') && (
          <ToggleButtonGroup
            value={currentFormat}
            onChange={handleFormatToggle}
            size="small"
            sx={{ mr: 1 }}
          >
            <ToggleButton value="bold" data-format="bold">
              <Tooltip title="Negrita (Ctrl+B)">
                <BoldIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="italic" data-format="italic">
              <Tooltip title="Cursiva (Ctrl+I)">
                <ItalicIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="underline" data-format="underline">
              <Tooltip title="Subrayado (Ctrl+U)">
                <UnderlineIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        )}

        {/* Color y tamaño de fuente */}
        <IconButton
          size="small"
          onClick={(e) => setColorMenuAnchor(e.currentTarget)}
          sx={{ mr: 0.5 }}
        >
          <Tooltip title="Color de texto">
            <TextColorIcon fontSize="small" />
          </Tooltip>
        </IconButton>

        <IconButton
          size="small"
          onClick={() => {
            const size = prompt('Tamaño de fuente (8-72):', fontSize.toString());
            if (size && !isNaN(Number(size))) {
              applyFontSize(Number(size));
            }
          }}
          sx={{ mr: 1 }}
        >
          <Tooltip title="Tamaño de fuente">
            <FontSizeIcon fontSize="small" />
          </Tooltip>
        </IconButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Listas */}
        <IconButton
          size="small"
          onClick={() => handleCommand('insertUnorderedList')}
          sx={{ mr: 0.5 }}
        >
          <Tooltip title="Lista con viñetas">
            <BulletListIcon fontSize="small" />
          </Tooltip>
        </IconButton>
        <IconButton
          size="small"
          onClick={() => handleCommand('insertOrderedList')}
          sx={{ mr: 1 }}
        >
          <Tooltip title="Lista numerada">
            <NumberListIcon fontSize="small" />
          </Tooltip>
        </IconButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Alineación */}
        <IconButton
          size="small"
          onClick={() => handleCommand('justifyLeft')}
          sx={{ mr: 0.5 }}
        >
          <Tooltip title="Alinear izquierda">
            <AlignLeftIcon fontSize="small" />
          </Tooltip>
        </IconButton>
        <IconButton
          size="small"
          onClick={() => handleCommand('justifyCenter')}
          sx={{ mr: 0.5 }}
        >
          <Tooltip title="Centrar">
            <AlignCenterIcon fontSize="small" />
          </Tooltip>
        </IconButton>
        <IconButton
          size="small"
          onClick={() => handleCommand('justifyRight')}
          sx={{ mr: 1 }}
        >
          <Tooltip title="Alinear derecha">
            <AlignRightIcon fontSize="small" />
          </Tooltip>
        </IconButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Enlaces e imágenes */}
        {allowedFormats.includes('link') && (
          <IconButton
            size="small"
            onClick={() => setLinkDialogOpen(true)}
            sx={{ mr: 0.5 }}
          >
            <Tooltip title="Insertar enlace">
              <LinkIcon fontSize="small" />
            </Tooltip>
          </IconButton>
        )}
        {allowedFormats.includes('image') && (
          <IconButton
            size="small"
            onClick={insertImage}
            sx={{ mr: 1 }}
          >
            <Tooltip title="Insertar imagen">
              <ImageIcon fontSize="small" />
            </Tooltip>
          </IconButton>
        )}

        {/* Herramientas musicales */}
        {(showMusicTools || mode !== 'general') && (
          <>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            {(mode === 'chords' || mode === 'lyrics') && (
              <IconButton
                size="small"
                onClick={() => setChordDialogOpen(true)}
                sx={{ mr: 0.5 }}
              >
                <Tooltip title="Insertar acorde">
                  <ChordIcon fontSize="small" />
                </Tooltip>
              </IconButton>
            )}

            <IconButton
              size="small"
              onClick={insertTimestamp}
              sx={{ mr: 0.5 }}
            >
              <Tooltip title="Insertar marca de tiempo">
                <TimestampIcon fontSize="small" />
              </Tooltip>
            </IconButton>

            <IconButton
              size="small"
              onClick={() => insertVocalDirection('Coro')}
              sx={{ mr: 0.5 }}
            >
              <Tooltip title="Dirección vocal">
                <VocalIcon fontSize="small" />
              </Tooltip>
            </IconButton>

            <IconButton
              size="small"
              onClick={() => insertInstrumentNote('Piano', 'Intro')}
              sx={{ mr: 1 }}
            >
              <Tooltip title="Nota instrumental">
                <InstrumentIcon fontSize="small" />
              </Tooltip>
            </IconButton>
          </>
        )}

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Deshacer/Rehacer */}
        <IconButton
          size="small"
          onClick={() => handleCommand('undo')}
          sx={{ mr: 0.5 }}
        >
          <Tooltip title="Deshacer (Ctrl+Z)">
            <UndoIcon fontSize="small" />
          </Tooltip>
        </IconButton>
        <IconButton
          size="small"
          onClick={() => handleCommand('redo')}
        >
          <Tooltip title="Rehacer (Ctrl+Shift+Z)">
            <RedoIcon fontSize="small" />
          </Tooltip>
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        {/* Selector de formato */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value="p"
            onChange={(e) => handleCommand('formatBlock', e.target.value)}
            displayEmpty
          >
            <MenuItem value="p">Párrafo</MenuItem>
            <MenuItem value="h1">Título 1</MenuItem>
            <MenuItem value="h2">Título 2</MenuItem>
            <MenuItem value="h3">Título 3</MenuItem>
            <MenuItem value="h4">Título 4</MenuItem>
            <MenuItem value="h5">Título 5</MenuItem>
            <MenuItem value="h6">Título 6</MenuItem>
            <MenuItem value="pre">Código</MenuItem>
            <MenuItem value="blockquote">Cita</MenuItem>
          </Select>
        </FormControl>
      </Toolbar>

      {/* Editor */}
      <Box
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={handleContentChange}
        onFocus={() => setIsEditorFocused(true)}
        onBlur={() => {
          setIsEditorFocused(false);
          updateFormatState();
        }}
        onKeyDown={handleKeyDown}
        onMouseUp={updateFormatState}
        sx={{
          minHeight,
          maxHeight,
          overflow: 'auto',
          p: 2,
          outline: 'none',
          '&:focus': {
            backgroundColor: 'action.hover'
          },
          '& p': {
            margin: '0 0 1em 0',
            '&:last-child': {
              marginBottom: 0
            }
          },
          '& h1, & h2, & h3, & h4, & h5, & h6': {
            margin: '1em 0 0.5em 0',
            '&:first-child': {
              marginTop: 0
            }
          },
          '& ul, & ol': {
            margin: '1em 0',
            paddingLeft: '2em'
          },
          '& blockquote': {
            margin: '1em 0',
            paddingLeft: '1em',
            borderLeft: '4px solid',
            borderColor: 'primary.main',
            fontStyle: 'italic'
          },
          '& pre': {
            backgroundColor: 'grey.100',
            padding: '1em',
            borderRadius: 1,
            overflow: 'auto',
            fontFamily: 'monospace'
          },
          '& img': {
            maxWidth: '100%',
            height: 'auto'
          },
          '& a': {
            color: 'primary.main',
            textDecoration: 'underline'
          }
        }}
      >
        {!value && !isEditorFocused && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              position: 'absolute',
              pointerEvents: 'none',
              userSelect: 'none'
            }}
          >
            {placeholder}
          </Typography>
        )}
      </Box>

      {/* Color Menu */}
      <Menu
        anchorEl={colorMenuAnchor}
        open={Boolean(colorMenuAnchor)}
        onClose={() => setColorMenuAnchor(null)}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2" gutterBottom>
            Color de texto
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {['#000000', '#d32f2f', '#1976d2', '#388e3c', '#f57c00', '#7b1fa2'].map((color) => (
              <Box
                key={color}
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: color,
                  borderRadius: 1,
                  cursor: 'pointer',
                  border: textColor === color ? '2px solid #666' : '1px solid #ccc'
                }}
                onClick={() => {
                  applyTextColor(color);
                  setColorMenuAnchor(null);
                }}
              />
            ))}
          </Box>
          <Typography variant="subtitle2" gutterBottom>
            Tamaño de fuente
          </Typography>
          <Slider
            value={fontSize}
            onChange={(_, value) => setFontSize(value as number)}
            onChangeCommitted={(_, value) => applyFontSize(value as number)}
            min={8}
            max={72}
            step={2}
            valueLabelDisplay="auto"
          />
        </Box>
      </Menu>

      {/* Chord Dialog */}
      <Dialog open={chordDialogOpen} onClose={() => setChordDialogOpen(false)}>
        <DialogTitle>Insertar Acorde</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Acorde personalizado"
            value={selectedChord}
            onChange={(e) => setSelectedChord(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle2" gutterBottom>
            Acordes comunes:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {commonChords.map((chord) => (
              <Chip
                key={chord}
                label={chord}
                onClick={() => setSelectedChord(chord)}
                color={selectedChord === chord ? 'primary' : 'default'}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChordDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (selectedChord) {
                insertChord(selectedChord);
                setChordDialogOpen(false);
                setSelectedChord('');
              }
            }}
            variant="contained"
            disabled={!selectedChord}
          >
            Insertar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)}>
        <DialogTitle>Insertar Enlace</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            placeholder="https://ejemplo.com"
          />
          <TextField
            fullWidth
            label="Texto del enlace"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            placeholder="Texto que se mostrará"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleLinkInsert}
            variant="contained"
            disabled={!linkUrl || !linkText}
          >
            Insertar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)}>
        <DialogTitle>Insertar Imagen</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="URL de la imagen"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            placeholder="https://ejemplo.com/imagen.jpg"
          />
          <TextField
            fullWidth
            label="Texto alternativo"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            placeholder="Descripción de la imagen"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleImageInsert}
            variant="contained"
            disabled={!imageUrl}
          >
            Insertar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
