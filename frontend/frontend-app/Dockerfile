# Stage 1: Build
FROM node:20-alpine as builder

WORKDIR /app

# Skopiuj package files
COPY package*.json ./

# Instaluj zależności
RUN npm ci

# Skopiuj kod źródłowy
COPY . .

# Build aplikacji
RUN npm run build

# Stage 2: Runtime (Nginx)
FROM nginx:alpine

# Skopiuj konfigurację Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Skopiuj zbudowaną aplikację z builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]


