import React, { useState } from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  BookmarkAdded as BookmarkAddedIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useFormContext, SavedFilter } from '../context/FormContext';

interface SavedFiltersMenuProps {
  currentFilters: any;
  onSelectFilter: (filters: any) => void;
  disabled?: boolean;
}

export const SavedFiltersMenu: React.FC<SavedFiltersMenuProps> = ({
  currentFilters,
  onSelectFilter,
  disabled = false,
}) => {
  const { savedFilters, addSavedFilter, updateSavedFilter, deleteSavedFilter } = useFormContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSaveClick = () => {
    setFilterName('');
    setSaveDialogOpen(true);
    handleClose();
  };

  const handleEditClick = (filter: SavedFilter) => {
    setEditingFilter(filter);
    setFilterName(filter.name);
    setEditDialogOpen(true);
    handleClose();
  };

  const handleSaveFilter = () => {
    if (!filterName.trim()) return;
    
    const newFilter = {
      name: filterName.trim(),
      filters: { ...currentFilters }
    };
    
    addSavedFilter(newFilter);
    setSaveDialogOpen(false);
    setFilterName('');
  };

  const handleUpdateFilter = () => {
    if (!filterName.trim() || !editingFilter) return;
    
    updateSavedFilter(editingFilter.id, {
      name: filterName.trim(),
      filters: { ...currentFilters }
    });
    
    setEditDialogOpen(false);
    setFilterName('');
    setEditingFilter(null);
  };

  const handleDeleteFilter = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    deleteSavedFilter(id);
  };

  const isCurrentFilterSaved = () => {
    if (!savedFilters.length) return false;
    const currentFiltersStr = JSON.stringify(currentFilters);
    return savedFilters.some(filter => 
      JSON.stringify(filter.filters) === currentFiltersStr
    );
  };

  const isDefaultFilter = (filter: SavedFilter) => filter.isDefault;

  return (
    <>
      <Tooltip title="Filtros guardados">
        <IconButton
          onClick={handleClick}
          disabled={disabled}
          color={isCurrentFilterSaved() ? 'primary' : 'default'}
          aria-label="filtros guardados"
        >
          {isCurrentFilterSaved() ? <BookmarkAddedIcon /> : <BookmarkBorderIcon />}
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
      >
        <MenuItem onClick={handleSaveClick}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Guardar filtro actual</ListItemText>
        </MenuItem>

        {savedFilters.length > 0 && (
          <>
            <Divider sx={{ my: 1 }} />
            {savedFilters.map((filter) => (
              <MenuItem 
                key={filter.id} 
                onClick={() => {
                  onSelectFilter(filter.filters);
                  handleClose();
                }}
                sx={{ pr: 6, position: 'relative' }}
              >
                <ListItemIcon>
                  {isDefaultFilter(filter) ? 
                    <BookmarkIcon color="primary" fontSize="small" /> : 
                    <BookmarkBorderIcon fontSize="small" />
                  }
                </ListItemIcon>
                <ListItemText 
                  primary={filter.name} 
                  primaryTypographyProps={{
                    fontWeight: isDefaultFilter(filter) ? 'bold' : 'normal'
                  }}
                />
                {!isDefaultFilter(filter) && (
                  <Box 
                    sx={{
                      position: 'absolute',
                      right: 8,
                      display: 'flex',
                      gap: 0.5
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(filter);
                      }}
                      sx={{ p: 0.5 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => handleDeleteFilter(filter.id, e)}
                      sx={{ p: 0.5 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </MenuItem>
            ))}
          </>
        )}
      </Menu>

      {/* Diálogo para guardar filtro */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Guardar filtro</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del filtro"
            fullWidth
            variant="outlined"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSaveFilter()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleSaveFilter} 
            variant="contained"
            disabled={!filterName.trim()}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para editar filtro */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar filtro</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del filtro"
            fullWidth
            variant="outlined"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleUpdateFilter()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleUpdateFilter} 
            variant="contained"
            disabled={!filterName.trim()}
          >
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SavedFiltersMenu;
