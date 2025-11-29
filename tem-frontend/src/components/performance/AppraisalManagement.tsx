import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Award,
  Search,
  Plus,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  Eye,
  BarChart3,
  FileText,
  TrendingUp,
  AlertCircle,
  Star,
  Filter,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { toast } from 'sonner@2.0.3';

interface AppraisalCycle {
  id: string;
  name: string;
  period: string;
  type: 'quarterly' | 'half-yearly' | 'annual';
  start_date: string;
  end_date: string;
  deadline: string;
  status: 'draft' | 'active' | 'in-review' | 'completed';
  total_employees: number;
  pending: number;
  submitted: number;
  completed: number;
}

interface EmployeeAppraisal {
  id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  designation: string;
  cycle_id: string;
  self_rating?: number;
  manager_rating?: number;
  final_rating?: number;
  status: 'not-started' | 'self-submitted' | 'under-review' | 'completed';
  self_submitted_date?: string;
  reviewed_date?: string;
  reviewer?: string;
}

interface AppraisalManagementProps {
  user: User;
  navigateTo: (page: string, params?: any) => void;
}

// Mock data
const mockCycles: AppraisalCycle[] = [
  {
    id: '1',
    name: 'Q4 2024',
    period: 'Oct - Dec 2024',
    type: 'quarterly',
    start_date: '2024-10-01',
    end_date: '2024-12-31',
    deadline: '2024-12-31',
    status: 'active',
    total_employees: 45,
    pending: 12,
    submitted: 18,
    completed: 15,
  },
  {
    id: '2',
    name: 'Q3 2024',
    period: 'Jul - Sep 2024',
    type: 'quarterly',
    start_date: '2024-07-01',
    end_date: '2024-09-30',
    deadline: '2024-09-30',
    status: 'completed',
    total_employees: 45,
    pending: 0,
    submitted: 0,
    completed: 45,
  },
  {
    id: '3',
    name: 'H1 2024',
    period: 'Jan - Jun 2024',
    type: 'half-yearly',
    start_date: '2024-01-01',
    end_date: '2024-06-30',
    deadline: '2024-06-30',
    status: 'completed',
    total_employees: 42,
    pending: 0,
    submitted: 0,
    completed: 42,
  },
];

const mockEmployeeAppraisals: EmployeeAppraisal[] = [
  {
    id: '1',
    employee_id: '1',
    employee_name: 'John Doe',
    department: 'Engineering',
    designation: 'Senior Developer',
    cycle_id: '1',
    self_rating: 4.2,
    status: 'self-submitted',
    self_submitted_date: '2024-11-15',
  },
  {
    id: '2',
    employee_id: '2',
    employee_name: 'Sarah Johnson',
    department: 'Engineering',
    designation: 'Tech Lead',
    cycle_id: '1',
    self_rating: 4.5,
    manager_rating: 4.7,
    final_rating: 4.6,
    status: 'completed',
    self_submitted_date: '2024-11-10',
    reviewed_date: '2024-11-16',
    reviewer: 'Mike Chen',
  },
  {
    id: '3',
    employee_id: '3',
    employee_name: 'Mike Chen',
    department: 'Engineering',
    designation: 'Engineering Manager',
    cycle_id: '1',
    status: 'not-started',
  },
  {
    id: '4',
    employee_id: '4',
    employee_name: 'Emily Davis',
    department: 'Design',
    designation: 'UX Designer',
    cycle_id: '1',
    self_rating: 4.0,
    status: 'self-submitted',
    self_submitted_date: '2024-11-12',
  },
  {
    id: '5',
    employee_id: '5',
    employee_name: 'James Wilson',
    department: 'Marketing',
    designation: 'Marketing Manager',
    cycle_id: '1',
    status: 'not-started',
  },
];

export function AppraisalManagement({ user, navigateTo }: AppraisalManagementProps) {
  const [activeTab, setActiveTab] = useState('cycles');
  const [showCreateCycle, setShowCreateCycle] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [selectedCycle, setSelectedCycle] = useState<string>('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newCycle, setNewCycle] = useState({
    name: '',
    type: 'quarterly' as 'quarterly' | 'half-yearly' | 'annual',
    start_date: '',
    end_date: '',
    deadline: '',
  });

  const activeCycle = mockCycles.find(c => c.status === 'active');
  const cycleAppraisals = mockEmployeeAppraisals.filter(a => a.cycle_id === selectedCycle);
  
  const filteredAppraisals = cycleAppraisals.filter(appraisal => {
    const matchesSearch = 
      appraisal.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appraisal.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appraisal.designation.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || appraisal.status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || appraisal.department === filterDepartment;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Appraisal cycle created successfully');
      setShowCreateCycle(false);
      setNewCycle({
        name: '',
        type: 'quarterly',
        start_date: '',
        end_date: '',
        deadline: '',
      });
    } catch (error) {
      toast.error('Failed to create cycle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: EmployeeAppraisal['status']) => {
    const variants: Record<EmployeeAppraisal['status'], { className: string; label: string; icon: any }> = {
      'not-started': { className: 'bg-gray-100 text-gray-700', label: 'Not Started', icon: Clock },
      'self-submitted': { className: 'bg-blue-100 text-blue-700', label: 'Pending Review', icon: AlertCircle },
      'under-review': { className: 'bg-purple-100 text-purple-700', label: 'Under Review', icon: Eye },
      'completed': { className: 'bg-green-100 text-green-700', label: 'Completed', icon: CheckCircle2 },
    };

    const variant = variants[status];
    const Icon = variant.icon;

    return (
      <Badge className={variant.className} variant="secondary">
        <Icon className="h-3 w-3 mr-1" />
        {variant.label}
      </Badge>
    );
  };

  const getCycleStatusBadge = (status: AppraisalCycle['status']) => {
    const variants: Record<AppraisalCycle['status'], { className: string; label: string }> = {
      'draft': { className: 'bg-gray-100 text-gray-700', label: 'Draft' },
      'active': { className: 'bg-green-100 text-green-700', label: 'Active' },
      'in-review': { className: 'bg-purple-100 text-purple-700', label: 'In Review' },
      'completed': { className: 'bg-blue-100 text-blue-700', label: 'Completed' },
    };

    const variant = variants[status];

    return (
      <Badge className={variant.className} variant="secondary">
        {variant.label}
      </Badge>
    );
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl mb-2">Performance Appraisal Management</h1>
            <p className="text-muted-foreground">
              Manage appraisal cycles and employee performance reviews
            </p>
          </div>
          <Button onClick={() => setShowCreateCycle(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Appraisal Cycle
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {activeCycle && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                  <p className="text-2xl">{activeCycle.total_employees}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl">{activeCycle.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Awaiting Review</p>
                  <p className="text-2xl">{activeCycle.submitted}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl">{activeCycle.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="cycles">
            <Calendar className="h-4 w-4 mr-2" />
            Appraisal Cycles
          </TabsTrigger>
          <TabsTrigger value="reviews">
            <Award className="h-4 w-4 mr-2" />
            Employee Reviews
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Cycles Tab */}
        <TabsContent value="cycles" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appraisal Cycles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCycles.map((cycle) => (
                  <Card key={cycle.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Award className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">{cycle.name}</h3>
                            {getCycleStatusBadge(cycle.status)}
                            <Badge variant="outline">
                              {cycle.type === 'quarterly' && 'Quarterly'}
                              {cycle.type === 'half-yearly' && 'Half-Yearly'}
                              {cycle.type === 'annual' && 'Annual'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span>{cycle.period}</span>
                            <span>Deadline: {new Date(cycle.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-2xl font-semibold">{cycle.total_employees}</p>
                            <p className="text-xs text-muted-foreground">Total</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-semibold text-orange-600">{cycle.pending}</p>
                            <p className="text-xs text-muted-foreground">Pending</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-semibold text-purple-600">{cycle.submitted}</p>
                            <p className="text-xs text-muted-foreground">Review</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-semibold text-green-600">{cycle.completed}</p>
                            <p className="text-xs text-muted-foreground">Done</p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedCycle(cycle.id);
                              setActiveTab('reviews');
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="mt-6">
          {/* Filters */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCycle} onValueChange={setSelectedCycle}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockCycles.map((cycle) => (
                  <SelectItem key={cycle.id} value={cycle.id}>
                    {cycle.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="self-submitted">Pending Review</SelectItem>
                <SelectItem value="under-review">Under Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                Employee Reviews ({filteredAppraisals.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Self Rating</TableHead>
                    <TableHead>Manager Rating</TableHead>
                    <TableHead>Final Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppraisals.map((appraisal) => (
                    <TableRow key={appraisal.id}>
                      <TableCell>
                        <div className="font-medium">{appraisal.employee_name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {appraisal.employee_id}
                        </div>
                      </TableCell>
                      <TableCell>{appraisal.department}</TableCell>
                      <TableCell>{appraisal.designation}</TableCell>
                      <TableCell>
                        {appraisal.self_rating ? (
                          getRatingStars(appraisal.self_rating)
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {appraisal.manager_rating ? (
                          getRatingStars(appraisal.manager_rating)
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {appraisal.final_rating ? (
                          getRatingStars(appraisal.final_rating)
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(appraisal.status)}</TableCell>
                      <TableCell className="text-right">
                        {appraisal.status === 'self-submitted' && (
                          <Button
                            size="sm"
                            onClick={() =>
                              navigateTo('review-appraisal', {
                                appraisalId: appraisal.id,
                              })
                            }
                          >
                            <Award className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        )}
                        {appraisal.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigateTo('appraisal-detail', {
                                appraisalId: appraisal.id,
                              })
                            }
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredAppraisals.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">No appraisals found</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { range: '4.5 - 5.0', count: 8, percentage: 18, color: 'bg-green-500' },
                    { range: '4.0 - 4.4', count: 15, percentage: 33, color: 'bg-blue-500' },
                    { range: '3.5 - 3.9', count: 12, percentage: 27, color: 'bg-yellow-500' },
                    { range: '3.0 - 3.4', count: 7, percentage: 16, color: 'bg-orange-500' },
                    { range: '< 3.0', count: 3, percentage: 6, color: 'bg-red-500' },
                  ].map((item) => (
                    <div key={item.range}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{item.range}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${item.color} h-2 rounded-full`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department-wise Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Engineering', avg: 4.3, employees: 20 },
                    { name: 'Design', avg: 4.1, employees: 8 },
                    { name: 'Marketing', avg: 4.0, employees: 10 },
                    { name: 'Sales', avg: 4.2, employees: 7 },
                  ].map((dept) => (
                    <div key={dept.name} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{dept.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {dept.employees} employees
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRatingStars(dept.avg)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Cycle Dialog */}
      <Dialog open={showCreateCycle} onOpenChange={setShowCreateCycle}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Appraisal Cycle</DialogTitle>
            <DialogDescription>
              Set up a new performance appraisal cycle
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCycle} className="space-y-4">
            <div>
              <Label htmlFor="name">Cycle Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Q1 2025"
                value={newCycle.name}
                onChange={(e) => setNewCycle({ ...newCycle, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Cycle Type *</Label>
              <Select
                value={newCycle.type}
                onValueChange={(value: any) =>
                  setNewCycle({ ...newCycle, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="half-yearly">Half-Yearly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={newCycle.start_date}
                  onChange={(e) =>
                    setNewCycle({ ...newCycle, start_date: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={newCycle.end_date}
                  onChange={(e) =>
                    setNewCycle({ ...newCycle, end_date: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="deadline">Submission Deadline *</Label>
              <Input
                id="deadline"
                type="date"
                value={newCycle.deadline}
                onChange={(e) =>
                  setNewCycle({ ...newCycle, deadline: e.target.value })
                }
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Cycle'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateCycle(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
