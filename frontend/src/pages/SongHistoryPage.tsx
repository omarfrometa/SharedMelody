import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Visibility as ViewIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { songService } from '../services/songService';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface SongVersion {
  version_id: string;
  version_number: number;
  title: string;
  artist_name: string;
  genre_name: string;
  change_reason: string;
  changed_by_name: string;
  changed_at: string;
  lyrics_preview: string;
}

const SongHistoryPage: React.FC = () => {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  // Estados
  const [history, setHistory] = useState<SongVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [loadingVersion, setLoadingVersion] = useState(false);

  useEffect(() => {
    if (!hasRole('admin')) {
      navigate('/');
      return;
    }

    if (songId) {
      loadHistory();
    }
  }, [songId, hasRole, navigate]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!songId) {
        throw new Error('ID de canción no válido');
      }

      const historyData = await songService.getSongHistory(songId);
      setHistory(historyData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const handleViewVersion = async (versionId: string) => {
    try {
      setLoadingVersion(true);
      const version = await songService.getSongVersion(versionId);
      setSelectedVersion(version);
      setViewDialogOpen(true);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la versión');
    } finally {
      setLoadingVersion(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: es });
    } catch {
      return dateString;
    }
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
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <HistoryIcon color="primary" />
          <Typography variant="h4" component="h1">
            Historial de Versiones
          </Typography>
        </Box>
        
        <Typography variant="subtitle1" color="text.secondary">
          Registro completo de todas las ediciones realizadas a esta canción
        </Typography>
      </Box>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabla de historial */}
      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Versión</TableCell>
                <TableCell>Título</TableCell>
                <TableCell>Artista</TableCell>
                <TableCell>Género</TableCell>
                <TableCell>Modificado por</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Razón</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay versiones anteriores registradas
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                history.map((version) => (
                  <TableRow key={version.version_id} hover>
                    <TableCell>
                      <Chip 
                        label={`v${version.version_number}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {version.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {version.artist_name || 'Sin artista'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {version.genre_name || 'Sin género'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {version.changed_by_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ScheduleIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatDate(version.changed_at)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {version.change_reason}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver versión completa">
                        <IconButton
                          size="small"
                          onClick={() => handleViewVersion(version.version_id)}
                          disabled={loadingVersion}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog para ver versión completa */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <HistoryIcon />
            <Typography variant="h6">
              {selectedVersion ? `Versión ${selectedVersion.version_number}` : 'Cargando...'}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {loadingVersion ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : selectedVersion ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Título:
                </Typography>
                <Typography variant="body1">
                  {selectedVersion.title}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Artista:
                </Typography>
                <Typography variant="body1">
                  {selectedVersion.artist_name || 'Sin artista'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Género:
                </Typography>
                <Typography variant="body1">
                  {selectedVersion.genre_name || 'Sin género'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Letra:
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    backgroundColor: 'grey.50',
                    maxHeight: 300,
                    overflow: 'auto'
                  }}
                >
                  <Typography 
                    variant="body2" 
                    component="pre" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'monospace'
                    }}
                  >
                    {selectedVersion.lyrics || 'Sin letra'}
                  </Typography>
                </Paper>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Información del cambio:
                </Typography>
                <Typography variant="body2">
                  <strong>Modificado por:</strong> {selectedVersion.changed_by_name}
                </Typography>
                <Typography variant="body2">
                  <strong>Fecha:</strong> {formatDate(selectedVersion.changed_at)}
                </Typography>
                <Typography variant="body2">
                  <strong>Razón:</strong> {selectedVersion.change_reason}
                </Typography>
              </Box>
            </Box>
          ) : null}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SongHistoryPage;
