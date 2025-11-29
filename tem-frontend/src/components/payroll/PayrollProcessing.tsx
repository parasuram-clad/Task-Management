import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Play,
  Users,
  DollarSign,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  Send,
  Eye,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
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
import { toast } from 'sonner@2.0.3';
import { Checkbox } from '../ui/checkbox';

interface PayrollCycle {
  id: string;
  month: string;
  year: number;
  period_start: string;
  period_end: string;
  total_employees: number;
  total_amount: number;
  status: 'draft' | 'initiated' | 'pending_approval' | 'approved' | 'processed';
  created_date: string;
  initiated_by?: string;
  initiated_date?: string;
}

interface EmployeePayroll {
  id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  designation: string;
  basic_salary: number;
  gross_salary: number;
  deductions: number;
  net_salary: number;
  working_days: number;
  present_days: number;
  leaves_taken: number;
  is_selected: boolean;
}

interface PayrollProcessingProps {
  user: User;
  navigateTo: (page: string, params?: any) => void;
}

// Mock data
const mockPayrollCycles: PayrollCycle[] = [
  {
    id: '1',
    month: 'November',
    year: 2024,
    period_start: '2024-11-01',
    period_end: '2024-11-30',
    total_employees: 145,
    total_amount: 10875000,
    status: 'draft',
    created_date: '2024-11-25',
  },
  {
    id: '2',
    month: 'October',
    year: 2024,
    period_start: '2024-10-01',
    period_end: '2024-10-31',
    total_employees: 145,
    total_amount: 10650000,
    status: 'processed',
    created_date: '2024-10-25',
    initiated_by: 'Finance Team',
    initiated_date: '2024-10-28',
  },
];

const mockEmployeePayroll: EmployeePayroll[] = [
  {
    id: '1',
    employee_id: 'EMP001',
    employee_name: 'John Doe',
    department: 'Engineering',
    designation: 'Senior Developer',
    basic_salary: 50000,
    gross_salary: 85000,
    deductions: 15200,
    net_salary: 69800,
    working_days: 22,
    present_days: 22,
    leaves_taken: 0,
    is_selected: true,
  },
  {
    id: '2',
    employee_id: 'EMP002',
    employee_name: 'Sarah Johnson',
    department: 'Engineering',
    designation: 'Tech Lead',
    basic_salary: 70000,
    gross_salary: 120000,
    deductions: 22000,
    net_salary: 98000,
    working_days: 22,
    present_days: 22,
    leaves_taken: 0,
    is_selected: true,
  },
  {
    id: '3',
    employee_id: 'EMP003',
    employee_name: 'Mike Chen',
    department: 'Engineering',
    designation: 'Frontend Developer',
    basic_salary: 45000,
    gross_salary: 75000,
    deductions: 13500,
    net_salary: 61500,
    working_days: 22,
    present_days: 20,
    leaves_taken: 2,
    is_selected: true,
  },
  {
    id: '4',
    employee_id: 'EMP004',
    employee_name: 'Emily Davis',
    department: 'Design',
    designation: 'UX Designer',
    basic_salary: 48000,
    gross_salary: 80000,
    deductions: 14400,
    net_salary: 65600,
    working_days: 22,
    present_days: 21,
    leaves_taken: 1,
    is_selected: true,
  },
];

export function PayrollProcessing({ user, navigateTo }: PayrollProcessingProps) {
  const [activeTab, setActiveTab] = useState('cycles');
  const [payrollCycles, setPayrollCycles] = useState<PayrollCycle[]>(mockPayrollCycles);
  const [employees, setEmployees] = useState<EmployeePayroll[]>(mockEmployeePayroll);
  const [selectedCycle, setSelectedCycle] = useState<PayrollCycle | null>(null);
  const [showInitiateDialog, setShowInitiateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');

  const [initiateData, setInitiateData] = useState({
    month: '',
    year: new Date().getFullYear(),
    period_start: '',
    period_end: '',
  });

  const draftCycles = payrollCycles.filter(c => c.status === 'draft');
  const activeCycles = payrollCycles.filter(
    c => c.status === 'initiated' || c.status === 'pending_approval'
  );
  const completedCycles = payrollCycles.filter(
    c => c.status === 'approved' || c.status === 'processed'
  );

  const selectedEmployees = employees.filter(e => e.is_selected);
  const totalPayrollAmount = selectedEmployees.reduce((sum, e) => sum + e.net_salary, 0);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDepartment === 'all' || emp.department === filterDepartment;
    return matchesSearch && matchesDept;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: PayrollCycle['status']) => {
    const variants: Record<PayrollCycle['status'], { className: string; label: string; icon: any }> = {
      'draft': { className: 'bg-gray-100 text-gray-700', label: 'Draft', icon: FileText },
      'initiated': { className: 'bg-blue-100 text-blue-700', label: 'Initiated', icon: Play },
      'pending_approval': { className: 'bg-yellow-100 text-yellow-700', label: 'Pending Approval', icon: Clock },
      'approved': { className: 'bg-green-100 text-green-700', label: 'Approved', icon: CheckCircle2 },
      'processed': { className: 'bg-purple-100 text-purple-700', label: 'Processed', icon: CheckCircle2 },
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

  const handleInitiateCycle = () => {
    setInitiateData({
      month: '',
      year: new Date().getFullYear(),
      period_start: '',
      period_end: '',
    });
    setShowInitiateDialog(true);
  };

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newCycle: PayrollCycle = {
        id: `cycle-${Date.now()}`,
        month: initiateData.month,
        year: initiateData.year,
        period_start: initiateData.period_start,
        period_end: initiateData.period_end,
        total_employees: employees.length,
        total_amount: totalPayrollAmount,
        status: 'draft',
        created_date: new Date().toISOString().split('T')[0],
      };

      setPayrollCycles([newCycle, ...payrollCycles]);
      toast.success('Payroll cycle created successfully');
      setShowInitiateDialog(false);
    } catch (error) {
      toast.error('Failed to create payroll cycle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInitiatePayroll = async (cycle: PayrollCycle) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      setPayrollCycles(
        payrollCycles.map(c =>
          c.id === cycle.id
            ? {
                ...c,
                status: 'pending_approval',
                initiated_by: user.name,
                initiated_date: new Date().toISOString().split('T')[0],
              }
            : c
        )
      );

      toast.success('Payroll initiated and sent for approval');
    } catch (error) {
      toast.error('Failed to initiate payroll');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    setEmployees(
      employees.map(e => (e.id === employeeId ? { ...e, is_selected: !e.is_selected } : e))
    );
  };

  const toggleSelectAll = () => {
    const allSelected = employees.every(e => e.is_selected);
    setEmployees(employees.map(e => ({ ...e, is_selected: !allSelected })));
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl mb-2">Payroll Processing</h1>
            <p className="text-muted-foreground">
              Initiate and process monthly payroll cycles
            </p>
          </div>
          <Button onClick={handleInitiateCycle}>
            <Play className="h-4 w-4 mr-2" />
            Create Payroll Cycle
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Draft Cycles</p>
                <p className="text-2xl">{draftCycles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Cycles</p>
                <p className="text-2xl">{activeCycles.length}</p>
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
                <p className="text-2xl">{completedCycles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employees</p>
                <p className="text-2xl">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="cycles">
            <Calendar className="h-4 w-4 mr-2" />
            Payroll Cycles
          </TabsTrigger>
          <TabsTrigger value="employees">
            <Users className="h-4 w-4 mr-2" />
            Employee Payroll
          </TabsTrigger>
        </TabsList>

        {/* Cycles Tab */}
        <TabsContent value="cycles" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Payroll Cycles</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Initiated By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollCycles.map((cycle) => (
                    <TableRow key={cycle.id}>
                      <TableCell className="font-medium">
                        {cycle.month} {cycle.year}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(cycle.period_start).toLocaleDateString()} -{' '}
                          {new Date(cycle.period_end).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{cycle.total_employees}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(cycle.total_amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(cycle.status)}</TableCell>
                      <TableCell>
                        {cycle.initiated_by ? (
                          <div>
                            <p className="text-sm">{cycle.initiated_by}</p>
                            <p className="text-xs text-muted-foreground">
                              {cycle.initiated_date && new Date(cycle.initiated_date).toLocaleDateString()}
                            </p>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCycle(cycle);
                              setShowDetailsDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {cycle.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => handleInitiatePayroll(cycle)}
                              disabled={isSubmitting}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Initiate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees" className="mt-6">
          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
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

          {/* Summary Card */}
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Selected Employees</p>
                    <p className="text-2xl font-semibold">{selectedEmployees.length}</p>
                  </div>
                  <div className="h-12 w-px bg-border"></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Payroll Amount</p>
                    <p className="text-2xl font-semibold text-primary">
                      {formatCurrency(totalPayrollAmount)}
                    </p>
                  </div>
                </div>
                <Button onClick={toggleSelectAll} variant="outline">
                  {employees.every(e => e.is_selected) ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employee Payroll Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={employees.every(e => e.is_selected)}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Gross Salary</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <Checkbox
                          checked={emp.is_selected}
                          onCheckedChange={() => toggleEmployeeSelection(emp.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{emp.employee_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {emp.employee_id} • {emp.designation}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>
                            {emp.present_days}/{emp.working_days} days
                          </p>
                          {emp.leaves_taken > 0 && (
                            <p className="text-orange-600">{emp.leaves_taken} leave(s)</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(emp.gross_salary)}</TableCell>
                      <TableCell className="text-orange-600">
                        -{formatCurrency(emp.deductions)}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(emp.net_salary)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Cycle Dialog */}
      <Dialog open={showInitiateDialog} onOpenChange={setShowInitiateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Payroll Cycle</DialogTitle>
            <DialogDescription>
              Set up a new payroll cycle for processing
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCycle} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="month">Month *</Label>
                <Select
                  value={initiateData.month}
                  onValueChange={(value) =>
                    setInitiateData({ ...initiateData, month: value })
                  }
                >
                  <SelectTrigger id="month">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'].map(
                      (month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={initiateData.year}
                  onChange={(e) =>
                    setInitiateData({ ...initiateData, year: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="period_start">Period Start *</Label>
                <Input
                  id="period_start"
                  type="date"
                  value={initiateData.period_start}
                  onChange={(e) =>
                    setInitiateData({ ...initiateData, period_start: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="period_end">Period End *</Label>
                <Input
                  id="period_end"
                  type="date"
                  value={initiateData.period_end}
                  onChange={(e) =>
                    setInitiateData({ ...initiateData, period_end: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Payroll Information</p>
                  <p>Total Employees: {employees.length}</p>
                  <p>Estimated Amount: {formatCurrency(totalPayrollAmount)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Cycle'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowInitiateDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Payroll Cycle Details - {selectedCycle?.month} {selectedCycle?.year}
            </DialogTitle>
          </DialogHeader>

          {selectedCycle && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Period</p>
                  <p className="font-medium">
                    {new Date(selectedCycle.period_start).toLocaleDateString()} -{' '}
                    {new Date(selectedCycle.period_end).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedCycle.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                  <p className="font-medium">{selectedCycle.total_employees}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-medium">{formatCurrency(selectedCycle.total_amount)}</p>
                </div>
              </div>

              <Button onClick={() => setShowDetailsDialog(false)} className="w-full">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
