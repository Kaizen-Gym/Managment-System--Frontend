import { createContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { getCsrfToken } from '../utils/csrf';

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
      }
    } catch (error) {
      console.log('Session check failed or user not logged in', error);
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
      return userData;
    } catch (error) {
      console.error('Login error:', error);
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
      setUser(null);
      localStorage.clear();
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
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