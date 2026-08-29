import axios from 'axios';

const apiClient = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', 
  timeout: 120000 
});

apiClient.interceptors.request.use((config) => {
  // Prefer demo token when in demo mode, fall back to regular auth token
  const token = localStorage.getItem('zoqel_token') || localStorage.getItem('zoqel_demo_token');
  if (token && token !== 'offline-demo' && config.headers) {
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
    // Only redirect to login for real authenticated sessions that have expired.
    // Do NOT redirect if the 401 came from an attempted login/register itself!
    const isAuthEndpoint = err.config?.url?.includes('/auth/');
    const isDemoMode = !!localStorage.getItem('zoqel_demo_token');
    
    if (!isDemoMode && !isAuthEndpoint) {
      localStorage.removeItem('zoqel_user');
      localStorage.removeItem('zoqel_token');
      window.location.href = '/login';
    }
  }
  console.warn('[API]', err.message);
  return Promise.reject(err);
});

export default apiClient;
