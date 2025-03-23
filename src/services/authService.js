import axios from 'axios';
import logger from '../utils/logger';
import { handleError } from '../utils/errorHandler';

const AUTH_BASE_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

class AuthService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: AUTH_BASE_URL,
      withCredentials: true, // Important for cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      (response) => {
        logger.debug(`Auth API Response: ${response.status} ${response.config.url}`, {
          status: response.status,
        });
        return response;
      },
      (error) => {
        const errorMessage = handleError(error, 'Auth API');
        logger.error(`Auth API Error: ${error.config?.method?.toUpperCase() || 'UNKNOWN'} ${error.config?.url || 'UNKNOWN'}`, {
          status: error.response?.status,
          message: errorMessage,
        });
        return Promise.reject(error);
      }
    );
  }

  async login(credentials) {
    try {
      logger.info('Attempting login', { email: credentials.email });
      const response = await this.axiosInstance.post('/login', credentials);
      logger.info('Login successful', { email: credentials.email });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'login');
      logger.error('Login failed', { email: credentials.email, message: errorMessage });
      throw error;
    }
  }

  async checkSession() {
    try {
      const response = await this.axiosInstance.get('/session');
      if (response.data.authenticated) {
        logger.debug('Session check: User is authenticated');
      } else {
        logger.debug('Session check: User is not authenticated');
      }
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'checkSession');
      logger.error('Session check failed', { message: errorMessage });
      throw error;
    }
  }

  async refreshToken() {
    try {
      logger.debug('Attempting to refresh token');
      const response = await this.axiosInstance.post('/refresh-token');
      logger.info('Token refreshed successfully');
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'refreshToken');
      logger.error('Token refresh failed', { message: errorMessage });
      throw error;
    }
  }

  async logout() {
    try {
      logger.debug('Attempting to logout');
      await this.axiosInstance.post('/logout');
      logger.info('Logout successful');
      // Clear any local storage items if needed
      localStorage.clear();
    } catch (error) {
      const errorMessage = handleError(error, 'logout');
      logger.error('Logout error', { message: errorMessage });
      // Still clear local storage even if the request fails
      localStorage.clear();
    }
  }

  async isAuthenticated() {
    // We'll now rely on the session endpoint to check authentication
    return this.checkSession()
      .then(response => {
        const isAuth = response.authenticated;
        logger.debug('Authentication check', { authenticated: isAuth });
        return isAuth;
      })
      .catch(() => {
        logger.warn('Authentication check failed, defaulting to not authenticated');
        return false;
      });
  }
}

export const authService = new AuthService();