import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Plus, Search, FileText, CheckCircle, XCircle, Clock, DollarSign, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Requisition {
  id: string;
  jobTitle: string;
  department: string;
  location: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
  positions: number;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  budgetMin: number;
  budgetMax: number;
  requestedBy: string;
  requestedDate: string;
  requiredBy: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'On Hold' | 'Closed';
  approver: string;
  justification: string;
  skills: string[];
  experience: string;
}

const mockRequisitions: Requisition[] = [
  {
    id: 'REQ-2024-001',
    jobTitle: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    employmentType: 'Full-time',
    positions: 2,
    priority: 'High',
    budgetMin: 120000,
    budgetMax: 150000,
    requestedBy: 'John Smith',
    requestedDate: '2024-11-15',
    requiredBy: '2024-12-31',
    status: 'Approved',
    approver: 'Sarah Johnson (CTO)',
    justification: 'Need to expand the product development team for Q1 2025 roadmap',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
    experience: '5+ years'
  },
  {
    id: 'REQ-2024-002',
    jobTitle: 'HR Manager',
    department: 'Human Resources',
    location: 'New York, NY',
    employmentType: 'Full-time',
    positions: 1,
    priority: 'Urgent',
    budgetMin: 90000,
    budgetMax: 110000,
    requestedBy: 'Emily Chen',
    requestedDate: '2024-11-18',
    requiredBy: '2024-12-15',
    status: 'Pending Approval',
    approver: 'Michael Brown (CHRO)',
    justification: 'Current HR Manager resigned, need replacement urgently',
    skills: ['Recruitment', 'Employee Relations', 'HRIS', 'Compliance'],
    experience: '7+ years'
  },
  {
    id: 'REQ-2024-003',
    jobTitle: 'Marketing Intern',
    department: 'Marketing',
    location: 'Remote',
    employmentType: 'Intern',
    positions: 3,
    priority: 'Medium',
    budgetMin: 15000,
    budgetMax: 20000,
    requestedBy: 'David Wilson',
    requestedDate: '2024-11-10',
    requiredBy: '2025-01-15',
    status: 'Approved',
    approver: 'Lisa Anderson (CMO)',
    justification: 'Summer internship program 2025',
    skills: ['Social Media', 'Content Writing', 'Analytics'],
    experience: 'Student/Fresh Graduate'
  },
  {
    id: 'REQ-2024-004',
    jobTitle: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Austin, TX',
    employmentType: 'Full-time',
    positions: 1,
    priority: 'High',
    budgetMin: 110000,
    budgetMax: 140000,
    requestedBy: 'John Smith',
    requestedDate: '2024-11-12',
    requiredBy: '2024-12-20',
    status: 'On Hold',
    approver: 'Sarah Johnson (CTO)',
    justification: 'Infrastructure scaling for new product launch',
    skills: ['Kubernetes', 'Docker', 'AWS', 'CI/CD', 'Terraform'],
    experience: '4+ years'
  },
];

export function RequisitionManagement() {
  const [requisitions, setRequisitions] = useState<Requisition[]>(mockRequisitions);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: '',
    department: '',
    location: '',
    employmentType: 'Full-time' as const,
    positions: 1,
    priority: 'Medium' as const,
    budgetMin: 0,
    budgetMax: 0,
    requiredBy: '',
    justification: '',
    skills: '',
    experience: ''
  });

  const filteredRequisitions = requisitions.filter(req => {
    const matchesSearch = req.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateRequisition = () => {
    const newRequisition: Requisition = {
      id: `REQ-2024-${String(requisitions.length + 1).padStart(3, '0')}`,
      ...formData,
      requestedBy: 'Current User',
      requestedDate: new Date().toISOString().split('T')[0],
      status: 'Draft',
      approver: 'Pending Assignment',
      skills: formData.skills.split(',').map(s => s.trim()),
    };

    setRequisitions([newRequisition, ...requisitions]);
    setShowCreateDialog(false);
    setFormData({
      jobTitle: '',
      department: '',
      location: '',
      employmentType: 'Full-time',
      positions: 1,
      priority: 'Medium',
      budgetMin: 0,
      budgetMax: 0,
      requiredBy: '',
      justification: '',
      skills: '',
      experience: ''
    });
    toast.success('Requisition created successfully');
  };

  const handleApprove = (id: string) => {
    setRequisitions(requisitions.map(req =>
      req.id === id ? { ...req, status: 'Approved' as const } : req
    ));
    toast.success('Requisition approved');
  };

  const handleReject = (id: string) => {
    setRequisitions(requisitions.map(req =>
      req.id === id ? { ...req, status: 'Rejected' as const } : req
    ));
    toast.error('Requisition rejected');
  };

  const getStatusBadge = (status: Requisition['status']) => {
    const variants: Record<Requisition['status'], { className: string }> = {
      'Draft': { className: 'bg-gray-100 text-gray-700' },
      'Pending Approval': { className: 'bg-yellow-100 text-yellow-700' },
      'Approved': { className: 'bg-green-100 text-green-700' },
      'Rejected': { className: 'bg-red-100 text-red-700' },
      'On Hold': { className: 'bg-orange-100 text-orange-700' },
      'Closed': { className: 'bg-gray-100 text-gray-700' }
    };
    return <Badge className={variants[status].className}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: Requisition['priority']) => {
    const variants: Record<Requisition['priority'], { className: string }> = {
      'Low': { className: 'bg-blue-100 text-blue-700' },
      'Medium': { className: 'bg-yellow-100 text-yellow-700' },
      'High': { className: 'bg-orange-100 text-orange-700' },
      'Urgent': { className: 'bg-red-100 text-red-700' }
    };
    return <Badge className={variants[priority].className}>{priority}</Badge>;
  };

  const stats = {
    total: requisitions.length,
    pending: requisitions.filter(r => r.status === 'Pending Approval').length,
    approved: requisitions.filter(r => r.status === 'Approved').length,
    openPositions: requisitions.filter(r => r.status === 'Approved').reduce((sum, r) => sum + r.positions, 0)
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl mb-2">Requisition Management</h1>
          <p className="text-muted-foreground">Manage job requisitions and hiring approvals</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Requisition
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Job Requisition</DialogTitle>
              <DialogDescription>Submit a new position request for approval</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Human Resources">Human Resources</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
                <div>
                  <Label htmlFor="employmentType">Employment Type *</Label>
                  <Select value={formData.employmentType} onValueChange={(value: any) => setFormData({ ...formData, employmentType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="positions">Number of Positions *</Label>
                  <Input
                    id="positions"
                    type="number"
                    min="1"
                    value={formData.positions}
                    onChange={(e) => setFormData({ ...formData, positions: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority *</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="requiredBy">Required By Date *</Label>
                  <Input
                    id="requiredBy"
                    type="date"
                    value={formData.requiredBy}
                    onChange={(e) => setFormData({ ...formData, requiredBy: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="budgetMin">Budget Range (Min) *</Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    value={formData.budgetMin}
                    onChange={(e) => setFormData({ ...formData, budgetMin: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 100000"
                  />
                </div>
                <div>
                  <Label htmlFor="budgetMax">Budget Range (Max) *</Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    value={formData.budgetMax}
                    onChange={(e) => setFormData({ ...formData, budgetMax: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 150000"
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Experience Required *</Label>
                  <Input
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="e.g., 5+ years"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="skills">Required Skills (comma-separated) *</Label>
                  <Input
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="e.g., React, Node.js, TypeScript, AWS"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="justification">Business Justification *</Label>
                  <Textarea
                    id="justification"
                    value={formData.justification}
                    onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                    placeholder="Explain why this position is needed..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateRequisition}>Create Requisition</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Requisitions</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <FileText className="w-4 h-4 mr-1" />
              All requests
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Approval</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.pending}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-1" />
              Awaiting decision
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.approved}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 mr-1" />
              Ready to hire
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Open Positions</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.openPositions}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="w-4 h-4 mr-1" />
              Positions approved
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by job title, department, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requisitions List */}
      <div className="space-y-4">
        {filteredRequisitions.map((req) => (
          <Card key={req.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <CardTitle>{req.jobTitle}</CardTitle>
                    {getStatusBadge(req.status)}
                    {getPriorityBadge(req.priority)}
                  </div>
                  <CardDescription>
                    {req.id} • {req.department} • {req.location}
                  </CardDescription>
                </div>
                {req.status === 'Pending Approval' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleReject(req.id)}>
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => handleApprove(req.id)}>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Positions</p>
                  <p className="font-medium">{req.positions}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employment Type</p>
                  <p className="font-medium">{req.employmentType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget Range</p>
                  <p className="font-medium">${req.budgetMin.toLocaleString()} - ${req.budgetMax.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Required By</p>
                  <p className="font-medium">{new Date(req.requiredBy).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-1">Business Justification</p>
                <p className="text-sm">{req.justification}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <p className="text-sm text-muted-foreground w-full">Required Skills:</p>
                {req.skills.map((skill) => (
                  <Badge key={skill} variant="outline">{skill}</Badge>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm text-muted-foreground">
                <div>Requested by {req.requestedBy} on {new Date(req.requestedDate).toLocaleDateString()}</div>
                <div>Approver: {req.approver}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequisitions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No requisitions found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
