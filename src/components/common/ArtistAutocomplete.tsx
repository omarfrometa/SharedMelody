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
  const [inputValue, setInputValue] = useState(value);
  const [selectedAuthor, setSelectedAuthor] = useState<ArtistOption | null>(null);

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
            authorName: `Agregar "${searchQuery.trim()}"`,
            isAddButton: true
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
    if (!artistName.trim()) return;

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
        authorId: newAuthor.authorId,
        authorName: newAuthor.authorName
      };

      setSelectedAuthor(newOption);
      setOptions(prev => [newOption, ...prev]);
      
      if (onAuthorSelect) {
        onAuthorSelect(newOption);
      }

      return newOption;
    } catch (error) {
      console.error('Error al crear artista:', error);
      return null;
    }
  };

  const handleInputChange = (event: any, newInputValue: string) => {
    setInputValue(newInputValue);
    onChange(newInputValue);
  };

  const handleChange = async (event: any, newValue: AutocompleteOption | string | null) => {
    if (typeof newValue === 'string') {
      setInputValue(newValue);
      onChange(newValue);
      setSelectedAuthor(null);
      if (onAuthorSelect) {
        onAuthorSelect(null);
      }
    } else if (newValue) {
      if ('isAddButton' in newValue && newValue.isAddButton) {
        const artistName = inputValue.trim();
        if (artistName) {
          await handleCreateAuthor(artistName);
        }
        return;
      }

      const artistOption = newValue as ArtistOption;
      setInputValue(artistOption.authorName);
      onChange(artistOption.authorName);
      setSelectedAuthor(artistOption);
      
      console.log('🎤 Artista seleccionado en ArtistAutocomplete:', artistOption);
      console.log('🆔 Author ID del artista:', artistOption.authorId);
      
      if (onAuthorSelect) {
        onAuthorSelect(artistOption);
      }
    } else {
      setInputValue('');
      onChange('');
      setSelectedAuthor(null);
      if (onAuthorSelect) {
        onAuthorSelect(null);
      }
    }
  };



  return (
    <Autocomplete
      freeSolo
      options={options}
      getOptionLabel={(option) => {
        if (typeof option === 'string') {
          return option;
        }
        return option.authorName;
      }}
      value={selectedAuthor}
      inputValue={inputValue}
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
