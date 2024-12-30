export const isDevelopment = process.env.NODE_ENV === 'development';

export const setupDevMode = () => {
  if (isDevelopment) {
    // Mock authentication token
    localStorage.setItem('token', 'dev-token');
    
    // Add default headers to axios
    const axios = require('axios');
    axios.defaults.headers.common['Authorization'] = 'Bearer dev-token';
  }
};