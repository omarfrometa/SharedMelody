import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon } from '@mui/icons-material';

interface SimpleFavoriteButtonProps {
  songId: number;
}

export const SimpleFavoriteButton: React.FC<SimpleFavoriteButtonProps> = ({ songId }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verificar si está en favoritos al cargar
  useEffect(() => {
    checkFavoriteStatus();
  }, [songId]);

  const checkFavoriteStatus = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const response = await fetch(`/api/songs/${songId}/is-liked`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.data?.isFavorite || false);
      }
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const handleToggle = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('Debes iniciar sesión');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/songs/${songId}/like`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsFavorite(data.data.isFavorite);
        alert(data.message);
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const token = localStorage.getItem('accessToken');
  const isDisabled = !token || loading;

  return (
    <Tooltip title={!token ? 'Inicia sesión' : (isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos')}>
      <span>
        <IconButton
          onClick={handleToggle}
          disabled={isDisabled}
          color="error"
        >
          {loading ? '⏳' : (isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />)}
        </IconButton>
      </span>
    </Tooltip>
  );
};
