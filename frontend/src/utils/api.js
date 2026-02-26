import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Attach token if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ⚠️ DO NOT force redirect on every 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const currentPath = window.location.pathname;

    // Only redirect to login if user is on PROTECTED pages
    const protectedPaths = [
      '/dashboard',
      '/cart',
      '/my-orders',
      '/suggestions',
      '/deal-board',
      '/supplier',
      '/admin',
    ];

    const isProtected = protectedPaths.some(p => currentPath.startsWith(p));

    if (status === 401 && isProtected) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(err);
  }
);

export default API;