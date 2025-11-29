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
  Wallet,
  CreditCard,
  Receipt,
  PieChart,
  BarChart3,
  Calendar,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface AccountingDashboardProps {
  user: User;
  navigateTo: (page: string) => void;
}

interface AccountBalance {
  account_type: string;
  balance: number;
  change_percentage: number;
}

// Mock data
const mockAccountBalances: AccountBalance[] = [
  { account_type: 'Assets', balance: 450000, change_percentage: 12.5 },
  { account_type: 'Liabilities', balance: 125000, change_percentage: -3.2 },
  { account_type: 'Equity', balance: 325000, change_percentage: 18.7 },
];

const mockRecentTransactions = [
  {
    id: '1',
    date: '2024-11-18',
    description: 'Client Payment - INV-2024-001',
    account: 'Accounts Receivable',
    debit: 53100,
    credit: 0,
    type: 'income',
  },
  {
    id: '2',
    date: '2024-11-17',
    description: 'Office Rent - November',
    account: 'Rent Expense',
    debit: 0,
    credit: 5000,
    type: 'expense',
  },
  {
    id: '3',
    date: '2024-11-16',
    description: 'Payroll Processing',
    account: 'Salaries Expense',
    debit: 0,
    credit: 75000,
    type: 'expense',
  },
  {
    id: '4',
    date: '2024-11-15',
    description: 'Equipment Purchase',
    account: 'Fixed Assets',
    debit: 12000,
    credit: 0,
    type: 'asset',
  },
];

const monthlyData = {
  revenue: [45000, 52000, 48000, 65000, 72000, 68000, 75000, 82000, 78000, 88000, 95000, 92000],
  expenses: [35000, 38000, 40000, 42000, 45000, 43000, 48000, 52000, 50000, 55000, 58000, 56000],
};

export function AccountingDashboard({ user, navigateTo }: AccountingDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  const totalRevenue = mockRecentTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.debit, 0);

  const totalExpenses = mockRecentTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.credit, 0);

  const netIncome = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl mb-2">Accounting Dashboard</h1>
            <p className="text-muted-foreground">
              Track your financial performance and bookkeeping
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
              <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-semibold">{formatCurrency(totalRevenue)}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  12.5% vs last month
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
                <p className="text-xl font-semibold">{formatCurrency(totalExpenses)}</p>
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  8.3% vs last month
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
                <p className="text-xl font-semibold">{formatCurrency(netIncome)}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  15.2% vs last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg">
                <PieChart className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-xl font-semibold">{profitMargin}%</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  2.1% vs last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {mockAccountBalances.map((account) => (
          <Card key={account.account_type}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{account.account_type}</p>
                  <p className="text-2xl font-semibold">{formatCurrency(account.balance)}</p>
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    account.change_percentage > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {account.change_percentage > 0 ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {Math.abs(account.change_percentage)}%
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigateTo('ledger')}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <Receipt className="h-4 w-4 mr-2" />
            Recent Transactions
          </TabsTrigger>
          <TabsTrigger value="cash-flow">
            <Wallet className="h-4 w-4 mr-2" />
            Cash Flow
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue vs Expenses Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2">
                  {monthlyData.revenue.map((revenue, index) => {
                    const expense = monthlyData.expenses[index];
                    const maxValue = Math.max(...monthlyData.revenue, ...monthlyData.expenses);
                    const revenueHeight = (revenue / maxValue) * 100;
                    const expenseHeight = (expense / maxValue) * 100;

                    return (
                      <div key={index} className="flex-1 flex flex-col gap-1 items-center">
                        <div
                          className="w-full bg-green-500 rounded-t transition-all hover:opacity-80"
                          style={{ height: `${revenueHeight}%` }}
                          title={`Revenue: ${formatCurrency(revenue)}`}
                        ></div>
                        <div
                          className="w-full bg-red-500 rounded-t transition-all hover:opacity-80"
                          style={{ height: `${expenseHeight}%` }}
                          title={`Expenses: ${formatCurrency(expense)}`}
                        ></div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-sm">Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-sm">Expenses</span>
                  </div>
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
                  onClick={() => navigateTo('create-journal-entry')}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Create Journal Entry
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigateTo('record-expense')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Record Expense
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigateTo('ledger')}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  View General Ledger
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigateTo('chart-of-accounts')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Chart of Accounts
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigateTo('financial-reports')}
                >
                  <PieChart className="h-4 w-4 mr-2" />
                  Financial Reports
                </Button>
              </CardContent>
            </Card>
          </div>
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
                            : transaction.type === 'expense'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-blue-100 text-blue-600'
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
                          {transaction.account} • {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {transaction.debit > 0 && (
                        <p className="font-semibold text-green-600">
                          +{formatCurrency(transaction.debit)}
                        </p>
                      )}
                      {transaction.credit > 0 && (
                        <p className="font-semibold text-red-600">
                          -{formatCurrency(transaction.credit)}
                        </p>
                      )}
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

        {/* Cash Flow Tab */}
        <TabsContent value="cash-flow" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Operating Activities</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(145000)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '75%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Investing Activities</span>
                    <span className="font-semibold text-red-600">
                      -{formatCurrency(25000)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: '15%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Financing Activities</span>
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(50000)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '30%' }}></div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Net Cash Flow</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(170000)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
