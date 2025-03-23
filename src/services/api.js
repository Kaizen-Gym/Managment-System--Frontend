import axios from 'axios';
import { authService } from './authService';
import { getCsrfToken, resetCsrfToken } from '../utils/csrf';

// Create base axios instance with common configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Important!
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for CSRF token
api.interceptors.request.use(async (config) => {
  // Don't add CSRF token for these methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(config.method?.toUpperCase())) {
    return config;
  }

  try {
    // Get CSRF token
    const token = await getCsrfToken();
    if (token) {
      config.headers['X-CSRF-Token'] = token;
    }
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
  }

  return config;
});

// Add response interceptor for handling authentication
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response?.status === 403 &&
      error.response?.data?.csrf === false
    ) {
      const originalRequest = error.config;
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          resetCsrfToken();
          const token = await getCsrfToken();
          originalRequest.headers['X-CSRF-Token'] = token;
          return api(originalRequest);
        } catch (retryError) {
          console.error('Error refreshing CSRF token:', retryError);
          // Consider redirecting to login or showing error message
        }
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

export const userService = {
  // User managment
  addUser: async (userData) => {
    const response = await api.post(`/api/user/signup`, userData);
    return response.data;
  },

  // Fetch all users
  getUsers: async () => {
    const response = await api.get('/api/users');
    return response.data;
  },

  // Create new user
  createUser: async (userData) => {
    const response = await api.post('/api/users', userData);
    return response.data;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await api.put(`/api/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await api.delete(`/api/users/${userId}`);
    return response.data;
  },

  // First member signp
  Signup: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
};

export const rolesService = {
  // Fetch all roles
  getRoles: async () => {
    const response = await api.get('/api/roles');
    return response.data;
  },

  // Create new role
  createRole: async (roleData) => {
    const response = await api.post('/api/roles', roleData);
    return response.data;
  },

  // Update role
  updateRole: async (roleName, roleData) => {
    const response = await api.put(`/api/roles/${roleName}`, roleData);
    return response.data;
  },

  // Delete role
  deleteRole: async (roleName) => {
    const response = await api.delete(`/api/roles/${roleName}`);
    return response.data;
  },
};

export const utilService = {
  getGyms: async () => {
    const response = await api.get('/api/utils/gyms');
    return response.data;
  },

  getGymSettings: async () => {
    const response = await api.get('/api/utils/gym');
    return response.data;
  },

  getBackupSchedule: async () => {
    const response = await api.get('/api/settings/next-backup');
    return response.data;
  },

  getSystemInfo: async () => {
    const response = await api.get('/api/settings/system-info');
    return response.data;
  },

  getSettings: async () => {
    const response = await api.get('/api/settings');
    return response.data;
  },
};

export const settingService = {
  // Fetch all settings
  getSettings: async () => {
    const response = await api.get('/api/settings');
    return response.data;
  },

  validateSettings: async (settingsData) => {
    const response = await api.put('/api/settings/gym/validate', settingsData);
    return response.data;
  },

  saveSettings: async (settingsData) => {
    const response = await api.put('/api/settings/gym', settingsData);
    return response.data;
  },

  getBackups: async () => {
    const response = await api.get('/api/settings/backups');
    return response.data;
  },

  restoreBackup: async (filename) => {
    const response = await api.post(`/api/settings/restore/${filename}`);
    return response.data;
  },

  clearLogs: async () => {
    const response = await api.delete('/api/settings/logs');
    return response.data;
  },

  createBackup: async () => {
    const response = await api.post(
      '/api/settings/backup',
      {},
      {
        responseType: 'blob',
      }
    );
    return response;
  },
};

export const paymentService = {
  getPaymentRecords: async () => {
    const response = await api.get('/api/memberships/renew');
    return response.data;
  },
};

export const membershipPlanService = {
  getPlans: async () => {
    const response = await api.get('/api/memberships/plans');
    return response.data;
  },

  createPlan: async (planData) => {
    const response = await api.post('/api/memberships/plans', planData);
    return response.data;
  },

  updatePlan: async (planId, planData) => {
    const response = await api.put(
      `/api/memberships/plans/${planId}`,
      planData
    );
    return response.data;
  },

  deletePlan: async (planId) => {
    const response = await api.delete(`/api/memberships/plans/${planId}`);
    return response.data;
  },
};

// Export the axios instance for use in other services
export default api;
