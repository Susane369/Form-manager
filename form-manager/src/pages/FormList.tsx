import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
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
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useFormContext, FormStatus, FormType, Form } from '../context/FormContext';
import ExportMenu from '../components/ExportMenu';
import SearchBar from '../components/SearchBar';
import FiltersDrawer from '../components/FiltersDrawer';
import FormPreview from '../components/FormPreview';

const FormList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { forms } = useFormContext();
  const [loading, setLoading] = useState(true);
  
  console.log('FormList rendering...');
  console.log('Forms count:', forms.length);
  console.log('Loading state:', loading);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [previewForm, setPreviewForm] = useState<Form | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({
    status: [] as FormStatus[],
    type: [] as FormType[],
    tags: [] as string[],
    dateRange: { start: null as Date | null, end: null as Date | null },
    minResponses: 0,
  });

  const [activeFilters, setActiveFilters] = useState({
    status: [] as FormStatus[],
    types: [] as FormType[],
    tags: [] as string[],
    startDate: '',
    endDate: '',
    minResponses: 0,
    maxResponses: 100
  });

  const open = Boolean(anchorEl);
  
  // Get all unique tags from forms
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    forms.forEach(form => {
      if (form.tags) {
        form.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags);
  }, [forms]);

  // Simulate data loading
  useEffect(() => {
    console.log('Component mounted, setting loading timer');
    const timer = setTimeout(() => {
      console.log('Loading timer completed');
      setLoading(false);
    }, 500);
    return () => {
      console.log('Component unmounting, clearing timer');
      clearTimeout(timer);
    };
  }, []);

  // Filter forms based on search query and filters
  const filteredForms = useMemo(() => {
    return forms.filter(form => {
      // Search by title or description
      const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (form.description && form.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by status
      const matchesStatus = currentFilters.status.length === 0 || 
        (form.status && currentFilters.status.includes(form.status));
      
      // Filter by type
      const matchesType = currentFilters.type.length === 0 || 
        (form.type && currentFilters.type.includes(form.type));
      
      // Filter by tags
      const matchesTags = currentFilters.tags.length === 0 ||
        (form.tags && currentFilters.tags.every(tag => form.tags?.includes(tag)));
      
      return matchesSearch && matchesStatus && matchesType && matchesTags;
    });
  }, [forms, searchQuery, currentFilters]);

  const handleApplyFilters = (filters: any) => {
    setCurrentFilters(filters);
    setFiltersOpen(false);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setCurrentFilters({
      status: [],
      type: [],
      tags: [],
      dateRange: { start: null, end: null },
      minResponses: 0,
    });
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, formId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedFormId(formId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFormId(null);
  };

  const handleEdit = (formId?: string) => {
    const id = formId || selectedFormId;
    if (id) {
      navigate(`/forms/edit/${id}`);
    }
    handleMenuClose();
  };

  const handleViewResponses = (formId?: string) => {
    const id = formId || selectedFormId;
    if (id) {
      navigate(`/forms/responses/${id}`);
    }
    handleMenuClose();
  };

  const handleDuplicate = (formId?: string) => {
    const id = formId || selectedFormId;
    // TODO: Implement duplicate functionality
    console.log('Duplicate form:', id);
    handleMenuClose();
  };

  const handleDelete = (formId?: string) => {
    const id = formId || selectedFormId;
    if (id && window.confirm('¿Estás seguro de que deseas eliminar este formulario?')) {
      deleteForm(id);
      handleMenuClose();
      handleClosePreview();
    }
  };

  const handlePreview = (form: Form) => {
    setPreviewForm(form);
  };

  const handleClosePreview = () => {
    setPreviewForm(null);
  };

  const selectedForm = useMemo(() => {
    return forms.find(form => form.id === selectedFormId) || null;
  }, [forms, selectedFormId]);

  const hasSearchOrFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      currentFilters.status.length > 0 ||
      currentFilters.type.length > 0 ||
      currentFilters.tags.length > 0 ||
      currentFilters.dateRange.start !== null ||
      currentFilters.dateRange.end !== null ||
      currentFilters.minResponses > 0
    );
  }, [searchQuery, currentFilters]);

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
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setFiltersOpen(true)}
              sx={{ textTransform: 'none' }}
            >
              Filtros
            </Button>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newView) => newView && setViewMode(newView)}
              size="small"
              aria-label="view mode"
            >
              <ToggleButton value="grid" aria-label="grid view">
                <GridViewIcon />
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <TableRowsIcon />
              </ToggleButton>
            </ToggleButtonGroup>
            <ExportMenu forms={filteredForms} />
          </Box>
        </Stack>

        {hasSearchOrFilters && (
          <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Filtros activos:
            </Typography>
            {searchQuery && (
              <Chip
                label={`Búsqueda: "${searchQuery}"`}
                onDelete={() => setSearchQuery('')}
                size="small"
                variant="outlined"
              />
            )}
            {currentFilters.status.map(status => (
              <Chip
                key={status}
                label={`Estado: ${status}`}
                onDelete={() => {
                  setCurrentFilters(prev => ({
                    ...prev,
                    status: prev.status.filter(s => s !== status)
                  }));
                }}
                size="small"
                variant="outlined"
              />
            ))}
            {currentFilters.type.map(type => (
              <Chip
                key={type}
                label={`Tipo: ${type}`}
                onDelete={() => {
                  setCurrentFilters(prev => ({
                    ...prev,
                    type: prev.type.filter(t => t !== type)
                  }));
                }}
                size="small"
                variant="outlined"
              />
            ))}
            {currentFilters.tags.map(tag => (
              <Chip
                key={tag}
                label={`Etiqueta: ${tag}`}
                onDelete={() => {
                  setCurrentFilters(prev => ({
                    ...prev,
                    tags: prev.tags.filter(t => t !== tag)
                  }));
                }}
                size="small"
                variant="outlined"
              />
            ))}
            {(currentFilters.dateRange.start || currentFilters.dateRange.end) && (
              <Chip
                label={`Rango: ${currentFilters.dateRange.start?.toLocaleDateString() || ''} - ${currentFilters.dateRange.end?.toLocaleDateString() || ''}`}
                onDelete={() => {
                  setCurrentFilters(prev => ({
                    ...prev,
                    dateRange: { start: null, end: null }
                  }));
                }}
                size="small"
                variant="outlined"
              />
            )}
            {currentFilters.minResponses > 0 && (
              <Chip
                label={`Mín. respuestas: ${currentFilters.minResponses}`}
                onDelete={() => {
                  setCurrentFilters(prev => ({
                    ...prev,
                    minResponses: 0
                  }));
                }}
                size="small"
                variant="outlined"
              />
            )}
            <Button
              size="small"
              startIcon={<FilterAltOffIcon />}
              onClick={handleClearFilters}
              sx={{ ml: 1 }}
            >
              Limpiar filtros
            </Button>
          </Box>
        )}

        {filteredForms.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'background.paper', borderRadius: 2 }}>
            <FormIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No se encontraron formularios
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {hasSearchOrFilters
                ? 'Intenta con otros términos de búsqueda o ajusta los filtros.'
                : 'Crea tu primer formulario haciendo clic en el botón "Nuevo Formulario".'}
            </Typography>
            {hasSearchOrFilters && (
              <Button
                variant="outlined"
                startIcon={<FilterAltOffIcon />}
                onClick={handleClearFilters}
                sx={{ mt: 2 }}
              >
                Limpiar búsqueda y filtros
              </Button>
            )}
          </Box>
        ) : viewMode === 'grid' ? (
          <Grid container spacing={3}>
            {filteredForms.map((form) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={form.id}>
                <Card 
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
                  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <CardActionArea 
                      onClick={() => handlePreview(form)}
                      sx={{ 
                        flexGrow: 1, 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        p: 2,
                        boxSizing: 'border-box'
                      }}
                    >
                      <CardHeader
                        title={form.title}
                        subheader={`${form.fields?.length || 0} campos`}
                        subheaderTypographyProps={{
                          variant: 'caption',
                          color: 'text.secondary',
                        }}
                        sx={{ p: 0, mb: 1 }}
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
                    </CardActionArea>
                    <CardActions sx={{ p: 2, pt: 0 }}>
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
                  </Box>
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
                  <Box sx={{ flexGrow: 1 }}>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
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
      >
        <MenuItem onClick={() => handleEdit()}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={() => handleViewResponses()}>
          <AnalyticsIcon fontSize="small" sx={{ mr: 1 }} />
          Ver respuestas
        </MenuItem>
        <MenuItem onClick={() => handleDuplicate()}>
          <DuplicateIcon fontSize="small" sx={{ mr: 1 }} />
          Duplicar
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleDelete()} sx={{ color: 'error.main' }}>
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
      />
      
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
