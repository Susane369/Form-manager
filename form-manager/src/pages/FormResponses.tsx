import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  Tabs,
  Tab,
  TablePagination,
  Tooltip,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  FileDownload as DownloadIcon,
  BarChart as AnalyticsIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useFormContext } from '../context/FormContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`response-tabpanel-${index}`}
      aria-labelledby={`response-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `response-tab-${index}`,
    'aria-controls': `response-tabpanel-${index}`,
  };
}

const FormResponses = () => {
  const { id: formId } = useParams<{ id: string }>();
  const { getFormById } = useFormContext();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Simular datos de respuestas (en una aplicación real, estos vendrían de una API)
  const mockResponses = [
    {
      id: '1',
      submittedAt: '2025-05-15T14:30:00Z',
      data: {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        rating: '5',
        comments: '¡Excelente servicio!',
      },
    },
    {
      id: '2',
      submittedAt: '2025-05-14T10:15:00Z',
      data: {
        name: 'María García',
        email: 'maria@example.com',
        rating: '4',
        comments: 'Muy bueno, pero hay espacio para mejorar.',
      },
    },
    // Agregar más respuestas de ejemplo según sea necesario
  ];

  useEffect(() => {
    // Simular carga de datos
    const fetchData = async () => {
      try {
        const formData = getFormById(id || '');
        if (formData) {
          setForm(formData);
        } else {
          // Redirigir si el formulario no existe
          navigate('/forms');
        }
      } catch (error) {
        console.error('Error al cargar el formulario:', error);
        setSnackbar({
          open: true,
          message: 'Error al cargar el formulario',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, getFormById, navigate]);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteAllResponses = () => {
    // Lógica para eliminar todas las respuestas
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const confirmDeleteAllResponses = () => {
    // Lógica para confirmar la eliminación de todas las respuestas
    setDeleteDialogOpen(false);
    setSnackbar({
      open: true,
      message: 'Todas las respuestas han sido eliminadas',
      severity: 'success',
    });
  };

  const handleViewResponse = (response: any) => {
    setSelectedResponse(response);
    setViewDialogOpen(true);
  };

  const handleExportResponses = async (format: 'csv' | 'xlsx' | 'pdf' | 'json') => {
    try {
      setSnackbar({
        open: true,
        message: `Exportando respuestas en formato ${format.toUpperCase()}...`,
        severity: 'info',
      });

      if (!formId) return;

      const responses = form?.responses || [];
      const fileName = `respuestas-${form?.title?.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}`;

      if (format === 'json') {
        const data = {
          formId: form?.id,
          formTitle: form?.title,
          totalResponses: responses.length,
          responses: responses.map(response => ({
            id: response.id,
            submittedAt: response.submittedAt,
            answers: response.answers
          }))
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        saveAs(blob, `${fileName}.json`);
        return;
      }

      if (format === 'csv') {
        if (!responses.length) {
          setSnackbar({
            open: true,
            message: 'No hay respuestas para exportar',
            severity: 'warning',
          });
          return;
        }

        // Obtener todos los campos únicos de las respuestas
        const allFields = new Set<string>();
        responses.forEach(response => {
          Object.keys(response.answers).forEach(field => allFields.add(field));
        });

        // Crear encabezados
        const headers = ['ID', 'Fecha de envío', ...Array.from(allFields)];
        
        // Crear filas de datos
        const rows = responses.map(response => {
          const row: (string | number | boolean)[] = [
            response.id,
            new Date(response.submittedAt).toLocaleString()
          ];
          
          // Mapear cada campo a su valor o vacío si no existe
          allFields.forEach(field => {
            const value = response.answers[field];
            row.push(value !== undefined ? value : '');
          });
          
          return row;
        });

        // Convertir a CSV
        const csvContent = [
          headers.join(','),
          ...rows.map(row => 
            row.map(cell => 
              typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
            ).join(',')
          )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `${fileName}.csv`);
        return;
      }

      if (format === 'xlsx') {
        if (!responses.length) {
          setSnackbar({
            open: true,
            message: 'No hay respuestas para exportar',
            severity: 'warning',
          });
          return;
        }

        const XLSX = await import('xlsx');
        
        // Obtener todos los campos únicos de las respuestas
        const allFields = new Set<string>();
        responses.forEach(response => {
          Object.keys(response.answers).forEach(field => allFields.add(field));
        });

        // Crear datos para la hoja de cálculo
        const wsData = responses.map(response => {
          const row: Record<string, any> = {
            'ID': response.id,
            'Fecha de envío': new Date(response.submittedAt).toLocaleString()
          };
          
          // Agregar cada campo a la fila
          allFields.forEach(field => {
            row[field] = response.answers[field] !== undefined ? response.answers[field] : '';
          });
          
          return row;
        });

        // Crear hoja de cálculo
        const ws = XLSX.utils.json_to_sheet(wsData);
        
        // Crear libro de trabajo y guardar
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Respuestas');
        XLSX.writeFile(wb, `${fileName}.xlsx`);
        return;
      }

      if (format === 'pdf') {
        if (!responses.length) {
          setSnackbar({
            open: true,
            message: 'No hay respuestas para exportar',
            severity: 'warning',
          });
          return;
        }

        
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        let yPos = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        const maxWidth = pageWidth - 2 * margin;
        
        // Título
        doc.setFontSize(18);
        doc.text(`Respuestas: ${form?.title}`, margin, yPos, { maxWidth });
        yPos += 10;
        
        // Información general
        doc.setFontSize(12);
        doc.text(`Total de respuestas: ${responses.length}`, margin, yPos);
        yPos += 10;
        
        // Para cada respuesta
        responses.forEach((response, index) => {
          // Nueva página si es necesario (dejando espacio para al menos 5 líneas de la próxima respuesta)
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
          
          // Título de la respuesta
          doc.setFont(undefined, 'bold');
          doc.text(`Respuesta #${index + 1}`, margin, yPos);
          yPos += 7;
          
          // ID y fecha
          doc.setFont(undefined, 'normal');
          doc.text(`ID: ${response.id}`, margin + 5, yPos);
          yPos += 6;
          doc.text(`Enviado: ${new Date(response.submittedAt).toLocaleString()}`, margin + 5, yPos);
          yPos += 8;
          
          // Respuestas
          doc.setFont(undefined, 'bold');
          doc.text('Respuestas:', margin + 5, yPos);
          yPos += 7;
          
          doc.setFont(undefined, 'normal');
          Object.entries(response.answers).forEach(([question, answer]) => {
            if (yPos > 250) {
              doc.addPage();
              yPos = 20;
            }
            
            const text = `${question}: ${answer}`;
            const lines = doc.splitTextToSize(text, maxWidth - 10);
            doc.text(lines, margin + 10, yPos);
            yPos += lines.length * 7 + 2;
          });
          
          yPos += 10; // Espacio entre respuestas
        });
        
        // Guardar PDF
        doc.save(`${fileName}.pdf`);
      }
      
    } catch (error) {
      console.error('Error al exportar respuestas:', error);
      setSnackbar({
        open: true,
        message: 'Error al exportar las respuestas',
        severity: 'error',
      });
    } finally {
      handleMenuClose();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!form) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h6" color="error">
          No se encontró el formulario solicitado.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/forms')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              {form.title}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {mockResponses.length} respuestas • Creado el {new Date(form.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleMenuOpen}
            sx={{ textTransform: 'none', borderRadius: 2, mr: 2 }}
          >
            Exportar
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => handleExportResponses('csv')}>CSV (.csv)</MenuItem>
            <MenuItem onClick={() => handleExportResponses('excel')}>Excel (.xlsx)</MenuItem>
            <MenuItem onClick={() => handleExportResponses('pdf')}>PDF (.pdf)</MenuItem>
            <Divider />
            <MenuItem onClick={handleDeleteAllResponses} sx={{ color: 'error.main' }}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Eliminar todas las respuestas
            </MenuItem>
          </Menu>
          <Button
            variant="contained"
            startIcon={<AnalyticsIcon />}
            onClick={() => navigate(`/forms/analytics/${id}`)}
            sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}
          >
            Análisis
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleChangeTab}
            aria-label="response tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Respuestas" {...a11yProps(0)} />
            <Tab label="Preguntas" {...a11yProps(1)} />
            <Tab label="Configuración" {...a11yProps(2)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Buscar respuestas..."
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                  endAdornment: (
                    <IconButton size="small">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
                sx={{ width: 300, mr: 2 }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Filtros
              </Button>
            </Box>
            <Typography variant="body2" color="textSecondary">
              {mockResponses.length} respuestas
            </Typography>
          </Box>

          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Fecha de envío</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Calificación</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockResponses
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((response) => (
                      <TableRow
                        key={response.id}
                        hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {response.id}
                        </TableCell>
                        <TableCell>
                          {new Date(response.submittedAt).toLocaleString()}
                        </TableCell>
                        <TableCell>{response.data.name}</TableCell>
                        <TableCell>{response.data.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${response.data.rating}/5`}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            onClick={() => handleViewResponse(response)}
                            sx={{ textTransform: 'none' }}
                          >
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={mockResponses.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
              }
            />
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Preguntas del formulario
          </Typography>
          <Grid container spacing={3}>
            {form.fields.map((field: any, index: number) => (
              <Grid item xs={12} md={6} key={field.id}>
                <Card variant="outlined">
                  <CardHeader
                    title={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1">
                          {field.label || `Pregunta ${index + 1}`}
                        </Typography>
                        {field.required && (
                          <Typography color="error" component="span" sx={{ ml: 1 }}>
                            *
                          </Typography>
                        )}
                      </Box>
                    }
                    subheader={field.description || 'Sin descripción'}
                    subheaderTypographyProps={{ variant: 'body2' }}
                    action={
                      <IconButton size="small">
                        <MoreVertIcon />
                      </IconButton>
                    }
                    sx={{ pb: 0 }}
                  />
                  <CardContent>
                    <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, mt: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        {getFieldTypeLabel(field.type)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Configuración de respuestas
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader
                  title="Notificaciones"
                  subheader="Configura las notificaciones para nuevas respuestas"
                  subheaderTypographyProps={{ variant: 'body2' }}
                />
                <CardContent>
                  <FormControlLabel
                    control={<Checkbox defaultChecked />}
                    label="Recibir notificaciones por correo electrónico"
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1, ml: 4 }}>
                    Se enviará una notificación a tu correo electrónico por cada nueva respuesta.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader
                  title="Configuración de privacidad"
                  subheader="Controla quién puede ver las respuestas"
                  subheaderTypographyProps={{ variant: 'body2' }}
                />
                <CardContent>
                  <FormControlLabel
                    control={<Checkbox defaultChecked />}
                    label="Permitir que los usuarios vean los resultados"
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1, ml: 4 }}>
                    Los encuestados podrán ver un resumen de las respuestas después de enviar el formulario.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Diálogo para ver respuesta detallada */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <span>Respuesta #{selectedResponse?.id}</span>
            <IconButton onClick={() => setViewDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedResponse && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  FECHA DE ENVÍO
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {new Date(selectedResponse.submittedAt).toLocaleString()}
                </Typography>
              </Grid>
              {Object.entries(selectedResponse.data).map(([key, value]) => (
                <Grid item xs={12} key={key}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    {key.toUpperCase()}
                  </Typography>
                  <Typography variant="body1">{String(value)}</Typography>
                  <Divider sx={{ my: 2 }} />
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Cerrar</Button>
          <Button variant="contained" onClick={() => {}}>
            Descargar PDF
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para eliminar respuestas */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Eliminar todas las respuestas</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar todas las respuestas de este formulario? Esta acción no
            se puede deshacer y se perderán todos los datos de las respuestas.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            onClick={confirmDeleteAllResponses}
            color="error"
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            Eliminar todo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

// Función auxiliar para obtener la etiqueta del tipo de campo
function getFieldTypeLabel(type: string): string {
  switch (type) {
    case 'text':
      return 'Texto corto';
    case 'textarea':
      return 'Párrafo';
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
      return 'Campo personalizado';
  }
}

export default FormResponses;
