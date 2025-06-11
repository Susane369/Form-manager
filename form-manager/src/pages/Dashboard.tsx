import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, Sector
} from 'recharts';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

// Componentes
import { useFormContext } from '../context/FormContext';
import { RecentActivities } from '../components/RecentActivities';
import FloatingChatButton from '../components/FloatingChatButton';

// Material-UI
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  Chip, 
  Divider, 
  Grid, 
  IconButton, 
  LinearProgress, 
  ListItemIcon, 
  ListItemText, 
  Menu, 
  MenuItem, 
  Paper, 
  Stack, 
  Tooltip, 
  Typography, 
  useTheme 
} from '@mui/material';

// Iconos
import {
  Add as AddIcon,
  Archive as ArchiveIcon,
  BarChart as ChartIcon,
  CheckCircle as PublishedIcon,
  Drafts as DraftIcon,
  FileDownload as ExportIcon,
  FormatListBulleted as ListIcon,
  GridOn as XlsxIcon,
  Info as InfoIcon,
  InsertDriveFile as JsonIcon,
  People as ResponsesIcon,
  Refresh as RefreshIcon,
  TextSnippet as CsvIcon,
  TrendingUp as TrendIcon,
  TrendingUp as TrendUpIcon,
  TrendingDown as TrendDownIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { forms, getRecentActivities, exportAllForms } = useFormContext();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
  };

  const handleExport = (format: 'csv' | 'json' | 'xlsx') => {
    exportAllForms(format);
    handleExportClose();
  };

  const recentActivities = getRecentActivities(5);

  // Datos para el gráfico de formularios por estado
  const statusData = useMemo(() => {
    const statusCount = forms.reduce((acc, form) => {
      acc[form.status] = (acc[form.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Publicados', value: statusCount['published'] || 0, color: theme.palette.success.main },
      { name: 'Borradores', value: statusCount['draft'] || 0, color: theme.palette.warning.main },
      { name: 'Archivados', value: statusCount['archived'] || 0, color: theme.palette.text.disabled },
    ];
  }, [forms, theme]);

  // Datos para el gráfico de tendencia de respuestas (últimos 7 días)
  const responseTrendData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      const dateStr = format(date, 'EEE', { locale: es });
      // Simular datos de respuestas (en una aplicación real, vendría de tu API)
      const responses = Math.floor(Math.random() * 20);
      return { date: dateStr, respuestas: responses };
    });
  }, []);

  // Datos para el gráfico circular de tipos de formularios
  const formTypeData = useMemo(() => {
    const typeCount = forms.reduce((acc, form) => {
      acc[form.type] = (acc[form.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCount).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      color: {
        survey: theme.palette.primary.main,
        quiz: theme.palette.secondary.main,
        registration: theme.palette.info.main,
        contact: theme.palette.success.main,
        other: theme.palette.warning.main,
      }[type] || theme.palette.grey[500]
    }));
  }, [forms, theme]);

  // Estado para el tooltip del gráfico circular
  const [activePieIndex, setActivePieIndex] = React.useState(0);
  const onPieEnter = (_: any, index: number) => {
    setActivePieIndex(index);
  };

  const stats = useMemo(() => {
    const totalForms = forms.length;
    const publishedForms = forms.filter(form => form.status === 'published').length;
    const draftForms = forms.filter(form => form.status === 'draft').length;
    const archivedForms = forms.filter(form => form.status === 'archived').length;
    const totalResponses = forms.reduce((sum, form) => sum + (form.responsesCount || 0), 0);
    const avgResponses = totalForms > 0 ? (totalResponses / totalForms).toFixed(1) : 0;

    return [
      { 
        title: 'Total de Formularios', 
        value: totalForms,
        description: 'Formularios en total',
        icon: <ListIcon fontSize="large" color="primary" />,
        trend: '+12%',
        trendPositive: true
      },
      { 
        title: 'Publicados', 
        value: publishedForms,
        description: 'Formularios publicados',
        icon: <PublishedIcon fontSize="large" color="success" />,
        percentage: totalForms > 0 ? Math.round((publishedForms / totalForms) * 100) : 0
      },
      { 
        title: 'En Borrador', 
        value: draftForms,
        description: 'Formularios en borrador',
        icon: <DraftIcon fontSize="large" color="warning" />,
        percentage: totalForms > 0 ? Math.round((draftForms / totalForms) * 100) : 0
      },
      { 
        title: 'Archivados', 
        value: archivedForms,
        description: 'Formularios archivados',
        icon: <ArchiveIcon fontSize="large" color="action" />,
        percentage: totalForms > 0 ? Math.round((archivedForms / totalForms) * 100) : 0
      },
      { 
        title: 'Respuestas Totales', 
        value: totalResponses,
        description: 'Respuestas recibidas en total',
        icon: <ResponsesIcon fontSize="large" color="info" />,
        trend: '+8%',
        trendPositive: true
      },
      { 
        title: 'Promedio Respuestas', 
        value: avgResponses,
        description: 'Respuestas por formulario',
        icon: <TrendIcon fontSize="large" color="secondary" />
      },
    ];
  }, [forms]);

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Panel Principal
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExportClick}
            sx={{ mr: 2, textTransform: 'none', borderRadius: 2, px: 3, py: 1 }}
          >
            Exportar Todo
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/forms/create')}
            sx={{ textTransform: 'none', borderRadius: 2, px: 3, py: 1 }}
          >
            Nuevo Formulario
          </Button>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleExportClose}
        onClick={handleExportClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 200,
            borderRadius: 2,
            mt: 1.5
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleExport('csv')}>
          <ListItemIcon>
            <CsvIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportar a CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport('json')}>
          <ListItemIcon>
            <JsonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportar a JSON</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport('xlsx')}>
          <ListItemIcon>
            <XlsxIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportar a Excel</ListItemText>
        </MenuItem>
      </Menu>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" color="text.secondary">Resumen General</Typography>
          <Typography variant="body2" color="text.secondary">
            Estadísticas actualizadas en tiempo real
          </Typography>
        </Box>
        <Tooltip title="Actualizar datos">
          <IconButton color="primary" size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={4} key={index}>
            <Card 
              variant="outlined" 
              sx={{ 
                height: '100%', 
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4],
                }
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stat.title}
                      {stat.description && (
                        <Tooltip title={stat.description} arrow>
                          <IconButton size="small" sx={{ ml: 0.5, p: 0.5 }}>
                            <InfoIcon fontSize="small" color="disabled" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h4" component="div" fontWeight={600}>
                        {stat.value}
                      </Typography>
                      {stat.trend && (
                        <Chip 
                          label={stat.trend} 
                          size="small" 
                          color={stat.trendPositive ? 'success' : 'error'}
                          icon={stat.trendPositive ? <TrendUpIcon /> : <TrendDownIcon />}
                          sx={{ 
                            height: 20,
                            '& .MuiChip-icon': { fontSize: 16, ml: 0.5 }
                          }}
                        />
                      )}
                    </Box>
                    {'percentage' in stat && (
                      <Box sx={{ mt: 1, width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Progreso
                          </Typography>
                          <Typography variant="caption" fontWeight={500}>
                            {stat.percentage}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={stat.percentage} 
                          color={
                            stat.title.includes('Publicados') ? 'success' : 
                            stat.title.includes('Borrador') ? 'warning' : 'info'
                          }
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    )}
                  </Box>
                  <Box sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                  }}>
                    {stat.icon}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Gráfico de formularios por estado */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%', borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ px: 2, pt: 1, fontWeight: 600 }}>
              Formularios por Estado
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <YAxis tick={{ fill: theme.palette.text.secondary }} />
                <RechartsTooltip 
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 4
                  }}
                />
                <Bar dataKey="value" name="Cantidad">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Gráfico de tendencia de respuestas */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%', borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ px: 2, pt: 1, fontWeight: 600 }}>
              Tendencias de Respuestas (7 días)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={responseTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <YAxis tick={{ fill: theme.palette.text.secondary }} />
                <RechartsTooltip 
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 4
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="respuestas" 
                  name="Respuestas"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Gráfico de tipos de formularios */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%', borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ px: 2, pt: 1, fontWeight: 600 }}>
              Distribución por Tipo
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    activeIndex={activePieIndex}
                    activeShape={renderActiveShape}
                    data={formTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                  >
                    {formTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 4
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Actividad Reciente */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%', borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ px: 2, pt: 1, fontWeight: 600 }}>
              Actividad Reciente
            </Typography>
            <Box sx={{ p: 2 }}>
              <RecentActivities 
                activities={recentActivities} 
                onViewForm={(formId) => {
                  const form = forms.find(f => f.id === formId);
                  if (form) {
                    navigate(`/forms/${formId}`);
                  }
                }} 
              />
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
            <CardHeader
              title="Formularios Populares"
              titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
            />
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="textSecondary">
                  Próximamente: Tus formularios más populares
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Botón flotante de chat */}
      <FloatingChatButton />
    </Box>
  );
};

// Componente para el tooltip personalizado del gráfico circular
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
  
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <text x={cx} y={cy} dy={-20} textAnchor="middle" fill={fill} style={{ fontWeight: 'bold' }}>
        {payload.name}
      </text>
      <text x={cx} y={cy} dy={0} textAnchor="middle" fill="#666">
        {payload.value} {payload.value === 1 ? 'formulario' : 'formularios'}
      </text>
      <text x={cx} y={cy} dy={20} textAnchor="middle" fill="#999">
        {((payload.percent || 0) * 100).toFixed(0)}%
      </text>
    </g>
  );
};

export default Dashboard;
