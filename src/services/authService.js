import axios from 'axios';

const API_URL ="https://api.blockchain.deliver.ar";
const AUTH_LOGIN = '/api/auth/login';
const AUTH_LOGOUT = '/api/auth/logout';
const AUTH_REFRESH = '/api/auth/refresh';
// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.withCredentials = true; // This is important for CORS with credentials
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

const authService = {
  login: async (email, password) => {
    const loginUrl = `${process.env.REACT_APP_API_URL}${AUTH_LOGIN}`;
    console.log('Attempting login with:', {
      url: loginUrl,
      email: email,
      method: 'POST',
      apiUrl: API_URL
    });
    
    try {
      const response = await axios.post(loginUrl, {
        email,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Login successful:', response.data);
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      console.error('Login failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await axios.post(`${API_URL}${AUTH_LOGOUT}`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
    } catch (e) {
      // Log the error but do not block logout
      console.error('Logout network error:', e);
    } finally {
      localStorage.removeItem('user');
    }
  },

  refreshToken: async () => {
    const response = await axios.post(`${API_URL}${AUTH_REFRESH}`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
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