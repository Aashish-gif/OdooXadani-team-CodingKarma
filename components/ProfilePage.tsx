import { Mail, Phone, MapPin, Calendar, Shield, LogOut, Edit, X, Camera } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

type Role = 'Engineer' | 'Approver' | 'Operations' | 'Admin';

interface ProfilePageProps {
  user?: { name: string; email: string }; // Optional to allow override, but usually from context
  role: Role;
  onLogout: () => void;
}

const roleDescriptions = {
  Engineer: 'Can create and edit ECOs, manage product data, and submit changes for approval.',
  Approver: 'Reviews and approves engineering change orders, validates technical specifications.',
  Operations: 'Read-only access to ECO data, can validate implementation and provide operational feedback.',
  Admin: 'Full system access including user management, settings configuration, and system administration.',
};

const activityLog = [
  { date: '2024-01-24', time: '09:15 AM', action: 'Viewed ECO-2024-001', type: 'View' },
  { date: '2024-01-23', time: '04:32 PM', action: 'Created ECO-2024-006', type: 'Create' },
  { date: '2024-01-23', time: '02:18 PM', action: 'Updated Product P001', type: 'Edit' },
  { date: '2024-01-22', time: '11:45 AM', action: 'Approved ECO-2024-005', type: 'Approve' },
  { date: '2024-01-22', time: '09:30 AM', action: 'Viewed BoM BOM002', type: 'View' },
  { date: '2024-01-21', time: '03:20 PM', action: 'Generated ECO Report', type: 'Report' },
];

export function ProfilePage({ user: propUser, role, onLogout }: ProfilePageProps) {
  const { currentUser, updateUser } = useAuth();
  // Use propUser if provided (legacy support), otherwise use currentUser from context
  const user = propUser || currentUser;

  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [editFormData, setEditFormData] = useState({
    name: user.name,
    email: user.email,
    location: currentUser.location || 'San Francisco, CA',
    phone: currentUser.phone || '+1 (555) 123-4567',
    description: currentUser.description || 'Senior Manufacturing Engineer with 10 years of experience in automotive and aerospace industries.',
    profilePicture: currentUser.profilePicture || ''
  });

  const getRoleBadgeColor = () => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-700';
      case 'Approver':
        return 'bg-blue-100 text-blue-700';
      case 'Engineer':
        return 'bg-emerald-100 text-emerald-700';
      case 'Operations':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Create':
        return 'bg-emerald-100 text-emerald-700';
      case 'Edit':
        return 'bg-blue-100 text-blue-700';
      case 'Approve':
        return 'bg-purple-100 text-purple-700';
      case 'Report':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError('');
    
    try {
      await updateUser(editFormData);
      setShowEditModal(false);
    } catch (error) {
      setSaveError('Failed to save profile changes. Please try again.');
      console.error('Profile save error:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set maximum dimensions
          const maxWidth = 300;
          const maxHeight = 300;
          let { width, height } = img;
          
          // Calculate new dimensions maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw resized image
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to data URL with quality reduction
          const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          setEditFormData({
            ...editFormData,
            profilePicture: resizedDataUrl
          });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-700"></div>
        <div className="px-8 pb-8">
          <div className="flex items-end justify-between -mt-16 mb-6">
            <div className="flex items-end gap-6">
              <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                {currentUser.profilePicture ? (
                  <img 
                    src={currentUser.profilePicture} 
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-semibold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>
              <div className="mb-2">
                <h2 className="text-2xl font-semibold text-slate-900">{user.name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor()}`}>
                    <Shield className="w-4 h-4" />
                    {role}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
                    Active
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => {
                  setEditFormData({
                    name: user.name,
                    email: user.email,
                    location: currentUser.location || 'San Francisco, CA',
                    phone: currentUser.phone || '+1 (555) 123-4567',
                    description: currentUser.description || 'Senior Manufacturing Engineer with 10 years of experience in automotive and aerospace industries.',
                    profilePicture: currentUser.profilePicture || ''
                  });
                  setShowEditModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <Mail className="w-5 h-5 text-slate-600" />
              <div>
                <div className="text-xs text-slate-600">Email</div>
                <div className="text-sm font-medium text-slate-900">{user.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <Phone className="w-5 h-5 text-slate-600" />
              <div>
                <div className="text-xs text-slate-600">Phone</div>
                <div className="text-sm font-medium text-slate-900">{currentUser.phone || '+1 (555) 123-4567'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <MapPin className="w-5 h-5 text-slate-600" />
              <div>
                <div className="text-xs text-slate-600">Location</div>
                <div className="text-sm font-medium text-slate-900">{currentUser.location || 'San Francisco, CA'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Role & Permissions</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-slate-900 mb-1">Current Role</div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${getRoleBadgeColor()}`}>
                  <Shield className="w-4 h-4" />
                  {role}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900 mb-2">Description</div>
                <p className="text-sm text-slate-600">{roleDescriptions[role]}</p>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900 mb-2">About user</div>
                <p className="text-sm text-slate-600">
                  {currentUser.description || 'Senior Manufacturing Engineer with 10 years of experience in automotive and aerospace industries.'}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <div className="text-sm font-medium text-slate-900 mb-2">Member Since</div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  January 2023
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">ECOs Created</span>
                <span className="text-lg font-semibold text-slate-900">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">ECOs Approved</span>
                <span className="text-lg font-semibold text-slate-900">18</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Products Managed</span>
                <span className="text-lg font-semibold text-slate-900">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Pending Actions</span>
                <span className="text-lg font-semibold text-amber-600">3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
              <p className="text-sm text-slate-600 mt-1">Your recent actions in the system</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {activityLog.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg ${getActivityIcon(activity.type)} flex items-center justify-center text-sm font-medium flex-shrink-0`}>
                      {activity.type[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 font-medium">{activity.action}</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {activity.date} at {activity.time}
                      </p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityIcon(activity.type)} flex-shrink-0`}>
                      {activity.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="p-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-left">
            <div className="text-sm font-medium text-slate-900">Change Password</div>
            <div className="text-xs text-slate-600 mt-1">Update your security credentials</div>
          </button>
          <button className="p-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-left">
            <div className="text-sm font-medium text-slate-900">Notification Settings</div>
            <div className="text-xs text-slate-600 mt-1">Manage email preferences</div>
          </button>
          <button className="p-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-left">
            <div className="text-sm font-medium text-slate-900">Download Data</div>
            <div className="text-xs text-slate-600 mt-1">Export your activity history</div>
          </button>
          <button className="p-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-left">
            <div className="text-sm font-medium text-slate-900">View Sessions</div>
            <div className="text-xs text-slate-600 mt-1">Active login sessions</div>
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Edit Profile</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Mobile No.
                </label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Description
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={editFormData.profilePicture}
                    onChange={(e) => setEditFormData({ ...editFormData, profilePicture: e.target.value })}
                    placeholder="Enter URL for profile picture"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>

              {saveError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{saveError}</p>
                </div>
              )}
              
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
