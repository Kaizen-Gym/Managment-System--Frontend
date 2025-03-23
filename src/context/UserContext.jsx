import { createContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { getCsrfToken } from '../utils/csrf';
import { logger, initLogger, clearLoggerUser } from '../utils/logger'; // Import logger
import { handleError } from '../utils/errorHandler'; // Import error handler

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

  const checkSession = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/session`, { 
        withCredentials: true 
      });
      
      if (response.data.authenticated) {
        setUser(response.data.user);
        // Initialize logger with user info
        initLogger(response.data.user);
        logger.info('User session restored');
      }
    } catch (error) {
      logger.debug('Session check failed or user not logged in');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (credentials) => {
    try {
      // Get CSRF token before making login request
      const csrfToken = await getCsrfToken();
      
      const response = await axios.post(
        `${API_URL}/api/auth/login`, 
        credentials,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          }
        }
      );

      const userData = response.data;
      setUser(userData);
      
      // Initialize logger with user info
      initLogger(userData);
      logger.info('User logged in successfully');
      
      return userData;
    } catch (error) {
      const errorMessage = handleError(error, 'login');
      logger.error('Login failed', { message: errorMessage });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const csrfToken = await getCsrfToken();
      
      await axios.post(
        `${API_URL}/api/auth/logout`, 
        {},
        {
          withCredentials: true,
          headers: {
            'X-CSRF-Token': csrfToken
          }
        }
      );
      logger.info('User logged out');
      clearLoggerUser(); // Clear user from logger
      setUser(null);
      localStorage.clear();
    } catch (error) {
      const errorMessage = handleError(error, 'logout');
      logger.error('Logout error', { message: errorMessage });
      setUser(null);
      clearLoggerUser(); // Still clear user from logger
      localStorage.clear();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};