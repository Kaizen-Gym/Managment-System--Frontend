import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { Dialog } from '@headlessui/react';
import usePermissions from '../hooks/usePermissions';
import DashboardLayout from '../components/DashboardLayout';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    user_type: '',
  });
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5050/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Assuming the API returns an array of users directly
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
      // Assuming the API returns an array of role strings
      setRoles(response.data);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Failed to fetch roles');
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
      setUsers([...users, response.data.user]);
      setNewUser({ name: '', email: '', user_type: '' });
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
      // Assuming response.data.role returns the new role as a string
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

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <>
            {hasPermission('manage_users') && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Add New User</h2>
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    className="p-2 border rounded-lg w-full md:w-64"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="p-2 border rounded-lg w-full md:w-64"
                  />
                  <select
                    value={newUser.user_type}
                    onChange={(e) =>
                      setNewUser({ ...newUser, user_type: e.target.value })
                    }
                    className="p-2 border rounded-lg w-full md:w-64"
                  >
                    <option value="">Select Role</option>
                    {roles.map((role, index) => (
                      <option key={index} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddUser}
                    className="p-2 bg-blue-500 text-white rounded-lg"
                    title="Add User"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
            )}

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
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.user_type}
                        </td>
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
                    className="p-2 bg-blue-500 text-white rounded-lg"
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            {role}
                          </td>
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
