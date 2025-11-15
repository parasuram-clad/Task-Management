import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { User } from '../../App';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Calendar, Mail, Phone, MapPin, Building, Clock, Edit, User as UserIcon, Save, X } from 'lucide-react';
import { authApi,User } from '../../services/api';
import { toast } from 'sonner';

interface ProfileProps {
  user: User;
}

// Password Change Modal Component
function ChangePasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.changePassword({
        currentPassword,
        newPassword
      });
      
      toast.success('Password changed successfully');
      onClose();
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Change Password</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Profile({ user }: ProfileProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [completeUser, setCompleteUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Editable fields state
  const [editableFields, setEditableFields] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Fetch complete user data when component mounts
  useEffect(() => {
    const fetchCompleteUserData = async () => {
      try {
        setIsLoading(true);
        const response = await authApi.getProfile();
        console.log('Profile API Response:', response);
        
        // Transform the API response to match User interface
        const transformedUser: User = {
          id: response.id,
          name: response.name,
          email: response.email,
          role: response.role,
          is_active: response.is_active,
          employee_code: response.employee_code,
          employee_id: response.employee_code, // Map employee_code to employee_id
          phone: response.phone,
          department: response.department,
          position: response.position,
          manager: response.manager,
          location: response.location,
          date_of_birth: response.date_of_birth,
          date_of_join: response.date_of_join,
          hire_date: response.date_of_join, // Map date_of_join to hire_date
          employment_type: response.employment_type,
          shift: response.shift,
          created_at: response.created_at,
          last_login_at: response.last_login_at
        };
        
        setCompleteUser(transformedUser);
        setEditableFields({
          name: response.name || '',
          email: response.email || '',
          phone: response.phone || ''
        });
      } catch (error) {
        console.error('Error fetching complete user data:', error);
        // Fallback to basic user data if API fails
        setCompleteUser(user);
        setEditableFields({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || ''
        });
        toast.error('Failed to load complete profile information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompleteUserData();
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const response = await authApi.updateProfile(editableFields);
      
      // Update the complete user with the response
      if (completeUser) {
        const updatedUser = {
          ...completeUser,
          name: response.user.name || completeUser.name,
          email: response.user.email || completeUser.email,
          phone: response.user.phone || completeUser.phone
        };
        setCompleteUser(updatedUser);
      }
      
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditableFields({
      name: completeUser?.name || '',
      email: completeUser?.email || '',
      phone: completeUser?.phone || ''
    });
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateTimeString?: string) => {
    if (!dateTimeString) return 'Never';
    try {
      return new Date(dateTimeString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      hr: 'bg-purple-100 text-purple-800',
      finance: 'bg-green-100 text-green-800',
      employee: 'bg-gray-100 text-gray-800'
    };
    return colors[role as keyof typeof colors] || colors.employee;
  };

  // Helper function to safely get values with fallbacks
  const getValue = (value: any, fallback: string = 'Not specified'): string => {
    if (value === null || value === undefined || value === '') return fallback;
    if (typeof value === 'string' && (value === 'N/A' || value === 'null')) return fallback;
    return value.toString();
  };

  // Use completeUser if available, otherwise fallback to basic user
  const displayUser = completeUser || user;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Password Change Modal */}
      <ChangePasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />
      
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">View and manage your personal information</p>
        </div>
   
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card (Editable Section) */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage src={displayUser.avatar} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(displayUser.name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="text-left">Full Name</Label>
                    <Input
                      id="name"
                      value={editableFields.name}
                      onChange={(e) => setEditableFields(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-left">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editableFields.email}
                      onChange={(e) => setEditableFields(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <CardTitle className="text-xl">{displayUser.name}</CardTitle>
                  <CardDescription className="flex justify-center mt-2">
                    <Badge className={getRoleColor(displayUser.role)}>
                      {displayUser.role.charAt(0).toUpperCase() + displayUser.role.slice(1)}
                    </Badge>
                  </CardDescription>
                </>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              {!isEditing ? (
                <>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{displayUser.email}</span>
                  </div>
                  
                  {displayUser.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{getValue(displayUser.phone)}</span>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <Label htmlFor="phone" className="text-left">Phone Number</Label>
                  <Input
                    id="phone"
                    value={editableFields.phone}
                    onChange={(e) => setEditableFields(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
              )}
              
              {displayUser.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{getValue(displayUser.location)}</span>
                </div>
              )}
              
              {displayUser.department && (
                <div className="flex items-center gap-3 text-sm">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{getValue(displayUser.department)}</span>
                </div>
              )}

              {(displayUser.employee_code || displayUser.employeeId) && (
                <div className="flex items-center gap-3 text-sm">
                  <UserIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">ID: {getValue(displayUser.employee_code || displayUser.employeeId)}</span>
                </div>
              )}

              {/* Password Change Button */}
              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full justify-center"
                  onClick={() => setShowPasswordModal(true)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Information (Read-only) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Employment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Employee ID</label>
                  <p className="text-gray-900">{getValue(displayUser.employee_code || displayUser.employee_id || displayUser.employeeId, 'Not assigned')}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Position</label>
                  <p className="text-gray-900">{getValue(displayUser.position || displayUser.designation)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-gray-900">{getValue(displayUser.department)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Employment Type</label>
                  <p className="text-gray-900">{getValue(displayUser.employment_type)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Manager</label>
                  <p className="text-gray-900">{getValue(displayUser.manager, 'Not assigned')}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Shift</label>
                  <p className="text-gray-900">{getValue(displayUser.shift)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Joining</label>
                  <p className="text-gray-900">{formatDate(displayUser.date_of_join || displayUser.hire_date)}</p>
                </div>
                
                {displayUser.date_of_birth && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="text-gray-900">{formatDate(displayUser.date_of_birth)}</p>
                  </div>
                )}
                
                {displayUser.last_login_at && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Last Login
                    </label>
                    <p className="text-gray-900">
                      {formatDateTime(displayUser.last_login_at)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-3 h-3 rounded-full ${
                      displayUser.is_active !== false ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="text-gray-900">
                      {displayUser.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="text-gray-900">
                    {displayUser.created_at ? formatDate(displayUser.created_at) : 'Not available'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}