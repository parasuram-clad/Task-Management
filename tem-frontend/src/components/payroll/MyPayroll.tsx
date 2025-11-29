import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  DollarSign,
  Download,
  Eye,
  Calendar,
  TrendingUp,
  CreditCard,
  Receipt,
  FileText,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
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
import { Separator } from '../ui/separator';

interface Payslip {
  id: string;
  month: string;
  year: number;
  payment_date: string;
  gross_salary: number;
  deductions: number;
  net_salary: number;
  status: 'paid' | 'pending' | 'processing';
  earnings: {
    basic_salary: number;
    hra: number;
    special_allowance: number;
    performance_bonus: number;
    other_allowances: number;
  };
  deduction_details: {
    provident_fund: number;
    professional_tax: number;
    income_tax: number;
    insurance: number;
    other_deductions: number;
  };
}

interface MyPayrollProps {
  user: User;
}

// Mock data
const mockPayslips: Payslip[] = [
  {
    id: '1',
    month: 'November',
    year: 2024,
    payment_date: '2024-11-30',
    gross_salary: 85000,
    deductions: 15200,
    net_salary: 69800,
    status: 'paid',
    earnings: {
      basic_salary: 50000,
      hra: 20000,
      special_allowance: 10000,
      performance_bonus: 5000,
      other_allowances: 0,
    },
    deduction_details: {
      provident_fund: 6000,
      professional_tax: 200,
      income_tax: 8000,
      insurance: 1000,
      other_deductions: 0,
    },
  },
  {
    id: '2',
    month: 'October',
    year: 2024,
    payment_date: '2024-10-31',
    gross_salary: 80000,
    deductions: 14200,
    net_salary: 65800,
    status: 'paid',
    earnings: {
      basic_salary: 50000,
      hra: 20000,
      special_allowance: 10000,
      performance_bonus: 0,
      other_allowances: 0,
    },
    deduction_details: {
      provident_fund: 6000,
      professional_tax: 200,
      income_tax: 7000,
      insurance: 1000,
      other_deductions: 0,
    },
  },
  {
    id: '3',
    month: 'September',
    year: 2024,
    payment_date: '2024-09-30',
    gross_salary: 80000,
    deductions: 14200,
    net_salary: 65800,
    status: 'paid',
    earnings: {
      basic_salary: 50000,
      hra: 20000,
      special_allowance: 10000,
      performance_bonus: 0,
      other_allowances: 0,
    },
    deduction_details: {
      provident_fund: 6000,
      professional_tax: 200,
      income_tax: 7000,
      insurance: 1000,
      other_deductions: 0,
    },
  },
];

export function MyPayroll({ user }: MyPayrollProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [showPayslipDialog, setShowPayslipDialog] = useState(false);

  const latestPayslip = mockPayslips[0];
  const ytdGross = mockPayslips.reduce((sum, p) => sum + p.gross_salary, 0);
  const ytdDeductions = mockPayslips.reduce((sum, p) => sum + p.deductions, 0);
  const ytdNet = mockPayslips.reduce((sum, p) => sum + p.net_salary, 0);

  const getStatusBadge = (status: Payslip['status']) => {
    const variants: Record<Payslip['status'], { className: string; label: string }> = {
      'paid': { className: 'bg-green-100 text-green-700', label: 'Paid' },
      'pending': { className: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
      'processing': { className: 'bg-blue-100 text-blue-700', label: 'Processing' },
    };

    const variant = variants[status];

    return (
      <Badge className={variant.className} variant="secondary">
        {variant.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleViewPayslip = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
    setShowPayslipDialog(true);
  };

  const handleDownloadPayslip = (payslip: Payslip) => {
    // Mock download
    console.log('Downloading payslip:', payslip.id);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl mb-2">My Payroll</h1>
        <p className="text-muted-foreground">
          View your salary details, payslips, and tax information
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Month</p>
                <p className="text-2xl">{formatCurrency(latestPayslip.net_salary)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">YTD Gross</p>
                <p className="text-2xl">{formatCurrency(ytdGross)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg">
                <ArrowDownRight className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">YTD Deductions</p>
                <p className="text-2xl">{formatCurrency(ytdDeductions)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">YTD Net Pay</p>
                <p className="text-2xl">{formatCurrency(ytdNet)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <PieChart className="h-4 w-4 mr-2" />
            Salary Breakdown
          </TabsTrigger>
          <TabsTrigger value="payslips">
            <Receipt className="h-4 w-4 mr-2" />
            Payslips
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Month Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Current Month Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Basic Salary</span>
                    <span className="font-medium">
                      {formatCurrency(latestPayslip.earnings.basic_salary)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">HRA</span>
                    <span className="font-medium">
                      {formatCurrency(latestPayslip.earnings.hra)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Special Allowance</span>
                    <span className="font-medium">
                      {formatCurrency(latestPayslip.earnings.special_allowance)}
                    </span>
                  </div>
                  <Separator />
                  {latestPayslip.earnings.performance_bonus > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          Performance Bonus
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Bonus
                          </Badge>
                        </span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(latestPayslip.earnings.performance_bonus)}
                        </span>
                      </div>
                      <Separator />
                    </>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t-2">
                    <span className="font-semibold">Gross Salary</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(latestPayslip.gross_salary)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deductions */}
            <Card>
              <CardHeader>
                <CardTitle>Current Month Deductions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Provident Fund (PF)</span>
                    <span className="font-medium text-orange-600">
                      -{formatCurrency(latestPayslip.deduction_details.provident_fund)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Professional Tax</span>
                    <span className="font-medium text-orange-600">
                      -{formatCurrency(latestPayslip.deduction_details.professional_tax)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Income Tax (TDS)</span>
                    <span className="font-medium text-orange-600">
                      -{formatCurrency(latestPayslip.deduction_details.income_tax)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Insurance</span>
                    <span className="font-medium text-orange-600">
                      -{formatCurrency(latestPayslip.deduction_details.insurance)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between pt-3 border-t-2">
                    <span className="font-semibold">Total Deductions</span>
                    <span className="font-semibold text-orange-600">
                      -{formatCurrency(latestPayslip.deductions)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Net Pay */}
            <Card className="md:col-span-2 border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-primary to-primary/70 rounded-lg">
                      <CheckCircle2 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Net Pay for {latestPayslip.month} {latestPayslip.year}
                      </p>
                      <p className="text-3xl font-bold text-primary">
                        {formatCurrency(latestPayslip.net_salary)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Paid on {new Date(latestPayslip.payment_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => handleViewPayslip(latestPayslip)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Payslip
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payslips Tab */}
        <TabsContent value="payslips" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payslip History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Gross Salary</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPayslips.map((payslip) => (
                    <TableRow key={payslip.id}>
                      <TableCell className="font-medium">
                        {payslip.month} {payslip.year}
                      </TableCell>
                      <TableCell>
                        {new Date(payslip.payment_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{formatCurrency(payslip.gross_salary)}</TableCell>
                      <TableCell className="text-orange-600">
                        -{formatCurrency(payslip.deductions)}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(payslip.net_salary)}
                      </TableCell>
                      <TableCell>{getStatusBadge(payslip.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewPayslip(payslip)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadPayslip(payslip)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payslip Detail Dialog */}
      <Dialog open={showPayslipDialog} onOpenChange={setShowPayslipDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Payslip - {selectedPayslip?.month} {selectedPayslip?.year}
            </DialogTitle>
            <DialogDescription>
              Payment Date: {selectedPayslip && new Date(selectedPayslip.payment_date).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          {selectedPayslip && (
            <div className="space-y-6">
              {/* Employee Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Employee Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employee ID</p>
                  <p className="font-medium">{user.employeeId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{user.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Designation</p>
                  <p className="font-medium">{user.designation}</p>
                </div>
              </div>

              <Separator />

              {/* Earnings & Deductions */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                    Earnings
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Basic Salary</span>
                      <span>{formatCurrency(selectedPayslip.earnings.basic_salary)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>HRA</span>
                      <span>{formatCurrency(selectedPayslip.earnings.hra)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Special Allowance</span>
                      <span>{formatCurrency(selectedPayslip.earnings.special_allowance)}</span>
                    </div>
                    {selectedPayslip.earnings.performance_bonus > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Performance Bonus</span>
                        <span className="text-green-600">
                          {formatCurrency(selectedPayslip.earnings.performance_bonus)}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Gross Salary</span>
                      <span className="text-green-600">
                        {formatCurrency(selectedPayslip.gross_salary)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ArrowDownRight className="h-4 w-4 text-orange-600" />
                    Deductions
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Provident Fund</span>
                      <span>{formatCurrency(selectedPayslip.deduction_details.provident_fund)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Professional Tax</span>
                      <span>{formatCurrency(selectedPayslip.deduction_details.professional_tax)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Income Tax</span>
                      <span>{formatCurrency(selectedPayslip.deduction_details.income_tax)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Insurance</span>
                      <span>{formatCurrency(selectedPayslip.deduction_details.insurance)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total Deductions</span>
                      <span className="text-orange-600">
                        {formatCurrency(selectedPayslip.deductions)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Net Pay */}
              <div className="p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Net Pay</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(selectedPayslip.net_salary)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => handleDownloadPayslip(selectedPayslip)} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={() => setShowPayslipDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
