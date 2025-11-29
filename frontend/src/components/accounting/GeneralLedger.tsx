import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Search,
  Filter,
  Download,
  Plus,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface LedgerEntry {
  id: string;
  date: string;
  transaction_id: string;
  account_code: string;
  account_name: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  reference?: string;
}

interface GeneralLedgerProps {
  user: User;
  navigateTo: (page: string) => void;
}

// Mock data
const mockLedgerEntries: LedgerEntry[] = [
  {
    id: '1',
    date: '2024-11-18',
    transaction_id: 'TXN-001',
    account_code: '1200',
    account_name: 'Accounts Receivable',
    description: 'Client Payment - INV-2024-001',
    debit: 53100,
    credit: 0,
    balance: 125000,
    reference: 'INV-2024-001',
  },
  {
    id: '2',
    date: '2024-11-18',
    transaction_id: 'TXN-001',
    account_code: '4000',
    account_name: 'Revenue',
    description: 'Client Payment - INV-2024-001',
    debit: 0,
    credit: 53100,
    balance: 425000,
  },
  {
    id: '3',
    date: '2024-11-17',
    transaction_id: 'TXN-002',
    account_code: '5100',
    account_name: 'Rent Expense',
    description: 'Office Rent - November',
    debit: 0,
    credit: 5000,
    balance: 45000,
    reference: 'RENT-NOV',
  },
  {
    id: '4',
    date: '2024-11-17',
    transaction_id: 'TXN-002',
    account_code: '1000',
    account_name: 'Cash',
    description: 'Office Rent - November',
    debit: 5000,
    credit: 0,
    balance: 185000,
  },
  {
    id: '5',
    date: '2024-11-16',
    transaction_id: 'TXN-003',
    account_code: '5200',
    account_name: 'Salaries Expense',
    description: 'Monthly Payroll',
    debit: 0,
    credit: 75000,
    balance: 675000,
    reference: 'PAYROLL-NOV',
  },
  {
    id: '6',
    date: '2024-11-16',
    transaction_id: 'TXN-003',
    account_code: '1000',
    account_name: 'Cash',
    description: 'Monthly Payroll',
    debit: 75000,
    credit: 0,
    balance: 180000,
  },
];

export function GeneralLedger({ user, navigateTo }: GeneralLedgerProps) {
  const [entries, setEntries] = useState<LedgerEntry[]>(mockLedgerEntries);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountFilter, setAccountFilter] = useState('all');
  const [dateRange, setDateRange] = useState('current-month');

  const filteredEntries = entries.filter(entry => {
    const matchesSearch =
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.account_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.transaction_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAccount = accountFilter === 'all' || entry.account_code === accountFilter;
    return matchesSearch && matchesAccount;
  });

  const totalDebit = filteredEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = filteredEntries.reduce((sum, e) => sum + e.credit, 0);
  const netBalance = totalDebit - totalCredit;

  const uniqueAccounts = Array.from(
    new Set(entries.map(e => `${e.account_code}|${e.account_name}`))
  ).map(item => {
    const [code, name] = item.split('|');
    return { code, name };
  });

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
            <h1 className="text-3xl mb-2">General Ledger</h1>
            <p className="text-muted-foreground">
              View all accounting transactions and balances
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigateTo('create-journal-entry')}>
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-lg">
                <ArrowUpRight className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Debits</p>
                <p className="text-xl font-semibold">{formatCurrency(totalDebit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-red-400 to-red-600 rounded-lg">
                <ArrowDownRight className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Credits</p>
                <p className="text-xl font-semibold">{formatCurrency(totalCredit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Balance</p>
                <p className={`text-xl font-semibold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netBalance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger className="w-64">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {uniqueAccounts.map((account) => (
                  <SelectItem key={account.code} value={account.code}>
                    {account.code} - {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Current Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Ledger Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ledger Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {new Date(entry.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    {entry.transaction_id}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{entry.account_name}</p>
                      <p className="text-xs text-muted-foreground">{entry.account_code}</p>
                    </div>
                  </TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell className="text-right">
                    {entry.debit > 0 && (
                      <span className="text-green-600 font-medium">
                        {formatCurrency(entry.debit)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.credit > 0 && (
                      <span className="text-red-600 font-medium">
                        {formatCurrency(entry.credit)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(entry.balance)}
                  </TableCell>
                  <TableCell>
                    {entry.reference && (
                      <Badge variant="outline">{entry.reference}</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totals */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-end gap-12 px-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Total Debits</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(totalDebit)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Total Credits</p>
                <p className="text-lg font-semibold text-red-600">
                  {formatCurrency(totalCredit)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Difference</p>
                <p className={`text-lg font-semibold ${Math.abs(totalDebit - totalCredit) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(totalDebit - totalCredit))}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
