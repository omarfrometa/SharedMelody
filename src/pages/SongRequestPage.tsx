import React from 'react';
import { Box, Typography } from '@mui/material';
import { SongRequestForm } from '../components/song/SongRequestForm';

const SongRequestPage = () => {
  return (
    <Box>
      <Typography variant="h4">Request a Song</Typography>
      <SongRequestForm />
    </Box>
  );
};

export default SongRequestPage;