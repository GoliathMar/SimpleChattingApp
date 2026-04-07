import axios from 'axios';

// Łącznik z backendem użytkowników
export const usersApi = axios.create({
    baseURL: 'http://localhost:8000/api/users/',
});

// Łącznik z backendem czatu
export const chatApi = axios.create({
    baseURL: 'http://localhost:8001/api/chat/',
});

// Automatyczne wstrzykiwanie tokena do zapytań czatu
chatApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const authInterceptor = (config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

chatApi.interceptors.request.use(authInterceptor);
usersApi.interceptors.request.use(authInterceptor);