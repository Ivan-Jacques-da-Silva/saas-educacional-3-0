
import { API_HEADERS, API_HEADERS_MULTIPART } from '../config/api';

// Função genérica para fazer requisições
export const apiRequest = async (url, options = {}) => {
  try {
    const defaultOptions = {
      headers: API_HEADERS,
      ...options
    };

    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
};

// Função para GET
export const apiGet = (url) => {
  return apiRequest(url, { method: 'GET' });
};

// Função para POST
export const apiPost = (url, data) => {
  return apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

// Função para PUT
export const apiPut = (url, data) => {
  return apiRequest(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

// Função para DELETE
export const apiDelete = (url) => {
  return apiRequest(url, { method: 'DELETE' });
};

// Função para upload de arquivos
export const apiUpload = async (url, formData) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: API_HEADERS_MULTIPART,
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro no upload:', error);
    throw error;
  }
};

// Função para update com upload
export const apiUpdateWithUpload = async (url, formData) => {
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: API_HEADERS_MULTIPART,
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro no update com upload:', error);
    throw error;
  }
};
