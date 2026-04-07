# Aplikacja Chat - Mikroserwisy

Aplikacja czatu zbudowana z architekturą mikroserwisów, z frontendem React i backendem Django.

## 📁 Struktura Projektu

```
devprojects/
├── backend/                          # Serwisy backendowe
│   ├── chat-service/                # Serwis czatu (port 8001)
│   │   ├── ChatApp/
│   │   ├── ChatConfig/
│   │   ├── Dockerfile
│   │   ├── manage.py
│   │   └── requirements.txt
│   └── users-service/               # Serwis użytkowników (port 8000)
│       ├── UsersApp/
│       ├── ConfigApp/
│       ├── Dockerfile
│       ├── manage.py
│       └── requirements.txt
├── frontend/                         # Aplikacja frontendowa
│   └── frontend-app/                # React Vite + Nginx (port 3000)
│       ├── src/
│       │   ├── components/
│       │   ├── api.js
│       │   └── main.jsx
│       ├── Dockerfile               # Multi-stage build (Node → Nginx)
│       ├── nginx.conf               # Nginx configuration
│       ├── package.json
│       ├── vite.config.js
│       ├── .dockerignore
│       └── public/
├── docker-compose.yml               # Orkestracja kontenerów
├── .env                             # Zmienne środowiskowe
└── AGENTS.md                        # Dokumentacja dla AI
```

## 🚀 Uruchamianie Aplikacji

### Wymagania
- Docker & Docker Compose
- Node.js 18+ (do lokalnego dev frontendu)
- Python 3.12+ (do lokalnego dev backendu)

### Start Serwisów
```bash
# Uruchom kontenery
docker-compose up -d

# Sprawdź status
docker-compose ps
```

### Adresy Serwisów
- **Frontend (Production)**: http://localhost:3000 ✅ (Nginx container)
- **Users Service API**: http://localhost:8000/api/users/
- **Chat Service API**: http://localhost:8001/api/chat/
- **Frontend** (dev mode): `cd frontend/frontend-app && npm run dev` → http://localhost:5173

### Frontend Development
```bash
cd frontend/frontend-app
npm install
npm run dev
```

## 🔧 Migracje Bazy Danych

Migracje są uruchamiane automatycznie w kontenerach. Aby uruchomić ręcznie:

```bash
# Chat Service
docker-compose exec chat-service python manage.py migrate

# Users Service
docker-compose exec users-service python manage.py migrate
```

## 🐳 Docker Setup

### Frontend Dockerfile (Multi-stage)
- **Stage 1 (Builder)**: Node 20-Alpine - instaluje zależności i buduje projekt (`npm run build`)
- **Stage 2 (Runtime)**: Nginx Alpine - serwuje statyczne pliki z `dist/` folderu

### Endpoints w Kontenerze
```
Frontend (Nginx)    → localhost:3000
Chat Service        → localhost:8001
Users Service       → localhost:8000
```

### Konfiguracja Nginx (nginx.conf)
- SPA routing (wszystkie ścieżki kierują do `index.html`)
- Gzip compression dla statycznych plików
- Cache-busting dla JS/CSS (`expires 1y`)
- Health check endpoint na `/health`

## 🛑 Zatrzymanie Serwisów

```bash
docker-compose down
```

## 🛠 Development vs Production

### Development (Hot Reload)
```bash
# Terminal 1: Backend services (Docker)
cd /home/marci/devprojects
docker-compose up -d

# Terminal 2: Frontend (Vite dev server)
cd frontend/frontend-app
npm install
npm run dev  # http://localhost:5173 (hot reload)
```

### Production (Dockerized)
```bash
# Wszystko w kontenerach (bez dostępu do dev server)
docker-compose up -d
# Frontend będzie dostępny na http://localhost:3000 (Nginx)
```

## 📝 Zmienne Środowiskowe (.env)

```
DB_NAME=chat_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=chat-db
DB_PORT=5432
SHARED_JWT_SECRET=your_secret_key
DJANGO_DEBUG=True
```

## 🔌 API Endpoints

### Users Service (port 8000)
- `POST /api/users/register/` - Rejestracja
- `POST /api/users/login/` - Logowanie
- `GET /api/users/profile/` - Profil użytkownika
- `GET /api/users/me/` - Dane bieżącego użytkownika

### Chat Service (port 8001)
- `GET /api/chat/rooms/` - Lista pokojów
- `POST /api/chat/rooms/` - Tworzenie pokoju
- `GET /api/chat/rooms/{room_id}/messages/` - Wiadomości w pokoju
- `POST /api/chat/rooms/{room_id}/messages/` - Wysyłanie wiadomości (z plikikami)
- `GET /api/chat/messages/{message_id}/download/` - Pobieranie załącznika

## 📚 Dokumentacja

- `AGENTS.md` - Wytyczne dla AI asystentów
- `docker-compose.yml` - Konfiguracja kontenerów
- `backend/chat-service/ChatApp/` - Logika czatu
- `backend/users-service/UsersApp/` - Logika użytkowników
- `frontend/frontend-app/src/` - Komponenty React

## 🐛 Troubleshooting

### Kontenery nie startują
```bash
docker-compose logs
docker-compose down -v  # Usuń voluminy i spróbuj ponownie
```

### Port już w użyciu
```bash
lsof -i :8000  # Sprawdzaj port 8000
lsof -i :8001  # Sprawdzaj port 8001
```

### Reset bazy danych
```bash
docker-compose down -v
docker-compose up -d
```

