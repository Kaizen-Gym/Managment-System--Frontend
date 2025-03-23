import api from './api';
import logger from '../utils/logger';
import { handleError } from '../utils/errorHandler';

export const reportService = {
  getMembershipAnalytics: async (params) => {
    try {
      logger.debug('Fetching membership analytics for reports', { params });
      const response = await api.get('/api/reports/analytics/membership', {
        params: {
          date: params.endDate,
          interval: params.interval,
          showAllData: params.interval === 'all',
        }
      });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'getMembershipAnalytics');
      logger.error('Failed to fetch membership analytics for reports', { params, message: errorMessage });
      throw error;
    }
  },

  getAttendanceAnalytics: async (params) => {
    try {
      logger.debug('Fetching attendance analytics for reports', { params });
      const response = await api.get('/api/reports/analytics/attendance', {
        params: {
          date: params.endDate,
          interval: params.interval,
          showAllData: params.interval === 'all',
        }
      });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'getAttendanceAnalytics');
      logger.error('Failed to fetch attendance analytics for reports', { params, message: errorMessage });
      throw error;
    }
  },

  getFinancialAnalytics: async (params) => {
    try {
      logger.debug('Fetching financial analytics for reports', { params });
      const response = await api.get('/api/reports/analytics/financial', {
        params: {
          date: params.endDate,
          interval: params.interval,
          showAllData: params.interval === 'all',
        }
      });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'getFinancialAnalytics');
      logger.error('Failed to fetch financial analytics for reports', { params, message: errorMessage });
      throw error;
    }
  },
  
  // Add custom report generators
  generateMembershipReport: async (params) => {
    try {
      logger.debug('Generating membership report', { params });
      const response = await api.get('/api/reports/generate/membership', {
        params,
        responseType: 'blob', // For file downloads
      });
      logger.info('Membership report generated successfully');
      return response;
    } catch (error) {
      const errorMessage = handleError(error, 'generateMembershipReport');
      logger.error('Failed to generate membership report', { params, message: errorMessage });
      throw error;
    }
  },
  
  generateFinancialReport: async (params) => {
    try {
      logger.debug('Generating financial report', { params });
      const response = await api.get('/api/reports/generate/financial', {
        params,
        responseType: 'blob', // For file downloads
      });
      logger.info('Financial report generated successfully');
      return response;
    } catch (error) {
      const errorMessage = handleError(error, 'generateFinancialReport');
      logger.error('Failed to generate financial report', { params, message: errorMessage });
      throw error;
    }
  },
  
  generateAttendanceReport: async (params) => {
    try {
      logger.debug('Generating attendance report', { params });
      const response = await api.get('/api/reports/generate/attendance', {
        params,
        responseType: 'blob', // For file downloads
      });
      logger.info('Attendance report generated successfully');
      return response;
    } catch (error) {
      const errorMessage = handleError(error, 'generateAttendanceReport');
      logger.error('Failed to generate attendance report', { params, message: errorMessage });
      throw error;
    }
  }
};