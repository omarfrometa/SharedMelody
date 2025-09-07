import React, { useState, useEffect, useMemo } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
  Button,
  ListItem
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { authorService } from '../../services/authorService';
import { CreateAuthor } from '../../types/admin';
import { debounce } from 'lodash';

interface ArtistOption {
  authorId: string;
  authorName: string;
}

interface AddButtonOption {
  authorId: string;
  authorName: string;
  isAddButton: true;
  originalText?: string;
}

type AutocompleteOption = ArtistOption | AddButtonOption;

interface ArtistAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAuthorSelect?: (author: ArtistOption | null) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
}

export const ArtistAutocomplete: React.FC<ArtistAutocompleteProps> = ({
  value,
  onChange,
  onAuthorSelect,
  label = "Artista/Intérprete",
  placeholder = "Buscar artista...",
  required = false,
  error = false,
  helperText,
  fullWidth = true
}) => {
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [selectedAuthor, setSelectedAuthor] = useState<ArtistOption | null>(null);
  const [isCreating, setIsCreating] = useState(false); // Flag for creation process

  // NO sincronizar automáticamente para evitar borrar el campo después de crear artista

  // Función debounced para buscar artistas
  const debouncedSearch = useMemo(
    () => debounce(async (searchQuery: string) => {
      // Solo buscar si hay al menos 3 caracteres
      if (!searchQuery || searchQuery.length < 3) {
        setOptions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const results = await authorService.searchAuthorsAutocomplete(searchQuery, 10);

        // Verificar si el texto exacto existe en los resultados
        const exactMatch = results.find(
          result => result.authorName.toLowerCase() === searchQuery.toLowerCase()
        );

        // Si no hay coincidencia exacta, agregar opción para crear nuevo artista
        const optionsWithAdd: AutocompleteOption[] = [...results];
        if (!exactMatch && searchQuery.trim().length >= 3) {
          optionsWithAdd.push({
            authorId: 'add-new',
            authorName: searchQuery.trim(),
            isAddButton: true,
            originalText: searchQuery.trim() // Guardamos el texto original
          } as AddButtonOption);
        }

        setOptions(optionsWithAdd);
      } catch (error) {
        console.error('Error al buscar artistas:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  // Efecto para buscar cuando cambia el input
  useEffect(() => {
    // Cancelar búsqueda anterior si existe
    debouncedSearch.cancel();

    // Solo iniciar loading si hay al menos 3 caracteres
    if (inputValue && inputValue.length >= 3) {
      setLoading(true);
      debouncedSearch(inputValue);
    } else {
      setLoading(false);
      setOptions([]);
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [inputValue, debouncedSearch]);

  // Función para crear un nuevo autor cuando el usuario sale del campo
  const handleCreateAuthor = async (artistName: string) => {
    if (!artistName.trim()) return null;

    setIsCreating(true); // Set flag before starting creation

    try {
      const newAuthor = await authorService.createAuthor({
        authorName: artistName.trim(),
        authorBio: '',
        birthDate: undefined,
        deathDate: undefined,
        countryId: undefined,
        websiteUrl: undefined,
        imageUrl: undefined
      });

      const newOption: ArtistOption = {
        authorId: newAuthor.authorId.toString(), // Ensure authorId is a string
        authorName: newAuthor.authorName
      };

      setSelectedAuthor(newOption);
      setInputValue(newAuthor.authorName);
      onChange(newAuthor.authorName);
      setOptions(prev => [newOption, ...prev.filter(o => !('isAddButton' in o))]);

      if (onAuthorSelect) {
        onAuthorSelect(newOption);
      }

      return newOption;
    } catch (error) {
      console.error('Error al crear artista:', error);
      setIsCreating(false); // Reset flag on error
      return null;
    }
  };

  const handleInputChange = (
    _event: React.SyntheticEvent,
    newInputValue: string,
    reason: string
  ) => {
    // Ignore the reset event that happens after selecting the "Add" option
    if (reason === 'reset' && isCreating) {
      setIsCreating(false); // Reset the flag and do nothing
      return;
    }

    setInputValue(newInputValue);
    onChange(newInputValue);
  };

  const handleChange = async (_event: any, newValue: AutocompleteOption | string | null) => {
    if (newValue === null) {
      // Si el usuario borra el campo, `inputValue` ya está vacío debido a `onInputChange`.
      // Si no está vacío, es un evento no deseado que se ignora para evitar limpiar el campo.
      if (inputValue === '') {
        setInputValue('');
        onChange('');
        setSelectedAuthor(null);
        if (onAuthorSelect) {
          onAuthorSelect(null);
        }
      }
      return;
    }

    if (typeof newValue === 'string') {
      setInputValue(newValue);
      onChange(newValue);
      setSelectedAuthor(null);
      if (onAuthorSelect) {
        onAuthorSelect(null);
      }
      return;
    }

    if ('isAddButton' in newValue && newValue.isAddButton) {
      // Extraer el nombre del texto "Agregar '[nombre]'"
      let artistName = '';

      if (newValue.originalText) {
        artistName = newValue.originalText.trim();
      } else if (newValue.authorName) {
        const match = newValue.authorName.match(/Agregar "(.+)"/);
        if (match && match[1]) {
          artistName = match[1].trim();
        }
      } else {
        artistName = inputValue.trim();
      }

      if (artistName) {
        const createdArtist = await handleCreateAuthor(artistName);
        if (createdArtist) {
          // `handleCreateAuthor` ya actualiza el estado, así que solo retornamos.
          return;
        }
      }
      return;
    }

    // Si no es ninguna de las anteriores, es una selección de artista existente.
    const artistOption = newValue as ArtistOption;
    setInputValue(artistOption.authorName);
    onChange(artistOption.authorName);
    setSelectedAuthor(artistOption);

    if (onAuthorSelect) {
      onAuthorSelect(artistOption);
    }
  };



  return (
    <Autocomplete
      freeSolo
      options={options || []}
      getOptionLabel={(option) => {
        if (typeof option === 'string') {
          return option;
        }
        if (option && typeof option === 'object' && 'authorName' in option) {
          return option.authorName || '';
        }
        return '';
      }}
      inputValue={inputValue || ''}
      onInputChange={handleInputChange}
      onChange={handleChange}
      loading={loading}
      loadingText="Buscando artistas..."
      noOptionsText={
        inputValue && inputValue.length < 3
          ? "Escribe al menos 3 caracteres para buscar"
          : "No se encontraron artistas"
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          error={error}
          helperText={helperText}
          fullWidth={fullWidth}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }
          }}
        />
      )}
      renderOption={(props, option) => {
        if ('isAddButton' in option && option.isAddButton) {
          return (
            <ListItem {...props} sx={{ py: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{
                  justifyContent: 'flex-start',
                  color: 'primary.main',
                  borderColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'white'
                  }
                }}
              >
                {option.authorName}
              </Button>
            </ListItem>
          );
        }

        return (
          <Box component="li" {...props}>
            <Typography variant="body2">
              {option.authorName}
            </Typography>
          </Box>
        );
      }}
    />
  );
};
