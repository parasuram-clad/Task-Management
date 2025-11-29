import { useState, useEffect } from 'react';
import { 
  Users2, 
  Plus, 
  Search, 
  Filter,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  Eye,
  Edit
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { User } from '../../App';
import { Lead } from '../../services/leads-api';

interface LeadsListProps {
  user: User;
  navigateTo: (page: string, params?: any) => void;
}

// Mock data
const mockLeads: Lead[] = [
  {
    id: 1,
    company_id: 1,
    name: 'Acme Corp Website Redesign',
    contact_name: 'John Smith',
    contact_email: 'john@acmecorp.com',
    contact_phone: '+1-555-0101',
    source: 'Website',
    status: 'qualified',
    value_amount: 45000,
    owner_id: 1,
    notes: 'Interested in Q1 2024 project',
    created_at: '2024-11-01T10:00:00Z',
    updated_at: '2024-11-15T14:30:00Z',
    owner: { id: 1, name: 'Sarah Johnson', email: 'sarah@company.com' }
  },
  {
    id: 2,
    company_id: 1,
    name: 'TechStart Mobile App',
    contact_name: 'Emily Davis',
    contact_email: 'emily@techstart.io',
    contact_phone: '+1-555-0202',
    source: 'Referral',
    status: 'open',
    value_amount: 75000,
    owner_id: 2,
    notes: 'Initial discussion scheduled',
    created_at: '2024-11-10T09:00:00Z',
    updated_at: '2024-11-16T11:00:00Z',
    owner: { id: 2, name: 'Mike Wilson', email: 'mike@company.com' }
  },
  {
    id: 3,
    company_id: 1,
    name: 'Global Industries ERP Integration',
    contact_name: 'Robert Chen',
    contact_email: 'robert@globalind.com',
    contact_phone: '+1-555-0303',
    source: 'LinkedIn',
    status: 'converted',
    value_amount: 120000,
    owner_id: 1,
    notes: 'Converted to Project #12',
    created_at: '2024-10-15T08:00:00Z',
    updated_at: '2024-11-01T16:00:00Z',
    owner: { id: 1, name: 'Sarah Johnson', email: 'sarah@company.com' }
  },
  {
    id: 4,
    company_id: 1,
    name: 'StartupX Dashboard',
    contact_name: 'Lisa Anderson',
    contact_email: 'lisa@startupx.com',
    source: 'Cold Outreach',
    status: 'lost',
    value_amount: 30000,
    owner_id: 3,
    notes: 'Budget constraints',
    created_at: '2024-10-20T10:00:00Z',
    updated_at: '2024-11-05T09:00:00Z',
    owner: { id: 3, name: 'John Doe', email: 'john@company.com' }
  }
];

export function LeadsList({ user, navigateTo }: LeadsListProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLeads(mockLeads);
      setIsLoading(false);
    }, 800);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'qualified':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'converted':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'lost':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contact_email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const sources = Array.from(new Set(leads.map(l => l.source).filter(Boolean)));

  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground flex items-center gap-2">
            <Users2 className="w-8 h-8 text-primary" />
            Leads Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage sales leads
          </p>
        </div>
        <Button onClick={() => navigateTo('lead-form')}>
          <Plus className="w-4 h-4 mr-2" />
          New Lead
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, contact, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {sources.map(source => (
                  <SelectItem key={source} value={source!}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Leads</CardTitle>
              <CardDescription>
                {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <Users2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-muted-foreground mb-2">No leads found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' || sourceFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first lead'}
              </p>
              {!searchQuery && statusFilter === 'all' && sourceFilter === 'all' && (
                <Button onClick={() => navigateTo('lead-form')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Lead
                </Button>
              )}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map(lead => (
                    <TableRow key={lead.id} className="hover:bg-muted/50">
                      <TableCell>
                        <button
                          onClick={() => navigateTo('lead-detail', { leadId: lead.id })}
                          className="text-left hover:text-primary transition-colors"
                        >
                          <p className="font-medium">{lead.name}</p>
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {lead.contact_name && (
                            <p className="text-sm">{lead.contact_name}</p>
                          )}
                          {lead.contact_email && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {lead.contact_email}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.owner && (
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs">
                                {lead.owner.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{lead.owner.name}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {lead.source || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {lead.value_amount ? (
                          <span className="text-sm flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {lead.value_amount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {new Date(lead.updated_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigateTo('lead-detail', { leadId: lead.id })}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigateTo('lead-edit', { leadId: lead.id })}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}