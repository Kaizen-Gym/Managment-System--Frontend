import api from './api';

// Helper function to handle errors
const handleError = (error) => {
  console.error('Error:', error);
  alert(error.response?.message || 'An error occurred');
};

export const dashboardService = {
  // Analytics
  getMembershipAnalytics: async (params) => {
    try {
      const response = await api.get('/api/reports/analytics/membership', {
        params: {
          ...params,
          showAllData: true, // Add this to ensure we get all data
        },
      });
      if (!response.data) {
        throw new Error('No data received from membership analytics');
      }
      return response.data;
    } catch (error) {
      console.error('Membership analytics error:', error);
      throw error;
    }
  },

  getAttendanceAnalytics: async (params) => {
    const response = await api.get('/api/reports/analytics/attendance', {
      params,
    });
    if (!response) {
      handleError(response);
    }
    return response.data;
  },

  getFinancialAnalytics: async (params) => {
    try {
      const response = await api.get('/api/reports/analytics/financial', {
        params: {
          ...params,
          showAllData: true,
        },
      });
      if (!response.data) {
        throw new Error('No data received from financial analytics');
      }
      return response.data;
    } catch (error) {
      console.error('Financial analytics error:', error);
      throw error;
    }
  },

  // Members
  getMembers: async (page = 1, limit = 10) => {
    const response = await api.get(
      `/api/member/members?page=${page}&limit=${limit}`
    );
    if (!response) {
      handleError(response);
    }
    return response.data;
  },

  addMember: async (memberData) => {
    const response = await api.post('/api/member/signup', memberData);
    if (!response) {
      handleError(response);
    }
    return response.data;
  },

  // Renewals
  renewMembership: async (renewalData) => {
    const response = await api.post('/api/memberships/renew', renewalData);
    if (!response) {
      handleError(response);
    }
    return response.data;
  },

  // Due Payments
  payDue: async (paymentData) => {
    const response = await api.post('/api/memberships/pay-due', paymentData);
    if (!response) {
      handleError(response);
    }
    return response.data;
  },

  // Membership Plans
  getMembershipPlans: async () => {
    const response = await api.get('/api/memberships/plans');
    if (!response) {
      handleError(response);
    }
    return response.data;
  },

  // Reports
  getUpcomingRenewals: async () => {
    const response = await api.get('/api/reports/upcoming-renewals');
    if (!response) {
      handleError(response);
    }
    return response.data;
  },

  getDueDetails: async () => {
    const response = await api.get('/api/reports/due-details');
    if (!response) {
      handleError(response);
    }
    return response.data;
  },

  updateMember: async (id, memberData) => {
    const response = await api.put(`/api/member/members/${id}`, memberData);
    if (!response) {
      handleError(response);
    }
    return response.data;
  },

  deleteMember: async (id) => {
    const response = await api.delete(`/api/member/members/${id}`);
    if (!response) {
      handleError(response);
    }
    return response.data;
  },
};
