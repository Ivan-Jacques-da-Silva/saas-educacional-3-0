
// Configuração base da API
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-url.com/api' 
  : 'http://localhost:5000/api';

// URLs específicas para cada endpoint
export const API_ENDPOINTS = {
  // Autenticação
  LOGIN: `${API_BASE_URL}/auth/login`,
  GET_USER: (id) => `${API_BASE_URL}/auth/me/${id}`,
  
  // Dashboard
  DASHBOARD_STATS: `${API_BASE_URL}/dashboard/stats`,
  ESCOLA_STATS: (escolaId) => `${API_BASE_URL}/dashboard/escola/${escolaId}/stats`,
  
  // Usuários
  USERS: `${API_BASE_URL}/users`,
  USER_BY_ID: (id) => `${API_BASE_URL}/users/${id}`,
  REGISTER: `${API_BASE_URL}/register`,
  CHANGE_PASSWORD: (id) => `${API_BASE_URL}/change-password/${id}`,
  EDIT_USER: (id) => `${API_BASE_URL}/edit-user/${id}`,
  USUARIOS_MATRICULA: `${API_BASE_URL}/usuarios-matricula`,
  
  // Escolas
  ESCOLAS: `${API_BASE_URL}/escolas`,
  ESCOLA_BY_ID: (id) => `${API_BASE_URL}/escolas/${id}`,
  
  // Matrículas
  MATRICULAS: `${API_BASE_URL}/matriculas`,
  MATRICULA_BY_ID: (id) => `${API_BASE_URL}/matriculas/${id}`,
  
  // Cursos
  CURSOS: `${API_BASE_URL}/cursos`,
  CURSO_BY_ID: (id) => `${API_BASE_URL}/cursos/${id}`,
  
  // Turmas
  TURMAS: `${API_BASE_URL}/turmas`,
  TURMA_BY_ID: (id) => `${API_BASE_URL}/turmas/${id}`,
  REGISTER_TURMA: `${API_BASE_URL}/register-turma`,
  UPDATE_TURMA: (id) => `${API_BASE_URL}/update-turma/${id}`,
  USERS_PROFESSORES: `${API_BASE_URL}/users-professores`,
  
  // Áudios
  AUDIOS: `${API_BASE_URL}/audios`,
  AUDIO_BY_ID: (id) => `${API_BASE_URL}/audios/${id}`,
  
  // Upload de arquivos
  UPLOADS: 'http://localhost:5000/uploads'
};

// Headers padrão para requisições
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Headers para upload de arquivos
export const API_HEADERS_MULTIPART = {
  'Accept': 'application/json'
  // Não definir Content-Type para FormData
};
