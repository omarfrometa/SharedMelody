import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  Divider,
  Chip,
  Paper
} from '@mui/material';
import {
  MusicNote as MusicIcon,
  Lyrics as LyricsIcon,
  Piano as PianoIcon,
  Description as NotesIcon
} from '@mui/icons-material';
import { SongContentEditor } from '../components/song/SongContentEditor';
import { RichTextEditor } from '../components/common/RichTextEditor';
import { LyricsEditor } from '../components/song/LyricsEditor';
import { ChordProgressionHelper } from '../components/song/ChordProgressionHelper';

const SongEditorDemoPage: React.FC = () => {
  // Estados para el editor completo
  const [fullEditorLyrics, setFullEditorLyrics] = useState(`
[Verso 1]
En la oscuridad de la noche
Busco una luz que me guíe
Como estrella en el horizonte
Tu amor siempre me acompaña

[Coro]
Eres mi melodía favorita
La canción que nunca termina
En cada nota encuentro vida
En cada verso, tu sonrisa
  `.trim());
  
  const [fullEditorChords, setFullEditorChords] = useState('C - Am - F - G');
  const [fullEditorNotes, setFullEditorNotes] = useState(`
<h3>Notas de interpretación:</h3>
<ul>
<li><strong>Tempo:</strong> 120 BPM</li>
<li><strong>Tonalidad:</strong> Do Mayor</li>
<li><strong>Estilo:</strong> Balada pop</li>
</ul>

<h3>Arreglos:</h3>
<p>El verso debe interpretarse con <em>suavidad</em>, mientras que el coro requiere más <strong>intensidad</strong> vocal.</p>

<p>Instrumentación sugerida:</p>
<ul>
<li>Piano como base armónica</li>
<li>Guitarra acústica en el coro</li>
<li>Cuerdas en el puente</li>
</ul>
  `.trim());

  const [fullEditorStructure, setFullEditorStructure] = useState([
    {
      id: '1',
      type: 'verse' as const,
      label: 'Verso 1',
      content: 'En la oscuridad de la noche\nBusco una luz que me guíe\nComo estrella en el horizonte\nTu amor siempre me acompaña',
      chords: 'C - Am - F - G'
    },
    {
      id: '2',
      type: 'chorus' as const,
      label: 'Coro',
      content: 'Eres mi melodía favorita\nLa canción que nunca termina\nEn cada nota encuentro vida\nEn cada verso, tu sonrisa',
      chords: 'F - C - G - Am'
    }
  ]);

  // Estados para editores individuales
  const [basicText, setBasicText] = useState('<p>Este es un ejemplo del <strong>editor básico</strong> con formato <em>enriquecido</em>.</p>');
  const [lyricsOnly, setLyricsOnly] = useState('Letra de ejemplo\nCon saltos de línea\nY estructura simple');
  const [chordsOnly, setChordsOnly] = useState('');

  const handleSave = () => {
    alert('¡Contenido guardado! (Esta es solo una demostración)');
  };

  const handleChordSelect = (chord: string) => {
    console.log('Acorde seleccionado:', chord);
  };

  const handleProgressionSelect = (progression: string[]) => {
    setChordsOnly(progression.join(' - '));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Demo del Editor Rich Text para Canciones
      </Typography>
      
      <Typography variant="h6" color="text.secondary" paragraph align="center">
        Explora todas las funcionalidades del sistema de edición de contenido musical de SharedMelody
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          Esta página demuestra las capacidades del editor de texto enriquecido especializado para contenido musical.
          Incluye herramientas para letra, acordes, estructura de canciones y notas de interpretación.
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Editor completo de canciones */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <MusicIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5" component="h2">
                Editor Completo de Canciones
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Editor integral que combina letra, acordes, estructura y notas en una interfaz unificada.
            </Typography>

            <Box sx={{ height: 600, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <SongContentEditor
                lyrics={fullEditorLyrics}
                onLyricsChange={setFullEditorLyrics}
                chords={fullEditorChords}
                onChordsChange={setFullEditorChords}
                notes={fullEditorNotes}
                onNotesChange={setFullEditorNotes}
                structure={fullEditorStructure}
                onStructureChange={setFullEditorStructure}
                onSave={handleSave}
              />
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {/* Editor de letras especializado */}
          <Box sx={{ minWidth: 400, flex: '1 1 400px' }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <LyricsIcon color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h5" component="h2">
                    Editor de Letras
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Editor especializado para letras con soporte para estructura de canciones y acordes.
                </Typography>

                <Box sx={{ height: 400 }}>
                  <LyricsEditor
                    value={lyricsOnly}
                    onChange={setLyricsOnly}
                    chords={chordsOnly}
                    onChordsChange={setChordsOnly}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Ayuda con acordes */}
          <Box sx={{ minWidth: 400, flex: '1 1 400px' }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PianoIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h5" component="h2">
                    Ayuda con Acordes
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Herramienta para explorar acordes y progresiones musicales comunes.
                </Typography>

                <Box sx={{ height: 400 }}>
                  <ChordProgressionHelper
                    onChordSelect={handleChordSelect}
                    onProgressionSelect={handleProgressionSelect}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {/* Editor básico */}
          <Box sx={{ minWidth: 400, flex: '1 1 400px' }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <NotesIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h5" component="h2">
                    Editor Básico
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Editor de texto enriquecido básico para notas y comentarios generales.
                </Typography>

                <RichTextEditor
                  value={basicText}
                  onChange={setBasicText}
                  placeholder="Escribe notas generales aquí..."
                  minHeight={200}
                  mode="general"
                />
              </CardContent>
            </Card>
          </Box>

          {/* Características destacadas */}
          <Box sx={{ minWidth: 400, flex: '1 1 400px' }}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Características Destacadas
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  🎵 Herramientas Musicales
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip label="Inserción de acordes" size="small" />
                  <Chip label="Progresiones comunes" size="small" />
                  <Chip label="Marcas de tiempo" size="small" />
                  <Chip label="Direcciones vocales" size="small" />
                  <Chip label="Notas instrumentales" size="small" />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  ✏️ Formato de Texto
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip label="Negrita, cursiva, subrayado" size="small" />
                  <Chip label="Listas y alineación" size="small" />
                  <Chip label="Enlaces e imágenes" size="small" />
                  <Chip label="Colores y tamaños" size="small" />
                  <Chip label="Deshacer/Rehacer" size="small" />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="h6" gutterBottom>
                  🎼 Estructura de Canciones
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip label="Versos y coros" size="small" />
                  <Chip label="Puentes e intros" size="small" />
                  <Chip label="Solos instrumentales" size="small" />
                  <Chip label="Vista previa completa" size="small" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        </Box>

        {/* Instrucciones de uso */}
        <Paper sx={{ p: 3, backgroundColor: 'grey.50' }}>
          <Typography variant="h5" gutterBottom>
            Cómo usar el Editor
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ minWidth: 250, flex: '1 1 250px' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                1. Contenido Básico
              </Typography>
              <Typography variant="body2">
                Comienza escribiendo la letra en el editor principal. Usa las herramientas de formato
                para resaltar partes importantes como coros o puentes.
              </Typography>
            </Box>

            <Box sx={{ minWidth: 250, flex: '1 1 250px' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                2. Agregar Acordes
              </Typography>
              <Typography variant="body2">
                Utiliza la herramienta de acordes para insertar progresiones. Puedes elegir de
                progresiones comunes o crear las tuyas propias.
              </Typography>
            </Box>

            <Box sx={{ minWidth: 250, flex: '1 1 250px' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                3. Estructura Avanzada
              </Typography>
              <Typography variant="body2">
                Organiza tu canción en secciones (verso, coro, puente) para una mejor estructura
                y facilitar la interpretación.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SongEditorDemoPage;
