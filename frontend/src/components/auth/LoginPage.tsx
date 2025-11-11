import { useState } from 'react';
import { Eye, EyeOff, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner@2.0.3';
import { User } from '../../App';
import { authApi } from '../../services/api';
import { apiConfig } from '../../services/api-config';
import { ApiError } from '../../services/api-client';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState(apiConfig.getBaseUrl() || '');
  const [showApiDialog, setShowApiDialog] = useState(false);

  // Mock users for demo
  const mockUsers: Record<string, User> = {
    'employee@company.com': {
      id: '1',
      name: 'John Doe',
      email: 'employee@company.com',
      role: 'employee',
      employeeId: 'EMP001',
      department: 'Engineering',
      designation: 'Software Engineer',
    },
    'manager@company.com': {
      id: '2',
      name: 'Sarah Johnson',
      email: 'manager@company.com',
      role: 'manager',
      employeeId: 'EMP002',
      department: 'Engineering',
      designation: 'Engineering Manager',
    },
    'hr@company.com': {
      id: '3',
      name: 'Mike Wilson',
      email: 'hr@company.com',
      role: 'hr',
      employeeId: 'HR001',
      department: 'Human Resources',
      designation: 'HR Manager',
    },
    'admin@company.com': {
      id: '4',
      name: 'Admin User',
      email: 'admin@company.com',
      role: 'admin',
      employeeId: 'ADM001',
      department: 'Administration',
      designation: 'System Admin',
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Check if API is configured
    if (!apiConfig.hasBaseUrl()) {
      // Use mock login
      setTimeout(() => {
        const user = mockUsers[email.toLowerCase()];
        
        if (user && password === 'password') {
          toast.success(`Welcome back, ${user.name}! (Mock Mode)`);
          onLogin(user);
        } else {
          toast.error('Invalid credentials. Try any demo email with password: password');
        }
        
        setIsLoading(false);
      }, 1000);
      return;
    }

    // Use real API
    try {
      const response = await authApi.login({ email, password });
      
      // Save access token
      apiConfig.setAccessToken(response.accessToken);
      
      // Map API user to app User type
      const user: User = {
        id: response.user.id.toString(),
        name: response.user.name,
        email: response.user.email,
        role: response.user.role as User['role'],
        employeeId: `EMP${response.user.id.toString().padStart(3, '0')}`,
        department: 'Department', // These would come from API in real scenario
        designation: 'Position',
      };
      
      toast.success(`Welcome back, ${user.name}!`);
      onLogin(user);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiUrl = () => {
    if (apiBaseUrl.trim()) {
      try {
        new URL(apiBaseUrl);
        apiConfig.setBaseUrl(apiBaseUrl);
        setShowApiDialog(false);
        toast.success('API URL saved. You can now login with your credentials.');
      } catch {
        toast.error('Please enter a valid URL');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="absolute top-4 right-4">
        <Dialog open={showApiDialog} onOpenChange={setShowApiDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              API Config
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure API</DialogTitle>
              <DialogDescription>
                Enter your backend API base URL to connect to the server
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="api-url">API Base URL</Label>
                <Input
                  id="api-url"
                  type="url"
                  placeholder="https://api.example.com"
                  value={apiBaseUrl}
                  onChange={(e) => setApiBaseUrl(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: https://api.example.com or http://localhost:3000/api
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveApiUrl} className="flex-1">
                  Save & Connect
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    apiConfig.clearAll();
                    setApiBaseUrl('');
                    setShowApiDialog(false);
                    toast.success('Using mock mode');
                  }}
                >
                  Use Mock Mode
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center">HR & Project Hub</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email / Employee ID</Label>
              <Input
                id="email"
                type="text"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Login'}
            </Button>

            <div className="text-center">
              <Button type="button" variant="link" className="text-sm">
                Forgot Password?
              </Button>
              <p> *Tst*Admin@123</p>
            </div>
          </form>

          {!apiConfig.hasBaseUrl() && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg space-y-2">
              <p className="text-sm">Demo Accounts (password: password):</p>
              <div className="text-xs space-y-1 text-gray-600">
                <p>• employee@company.com (Employee)</p>
                <p>• manager@company.com (Manager)</p>
                <p>• hr@company.com (HR)</p>
                <p>• admin@company.com (Admin)</p>
              </div>
              <p className="text-xs text-gray-500 mt-2 pt-2 border-t">
                Configure API URL using the button above to connect to your backend
              </p>
            </div>
          )}
          
          {apiConfig.hasBaseUrl() && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                Connected to: <span className="font-mono text-xs">{apiConfig.getBaseUrl()}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
