import { useState } from 'react';
import { Building2, X, ChevronRight, ChevronLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner@2.0.3';
import { FeatureConfiguration, CompanyFeatures } from '../superadmin/FeatureConfiguration';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface CreateCompanyModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const defaultFeatures: CompanyFeatures = {
  employee_management: true,
  attendance_tracking: true,
  leave_management: true,
  timesheet_management: false,
  project_management: false,
  task_management: false,
  kanban_boards: false,
  performance_appraisal: true,
  skills_management: false,
  payroll_management: true,
  invoice_management: false,
  accounting_bookkeeping: false,
  expense_tracking: false,
  leads_management: false,
  advanced_reports: false,
  analytics_dashboard: false,
  document_management: true,
};

export function CreateCompanyModal({ open, onClose, onSuccess }: CreateCompanyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    industry: '',
    plan: 'free',
    timezone: 'America/New_York',
  });
  const [features, setFeatures] = useState<CompanyFeatures>(defaultFeatures);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    // Validate step 1
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'Company slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }
    if (!formData.industry) {
      newErrors.industry = 'Please select an industry';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setCurrentStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    
    // Simulate API call with company data and features
    setTimeout(() => {
      const enabledFeatures = Object.entries(features)
        .filter(([_, enabled]) => enabled)
        .map(([key]) => key);
      
      console.log('Creating company with:', { ...formData, features: enabledFeatures });
      
      toast.success(`Company "${formData.name}" created successfully with ${enabledFeatures.length} features enabled!`);
      setIsSubmitting(false);
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        slug: '',
        industry: '',
        plan: 'free',
        timezone: 'America/New_York',
      });
      setFeatures(defaultFeatures);
      setErrors({});
      setCurrentStep(1);
    }, 1000);
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    }));
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Create New Company
          </DialogTitle>
          <DialogDescription>
            Step {currentStep} of 2: {currentStep === 1 ? 'Basic Information' : 'Feature Configuration'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={currentStep === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
          {currentStep === 1 && (
            <div className="space-y-4">
          <div>
            <Label htmlFor="company-name">Company Name *</Label>
            <Input
              id="company-name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Acme Corporation"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="company-slug">Company Slug *</Label>
            <Input
              id="company-slug"
              value={formData.slug}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, slug: e.target.value }));
                if (errors.slug) {
                  setErrors(prev => ({ ...prev, slug: '' }));
                }
              }}
              placeholder="e.g., acme-corp"
              className={errors.slug ? 'border-red-500' : ''}
            />
            {errors.slug && (
              <p className="text-xs text-red-600 mt-1">{errors.slug}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Used in URLs: yourapp.com/{formData.slug || 'company-slug'}
            </p>
          </div>

          <div>
            <Label htmlFor="industry">Industry Type *</Label>
            <Select 
              value={formData.industry} 
              onValueChange={(v) => {
                setFormData(prev => ({ ...prev, industry: v }));
                if (errors.industry) {
                  setErrors(prev => ({ ...prev, industry: '' }));
                }
              }}
            >
              <SelectTrigger className={errors.industry ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">Technology & Software</SelectItem>
                <SelectItem value="consulting">Consulting & Professional Services</SelectItem>
                <SelectItem value="agency">Creative Agency & Marketing</SelectItem>
                <SelectItem value="healthcare">Healthcare & Medical</SelectItem>
                <SelectItem value="manufacturing">Manufacturing & Production</SelectItem>
                <SelectItem value="retail">Retail & E-commerce</SelectItem>
                <SelectItem value="finance">Finance & Banking</SelectItem>
                <SelectItem value="education">Education & Training</SelectItem>
                <SelectItem value="construction">Construction & Real Estate</SelectItem>
                <SelectItem value="hospitality">Hospitality & Tourism</SelectItem>
                <SelectItem value="nonprofit">Nonprofit & NGO</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.industry && (
              <p className="text-xs text-red-600 mt-1">{errors.industry}</p>
            )}
          </div>

          <div>
            <Label htmlFor="plan">Plan</Label>
            <Select value={formData.plan} onValueChange={(v) => setFormData(prev => ({ ...prev, plan: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free - Up to 5 users</SelectItem>
                <SelectItem value="basic">Basic - Up to 20 users</SelectItem>
                <SelectItem value="professional">Professional - Up to 100 users</SelectItem>
                <SelectItem value="enterprise">Enterprise - Unlimited</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={formData.timezone} onValueChange={(v) => setFormData(prev => ({ ...prev, timezone: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                <SelectItem value="Europe/London">London (GMT)</SelectItem>
                <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                <SelectItem value="Asia/Singapore">Singapore (SGT)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Next: Configure Features
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <FeatureConfiguration 
                features={features}
                onChange={setFeatures}
                industryType={formData.industry}
              />

              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCurrentStep(1)}
                  className="flex-1"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Creating...' : 'Create Company'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
