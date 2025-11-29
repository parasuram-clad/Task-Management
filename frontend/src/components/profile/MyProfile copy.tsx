import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Shield,
  Edit,
  Save,
  Camera,
  Award,
  Clock,
  TrendingUp,
  Lock,
  Key,
  Building,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Separator } from '../ui/separator';

interface MyProfileProps {
  user: User;
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  date_of_birth: string;
  blood_group: string;
}

export function MyProfile({ user }: MyProfileProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user.name,
    email: user.email,
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, San Francisco, CA 94105',
    bio: 'Experienced software developer with a passion for building scalable applications.',
    emergency_contact_name: 'Jane Doe',
    emergency_contact_phone: '+1 (555) 987-6543',
    date_of_birth: '1990-05-15',
    blood_group: 'O+',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Mock statistics
  const stats = {
    projects_completed: 15,
    tasks_completed: 142,
    attendance_rate: 96.5,
    avg_performance: 4.3,
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password changed successfully');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      'admin': { className: 'bg-purple-100 text-purple-700', label: 'Administrator' },
      'manager': { className: 'bg-blue-100 text-blue-700', label: 'Manager' },
      'hr': { className: 'bg-green-100 text-green-700', label: 'HR' },
      'employee': { className: 'bg-gray-100 text-gray-700', label: 'Employee' },
    };

    const variant = variants[role] || variants.employee;

    return (
      <Badge className={variant.className} variant="secondary">
        <Shield className="h-3 w-3 mr-1" />
        {variant.label}
      </Badge>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and account settings
        </p>
      </div>

      {/* Profile Header Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white text-4xl font-semibold">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full border-2 border-background shadow-lg hover:bg-gray-50 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">{user.name}</h2>
                  <div className="flex items-center gap-3 mb-3">
                    {getRoleBadge(user.role)}
                    <Badge variant="outline">ID: {user.employeeId}</Badge>
                  </div>
                </div>
                {!isEditing && activeTab === 'profile' && (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Designation:</span>
                  <span className="font-medium">{user.designation}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-medium">{user.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Joined:</span>
                  <span className="font-medium">Jan 15, 2023</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Projects</p>
                <p className="text-xl font-semibold">{stats.projects_completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tasks Done</p>
                <p className="text-xl font-semibold">{stats.tasks_completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="text-xl font-semibold">{stats.attendance_rate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Performance</p>
                <p className="text-xl font-semibold">{stats.avg_performance}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">
            <UserIcon className="h-4 w-4 mr-2" />
            Personal Information
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <form onSubmit={handleSaveProfile}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({ ...profileData, phone: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={profileData.date_of_birth}
                      onChange={(e) =>
                        setProfileData({ ...profileData, date_of_birth: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="blood_group">Blood Group</Label>
                    <Input
                      id="blood_group"
                      value={profileData.blood_group}
                      onChange={(e) =>
                        setProfileData({ ...profileData, blood_group: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact & Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact & Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={profileData.address}
                      onChange={(e) =>
                        setProfileData({ ...profileData, address: e.target.value })
                      }
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>
                  <Separator />
                  <div>
                    <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                    <Input
                      id="emergency_contact_name"
                      value={profileData.emergency_contact_name}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          emergency_contact_name: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency_contact_phone">
                      Emergency Contact Phone
                    </Label>
                    <Input
                      id="emergency_contact_phone"
                      type="tel"
                      value={profileData.emergency_contact_phone}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          emergency_contact_phone: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Bio */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </CardContent>
              </Card>
            </div>

            {isEditing && (
              <div className="flex gap-3 mt-6">
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <Label htmlFor="current_password">Current Password *</Label>
                  <Input
                    id="current_password"
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        current_password: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="new_password">New Password *</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        new_password: e.target.value,
                      })
                    }
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Password must be at least 8 characters
                  </p>
                </div>
                <div>
                  <Label htmlFor="confirm_password">Confirm New Password *</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirm_password: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  <Key className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
