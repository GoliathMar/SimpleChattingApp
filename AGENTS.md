# AGENTS.md

## Architecture Overview
This is a microservices Django application with two services (so far, might add more later):
- **users-service**: Handles user management, authentication (JWT), and profiles. Runs in Docker with PostgreSQL.
- **chat-service**: Manages chat rooms, participants, and messages. Runs locally with SQLite (will switch to Postgres).

Services communicate via REST APIs. User IDs are UUIDs shared across services.

Key files:
- `docker-compose.yml`: Defines users-service and its database.
- `users-service/ConfigApp/settings.py`: PostgreSQL config, custom User model (`UsersApp.User`).
- `chat-service/ChatConfig/settings.py`: SQLite config, no custom apps installed yet.

## Critical Workflows
- **Run users-service**: `docker-compose up` (builds and starts Postgres + Django on port 8000).
- **Run chat-service**: `cd chat-service && python manage.py runserver` (port 8000, conflicts with users-service).
- **Migrations**: `python manage.py makemigrations && python manage.py migrate` (run in respective service dirs).
- **Tests**: `python manage.py test` (no tests implemented yet).
- **Debugging**: Use Django debug toolbar if installed; check logs in Docker for users-service.

## Project Conventions
- **IDs**: Use UUID for all primary keys (e.g., `models.UUIDField(primary_key=True, default=uuid.uuid4)` in `users-service/UsersApp/models.py`).
- **Authentication**: JWT via `djangorestframework_simplejwt` in users-service; DRF `IsAuthenticated` in views.
- **Serialization**: DRF serializers with `read_only_fields` (e.g., `MessageSerializer` in `chat-service/ChatApp/serializers.py`).
- **Models**: Custom User extends `AbstractUser`; relationships use `related_name` (e.g., `Room.messages`).
- **URLs**: Not integrated yet; add `path('api/', include('ChatApp.urls'))` to `chat-service/ChatConfig/urls.py` after creating `ChatApp/urls.py`.

## Integration Points
- **Database**: Users-service uses env vars for Postgres (`DB_NAME`, etc.); chat-service uses local SQLite (currently).
- **Dependencies**: `requirements.txt` in users-service; none in chat-service. (TO DO: add one for chat-service).
- **Cross-service**: Chat views reference `user_id` (UUID) from users-service; no direct API calls yet. (TO DO: add API client for user-service in chat-service).
- **Environment**: `.env` file for users-service secrets (not committed).</content>
<parameter name="filePath">\\wsl.localhost\Ubuntu\home\marci\devprojects\AGENTS.md
