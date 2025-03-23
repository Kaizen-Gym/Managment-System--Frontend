import api from './api';
import logger from '../utils/logger';
import { handleError } from '../utils/errorHandler';

export const dashboardService = {
  // Analytics
  getMembershipAnalytics: async (params) => {
    try {
      logger.debug('Fetching membership analytics', { params });
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
      const errorMessage = handleError(error, 'getMembershipAnalytics');
      logger.error('Membership analytics error', { params, message: errorMessage });
      throw error;
    }
  },

  getAttendanceAnalytics: async (params) => {
    try {
      logger.debug('Fetching attendance analytics', { params });
      const response = await api.get('/api/reports/analytics/attendance', {
        params,
      });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'getAttendanceAnalytics');
      logger.error('Attendance analytics error', { params, message: errorMessage });
      throw error;
    }
  },

  getFinancialAnalytics: async (params) => {
    try {
      logger.debug('Fetching financial analytics', { params });
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
      const errorMessage = handleError(error, 'getFinancialAnalytics');
      logger.error('Financial analytics error', { params, message: errorMessage });
      throw error;
    }
  },

  // Members
  getMembers: async (page = 1, limit = 10) => {
    try {
      logger.debug('Fetching members list', { page, limit });
      const response = await api.get(
        `/api/member/members?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'getMembers');
      logger.error('Failed to fetch members', { page, limit, message: errorMessage });
      throw error;
    }
  },

  addMember: async (memberData) => {
    try {
      // Remove sensitive data from logs
      const logData = { ...memberData };
      delete logData.password;
      
      logger.debug('Adding new member', { name: memberData.name });
      const response = await api.post('/api/member/signup', memberData);
      logger.info('Member added successfully', { name: memberData.name });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'addMember');
      logger.error('Failed to add member', { name: memberData.name, message: errorMessage });
      throw error;
    }
  },

  // Renewals
  renewMembership: async (renewalData) => {
    try {
      logger.debug('Renewing membership', { 
        number: renewalData.number, 
        type: renewalData.membership_type 
      });
      const response = await api.post('/api/memberships/renew', renewalData);
      logger.info('Membership renewed successfully', { 
        number: renewalData.number, 
        type: renewalData.membership_type 
      });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'renewMembership');
      logger.error('Failed to renew membership', { 
        number: renewalData.number, 
        message: errorMessage 
      });
      throw error;
    }
  },

  // Due Payments
  payDue: async (paymentData) => {
    try {
      logger.debug('Processing due payment', { 
        number: paymentData.number, 
        amount: paymentData.amount_paid 
      });
      const response = await api.post('/api/memberships/pay-due', paymentData);
      logger.info('Due payment processed successfully', { 
        number: paymentData.number, 
        amount: paymentData.amount_paid 
      });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'payDue');
      logger.error('Failed to process due payment', { 
        number: paymentData.number, 
        amount: paymentData.amount_paid, 
        message: errorMessage 
      });
      throw error;
    }
  },

  // Membership Plans
  getMembershipPlans: async () => {
    try {
      logger.debug('Fetching membership plans');
      const response = await api.get('/api/memberships/plans');
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'getMembershipPlans');
      logger.error('Failed to fetch membership plans', { message: errorMessage });
      throw error;
    }
  },

  // Reports
  getUpcomingRenewals: async () => {
    try {
      logger.debug('Fetching upcoming renewals');
      const response = await api.get('/api/reports/upcoming-renewals');
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'getUpcomingRenewals');
      logger.error('Failed to fetch upcoming renewals', { message: errorMessage });
      throw error;
    }
  },

  getDueDetails: async () => {
    try {
      logger.debug('Fetching due details');
      const response = await api.get('/api/reports/due-details');
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'getDueDetails');
      logger.error('Failed to fetch due details', { message: errorMessage });
      throw error;
    }
  },

  updateMember: async (id, memberData) => {
    try {
      // Remove sensitive data from logs
      const logData = { ...memberData };
      delete logData.password;
      
      logger.debug('Updating member', { id });
      const response = await api.put(`/api/member/members/${id}`, memberData);
      logger.info('Member updated successfully', { id });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'updateMember');
      logger.error('Failed to update member', { id, message: errorMessage });
      throw error;
    }
  },

  deleteMember: async (id) => {
    try {
      logger.debug('Deleting member', { id });
      const response = await api.delete(`/api/member/members/${id}`);
      logger.info('Member deleted successfully', { id });
      return response.data;
    } catch (error) {
      const errorMessage = handleError(error, 'deleteMember');
      logger.error('Failed to delete member', { id, message: errorMessage });
      throw error;
    }
  },
};