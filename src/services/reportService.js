{/* eslint-disable */}
import api from './api';

export const reportService = {
  getMembershipAnalytics: async (params) => {
    try {
      const response = await api.get('/api/reports/analytics/membership', {
        params: {
          date: params.endDate,
          interval: params.interval,
          showAllData: params.interval === 'all',
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAttendanceAnalytics: async (params) => {
    try {
      const response = await api.get('/api/reports/analytics/attendance', {
        params: {
          date: params.endDate,
          interval: params.interval,
          showAllData: params.interval === 'all',
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getFinancialAnalytics: async (params) => {
    try {
      const response = await api.get('/api/reports/analytics/financial', {
        params: {
          date: params.endDate,
          interval: params.interval,
          showAllData: params.interval === 'all',
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
