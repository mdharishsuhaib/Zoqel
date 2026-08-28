import axios from 'axios';

const apiClient = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', 
  timeout: 10000 
});

apiClient.interceptors.request.use((config) => {
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
  const token = localStorage.getItem('zoqel_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(r => {
  if (typeof r.data === 'string' && r.data.includes('<!DOCTYPE html>')) {
    return Promise.reject(new Error('Received HTML instead of JSON. Check API URL.'));
  }
  return r;
}, err => { 
  if (err.response?.status === 401) {
    localStorage.removeItem('zoqel_user');
    localStorage.removeItem('zoqel_token');
    window.location.href = '/login';
  }
  console.warn('[API]', err.message); 
  return Promise.reject(err); 
});

export default apiClient;
