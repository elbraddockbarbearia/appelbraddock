import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token on every request if present
api.interceptors.request.use((config) => {
  // Check if this is an admin request based on the URL or custom headers
  // For safety, if adminToken exists and it's an admin dashboard request, we use it.
  // A simple way: just pass the adminToken if the url contains admin-specific paths,
  // but since our API is generalized (e.g., /dashboard, /cashier), 
  // we can look at the current pathname in the browser.
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  
  const token = isAdminRoute ? localStorage.getItem('adminToken') : localStorage.getItem('clientToken');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
