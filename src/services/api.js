import axios from 'axios';
import { authService } from './authService';

// Create base axios instance with common configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Important!
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for handling authentication
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await authService.refreshToken();
        return api(originalRequest);
      } catch (refreshError) {
        await authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Member service with all API endpoints
export const memberService = {
  getMembers: async (page = 1, limit = 10, status = 'all') => {
    const response = await api.get(
      `/api/member/members?page=${page}&limit=${limit}&status=${status}`
    );
    return response.data;
  },

  getMemberById: async (number) => {
    const response = await api.get(`/api/member/members/${number}`);
    return response.data;
  },

  deleteMember: async (number) => {
    return api.delete(`/api/member/members/${number}`);
  },

  updateMember: async (number, memberData) => {
    return api.put(`/api/member/members/${number}`, memberData);
  },

  transferMembershipDays: async (sourceNumber, targetNumber) => {
    return api.post(`/api/member/transfer`, {
      source_number: sourceNumber,
      target_number: targetNumber,
    });
  },

  addComplimentaryDays: async (number, days) => {
    return api.post(`/api/member/complimentary-days`, {
      number,
      days: parseInt(days, 10),
    });
  },

  recordAttendance: async (memberNumber) => {
    return api.post(`/api/attendance/checkin`, {
      number: memberNumber,
    });
  },

  checkOutMember: async (memberNumber) => {
    return api.post(`/api/attendance/checkout`, {
      number: memberNumber,
    });
  },

  getMemberPayments: async (number) => {
    const response = await api.get(`/api/memberships/renew/${number}`);
    return response.data;
  },

  getMemberAttendance: async (number) => {
    const response = await api.get(`/api/attendance/${number}`);
    return response.data;
  },

  getMembershipPlans: async () => {
    const response = await api.get(`/api/memberships/plans`);
    return response.data;
  },

  getMembershipForm: async (number) => {
    const response = await api.get(`/api/member/membership-form/${number}`);
    return response.data;
  },

  searchMembers: async (query) => {
    try {
      const response = await api.post(`/api/member/search`, { query });
      return response.data;
    } catch (error) {
      console.error('Search API error:', error);
      throw error;
    }
  },

  // Add new member
  addMember: async (memberData) => {
    const response = await api.post(`/api/member/signup`, memberData);
    return response.data;
  },

  // Renew membership
  renewMembership: async (renewalData) => {
    const response = await api.post(`/api/memberships/renew`, renewalData);
    return response.data;
  },

  // Pay due amount
  payDue: async (paymentData) => {
    const response = await api.post(`/api/memberships/pay-due`, paymentData);
    return response.data;
  },
};

// Export the axios instance for use in other services
export default api;
