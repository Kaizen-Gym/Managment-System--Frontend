import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaUsers, FaUser, FaEnvelope, FaLock, FaPhone, FaVenusMars, FaBirthdayCake, FaBuilding, FaUserPlus } from 'react-icons/fa';
import { Dialog } from '@headlessui/react';
import usePermissions from '../hooks/usePermissions';
import DashboardLayout from '../components/DashboardLayout';

const availablePermissions = [
  "view_dashboard",
  "view_members",
  "view_reports",
  "view_membership_plans",
  "view_settings",
  "manage_users",
];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [gyms, setGyms] = useState([]);
  const [newUser, setNewUser] = useState({
    name: '',
    gender: '',
    age: '',
    email: '',
    number: '',
    password: '',
    user_type: '',
    permissions: [],
    gymId: '',
  });
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchGyms();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5050/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5050/api/roles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles(response.data);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Failed to fetch roles');
    }
  };

  const fetchGyms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5050/api/utils/gyms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGyms(response.data);
    } catch (err) {
      console.error('Error fetching gyms:', err);
      // Optionally set error if needed
    }
  };

  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5050/api/users',
        newUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers([...users, response.data.user || response.data]);
      // Reset form state and close modal
      setNewUser({
        name: '',
        gender: '',
        age: '',
        email: '',
        number: '',
        password: '',
        user_type: '',
        permissions: [],
        gymId: '',
      });
      setIsCreateUserOpen(false);
    } catch (err) {
      console.error('Error adding user:', err);
      alert('Error adding user');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
  };

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5050/api/users/${editingUser._id}`,
        editingUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(
        users.map((user) =>
          user._id === editingUser._id ? response.data.user : user
        )
      );
      setEditingUser(null);
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Error updating user');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5050/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((user) => user._id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Error deleting user');
    }
  };

  const handleAddRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5050/api/roles',
        { name: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoles([...roles, response.data.role]);
      setNewRole('');
    } catch (err) {
      console.error('Error adding role:', err);
      alert('Error adding role');
    }
  };

  const handleDeleteRole = async (role) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5050/api/roles/${role}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles(roles.filter((r) => r !== role));
    } catch (err) {
      console.error('Error deleting role:', err);
      alert('Error deleting role');
    }
  };

  // Toggle permission for new user
  const togglePermission = (permission) => {
    if (newUser.permissions.includes(permission)) {
      setNewUser({
        ...newUser,
        permissions: newUser.permissions.filter((perm) => perm !== permission),
      });
    } else {
      setNewUser({
        ...newUser,
        permissions: [...newUser.permissions, permission],
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaUsers className="text-2xl text-blue-600" />
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <>
            {hasPermission('manage_users') && (
              <div className="mb-6">
                <button
                  onClick={() => setIsCreateUserOpen(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
                >
                  <FaUserPlus />
                  <span>Create User</span>
                </button>
              </div>
            )}

            {/* Create User Modal */}
            <Dialog
              open={isCreateUserOpen}
              onClose={() => setIsCreateUserOpen(false)}
              className="relative z-50"
            >
              <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
              <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-lg">
                  <Dialog.Title className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FaUserPlus className="text-green-600" />
                    Create New User
                  </Dialog.Title>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="flex items-center border rounded-lg p-2">
                      <FaUser className="text-gray-500 mr-2" />
                      <input
                        type="text"
                        placeholder="Name"
                        value={newUser.name}
                        onChange={(e) =>
                          setNewUser({ ...newUser, name: e.target.value })
                        }
                        className="flex-1 outline-none"
                      />
                    </div>
                    {/* Gender */}
                    <div className="flex items-center border rounded-lg p-2">
                      <FaVenusMars className="text-gray-500 mr-2" />
                      <select
                        value={newUser.gender}
                        onChange={(e) =>
                          setNewUser({ ...newUser, gender: e.target.value })
                        }
                        className="flex-1 outline-none"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {/* Age */}
                    <div className="flex items-center border rounded-lg p-2">
                      <FaBirthdayCake className="text-gray-500 mr-2" />
                      <input
                        type="number"
                        placeholder="Age"
                        value={newUser.age}
                        onChange={(e) =>
                          setNewUser({ ...newUser, age: e.target.value })
                        }
                        className="flex-1 outline-none"
                        min="14"
                      />
                    </div>
                    {/* Email */}
                    <div className="flex items-center border rounded-lg p-2">
                      <FaEnvelope className="text-gray-500 mr-2" />
                      <input
                        type="email"
                        placeholder="Email"
                        value={newUser.email}
                        onChange={(e) =>
                          setNewUser({ ...newUser, email: e.target.value })
                        }
                        className="flex-1 outline-none"
                      />
                    </div>
                    {/* Phone Number */}
                    <div className="flex items-center border rounded-lg p-2">
                      <FaPhone className="text-gray-500 mr-2" />
                      <input
                        type="text"
                        placeholder="Phone Number"
                        value={newUser.number}
                        onChange={(e) =>
                          setNewUser({ ...newUser, number: e.target.value })
                        }
                        className="flex-1 outline-none"
                      />
                    </div>
                    {/* Password */}
                    <div className="flex items-center border rounded-lg p-2">
                      <FaLock className="text-gray-500 mr-2" />
                      <input
                        type="password"
                        placeholder="Password"
                        value={newUser.password}
                        onChange={(e) =>
                          setNewUser({ ...newUser, password: e.target.value })
                        }
                        className="flex-1 outline-none"
                      />
                    </div>
                    {/* User Type */}
                    <div className="flex items-center border rounded-lg p-2">
                      <FaUser className="text-gray-500 mr-2" />
                      <select
                        value={newUser.user_type}
                        onChange={(e) =>
                          setNewUser({ ...newUser, user_type: e.target.value })
                        }
                        className="flex-1 outline-none"
                      >
                        <option value="">Select Role</option>
                        {roles.map((role, index) => (
                          <option key={index} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Gym Dropdown */}
                    <div className="flex items-center border rounded-lg p-2">
                      <FaBuilding className="text-gray-500 mr-2" />
                      <select
                        value={newUser.gymId}
                        onChange={(e) =>
                          setNewUser({ ...newUser, gymId: e.target.value })
                        }
                        className="flex-1 outline-none"
                      >
                        <option value="">Select Gym</option>
                        {gyms.map((gym) => (
                          <option key={gym._id} value={gym._id}>
                            {gym.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="font-semibold mb-2">Permissions</p>
                    <div className="grid grid-cols-2 gap-2">
                      {availablePermissions.map((permission, index) => (
                        <label key={index} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newUser.permissions.includes(permission)}
                            onChange={() => togglePermission(permission)}
                          />
                          <span>{permission}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-200 rounded-lg"
                      onClick={() => setIsCreateUserOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
                      onClick={handleAddUser}
                    >
                      <FaPlus />
                      <span>Create User</span>
                    </button>
                  </div>
                </Dialog.Panel>
              </div>
            </Dialog>

            {/* Users Table */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Users</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.user_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-2 bg-yellow-500 text-white rounded-lg"
                              title="Edit User"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="p-2 bg-red-500 text-white rounded-lg"
                              title="Delete User"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Roles Table */}
            {hasPermission('manage_roles') && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Roles</h2>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="New Role"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="p-2 border rounded-lg w-full md:w-64"
                  />
                  <button
                    onClick={handleAddRole}
                    className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-lg"
                    title="Add Role"
                  >
                    <FaPlus />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {roles.map((role, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">{role}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteRole(role)}
                              className="p-2 bg-red-500 text-white rounded-lg"
                              title="Delete Role"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
              <Dialog
                open={!!editingUser}
                onClose={() => setEditingUser(null)}
                className="relative z-50"
              >
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                  <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md">
                    <Dialog.Title className="text-xl font-semibold mb-4">
                      Edit User
                    </Dialog.Title>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Name"
                        value={editingUser.name}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            name: e.target.value,
                          })
                        }
                        className="p-2 border rounded-lg w-full"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={editingUser.email}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            email: e.target.value,
                          })
                        }
                        className="p-2 border rounded-lg w-full"
                      />
                      <select
                        value={editingUser.user_type}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            user_type: e.target.value,
                          })
                        }
                        className="p-2 border rounded-lg w-full"
                      >
                        <option value="">Select Role</option>
                        {roles.map((role, index) => (
                          <option key={index} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-200 rounded-lg"
                        onClick={() => setEditingUser(null)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg"
                        onClick={handleUpdateUser}
                      >
                        Update
                      </button>
                    </div>
                  </Dialog.Panel>
                </div>
              </Dialog>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
