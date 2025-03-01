import axios from 'axios';

const BASE_URL = 'http://localhost:5050/api';

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
    config.headers.Authorization = `Bearer ${token}`;  // Changed from token to Authorization
  }
  return config;
});

// Add token to requests if available
export const memberService = {
  // Get all members
  getAllMembers: async () => {
    const response = await api.get('/member/members');
    console.log(`Members: ${response.data}`)
    return response.data.members || response.data;
  },

  // Get member by number
  getMemberById: async (memberNumber) => {
    const response = await api.get(`/member/members/${memberNumber}`);
    console.log(`Member: ${response.data}`)
    return response.data;
  },

  // Get member payments
  getMemberPayments: async (memberNumber) => {
    try {
      const response = await api.get(`/memberships/renew/${memberNumber}`);
      console.log(`Payments: ${response.data}`)
      return response.data || [];
    } catch (error) {
      console.error('Error fetching member payments:', error);
      return []; // Return empty array if no payments found
    }
  },

  // Get member attendance
  getMemberAttendance: async (memberNumber) => {
    try {
      const response = await api.get(`/attendance/${memberNumber}`);
      console.log(`Attendance: ${response.data}`)
      return response.data || [];
    } catch (error) {
      console.error('Error fetching member attendance:', error);
      return []; // Return empty array if no attendance records found
    }
  }
};

export default api;