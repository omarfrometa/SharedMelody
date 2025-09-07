import { useQuery } from '@tanstack/react-query';
import { songService } from '../../services/songService';
import { CircularProgress, List, ListItem, Typography } from '@mui/material';
import { SongDetailed, PaginatedResponse } from '../../types/song';

export const SongList = () => {
  const { data: songsResponse, isLoading } = useQuery<PaginatedResponse<SongDetailed>, Error>({
    queryKey: ['songs'],
    queryFn: () => songService.getSongs(),
  });

  const songs = songsResponse?.data || [];

  if (isLoading) return <CircularProgress />;

  return (
    <List>
      {songs?.map((song) => (
        <ListItem key={song.songId}>
          <Typography>{song.title} - {song.artistName}</Typography>
        </ListItem>
      ))}
    </List>
  );
};