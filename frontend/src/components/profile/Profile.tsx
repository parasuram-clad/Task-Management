import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Calendar, Mail, Phone, MapPin, Building, Clock, Edit, User as UserIcon, Save, X, Lock } from 'lucide-react';
import { authApi, User } from '../../services/api';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Change Password</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-sm font-medium">
              Current Password
            </Label>
            <Input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-medium">
              New Password
            </Label>
            <Input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Password must be at least 8 characters long
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm New Password
            </Label>
            <Input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="min-w-20"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="min-w-20"
            >
              {isLoading ? 'Changing...' : 'Change'}
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
          employee_id: response.employee_code,
          phone: response.phone,
          department: response.department,
          position: response.position,
          manager: response.manager,
          location: response.location,
          date_of_birth: response.date_of_birth,
          date_of_join: response.date_of_join,
          hire_date: response.date_of_join,
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
      admin: 'bg-red-100 text-red-800 border-red-200',
      manager: 'bg-blue-100 text-blue-800 border-blue-200',
      hr: 'bg-purple-100 text-purple-800 border-purple-200',
      finance: 'bg-green-100 text-green-800 border-green-200',
      employee: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[role as keyof typeof colors] || colors.employee;
  };

  const getValue = (value: any, fallback: string = 'Not specified'): string => {
    if (value === null || value === undefined || value === '') return fallback;
    if (typeof value === 'string' && (value === 'N/A' || value === 'null')) return fallback;
    return value.toString();
  };

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
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Password Change Modal */}
      <ChangePasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">View and manage your personal information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Profile Card (Editable Section) */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 shadow-lg border-0">
            <CardHeader className="text-center pb-6 pt-8 relative">
              {/* Edit Button - Positioned at top right */}
              <div className="absolute top-4 right-4">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="h-8 px-2"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="h-8 px-2"
                    >
                      <Save className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="h-8 px-3"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>

              {/* Avatar Section */}
              <div className="flex justify-center mb-6">
                <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                  <AvatarImage src={displayUser.avatar} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {getInitials(displayUser.name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Name and Role Section */}
              {isEditing ? (
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-left text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={editableFields.name}
                      onChange={(e) => setEditableFields(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-left text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={editableFields.email}
                      onChange={(e) => setEditableFields(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                    {displayUser.name}
                  </CardTitle>
                  <CardDescription className="flex justify-center">
                    <Badge 
                      variant="outline" 
                      className={getRoleColor(displayUser.role) + ' font-semibold py-1 px-3'}
                    >
                      {displayUser.role.charAt(0).toUpperCase() + displayUser.role.slice(1)}
                    </Badge>
                  </CardDescription>
                </>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4 pb-6">
              {/* Contact Information */}
              {!isEditing ? (
                <>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <Mail className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <span className="text-gray-700 text-sm font-medium truncate">
                      {displayUser.email}
                    </span>
                  </div>
                  
                  {displayUser.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <Phone className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      <span className="text-gray-700 text-sm font-medium">
                        {getValue(displayUser.phone)}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={editableFields.phone}
                    onChange={(e) => setEditableFields(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                    className="w-full"
                  />
                </div>
              )}
              
              {/* Additional Info */}
              {displayUser.location && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <MapPin className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm font-medium">
                    {getValue(displayUser.location)}
                  </span>
                </div>
              )}
              
              {displayUser.department && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Building className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm font-medium">
                    {getValue(displayUser.department)}
                  </span>
                </div>
              )}

              {(displayUser.employee_code || displayUser.employeeId) && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <UserIcon className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm font-medium">
                    ID: {getValue(displayUser.employee_code || displayUser.employeeId)}
                  </span>
                </div>
              )}

              {/* Password Change Button */}
              <div className="pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  className="w-full justify-center gap-2 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowPasswordModal(true)}
                >
                  <Lock className="w-4 h-4" />
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Information (Read-only) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Employment Information */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Building className="w-5 h-5 text-blue-600" />
                Employment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 block">
                    Employee ID
                  </label>
                  <p className="text-gray-900 font-medium">
                    {getValue(displayUser.employee_code || displayUser.employee_id || displayUser.employeeId, 'Not assigned')}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 block">
                    Position
                  </label>
                  <p className="text-gray-900 font-medium">
                    {getValue(displayUser.position || displayUser.designation)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 block">
                    Department
                  </label>
                  <p className="text-gray-900 font-medium">
                    {getValue(displayUser.department)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 block">
                    Employment Type
                  </label>
                  <p className="text-gray-900 font-medium">
                    {getValue(displayUser.employment_type)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 block">
                    Manager
                  </label>
                  <p className="text-gray-900 font-medium">
                    {getValue(displayUser.manager, 'Not assigned')}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 block">
                    Shift
                  </label>
                  <p className="text-gray-900 font-medium">
                    {getValue(displayUser.shift)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates Information */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Calendar className="w-5 h-5 text-green-600" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 block">
                    Date of Joining
                  </label>
                  <p className="text-gray-900 font-medium">
                    {formatDate(displayUser.date_of_join || displayUser.hire_date)}
                  </p>
                </div>
                
                {displayUser.date_of_birth && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 block">
                      Date of Birth
                    </label>
                    <p className="text-gray-900 font-medium">
                      {formatDate(displayUser.date_of_birth)}
                    </p>
                  </div>
                )}
                
                {displayUser.last_login_at && (
                  <div className="space-y-2 md:col-span-2 lg:col-span-1">
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Last Login
                    </label>
                    <p className="text-gray-900 font-medium">
                      {formatDateTime(displayUser.last_login_at)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${
                    displayUser.is_active !== false ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-gray-900 font-medium">
                      {displayUser.is_active !== false ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                
                <div className="text-center sm:text-right">
                  <p className="text-sm font-medium text-gray-500">Member Since</p>
                  <p className="text-gray-900 font-medium">
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