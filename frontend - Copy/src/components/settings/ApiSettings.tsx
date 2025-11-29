import { useState, useEffect } from 'react';
import { Settings, Check, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner@2.0.3';
import { apiConfig } from '../../services/api-config';

export function ApiSettings() {
  const [baseUrl, setBaseUrl] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedUrl = apiConfig.getBaseUrl();
    if (savedUrl) {
      setBaseUrl(savedUrl);
      setIsSaved(true);
    }
  }, []);

  const handleSave = () => {
    if (!baseUrl.trim()) {
      toast.error('Please enter a valid API base URL');
      return;
    }

    // Validate URL format
    try {
      new URL(baseUrl);
    } catch {
      toast.error('Please enter a valid URL (e.g., https://api.example.com)');
      return;
    }

    apiConfig.setBaseUrl(baseUrl);
    setIsSaved(true);
    toast.success('API configuration saved successfully');
  };

  const handleTest = async () => {
    if (!baseUrl.trim()) {
      toast.error('Please enter and save a base URL first');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/auth/me`, {
        method: 'GET',
      });
      
      if (response.status === 401) {
        toast.success('API is reachable (authentication required)');
      } else if (response.ok) {
        toast.success('API connection successful!');
      } else {
        toast.warning(`API responded with status: ${response.status}`);
      }
    } catch (error) {
      toast.error('Failed to connect to API. Please check the URL.');
    }
  };

  const handleClear = () => {
    apiConfig.clearAll();
    setBaseUrl('');
    setIsSaved(false);
    toast.success('API configuration cleared');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          API Configuration
        </h2>
        <p className="text-gray-500 mt-1">
          Configure the base URL for your backend API
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Base URL</CardTitle>
          <CardDescription>
            Enter the base URL of your backend API (e.g., https://api.example.com or http://localhost:3000/api)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-url">Base URL</Label>
            <Input
              id="api-url"
              type="url"
              placeholder="https://api.example.com"
              value={baseUrl}
              onChange={(e) => {
                setBaseUrl(e.target.value);
                setIsSaved(false);
              }}
            />
          </div>

          {isSaved && (
            <Alert className="bg-green-50 border-green-200">
              <Check className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                API base URL is configured and saved
              </AlertDescription>
            </Alert>
          )}

          {!isSaved && baseUrl && (
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Click "Save Configuration" to apply changes
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaved && baseUrl === apiConfig.getBaseUrl()}>
              Save Configuration
            </Button>
            <Button variant="outline" onClick={handleTest} disabled={!baseUrl}>
              Test Connection
            </Button>
            {isSaved && (
              <Button variant="outline" onClick={handleClear}>
                Clear Configuration
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>Available endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium mb-2">Authentication</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• POST /auth/login</li>
                  <li>• GET /auth/me</li>
                  <li>• POST /auth/logout</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">Attendance</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• GET /attendance/me/today</li>
                  <li>• POST /attendance/me/clock-in</li>
                  <li>• POST /attendance/me/clock-out</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">Timesheets</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• GET /timesheets/me</li>
                  <li>• POST /timesheets/me/save</li>
                  <li>• POST /timesheets/me/submit</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">Projects & Tasks</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• GET /projects</li>
                  <li>• GET /tasks/me</li>
                  <li>• GET /employees</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
