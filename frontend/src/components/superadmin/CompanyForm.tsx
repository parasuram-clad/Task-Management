import { useState, useEffect } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
import { ArrowLeft, Save } from 'lucide-react';
import { useSuperAdmin } from '../../contexts/SuperAdminContext';
import { toast } from 'sonner@2.0.3';

interface CompanyFormProps {
  user: User;
  navigateTo: (page: string, params?: any) => void;
  companyId?: number;
}

export function CompanyForm({ user, navigateTo, companyId }: CompanyFormProps) {
  const { allCompanies, createCompany, updateCompany } = useSuperAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!companyId;
  const existingCompany = isEditMode
    ? allCompanies.find(c => c.id === companyId)
    : null;

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    plan: 'free',
    domain: '',
    custom_domain: '',
    timezone: 'America/New_York',
    date_format: 'MM/DD/YYYY',
    currency: 'USD',
    primary_color: '#007bff',
    secondary_color: '#6c757d',
    accent_color: '#28a745',
    theme_mode: 'light',
  });

  // Load existing company data when in edit mode
  useEffect(() => {
    if (existingCompany) {
      setFormData({
        name: existingCompany.name || '',
        slug: existingCompany.slug || '',
        plan: existingCompany.plan || 'free',
        domain: existingCompany.domain || '',
        custom_domain: existingCompany.custom_domain || '',
        timezone: existingCompany.settings?.timezone || 'America/New_York',
        date_format: existingCompany.settings?.date_format || 'MM/DD/YYYY',
        currency: existingCompany.settings?.currency || 'USD',
        primary_color: existingCompany.branding?.primary_color || '#007bff',
        secondary_color: existingCompany.branding?.secondary_color || '#6c757d',
        accent_color: existingCompany.branding?.accent_color || '#28a745',
        theme_mode: existingCompany.branding?.theme_mode || 'light',
      });
    }
  }, [existingCompany]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from name
    if (field === 'name' && !isEditMode) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const companyData = {
        name: formData.name,
        slug: formData.slug,
        plan: formData.plan as 'free' | 'basic' | 'professional' | 'enterprise',
        domain: formData.domain,
        custom_domain: formData.custom_domain,
        settings: {
          timezone: formData.timezone,
          date_format: formData.date_format,
          currency: formData.currency,
        },
        branding: {
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          accent_color: formData.accent_color,
          theme_mode: formData.theme_mode as 'light' | 'dark' | 'auto',
        },
      };

      if (isEditMode && companyId) {
        await updateCompany(companyId, companyData);
        toast.success('Company updated successfully');
      } else {
        await createCompany(companyData);
        toast.success('Company created successfully');
      }

      navigateTo('superadmin-companies');
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update company' : 'Failed to create company');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigateTo('superadmin-companies')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Companies
        </Button>
        <h1 className="text-3xl mb-2">
          {isEditMode ? 'Edit Company' : 'Create New Company'}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode
            ? 'Update company information and settings'
            : 'Add a new company to the platform'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Acme Corporation"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="acme-corp"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    This will be used in URLs: app.yourplatform.com/{formData.slug}
                  </p>
                </div>

                <div>
                  <Label htmlFor="plan">Subscription Plan *</Label>
                  <Select
                    value={formData.plan}
                    onValueChange={(value) => handleInputChange('plan', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free - $0/month</SelectItem>
                      <SelectItem value="basic">Basic - $29/month</SelectItem>
                      <SelectItem value="professional">
                        Professional - $99/month
                      </SelectItem>
                      <SelectItem value="enterprise">
                        Enterprise - $299/month
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Domain Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="domain">Platform Subdomain</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="domain"
                      value={formData.domain}
                      onChange={(e) => handleInputChange('domain', e.target.value)}
                      placeholder="acme-corp"
                    />
                    <div className="flex items-center px-3 bg-muted rounded text-sm text-muted-foreground whitespace-nowrap">
                      .yourplatform.com
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Company will be accessible at: {formData.domain || 'subdomain'}.yourplatform.com
                  </p>
                </div>

                <div>
                  <Label htmlFor="custom_domain">Custom Domain (Optional)</Label>
                  <Input
                    id="custom_domain"
                    value={formData.custom_domain}
                    onChange={(e) => handleInputChange('custom_domain', e.target.value)}
                    placeholder="app.acmecorp.com"
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Requires DNS configuration. Available on Professional and Enterprise plans.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Brand Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex gap-3 mt-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="w-20 h-12 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      placeholder="#007bff"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex gap-3 mt-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="w-20 h-12 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      placeholder="#6c757d"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accent_color">Accent Color</Label>
                  <div className="flex gap-3 mt-2">
                    <Input
                      id="accent_color"
                      type="color"
                      value={formData.accent_color}
                      onChange={(e) => handleInputChange('accent_color', e.target.value)}
                      className="w-20 h-12 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.accent_color}
                      onChange={(e) => handleInputChange('accent_color', e.target.value)}
                      placeholder="#28a745"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="theme_mode">Default Theme</Label>
                  <Select
                    value={formData.theme_mode}
                    onValueChange={(value) => handleInputChange('theme_mode', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light Mode</SelectItem>
                      <SelectItem value="dark">Dark Mode</SelectItem>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Plan Features</CardTitle>
              </CardHeader>
              <CardContent>
                {formData.plan === 'free' && (
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Up to 5 users</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Basic features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>1GB storage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">✗</span>
                      <span className="text-muted-foreground">Advanced reporting</span>
                    </li>
                  </ul>
                )}
                {formData.plan === 'basic' && (
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Up to 20 users</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>All basic features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>10GB storage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Email support</span>
                    </li>
                  </ul>
                )}
                {formData.plan === 'professional' && (
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Up to 50 users</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Advanced features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>50GB storage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Priority support</span>
                    </li>
                  </ul>
                )}
                {formData.plan === 'enterprise' && (
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Unlimited users</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>All features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Unlimited storage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>24/7 support</span>
                    </li>
                  </ul>
                )}
              </CardContent>
            </Card>

            <div className="mt-6 space-y-3">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting
                  ? 'Saving...'
                  : isEditMode
                  ? 'Update Company'
                  : 'Create Company'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigateTo('superadmin-companies')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}