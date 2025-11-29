import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner@2.0.3';
import { User } from '../../App';
import { Lead, LeadCreateRequest } from '../../services/leads-api';

interface LeadFormProps {
  leadId?: string;
  user: User;
  navigateTo: (page: string, params?: any) => void;
}

const mockUsers = [
  { id: 1, name: 'Sarah Johnson' },
  { id: 2, name: 'Mike Wilson' },
  { id: 3, name: 'John Doe' },
];

export function LeadForm({ leadId, user, navigateTo }: LeadFormProps) {
  const isEdit = !!leadId;
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<LeadCreateRequest>({
    name: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    source: '',
    status: 'open',
    valueAmount: undefined,
    ownerId: user.id,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit) {
      loadLead();
    }
  }, [leadId]);

  const loadLead = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setFormData({
        name: 'Acme Corp Website Redesign',
        contactName: 'John Smith',
        contactEmail: 'john@acmecorp.com',
        contactPhone: '+1-555-0101',
        source: 'Website',
        status: 'qualified',
        valueAmount: 45000,
        ownerId: 1,
        notes: 'Interested in Q1 2024 project',
      });
      setIsLoading(false);
    }, 500);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Lead name is required';
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email format';
    }

    if (formData.valueAmount && formData.valueAmount < 0) {
      newErrors.valueAmount = 'Value must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix form errors');
      return;
    }

    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success(isEdit ? 'Lead updated successfully' : 'Lead created successfully');
      setIsSaving(false);
      navigateTo('leads');
    }, 800);
  };

  const handleChange = (field: keyof LeadCreateRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateTo('leads')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Leads
        </Button>
      </div>

      <Card className="shadow-sm max-w-3xl">
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Lead' : 'Create New Lead'}</CardTitle>
          <CardDescription>
            {isEdit ? 'Update lead information' : 'Add a new lead to your pipeline'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Lead Name */}
            <div>
              <Label htmlFor="name">Lead Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Acme Corp Website Redesign"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => handleChange('contactName', e.target.value)}
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    placeholder="john@company.com"
                    className={errors.contactEmail ? 'border-red-500' : ''}
                  />
                  {errors.contactEmail && <p className="text-xs text-red-600 mt-1">{errors.contactEmail}</p>}
                </div>

                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                    placeholder="+1-555-0100"
                  />
                </div>
              </div>
            </div>

            {/* Lead Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Lead Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select value={formData.source} onValueChange={(v) => handleChange('source', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="Cold Outreach">Cold Outreach</SelectItem>
                      <SelectItem value="Trade Show">Trade Show</SelectItem>
                      <SelectItem value="Partner">Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(v: any) => handleChange('status', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="valueAmount">Estimated Value ($)</Label>
                  <Input
                    id="valueAmount"
                    type="number"
                    value={formData.valueAmount || ''}
                    onChange={(e) => handleChange('valueAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="50000"
                    min="0"
                    step="1000"
                    className={errors.valueAmount ? 'border-red-500' : ''}
                  />
                  {errors.valueAmount && <p className="text-xs text-red-600 mt-1">{errors.valueAmount}</p>}
                </div>

                <div>
                  <Label htmlFor="owner">Lead Owner</Label>
                  <Select 
                    value={formData.ownerId?.toString()} 
                    onValueChange={(v) => handleChange('ownerId', parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.map(u => (
                        <SelectItem key={u.id} value={u.id.toString()}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Additional information about this lead..."
                rows={4}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button type="submit" disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : isEdit ? 'Update Lead' : 'Create Lead'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigateTo('leads')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
