import React, { useState, ReactNode } from 'react';
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
  Button,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PdfIcon,
  GridOn as CsvIcon,
  Description as DocxIcon,
  Close as CloseIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

declare global {
  interface Navigator {
    msSaveBlob?: (blob: any, defaultName?: string) => boolean;
  }
}

type ExportFormat = 'pdf' | 'csv' | 'xlsx' | 'json';

interface ExportMenuProps {
  forms: any[];
  disabled?: boolean;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ forms, disabled = false }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [exportCompleted, setExportCompleted] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExportClick = (format: ExportFormat) => {
    setExportFormat(format);
    setExportDialogOpen(true);
    handleClose();
  };

  const handleExport = async () => {
    if (!forms.length) return;
    
    setExporting(true);
    setExportCompleted(false);
    
    try {
      switch (exportFormat) {
        case 'pdf':
          await exportToPdf();
          break;
        case 'csv':
          exportToCsv();
          break;
        case 'xlsx':
          exportToXlsx();
          break;
        case 'json':
          exportToJson();
          break;
      }
      setExportCompleted(true);
    } catch (error) {
      console.error('Error exporting:', error);
    } finally {
      setExporting(false);
      
      // Cerrar el diálogo después de un breve retraso
      setTimeout(() => {
        setExportDialogOpen(false);
        setExportCompleted(false);
      }, 1500);
    }
  };

  const exportToPdf = async () => {
    const doc = new jsPDF();
    let yPos = 20;
    
    // Título
    doc.setFontSize(18);
    doc.text('Lista de Formularios', 14, yPos);
    yPos += 15;
    
    // Fecha de exportación
    doc.setFontSize(10);
    doc.text(`Exportado el: ${new Date().toLocaleDateString()}`, 14, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    
    // Contenido de los formularios
    forms.forEach((form, index) => {
      // Agregar nueva página si es necesario
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Título del formulario
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${form.title}`, 14, yPos);
      yPos += 7;
      
      // Detalles del formulario
      doc.setFont(undefined, 'normal');
      const details = [
        `Estado: ${form.status}`,
        `Tipo: ${form.type}`,
        `Etiquetas: ${form.tags.join(', ') || 'Ninguna'}`,
        `Respuestas: ${form.responsesCount || 0}`,
        `Creado: ${new Date(form.createdAt).toLocaleDateString()}`,
        `Última actualización: ${new Date(form.updatedAt).toLocaleDateString()}`
      ];
      
      details.forEach(detail => {
        doc.text(`• ${detail}`, 20, yPos);
        yPos += 6;
      });
      
      yPos += 6; // Espacio entre formularios
    });
    
    // Guardar el PDF
    doc.save(`formularios-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToCsv = () => {
    const csvData = forms.map(form => ({
      'Título': form.title,
      'Descripción': form.description,
      'Estado': form.status,
      'Tipo': form.type,
      'Etiquetas': form.tags.join(', '),
      'Respuestas': form.responsesCount || 0,
      'Creado': new Date(form.createdAt).toLocaleDateString(),
      'Última actualización': new Date(form.updatedAt).toLocaleDateString(),
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(csvData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `formularios-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportToXlsx = () => {
    const xlsxData = forms.map(form => ({
      'Título': form.title,
      'Descripción': form.description,
      'Estado': form.status,
      'Tipo': form.type,
      'Etiquetas': form.tags.join(', '),
      'Respuestas': form.responsesCount || 0,
      'Creado': new Date(form.createdAt).toLocaleDateString(),
      'Última actualización': new Date(form.updatedAt).toLocaleDateString(),
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(xlsxData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Formularios');
    XLSX.writeFile(workbook, `formularios-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToJson = () => {
    const jsonData = JSON.stringify(forms, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    saveAs(blob, `formularios-${new Date().toISOString().split('T')[0]}.json`);
  };

  const formatLabel = (format: ExportFormat) => {
    const formats = {
      pdf: 'PDF',
      csv: 'CSV',
      xlsx: 'Excel (XLSX)',
      json: 'JSON'
    };
    return formats[format] || format.toUpperCase();
  };

  return (
    <>
      <Tooltip title="Exportar">
        <IconButton
          onClick={handleClick}
          disabled={disabled || forms.length === 0}
          color="primary"
          aria-label="exportar"
        >
          <FileDownloadIcon />
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
        <MenuItem onClick={() => handleExportClick('pdf')}>
          <ListItemIcon>
            <PdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportar a PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExportClick('xlsx')}>
          <ListItemIcon>
            <CsvIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportar a Excel (XLSX)</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExportClick('csv')}>
          <ListItemIcon>
            <CsvIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportar a CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExportClick('json')}>
          <ListItemIcon>
            <DocxIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportar a JSON</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog 
        open={exportDialogOpen} 
        onClose={() => !exporting && setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Exportar formularios
          {exporting || exportCompleted ? null : (
            <IconButton
              aria-label="close"
              onClick={() => setExportDialogOpen(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent>
          {exporting || exportCompleted ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              {exporting ? (
                <>
                  <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
                  <Typography variant="h6" color="textSecondary">
                    Exportando a {formatLabel(exportFormat)}...
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Por favor, espere un momento.
                  </Typography>
                </>
              ) : (
                <>
                  <CheckIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                  <Typography variant="h6" color="textSecondary">
                    Exportación completada
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Se ha descargado el archivo correctamente.
                  </Typography>
                </>
              )}
            </Box>
          ) : (
            <Box sx={{ pt: 2 }}>
              <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 3 }}>
                <InputLabel id="export-format-label">Formato de exportación</InputLabel>
                <Select
                  labelId="export-format-label"
                  value={exportFormat}
                  onChange={(e: SelectChangeEvent<ExportFormat>) => setExportFormat(e.target.value as ExportFormat)}
                  label="Formato de exportación"
                >
                  <MenuItem value="pdf">PDF (Portable Document Format)</MenuItem>
                  <MenuItem value="xlsx">Excel (XLSX)</MenuItem>
                  <MenuItem value="csv">CSV (Valores separados por comas)</MenuItem>
                  <MenuItem value="json">JSON (JavaScript Object Notation)</MenuItem>
                </Select>
              </FormControl>
              
              <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Detalles de la exportación:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  • Formularios a exportar: <strong>{forms.length}</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  • Formato seleccionado: <strong>{formatLabel(exportFormat)}</strong>
                </Typography>
                {exportFormat === 'pdf' && (
                  <Typography variant="body2" color="textSecondary">
                    • El archivo PDF contendrá una lista formateada de todos los formularios.
                  </Typography>
                )}
                {exportFormat === 'xlsx' && (
                  <Typography variant="body2" color="textSecondary">
                    • El archivo Excel contendrá una tabla con todos los datos de los formularios.
                  </Typography>
                )}
                {exportFormat === 'csv' && (
                  <Typography variant="body2" color="textSecondary">
                    • El archivo CSV contendrá los datos de los formularios en formato de texto plano.
                  </Typography>
                )}
                {exportFormat === 'json' && (
                  <Typography variant="body2" color="textSecondary">
                    • El archivo JSON contendrá los datos completos de los formularios en formato estructurado.
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {!exporting && !exportCompleted && (
            <Button 
              onClick={() => setExportDialogOpen(false)} 
              color="inherit"
            >
              Cancelar
            </Button>
          )}
          {!exportCompleted && (
            <Button 
              onClick={handleExport} 
              variant="contained" 
              color="primary"
              disabled={exporting}
              startIcon={exporting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {exporting ? 'Exportando...' : 'Exportar'}
            </Button>
          )}
          {exportCompleted && (
            <Button 
              onClick={() => setExportDialogOpen(false)} 
              variant="contained" 
              color="primary"
            >
              Cerrar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExportMenu;
