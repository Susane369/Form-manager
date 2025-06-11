import * as React from 'react';
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Box,
  Divider,
  Typography,
  Switch,
  useTheme,
  Tooltip
} from '@mui/material';
import {
  Settings as SettingsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Logout as LogoutIcon,
  Person as ProfileIcon
} from '@mui/icons-material';
import { useThemeMode } from '../context/ThemeContext';

export const SettingsMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { mode, toggleColorMode } = useThemeMode();
  const theme = useTheme();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <Tooltip title="Configuración">
        <IconButton
          onClick={handleClick}
          size="small"
          aria-controls={open ? 'settings-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          sx={{
            color: 'inherit',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        id="settings-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 280,
            borderRadius: 2,
            mt: 1.5,
            overflow: 'visible',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Preferencias
          </Typography>
        </Box>
        
        <MenuItem>
          <ListItemIcon>
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </ListItemIcon>
          <ListItemText>Modo {mode === 'dark' ? 'Claro' : 'Oscuro'}</ListItemText>
          <Switch
            edge="end"
            checked={mode === 'dark'}
            onChange={toggleColorMode}
            inputProps={{
              'aria-labelledby': 'switch-mode',
            }}
          />
        </MenuItem>
        
        <Divider />
        
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Cuenta
          </Typography>
        </Box>
        
        <MenuItem>
          <ListItemIcon>
            <ProfileIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mi perfil</ListItemText>
        </MenuItem>
        
        <MenuItem>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ color: 'error' }}>
            Cerrar sesión
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default SettingsMenu;
