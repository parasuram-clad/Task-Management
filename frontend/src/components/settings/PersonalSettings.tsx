import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner@2.0.3';
import { User } from '../../App';
import { ApiSettings } from './ApiSettings';

interface PersonalSettingsProps {
  user: User;
}

export function PersonalSettings({ user }: PersonalSettingsProps) {
  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Settings</h1>
        <p className="text-gray-500">Manage your preferences and API configuration</p>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="api">API Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" className="mt-1" />
          </div>
          <Button onClick={handleSave}>Update Password</Button>
        </CardContent>
      </Card>

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
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Task Assignment Notifications</Label>
              <p className="text-sm text-gray-500">Get notified when you're assigned a new task</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Attendance Alerts</Label>
              <p className="text-sm text-gray-500">Get reminded to check-in and check-out</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Leave Approval Notifications</Label>
              <p className="text-sm text-gray-500">Get notified about leave request status</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Summary Email</Label>
              <p className="text-sm text-gray-500">Receive weekly summary of your activities</p>
            </div>
            <Switch />
          </div>
          <Button onClick={handleSave}>Save Preferences</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Time Zone</CardTitle>
          <CardDescription>Set your preferred time zone for timestamps</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Time Zone</Label>
            <Select defaultValue="est">
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="est">Eastern Time (ET)</SelectItem>
                <SelectItem value="cst">Central Time (CT)</SelectItem>
                <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                <SelectItem value="utc">UTC</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave}>Save Time Zone</Button>
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
