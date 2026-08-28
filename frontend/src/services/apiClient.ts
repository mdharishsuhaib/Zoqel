import axios from 'axios';
const apiClient = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', 
  timeout: 10000 
});
apiClient.interceptors.response.use(r => {
  if (typeof r.data === 'string' && r.data.includes('<!DOCTYPE html>')) {
    return Promise.reject(new Error('Received HTML instead of JSON. Check API URL.'));
  }
  return r;
}, err => { 
  console.warn('[API]', err.message); 
  return Promise.reject(err); 
});
export default apiClient;
