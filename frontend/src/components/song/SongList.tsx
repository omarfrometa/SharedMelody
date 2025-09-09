import { useQuery } from '@tanstack/react-query';
import { songService } from '../../services/songService';
import { CircularProgress, List, ListItem, Typography, Container, Box } from '@mui/material';
import { SongDetailed, PaginatedResponse } from '../../types/song';

export const SongList = () => {
  const { data: songsResponse, isLoading } = useQuery<PaginatedResponse<SongDetailed>, Error>({
    queryKey: ['songs'],
    queryFn: () => songService.getSongs(),
  });

  const songs = songsResponse?.data || [];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <List sx={{
        px: { xs: 1, sm: 2, md: 3 }, // Espaciado responsivo
        py: 1
      }}>
        {songs?.map((song) => (
          <ListItem
            key={song.songId}
            sx={{
              px: { xs: 2, sm: 3 }, // Espaciado horizontal responsivo
              py: 1.5, // Espaciado vertical
              mb: 1, // Margen inferior entre elementos
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <Typography sx={{
              px: 1 // Espaciado interno del texto
            }}>
              {song.title} - {song.artistName}
            </Typography>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};