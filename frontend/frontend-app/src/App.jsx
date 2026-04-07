import { useState } from 'react'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import Login from './components/Login'
import Chat from './components/Chat' // <--- Nowy import!

const theme = createTheme({
  palette: { mode: 'dark' }
})

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'))

  // Funkcja wylogowywania przekazywana do czatu
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsLoggedIn(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {!isLoggedIn ? (
        <Login onLoginSuccess={() => setIsLoggedIn(true)} />
      ) : (
        <Chat onLogout={handleLogout} /> //
      )}
    </ThemeProvider>
  )
}

export default App