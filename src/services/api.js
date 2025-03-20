import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/member`; // Base URL for member related APIs

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add token to requests if available
export const memberService = {
  getMembers: async (page = 1, limit = 10, status = 'all') => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${BASE_URL}/members?page=${page}&limit=${limit}&status=${status}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },
  getMemberById: async (number) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${BASE_URL}/members/${number}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  deleteMember: async (number) => {
    const token = localStorage.getItem('token');
    return axios.delete(`${BASE_URL}/members/${number}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  updateMember: async (number, memberData) => {
    // For Edit Member and Upgrade
    const token = localStorage.getItem('token');
    return axios.put(`${BASE_URL}/members/${number}`, memberData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  transferMembershipDays: async (sourceNumber, targetNumber) => {
    const token = localStorage.getItem('token');
    return axios.post(
      `${BASE_URL}/transfer`,
      { source_number: sourceNumber, target_number: targetNumber },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },
  addComplimentaryDays: async (number, days) => {
    const token = localStorage.getItem('token');
    return axios.post(
      `${BASE_URL}/complimentary-days`,
      { number, days: parseInt(days, 10) },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },
  recordAttendance: async (memberNumber) => {
    // Example - implement if you have backend endpoint
    const token = localStorage.getItem('token');
    return axios.post(
      `${import.meta.env.VITE_API_URL}/api/attendance/checkin/${memberNumber}`,
      {},
      {
        // Adjust URL if needed
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },
  checkOutMember: async (memberNumber) => {
    // Example - implement if you have backend endpoint
    const token = localStorage.getItem('token');
    return axios.post(
      `${import.meta.env.VITE_API_URL}/api/attendance/checkout/${memberNumber}`,
      {},
      {
        // Adjust URL if needed
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },
  getMemberPayments: async (number) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/memberships/renew/${number}`,
      {
        // Assuming renew records are used for payments
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },
  getMemberAttendance: async (number) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/attendance/${number}`, // ✅ REMOVED /member from the URL
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },
  getMembershipPlans: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/memberships/plans`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },
  getMembershipForm: async (number) => {
    // Placeholder service function
    const token = localStorage.getItem('token');
    const response = await axios.get(`${BASE_URL}/membership-form/${number}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export default api;
