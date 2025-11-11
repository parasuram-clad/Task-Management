import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner@2.0.3';
import { User } from '../../App';

interface CompanySettingsProps {
  user: User;
}

export function CompanySettings({ user }: CompanySettingsProps) {
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [showHolidayDialog, setShowHolidayDialog] = useState(false);

  // Mock locations
  const locations = [
    { id: '1', name: 'New York Office', city: 'New York', country: 'USA', timezone: 'EST' },
    { id: '2', name: 'San Francisco Office', city: 'San Francisco', country: 'USA', timezone: 'PST' },
    { id: '3', name: 'Boston Office', city: 'Boston', country: 'USA', timezone: 'EST' },
  ];

  // Mock holidays
  const holidays = [
    { id: '1', name: 'New Year\'s Day', date: '2024-01-01' },
    { id: '2', name: 'Independence Day', date: '2024-07-04' },
    { id: '3', name: 'Thanksgiving', date: '2024-11-28' },
    { id: '4', name: 'Christmas', date: '2024-12-25' },
  ];

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  if (user.role !== 'admin') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">You don't have permission to access company settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Company Settings</h1>
        <p className="text-gray-500">Configure company-wide settings and policies</p>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList>
          <TabsTrigger value="company">Company Profile</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="attendance">Attendance Rules</TabsTrigger>
          <TabsTrigger value="timesheet">Timesheet Settings</TabsTrigger>
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Basic company details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Company Name</Label>
                <Input defaultValue="Acme Corporation" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Country</Label>
                  <Select defaultValue="usa">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usa">United States</SelectItem>
                      <SelectItem value="canada">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Default Time Zone</Label>
                  <Select defaultValue="est">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="est">Eastern Time (ET)</SelectItem>
                      <SelectItem value="cst">Central Time (CT)</SelectItem>
                      <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Work Week</Label>
                  <Select defaultValue="mon-fri">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mon-fri">Monday - Friday</SelectItem>
                      <SelectItem value="mon-sat">Monday - Saturday</SelectItem>
                      <SelectItem value="sun-thu">Sunday - Thursday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Standard Daily Hours</Label>
                  <Input type="number" defaultValue="8" min="1" max="24" className="mt-1" />
                </div>
              </div>
              <Button onClick={handleSave}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Office Locations</CardTitle>
                  <CardDescription>Manage company office locations</CardDescription>
                </div>
                <Button onClick={() => setShowLocationDialog(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Location
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Time Zone</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.map(location => (
                      <TableRow key={location.id}>
                        <TableCell>{location.name}</TableCell>
                        <TableCell>{location.city}</TableCell>
                        <TableCell>{location.country}</TableCell>
                        <TableCell>{location.timezone}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Configuration</CardTitle>
              <CardDescription>Configure attendance rules and shift timings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Default Shift Start</Label>
                  <Input type="time" defaultValue="09:00" className="mt-1" />
                </div>
                <div>
                  <Label>Default Shift End</Label>
                  <Input type="time" defaultValue="18:00" className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Grace Period (minutes)</Label>
                  <Input type="number" defaultValue="15" className="mt-1" />
                  <p className="text-xs text-gray-500 mt-1">Late arrival tolerance</p>
                </div>
                <div>
                  <Label>Half Day Hours</Label>
                  <Input type="number" defaultValue="4" className="mt-1" />
                  <p className="text-xs text-gray-500 mt-1">Minimum hours for half day</p>
                </div>
              </div>
              <div>
                <Label>Weekly Off Days</Label>
                <Select defaultValue="sat-sun">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sat-sun">Saturday & Sunday</SelectItem>
                    <SelectItem value="sun">Sunday Only</SelectItem>
                    <SelectItem value="fri-sat">Friday & Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave}>Save Configuration</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timesheet">
          <Card>
            <CardHeader>
              <CardTitle>Timesheet Configuration</CardTitle>
              <CardDescription>Configure timesheet submission and approval settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Timesheet Period</Label>
                <Select defaultValue="weekly">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Submission Deadline</Label>
                <Select defaultValue="monday">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunday">End of Sunday</SelectItem>
                    <SelectItem value="monday">End of Monday</SelectItem>
                    <SelectItem value="tuesday">End of Tuesday</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">When employees must submit timesheets</p>
              </div>
              <div>
                <Label>Minimum Hours per Week</Label>
                <Input type="number" defaultValue="40" className="mt-1" />
              </div>
              <Button onClick={handleSave}>Save Configuration</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holidays">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Company Holidays</CardTitle>
                  <CardDescription>Manage company-wide holidays</CardDescription>
                </div>
                <Button onClick={() => setShowHolidayDialog(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Holiday
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Holiday Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holidays.map(holiday => (
                      <TableRow key={holiday.id}>
                        <TableCell>{holiday.name}</TableCell>
                        <TableCell>{new Date(holiday.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
            <DialogDescription>Add a new office location</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Location Name</Label>
              <Input placeholder="e.g., London Office" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input placeholder="City" className="mt-1" />
              </div>
              <div>
                <Label>Country</Label>
                <Input placeholder="Country" className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Time Zone</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="est">EST</SelectItem>
                  <SelectItem value="pst">PST</SelectItem>
                  <SelectItem value="gmt">GMT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLocationDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success('Location added successfully');
              setShowLocationDialog(false);
            }}>
              Add Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showHolidayDialog} onOpenChange={setShowHolidayDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Holiday</DialogTitle>
            <DialogDescription>Add a new company holiday</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Holiday Name</Label>
              <Input placeholder="e.g., Memorial Day" className="mt-1" />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHolidayDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success('Holiday added successfully');
              setShowHolidayDialog(false);
            }}>
              Add Holiday
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
