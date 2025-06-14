import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  CircularProgress,
  Alert,
  Paper,
  Divider,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { useFormContext } from '../context/FormContext';

interface FormResponse {
  [key: string]: string | string[];
}

const FormPublicView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getFormById } = useFormContext();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormResponse>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchForm = () => {
      try {
        if (!id) {
          setError('No se proporcionó un ID de formulario');
          setLoading(false);
          return;
        }

        const foundForm = getFormById(id);
        if (!foundForm) {
          setError('Formulario no encontrado');
          setLoading(false);
          return;
        }

        setForm(foundForm);
        
        // Inicializar formData con valores vacíos para cada campo
        const initialData: FormResponse = {};
        foundForm.fields.forEach((field: any) => {
          if (field.type === 'checkbox') {
            initialData[field.id] = [];
          } else {
            initialData[field.id] = '';
          }
        });
        setFormData(initialData);
        
      } catch (err) {
        console.error('Error al cargar el formulario:', err);
        setError('Error al cargar el formulario');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [id, getFormById]);

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData({
      ...formData,
      [fieldId]: value
    });
  };

  const handleCheckboxChange = (fieldId: string, option: string) => {
    const currentValues = Array.isArray(formData[fieldId]) 
      ? [...(formData[fieldId] as string[])] 
      : [];
    
    const newValues = currentValues.includes(option)
      ? currentValues.filter(v => v !== option)
      : [...currentValues, option];
    
    setFormData({
      ...formData,
      [fieldId]: newValues
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Respuestas enviadas:', formData);
    // Aquí iría la lógica para enviar las respuestas al servidor
    setSubmitted(true);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Cargando formulario...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Volver al inicio
        </Button>
      </Container>
    );
  }

  if (submitted) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          ¡Gracias por completar el formulario!
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Volver al inicio
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {form?.title || 'Formulario'}
        </Typography>
        
        {form?.description && (
          <Typography variant="body1" color="text.secondary" paragraph>
            {form.description}
          </Typography>
        )}

        <Divider sx={{ my: 3 }} />

        <form onSubmit={handleSubmit}>
          {form?.fields?.map((field: any) => (
            <Box key={field.id} sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                {field.label}
                {field.required && ' *'}
              </Typography>
              
              {field.description && (
                <Typography variant="body2" color="text.secondary" paragraph>
                  {field.description}
                </Typography>
              )}

              {field.type === 'text' && (
                <TextField
                  fullWidth
                  variant="outlined"
                  value={formData[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                  placeholder={field.placeholder}
                  sx={{ mt: 1 }}
                />
              )}

              {field.type === 'textarea' && (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  value={formData[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                  placeholder={field.placeholder}
                  sx={{ mt: 1 }}
                />
              )}

              {field.type === 'radio' && (
                <FormControl component="fieldset" sx={{ display: 'block', mt: 1 }}>
                  <RadioGroup
                    value={formData[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                  >
                    {field.options?.map((option: string, index: number) => (
                      <FormControlLabel
                        key={index}
                        value={option}
                        control={<Radio required={field.required} />}
                        label={option}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              )}

              {field.type === 'checkbox' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', mt: 1 }}>
                  {field.options?.map((option: string, index: number) => (
                    <FormControlLabel
                      key={index}
                      control={
                        <Checkbox
                          checked={Array.isArray(formData[field.id]) && (formData[field.id] as string[]).includes(option)}
                          onChange={() => handleCheckboxChange(field.id, option)}
                        />
                      }
                      label={option}
                    />
                  ))}
                </Box>
              )}

              {field.type === 'select' && (
                <FormControl fullWidth variant="outlined" sx={{ mt: 1 }}>
                  <Select
                    value={formData[field.id] || ''}
                    onChange={(e: SelectChangeEvent) => handleInputChange(field.id, e.target.value as string)}
                    required={field.required}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Selecciona una opción
                    </MenuItem>
                    {field.options?.map((option: string, index: number) => (
                      <MenuItem key={index} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          ))}

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              type="submit" 
              variant="contained" 
              size="large"
            >
              Enviar
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default FormPublicView;
