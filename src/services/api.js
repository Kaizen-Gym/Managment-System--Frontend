import axios from 'axios';
import { authService } from './authService';
import { getCsrfToken, resetCsrfToken } from '../utils/csrf';
import logger from '../utils/logger';
import { handleError } from '../utils/errorHandler';

// Create base axios instance with common configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Important!
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for CSRF token and logging
api.interceptors.request.use(async (config) => {
  // Log outgoing requests (excluding sensitive data)
  const logConfig = { ...config };
  if (logConfig.headers) {
    // Don't log auth headers
    delete logConfig.headers.Authorization;
    delete logConfig.headers['X-CSRF-Token'];
  }
  // Don't log request body for security
  delete logConfig.data;

  logger.debug(
    `API Request: ${config.method?.toUpperCase() || 'UNKNOWN'} ${config.url}`,
    {
      config: logConfig,
    }
  );

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
    logger.error('Error fetching CSRF token', { message: error.message });
  }

  return config;
});

// Add response interceptor for handling authentication and logging
api.interceptors.response.use(
  (response) => {
    // Log successful responses (excluding potentially sensitive data)
    logger.debug(`API Response: ${response.status} ${response.config.url}`, {
      status: response.status,
      statusText: response.statusText,
    });
    return response;
  },
  async (error) => {
    // Log failed responses
    const errorMessage = handleError(error, 'API call');
    logger.error(
      `API Error: ${error.config?.method?.toUpperCase() || 'UNKNOWN'} ${error.config?.url || 'UNKNOWN'}`,
      {
        status: error.response?.status,
        message: errorMessage,
      }
    );

    if (
      error.response?.status === 403 &&
      error.response?.data?.csrf === false
    ) {
      const originalRequest = error.config;
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          logger.info('Refreshing CSRF token after 403 error');
          resetCsrfToken();
          const token = await getCsrfToken();
          originalRequest.headers['X-CSRF-Token'] = token;
          return api(originalRequest);
        } catch (retryError) {
          logger.error('Error refreshing CSRF token', {
            message: retryError.message,
          });
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
    try {
      const response = await api.get(
        `/api/member/members?page=${page}&limit=${limit}&status=${status}`
      );
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'getMembers');
      logger.error('Failed to fetch members', {
        page,
        limit,
        status,
        message: errorMessage,
      });
      throw error;
    }
  },

  getMemberById: async (number) => {
    try {
      const response = await api.get(`/api/member/members/${number}`);
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'getMemberById');
      logger.error('Failed to get member by ID', {
        number,
        message: errorMessage,
      });
      throw error;
    }
  },

  deleteMember: async (number) => {
    try {
      const response = await api.delete(`/api/member/members/${number}`);
      logger.info('Member deleted successfully', { number });
      return response;
    } catch (error) {
      const errorMessage = handleError(error, 'deleteMember');
      logger.error('Failed to delete member', {
        number,
        message: errorMessage,
      });
      throw error;
    }
  },

  updateMember: async (number, memberData) => {
    try {
      const response = await api.put(
        `/api/member/members/${number}`,
        memberData
      );
      logger.info('Member updated successfully', { number });
      return response;
    } catch (error) {
      const errorMessage = handleError(error, 'updateMember');
      logger.error('Failed to update member', {
        number,
        message: errorMessage,
      });
      throw error;
    }
  },

  transferDays: async (data) => {
    try {
      const response = await api.post(`/api/member/transfer`, data);
      logger.info('Membership days transferred successfully', {
        from: data.source_number,
        to: data.target_number,
      });
      return response;
    } catch (error) {
      const errorMessage = handleError(error, 'transferDays');
      logger.error('Failed to transfer membership days', {
        from: data.source_number,
        to: data.target_number,
        message: errorMessage,
      });
      throw error;
    }
  },

  addComplimentaryDays: async (data) => {
    try {
      const response = await api.post(`/api/member/complimentary-days`, data);
      logger.info('Complimentary days added', {
        number: data.number,
        days: data.days,
      });
      return response;
    } catch (error) {
      const errorMessage = handleError(error, 'addComplimentaryDays');
      logger.error('Failed to add complimentary days', {
        number: data.number,
        days: data.days,
        message: errorMessage,
      });
      throw error;
    }
  },

  recordAttendance: async (memberNumber) => {
    try {
      const response = await api.post(`/api/attendance/checkin`, {
        number: memberNumber,
      });
      logger.info('Attendance recorded', { memberNumber });
      return response;
    } catch (error) {
      const errorMessage = handleError(error, 'recordAttendance');
      logger.error('Failed to record attendance', {
        memberNumber,
        message: errorMessage,
      });
      throw error;
    }
  },

  checkOutMember: async (memberNumber) => {
    try {
      const response = await api.post(`/api/attendance/checkout`, {
        number: memberNumber,
      });
      logger.info('Member checked out', { memberNumber });
      return response;
    } catch (error) {
      const errorMessage = handleError(error, 'checkOutMember');
      logger.error('Failed to check out member', {
        memberNumber,
        message: errorMessage,
      });
      throw error;
    }
  },

  getMemberPayments: async (number) => {
    try {
      const response = await api.get(`/api/memberships/renew/${number}`);
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'getMemberPayments');
      logger.error('Failed to get member payments', {
        number,
        message: errorMessage,
      });
      throw error;
    }
  },

  getMemberAttendance: async (number) => {
    try {
      const response = await api.get(`/api/attendance/${number}`);
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'getMemberAttendance');
      logger.error('Failed to get member attendance', {
        number,
        message: errorMessage,
      });
      throw error;
    }
  },

  getMembershipPlans: async () => {
    try {
      const response = await api.get(`/api/memberships/plans`);
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'getMembershipPlans');
      logger.error('Failed to get membership plans', { message: errorMessage });
      throw error;
    }
  },

  getMembershipForm: async (number) => {
    try {
      const response = await api.get(`/api/member/membership-form/${number}`);
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'getMembershipForm');
      logger.error('Failed to get membership form', {
        number,
        message: errorMessage,
      });
      throw error;
    }
  },

  searchMembers: async (query) => {
    try {
      const response = await api.post(`/api/member/search`, { query });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'searchMembers');
      logger.error('Failed to search members', {
        query,
        message: errorMessage,
      });
      throw error;
    }
  },

  // Add new member
  addMember: async (memberData) => {
    try {
      const response = await api.post(`/api/member/signup`, memberData);
      logger.info('New member added successfully', { name: memberData.name });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'addMember');
      logger.error('Failed to add member', { message: errorMessage });
      throw error;
    }
  },

  // Renew membership
  renewMembership: async (renewalData) => {
    try {
      const response = await api.post(`/api/memberships/renew`, renewalData);
      logger.info('Membership renewed successfully', {
        number: renewalData.number,
        type: renewalData.membership_type,
      });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'renewMembership');
      logger.error('Failed to renew membership', {
        number: renewalData.number,
        message: errorMessage,
      });
      throw error;
    }
  },

  // Pay due amount
  payDue: async (paymentData) => {
    try {
      const response = await api.post(`/api/memberships/pay-due`, paymentData);
      logger.info('Due payment processed', {
        number: paymentData.number,
        amount: paymentData.amount_paid,
      });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'payDue');
      logger.error('Failed to process due payment', {
        number: paymentData.number,
        amount: paymentData.amount_paid,
        message: errorMessage,
      });
      throw error;
    }
  },
};

export const userService = {
  // User managment
  addUser: async (userData) => {
    try {
      const response = await api.post(`/api/user/signup`, userData);
      logger.info('User added successfully', { email: userData.email });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'addUser');
      logger.error('Failed to add user', {
        email: userData.email,
        message: errorMessage,
      });
      throw error;
    }
  },

  // Fetch all users
  getUsers: async () => {
    try {
      const response = await api.get('/api/users');
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'getUsers');
      logger.error('Failed to fetch users', { message: errorMessage });
      throw error;
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await api.post('/api/users', userData);
      logger.info('User created successfully', { email: userData.email });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'createUser');
      logger.error('Failed to create user', {
        email: userData.email,
        message: errorMessage,
      });
      throw error;
    }
  },

  // Update user
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/api/users/${userId}`, userData);
      logger.info('User updated successfully', { userId });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'updateUser');
      logger.error('Failed to update user', { userId, message: errorMessage });
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/api/users/${userId}`);
      logger.info('User deleted successfully', { userId });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'deleteUser');
      logger.error('Failed to delete user', { userId, message: errorMessage });
      throw error;
    }
  },

  // First member signup
  Signup: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      logger.info('New user registered successfully', {
        email: userData.email,
      });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'Signup');
      logger.error('User registration failed', {
        email: userData.email,
        message: errorMessage,
      });
      throw error;
    }
  },
};

export const rolesService = {
  // Fetch all roles
  getRoles: async () => {
    try {
      const response = await api.get('/api/roles');
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'getRoles');
      logger.error('Failed to fetch roles', { message: errorMessage });
      throw error;
    }
  },

  // Create new role
  createRole: async (roleData) => {
    try {
      const response = await api.post('/api/roles', roleData);
      logger.info('Role created successfully', { name: roleData.name });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'createRole');
      logger.error('Failed to create role', {
        name: roleData.name,
        message: errorMessage,
      });
      throw error;
    }
  },

  // Update role
  updateRole: async (roleName, roleData) => {
    try {
      const response = await api.put(`/api/roles/${roleName}`, roleData);
      logger.info('Role updated successfully', { name: roleName });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'updateRole');
      logger.error('Failed to update role', {
        name: roleName,
        message: errorMessage,
      });
      throw error;
    }
  },

  // Delete role
  deleteRole: async (roleName) => {
    try {
      const response = await api.delete(`/api/roles/${roleName}`);
      logger.info('Role deleted successfully', { name: roleName });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'deleteRole');
      logger.error('Failed to delete role', {
        name: roleName,
        message: errorMessage,
      });
      throw error;
    }
  },
};

export const utilService = {
  getGyms: async () => {
    try {
      const response = await api.get('/api/utils/gyms');
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'getGyms');
      logger.error('Failed to fetch gyms', { message: errorMessage });
      throw error;
    }
  },

  getGymSettings: async () => {
    try {
      const response = await api.get('/api/utils/gym');
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'getGymSettings');
      logger.error('Failed to fetch gym settings', { message: errorMessage });
      throw error;
    }
  },

  getBackupSchedule: async () => {
    try {
      const response = await api.get('/api/settings/next-backup');
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'getBackupSchedule');
      logger.error('Failed to fetch backup schedule', {
        message: errorMessage,
      });
      throw error;
    }
  },

  getSystemInfo: async () => {
    try {
      const response = await api.get('/api/settings/system-info');
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'getSystemInfo');
      logger.error('Failed to fetch system info', { message: errorMessage });
      throw error;
    }
  },

  getSettings: async () => {
    try {
      const response = await api.get('/api/settings');
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'getSettings');
      logger.error('Failed to fetch settings', { message: errorMessage });
      throw error;
    }
  },
};

export const settingService = {
  // Fetch all settings
  getSettings: async () => {
    try {
      const response = await api.get('/api/settings');
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'getSettings');
      logger.error('Failed to fetch settings', { message: errorMessage });
      throw error;
    }
  },

  validateSettings: async (settingsData) => {
    try {
      const response = await api.put(
        '/api/settings/gym/validate',
        settingsData
      );
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'validateSettings');
      logger.error('Settings validation failed', { message: errorMessage });
      throw error;
    }
  },

  saveSettings: async (settingsData) => {
    try {
      const response = await api.put('/api/settings/gym', settingsData);
      logger.info('Settings saved successfully');
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'saveSettings');
      logger.error('Failed to save settings', { message: errorMessage });
      throw error;
    }
  },

  getBackups: async () => {
    try {
      const response = await api.get('/api/settings/backups');
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'getBackups');
      logger.error('Failed to fetch backups', { message: errorMessage });
      throw error;
    }
  },

  restoreBackup: async (filename) => {
    try {
      const response = await api.post(`/api/settings/restore/${filename}`);
      logger.info('Backup restored successfully', { filename });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'restoreBackup');
      logger.error('Failed to restore backup', {
        filename,
        message: errorMessage,
      });
      throw error;
    }
  },

  clearLogs: async () => {
    try {
      const response = await api.delete('/api/settings/logs');
      logger.info('Logs cleared successfully');
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'clearLogs');
      logger.error('Failed to clear logs', { message: errorMessage });
      throw error;
    }
  },

  createBackup: async () => {
    try {
      const response = await api.post(
        '/api/settings/backup',
        {},
        {
          responseType: 'blob',
        }
      );
      logger.info('Backup created successfully');
      return response;
    } catch (error) {
      const errorMessage = handleError(error, 'createBackup');
      logger.error('Failed to create backup', { message: errorMessage });
      throw error;
    }
  },
};

export const paymentService = {
  getPaymentRecords: async () => {
    try {
      const response = await api.get('/api/memberships/renew');
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'getPaymentRecords');
      logger.error('Failed to fetch payment records', {
        message: errorMessage,
      });
      throw error;
    }
  },
};

export const membershipPlanService = {
  getPlans: async () => {
    try {
      const response = await api.get('/api/memberships/plans');
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'getPlans');
      logger.error('Failed to fetch membership plans', {
        message: errorMessage,
      });
      throw error;
    }
  },

  createPlan: async (planData) => {
    try {
      const response = await api.post('/api/memberships/plans', planData);
      logger.info('Membership plan created successfully', {
        name: planData.name,
      });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'createPlan');
      logger.error('Failed to create membership plan', {
        name: planData.name,
        message: errorMessage,
      });
      throw error;
    }
  },

  updatePlan: async (planId, planData) => {
    try {
      const response = await api.put(
        `/api/memberships/plans/${planId}`,
        planData
      );
      logger.info('Membership plan updated successfully', { id: planId });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'updatePlan');
      logger.error('Failed to update membership plan', {
        id: planId,
        message: errorMessage,
      });
      throw error;
    }
  },

  deletePlan: async (planId) => {
    try {
      const response = await api.delete(`/api/memberships/plans/${planId}`);
      logger.info('Membership plan deleted successfully', { id: planId });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'deletePlan');
      logger.error('Failed to delete membership plan', {
        id: planId,
        message: errorMessage,
      });
      throw error;
    }
  },
};

// Export the axios instance for use in other services
export default api;
