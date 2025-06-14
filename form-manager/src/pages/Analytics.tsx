import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent,
  Divider,
  useTheme
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { useFormContext } from '../context/FormContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Analytics: React.FC = () => {
  const { forms } = useFormContext();
  const theme = useTheme();

  // Datos de ejemplo para gráficos
  const formStats = forms.map(form => ({
    name: form.title,
    respuestas: form.responsesCount || 0,
    preguntas: form.fields?.length || 0,
  }));

  const statusData = [
    { name: 'Activos', value: forms.filter(f => f.status === 'active').length },
    { name: 'Inactivos', value: forms.filter(f => f.status !== 'active').length },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Análisis de Formularios
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Total de Formularios
              </Typography>
              <Typography variant="h3">
                {forms.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Respuestas Totales
              </Typography>
              <Typography variant="h3">
                {forms.reduce((acc, form) => acc + (form.responsesCount || 0), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Respuestas Totales
              </Typography>
              <Typography variant="h3">
                {forms.reduce((acc, form) => acc + (form.responsesCount || 0), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400 }} elevation={3}>
            <Typography variant="h6" gutterBottom>
              Respuestas por Formulario
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={formStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="respuestas" fill="#8884d8" name="Respuestas" />
                <Bar dataKey="preguntas" fill="#82ca9d" name="Preguntas" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400 }} elevation={3}>
            <Typography variant="h6" gutterBottom>
              Estado de Formularios
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: 400 }} elevation={3}>
            <Typography variant="h6" gutterBottom>
              Actividad Reciente
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart
                data={[
                  { name: 'Ene', value: 40 },
                  { name: 'Feb', value: 30 },
                  { name: 'Mar', value: 20 },
                  { name: 'Abr', value: 27 },
                  { name: 'May', value: 18 },
                  { name: 'Jun', value: 23 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" name="Respuestas" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
