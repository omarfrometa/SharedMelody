import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, TextField, Stack, CircularProgress } from '@mui/material';
import { songService } from '../../services/songService';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const schema = z.object({
  title: z.string().min(1, 'Título es requerido'),
  artist: z.string().min(1, 'Artista es requerido'),
  comments: z.string().optional(),
});

type SongRequestFormData = z.infer<typeof schema>;

export const SongRequestForm = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<SongRequestFormData>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: SongRequestFormData) => songService.requestSong(data),
    onSuccess: () => {
      alert('Solicitud enviada correctamente');
      navigate('/');
    },
    onError: () => {
      alert('Error al enviar la solicitud');
    }
  });

  const onSubmit = (data: SongRequestFormData) => {
    mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <TextField
          label="Título de la Canción"
          {...register('title')}
          error={!!errors.title}
          helperText={errors.title?.message}
        />
        <TextField
          label="Artista"
          {...register('artist')}
          error={!!errors.artist}
          helperText={errors.artist?.message}
        />
        <TextField
          label="Comentarios (Opcional)"
          multiline
          rows={4}
          {...register('comments')}
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isPending}
        >
          {isPending ? <CircularProgress size={24} /> : 'Solicitar Canción'}
        </Button>
      </Stack>
    </form>
  );
};