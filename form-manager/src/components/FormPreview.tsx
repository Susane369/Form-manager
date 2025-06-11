import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Article as FormIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  BarChart as AnalyticsIcon,
  FileCopy as DuplicateIcon,
  Delete as DeleteIcon,
  CheckCircle as PublishedIcon,
  Drafts as DraftIcon,
  Archive as ArchiveIcon,
} from '@mui/icons-material';
import { Form, FormStatus } from '../context/FormContext';

interface FormPreviewProps {
  form: Form | null;
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onViewResponses?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

const FormPreview: React.FC<FormPreviewProps> = ({
  form,
  open,
  onClose,
  onEdit,
  onViewResponses,
  onDuplicate,
  onDelete,
}) => {
  if (!form) return null;

  const getStatusIcon = (status: FormStatus) => {
    switch (status) {
      case 'published':
        return <PublishedIcon color="success" />;
      case 'draft':
        return <DraftIcon color="action" />;
      case 'archived':
        return <ArchiveIcon color="action" />;
      default:
        return <DraftIcon color="action" />;
    }
  };

  const getStatusLabel = (status: FormStatus) => {
    switch (status) {
      case 'published':
        return 'Publicado';
      case 'draft':
        return 'Borrador';
      case 'archived':
        return 'Archivado';
      default:
        return 'Desconocido';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          height: '90vh',
          maxHeight: '800px',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <FormIcon color="primary" />
            <Typography variant="h6" noWrap>
              {form.title}
            </Typography>
            <Chip
              icon={getStatusIcon(form.status)}
              label={getStatusLabel(form.status)}
              size="small"
              variant="outlined"
              sx={{ ml: 1 }}
            />
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                Descripción
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {form.description || 'No hay descripción disponible'}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 500 }}>
                Campos del formulario
              </Typography>
              
              {form.fields && form.fields.length > 0 ? (
                <List dense>
                  {form.fields.map((field, index) => (
                    <ListItem key={field.id} divider>
                      <ListItemText
                        primary={`${index + 1}. ${field.label}${field.required ? ' *' : ''}`}
                        secondary={`Tipo: ${field.type}${field.placeholder ? ` • ${field.placeholder}` : ''}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay campos definidos en este formulario.
                </Typography>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 20 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                Detalles
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Creado"
                    secondary={new Date(form.createdAt).toLocaleDateString()}
                  />
                </ListItem>
                
                {form.updatedAt && (
                  <ListItem>
                    <ListItemIcon>
                      <EditIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Última actualización"
                      secondary={new Date(form.updatedAt).toLocaleDateString()}
                    />
                  </ListItem>
                )}
                
                {form.responsesCount !== undefined && (
                  <ListItem>
                    <ListItemIcon>
                      <AnalyticsIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Respuestas"
                      secondary={form.responsesCount.toLocaleString()}
                    />
                  </ListItem>
                )}
                
                {form.tags && form.tags.length > 0 && (
                  <ListItem>
                    <ListItemText
                      primary="Etiquetas"
                      secondary={
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {form.tags.map(tag => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" />
                          ))}
                        </Box>
                      }
                      sx={{ '& .MuiListItemText-primary': { mb: 0.5 } }}
                    />
                  </ListItem>
                )}
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" flexDirection="column" gap={1}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={onEdit}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Editar formulario
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AnalyticsIcon />}
                  onClick={onViewResponses}
                  disabled={!form.responsesCount}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Ver respuestas {form.responsesCount ? `(${form.responsesCount})` : ''}
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DuplicateIcon />}
                  onClick={onDuplicate}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Duplicar
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={onDelete}
                  sx={{ justifyContent: 'flex-start', mt: 1 }}
                >
                  Eliminar
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} color="inherit">
          Cerrar
        </Button>
        <Button 
          onClick={() => {
            onEdit?.();
            onClose();
          }} 
          variant="contained"
          startIcon={<EditIcon />}
        >
          Editar formulario
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormPreview;
