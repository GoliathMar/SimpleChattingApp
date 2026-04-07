import { useState, useEffect, useRef } from 'react';
import {
  Box, List, ListItem, ListItemButton, ListItemText, Typography,
  Paper, TextField, Button, AppBar, Toolbar,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Avatar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import SendIcon from '@mui/icons-material/Send';
import { chatApi, usersApi } from '../api';

function stringToColor(string) {
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

export default function Chat({ onLogout }) {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [userCache, setUserCache] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await usersApi.get('me/');
        setCurrentUserId(response.data.id);
      } catch (error) {
        console.error("Błąd /me/. Zaloguj się ponownie.");
      }
    };
    fetchMe();
  }, []);

  const fetchUsername = async (userId) => {
    if (userCache[userId]) return;
    try {
      const response = await usersApi.get(`${userId}/`);
      setUserCache(prev => ({ ...prev, [userId]: response.data.username }));
    } catch (e) {
      setUserCache(prev => ({ ...prev, [userId]: `User_${userId.substring(0,4)}` }));
    }
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await chatApi.get('rooms/');
        setRooms(response.data);
      } catch (e) { console.error("401? Przeloguj się."); }
    };
    fetchRooms();
  }, []);

  // Odświeżanie wiadomości z przywróconym Pollingiem (co 3 sekundy)
  useEffect(() => {
    if (!activeRoom) return;

    const fetchMsgs = async () => {
      try {
        const response = await chatApi.get(`rooms/${activeRoom.id}/messages/`);
        setMessages(response.data);
        response.data.forEach(m => fetchUsername(m.sender_id));
      } catch (e) { console.error(e); }
    };

    fetchMsgs(); // Pobranie natychmiastowe
    const intervalId = setInterval(fetchMsgs, 3000); // Polling w tle

    return () => clearInterval(intervalId); // Sprzątanie stopera po wyjściu z pokoju
  }, [activeRoom]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!activeRoom || (!newMessage.trim() && !file)) return;
    try {
      const formData = new FormData();
      if (newMessage.trim()) formData.append('text', newMessage);
      if (file) formData.append('file', file);
      const res = await chatApi.post(`rooms/${activeRoom.id}/messages/`, formData);
      setMessages([...messages, res.data]);
      setNewMessage(''); setFile(null);
    } catch (e) { console.error(e); }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    try {
      const res = await chatApi.post('rooms/', { name: newRoomName });
      setRooms([...rooms, res.data]);
      setIsDialogOpen(false); setNewRoomName('');
    } catch (e) { alert("Błąd 401! Sesja wygasła. Wyloguj się i zaloguj ponownie."); }
  };

  const handleDownload = async (messageId, fileName) => {
    try {
      // Pobierz plik z backendu
      const response = await chatApi.get(`messages/${messageId}/download/`, {
        responseType: 'blob',
      });

      // Utwórz obiekt Blob z prawidłowym MIME type z headera
      const mimeType = response.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: mimeType });

      // Wyodrębnij filename z Content-Disposition header jeśli dostępny
      let downloadFileName = fileName || `attachment_${messageId}`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch && fileNameMatch[1]) {
          downloadFileName = fileNameMatch[1];
        }
      }

      // Utwórz link pobierania i kliknij go
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', downloadFileName);
      document.body.appendChild(link);
      link.click();

      // Sprzątanie
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Błąd pobierania załącznika:", error);
      alert("Nie udało się pobrać pliku. Sprawdź konsolę.");
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      {/* PANEL BOCZNY */}
      <Box sx={{ width: 280, bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
        <Toolbar sx={{ borderBottom: 1, borderColor: 'divider', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight="bold">Czat</Typography>
          <IconButton onClick={() => setIsDialogOpen(true)} color="primary"><AddIcon /></IconButton>
        </Toolbar>
        <List sx={{ flexGrow: 1, overflow: 'auto' }}>
          {rooms.map((r) => (
            <ListItemButton key={r.id} selected={activeRoom?.id === r.id} onClick={() => setActiveRoom(r)}>
              <ListItemText primary={r.name} />
            </ListItemButton>
          ))}
        </List>
        <Button onClick={onLogout} color="error" sx={{ m: 2 }}>Wyloguj</Button>
      </Box>

      {/* OKNO CZATU */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {activeRoom ? (
          <>
            <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
              <Toolbar><Typography variant="h6" fontWeight="bold" color="text.primary">{activeRoom.name}</Typography></Toolbar>
            </AppBar>

            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {messages.map((m) => {
                const isOwn = m.sender_id === currentUserId;
                const name = userCache[m.sender_id] || "...";

                return (
                  <Box key={m.id} sx={{
                    display: 'flex',
                    justifyContent: isOwn ? 'flex-start' : 'flex-end',
                    mb: 1.5
                  }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', maxWidth: '80%', alignItems: 'flex-start' }}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: stringToColor(name), mr: 1, color: 'white' }}>
                        {name[0]?.toUpperCase()}
                      </Avatar>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="caption" sx={{ mb: 0.5, color: 'text.secondary' }}>{name} • {new Date(m.timestamp).toLocaleTimeString()}</Typography>
                        <Paper sx={{
                          p: 1.5,
                          bgcolor: isOwn ? 'primary.dark' : 'background.paper',
                          color: isOwn ? 'primary.contrastText' : 'text.primary',
                          borderRadius: '10px',
                          borderTopLeftRadius: 0,
                          boxShadow: 2
                        }}>
                          <Typography variant="body2">{m.text}</Typography>
                          {m.file && (
                            <Button size="small" startIcon={<InsertDriveFileIcon />} onClick={() => handleDownload(m.id, m.file_name)} sx={{ mt: 1, color: 'inherit' }}>
                              Pobierz
                            </Button>
                          )}
                        </Paper>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* PANEL WPISYWANIA */}
            <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
              <Paper variant="outlined" sx={{ p: 1, bgcolor: 'background.default' }}>
                <TextField
                  fullWidth multiline maxRows={3} variant="standard" placeholder="Napisz wiadomość"
                  InputProps={{ disableUnderline: true }}
                  value={newMessage} onChange={e => setNewMessage(e.target.value)}
                />

                {/* Wskaźnik wybranego pliku */}
                {file && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, p: 0.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <InsertDriveFileIcon fontSize="small" />
                    <Typography variant="caption" sx={{ flexGrow: 1 }}>{file.name}</Typography>
                    <IconButton size="small" onClick={() => setFile(null)}><AddIcon sx={{ transform: 'rotate(45deg)', fontSize: 16 }} /></IconButton>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <IconButton onClick={() => fileInputRef.current.click()}><AttachFileIcon /></IconButton>
                  <input type="file" ref={fileInputRef} hidden onChange={e => setFile(e.target.files[0])} />
                  <Button type="submit" endIcon={<SendIcon />} disabled={!newMessage.trim() && !file}>Wyślij</Button>
                </Box>
              </Paper>
            </Box>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography variant="h5" color="text.secondary">Wybierz pokój</Typography>
          </Box>
        )}
      </Box>

      {/* MODAL TWORZENIA POKOJU */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Nowy pokój</DialogTitle>
        <DialogContent><TextField autoFocus fullWidth value={newRoomName} onChange={e => setNewRoomName(e.target.value)} margin="dense" /></DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Anuluj</Button>
          <Button onClick={handleCreateRoom} variant="contained">Stwórz</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}