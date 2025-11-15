import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner@2.0.3';
import { User } from '../../App';
import { useState, useEffect } from 'react';
import { settingsApi, PersonalSettings, ChangePasswordRequest } from '../../services/api';
import {ApiSettings} from './ApiSettings';

interface PersonalSettingsProps {
  user: User;
}

export function PersonalSettings({ user }: PersonalSettingsProps) {
  const [settings, setSettings] = useState<PersonalSettings>({
    timeZone: 'Asia/Kolkata',
    timesheetNotifications: true,
    taskNotifications: true,
    attendanceAlerts: true,
    leaveNotifications: true,
    weeklySummaryEmail: false
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsApi.getPersonalSettings();
      setSettings(response);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await settingsApi.updatePersonalSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await settingsApi.changePassword(passwordData as ChangePasswordRequest);
      toast.success('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Failed to change password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchChange = (key: keyof PersonalSettings) => (checked: boolean) => {
    setSettings(prev => ({ ...prev, [key]: checked }));
  };

  const handlePasswordChange = (key: keyof typeof passwordData) => (value: string) => {
    setPasswordData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
         <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-gray-500">Manage your preferences and API configuration</p>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="api">API Configuration</TabsTrigger>
        </TabsList>

      <TabsContent value="personal" className="space-y-6">
          {/* Change Password Card */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input 
                  id="current-password" 
                  type="password" 
                  className="mt-1" 
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword')(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  className="mt-1" 
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword')(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  className="mt-1" 
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword')(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleChangePassword} 
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </CardContent>
          </Card>

          {/* Notification Preferences Card */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Timesheet Approval Notifications</Label>
                  <p className="text-sm text-gray-500">Get notified when your timesheet is approved or rejected</p>
                </div>
                <Switch 
                  checked={settings.timesheetNotifications}
                  onCheckedChange={handleSwitchChange('timesheetNotifications')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Task Assignment Notifications</Label>
                  <p className="text-sm text-gray-500">Get notified when you're assigned a new task</p>
                </div>
                <Switch 
                  checked={settings.taskNotifications}
                  onCheckedChange={handleSwitchChange('taskNotifications')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Attendance Alerts</Label>
                  <p className="text-sm text-gray-500">Get reminded to check-in and check-out</p>
                </div>
                <Switch 
                  checked={settings.attendanceAlerts}
                  onCheckedChange={handleSwitchChange('attendanceAlerts')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Leave Approval Notifications</Label>
                  <p className="text-sm text-gray-500">Get notified about leave request status</p>
                </div>
                <Switch 
                  checked={settings.leaveNotifications}
                  onCheckedChange={handleSwitchChange('leaveNotifications')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Summary Email</Label>
                  <p className="text-sm text-gray-500">Receive weekly summary of your activities</p>
                </div>
                <Switch 
                  checked={settings.weeklySummaryEmail}
                  onCheckedChange={handleSwitchChange('weeklySummaryEmail')}
                />
              </div>
              <Button 
                onClick={handleSaveSettings} 
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>

          {/* Time Zone Card */}
          <Card>
            <CardHeader>
              <CardTitle>Time Zone</CardTitle>
              <CardDescription>Set your preferred time zone for timestamps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Time Zone</Label>
                <Select 
                  value={settings.timeZone} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, timeZone: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">Indian Standard Time (IST)</SelectItem>
                    <SelectItem value="UTC">Coordinated Universal Time (UTC)</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                    <SelectItem value="Asia/Dubai">Gulf Standard Time (GST)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Japan Standard Time (JST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleSaveSettings} 
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Time Zone'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <ApiSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
