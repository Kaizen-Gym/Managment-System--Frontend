import { useState, useEffect, useContext } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaCog,
  FaUserShield,
  FaDatabase,
  FaHistory,
  FaTrash,
  FaDownload,
  FaFileDownload,
} from 'react-icons/fa';
import usePermissionCheck from '../hooks/usePermissionCheck';

const Settings = () => {
  usePermissionCheck('view_settings');

  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [settings, setSettings] = useState({
    backupFrequency: 'daily',
    retentionPeriod: 30,
    notificationsEnabled: true,
    maintenanceMode: false,
    gymName: '',
    gymAddress: '',
    contactEmail: '',
    contactPhone: '',
  });
  const [backups, setBackups] = useState([]);
  const [systemInfo, setSystemInfo] = useState({
    lastBackup: 'Loading...',
    system: {
      version: 'Loading...',
      uptime: 'Loading...',
      lastMaintenance: 'Loading...',
      connections: {
        current: 0,
        available: 0,
      },
    },
    database: {
      name: 'Loading...',
      size: 'Loading...',
      collections: 0,
      documents: 0,
      indexes: 0,
    },
    os: {
      type: 'Loading...',
      platform: 'Loading...',
      arch: 'Loading...',
      release: 'Loading...',
      memory: {
        total: 'Loading...',
        free: 'Loading...',
      },
      cpus: 0,
    },
    storageInfo: {
      totalBackups: 0,
      totalSize: 'Loading...',
      backupDirectory: 'Loading...',
      oldestBackup: 'Loading...',
      newestBackup: 'Loading...',
    },
  });
  /* eslint-disable no-unused-vars */
  const [backupSchedule, setBackupSchedule] = useState({
    lastStatus: 'success', // or 'error'
    lastBackupTime: null,
    nextBackupTime: null,
    retentionDays: 14,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [gymdata, setGymdata] = useState({});

  useEffect(() => {
    // Check if user is admin
    if (user?.user_type !== 'Admin') {
      navigate('/unauthorized');
      return;
    }

    // Fetch settings
    fetchSettings();
    fetchSystemInfo();
    fetchBackupSchedule();
    fetchGymSettings();
  }, [user, navigate]);

  const fetchGymSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/utils/gym`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        setGymdata(response.data);
        // Update the settings state with the gym data
        setSettings((prevSettings) => ({
          ...prevSettings,
          gymName: response.data.name || '',
          gymAddress: response.data.address || '',
          // Add other fields if needed
        }));
      }
    } catch (error) {
      console.error('Error fetching gym settings:', error);
      setError('Failed to fetch gym settings');
    }
  };

  const fetchBackupSchedule = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/settings/next-backup`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBackupSchedule(response.data);
    } catch (err) {
      console.error('Error fetching backup schedule:', err);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/settings/system-info`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSystemInfo(response.data.data);
    } catch (err) {
      console.error('Error fetching system info:', err);
      setError('Failed to fetch system information');
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/settings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSettings(response.data);
    } catch (err) {
      setError('Failed to fetch settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const handleSaveSettings = async () => {
    try {
      const token = localStorage.getItem('token');

      // First validate
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/settings/gym/validate`,
        {
          gymName: settings.gymName,
          gymAddress: settings.gymAddress,
          contactEmail: settings.contactEmail,
          contactPhone: settings.contactPhone,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Then save if validation passes
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/settings/gym`,
        {
          gymName: settings.gymName,
          gymAddress: settings.gymAddress,
          contactEmail: settings.contactEmail,
          contactPhone: settings.contactPhone,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess('Settings saved successfully');
      setIsEditing(false); // Turn off edit mode
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      if (err.response?.data?.errors) {
        // Handle validation errors
        const errorMessages = Object.values(err.response.data.errors).join(
          '\n'
        );
        setError(errorMessages);
      } else {
        console.error(err);
        setError('Failed to save settings');
      }
      setTimeout(() => setError(null), 3000);
    }
  };

  const fetchBackups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/settings/backups`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBackups(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch backups');
    }
  };

  // Add useEffect to fetch backups
  useEffect(() => {
    fetchBackups();
  }, []);

  // Add these functions for backup operations
  const handleRestoreBackup = async (filename) => {
    if (
      window.confirm(
        'Are you sure you want to restore this backup? This will override current data.'
      )
    ) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/settings/restore/${filename}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSuccess('Backup restored successfully');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error(err);
        setError('Failed to restore backup');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const handleClearLogs = async () => {
    if (window.confirm('Are you sure you want to clear all logs?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/settings/logs`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSuccess('Logs cleared successfully');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error(err);
        setError('Failed to clear logs');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const handleBackupDatabase = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/settings/backup`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob', // Important for handling the downloaded file
        }
      );

      // Create a download link for the backup file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const currentDate = new Date().toISOString().split('T')[0];
      link.href = url;
      link.setAttribute('download', `backup-${currentDate}.gz`); // or whatever extension your backend uses
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('Database backup completed successfully');
      // Refresh the backup list
      fetchBackups();
    } catch (err) {
      console.error('Backup error:', err);
      setError('Failed to create database backup');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          Loading...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <FaCog className="text-2xl mr-2" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaUserShield className="mr-2" />
              Gym Details
            </h2>

            <div className="space-y-4">
              {isEditing ? (
                // Edit Form
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gym Name
                    </label>
                    <input
                      type="text"
                      value={gymdata.name}
                      onChange={(e) =>
                        handleSettingChange('gymName', e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gym Address
                    </label>
                    <textarea
                      value={gymdata.address}
                      onChange={(e) =>
                        handleSettingChange('gymAddress', e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) =>
                        handleSettingChange('contactEmail', e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={settings.contactPhone}
                      onChange={(e) =>
                        handleSettingChange('contactPhone', e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </>
              ) : (
                // Display Details
                <>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Gym Name
                    </p>
                    <p className="mt-1 text-lg text-gray-900">
                      {settings.gymName || 'Not set'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="mt-1 text-lg text-gray-900">
                      {settings.gymAddress || 'Not set'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Contact Email
                    </p>
                    <p className="mt-1 text-lg text-gray-900">
                      {settings.contactEmail || 'Not set'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Contact Phone
                    </p>
                    <p className="mt-1 text-lg text-gray-900">
                      {settings.contactPhone || 'Not set'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaDatabase className="mr-2" />
              Automated Backup Status
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Backup Schedule Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Schedule Details</h3>
                <div>
                  <p className="font-medium">Backup Frequency:</p>
                  <p className="text-gray-600">Daily at 12:00 AM IST</p>
                </div>
                <div>
                  <p className="font-medium">Next Backup:</p>
                  <p className="text-gray-600">
                    {(() => {
                      const now = new Date();
                      const nextBackup = new Date();
                      nextBackup.setHours(24, 0, 0, 0);
                      const timeUntil = nextBackup - now;
                      const hoursUntil = Math.floor(
                        timeUntil / (1000 * 60 * 60)
                      );
                      const minutesUntil = Math.floor(
                        (timeUntil % (1000 * 60 * 60)) / (1000 * 60)
                      );
                      return `In ${hoursUntil}h ${minutesUntil}m`;
                    })()}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Retention Period:</p>
                  <p className="text-gray-600">14 days</p>
                </div>
              </div>

              {/* Backup Status */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Current Status</h3>
                <div>
                  <p className="font-medium">Last Backup Status:</p>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        systemInfo?.lastBackup === 'Error getting backup info'
                          ? 'bg-red-500'
                          : 'bg-green-500'
                      }`}
                    />
                    <p className="text-gray-600">
                      {systemInfo?.lastBackup === 'Error getting backup info'
                        ? 'Failed'
                        : 'Successful'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Last Backup Time:</p>
                  <p className="text-gray-600">
                    {systemInfo?.lastBackup || 'No backup yet'}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Backup Size:</p>
                  <p className="text-gray-600">
                    {systemInfo?.storageInfo?.totalSize || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Storage Statistics */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Storage Details</h3>
                <div>
                  <p className="font-medium">Total Backups:</p>
                  <p className="text-gray-600">
                    {systemInfo?.storageInfo?.totalBackups || 0} files
                  </p>
                </div>
                <div>
                  <p className="font-medium">First Backup:</p>
                  <p className="text-gray-600">
                    {systemInfo?.storageInfo?.oldestBackup || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Latest Backup:</p>
                  <p className="text-gray-600">
                    {systemInfo?.storageInfo?.newestBackup || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Optional: Add a note about automated backups */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Note:</span> Automated backups are
                performed daily to ensure data safety. Old backups are
                automatically removed after 14 days to manage storage space.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-10 gap-4">
          {isEditing ? (
            <button
              onClick={handleSaveSettings}
              className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <FaCog className="mr-2" />
              Save Changes
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <FaCog className="mr-2" />
              Edit Details
            </button>
          )}

          <button
            onClick={handleClearLogs}
            className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            <FaTrash className="mr-2" />
            Clear Logs
          </button>
        </div>

        {/* System Information */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaHistory className="mr-2" />
            System Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Database Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Database Status</h3>
              <div>
                <p className="font-medium">Last Backup:</p>
                <p className="text-gray-600">
                  {systemInfo?.lastBackup || 'N/A'}
                </p>
              </div>
              <div>
                <p className="font-medium">Database Size:</p>
                <p className="text-gray-600">
                  {systemInfo?.database?.size || 'N/A'}
                </p>
              </div>
              <div>
                <p className="font-medium">Total Documents:</p>
                <p className="text-gray-600">
                  {systemInfo?.database?.documents?.toLocaleString() || 'N/A'}
                </p>
              </div>
              <div>
                <p className="font-medium">Collections:</p>
                <p className="text-gray-600">
                  {systemInfo?.database?.collections || 'N/A'}
                </p>
              </div>
            </div>

            {/* System Status */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">System Status</h3>
              <div>
                <p className="font-medium">Version:</p>
                <p className="text-gray-600">
                  {systemInfo?.system?.version || 'N/A'}
                </p>
              </div>
              <div>
                <p className="font-medium">Uptime:</p>
                <p className="text-gray-600">
                  {systemInfo?.system?.uptime || 'N/A'}
                </p>
              </div>
              <div>
                <p className="font-medium">Last Maintenance:</p>
                <p className="text-gray-600">
                  {systemInfo?.system?.lastMaintenance || 'N/A'}
                </p>
              </div>
            </div>

            {/* Storage & OS Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">System Details</h3>
              <div>
                <p className="font-medium">Operating System:</p>
                <p className="text-gray-600">
                  {systemInfo?.os
                    ? `${systemInfo.os.type || 'N/A'} (${systemInfo.os.platform || 'N/A'})`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="font-medium">Memory:</p>
                <p className="text-gray-600">
                  {systemInfo?.os?.memory ? (
                    <>
                      Free: {systemInfo.os.memory.free || 'N/A'} / Total:{' '}
                      {systemInfo.os.memory.total || 'N/A'}
                    </>
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
              <div>
                <p className="font-medium">Backup Storage:</p>
                <p className="text-gray-600">
                  {systemInfo?.storageInfo ? (
                    <>
                      {systemInfo.storageInfo.totalBackups || 0} backups (
                      {systemInfo.storageInfo.totalSize || 'N/A'})
                    </>
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={fetchSystemInfo}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <FaHistory className="mr-2" />
              Refresh Information
            </button>
          </div>
        </div>

        {/* Backup Management */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaFileDownload className="mr-2" />
            Backup Management
          </h2>

          {/* Backup History */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Recent Backups</h3>
              <button
                onClick={handleBackupDatabase}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                disabled={loading}
              >
                <FaDownload className="mr-2" />
                {loading ? 'Creating Backup...' : 'Create New Backup'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Filename
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {backups.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No backups available
                      </td>
                    </tr>
                  ) : (
                    backups.map((backup) => (
                      <tr key={backup.filename}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {backup.filename}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(backup.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(backup.size / 1024 / 1024).toFixed(2)} MB
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap space-x-4">
                          <button
                            onClick={() => handleRestoreBackup(backup.filename)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Restore
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
