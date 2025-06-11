import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  useTheme,
  CircularProgress,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  BarChart as AnalyticsIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Article as FormIcon,
  GridView as GridViewIcon,
  TableRows as TableRowsIcon,
  FilterList as FilterListIcon,
  FilterAltOff as FilterAltOffIcon,
} from '@mui/icons-material';
import { useFormContext, FormStatus, FormType } from '../context/FormContext';
import ExportMenu from '../components/ExportMenu';
import SearchBar from '../components/SearchBar';
import FiltersDrawer from '../components/FiltersDrawer';

const FormList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { forms, deleteForm } = useFormContext();
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [previewForm, setPreviewForm] = useState<Form | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    status: [] as FormStatus[], 
    types: [] as FormType[],
    tags: [] as string[],
    startDate: '',
    endDate: '',
    minResponses: 0,
    maxResponses: 100
  });
  
  const hasActiveFilters = useMemo(() => {
    return (
      activeFilters.status.length > 0 ||
      activeFilters.types.length > 0 ||
      activeFilters.tags.length > 0 ||
      activeFilters.startDate ||
      activeFilters.endDate ||
      activeFilters.minResponses > 0 ||
      activeFilters.maxResponses < 100
    );
  }, [activeFilters]);
  const open = Boolean(anchorEl);
  
  // Obtener todas las etiquetas únicas de los formularios
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    forms.forEach(form => {
      if (form.tags) {
        form.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags);
  }, [forms]);

  // Simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Obtener los filtros actuales para pasarlos al drawer
  const currentFilters = useMemo(() => ({
    status: activeFilters.status,
    types: activeFilters.types,
    tags: activeFilters.tags,
    startDate: activeFilters.startDate,
    endDate: activeFilters.endDate,
    minResponses: activeFilters.minResponses,
    maxResponses: activeFilters.maxResponses
  }), [activeFilters]);

  // Filtrar formularios basados en búsqueda y filtros
  const filteredForms = useMemo(() => {
    return forms.filter(form => {
      // Filtro de búsqueda
      const matchesSearch = !searchQuery.trim() || 
        form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (form.description && form.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filtros avanzados
      const matchesStatus = activeFilters.status.length === 0 || activeFilters.status.includes(form.status);
      const matchesType = activeFilters.types.length === 0 || activeFilters.types.includes(form.type);
      
      const matchesTags = activeFilters.tags.length === 0 || 
        (form.tags && activeFilters.tags.every(tag => form.tags?.includes(tag)));
      
      const formDate = new Date(form.updatedAt).getTime();
      const startDate = activeFilters.startDate ? new Date(activeFilters.startDate).getTime() : null;
      const endDate = activeFilters.endDate ? new Date(activeFilters.endDate).getTime() : null;
      
      const matchesDateRange = 
        (!startDate || formDate >= startDate) &&
        (!endDate || formDate <= endDate);
      
      const matchesResponses = 
        (form.responsesCount || 0) >= activeFilters.minResponses &&
        (form.responsesCount || 0) <= activeFilters.maxResponses;
      
      return matchesSearch && matchesStatus && matchesType && matchesTags && matchesDateRange && matchesResponses;
    });
  }, [forms, searchQuery, activeFilters]);
  
  // Contar formularios por estado para los chips
  const statusCounts = useMemo(() => {
    return forms.reduce((acc: Record<FormStatus, number>, form) => {
      acc[form.status] = (acc[form.status] || 0) + 1;
      return acc;
    }, {} as Record<FormStatus, number>);
  }, [forms]);
  
  const handleApplyFilters = (filters: any) => {
    setActiveFilters({
      status: filters.status || [],
      types: filters.types || [],
      tags: filters.tags || [],
      startDate: filters.startDate || '',
      endDate: filters.endDate || '',
      minResponses: filters.minResponses || 0,
      maxResponses: filters.maxResponses || 100
    });
  };
  
  const handleClearFilters = () => {
    setActiveFilters({
      status: [],
      types: [],
      tags: [],
      startDate: '',
      endDate: '',
      minResponses: 0,
      maxResponses: 100
    });
    setSearchQuery('');
  };
  
  // Verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      activeFilters.status.length > 0 ||
      activeFilters.types.length > 0 ||
      activeFilters.tags.length > 0 ||
      activeFilters.startDate !== '' ||
      activeFilters.endDate !== '' ||
      activeFilters.minResponses > 0 ||
      activeFilters.maxResponses < 100
    );
  }, [activeFilters, searchQuery]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, formId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedFormId(formId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFormId(null);
  };

  const handleEdit = (formId?: string) => {
    const formIdToEdit = formId || selectedFormId;
    if (formIdToEdit) {
      navigate(`/forms/edit/${formIdToEdit}`);
      handleMenuClose();
      handleClosePreview();
    }
  };

  const handleViewResponses = (formId?: string) => {
    const formIdToView = formId || selectedFormId;
    if (formIdToView) {
      navigate(`/forms/responses/${formIdToView}`);
      handleMenuClose();
      handleClosePreview();
    }
  };

  const handleDuplicate = (formId?: string) => {
    // Lógica para duplicar formulario
    console.log('Duplicar formulario:', formId || selectedFormId);
    handleMenuClose();
    handleClosePreview();
  };

  const handleDelete = (formId?: string) => {
    const formIdToDelete = formId || selectedFormId;
    if (formIdToDelete && window.confirm('¿Estás seguro de que deseas eliminar este formulario?')) {
      deleteForm(formIdToDelete);
      handleMenuClose();
      handleClosePreview();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Mis Formularios
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/forms/create')}
            sx={{ textTransform: 'none', borderRadius: 2, px: 3, py: 1 }}
          >
            Nuevo Formulario
          </Button>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar formularios..."
            sx={{ flexGrow: 1, maxWidth: 500 }}
          />
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newView) => newView && setViewMode(newView)}
              size="small"
              aria-label="view mode"
              sx={{ mr: 1 }}
            >
              <ToggleButton value="grid" aria-label="grid view">
                <GridViewIcon />
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <TableRowsIcon />
              </ToggleButton>
            </ToggleButtonGroup>
            
            <ExportMenu 
              forms={filteredForms} 
              disabled={filteredForms.length === 0}
            />
            
            <Button
              variant={hasActiveFilters ? "contained" : "outlined"}
              color={hasActiveFilters ? "primary" : "inherit"}
              startIcon={<FilterListIcon />}
              onClick={() => setFiltersOpen(true)}
              sx={{ textTransform: 'none' }}
            >
              Filtros{hasActiveFilters ? ` (${Object.values(activeFilters).filter(v => Array.isArray(v) ? v.length > 0 : v !== '' && v !== 0 && v !== 100).length})` : ''}
            </Button>
          </Box>
        </Stack>
        
        {/* Chips de filtros activos */}
        {hasActiveFilters && (
          <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Filtros activos:
            </Typography>
            
            {searchQuery && (
              <Chip
                label={`Búsqueda: "${searchQuery}"`}
                onDelete={() => setSearchQuery('')}
                size="small"
                sx={{ mr: 1 }}
              />
            )}
            
            {activeFilters.status.map(status => (
              <Chip
                key={status}
                label={`Estado: ${status.charAt(0).toUpperCase() + status.slice(1)} (${statusCounts[status] || 0})`}
                onDelete={() => 
                  setActiveFilters(prev => ({
                    ...prev,
                    status: prev.status.filter(s => s !== status)
                  }))
                }
                size="small"
                sx={{ mr: 1 }}
              />
            ))}
            
            {activeFilters.types.map(type => (
              <Chip
                key={type}
                label={`Tipo: ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                onDelete={() => 
                  setActiveFilters(prev => ({
                    ...prev,
                    types: prev.types.filter(t => t !== type)
                  }))
                }
                size="small"
                sx={{ mr: 1 }}
              />
            ))}
            
            {activeFilters.tags.map(tag => (
              <Chip
                key={tag}
                label={`Etiqueta: ${tag}`}
                onDelete={() => 
                  setActiveFilters(prev => ({
                    ...prev,
                    tags: prev.tags.filter(t => t !== tag)
                  }))
                }
                size="small"
                sx={{ mr: 1 }}
              />
            ))}
            
            {(activeFilters.startDate || activeFilters.endDate) && (
              <Chip
                label={`Rango: ${activeFilters.startDate ? new Date(activeFilters.startDate).toLocaleDateString() : 'Inicio'} - ${activeFilters.endDate ? new Date(activeFilters.endDate).toLocaleDateString() : 'Fin'}`}
                onDelete={() => 
                  setActiveFilters(prev => ({
                    ...prev,
                    startDate: '',
                    endDate: ''
                  }))
                }
                size="small"
                sx={{ mr: 1 }}
              />
            )}
            
            {(activeFilters.minResponses > 0 || activeFilters.maxResponses < 100) && (
              <Chip
                label={`Respuestas: ${activeFilters.minResponses}-${activeFilters.maxResponses}`}
                onDelete={() => 
                  setActiveFilters(prev => ({
                    ...prev,
                    minResponses: 0,
                    maxResponses: 100
                  }))
                }
                size="small"
                sx={{ mr: 1 }}
              />
            )}
            
            <Button 
              size="small" 
              onClick={handleClearFilters}
              sx={{ ml: 1 }}
              startIcon={<FilterAltOffIcon />}
            >
              Limpiar filtros
            </Button>
          </Box>
        )}

        {filteredForms.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'background.paper', borderRadius: 2 }}>
            <FormIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No se encontraron formularios
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {hasActiveFilters 
                ? 'Intenta con otros criterios de búsqueda o limpia los filtros.'
                : 'Crea tu primer formulario haciendo clic en el botón "Nuevo Formulario".'}
            </Typography>
            {hasActiveFilters && (
              <Button 
                variant="outlined" 
                onClick={handleClearFilters}
                startIcon={<FilterAltOffIcon />}
              >
                Limpiar filtros
              </Button>
            )}
          </Box>
        ) : viewMode === 'grid' ? (
          <Grid container spacing={3}>
            {filteredForms.map((form) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={form.id}>
                <Card 
                  onClick={() => navigate(`/forms/edit/${form.id}`)}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardActionArea sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                    <CardHeader
                      title={form.title}
                      subheader={`${form.fields?.length || 0} campos`}
                        variant: 'caption',
                        color: 'text.secondary',
                      }}
                      sx={{ pb: 1 }}
                    />
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          minHeight: '60px',
                          mb: 2
                        }}
                      >
                        {form.description || 'Sin descripción'}
                      </Typography>
                      <Box sx={{ mt: 'auto' }}>
                        <Typography variant="caption" color="text.secondary">
                          {form.fields?.length || 0} campos • {form.responsesCount || 0} respuestas
                        </Typography>
                      </Box>
                    <CardActions sx={{ mt: 'auto', px: 2, pb: 2, pt: 0 }}>
                      <Button 
                        size="small" 
                        startIcon={<AnalyticsIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/forms/responses/${form.id}`);
                        }}
                      >
                        Ver respuestas
                      </Button>
                    </CardActions>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
            {filteredForms.map((form, index) => (
              <React.Fragment key={form.id}>
                <Box 
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                    cursor: 'pointer',
                  }}
                >
                  <CardActionArea onClick={() => handlePreview(form)}>
                    <Box sx={{ flexGrow: 1, p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500, mr: 1, flexGrow: 1 }}>
                          {form.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Chip 
                            label={form.status}
                            size="small"
                            color={
                              form.status === 'published' ? 'success' :
                              form.status === 'draft' ? 'warning' : 'default'
                            }
                            variant="outlined"
                          />
                          <Chip 
                            label={form.type}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {form.description || 'Sin descripción'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {form.fields?.length || 0} campos
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {form.responsesCount || 0} respuestas
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Última actualización: {new Date(form.updatedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuClick(e, form.id);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                {index < filteredForms.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Box>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 1,
          sx: { width: 200, maxWidth: '100%' },
        }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleViewResponses}>
          <AnalyticsIcon fontSize="small" sx={{ mr: 1 }} />
          Ver respuestas
        </MenuItem>
        <MenuItem onClick={handleDuplicate}>
          <DuplicateIcon fontSize="small" sx={{ mr: 1 }} />
          Duplicar
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      <FiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApplyFilters={handleApplyFilters}
        availableTags={allTags}
        initialFilters={currentFilters}
        currentFilters={currentFilters}
      />
      
      {/* Vista previa del formulario */}
      {previewForm && (
        <FormPreview
          form={previewForm}
          open={!!previewForm}
          onClose={handleClosePreview}
          onEdit={() => handleEdit(previewForm.id)}
          onViewResponses={() => handleViewResponses(previewForm.id)}
          onDuplicate={() => handleDuplicate(previewForm.id)}
          onDelete={() => handleDelete(previewForm.id)}
        />
      )}
    </Container>
  );
};

export default FormList;
