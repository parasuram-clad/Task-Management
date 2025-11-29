// components/profile/MyProfile.tsx
import { useState, useEffect } from 'react';
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
  Plus,
  Trash2,
  GraduationCap,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '../ui/separator';
import { profileApi } from '../../services/auth-api';

interface MyProfileProps {
  user: User;
}

// Interface for the profile data from profile API
interface ProfileData {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId: string;
  employeeId: string;
  isSuperAdmin: boolean;
  emailVerified: boolean;
  mfaEnabled: boolean;
  lastLogin: string;
  bio?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  blood_group?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  company: {
    id: string;
    name: string;
    logo: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  };
  employee: {
    id: string;
    designation: string;
    department: string;
    dateOfJoining: string;
  };
  skills: Skill[];
  experience: Experience[];
  education: Education[];
}

interface ProfileStats {
  projects_completed: number;
  tasks_completed: number;
  attendance_rate: number;
  avg_performance: number;
}

interface Experience {
  id: string;
  position: string;
  company: string;
  start_date: string;
  end_date: string | null;
  description: string;
  is_current?: boolean;
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  field_of_study: string;
  start_date: string;
  end_date: string | null;
  grade: string;
  is_current?: boolean;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  years_of_experience: number;
  proficiency: number;
}

// Form interfaces
interface SkillFormData {
  name: string;
  category: string;
  years_of_experience: number;
  proficiency: number;
}

interface ExperienceFormData {
  position: string;
  company: string;
  start_date: string;
  end_date: string;
  description: string;
  is_current: boolean;
}

interface EducationFormData {
  degree: string;
  institution: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  grade: string;
  is_current: boolean;
}

export function MyProfile({ user }: MyProfileProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [showEducationForm, setShowEducationForm] = useState(false);
  
  const [newSkill, setNewSkill] = useState<SkillFormData>({
    name: '',
    category: '',
    years_of_experience: 0,
    proficiency: 3
  });

  const [newExperience, setNewExperience] = useState<ExperienceFormData>({
    position: '',
    company: '',
    start_date: '',
    end_date: '',
    description: '',
    is_current: false
  });

  const [newEducation, setNewEducation] = useState<EducationFormData>({
    degree: '',
    institution: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    grade: '',
    is_current: false
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Helper function to format data or show N/A
  const formatData = (data: any, fallback: string = 'N/A') => {
    if (!data || data === '' || data === null || data === undefined) {
      return fallback;
    }
    return data;
  };

  // Helper function to format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      
      // Use profileApi to get profile data
      const [profileResponse, statsResponse] = await Promise.all([
        profileApi.getProfile(),
        profileApi.getProfileStats()
      ]);
      
      console.log('Profile response:', profileResponse);
      console.log('Stats response:', statsResponse);
      
      setProfileData(profileResponse.data || profileResponse);
      setProfileStats(statsResponse.data || statsResponse);

    } catch (error) {
      console.error('Error loading profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        bio: profileData.bio,
        date_of_birth: profileData.date_of_birth,
        blood_group: profileData.blood_group,
        emergency_contact_name: profileData.emergency_contact_name,
        emergency_contact_phone: profileData.emergency_contact_phone,
      };

      await profileApi.updateProfile(updateData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      loadProfileData(); // Reload to get fresh data
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
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
      // You would call your password change API here
      // await authApi.changePassword(passwordData);
      toast.success('Password changed successfully');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      // You would call your avatar upload API here
      toast.success('Profile picture updated successfully');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Failed to update profile picture');
    }
  };

  // Skill functions
  const handleAddSkill = async () => {
    try {
      await profileApi.addSkill(newSkill);
      toast.success('Skill added successfully');
      setShowSkillForm(false);
      setNewSkill({
        name: '',
        category: '',
        years_of_experience: 0,
        proficiency: 3
      });
      loadProfileData(); // Reload data
    } catch (error: any) {
      console.error('Error adding skill:', error);
      toast.error(error.message || 'Failed to add skill');
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      await profileApi.deleteSkill(skillId);
      toast.success('Skill deleted successfully');
      loadProfileData(); // Reload data
    } catch (error: any) {
      console.error('Error deleting skill:', error);
      toast.error(error.message || 'Failed to delete skill');
    }
  };

  // Experience functions
  const handleAddExperience = async () => {
    try {
      const experienceData = {
        ...newExperience,
        end_date: newExperience.is_current ? null : newExperience.end_date
      };
      await profileApi.addExperience(experienceData);
      toast.success('Experience added successfully');
      setShowExperienceForm(false);
      setNewExperience({
        position: '',
        company: '',
        start_date: '',
        end_date: '',
        description: '',
        is_current: false
      });
      loadProfileData(); // Reload data
    } catch (error: any) {
      console.error('Error adding experience:', error);
      toast.error(error.message || 'Failed to add experience');
    }
  };

  const handleDeleteExperience = async (experienceId: string) => {
    try {
      await profileApi.deleteExperience(experienceId);
      toast.success('Experience deleted successfully');
      loadProfileData(); // Reload data
    } catch (error: any) {
      console.error('Error deleting experience:', error);
      toast.error(error.message || 'Failed to delete experience');
    }
  };

  // Education functions
  const handleAddEducation = async () => {
    try {
      const educationData = {
        ...newEducation,
        end_date: newEducation.is_current ? null : newEducation.end_date
      };
      await profileApi.addEducation(educationData);
      toast.success('Education added successfully');
      setShowEducationForm(false);
      setNewEducation({
        degree: '',
        institution: '',
        field_of_study: '',
        start_date: '',
        end_date: '',
        grade: '',
        is_current: false
      });
      loadProfileData(); // Reload data
    } catch (error: any) {
      console.error('Error adding education:', error);
      toast.error(error.message || 'Failed to add education');
    }
  };

  const handleDeleteEducation = async (educationId: string) => {
    try {
      await profileApi.deleteEducation(educationId);
      toast.success('Education deleted successfully');
      loadProfileData(); // Reload data
    } catch (error: any) {
      console.error('Error deleting education:', error);
      toast.error(error.message || 'Failed to delete education');
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

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load profile data</p>
          <Button onClick={loadProfileData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

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
                {profileData.company?.logo ? (
                  <img 
                    src={profileData.company.logo} 
                    alt={formatData(profileData.name)}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  formatData(profileData.name).split(' ').map(n => n[0]).join('').toUpperCase()
                )}
              </div>
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAvatarUpload(file);
                }}
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-2 bg-white rounded-full border-2 border-background shadow-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Camera className="h-4 w-4" />
              </label>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">{formatData(profileData.name)}</h2>
                  <div className="flex items-center gap-3 mb-3">
                    {getRoleBadge(profileData.role)}
                    <Badge variant="outline">ID: {formatData(profileData.employeeId)}</Badge>
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
                  <span className="font-medium">{formatData(profileData.employee?.designation)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-medium">{formatData(profileData.employee?.department)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{formatData(profileData.email)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Joined:</span>
                  <span className="font-medium">
                    {formatDate(profileData.employee?.dateOfJoining)}
                  </span>
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
                <p className="text-xl font-semibold">
                  {profileStats ? formatData(profileStats.projects_completed, '0') : 'N/A'}
                </p>
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
                <p className="text-xl font-semibold">
                  {profileStats ? formatData(profileStats.tasks_completed, '0') : 'N/A'}
                </p>
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
                <p className="text-xl font-semibold">
                  {profileStats ? `${formatData(profileStats.attendance_rate, '0')}%` : 'N/A'}
                </p>
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
                <p className="text-xl font-semibold">
                  {profileStats ? `${formatData(profileStats.avg_performance, '0')}/5` : 'N/A'}
                </p>
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
          <TabsTrigger value="professional">
            <Briefcase className="h-4 w-4 mr-2" />
            Professional
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
                      value={formatData(profileData.name)}
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
                      value={formatData(profileData.email)}
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
                      value={formatData(profileData.phone)}
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
                      value={formatData(profileData.date_of_birth)}
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
                      value={formatData(profileData.blood_group)}
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
                      value={formatData(profileData.address)}
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
                      value={formatData(profileData.emergency_contact_name)}
                      onChange={(e) =>
                        setProfileData({ ...profileData, emergency_contact_name: e.target.value })
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
                      value={formatData(profileData.emergency_contact_phone)}
                      onChange={(e) =>
                        setProfileData({ ...profileData, emergency_contact_phone: e.target.value })
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
                    value={formatData(profileData.bio)}
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
                  onClick={() => {
                    setIsEditing(false);
                    loadProfileData(); // Reload original data
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </TabsContent>

        {/* Professional Tab */}
        <TabsContent value="professional" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Skills</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowSkillForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showSkillForm && (
                  <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Add New Skill</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowSkillForm(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <Input
                        placeholder="Skill Name"
                        value={newSkill.name}
                        onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                      />
                      <Input
                        placeholder="Category"
                        value={newSkill.category}
                        onChange={(e) => setNewSkill({...newSkill, category: e.target.value})}
                      />
                      <Input
                        type="number"
                        placeholder="Years of Experience"
                        value={newSkill.years_of_experience}
                        onChange={(e) => setNewSkill({...newSkill, years_of_experience: Number(e.target.value)})}
                      />
                      <div>
                        <Label>Proficiency: {newSkill.proficiency}/5</Label>
                        <Input
                          type="range"
                          min="1"
                          max="5"
                          value={newSkill.proficiency}
                          onChange={(e) => setNewSkill({...newSkill, proficiency: Number(e.target.value)})}
                        />
                      </div>
                      <Button onClick={handleAddSkill} size="sm">
                        Add Skill
                      </Button>
                    </div>
                  </div>
                )}

                {profileData.skills.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No skills added yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {profileData.skills.map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{formatData(skill.name)}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatData(skill.category)} • {formatData(skill.years_of_experience, '0')} years
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <div
                                key={star}
                                className={`w-3 h-3 rounded-full ${
                                  star <= (skill.proficiency || 0) ? 'bg-yellow-400' : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeleteSkill(skill.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Employment History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Employment History</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowExperienceForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showExperienceForm && (
                  <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Add New Experience</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowExperienceForm(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <Input
                        placeholder="Position"
                        value={newExperience.position}
                        onChange={(e) => setNewExperience({...newExperience, position: e.target.value})}
                      />
                      <Input
                        placeholder="Company"
                        value={newExperience.company}
                        onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="date"
                          placeholder="Start Date"
                          value={newExperience.start_date}
                          onChange={(e) => setNewExperience({...newExperience, start_date: e.target.value})}
                        />
                        <Input
                          type="date"
                          placeholder="End Date"
                          value={newExperience.end_date}
                          onChange={(e) => setNewExperience({...newExperience, end_date: e.target.value})}
                          disabled={newExperience.is_current}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="current-job"
                          checked={newExperience.is_current}
                          onChange={(e) => setNewExperience({...newExperience, is_current: e.target.checked})}
                        />
                        <Label htmlFor="current-job">I currently work here</Label>
                      </div>
                      <Textarea
                        placeholder="Description"
                        value={newExperience.description}
                        onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                        rows={2}
                      />
                      <Button onClick={handleAddExperience} size="sm">
                        Add Experience
                      </Button>
                    </div>
                  </div>
                )}

                {profileData.experience.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No employment history added yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profileData.experience.map((job) => (
                      <div key={job.id} className="border-l-2 border-primary pl-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{formatData(job.position)}</div>
                            <div className="text-sm text-muted-foreground">{formatData(job.company)}</div>
                            <div className="text-sm">
                              {formatDate(job.start_date)} -{' '}
                              {job.end_date ? formatDate(job.end_date) : 'Present'}
                            </div>
                            {job.description && (
                              <p className="text-sm mt-1">{formatData(job.description)}</p>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteExperience(job.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Education
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowEducationForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showEducationForm && (
                  <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Add New Education</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowEducationForm(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <Input
                        placeholder="Degree"
                        value={newEducation.degree}
                        onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                      />
                      <Input
                        placeholder="Institution"
                        value={newEducation.institution}
                        onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                      />
                      <Input
                        placeholder="Field of Study"
                        value={newEducation.field_of_study}
                        onChange={(e) => setNewEducation({...newEducation, field_of_study: e.target.value})}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="date"
                          placeholder="Start Date"
                          value={newEducation.start_date}
                          onChange={(e) => setNewEducation({...newEducation, start_date: e.target.value})}
                        />
                        <Input
                          type="date"
                          placeholder="End Date"
                          value={newEducation.end_date}
                          onChange={(e) => setNewEducation({...newEducation, end_date: e.target.value})}
                          disabled={newEducation.is_current}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="current-education"
                          checked={newEducation.is_current}
                          onChange={(e) => setNewEducation({...newEducation, is_current: e.target.checked})}
                        />
                        <Label htmlFor="current-education">I currently study here</Label>
                      </div>
                      <Input
                        placeholder="Grade"
                        value={newEducation.grade}
                        onChange={(e) => setNewEducation({...newEducation, grade: e.target.value})}
                      />
                      <Button onClick={handleAddEducation} size="sm">
                        Add Education
                      </Button>
                    </div>
                  </div>
                )}

                {profileData.education.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No education history added yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profileData.education.map((edu) => (
                      <div key={edu.id} className="border-l-2 border-green-500 pl-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{formatData(edu.degree)}</div>
                            <div className="text-sm text-muted-foreground">{formatData(edu.institution)}</div>
                            <div className="text-sm">
                              {formatDate(edu.start_date)} -{' '}
                              {edu.end_date ? formatDate(edu.end_date) : 'Present'}
                            </div>
                            {edu.grade && (
                              <div className="text-sm">Grade: {formatData(edu.grade)}</div>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteEducation(edu.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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