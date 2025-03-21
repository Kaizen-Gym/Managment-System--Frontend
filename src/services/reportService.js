{/* eslint-disable */}
import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});


export const reportService = {
  getMembershipAnalytics: async (params) => {
    try {
      const response = await API.get('/api/reports/analytics/membership', {
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
      const response = await API.get('/api/reports/analytics/attendance', {
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
      const response = await API.get('/api/reports/analytics/financial', {
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