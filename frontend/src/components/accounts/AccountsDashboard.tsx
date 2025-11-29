import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  DollarSign,
  Receipt,
  CreditCard,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  BarChart3,
  Upload,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
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
import { Badge } from '../ui/badge';

interface AccountsDashboardProps {
  user: User;
  navigateTo: (page: string) => void;
}

// Mock data
const mockAccountsSummary = {
  invoices_sent: 42,
  invoices_paid: 35,
  invoices_pending: 7,
  total_billed: 850000,
  total_collected: 675000,
  pending_collection: 175000,
  payroll_processed: 12,
  expenses_recorded: 156,
};

const mockRecentInvoices = [
  {
    id: '1',
    invoice_number: 'INV-2024-005',
    client: 'Acme Corp',
    amount: 45000,
    issue_date: '2024-11-18',
    status: 'sent',
  },
  {
    id: '2',
    invoice_number: 'INV-2024-004',
    client: 'StartUp Co',
    amount: 35400,
    issue_date: '2024-11-15',
    status: 'draft',
  },
  {
    id: '3',
    invoice_number: 'INV-2024-003',
    client: 'Global Enterprises',
    amount: 70800,
    issue_date: '2024-10-15',
    status: 'overdue',
  },
];

const mockPayrollQueue = [
  {
    id: '1',
    month: 'November 2024',
    employees: 125,
    total_amount: 285000,
    status: 'pending_approval',
    initiated_date: '2024-11-18',
  },
  {
    id: '2',
    month: 'October 2024',
    employees: 125,
    total_amount: 278000,
    status: 'approved',
    initiated_date: '2024-10-18',
    approved_date: '2024-10-20',
  },
];

const mockExpenseEntries = [
  {
    id: '1',
    date: '2024-11-18',
    description: 'Office Supplies - Stationery',
    category: 'Operating Expense',
    amount: 2500,
    status: 'recorded',
  },
  {
    id: '2',
    date: '2024-11-17',
    description: 'Software License Renewal',
    category: 'IT Expense',
    amount: 15000,
    status: 'recorded',
  },
  {
    id: '3',
    date: '2024-11-17',
    description: 'Utility Bills - Electricity',
    category: 'Utilities',
    amount: 8500,
    status: 'recorded',
  },
];

export function AccountsDashboard({ user, navigateTo }: AccountsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const collectionRate =
    mockAccountsSummary.total_billed > 0
      ? ((mockAccountsSummary.total_collected / mockAccountsSummary.total_billed) * 100).toFixed(1)
      : 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl mb-2">Accounts Dashboard</h1>
            <p className="text-muted-foreground">
              Manage invoicing, payroll processing, and expense tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Current Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Invoices Sent</p>
                <p className="text-2xl font-semibold">{mockAccountsSummary.invoices_sent}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {mockAccountsSummary.invoices_paid} paid
                </p>
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
                <p className="text-sm text-muted-foreground">Total Collected</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(mockAccountsSummary.total_collected)}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  {collectionRate}% collection rate
                </p>
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
                <p className="text-sm text-muted-foreground">Pending Collection</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(mockAccountsSummary.pending_collection)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {mockAccountsSummary.invoices_pending} invoices
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payroll Processed</p>
                <p className="text-2xl font-semibold">{mockAccountsSummary.payroll_processed}</p>
                <p className="text-xs text-muted-foreground mt-1">This year</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <FileText className="h-4 w-4 mr-2" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="payroll">
            <DollarSign className="h-4 w-4 mr-2" />
            Payroll
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <Receipt className="h-4 w-4 mr-2" />
            Expenses
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigateTo('create-invoice')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Invoice
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigateTo('payroll-processing')}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Process Payroll
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigateTo('record-expense')}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Record Expense
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigateTo('ledger')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Ledger
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigateTo('accounting-dashboard')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Accounting Dashboard
                </Button>
              </CardContent>
            </Card>

            {/* Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle>This Month's Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium">Invoices Created</span>
                  </div>
                  <span className="text-xl font-semibold text-blue-600">12</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="font-medium">Payments Received</span>
                  </div>
                  <span className="text-xl font-semibold text-green-600">8</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="font-medium">Payroll Runs</span>
                  </div>
                  <span className="text-xl font-semibold text-purple-600">1</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded">
                      <Receipt className="h-4 w-4 text-orange-600" />
                    </div>
                    <span className="font-medium">Expenses Recorded</span>
                  </div>
                  <span className="text-xl font-semibold text-orange-600">24</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Invoices</CardTitle>
                <Button onClick={() => navigateTo('create-invoice')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRecentInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>{invoice.client}</TableCell>
                      <TableCell>
                        {new Date(invoice.issue_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {invoice.status === 'paid' && (
                          <Badge variant="default" className="bg-green-100 text-green-700">
                            Paid
                          </Badge>
                        )}
                        {invoice.status === 'sent' && (
                          <Badge variant="secondary">Sent</Badge>
                        )}
                        {invoice.status === 'draft' && (
                          <Badge variant="outline">Draft</Badge>
                        )}
                        {invoice.status === 'overdue' && (
                          <Badge variant="destructive">Overdue</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigateTo('invoices')}
              >
                View All Invoices
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payroll Processing Queue</CardTitle>
                <Button onClick={() => navigateTo('payroll-processing')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Process Payroll
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Initiated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPayrollQueue.map((payroll) => (
                    <TableRow key={payroll.id}>
                      <TableCell className="font-medium">{payroll.month}</TableCell>
                      <TableCell>{payroll.employees}</TableCell>
                      <TableCell>
                        {new Date(payroll.initiated_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {payroll.status === 'pending_approval' && (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending Approval
                          </Badge>
                        )}
                        {payroll.status === 'approved' && (
                          <Badge variant="default" className="bg-green-100 text-green-700">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(payroll.total_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Expense Entries</CardTitle>
                <Button onClick={() => navigateTo('record-expense')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Record Expense
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockExpenseEntries.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-red-100 text-red-600">
                        <ArrowDownRight className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {expense.category} • {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">
                        {formatCurrency(expense.amount)}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {expense.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Expenses
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
