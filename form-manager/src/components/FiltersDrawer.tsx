import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Collapse,
  Slider,
  MenuItem,
  Select,
  SelectChangeEvent,
  OutlinedInput,
} from '@mui/material';
import {
  Close as CloseIcon,
  FilterList as FilterListIcon,
  FilterAlt as FilterAltIcon,
  FilterAltOff as FilterAltOffIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { FormStatus, FormType, SavedFilter } from '../context/FormContext';
import SavedFiltersMenu from './SavedFiltersMenu';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

interface Filters {
  status: FormStatus[];
  types: FormType[];
  tags: string[];
  dateRange: [Date | null, Date | null];
  minResponses: number;
  maxResponses: number;
}

interface FiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: Omit<Filters, 'dateRange'> & { startDate?: string; endDate?: string }) => void;
  availableTags: string[];
  initialFilters?: Partial<Filters>;
  currentFilters: any; // Para manejar los filtros actuales
}

const allStatus: FormStatus[] = ['draft', 'published', 'archived'];
const allTypes: FormType[] = ['survey', 'quiz', 'registration', 'contact', 'other'];

const FiltersDrawer: React.FC<FiltersDrawerProps> = ({
  open,
  onClose,
  onApplyFilters,
  availableTags,
  initialFilters = {},
  currentFilters,
}) => {
  const [filters, setFilters] = useState<Omit<Filters, 'dateRange'> & { startDate?: string; endDate?: string }>({
    status: [],
    types: [],
    tags: [],
    minResponses: 0,
    maxResponses: 100,
    ...initialFilters,
  });

  // Sincronizar con los filtros iniciales cuando cambian
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      ...initialFilters,
    }));
  }, [initialFilters]);

  const [customTag, setCustomTag] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    status: true,
    type: true,
    date: true,
    responses: true,
    tags: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleStatusChange = (status: FormStatus) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status],
    }));
  };

  const handleTypeChange = (type: FormType) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type],
    }));
  };

  const handleTagAdd = () => {
    if (customTag.trim() && !filters.tags.includes(customTag.trim())) {
      setFilters(prev => ({
        ...prev,
        tags: [...prev.tags, customTag.trim()],
      }));
      setCustomTag('');
    }
  };

  const handleTagDelete = (tagToDelete: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete),
    }));
  };

  const handleDateChange = (index: number) => (date: Date | null) => {
    const newDateRange = [...filters.dateRange] as [Date | null, Date | null];
    newDateRange[index] = date;
    
    // Asegurarse de que la fecha de inicio sea anterior a la fecha de fin
    if (index === 0 && newDateRange[1] && date && date > newDate[1]!) {
      newDateRange[1] = date;
    } else if (index === 1 && newDateRange[0] && date && date < newDate[0]!) {
      newDateRange[0] = date;
    }
    
    setFilters(prev => ({
      ...prev,
      dateRange: newDateRange,
    }));
  };

  const handleResponsesChange = (event: Event, newValue: number | number[], activeThumb: number) => {
    if (Array.isArray(newValue)) {
      setFilters(prev => ({
        ...prev,
        minResponses: newValue[0],
        maxResponses: newValue[1],
      }));
    }
  };

  const handleApply = () => {
    onApplyFilters({
      status: filters.status,
      types: filters.types,
      tags: filters.tags,
      minResponses: filters.minResponses,
      maxResponses: filters.maxResponses,
      startDate: filters.dateRange[0]?.toISOString(),
      endDate: filters.dateRange[1]?.toISOString(),
    });
    onClose();
  };

  const handleReset = () => {
    setFilters({
      status: [],
      types: [],
      tags: [],
      dateRange: [null, null],
      minResponses: 0,
      maxResponses: 100,
    });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 400 },
          p: 2,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6">Filtros avanzados</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SavedFiltersMenu 
            currentFilters={currentFilters || {}} 
            onSelectFilter={(selectedFilters) => {
              setFilters(selectedFilters);
              onApplyFilters(selectedFilters);
            }}
          />
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 2 }} />

      {/* Sección de Estado */}
      <Box sx={{ mb: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'action.hover', borderRadius: 1 },
            p: 1,
            mb: 1
          }}
          onClick={() => toggleSection('status')}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Estado</Typography>
          {expandedSections.status ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>
        
        <Collapse in={expandedSections.status}>
          <FormGroup>
            {allStatus.map(status => (
              <FormControlLabel
                key={status}
                control={
                  <Checkbox
                    checked={filters.status.includes(status)}
                    onChange={() => handleStatusChange(status)}
                    size="small"
                  />
                }
                label={status.charAt(0).toUpperCase() + status.slice(1)}
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
              />
            ))}
          </FormGroup>
        </Collapse>
      </Box>

      {/* Sección de Tipo */}
      <Box sx={{ mb: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'action.hover', borderRadius: 1 },
            p: 1,
            mb: 1
          }}
          onClick={() => toggleSection('type')}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Tipo de formulario</Typography>
          {expandedSections.type ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>
        
        <Collapse in={expandedSections.type}>
          <FormGroup>
            {allTypes.map(type => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox
                    checked={filters.types.includes(type)}
                    onChange={() => handleTypeChange(type)}
                    size="small"
                  />
                }
                label={type.charAt(0).toUpperCase() + type.slice(1)}
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
              />
            ))}
          </FormGroup>
        </Collapse>
      </Box>

      {/* Sección de Fechas */}
      <Box sx={{ mb: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'action.hover', borderRadius: 1 },
            p: 1,
            mb: 1
          }}
          onClick={() => toggleSection('date')}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Rango de fechas</Typography>
          {expandedSections.date ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>
        
        <Collapse in={expandedSections.date}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Box sx={{ mb: 2 }}>
              <DatePicker
                label="Fecha de inicio"
                value={filters.dateRange[0]}
                onChange={handleDateChange(0)}
                slots={{
                  textField: (params) => (
                    <TextField
                      {...params}
                      fullWidth
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DateRangeIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  ),
                }}
              />
            </Box>
            <Box>
              <DatePicker
                label="Fecha de fin"
                value={filters.dateRange[1]}
                onChange={handleDateChange(1)}
                minDate={filters.dateRange[0] || undefined}
                slots={{
                  textField: (params) => (
                    <TextField
                      {...params}
                      fullWidth
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DateRangeIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  ),
                }}
              />
            </Box>
          </LocalizationProvider>
        </Collapse>
      </Box>

      {/* Sección de Respuestas */}
      <Box sx={{ mb: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'action.hover', borderRadius: 1 },
            p: 1,
            mb: 1
          }}
          onClick={() => toggleSection('responses')}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Número de respuestas</Typography>
          {expandedSections.responses ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>
        
        <Collapse in={expandedSections.responses}>
          <Box sx={{ px: 2, pt: 1 }}>
            <Slider
              value={[filters.minResponses, filters.maxResponses]}
              onChange={handleResponsesChange}
              valueLabelDisplay="auto"
              min={0}
              max={100}
              valueLabelFormat={(value) => `${value} respuestas`}
              sx={{ mt: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: -1, mb: 1 }}>
              <Typography variant="caption" color="textSecondary">
                0 respuestas
              </Typography>
              <Typography variant="caption" color="textSecondary">
                100+ respuestas
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </Box>

      {/* Sección de Etiquetas */}
      <Box sx={{ mb: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'action.hover', borderRadius: 1 },
            p: 1,
            mb: 1
          }}
          onClick={() => toggleSection('tags')}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Etiquetas</Typography>
          {expandedSections.tags ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>
        
        <Collapse in={expandedSections.tags}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              {filters.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleTagDelete(tag)}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Añadir etiqueta..."
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTagAdd()}
                fullWidth
              />
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handleTagAdd}
                disabled={!customTag.trim()}
              >
                Añadir
              </Button>
            </Box>
            {availableTags.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                  Etiquetas disponibles:
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {availableTags
                    .filter(tag => !filters.tags.includes(tag))
                    .map(tag => (
                      <Chip
                        key={tag}
                        label={tag}
                        onClick={() => setCustomTag(tag)}
                        size="small"
                        variant="outlined"
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                </Box>
              </Box>
            )}
          </Box>
        </Collapse>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button 
          onClick={handleReset} 
          startIcon={<FilterAltOffIcon />}
          color="inherit"
        >
          Limpiar
        </Button>
        <Button 
          variant="contained" 
          onClick={handleApply} 
          startIcon={<FilterAltIcon />}
          fullWidth
        >
          Aplicar filtros
        </Button>
      </Box>
    </Drawer>
  );
};

export default FiltersDrawer;
