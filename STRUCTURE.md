# Struktura Projektu - Wytyczne dla Developers

## 📂 Nowa Organizacja (Po Refaktoringu)

```
devprojects/
├── backend/
│   ├── chat-service/         ← Serwis czatu (DRF + PostgreSQL)
│   ├── users-service/        ← Serwis użytkowników (DRF + PostgreSQL)
├── frontend/
│   └── frontend-app/         ← React + Vite (Material-UI)
├── docker-compose.yml        ← Orkestracja wszystkich serwisów
└── .env                      ← Zmienne środowiskowe
```

## 🔄 Przepływ Pracy

### Backend
1. Zmiany w `backend/chat-service/` lub `backend/users-service/`
2. Docker automatycznie reloaduje (hot-reload dzięki volume mount)
3. Jeśli zmiany w modelu → uruchom migrację:
   ```bash
   docker-compose exec chat-service python manage.py migrate
   ```

### Frontend
1. Zmiany w `frontend/frontend-app/src/`
2. Dev server (Vite) przeładowuje automatycznie
3. Build do produkcji:
   ```bash
   cd frontend/frontend-app
   npm run build
   ```

## 🐳 Docker Compose Config

### Context Paths (ścieżki buildowania)
```yaml
chat-service:
  build:
    context: ./backend/chat-service  # ← Relative do docker-compose.yml
```

### Volume Mounts (dla hot-reload)
```yaml
volumes:
  - ./backend/chat-service:/app  # Kod zmienia się w kontenerze natychmiast
```

## 📌 Ważne Ścieżki

| Ścieżka | Cel |
|--------|-----|
| `backend/chat-service/ChatApp/models.py` | Modele czatu |
| `backend/chat-service/ChatApp/views.py` | API Endpoints czatu |
| `backend/users-service/UsersApp/models.py` | Model User |
| `frontend/frontend-app/src/api.js` | Konfiguracja API clients |
| `frontend/frontend-app/src/components/Chat.jsx` | Główny komponent czatu |
| `docker-compose.yml` | Konfiguracja kontenerów |

## 🚀 Typowe Operacje

### Dodanie nowego endpointa w chat-service
1. Edytuj `backend/chat-service/ChatApp/views.py`
2. Edytuj `backend/chat-service/ChatApp/urls.py`
3. Kontener się przeładuje automatycznie

### Dodanie nowego modelu
1. Edytuj `backend/chat-service/ChatApp/models.py` (lub users-service)
2. Stwórz migrację:
   ```bash
   docker-compose exec chat-service python manage.py makemigrations
   docker-compose exec chat-service python manage.py migrate
   ```

### Frontend API Integration
- Import z `frontend/frontend-app/src/api.js`
- Endpoints: `http://localhost:8000` (users), `http://localhost:8001` (chat)
- Auth: JWT Token w `localStorage.access_token`

## 🔐 Bezpieczeństwo (Produkcja)

- [ ] Wyłączyć `DEBUG = True` w settings.py
- [ ] Użyć environment variables dla SECRET_KEY
- [ ] Włączyć HTTPS w Terraform
- [ ] Skonfigurować AWS Cognito zamiast JWT
- [ ] Skonfigurować AWS S3 dla media files
- [ ] CORS whitelist (nie `*`)

## 🧪 Testing

```bash
# Backend (Django)
docker-compose exec chat-service python manage.py test

# Frontend (Vitest - jeśli skonfigurowany)
cd frontend/frontend-app && npm test
```

## 📊 Monitorowanie

```bash
# Logi wszystkich serwisów
docker-compose logs -f

# Logi jednego serwisu
docker-compose logs -f chat-service

# Sprawdzanie zdrowia serwisów
docker-compose ps
```

