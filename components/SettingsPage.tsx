import { useState, useEffect } from 'react';
import { Settings, Users, Bell, Lock, Database, Plus, X, Globe, Trash2, Search } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

type Role = 'Engineer' | 'ECO Manager' | 'Operations' | 'Admin';

interface SettingsPageProps {
  role: Role;
}

export function SettingsPage({ role }: SettingsPageProps) {
  const isAdmin = role === 'Admin';
  const { selectedCurrency, setSelectedCurrency, isLoadingRates, lastUpdated } = useCurrency();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Engineer', password: '' });
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, rolesRes, settingsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/roles'),
        fetch('/api/settings'),
      ]);
      const [usersData, rolesData, settingsData] = await Promise.all([
        usersRes.json(),
        rolesRes.json(),
        settingsRes.json(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Failed to fetch settings data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (response.ok) {
        fetchData();
        setShowAddUserModal(false);
        setNewUser({ name: '', email: '', role: 'Engineer', password: '' });
        alert(`User "${newUser.name}" created successfully!`);
      }
    } catch (error) {
      alert('Failed to create user');
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRole),
      });
      if (response.ok) {
        fetchData();
        setShowAddRoleModal(false);
        setNewRole({ name: '', description: '', permissions: '' });
        alert(`Role "${newRole.name}" created successfully!`);
      }
    } catch (error) {
      alert('Failed to create role');
    }
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
      
      if (!refreshToken) {
        console.error('No refresh token available');
        return false;
      }
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Token refresh failed:', errorData);
        return false;
      }
      
      const data = await response.json();
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken);
      }
      
      console.log('Access token refreshed successfully');
      return true;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return false;
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }
    
    setDeletingUserId(userId);
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        alert(`User "${userName}" deleted successfully!`);
        fetchData(); // Refresh the user list
      } else {
        const result = await response.json();
        alert(result.error || 'Failed to delete user');
      }
    } catch (error) {
      alert('Failed to delete user');
      console.error('Delete user error:', error);
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      // Get access token from localStorage
      let accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      
      const makeRequest = async (token: string | null) => {
        return await fetch('/api/profile/password', {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
          }),
        });
      };
      
      // First attempt with current token
      let response = await makeRequest(accessToken);
      
      // If unauthorized, try to refresh token and retry
      if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
          response = await makeRequest(accessToken);
        }
      }
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Password changed successfully!');
        setShowChangePasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert(result.error || 'Failed to change password');
      }
    } catch (error) {
      alert('Failed to change password');
      console.error('Password change error:', error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-slate-700" />
            <h3 className="text-lg font-semibold text-slate-900">General Settings</h3>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Company Name
            </label>
            <input
              type="text"
              defaultValue={settings?.companyName || "Manufacturing Solutions Inc."}
              disabled={!isAdmin}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Preferred Currency
            </label>
            <div className="flex items-center gap-3">
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value as any)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="INR">INR - Indian Rupee</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
              </select>
              <Globe className="w-5 h-5 text-slate-500" />
            </div>
            {isLoadingRates && (
              <p className="text-xs text-slate-500 mt-1">Loading exchange rates...</p>
            )}
            {lastUpdated && !isLoadingRates && (
              <p className="text-xs text-slate-500 mt-1">
                Rates updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Time Zone
            </label>
            <select
              defaultValue={settings?.timezone || "America/New_York"}
              disabled={!isAdmin}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Management */}
      {isAdmin && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-slate-700" />
                <h3 className="text-lg font-semibold text-slate-900">User Management</h3>
              </div>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-900">{user.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{user.role}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          disabled={deletingUserId === user.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete user"
                        >
                          {deletingUserId === user.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Role Management */}
      {isAdmin && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-slate-700" />
              <h3 className="text-lg font-semibold text-slate-900">Role Management</h3>
            </div>
            <button
              onClick={() => setShowAddRoleModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Role
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.id} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{role.name}</h4>
                      <p className="text-sm text-slate-600 mt-1">{role.description}</p>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {role.permissions}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-slate-700" />
            <h3 className="text-lg font-semibold text-slate-900">Notification Preferences</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm font-medium text-slate-900">ECO Approvals</div>
              <div className="text-xs text-slate-600">Receive notifications when ECOs require approval</div>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm font-medium text-slate-900">ECO Status Changes</div>
              <div className="text-xs text-slate-600">Get notified when ECO status is updated</div>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm font-medium text-slate-900">Product Updates</div>
              <div className="text-xs text-slate-600">Notifications for product version changes</div>
            </div>
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm font-medium text-slate-900">Weekly Summary</div>
              <div className="text-xs text-slate-600">Receive a weekly summary email</div>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-slate-700" />
            <h3 className="text-lg font-semibold text-slate-900">Security</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <button 
              onClick={() => setShowChangePasswordModal(true)}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Change Password
            </button>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-900">Enable two-factor authentication</span>
            </label>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Change Password</h3>
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                />
                <p className="text-xs text-slate-500 mt-1">Must be at least 6 characters long</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  disabled={isChangingPassword}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* System Information */}
      {isAdmin && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-slate-700" />
              <h3 className="text-lg font-semibold text-slate-900">System Information</h3>
            </div>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Version</span>
              <span className="text-slate-900 font-medium">2.4.1</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Database</span>
              <span className="text-slate-900 font-medium">PostgreSQL 15.2</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Last Backup</span>
              <span className="text-slate-900 font-medium">2024-01-24 02:00 AM</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Storage Used</span>
              <span className="text-slate-900 font-medium">14.2 GB / 100 GB</span>
            </div>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800">
            Some settings require administrator privileges. Contact your system administrator to modify restricted settings.
          </p>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Add New User</h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="john.doe@example.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Engineer">Engineer</option>
                  <option value="ECO Manager">ECO Manager</option>
                  <option value="Operations">Operations</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Create New Role</h3>
              <button
                onClick={() => setShowAddRoleModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleAddRole} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="Manager"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Role description and responsibilities..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Permissions <span className="text-red-500">*</span>
                </label>
                <select
                  value={newRole.permissions}
                  onChange={(e) => setNewRole({ ...newRole, permissions: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select permissions...</option>
                  <option value="Read">Read Only</option>
                  <option value="Read/Write">Read/Write</option>
                  <option value="Approve">Approve</option>
                  <option value="Read/Implement">Read/Implement</option>
                  <option value="Full Access">Full Access</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}