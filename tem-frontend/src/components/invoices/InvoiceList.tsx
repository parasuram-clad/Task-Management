import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit,
  Send,
  Download,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
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
import { toast } from 'sonner@2.0.3';

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  project_name?: string;
  issue_date: string;
  due_date: string;
  amount: number;
  tax: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  created_by: string;
  payment_terms: number; // days
}

interface InvoiceListProps {
  user: User;
  navigateTo: (page: string, params?: any) => void;
}

// Mock data
const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoice_number: 'INV-2024-001',
    client_name: 'Acme Corporation',
    project_name: 'Website Redesign',
    issue_date: '2024-11-01',
    due_date: '2024-11-30',
    amount: 45000,
    tax: 8100,
    total_amount: 53100,
    status: 'paid',
    created_by: 'John Doe',
    payment_terms: 30,
  },
  {
    id: '2',
    invoice_number: 'INV-2024-002',
    client_name: 'Tech Solutions Inc',
    project_name: 'Mobile App Development',
    issue_date: '2024-11-10',
    due_date: '2024-12-10',
    amount: 75000,
    tax: 13500,
    total_amount: 88500,
    status: 'sent',
    created_by: 'John Doe',
    payment_terms: 30,
  },
  {
    id: '3',
    invoice_number: 'INV-2024-003',
    client_name: 'Global Enterprises',
    project_name: 'System Integration',
    issue_date: '2024-10-15',
    due_date: '2024-11-14',
    amount: 60000,
    tax: 10800,
    total_amount: 70800,
    status: 'overdue',
    created_by: 'Sarah Johnson',
    payment_terms: 30,
  },
  {
    id: '4',
    invoice_number: 'INV-2024-004',
    client_name: 'StartUp Co',
    issue_date: '2024-11-15',
    due_date: '2024-12-15',
    amount: 30000,
    tax: 5400,
    total_amount: 35400,
    status: 'draft',
    created_by: 'John Doe',
    payment_terms: 30,
  },
];

export function InvoiceList({ user, navigateTo }: InvoiceListProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'draft' && inv.status === 'draft') ||
      (activeTab === 'sent' && ['sent', 'viewed'].includes(inv.status)) ||
      (activeTab === 'paid' && inv.status === 'paid') ||
      (activeTab === 'overdue' && inv.status === 'overdue');
    return matchesSearch && matchesStatus && matchesTab;
  });

  const draftInvoices = invoices.filter(i => i.status === 'draft');
  const sentInvoices = invoices.filter(i => ['sent', 'viewed'].includes(i.status));
  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const overdueInvoices = invoices.filter(i => i.status === 'overdue');

  const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.total_amount, 0);
  const pendingAmount = sentInvoices.reduce((sum, i) => sum + i.total_amount, 0);
  const overdueAmount = overdueInvoices.reduce((sum, i) => sum + i.total_amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const variants: Record<Invoice['status'], { className: string; label: string; icon: any }> = {
      'draft': { className: 'bg-gray-100 text-gray-700', label: 'Draft', icon: FileText },
      'sent': { className: 'bg-blue-100 text-blue-700', label: 'Sent', icon: Send },
      'viewed': { className: 'bg-purple-100 text-purple-700', label: 'Viewed', icon: Eye },
      'partial': { className: 'bg-yellow-100 text-yellow-700', label: 'Partial', icon: Clock },
      'paid': { className: 'bg-green-100 text-green-700', label: 'Paid', icon: CheckCircle2 },
      'overdue': { className: 'bg-red-100 text-red-700', label: 'Overdue', icon: AlertCircle },
      'cancelled': { className: 'bg-gray-100 text-gray-700', label: 'Cancelled', icon: XCircle },
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

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setInvoices(
        invoices.map(i =>
          i.id === invoice.id ? { ...i, status: 'sent' as Invoice['status'] } : i
        )
      );
      toast.success('Invoice sent successfully');
    } catch (error) {
      toast.error('Failed to send invoice');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl mb-2">Invoices</h1>
            <p className="text-muted-foreground">
              Create, manage and track client invoices
            </p>
          </div>
          <Button onClick={() => navigateTo('create-invoice')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-semibold">{formatCurrency(totalRevenue)}</p>
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
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-semibold">{formatCurrency(pendingAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-red-400 to-red-600 rounded-lg">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-xl font-semibold">{formatCurrency(overdueAmount)}</p>
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
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl">{invoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All ({invoices.length})
          </TabsTrigger>
          <TabsTrigger value="draft">
            Draft ({draftInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent ({sentInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            Paid ({paidInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue ({overdueInvoices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>{invoice.client_name}</TableCell>
                      <TableCell>{invoice.project_name || '-'}</TableCell>
                      <TableCell>
                        {new Date(invoice.issue_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(invoice.total_amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigateTo('view-invoice', { id: invoice.id })}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {invoice.status === 'draft' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigateTo('edit-invoice', { id: invoice.id })}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSendInvoice(invoice)}
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Send
                              </Button>
                            </>
                          )}
                          {invoice.status !== 'draft' && (
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredInvoices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No invoices found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
