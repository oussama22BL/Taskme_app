import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL
});

// Intercepteur pour ajouter le token JWT
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskme_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse pour gérer les erreurs
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginPage = window.location.pathname === '/login';
    if ((error.response?.status === 401 || error.response?.status === 403)  && !isLoginPage) {
      localStorage.removeItem('taskme_token');
      localStorage.removeItem('taskme_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  
  }
);

export default axiosInstance;