
import axios from 'axios';
import { API_BASE_URL_NEW } from '../config/api.js';

// Configuração base do axios
const api = axios.create({
  baseURL: API_BASE_URL_NEW,
  timeout: 10000,
});

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Funções helper para os endpoints principais
export const apiHelper = {
  // Usuários
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  
  // Escolas
  getEscolas: () => api.get('/escolas'),
  getEscola: (id) => api.get(`/escolas/${id}`),
  createEscola: (data) => api.post('/escolas', data),
  updateEscola: (id, data) => api.put(`/escolas/${id}`, data),
  deleteEscola: (id) => api.delete(`/escolas/${id}`),
  
  // Matrículas
  getMatriculas: () => api.get('/matriculas'),
  getMatricula: (id) => api.get(`/matriculas/${id}`),
  createMatricula: (data) => api.post('/matriculas', data),
  updateMatricula: (id, data) => api.put(`/matriculas/${id}`, data),
  deleteMatricula: (id) => api.delete(`/matriculas/${id}`),
  
  // Cursos
  getCursos: () => api.get('/cursos'),
  getCurso: (id) => api.get(`/cursos/${id}`),
  createCurso: (data) => api.post('/cursos', data),
  updateCurso: (id, data) => api.put(`/cursos/${id}`, data),
  deleteCurso: (id) => api.delete(`/cursos/${id}`),
  
  // Turmas
  getTurmas: () => api.get('/turmas'),
  getTurma: (id) => api.get(`/turmas/${id}`),
  createTurma: (data) => api.post('/turmas', data),
  updateTurma: (id, data) => api.put(`/turmas/${id}`, data),
  deleteTurma: (id) => api.delete(`/turmas/${id}`),
  
  // Áudios
  getAudios: () => api.get('/audios'),
  getAudio: (id) => api.get(`/audios/${id}`),
  createAudio: (data) => api.post('/audios', data),
  updateAudio: (id, data) => api.put(`/audios/${id}`, data),
  deleteAudio: (id) => api.delete(`/audios/${id}`),
  
  // Auth
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
  getMe: () => api.get('/me'),
  
  // Dashboard
  getDashboard: () => api.get('/dashboard'),
};
