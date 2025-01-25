import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Typography, Button, Box } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import Dashboard from './components/Dashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb', // Tailwind blue-600
    },
    background: {
      default: '#f3f4f6', // Tailwind gray-100
    },
  },
});

function App() {
  const handleLogin = () => {
    // Redirect to backend OAuth route
    window.location.href = 'http://localhost:3001/api/auth/google';
  };

  const Landing = () => (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: 'white',
          p: 4,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
          Welcome to Flux
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Supercharge the way you use email.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<GoogleIcon />}
          onClick={handleLogin}
          sx={{
            py: 1.5,
            px: 4,
            textTransform: 'none',
            fontSize: '1.1rem',
          }}
        >
          Sign in with Google
        </Button>
      </Box>
    </Container>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 