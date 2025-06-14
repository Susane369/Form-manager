import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Container, CssBaseline } from '@mui/material';

// Layout
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import FormList from './pages/FormList';
import FormBuilder from './pages/FormBuilder';
import FormResponses from './pages/FormResponses';
import NotFound from './pages/NotFound';
import FormPublicView from './pages/FormPublicView';
import Analytics from './pages/Analytics';

// Context
import { FormProvider } from './context/FormContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <ThemeProvider>
      <CssBaseline />
      <FormProvider>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <MainLayout 
            mobileOpen={mobileOpen} 
            handleDrawerToggle={handleDrawerToggle} 
          />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: { xs: 2, sm: 3 },
              width: { sm: `calc(100% - 240px)` },
              ml: { sm: '240px' },
              mt: '64px',
            }}
          >
            <Container maxWidth="xl" sx={{ py: 3 }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/forms" element={<FormList />} />
                <Route path="/forms/create" element={<FormBuilder />} />
                <Route path="/forms/edit/:id" element={<FormBuilder />} />
                <Route path="/forms/responses/:id" element={<FormResponses />} />
                <Route path="/forms/public/:id" element={<FormPublicView />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Container>
          </Box>
        </Box>
      </FormProvider>
    </ThemeProvider>
  );
}

export default App;
