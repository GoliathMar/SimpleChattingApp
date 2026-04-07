import { useState } from 'react';
import { Button, TextField, Box, Typography, Container, Alert } from '@mui/material';
import { usersApi } from '../api';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Wysyłamy dane do logowania
      const response = await usersApi.post('login/', { username, password });

      // Zapisujemy token JWT w przeglądarce
      localStorage.setItem('access_token', response.data.access);

      // Informujemy główną aplikację, że logowanie się powiodło
      onLoginSuccess();
    } catch (err) {
      setError('Nieprawidłowy login lub hasło');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Mikrochat
        </Typography>

        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Nazwa użytkownika"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Hasło"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            Zaloguj się
          </Button>
        </Box>
      </Box>
    </Container>
  );
}