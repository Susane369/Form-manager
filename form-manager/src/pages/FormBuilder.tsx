import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
  useTheme,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  FormControlLabel,
  Checkbox,
  FormGroup,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
  Chip,
  Radio,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  DragIndicator as DragIndicatorIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  ContentCopy as DuplicateIcon,
  RadioButtonChecked as RadioIcon,
  CheckBox as CheckboxIcon,
  ShortText as ShortTextIcon,
  Subject as LongTextIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useFormContext } from '../context/FormContext';

// Tipos para los campos del formulario
type FieldType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'email' | 'number' | 'date';

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  description?: string;
}

interface FormValues {
  title: string;
  description: string;
  fields: FormField[];
}

const fieldTypes = [
  { value: 'text', label: 'Texto corto', icon: <ShortTextIcon /> },
  { value: 'textarea', label: 'Texto largo', icon: <LongTextIcon /> },
  { value: 'radio', label: 'Selección única', icon: <RadioIcon /> },
  { value: 'checkbox', label: 'Casillas de verificación', icon: <CheckboxIcon /> },
  { value: 'select', label: 'Lista desplegable', icon: <ExpandMoreIcon /> },
  { value: 'email', label: 'Correo electrónico', icon: <ShortTextIcon /> },
  { value: 'number', label: 'Número', icon: <ShortTextIcon /> },
  { value: 'date', label: 'Fecha', icon: <ShortTextIcon /> },
];

const FormBuilder: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { forms, addForm, updateForm, getFormById, setCurrentForm } = useFormContext();
  const [isEditing, setIsEditing] = useState(false);
  const [activeField, setActiveField] = useState<number | null>(null);
  const [showAddOptions, setShowAddOptions] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
    action: null as React.ReactNode | null,
  });

  const handleCopyLink = (formId: string) => {
    const publicUrl = `${window.location.origin}/forms/public/${formId}`;
    navigator.clipboard.writeText(publicUrl);
    setSnackbar({
      open: true,
      message: '¡Enlace copiado al portapapeles!',
      severity: 'info',
      action: null,
    });
  };
  const [isSaving, setIsSaving] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<number | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Componente de vista previa
  const FormPreview = () => {
    const renderPreviewField = (field: FormField) => {
      switch (field.type) {
        case 'text':
        case 'email':
        case 'number':
        case 'date':
          return (
            <TextField
              fullWidth
              variant="outlined"
              type={field.type}
              placeholder={field.placeholder || ''}
              required={field.required}
              disabled
              sx={{ mt: 1 }}
            />
          );
        case 'textarea':
          return (
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder={field.placeholder || ''}
              required={field.required}
              disabled
              sx={{ mt: 1 }}
            />
          );
        case 'radio':
        case 'checkbox':
          return (
            <FormGroup>
              {field.options?.map((option, i) => (
                <FormControlLabel
                  key={i}
                  control={
                    field.type === 'radio' ? (
                      <Radio disabled />
                    ) : (
                      <Checkbox disabled />
                    )
                  }
                  label={option}
                />
              ))}
            </FormGroup>
          );
        case 'select':
          return (
            <FormControl fullWidth variant="outlined" sx={{ mt: 1 }}>
              <Select
                value=""
                displayEmpty
                disabled
                renderValue={() => 'Selecciona una opción'}
              >
                {field.options?.map((option, i) => (
                  <MenuItem key={i} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        default:
          return null;
      }
    };

    return (
      <Dialog
        fullScreen
        open={showPreview}
        onClose={() => setShowPreview(false)}
        aria-labelledby="form-preview-title"
      >
        <DialogTitle id="form-preview-title">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Vista previa del formulario</Typography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => setShowPreview(false)}
              aria-label="Cerrar"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
              <Typography variant="h4" gutterBottom>
                {formik.values.title || 'Formulario sin título'}
              </Typography>
              {formik.values.description && (
                <Typography variant="body1" paragraph>
                  {formik.values.description}
                </Typography>
              )}
              
              <Divider sx={{ my: 3 }} />
              
              {formik.values.fields.length > 0 ? (
                formik.values.fields.map((field, index) => (
                  <Box key={field.id} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {field.label || 'Pregunta sin título'}
                      {field.required && ' *'}
                    </Typography>
                    {field.description && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {field.description}
                      </Typography>
                    )}
                    {renderPreviewField(field)}
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No hay preguntas en este formulario.
                </Typography>
              )}
            </Box>
          </Container>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Button 
            onClick={() => setShowPreview(false)} 
            variant="outlined"
            startIcon={<CloseIcon />}
          >
            Cerrar vista previa
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const formik = useFormik<FormValues>({
    initialValues: {
      title: id ? '' : 'Formulario sin título',
      description: id ? '' : '',
      fields: id ? [] : [
        {
          id: `field-${Date.now()}`,
          type: 'text',
          label: 'Pregunta sin título',
          required: false,
        },
      ],
    },
    validationSchema: Yup.object({
      title: Yup.string().required('El título es requerido'),
      description: Yup.string(),
      fields: Yup.array().of(
        Yup.object().shape({
          label: Yup.string().required('La etiqueta es requerida'),
          required: Yup.boolean(),
          options: Yup.array().when(['type'], {
            is: (type: string) => ['radio', 'checkbox', 'select'].includes(type),
            then: (schema) => schema
              .of(Yup.string().required('La opción no puede estar vacía'))
              .min(1, 'Al menos una opción es requerida'),
            otherwise: (schema) => schema.notRequired(),
          }),
        })
      ),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setIsSaving(true);
        
        if (!values.title.trim()) {
          setSnackbar({
            open: true,
            message: 'El título del formulario es requerido',
            severity: 'error',
          });
          return;
        }
        
        if (isEditing && id) {
          await updateForm(id, values);
          setSnackbar({
            open: true,
            message: 'Formulario actualizado correctamente',
            severity: 'success',
          });
        } else {
          const newForm = addForm(values);
          setSnackbar({
            open: true,
            message: 'Formulario creado correctamente',
            severity: 'success',
          });
          navigate(`/forms/edit/${newForm.id}`, { replace: true });
        }
        
        setLastSaved(new Date().toLocaleTimeString());
        formik.setTouched({});
        setSubmitting(false);
        
      } catch (error) {
        console.error('Error al guardar el formulario:', error);
        setSnackbar({
          open: true,
          message: 'Error al guardar el formulario. Por favor, inténtalo de nuevo.',
          severity: 'error',
        });
      } finally {
        setIsSaving(false);
      }
    },
  });

  useEffect(() => {
    if (id) {
      const existingForm = getFormById(id);
      if (existingForm) {
        setIsEditing(true);
        formik.setValues({
          title: existingForm.title,
          description: existingForm.description || '',
          fields: existingForm.fields,
        });
        setCurrentForm(existingForm);
        setLastSaved(new Date().toLocaleTimeString());
      }
    } else {
      setLastSaved('Nunca');
    }
    
    if (autoSave) {
      const interval = setInterval(() => {
        if (formik.dirty) {
          formik.submitForm();
        }
      }, 30000); // Guardar cada 30 segundos
      
      return () => clearInterval(interval);
    }
    
    return () => setCurrentForm(null);
  }, [id, getFormById, setCurrentForm, autoSave, formik.dirty]);

  const handleAddField = (type: FieldType) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type,
      label: getDefaultLabel(type),
      required: false,
    };

    if (['radio', 'checkbox', 'select'].includes(type)) {
      newField.options = ['Opción 1'];
    }

    formik.setFieldValue('fields', [...formik.values.fields, newField]);
    setActiveField(formik.values.fields.length);
  };

  const getDefaultLabel = (type: FieldType) => {
    switch (type) {
      case 'text':
        return 'Texto corto';
      case 'textarea':
        return 'Texto largo';
      case 'radio':
        return 'Selección única';
      case 'checkbox':
        return 'Selección múltiple';
      case 'select':
        return 'Lista desplegable';
      case 'email':
        return 'Correo electrónico';
      case 'number':
        return 'Número';
      case 'date':
        return 'Fecha';
      default:
        return 'Nuevo campo';
    }
  };

  const handleFieldChange = (index: number, field: string, value: any) => {
    const fields = [...formik.values.fields];
    fields[index] = { ...fields[index], [field]: value };
    formik.setFieldValue('fields', fields);
  };

  const handleAddOption = (fieldIndex: number) => {
    const fields = [...formik.values.fields];
    if (!fields[fieldIndex].options) {
      fields[fieldIndex].options = [];
    }
    fields[fieldIndex].options?.push(`Opción ${(fields[fieldIndex].options?.length || 0) + 1}`);
    formik.setFieldValue('fields', fields);
  };

  const handleOptionChange = (fieldIndex: number, optionIndex: number, value: string) => {
    const fields = [...formik.values.fields];
    if (fields[fieldIndex].options) {
      fields[fieldIndex].options![optionIndex] = value;
      formik.setFieldValue('fields', fields);
    }
  };

  const handleRemoveOption = (fieldIndex: number, optionIndex: number) => {
    const fields = [...formik.values.fields];
    if (fields[fieldIndex].options && fields[fieldIndex].options!.length > 1) {
      fields[fieldIndex].options!.splice(optionIndex, 1);
      formik.setFieldValue('fields', fields);
    }
  };

  const handleRemoveField = (index: number) => {
    if (formik.values.fields.length > 1) {
      const fields = [...formik.values.fields];
      fields.splice(index, 1);
      formik.setFieldValue('fields', fields);
      setShowDeleteDialog(false);
      setFieldToDelete(null);
    }
  };

  const handleDuplicateField = (index: number) => {
    const fields = [...formik.values.fields];
    const fieldToDuplicate = { ...fields[index], id: `field-${Date.now()}` };
    fields.splice(index + 1, 0, fieldToDuplicate);
    formik.setFieldValue('fields', fields);
    setActiveField(index + 1);
  };

  const renderFieldInput = (field: FormField, index: number) => {
    const isActive = activeField === index;

    return (
      <Card
        key={field.id}
        sx={{
          mb: 2,
          border: isActive ? `1px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
          boxShadow: isActive ? `0 0 0 1px ${theme.palette.primary.main}` : 'none',
          borderRadius: 2,
          overflow: 'visible',
          position: 'relative',
          '&:hover': {
            borderColor: isActive ? theme.palette.primary.main : '#bdbdbd',
          },
        }}
        onClick={() => setActiveField(index)}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 1,
            }}
          >
            <TextField
              fullWidth
              variant="standard"
              placeholder="Pregunta sin título"
              value={field.label}
              onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
              onClick={(e) => e.stopPropagation()}
              InputProps={{
                disableUnderline: true,
                sx: {
                  fontSize: '1rem',
                  fontWeight: 500,
                  '& input': {
                    p: 0,
                  },
                },
              }}
              sx={{ flexGrow: 1, mr: 1 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControl size="small" variant="outlined" sx={{ minWidth: 180, mr: 1 }}>
                <Select
                  value={field.type}
                  onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  displayEmpty
                  input={
                    <OutlinedInput
                      sx={{
                        '& .MuiSelect-select': {
                          py: 0.75,
                          fontSize: '0.875rem',
                        },
                      }}
                    />
                  }
                >
                  {fieldTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                          {type.icon}
                        </Box>
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicateField(index);
                }}
              >
                <DuplicateIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setFieldToDelete(index);
                  setShowDeleteDialog(true);
                }}
                disabled={formik.values.fields.length <= 1}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ ml: 1, mb: 2 }}>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Descripción (opcional)"
              value={field.description || ''}
              onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
              onClick={(e) => e.stopPropagation()}
              InputProps={{
                disableUnderline: true,
                sx: {
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                  '& input': {
                    p: 0,
                    py: 0.5,
                  },
                },
              }}
              sx={{ maxWidth: '80%' }}
            />
          </Box>

          {renderFieldOptions(field, index)}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.required}
                  onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  size="small"
                />
              }
              label="Requerido"
              sx={{ m: 0, '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
              onClick={(e) => e.stopPropagation()}
            />
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderFieldOptions = (field: FormField, fieldIndex: number) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
        return (
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder={getPlaceholder(field.type)}
            disabled
            sx={{
              bgcolor: 'action.hover',
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
              },
            }}
            onClick={(e) => e.stopPropagation()}
          />
        );
      case 'textarea':
        return (
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder={getPlaceholder(field.type)}
            multiline
            rows={3}
            disabled
            sx={{
              bgcolor: 'action.hover',
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
              },
            }}
            onClick={(e) => e.stopPropagation()}
          />
        );
      case 'radio':
      case 'checkbox':
      case 'select':
        return (
          <Box sx={{ ml: 1 }}>
            {field.options?.map((option, optionIndex) => (
              <Box
                key={optionIndex}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                {field.type === 'radio' && <RadioIcon sx={{ color: 'action.active', mr: 1 }} />}
                {field.type === 'checkbox' && <CheckboxIcon sx={{ color: 'action.active', mr: 1 }} />}
                {field.type === 'select' && <ExpandMoreIcon sx={{ color: 'action.active', mr: 1 }} />}
                <TextField
                  variant="standard"
                  value={option}
                  onChange={(e) => handleOptionChange(fieldIndex, optionIndex, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      '& input': {
                        p: 0.5,
                        fontSize: '0.875rem',
                      },
                    },
                  }}
                  sx={{ flexGrow: 1, mr: 1 }}
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveOption(fieldIndex, optionIndex);
                  }}
                  disabled={field.options.length <= 1}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleAddOption(fieldIndex);
              }}
              sx={{ mt: 1, textTransform: 'none' }}
            >
              Agregar opción
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };

  const getPlaceholder = (type: FieldType) => {
    switch (type) {
      case 'text':
        return 'Respuesta corta';
      case 'textarea':
        return 'Respuesta larga';
      case 'email':
        return 'ejemplo@dominio.com';
      case 'number':
        return '0';
      case 'date':
        return 'dd/mm/aaaa';
      default:
        return '';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/forms')}
          sx={{ textTransform: 'none' }}
        >
          Volver
        </Button>
        <Box>
          <Button
            variant="outlined"
            sx={{ mr: 2, textTransform: 'none', borderRadius: 2 }}
            onClick={() => {
              // Vista previa del formulario
            }}
          >
            Vista previa
          </Button>
          <Button
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={async () => {
              try {
                setIsSaving(true);
                
                if (isEditing && id) {
                  await updateForm(id, formik.values);
                  setSnackbar({
                    open: true,
                    message: 'Formulario actualizado correctamente',
                    severity: 'success',
                  });
                } else {
                  const newForm = addForm(formik.values);
                  setSnackbar({
                    open: true,
                    message: 'Formulario guardado correctamente',
                    severity: 'success',
                    action: (
                      <Button 
                        color="inherit" 
                        size="small"
                        onClick={() => handleCopyLink(newForm.id)}
                      >
                        Copiar enlace
                      </Button>
                    ),
                  });
                  navigate(`/forms/edit/${newForm.id}`, { replace: true });
                }
                
                setLastSaved(new Date().toLocaleTimeString());
              } catch (error) {
                console.error('Error al guardar el formulario:', error);
                setSnackbar({
                  open: true,
                  message: 'Error al guardar el formulario. Por favor, inténtalo de nuevo.',
                  severity: 'error',
                });
              } finally {
                setIsSaving(false);
              }
            }}
            disabled={isSaving || !formik.isValid}
            sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8} lg={9}>
          <Card sx={{ mb: 3, borderRadius: 3, overflow: 'visible' }}>
            <CardContent sx={{ p: 4 }}>
              <TextField
                fullWidth
                variant="standard"
                placeholder="Título del formulario"
                value={formik.values.title}
                onChange={formik.handleChange('title')}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    fontSize: '2rem',
                    fontWeight: 500,
                    '& input': {
                      p: 0,
                    },
                  },
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                variant="standard"
                placeholder="Descripción del formulario"
                value={formik.values.description}
                onChange={formik.handleChange('description')}
                multiline
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    fontSize: '1rem',
                    color: 'text.secondary',
                    '& textarea': {
                      p: 0,
                    },
                  },
                }}
              />
            </CardContent>
            <Divider />
            <CardContent sx={{ p: 0 }}>
              {formik.values.fields.map((field, index) => (
                <Box key={field.id} sx={{ position: 'relative' }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      left: -40,
                      top: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      opacity: activeField === index ? 1 : 0,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <IconButton size="small" disabled={index === 0}>
                      <ExpandLessIcon />
                    </IconButton>
                    <IconButton size="small" disabled={index === formik.values.fields.length - 1}>
                      <ExpandMoreIcon />
                    </IconButton>
                  </Box>
                  <Box
                    sx={{
                      position: 'absolute',
                      right: 16,
                      top: 16,
                      display: activeField === index ? 'flex' : 'none',
                      alignItems: 'center',
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      boxShadow: 1,
                      p: 0.5,
                    }}
                  >
                    <Tooltip title="Duplicar">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateField(index);
                        }}
                      >
                        <DuplicateIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFieldToDelete(index);
                          setShowDeleteDialog(true);
                        }}
                        disabled={formik.values.fields.length <= 1}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  {renderFieldInput(field, index)}
                </Box>
              ))}
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddField('text')}
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  Agregar pregunta
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <Card sx={{ position: 'sticky', top: 20, borderRadius: 3, overflow: 'visible' }}>
            <CardHeader
              title="Elementos del formulario"
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
              sx={{ pb: 1 }}
            />
            <CardContent>
              <Grid container spacing={1}>
                {fieldTypes.map((type) => (
                  <Grid item xs={6} sm={4} md={6} key={type.value}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={type.icon}
                      onClick={() => handleAddField(type.value as FieldType)}
                      sx={{
                        flexDirection: 'column',
                        height: '100%',
                        p: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        textAlign: 'center',
                        '& .MuiButton-startIcon': {
                          mr: 0,
                          mb: 1,
                        },
                      }}
                    >
                      <Typography variant="caption" display="block">
                        {type.label}
                      </Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Diálogo de confirmación para eliminar campo */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setFieldToDelete(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Eliminar pregunta</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar esta pregunta? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowDeleteDialog(false);
              setFieldToDelete(null);
            }}
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (fieldToDelete !== null) {
                handleRemoveField(fieldToDelete);
              }
            }}
            color="error"
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
          action={snackbar.action}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      {/* Barra de estado */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mt: 3,
        p: 1.5,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1
      }}>
        <Typography variant="body2" color="text.secondary">
          {isSaving ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Guardando...
            </Box>
          ) : (
            `Último guardado: ${lastSaved || 'Nunca'}`
          )}
        </Typography>
        <Box>
          <FormControlLabel
            control={
              <Switch 
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                size="small"
              />
            }
            label="Autoguardado"
            sx={{ mr: 2 }}
          />
          <Button
            variant="outlined"
            onClick={() => setShowPreview(true)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Vista previa
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default FormBuilder;
