import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Dialog, DialogPanel } from '@headlessui/react';
import { FaEdit, FaTrash, FaUsers } from 'react-icons/fa';
import ErrorAnimation from '../components/Animations/ErrorAnimation';

//hooks
import usePermissionCheck from '../hooks/usePermissionCheck';

const API_BASE = 'http://localhost:5050';

const UserManagement = () => {
  usePermissionCheck('manage_users', '/dashboard');  // Requires 'view_users' permission// Requires 'manage_users' permission. Redirect to dashboard if not allowed

  // States for users
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    gender: '',
    age: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    gym: '',
    permissions: [],
  });
  const [editingUser, setEditingUser] = useState(null);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);

  // States for roles
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    defaultPermissions: [],
    currentPermissions: [],
  });
  const [editingRole, setEditingRole] = useState(null);
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [expandedRoles, setExpandedRoles] = useState([]);

  // Other UI state
  const [errorAnimation, setErrorAnimation] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // For demo purposes – assume gymId comes from logged in user or props
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const gymId = storedUser.gymId;
  console.log(gymId);

  const allPermissions = [
    'view_dashboard',
    'view_members',
    'view_reports',
    'view_membership_plans',
    'view_settings',
    'manage_users',
    'view_payment_records',
  ];

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      setLoadingUsers(true);
      const response = await fetch(`${API_BASE}/api/users`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch users: ${response.status} ${errorText}`
        );
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setErrorMessage(error.message);
      setErrorAnimation(true);
      
      setTimeout(() => setErrorAnimation({ show: false, message: '' }), 3000);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        // Send gymId as required by your API.
        body: JSON.stringify({ ...newUser, gymId: gymId }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add user: ${response.status} ${errorText}`);
      }
      const createdUser = await response.json();
      setUsers((prev) => [...prev, createdUser]);
      // Reset the form with all fields
      setNewUser({
        name: '',
        email: '',
        user_type: '',
        number: '',
        password: '',
        gender: '',
        age: '',
        permissions: [],
      });
      setIsCreateUserModalOpen(false);
    } catch (error) {
      setErrorMessage(error.message);
      setErrorAnimation(true);
      
      setTimeout(() => setErrorAnimation({ show: false, message: '' }), 3000);
    }
  };

  const handleEditUser = (user) => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (user._id === currentUser._id) {
      setErrorMessage('Cannot edit your own account');
      setErrorAnimation(true);
      
      setTimeout(() => setErrorAnimation({ show: false, message: '' }), 3000);
      return;
    }
    setEditingUser(user);
    setIsEditUserModalOpen(true);
  };
  
  const toggleEditPermission = (permission) => {
    // Ensure permissions exists; if not, initialize it as an empty array
    const currentPermissions = editingUser.permissions || [];
    
    if (currentPermissions.includes(permission)) {
      // Remove the permission if it already exists
      setEditingUser({
        ...editingUser,
        permissions: currentPermissions.filter((perm) => perm !== permission)
      });
    } else {
      // Add the permission if it's not in the array
      setEditingUser({
        ...editingUser,
        permissions: [...currentPermissions, permission]
      });
    }
  };


  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingUser),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update user: ${response.status} ${errorText}`
        );
      }
      const updatedUser = await response.json();
      setUsers((prev) =>
        prev.map((user) => (user._id === updatedUser._id ? updatedUser : user))
      );
      setEditingUser(null);
      setIsEditUserModalOpen(false);
    } catch (error) {
      setErrorMessage(error.message);
      setErrorAnimation(true);
      
      setTimeout(() => setErrorAnimation({ show: false, message: '' }), 3000);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to delete user: ${response.status} ${errorText}`
        );
      }
      setUsers((prev) => prev.filter((user) => user._id !== userId));
    } catch (error) {
      setErrorMessage(error.message);
      setErrorAnimation(true);
      
      setTimeout(() => setErrorAnimation({ show: false, message: '' }), 3000);
    }
  };

  // Toggle permission: add it if not present, remove if already selected
  const togglePermission = (permName) => {
    setNewUser((prev) => {
      const newPermissions = prev.permissions.includes(permName)
        ? prev.permissions.filter((p) => p !== permName)
        : [...prev.permissions, permName];
      return { ...prev, permissions: newPermissions };
    });
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      setLoadingRoles(true);
      const response = await fetch(`${API_BASE}/api/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch roles: ${response.status} ${errorText}`
        );
      }
      let data = await response.json();
      data = data.map((role) => {
        if (typeof role === 'string') {
          role = { name: role, defaultPermissions: [], currentPermissions: [] };
        }
        const normalizePerms = (perms) =>
          Array.isArray(perms)
            ? perms.map((p) =>
                typeof p === 'string' ? { name: p, active: false } : p
              )
            : [];
        return {
          ...role,
          defaultPermissions: normalizePerms(role.defaultPermissions),
          currentPermissions: normalizePerms(role.currentPermissions),
        };
      });
      setRoles(data);
    } catch (error) {
      setErrorMessage(error.message);
      setErrorAnimation(true);
      
      setTimeout(() => setErrorAnimation({ show: false, message: '' }), 3000);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleAddRole = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newRole),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add role: ${response.status} ${errorText}`);
      }
      const createdRole = await response.json();
      setRoles((prev) => [...prev, createdRole]);
      setNewRole({ name: '', defaultPermissions: [], currentPermissions: [] });
      setIsCreateRoleModalOpen(false);
    } catch (error) {
      setErrorMessage(error.message);
      setErrorAnimation(true);
      
      setTimeout(() => setErrorAnimation({ show: false, message: '' }), 3000);
    }
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setIsEditRoleModalOpen(true);
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE}/api/roles/${editingRole.name}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editingRole),
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update role: ${response.status} ${errorText}`
        );
      }
      const updatedRole = await response.json();
      setRoles((prev) =>
        prev.map((role) =>
          role.name === updatedRole.name ? updatedRole : role
        )
      );
      setEditingRole(null);
      setIsEditRoleModalOpen(false);
    } catch (error) {
      setErrorMessage(error.message);
      setErrorAnimation(true);
      
      setTimeout(() => setErrorAnimation({ show: false, message: '' }), 3000);
    }
  };

  const handleDeleteRole = async (roleName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/roles/${roleName}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to delete role: ${response.status} ${errorText}`
        );
      }
      setRoles((prev) => prev.filter((role) => role.name !== roleName));
    } catch (error) {
      setErrorMessage(error.message);
      setErrorAnimation(true);
      
      setTimeout(() => setErrorAnimation({ show: false, message: '' }), 3000);
    }
  };

  const toggleRoleExpand = (roleName) => {
    setExpandedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName]
    );
  };

  const formatPermission = (perm) => {
    const permString =
      typeof perm === 'object' && perm !== null ? perm.name || '' : perm;
    return permString
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <DashboardLayout>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <FaUsers className="text-2xl" />
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>

        {/* Create User Button */}
        <div className="mt-4">
          <button
            onClick={() => setIsCreateUserModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Create User
          </button>
        </div>

        {/* Users Table */}
        <div className="mt-6 overflow-x-auto">
          {loadingUsers ? (
            <p>Loading users...</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Roles Section */}
        <div className="mt-10">
          <h2 className="text-xl font-bold">Roles Management</h2>
          <div className="mt-4">
            <button
              onClick={() => setIsCreateRoleModalOpen(true)}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Add New Role
            </button>
          </div>
          <div className="mt-6 overflow-x-auto">
            {loadingRoles ? (
              <p>Loading roles...</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role Name
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roles.map((role) => (
                    <React.Fragment key={role.name}>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {role.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditRole(role)}
                            className="text-indigo-600 hover:text-indigo-900 mr-2"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role.name)}
                            className="text-red-600 hover:text-red-900 mr-2"
                          >
                            <FaTrash />
                          </button>
                          <button
                            onClick={() => toggleRoleExpand(role.name)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {expandedRoles.includes(role.name)
                              ? 'Collapse'
                              : 'Expand'}
                          </button>
                        </td>
                      </tr>
                      {expandedRoles.includes(role.name) && (
                        <tr>
                          <td colSpan="2" className="px-6 py-4">
                            <div>
                              <strong>Default Permissions:</strong>
                              <ul className="list-disc list-inside">
                                {role.defaultPermissions &&
                                  role.defaultPermissions.map((perm, i) => (
                                    <li key={i}>{formatPermission(perm)}</li>
                                  ))}
                              </ul>
                            </div>
                            <div className="mt-2">
                              <strong>Current Permissions:</strong>
                              <ul className="list-disc list-inside">
                                {role.currentPermissions &&
                                  role.currentPermissions.map((perm, i) => (
                                    <li key={i}>{formatPermission(perm)}</li>
                                  ))}
                              </ul>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {isCreateUserModalOpen && (
        <Dialog
          open={isCreateUserModalOpen}
          onClose={() => setIsCreateUserModalOpen(false)}
          className="relative z-50"
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
          {/* Centering container */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white bg-gradient-to-b from-gray-50 to-white p-8 text-left align-middle shadow-xl transition-all duration-300 ease-out motion-safe:animate-[fadeIn_0.3s_ease-in-out]">
              <Dialog.Title className="text-2xl font-bold text-gray-900 pb-4 border-b border-gray-200 mb-6">
                Create User
              </Dialog.Title>
      
              <form onSubmit={handleAddUser} className="mt-4 space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="p-2 border rounded w-full"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="p-2 border rounded w-full"
                  required
                />
                <select
                  value={newUser.user_type}
                  onChange={(e) =>
                    setNewUser({ ...newUser, user_type: e.target.value })
                  }
                  className="p-2 border rounded w-full"
                  required
                >
                  <option value="">Select User Type</option>
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                  <option value="Trainer">Trainer</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Manager">Manager</option>
                </select>
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={newUser.number}
                  onChange={(e) =>
                    setNewUser({ ...newUser, number: e.target.value })
                  }
                  className="p-2 border rounded w-full"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="p-2 border rounded w-full"
                  required
                />
                <select
                  value={newUser.gender}
                  onChange={(e) =>
                    setNewUser({ ...newUser, gender: e.target.value })
                  }
                  className="p-2 border rounded w-full"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="number"
                  placeholder="Age"
                  value={newUser.age}
                  onChange={(e) =>
                    setNewUser({ ...newUser, age: e.target.value })
                  }
                  className="p-2 border rounded w-full"
                  required
                />
                <div className="flex flex-wrap gap-2">
                  {allPermissions.map((perm) => (
                    <label key={perm} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newUser.permissions.includes(perm)}
                        onChange={() => togglePermission(perm)}
                        className="mr-1"
                      />
                      {formatPermission(perm)}
                    </label>
                  ))}
                </div>
      
                {/* Buttons */}
                <div className="mt-8 flex justify-end space-x-4 border-t border-gray-200 pt-6">
                  <button
                    type="button"
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    onClick={() => setIsCreateUserModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 shadow-sm"
                  >
                    Add User
                  </button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </Dialog>
      )}

      {/* Edit User Modal */}
      {isEditUserModalOpen && editingUser && (
        <Dialog
          open={isEditUserModalOpen}
          onClose={() => setIsEditUserModalOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="w-full max-w-md rounded-2xl bg-white p-6">
              <Dialog.Title className="text-lg font-bold">Edit User</Dialog.Title>
              <form onSubmit={handleUpdateUser} className="mt-4 space-y-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  className="p-2 border rounded w-full"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="p-2 border rounded w-full"
                  required
                />
                <select
                  value={editingUser.user_type}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, user_type: e.target.value })
                  }
                  className="p-2 border rounded w-full"
                  required
                >
                  <option value="">Select User Type</option>
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                  <option value="Trainer">Trainer</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Manager">Manager</option>
                </select>
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={editingUser.number}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, number: e.target.value })
                  }
                  className="p-2 border rounded w-full"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={editingUser.password}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, password: e.target.value })
                  }
                  className="p-2 border rounded w-full"
                  required
                />
                <select
                  value={editingUser.gender}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, gender: e.target.value })
                  }
                  className="p-2 border rounded w-full"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="number"
                  placeholder="Age"
                  value={editingUser.age}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, age: e.target.value })
                  }
                  className="p-2 border rounded w-full"
                  required
                />
                <div className="flex flex-wrap gap-2">
                  {allPermissions.map((perm) => (
                    <label key={perm} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingUser.permissions.includes(perm)}
                        onChange={() => toggleEditPermission(perm)}
                        className="mr-1"
                      />
                      {formatPermission(perm)}
                    </label>
                  ))}
                </div>
                <button
                  type="submit"
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Update User
                </button>
              </form>
            </DialogPanel>
          </div>
        </Dialog>
      )}

      {/* Create Role Modal */}
      {isCreateRoleModalOpen && (
        <Dialog
          open={isCreateRoleModalOpen}
          onClose={() => setIsCreateRoleModalOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="w-full max-w-md rounded-2xl bg-white p-6">
              <Dialog.Title className="text-lg font-bold">
                Add Role
              </Dialog.Title>
              <form onSubmit={handleAddRole} className="mt-4 space-y-2">
                <input
                  type="text"
                  placeholder="Role Name"
                  value={newRole.name}
                  onChange={(e) =>
                    setNewRole({ ...newRole, name: e.target.value })
                  }
                  className="p-2 border rounded w-full"
                  required
                />
                <button
                  type="submit"
                  className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
                >
                  Add Role
                </button>
              </form>
            </DialogPanel>
          </div>
        </Dialog>
      )}

      {/* Edit Role Modal */}
      {isEditRoleModalOpen && editingRole && (
        <Dialog
          open={isEditRoleModalOpen}
          onClose={() => setIsEditRoleModalOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="w-full max-w-md rounded-2xl bg-white p-6">
              <Dialog.Title className="text-lg font-bold">
                Edit Role
              </Dialog.Title>
              <form onSubmit={handleUpdateRole} className="mt-4 space-y-2">
                <input
                  type="text"
                  placeholder="Role Name"
                  value={editingRole.name}
                  disabled
                  className="p-2 border rounded w-full bg-gray-100"
                />
                <div className="mt-4">
                  <strong>Default Permissions</strong>
                  {(editingRole.defaultPermissions || []).map((perm, i) => (
                    <div key={i} className="flex items-center mt-1">
                      <input
                        type="checkbox"
                        checked={perm.active || false}
                        onChange={() =>
                          setEditingRole((prev) => ({
                            ...prev,
                            defaultPermissions: (
                              prev.defaultPermissions || []
                            ).map((p, index) =>
                              index === i ? { ...p, active: !p.active } : p
                            ),
                          }))
                        }
                        className="mr-2"
                      />
                      <span>{formatPermission(perm)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <strong>Current Permissions</strong>
                  {(editingRole.currentPermissions || []).map((perm, i) => (
                    <div key={i} className="flex items-center mt-1">
                      <input
                        type="checkbox"
                        checked={perm.active || false}
                        onChange={() =>
                          setEditingRole((prev) => ({
                            ...prev,
                            currentPermissions: (
                              prev.currentPermissions || []
                            ).map((p, index) =>
                              index === i ? { ...p, active: !p.active } : p
                            ),
                          }))
                        }
                        className="mr-2"
                      />
                      <span>{formatPermission(perm)}</span>
                    </div>
                  ))}
                </div>
                <button
                  type="submit"
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Update Role
                </button>
              </form>
            </DialogPanel>
          </div>
        </Dialog>
      )}

      {/* Error Animation */}
      <ErrorAnimation show={errorAnimation} message={errorMessage} />
    </DashboardLayout>
  );
};

export default UserManagement;
