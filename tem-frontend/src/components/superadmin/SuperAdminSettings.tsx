import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Save } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SuperAdminSettingsProps {
  user: User;
}

export function SuperAdminSettings({ user }: SuperAdminSettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    platform_name: 'WorkHub',
    platform_email: 'support@workhub.com',
    platform_domain: 'workhub.com',
    support_email: 'support@workhub.com',
  });

  const [features, setFeatures] = useState({
    allow_free_tier: true,
    allow_trial: true,
    trial_days: 14,
    require_email_verification: true,
    allow_social_login: false,
  });

  const [limits, setLimits] = useState({
    free_max_users: 5,
    basic_max_users: 20,
    professional_max_users: 50,
    free_storage_gb: 1,
    basic_storage_gb: 10,
    professional_storage_gb: 50,
  });

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('General settings saved');
    setIsSubmitting(false);
  };

  const handleSaveFeatures = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Feature settings saved');
    setIsSubmitting(false);
  };

  const handleSaveLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Limit settings saved');
    setIsSubmitting(false);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Platform Settings</h1>
        <p className="text-muted-foreground">
          Configure global platform settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="limits">Limits</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveGeneral} className="space-y-4">
                <div>
                  <Label htmlFor="platform_name">Platform Name</Label>
                  <Input
                    id="platform_name"
                    value={generalSettings.platform_name}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        platform_name: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="platform_email">Platform Email</Label>
                  <Input
                    id="platform_email"
                    type="email"
                    value={generalSettings.platform_email}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        platform_email: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="platform_domain">Platform Domain</Label>
                  <Input
                    id="platform_domain"
                    value={generalSettings.platform_domain}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        platform_domain: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="support_email">Support Email</Label>
                  <Input
                    id="support_email"
                    type="email"
                    value={generalSettings.support_email}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        support_email: e.target.value,
                      })
                    }
                  />
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Settings'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveFeatures} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Free Tier</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable free plan for new companies
                    </p>
                  </div>
                  <Switch
                    checked={features.allow_free_tier}
                    onCheckedChange={(checked) =>
                      setFeatures({ ...features, allow_free_tier: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Trial Period</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable trial period for paid plans
                    </p>
                  </div>
                  <Switch
                    checked={features.allow_trial}
                    onCheckedChange={(checked) =>
                      setFeatures({ ...features, allow_trial: checked })
                    }
                  />
                </div>

                {features.allow_trial && (
                  <div>
                    <Label htmlFor="trial_days">Trial Period (days)</Label>
                    <Input
                      id="trial_days"
                      type="number"
                      value={features.trial_days}
                      onChange={(e) =>
                        setFeatures({
                          ...features,
                          trial_days: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Users must verify email before accessing
                    </p>
                  </div>
                  <Switch
                    checked={features.require_email_verification}
                    onCheckedChange={(checked) =>
                      setFeatures({
                        ...features,
                        require_email_verification: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Social Login</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable login with Google, GitHub, etc.
                    </p>
                  </div>
                  <Switch
                    checked={features.allow_social_login}
                    onCheckedChange={(checked) =>
                      setFeatures({ ...features, allow_social_login: checked })
                    }
                  />
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Settings'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Limits */}
        <TabsContent value="limits">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Limits</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveLimits} className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="free_max_users">Free Plan Max Users</Label>
                      <Input
                        id="free_max_users"
                        type="number"
                        value={limits.free_max_users}
                        onChange={(e) =>
                          setLimits({
                            ...limits,
                            free_max_users: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="basic_max_users">Basic Plan Max Users</Label>
                      <Input
                        id="basic_max_users"
                        type="number"
                        value={limits.basic_max_users}
                        onChange={(e) =>
                          setLimits({
                            ...limits,
                            basic_max_users: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="professional_max_users">
                        Professional Plan Max Users
                      </Label>
                      <Input
                        id="professional_max_users"
                        type="number"
                        value={limits.professional_max_users}
                        onChange={(e) =>
                          setLimits({
                            ...limits,
                            professional_max_users: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Saving...' : 'Save Limits'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage Limits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="free_storage">Free Plan Storage (GB)</Label>
                    <Input
                      id="free_storage"
                      type="number"
                      value={limits.free_storage_gb}
                      onChange={(e) =>
                        setLimits({
                          ...limits,
                          free_storage_gb: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="basic_storage">Basic Plan Storage (GB)</Label>
                    <Input
                      id="basic_storage"
                      type="number"
                      value={limits.basic_storage_gb}
                      onChange={(e) =>
                        setLimits({
                          ...limits,
                          basic_storage_gb: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="professional_storage">
                      Professional Plan Storage (GB)
                    </Label>
                    <Input
                      id="professional_storage"
                      type="number"
                      value={limits.professional_storage_gb}
                      onChange={(e) =>
                        setLimits({
                          ...limits,
                          professional_storage_gb: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Stripe integration settings would go here
                </p>
                <Button variant="outline">Configure Stripe</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Security and authentication settings would go here
                </p>
                <Button variant="outline">Configure Security</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
