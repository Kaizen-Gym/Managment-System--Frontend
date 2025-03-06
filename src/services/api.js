import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Changed from token to Authorization
  }
  return config;
});

// Add token to requests if available
export const memberService = {
  // Get all members
  getAllMembers: async () => {
    const response = await api.get("/member/members");
    console.log(`Members: ${response.data}`);
    return response.data.members || response.data;
  },

  // Get member by number
  getMemberById: async (memberNumber) => {
    const response = await api.get(`/member/members/${memberNumber}`);
    console.log(`Member: ${response.data}`);
    return response.data;
  },

  // Get member payments
  getMemberPayments: async (memberNumber) => {
    try {
      const response = await api.get(`/memberships/renew/${memberNumber}`);
      console.log(`Payments: ${response.data}`);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching member payments:", error);
      return []; // Return empty array if no payments found
    }
  },

  // Get member attendance
  getMemberAttendance: async (memberNumber) => {
    try {
      const response = await api.get(`/attendance/${memberNumber}`);
      console.log(`Attendance: ${response.data}`);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching member attendance:", error);
      return []; // Return empty array if no attendance records found
    }
  },

  renewMembership: async (memberNumber) => {
    const response = await api.post(`/memberships/renew`, {
      number: memberNumber,
    });
    return response.data;
  },

  recordAttendance: async (memberNumber) => {
    const response = await api.post(`/attendance/checkin`, {
      number: memberNumber,
    });
    return response.data;
  },

  checkOutMember: async (memberNumber) => {
    const response = await api.post(`/attendance/checkout`, {
      number: memberNumber,
    });
    return response.data;
  },
};

export const userService = {
  // Fetch all users
  getAllUsers: async () => {
    const response = await api.get("/users");
    console.log(response.data)
    return response.data.users || response.data;
  },

  // Fetch user by ID
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    console.log(response.data)
    return response.data;
  },

  // Create a new user
  createUser: async (userData) => {
    const response = await api.post("/users", userData);
    console.log(response.data)
    return response.data;
  },

  // Update user by ID
  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    console.log(response.data)
    return response.data;
  },

  // Delete user by ID
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    console.log(response.data)
    return response.data;
  },

  // Fetch all roles
  getAllRoles: async () => {
    const response = await api.get("/roles");
    console.log(response.data)
    return response.data.roles || response.data;
  },

  // Create a new role
  createRole: async (roleData) => {
    const response = await api.post("/roles", roleData);
    console.log(response.data)
    return response.data;
  },

  // Update role by ID
  updateRole: async (roleId, roleData) => {
    const response = await api.put(`/roles/${roleId}`, roleData);
    console.log(response.data)
    return response.data;
  },

  // Delete role by ID
  deleteRole: async (roleId) => {
    const response = await api.delete(`/roles/${roleId}`);
    console.log(response.data)
    return response.data;
  },

  // Fetch permissions for a role
  getRolePermissions: async (roleId) => {
    const response = await api.get(`/roles/${roleId}/permissions`);
    return response.data.permissions || response.data;
  },

  // Update permissions for a role
  updateRolePermissions: async (roleId, permissions) => {
    const response = await api.put(`/roles/${roleId}/permissions`, { permissions });
    return response.data;
  },
};

export default api;
