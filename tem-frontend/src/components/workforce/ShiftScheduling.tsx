import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar, Clock, Users, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  type: 'Morning' | 'Evening' | 'Night' | 'Rotational';
  employees: number;
}

interface ShiftAssignment {
  id: string;
  employee: string;
  shift: string;
  date: string;
  status: 'Scheduled' | 'Confirmed' | 'Swap Requested' | 'Completed';
}

const mockShifts: Shift[] = [
  {
    id: 'SHIFT-001',
    name: 'Morning Shift',
    startTime: '06:00',
    endTime: '14:00',
    type: 'Morning',
    employees: 25
  },
  {
    id: 'SHIFT-002',
    name: 'Day Shift',
    startTime: '09:00',
    endTime: '18:00',
    type: 'Morning',
    employees: 45
  },
  {
    id: 'SHIFT-003',
    name: 'Evening Shift',
    startTime: '14:00',
    endTime: '22:00',
    type: 'Evening',
    employees: 20
  },
  {
    id: 'SHIFT-004',
    name: 'Night Shift',
    startTime: '22:00',
    endTime: '06:00',
    type: 'Night',
    employees: 15
  }
];

const mockAssignments: ShiftAssignment[] = [
  {
    id: 'ASSIGN-001',
    employee: 'John Doe',
    shift: 'Morning Shift (06:00 - 14:00)',
    date: '2024-11-25',
    status: 'Confirmed'
  },
  {
    id: 'ASSIGN-002',
    employee: 'John Doe',
    shift: 'Morning Shift (06:00 - 14:00)',
    date: '2024-11-26',
    status: 'Scheduled'
  },
  {
    id: 'ASSIGN-003',
    employee: 'John Doe',
    shift: 'Day Shift (09:00 - 18:00)',
    date: '2024-11-27',
    status: 'Swap Requested'
  }
];

export function ShiftScheduling() {
  const [shifts] = useState<Shift[]>(mockShifts);
  const [assignments] = useState<ShiftAssignment[]>(mockAssignments);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const getStatusBadge = (status: ShiftAssignment['status']) => {
    const variants = {
      'Scheduled': 'bg-blue-100 text-blue-700',
      'Confirmed': 'bg-green-100 text-green-700',
      'Swap Requested': 'bg-yellow-100 text-yellow-700',
      'Completed': 'bg-gray-100 text-gray-700'
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const getShiftTypeBadge = (type: Shift['type']) => {
    const variants = {
      'Morning': 'bg-yellow-100 text-yellow-700',
      'Evening': 'bg-orange-100 text-orange-700',
      'Night': 'bg-purple-100 text-purple-700',
      'Rotational': 'bg-blue-100 text-blue-700'
    };
    return <Badge className={variants[type]}>{type}</Badge>
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl mb-2">Shift & Scheduling</h1>
          <p className="text-muted-foreground">Manage employee shift schedules and rosters</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Request Swap
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Shift
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Shift</DialogTitle>
                <DialogDescription>Define a new shift type</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="shiftName">Shift Name</Label>
                  <input
                    id="shiftName"
                    className="w-full px-3 py-2 border rounded-md mt-1"
                    placeholder="e.g., Morning Shift"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <input
                      id="startTime"
                      type="time"
                      className="w-full px-3 py-2 border rounded-md mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <input
                      id="endTime"
                      type="time"
                      className="w-full px-3 py-2 border rounded-md mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="shiftType">Shift Type</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                      <SelectItem value="rotational">Rotational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast.success('Shift created successfully');
                  setShowCreateDialog(false);
                }}>
                  Create Shift
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Shifts</CardDescription>
            <CardTitle className="text-3xl">{shifts.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-1" />
              Active shift types
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Employees</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {shifts.reduce((sum, s) => sum + s.employees, 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="w-4 h-4 mr-1" />
              Scheduled
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Upcoming Shifts</CardDescription>
            <CardTitle className="text-3xl text-green-600">{assignments.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-1" />
              This week
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Swap Requests</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {assignments.filter(a => a.status === 'Swap Requested').length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <RefreshCw className="w-4 h-4 mr-1" />
              Pending
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="my-schedule">
        <TabsList>
          <TabsTrigger value="my-schedule">My Schedule</TabsTrigger>
          <TabsTrigger value="shifts">Shift Types</TabsTrigger>
          <TabsTrigger value="roster">Team Roster</TabsTrigger>
        </TabsList>

        <TabsContent value="my-schedule" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Shifts</CardTitle>
              <CardDescription>Your scheduled shifts for the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{assignment.shift}</h4>
                        {getStatusBadge(assignment.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(assignment.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {assignment.status === 'Scheduled' && (
                        <Button size="sm" variant="outline">Request Swap</Button>
                      )}
                      {assignment.status === 'Swap Requested' && (
                        <Button size="sm" variant="outline">Cancel Request</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Calendar View */}
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>Weekly shift calendar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-center">
                    <div className="font-semibold text-sm mb-2">{day}</div>
                    <div className="border rounded-lg p-3 min-h-[100px] bg-muted/30">
                      <div className="text-xs space-y-1">
                        <div className="bg-yellow-100 text-yellow-700 rounded px-2 py-1">06:00-14:00</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shifts" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shifts.map((shift) => (
              <Card key={shift.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{shift.name}</CardTitle>
                      <CardDescription>
                        {shift.startTime} - {shift.endTime}
                      </CardDescription>
                    </div>
                    {getShiftTypeBadge(shift.type)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-1" />
                      {shift.employees} employees assigned
                    </div>
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roster" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Roster</CardTitle>
              <CardDescription>Shift assignments for all team members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Employee</th>
                      <th className="text-left p-3">Mon</th>
                      <th className="text-left p-3">Tue</th>
                      <th className="text-left p-3">Wed</th>
                      <th className="text-left p-3">Thu</th>
                      <th className="text-left p-3">Fri</th>
                      <th className="text-left p-3">Sat</th>
                      <th className="text-left p-3">Sun</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['John Doe', 'Jane Smith', 'Mike Johnson'].map((emp) => (
                      <tr key={emp} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{emp}</td>
                        {[...Array(7)].map((_, i) => (
                          <td key={i} className="p-3">
                            <div className="text-xs bg-yellow-100 text-yellow-700 rounded px-2 py-1">
                              M (06-14)
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
