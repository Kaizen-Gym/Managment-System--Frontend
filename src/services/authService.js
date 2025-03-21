{/* eslint-disable */}

import axios from 'axios';

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
  }

  async login(credentials) {
    try {
      const response = await this.axiosInstance.post('/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async checkSession() {
    try {
      const response = await this.axiosInstance.get('/session');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async refreshToken() {
    try {
      const response = await this.axiosInstance.post('/refresh-token');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await this.axiosInstance.post('/logout');
      // Clear any local storage items if needed
      localStorage.clear();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if the request fails
      localStorage.clear();
    }
  }

  isAuthenticated() {
    // We'll now rely on the session endpoint to check authentication
    return this.checkSession()
      .then(response => response.authenticated)
      .catch(() => false);
  }
}

export const authService = new AuthService();