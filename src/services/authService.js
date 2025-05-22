import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.blockchain.deliver.ar';
const AUTH_LOGIN = '/api/auth/login';
const AUTH_LOGOUT = '/api/auth/logout';
const AUTH_REFRESH = '/api/auth/refresh';

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const authService = {
  login: async (email, password) => {
    const loginUrl = `${AUTH_LOGIN}`;
    console.log('Attempting login with:', {
      url: loginUrl,
      email: email,
      method: 'POST'
    });
    
    try {
      const response = await api.post(loginUrl, {
        email,
        password,
      });
      
      console.log('Raw login response:', response);
      console.log('Response data:', response.data);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Check for different possible token field names
      const token = response.data.token || response.data.accessToken || response.data.access_token;
      
      if (token) {
        const userData = {
          ...response.data,
          token: token // Normalize token field name
        };
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      } else {
        console.error('Response structure:', {
          data: response.data,
          keys: Object.keys(response.data)
        });
        throw new Error('No token found in server response');
      }
    } catch (error) {
      console.error('Login failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post(AUTH_LOGOUT);
    } catch (e) {
      console.error('Logout network error:', e);
    } finally {
      localStorage.removeItem('user');
    }
  },

  refreshToken: async () => {
    const response = await api.post(AUTH_REFRESH);
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },

  getToken: () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token;
  },

  isAuthenticated: () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return !!user?.token;
  },

  hasRole: (role) => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.role === role;
  },
};

export default authService; 