import { useState, useEffect } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Save, Upload, Eye, Palette, Monitor } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useCompany } from '../../contexts/CompanyContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface BrandingSettingsProps {
  user: User;
}

export function BrandingSettings({ user }: BrandingSettingsProps) {
  const { currentCompany, refreshCompanies } = useCompany();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [brandingData, setBrandingData] = useState({
    primary_color: currentCompany?.branding?.primary_color || '#007bff',
    secondary_color: currentCompany?.branding?.secondary_color || '#6c757d',
    accent_color: currentCompany?.branding?.accent_color || '#28a745',
    theme_mode: currentCompany?.branding?.theme_mode || 'light',
    company_name_display: currentCompany?.branding?.company_name_display || currentCompany?.name || '',
    logo_url: currentCompany?.branding?.logo_url || '',
    favicon_url: currentCompany?.branding?.favicon_url || '',
  });

  // Apply theme colors to CSS variables
  useEffect(() => {
    applyTheme();
  }, [brandingData]);

  const applyTheme = () => {
    const root = document.documentElement;
    
    // Convert hex to HSL for better Tailwind compatibility
    const hexToHSL = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return '0 0% 0%';
      
      const r = parseInt(result[1], 16) / 255;
      const g = parseInt(result[2], 16) / 255;
      const b = parseInt(result[3], 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      
      h = Math.round(h * 360);
      s = Math.round(s * 100);
      l = Math.round(l * 100);
      
      return `${h} ${s}% ${l}%`;
    };

    root.style.setProperty('--primary', hexToHSL(brandingData.primary_color));
    root.style.setProperty('--accent', hexToHSL(brandingData.accent_color));
    
    // Apply theme mode
    if (brandingData.theme_mode === 'dark') {
      root.classList.add('dark');
    } else if (brandingData.theme_mode === 'light') {
      root.classList.remove('dark');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setBrandingData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call to save branding
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, update the company branding
      // await updateCompanyBranding(currentCompany.id, brandingData);
      
      toast.success('Branding settings saved successfully');
      await refreshCompanies();
    } catch (error) {
      toast.error('Failed to save branding settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setBrandingData({
      primary_color: '#007bff',
      secondary_color: '#6c757d',
      accent_color: '#28a745',
      theme_mode: 'light',
      company_name_display: currentCompany?.name || '',
      logo_url: '',
      favicon_url: '',
    });
    toast.success('Reset to default theme');
  };

  const presetThemes = [
    { name: 'Ocean Blue', primary: '#0077be', secondary: '#6c757d', accent: '#00a8e8' },
    { name: 'Forest Green', primary: '#28a745', secondary: '#6c757d', accent: '#5cb85c' },
    { name: 'Sunset Orange', primary: '#ff6b35', secondary: '#6c757d', accent: '#f7931e' },
    { name: 'Purple Rain', primary: '#8b5cf6', secondary: '#6c757d', accent: '#a78bfa' },
    { name: 'Crimson Red', primary: '#dc3545', secondary: '#6c757d', accent: '#e74c3c' },
    { name: 'Midnight', primary: '#1a1a2e', secondary: '#16213e', accent: '#0f3460' },
  ];

  const applyPreset = (preset: typeof presetThemes[0]) => {
    setBrandingData(prev => ({
      ...prev,
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      accent_color: preset.accent,
    }));
    toast.success(`Applied ${preset.name} theme`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-2">Branding & Theme</h2>
        <p className="text-muted-foreground">
          Customize your workspace appearance with colors, logos, and themes
        </p>
      </div>

      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList>
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="logos">
            <Upload className="h-4 w-4 mr-2" />
            Logos & Assets
          </TabsTrigger>
          <TabsTrigger value="theme">
            <Monitor className="h-4 w-4 mr-2" />
            Theme Mode
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>
                Define your company's color palette
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex gap-3 mt-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={brandingData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="w-20 h-12 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={brandingData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      placeholder="#007bff"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Main brand color for buttons and highlights
                  </p>
                </div>

                <div>
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex gap-3 mt-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={brandingData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="w-20 h-12 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={brandingData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      placeholder="#6c757d"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supporting color for secondary elements
                  </p>
                </div>

                <div>
                  <Label htmlFor="accent_color">Accent Color</Label>
                  <div className="flex gap-3 mt-2">
                    <Input
                      id="accent_color"
                      type="color"
                      value={brandingData.accent_color}
                      onChange={(e) => handleInputChange('accent_color', e.target.value)}
                      className="w-20 h-12 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={brandingData.accent_color}
                      onChange={(e) => handleInputChange('accent_color', e.target.value)}
                      placeholder="#28a745"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Accent color for success states
                  </p>
                </div>
              </div>

              {/* Color Preview */}
              <div className="border rounded-lg p-6">
                <h4 className="mb-4">Color Preview</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div
                      className="h-20 rounded-lg mb-2 flex items-center justify-center text-white"
                      style={{ backgroundColor: brandingData.primary_color }}
                    >
                      Primary
                    </div>
                  </div>
                  <div>
                    <div
                      className="h-20 rounded-lg mb-2 flex items-center justify-center text-white"
                      style={{ backgroundColor: brandingData.secondary_color }}
                    >
                      Secondary
                    </div>
                  </div>
                  <div>
                    <div
                      className="h-20 rounded-lg mb-2 flex items-center justify-center text-white"
                      style={{ backgroundColor: brandingData.accent_color }}
                    >
                      Accent
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preset Themes */}
          <Card>
            <CardHeader>
              <CardTitle>Preset Themes</CardTitle>
              <CardDescription>
                Quick start with pre-designed color schemes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {presetThemes.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => applyPreset(preset)}
                    className="p-4 border rounded-lg hover:border-primary transition-colors text-left"
                  >
                    <div className="flex gap-2 mb-2">
                      <div
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: preset.secondary }}
                      />
                      <div
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: preset.accent }}
                      />
                    </div>
                    <p className="text-sm font-medium">{preset.name}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logos Tab */}
        <TabsContent value="logos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Logo</CardTitle>
              <CardDescription>
                Upload your company logo and favicon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  type="text"
                  value={brandingData.logo_url}
                  onChange={(e) => handleInputChange('logo_url', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Recommended: PNG or SVG, 200x50px
                </p>
              </div>

              <div>
                <Label htmlFor="favicon_url">Favicon URL</Label>
                <Input
                  id="favicon_url"
                  type="text"
                  value={brandingData.favicon_url}
                  onChange={(e) => handleInputChange('favicon_url', e.target.value)}
                  placeholder="https://example.com/favicon.ico"
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Recommended: ICO or PNG, 32x32px
                </p>
              </div>

              <div>
                <Label htmlFor="company_name_display">Company Display Name</Label>
                <Input
                  id="company_name_display"
                  type="text"
                  value={brandingData.company_name_display}
                  onChange={(e) => handleInputChange('company_name_display', e.target.value)}
                  placeholder={currentCompany?.name}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  How your company name appears in the UI
                </p>
              </div>

              {brandingData.logo_url && (
                <div className="border rounded-lg p-6">
                  <h4 className="mb-4">Logo Preview</h4>
                  <img
                    src={brandingData.logo_url}
                    alt="Company Logo"
                    className="max-w-xs h-auto"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iNTAiIGZpbGw9IiNlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9nbyBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme Mode Tab */}
        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Mode</CardTitle>
              <CardDescription>
                Choose between light, dark, or automatic theme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="theme_mode">Theme Preference</Label>
                <Select
                  value={brandingData.theme_mode}
                  onValueChange={(value) => handleInputChange('theme_mode', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light Mode</SelectItem>
                    <SelectItem value="dark">Dark Mode</SelectItem>
                    <SelectItem value="auto">Auto (System Preference)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  This affects all users in your workspace
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 bg-white">
                  <div className="mb-2 p-3 bg-gray-100 rounded">
                    <div className="h-2 w-full bg-gray-300 rounded mb-2"></div>
                    <div className="h-2 w-3/4 bg-gray-300 rounded"></div>
                  </div>
                  <p className="text-sm text-center text-gray-600">Light Mode</p>
                </div>
                <div className="border rounded-lg p-4 bg-gray-900">
                  <div className="mb-2 p-3 bg-gray-800 rounded">
                    <div className="h-2 w-full bg-gray-700 rounded mb-2"></div>
                    <div className="h-2 w-3/4 bg-gray-700 rounded"></div>
                  </div>
                  <p className="text-sm text-center text-gray-300">Dark Mode</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                See how your branding looks in the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <h3>{brandingData.company_name_display}</h3>
                  <Button style={{ backgroundColor: brandingData.primary_color }}>
                    Primary Button
                  </Button>
                </div>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    style={{ borderColor: brandingData.primary_color, color: brandingData.primary_color }}
                  >
                    Outline Button
                  </Button>
                  <Button
                    style={{ backgroundColor: brandingData.accent_color }}
                    className="ml-2"
                  >
                    Accent Button
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: brandingData.primary_color + '20' }}>
                    <p className="text-sm" style={{ color: brandingData.primary_color }}>Card with primary accent</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: brandingData.secondary_color + '20' }}>
                    <p className="text-sm" style={{ color: brandingData.secondary_color }}>Card with secondary accent</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: brandingData.accent_color + '20' }}>
                    <p className="text-sm" style={{ color: brandingData.accent_color }}>Card with accent color</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Saving...' : 'Save Branding'}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset to Default
        </Button>
      </div>
    </div>
  );
}
