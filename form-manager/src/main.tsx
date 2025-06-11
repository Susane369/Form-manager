import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import Auth from './components/Auth/Auth';
import PrivateRoute from './components/Auth/PrivateRoute';

// Importa la configuración de Firebase para que se inicialice
import './firebase/config';

console.log('Iniciando la aplicación...');

// Verificar si el elemento root existe
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ No se encontró el elemento con id "root" en el DOM');
  console.log('Contenido del body:', document.body.innerHTML);
} else {
  console.log('✅ Elemento root encontrado:', rootElement);
  console.log('📦 React version:', React.version);
  console.log('🌍 NODE_ENV:', import.meta.env.MODE);
}

import App from './App';
import './index.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            <Route path="/login" element={<Auth />} />
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <App />
                </PrivateRoute>
              }
            />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
