# Sistema de Editor Rich Text para SharedMelody

## Descripción General

El sistema de editor de texto enriquecido de SharedMelody está diseñado específicamente para la creación y edición de contenido musical. Incluye herramientas especializadas para letras de canciones, acordes, estructura musical y notas de interpretación.

## Componentes Principales

### 1. RichTextEditor (Componente Base)

**Ubicación:** `src/components/common/RichTextEditor.tsx`

Editor de texto enriquecido base con funcionalidades estándar y extensiones musicales.

#### Características:
- Formato de texto básico (negrita, cursiva, subrayado)
- Listas ordenadas y no ordenadas
- Alineación de texto
- Inserción de enlaces e imágenes
- Colores y tamaños de fuente
- Herramientas musicales especializadas
- Deshacer/Rehacer
- Atajos de teclado

#### Props:
```typescript
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
```

#### Modos de Operación:
- **general**: Editor básico para texto general
- **lyrics**: Optimizado para letras de canciones
- **chords**: Especializado en acordes musicales
- **notes**: Para notas y comentarios

### 2. LyricsEditor (Editor Especializado)

**Ubicación:** `src/components/song/LyricsEditor.tsx`

Editor especializado para letras de canciones con soporte para estructura musical.

#### Características:
- Editor de letras con formato musical
- Gestión de acordes por separado
- Estructura de canciones (verso, coro, puente, etc.)
- Vista previa integrada
- Organización por secciones

#### Estructura de Secciones:
```typescript
interface SongStructure {
  id: string;
  type: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro' | 'solo';
  label: string;
  content: string;
  chords?: string;
  timestamp?: string;
}
```

### 3. ChordProgressionHelper (Ayuda Musical)

**Ubicación:** `src/components/song/ChordProgressionHelper.tsx`

Herramienta para explorar y seleccionar acordes y progresiones musicales.

#### Características:
- Acordes por tonalidad
- Progresiones comunes por género
- Creación de progresiones personalizadas
- Transposición automática
- Acordes extendidos (7, maj7, sus4, etc.)

#### Progresiones Incluidas:
- **I-V-vi-IV**: Progresión pop más popular
- **vi-IV-I-V**: Progresión emotiva para baladas
- **ii-V-I**: Progresión fundamental del jazz
- **I-VII-♭VI-♭VII**: Rock clásico
- Y muchas más...

### 4. SongContentEditor (Editor Integral)

**Ubicación:** `src/components/song/SongContentEditor.tsx`

Editor completo que combina todos los componentes anteriores en una interfaz unificada.

#### Características:
- Pestañas para letra/estructura y notas
- Integración con ayuda de acordes
- Vista previa completa
- Detección de cambios no guardados
- Modo de solo lectura
- Interfaz responsive

## Herramientas Musicales Especializadas

### Inserción de Acordes
- Acordes comunes por tonalidad
- Acordes extendidos y alterados
- Progresiones predefinidas
- Acordes personalizados

### Marcas de Tiempo
- Inserción automática de timestamps
- Sincronización con audio (futuro)
- Marcadores de sección

### Direcciones Vocales
- Indicaciones de interpretación
- Notas de estilo vocal
- Marcadores de intensidad

### Notas Instrumentales
- Indicaciones para instrumentos específicos
- Arreglos y ornamentaciones
- Técnicas de interpretación

## Uso en la Aplicación

### En Subida de Canciones
```typescript
// En SongUploadPage.tsx
<SongContentEditor
  lyrics={formData.lyrics || ''}
  onLyricsChange={(value) => handleInputChange('lyrics', value)}
  chords={songChords}
  onChordsChange={setSongChords}
  notes={songNotes}
  onNotesChange={setSongNotes}
  structure={songStructure}
  onStructureChange={setSongStructure}
/>
```

### Editor Básico para Comentarios
```typescript
// Para notas generales
<RichTextEditor
  value={notes}
  onChange={setNotes}
  mode="notes"
  placeholder="Agrega notas sobre la canción..."
  allowedFormats={['bold', 'italic', 'underline', 'list', 'link']}
/>
```

### Editor de Letras Especializado
```typescript
// Para edición avanzada de letras
<LyricsEditor
  value={lyrics}
  onChange={setLyrics}
  chords={chords}
  onChordsChange={setChords}
  structure={structure}
  onStructureChange={setStructure}
/>
```

## Formatos de Salida

### HTML Enriquecido
El editor genera HTML válido con clases CSS específicas para elementos musicales:

```html
<!-- Acorde -->
<span class="chord" style="color: #1976d2; font-weight: bold;">C</span>

<!-- Marca de tiempo -->
<span class="timestamp" style="color: #666;">[2:30]</span>

<!-- Dirección vocal -->
<span class="vocal-direction" style="color: #d32f2f; font-style: italic;">(Coro)</span>

<!-- Nota instrumental -->
<span class="instrument-note" style="color: #388e3c;">Piano: Intro</span>
```

### Estructura JSON
Para canciones con estructura definida:

```json
{
  "lyrics": "HTML content",
  "chords": "C - Am - F - G",
  "structure": [
    {
      "id": "1",
      "type": "verse",
      "label": "Verso 1",
      "content": "Letra del verso...",
      "chords": "C - Am - F - G"
    }
  ],
  "notes": "HTML content with interpretation notes"
}
```

## Personalización y Extensión

### Temas y Estilos
Los editores respetan el tema de Material-UI y pueden personalizarse:

```typescript
// Personalización de colores
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' }
  }
});
```

### Nuevas Herramientas Musicales
Para agregar nuevas herramientas:

1. Extender la interfaz `RichTextEditorProps`
2. Agregar botones en la toolbar
3. Implementar la lógica de inserción
4. Actualizar los estilos CSS

### Formatos Personalizados
Para nuevos formatos de contenido:

1. Definir nuevos tipos en `allowedFormats`
2. Agregar comandos de editor correspondientes
3. Implementar renderizado personalizado

## Accesibilidad

### Atajos de Teclado
- **Ctrl+B**: Negrita
- **Ctrl+I**: Cursiva
- **Ctrl+U**: Subrayado
- **Ctrl+Z**: Deshacer
- **Ctrl+Shift+Z**: Rehacer

### Navegación
- Soporte completo para lectores de pantalla
- Navegación por teclado
- Etiquetas ARIA apropiadas
- Contraste de colores accesible

## Rendimiento

### Optimizaciones
- Lazy loading de componentes
- Debouncing en cambios de texto
- Virtualización para listas largas de acordes
- Memoización de componentes pesados

### Límites Recomendados
- Texto: 50,000 caracteres máximo
- Estructura: 50 secciones máximo
- Acordes: 1,000 caracteres máximo

## Página de Demostración

Visita `/editor-demo` para ver todas las funcionalidades en acción:
- Editor completo de canciones
- Herramientas de acordes
- Estructura musical
- Ejemplos interactivos

## Futuras Mejoras

### Planificadas
- Integración con audio para sincronización
- Exportación a formatos musicales (MusicXML, MIDI)
- Colaboración en tiempo real
- Plantillas de canciones por género
- Reconocimiento de voz para dictado
- Integración con servicios de acordes online

### Consideraciones Técnicas
- Migración a editor basado en ProseMirror para mejor rendimiento
- Soporte para notación musical básica
- Integración con bibliotecas de teoría musical
- API para plugins de terceros
