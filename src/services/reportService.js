import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/reports`;

export const reportService = {
  getMembershipAnalytics: async (params) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${BASE_URL}/analytics/membership`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        date: params.endDate,
        interval: params.interval
      }
    });
    return response.data;
  },

  getAttendanceAnalytics: async (params) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${BASE_URL}/analytics/attendance`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        date: params.endDate,
        interval: params.interval
      }
    });
    return response.data;
  },

  getFinancialAnalytics: async (params) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${BASE_URL}/analytics/financial`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        date: params.endDate,
        interval: params.interval
      }
    });
    return response.data;
  }
};