import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  CreditCard,
  Wallet,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  BarChart3,
  PieChart,
  Download,
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

interface FinanceDashboardProps {
  user: User;
  navigateTo: (page: string) => void;
}

// Mock data
const mockFinancialSummary = {
  total_revenue: 450000,
  total_expenses: 280000,
  net_income: 170000,
  cash_balance: 325000,
  accounts_receivable: 125000,
  accounts_payable: 85000,
  revenue_growth: 12.5,
  expense_growth: 8.3,
};

const mockPendingApprovals = [
  {
    id: '1',
    type: 'payroll',
    title: 'November 2024 Payroll',
    amount: 285000,
    submitted_by: 'Accounts Team',
    submitted_date: '2024-11-18',
    status: 'pending_approval',
  },
  {
    id: '2',
    type: 'expense',
    title: 'Office Equipment Purchase',
    amount: 45000,
    submitted_by: 'John Smith',
    submitted_date: '2024-11-17',
    status: 'pending_approval',
  },
  {
    id: '3',
    type: 'invoice',
    title: 'Client Refund - INV-2024-055',
    amount: 12000,
    submitted_by: 'Sarah Johnson',
    submitted_date: '2024-11-16',
    status: 'pending_approval',
  },
];

const mockRecentTransactions = [
  {
    id: '1',
    date: '2024-11-18',
    description: 'Client Payment - INV-2024-001',
    category: 'Revenue',
    amount: 53100,
    type: 'income',
    status: 'completed',
  },
  {
    id: '2',
    date: '2024-11-18',
    description: 'Payroll Processing - November',
    category: 'Payroll',
    amount: -285000,
    type: 'expense',
    status: 'completed',
  },
  {
    id: '3',
    date: '2024-11-17',
    description: 'Office Rent Payment',
    category: 'Operating Expense',
    amount: -35000,
    type: 'expense',
    status: 'completed',
  },
  {
    id: '4',
    date: '2024-11-17',
    description: 'Software Licenses',
    category: 'IT Expense',
    amount: -15000,
    type: 'expense',
    status: 'completed',
  },
];

const mockOutstandingInvoices = [
  {
    id: '1',
    invoice_number: 'INV-2024-003',
    client: 'Global Enterprises',
    amount: 70800,
    due_date: '2024-11-14',
    days_overdue: 4,
    status: 'overdue',
  },
  {
    id: '2',
    invoice_number: 'INV-2024-002',
    client: 'Tech Solutions Inc',
    amount: 88500,
    due_date: '2024-12-10',
    days_overdue: 0,
    status: 'pending',
  },
];

export function FinanceDashboard({ user, navigateTo }: FinanceDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };

  const profitMargin =
    mockFinancialSummary.total_revenue > 0
      ? ((mockFinancialSummary.net_income / mockFinancialSummary.total_revenue) * 100).toFixed(1)
      : 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl mb-2">Finance Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor financial performance, approvals, and key metrics
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
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(mockFinancialSummary.total_revenue)}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  {mockFinancialSummary.revenue_growth}% vs last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-red-400 to-red-600 rounded-lg">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(mockFinancialSummary.total_expenses)}
                </p>
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  {mockFinancialSummary.expense_growth}% vs last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Income</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(mockFinancialSummary.net_income)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Profit Margin: {profitMargin}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cash Balance</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(mockFinancialSummary.cash_balance)}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  Healthy liquidity
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals Alert */}
      {mockPendingApprovals.length > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-900">
                    {mockPendingApprovals.length} items pending your approval
                  </p>
                  <p className="text-sm text-orange-700">
                    Total value: {formatCurrency(mockPendingApprovals.reduce((sum, item) => sum + item.amount, 0))}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setActiveTab('approvals')}>
                Review Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="approvals">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Approvals ({mockPendingApprovals.length})
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <Receipt className="h-4 w-4 mr-2" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="receivables">
            <FileText className="h-4 w-4 mr-2" />
            Receivables
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financial Position */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Position</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded">
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="font-medium">Accounts Receivable</span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(mockFinancialSummary.accounts_receivable)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded">
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    </div>
                    <span className="font-medium">Accounts Payable</span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(mockFinancialSummary.accounts_payable)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded">
                      <Wallet className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium">Working Capital</span>
                  </div>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(
                      mockFinancialSummary.accounts_receivable -
                        mockFinancialSummary.accounts_payable
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigateTo('payroll-approval')}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve Payroll
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigateTo('invoices')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Invoices
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigateTo('accounting-dashboard')}
                >
                  <PieChart className="h-4 w-4 mr-2" />
                  Accounting Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigateTo('ledger')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  General Ledger
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigateTo('financial-reports')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Financial Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPendingApprovals.map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {approval.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{approval.title}</TableCell>
                      <TableCell>{approval.submitted_by}</TableCell>
                      <TableCell>
                        {new Date(approval.submitted_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(approval.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                          <Button size="sm">Approve</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          transaction.type === 'income'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.amount > 0 ? '+' : ''}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => navigateTo('ledger')}>
                View All Transactions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receivables Tab */}
        <TabsContent value="receivables" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOutstandingInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>{invoice.client}</TableCell>
                      <TableCell>
                        {new Date(invoice.due_date).toLocaleDateString()}
                        {invoice.days_overdue > 0 && (
                          <span className="text-xs text-red-600 ml-2">
                            ({invoice.days_overdue} days overdue)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {invoice.status === 'overdue' ? (
                          <Badge variant="destructive">Overdue</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
