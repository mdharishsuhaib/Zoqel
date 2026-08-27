import axios from 'axios';
const apiClient = axios.create({ baseURL: '/api', timeout: 10000 });
apiClient.interceptors.response.use(r => r, err => { console.warn('[API]', err.message); return Promise.reject(err); });
export default apiClient;
