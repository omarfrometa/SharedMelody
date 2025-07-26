import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Tipos para favoritos
export interface FavoriteSong {
  songId: number;
  title: string;
  artistName: string;
  albumName?: string;
  genreName?: string;
  addedAt: string;
}

export interface FavoriteResponse {
  success: boolean;
  message: string;
  data: {
    isFavorite: boolean;
    favoriteCount?: number;
  };
}

export interface FavoritesListResponse {
  success: boolean;
  message: string;
  data: {
    favorites: FavoriteSong[];
    total: number;
    page: number;
    limit: number;
  };
}

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteSong[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener token del almacenamiento local
  const getToken = () => localStorage.getItem('accessToken');

  // Verificar si el usuario está logueado - VERSIÓN SIMPLE
  const isLoggedIn = !!user && !!getToken();

  // Cargar favoritos del usuario
  const loadUserFavorites = useCallback(async (limit: number = 50, offset: number = 0) => {
    const token = getToken();
    console.log('🔍 loadUserFavorites - user:', !!user, 'token:', !!token);

    if (!user || !token) {
      console.log('❌ No user or token available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📡 Fetching favorites from:', `/api/favorites/my-favorites?limit=${limit}&offset=${offset}`);
      const response = await fetch(`/api/favorites/my-favorites?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Favorites data:', data);
        if (data.success) {
          setFavorites(data.data.favorites || []);
        } else {
          console.error('❌ API error:', data.message);
          setError(data.message || 'Error al cargar favoritos');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ HTTP error:', response.status, errorText);
        setError(`Error al cargar favoritos (${response.status})`);
      }
    } catch (error) {
      console.error('❌ Network error loading favorites:', error);
      setError('Error de conexión al cargar favoritos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Verificar si una canción está en favoritos - VERSIÓN SIMPLIFICADA
  const checkIsFavorite = useCallback(async (songId: number): Promise<boolean> => {
    const token = getToken();
    if (!token) {
      console.log('❌ No token for checkIsFavorite');
      return false;
    }

    try {
      console.log('🔍 Checking if song', songId, 'is favorite');
      const response = await fetch(`/api/songs/${songId}/is-liked`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const isFav = data.data?.isFavorite || false;
        console.log('🔍 Song', songId, 'is favorite:', isFav);
        return isFav;
      }
      console.log('❌ Response not ok:', response.status);
      return false;
    } catch (error) {
      console.error('❌ Error checking favorite:', error);
      return false;
    }
  }, []);

  // Alternar estado de favorito - VERSIÓN SIMPLIFICADA
  const toggleFavorite = useCallback(async (songId: number): Promise<FavoriteResponse | null> => {
    console.log('🔄 toggleFavorite called - songId:', songId);

    const token = getToken();
    if (!token) {
      console.log('❌ No token available');
      setError('Debes iniciar sesión para agregar favoritos');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📡 Making request to:', `/api/songs/${songId}/like`);

      const response = await fetch(`/api/songs/${songId}/like`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);

      const data = await response.json();
      console.log('📡 Response data:', data);

      if (response.ok && data.success) {
        console.log('✅ Success! isFavorite:', data.data.isFavorite);
        return data;
      } else {
        console.log('❌ API error:', data.message);
        setError(data.message || 'Error al actualizar favorito');
        return null;
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      setError('Error de conexión');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Agregar a favoritos (usa la misma ruta que toggleFavorite)
  const addToFavorites = useCallback(async (songId: number): Promise<boolean> => {
    const token = getToken();
    if (!user || !token) {
      setError('Debes iniciar sesión para agregar favoritos');
      return false;
    }

    // Verificar si ya está en favoritos
    const isAlreadyFavorite = await checkIsFavorite(songId);
    if (isAlreadyFavorite) {
      return true; // Ya está en favoritos
    }

    // Usar toggleFavorite para agregar
    const result = await toggleFavorite(songId);
    return (result?.success && result?.data?.isFavorite) || false;
  }, [user, checkIsFavorite, toggleFavorite]);

  // Remover de favoritos (usa la misma ruta que toggleFavorite)
  const removeFromFavorites = useCallback(async (songId: number): Promise<boolean> => {
    const token = getToken();
    if (!user || !token) {
      setError('Debes iniciar sesión para remover favoritos');
      return false;
    }

    // Verificar si está en favoritos
    const isCurrentlyFavorite = await checkIsFavorite(songId);
    if (!isCurrentlyFavorite) {
      return true; // Ya no está en favoritos
    }

    // Usar toggleFavorite para remover
    const result = await toggleFavorite(songId);
    return (result?.success && !result?.data?.isFavorite) || false;
  }, [user, checkIsFavorite, toggleFavorite]);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cargar favoritos automáticamente cuando el usuario cambia - VERSIÓN SIMPLE
  useEffect(() => {
    if (!user || !getToken()) {
      setFavorites([]);
      setError(null);
      return;
    }

    // Solo cargar favoritos si el usuario está autenticado
    const timeoutId = setTimeout(() => {
      loadUserFavorites().catch(error => {
        console.error('Error al cargar favoritos:', error);
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [user, loadUserFavorites]);

  // Función para cargar favoritos manualmente
  const loadFavoritesManually = useCallback(async () => {
    const token = getToken();
    console.log('🔄 loadFavoritesManually - user:', !!user, 'token:', !!token);

    if (!user || !token) {
      console.log('❌ No se pueden cargar favoritos: usuario no autenticado');
      return;
    }

    try {
      await loadUserFavorites();
      console.log('✅ Favoritos cargados manualmente');
    } catch (error) {
      console.error('❌ Error al cargar favoritos manualmente:', error);
    }
  }, [user, loadUserFavorites]);

  return {
    favorites,
    loading,
    error,
    checkIsFavorite,
    toggleFavorite,
    addToFavorites,
    removeFromFavorites,
    loadUserFavorites,
    loadFavoritesManually,
    clearError,
    isLoggedIn
  };
};
