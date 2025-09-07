import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Tooltip
} from '@mui/material';
import {
  Language as LanguageIcon,
  Check as CheckIcon,
  KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import { useLanguage, Language } from '../../contexts/LanguageContext';

interface LanguageSelectorProps {
  variant?: 'icon' | 'button' | 'menu';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'icon',
  size = 'medium',
  showLabel = false
}) => {
  const { language, setLanguage, availableLanguages, t } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    handleClose();
  };

  const currentLanguage = availableLanguages.find(lang => lang.code === language);

  if (variant === 'icon') {
    return (
      <>
        <Tooltip title={t('common.language')}>
          <IconButton
            onClick={handleClick}
            size={size}
            sx={{
              color: 'inherit',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <LanguageIcon />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              minWidth: 180,
              mt: 1
            }
          }}
        >
          {availableLanguages.map((lang) => (
            <MenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              selected={lang.code === language}
              sx={{
                py: 1.5,
                px: 2
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Typography variant="h6" component="span">
                  {lang.flag}
                </Typography>
              </ListItemIcon>
              <ListItemText
                primary={lang.nativeName}
                secondary={lang.name}
                primaryTypographyProps={{
                  fontWeight: lang.code === language ? 600 : 400
                }}
              />
              {lang.code === language && (
                <CheckIcon 
                  sx={{ 
                    ml: 1, 
                    color: 'primary.main',
                    fontSize: 20
                  }} 
                />
              )}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  if (variant === 'button') {
    return (
      <>
        <Box
          onClick={handleClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'rgba(0, 0, 0, 0.12)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderColor: 'primary.main',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <Typography variant="h6" component="span" sx={{ fontSize: '1.2rem' }}>
            {currentLanguage?.flag}
          </Typography>
          {showLabel && (
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                color: 'text.primary',
                fontSize: '0.875rem',
                letterSpacing: '0.02em'
              }}
            >
              {currentLanguage?.nativeName}
            </Typography>
          )}
          <ArrowDownIcon
            sx={{
              fontSize: '1rem',
              color: 'text.secondary',
              transition: 'transform 0.2s ease',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          />
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          PaperProps={{
            sx: {
              minWidth: 200,
              mt: 1,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'rgba(0, 0, 0, 0.12)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)'
            }
          }}
        >
          {availableLanguages.map((lang) => (
            <MenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              selected={lang.code === language}
              sx={{
                py: 1.5,
                px: 2,
                borderRadius: 1,
                mx: 0.5,
                my: 0.25,
                '&:hover': {
                  backgroundColor: 'rgba(22, 163, 74, 0.08)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(22, 163, 74, 0.12)',
                  '&:hover': {
                    backgroundColor: 'rgba(22, 163, 74, 0.16)',
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Typography variant="h6" component="span">
                  {lang.flag}
                </Typography>
              </ListItemIcon>
              <ListItemText
                primary={lang.nativeName}
                secondary={lang.name}
                primaryTypographyProps={{
                  fontWeight: lang.code === language ? 600 : 400
                }}
              />
              {lang.code === language && (
                <CheckIcon 
                  sx={{ 
                    ml: 1, 
                    color: 'primary.main',
                    fontSize: 20
                  }} 
                />
              )}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  // variant === 'menu'
  return (
    <>
      {availableLanguages.map((lang) => (
        <MenuItem
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          selected={lang.code === language}
          sx={{
            py: 1.5,
            px: 2
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <Typography variant="h6" component="span">
              {lang.flag}
            </Typography>
          </ListItemIcon>
          <ListItemText
            primary={lang.nativeName}
            secondary={lang.name}
            primaryTypographyProps={{
              fontWeight: lang.code === language ? 600 : 400
            }}
          />
          {lang.code === language && (
            <CheckIcon 
              sx={{ 
                ml: 1, 
                color: 'primary.main',
                fontSize: 20
              }} 
            />
          )}
        </MenuItem>
      ))}
    </>
  );
};

export default LanguageSelector;
