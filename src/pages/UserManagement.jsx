import { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import usePermissions from "../hooks/usePermissions";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const { hasPermission } = usePermissions();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5050/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5050/api/roles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRoles(response.data.roles);
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5050/api/users",
        newUser,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers([...users, response.data.user]);
      setNewUser({ name: "", email: "", role: "" });
    } catch (err) {
      console.error("Error adding user:", err);
    }
  };

  const handleEditUser = async (user) => {
    setEditingUser(user);
  };

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5050/api/users/${editingUser._id}`,
        editingUser,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(
        users.map((user) =>
          user._id === editingUser._id ? response.data.user : user
        )
      );
      setEditingUser(null);
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5050/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(users.filter((user) => user._id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleAddRole = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5050/api/roles",
        { name: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRoles([...roles, response.data.role]);
      setNewRole("");
    } catch (err) {
      console.error("Error adding role:", err);
    }
  };

  const handleDeleteRole = async (roleId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5050/api/roles/${roleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRoles(roles.filter((role) => role._id !== roleId));
    } catch (err) {
      console.error("Error deleting role:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      {hasPermission("manage_users") && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Add New User</h2>
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) =>
                setNewUser({ ...newUser, name: e.target.value })
              }
              className="p-2 border rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              className="p-2 border rounded"
            />
            <select
              value={newUser.role}
              onChange={(e) =>
                setNewUser({ ...newUser, role: e.target.value })
              }
              className="p-2 border rounded"
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role._id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddUser}
              className="p-2 bg-blue-500 text-white rounded"
            >
              <FaPlus />
            </button>
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2">Users</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td className="border p-2">{user.name}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.role}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleEditUser(user)}
                  className="p-2 bg-yellow-500 text-white rounded mr-2"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  className="p-2 bg-red-500 text-white rounded"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingUser && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Edit User</h2>
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Name"
              value={editingUser.name}
              onChange={(e) =>
                setEditingUser({ ...editingUser, name: e.target.value })
              }
              className="p-2 border rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={editingUser.email}
              onChange={(e) =>
                setEditingUser({ ...editingUser, email: e.target.value })
              }
              className="p-2 border rounded"
            />
            <select
              value={editingUser.role}
              onChange={(e) =>
                setEditingUser({ ...editingUser, role: e.target.value })
              }
              className="p-2 border rounded"
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role._id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleUpdateUser}
              className="p-2 bg-green-500 text-white rounded"
            >
              Update
            </button>
          </div>
        </div>
      )}

      {hasPermission("manage_roles") && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Roles</h2>
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              placeholder="New Role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="p-2 border rounded"
            />
            <button
              onClick={handleAddRole}
              className="p-2 bg-blue-500 text-white rounded"
            >
              <FaPlus />
            </button>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2">Role</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role._id}>
                  <td className="border p-2">{role.name}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleDeleteRole(role._id)}
                      className="p-2 bg-red-500 text-white rounded"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
