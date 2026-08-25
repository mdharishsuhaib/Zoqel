import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[Zoqel API Error]', err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default client;
