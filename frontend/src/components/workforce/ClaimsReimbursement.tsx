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
import { Plus, Upload, DollarSign, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Claim {
  id: string;
  type: 'Travel' | 'Medical' | 'Food' | 'Accommodation' | 'Equipment' | 'Other';
  amount: number;
  date: string;
  description: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Paid';
  submittedDate?: string;
  approver?: string;
  receipts: number;
  policyLimit: number;
  notes?: string;
}

const mockClaims: Claim[] = [
  {
    id: 'CLM-2024-001',
    type: 'Travel',
    amount: 450.00,
    date: '2024-11-15',
    description: 'Client meeting travel expenses - Uber and parking',
    status: 'Approved',
    submittedDate: '2024-11-16',
    approver: 'John Smith',
    receipts: 3,
    policyLimit: 500,
    notes: 'Approved as per travel policy'
  },
  {
    id: 'CLM-2024-002',
    type: 'Medical',
    amount: 1200.00,
    date: '2024-11-10',
    description: 'Annual health checkup',
    status: 'Paid',
    submittedDate: '2024-11-11',
    approver: 'Sarah Johnson',
    receipts: 2,
    policyLimit: 2000,
    notes: 'Reimbursed to bank account'
  },
  {
    id: 'CLM-2024-003',
    type: 'Food',
    amount: 85.50,
    date: '2024-11-18',
    description: 'Team lunch with prospective client',
    status: 'Submitted',
    submittedDate: '2024-11-19',
    receipts: 1,
    policyLimit: 100
  },
  {
    id: 'CLM-2024-004',
    type: 'Equipment',
    amount: 350.00,
    date: '2024-11-12',
    description: 'Wireless keyboard and mouse for home office',
    status: 'Rejected',
    submittedDate: '2024-11-13',
    approver: 'Mike Chen',
    receipts: 1,
    policyLimit: 500,
    notes: 'Equipment not pre-approved. Please get approval before purchase.'
  },
  {
    id: 'CLM-2024-005',
    type: 'Accommodation',
    amount: 180.00,
    date: '2024-11-20',
    description: 'Hotel stay for conference',
    status: 'Draft',
    receipts: 1,
    policyLimit: 200
  }
];

export function ClaimsReimbursement() {
  const [claims, setClaims] = useState<Claim[]>(mockClaims);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Travel' as const,
    amount: 0,
    date: '',
    description: '',
    receipts: [] as File[]
  });

  const handleSubmitClaim = () => {
    const newClaim: Claim = {
      id: `CLM-2024-${String(claims.length + 1).padStart(3, '0')}`,
      type: formData.type,
      amount: formData.amount,
      date: formData.date,
      description: formData.description,
      status: 'Submitted',
      submittedDate: new Date().toISOString().split('T')[0],
      receipts: formData.receipts.length,
      policyLimit: getPolicyLimit(formData.type)
    };

    setClaims([newClaim, ...claims]);
    setShowCreateDialog(false);
    setFormData({
      type: 'Travel',
      amount: 0,
      date: '',
      description: '',
      receipts: []
    });
    toast.success('Claim submitted successfully');
  };

  const getPolicyLimit = (type: Claim['type']): number => {
    const limits = {
      'Travel': 500,
      'Medical': 2000,
      'Food': 100,
      'Accommodation': 200,
      'Equipment': 500,
      'Other': 300
    };
    return limits[type];
  };

  const getStatusBadge = (status: Claim['status']) => {
    const variants = {
      'Draft': 'bg-gray-100 text-gray-700',
      'Submitted': 'bg-blue-100 text-blue-700',
      'Approved': 'bg-green-100 text-green-700',
      'Rejected': 'bg-red-100 text-red-700',
      'Paid': 'bg-purple-100 text-purple-700'
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const stats = {
    total: claims.reduce((sum, c) => sum + c.amount, 0),
    pending: claims.filter(c => c.status === 'Submitted').length,
    approved: claims.filter(c => c.status === 'Approved' || c.status === 'Paid').length,
    thisMonth: claims.filter(c => new Date(c.date).getMonth() === new Date().getMonth()).reduce((sum, c) => sum + c.amount, 0)
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl mb-2">Claims & Reimbursement</h1>
          <p className="text-muted-foreground">Submit and track expense reimbursement claims</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Claim
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit Expense Claim</DialogTitle>
              <DialogDescription>Fill in the details and attach receipts</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Expense Type *</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Travel">Travel</SelectItem>
                      <SelectItem value="Medical">Medical</SelectItem>
                      <SelectItem value="Food">Food & Entertainment</SelectItem>
                      <SelectItem value="Accommodation">Accommodation</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Policy limit: ${getPolicyLimit(formData.type)}
                  </p>
                </div>
                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="date">Expense Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide details about the expense..."
                    rows={3}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="receipts">Upload Receipts *</Label>
                  <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center hover:border-primary cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, JPG, PNG up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleSubmitClaim}>Submit Claim</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Claimed</CardDescription>
            <CardTitle className="text-3xl">${stats.total.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4 mr-1" />
              All time
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Approval</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.pending}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-1" />
              Awaiting review
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
              Approved/Paid
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>This Month</CardDescription>
            <CardTitle className="text-3xl text-purple-600">${stats.thisMonth.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <FileText className="w-4 h-4 mr-1" />
              Current month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Claims</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {claims.map((claim) => (
            <Card key={claim.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <CardTitle>{claim.type} - ${claim.amount.toFixed(2)}</CardTitle>
                      {getStatusBadge(claim.status)}
                    </div>
                    <CardDescription className="mt-1">
                      {claim.id} • {new Date(claim.date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {claim.status === 'Draft' && (
                    <Button size="sm">Submit</Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{claim.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{claim.receipts} receipt{claim.receipts !== 1 ? 's' : ''} attached</span>
                      <span>Policy limit: ${claim.policyLimit}</span>
                      {claim.submittedDate && <span>Submitted: {new Date(claim.submittedDate).toLocaleDateString()}</span>}
                    </div>
                    {claim.amount > claim.policyLimit && (
                      <Badge className="bg-orange-100 text-orange-700">
                        Exceeds policy limit
                      </Badge>
                    )}
                  </div>
                  {claim.notes && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm">{claim.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="submitted" className="mt-6">
          <p className="text-muted-foreground">Showing submitted claims...</p>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <p className="text-muted-foreground">Showing approved claims...</p>
        </TabsContent>

        <TabsContent value="draft" className="mt-6">
          <p className="text-muted-foreground">Showing draft claims...</p>
        </TabsContent>
      </Tabs>

      {/* Policy Information */}
      <Card>
        <CardHeader>
          <CardTitle>Reimbursement Policy Limits</CardTitle>
          <CardDescription>Maximum amounts you can claim per expense type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Travel</p>
              <p className="text-lg font-semibold">$500</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Medical</p>
              <p className="text-lg font-semibold">$2,000</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Food & Entertainment</p>
              <p className="text-lg font-semibold">$100</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Accommodation</p>
              <p className="text-lg font-semibold">$200</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Equipment</p>
              <p className="text-lg font-semibold">$500</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Other</p>
              <p className="text-lg font-semibold">$300</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
