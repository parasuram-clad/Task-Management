import { useState, useEffect } from 'react';
import { Eye, EyeOff, Settings, Mail, Lock, AlertCircle } from 'lucide-react';
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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [resetToken, setResetToken] = useState('');
  
  // First time login modal state
  const [showFirstTimeLogin, setShowFirstTimeLogin] = useState(false);
  const [firstTimeUser, setFirstTimeUser] = useState<User | null>(null);
  const [firstTimeNewPassword, setFirstTimeNewPassword] = useState('');
  const [firstTimeConfirmPassword, setFirstTimeConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Separate error message states for each component
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const [forgotPasswordErrorMessage, setForgotPasswordErrorMessage] = useState('');
  const [firstTimeLoginErrorMessage, setFirstTimeLoginErrorMessage] = useState('');
  const [apiConfigErrorMessage, setApiConfigErrorMessage] = useState('');

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

  // Clear login error when user starts typing
  useEffect(() => {
    if (loginErrorMessage) {
      setLoginErrorMessage('');
    }
  }, [email, password]);

  // Clear forgot password error when dialog opens/closes or step changes
  useEffect(() => {
    if (showForgotPassword) {
      setForgotPasswordErrorMessage('');
    }
  }, [showForgotPassword, step]);

  // Clear first time login error when dialog opens/closes
  useEffect(() => {
    if (showFirstTimeLogin) {
      setFirstTimeLoginErrorMessage('');
    }
  }, [showFirstTimeLogin]);

  // First time login functions
  const handleFirstTimeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (firstTimeNewPassword !== firstTimeConfirmPassword) {
      setFirstTimeLoginErrorMessage('Passwords do not match');
      return;
    }

    if (firstTimeNewPassword.length < 8) {
      setFirstTimeLoginErrorMessage('Password must be at least 8 characters long');
      return;
    }

    setIsUpdatingPassword(true);
    setFirstTimeLoginErrorMessage('');

    if (!apiConfig.hasBaseUrl()) {
      // Mock password update
      setTimeout(() => {
        toast.success('Password updated successfully!');
        if (firstTimeUser) {
          localStorage.setItem(`firstTime_${firstTimeUser.email}`, 'false');
          onLogin(firstTimeUser);
        }
        setShowFirstTimeLogin(false);
        resetFirstTimeLoginState();
        setIsUpdatingPassword(false);
      }, 1000);
      return;
    }

    try {
      await authApi.updateFirstTimePassword({
        email: firstTimeUser?.email || '',
        newPassword: firstTimeNewPassword
      });
      
      toast.success('Password updated successfully! You can now login with your new password.');
      if (firstTimeUser) {
        onLogin(firstTimeUser);
      }
      setShowFirstTimeLogin(false);
      resetFirstTimeLoginState();
    } catch (error: any) {
      console.log('First time password update error:', error);
      
      let errorMsg = 'Failed to update password. Please try again.';
      
      if (error instanceof ApiError) {
        errorMsg = error.message;
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setFirstTimeLoginErrorMessage(errorMsg);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const resetFirstTimeLoginState = () => {
    setFirstTimeNewPassword('');
    setFirstTimeConfirmPassword('');
    setFirstTimeUser(null);
    setFirstTimeLoginErrorMessage('');
  };

  const handleFirstTimeDialogClose = (open: boolean) => {
    if (!open) {
      resetFirstTimeLoginState();
    }
    setShowFirstTimeLogin(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginErrorMessage(''); // Clear previous errors

    // Check if API is configured
    if (!apiConfig.hasBaseUrl()) {
      // Use mock login
      setTimeout(() => {
        const user = mockUsers[email.toLowerCase()];
        
        if (user) {
          if (password === 'password') {
            const isFirstTimeLogin = localStorage.getItem(`firstTime_${email}`) === 'true' || 
                                    password === 'temp123';
            
            if (isFirstTimeLogin) {
              setFirstTimeUser(user);
              setShowFirstTimeLogin(true);
              setLoginErrorMessage('Please set your new password to continue');
            } else {
              setLoginErrorMessage(''); // Clear error on success
              toast.success(`Welcome back, ${user.name}! (Mock Mode)`);
              onLogin(user);
            }
          } else {
            setLoginErrorMessage('Incorrect password. Try "password" for demo accounts.');
          }
        } else {
          setLoginErrorMessage('Invalid email address. Try one of the demo emails below.');
        }
        
        setIsLoading(false);
      }, 1000);
      return;
    }

    // Use real API
    try {
      const response = await authApi.login({ email, password });
      
      if (response.requiresPasswordChange) {
        apiConfig.setAccessToken(response.accessToken);
        
        const user: User = {
          id: response.user.id.toString(),
          name: response.user.name,
          email: response.user.email,
          role: response.user.role as User['role'],
          employeeId: `EMP${response.user.id.toString().padStart(3, '0')}`,
          department: 'Department',
          designation: 'Position',
        };
        
        setFirstTimeUser(user);
        setShowFirstTimeLogin(true);
        setLoginErrorMessage('Please set your new password to continue');
      } else {
        apiConfig.setAccessToken(response.accessToken);
        
        const user: User = {
          id: response.user.id.toString(),
          name: response.user.name,
          email: response.user.email,
          role: response.user.role as User['role'],
          employeeId: `EMP${response.user.id.toString().padStart(3, '0')}`,
          department: 'Department',
          designation: 'Position',
        };
        
        setLoginErrorMessage(''); // Clear error on success
        toast.success(`Welcome back, ${user.name}!`);
        onLogin(user);
      }
    } catch (error: any) {
      console.log('Login error:', error);
      
      let errorMsg = 'Login failed. Please try again.';
      
      if (error instanceof ApiError) {
        errorMsg = error.message;
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setLoginErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordErrorMessage('Please enter your email address');
      return;
    }

    setIsSendingOTP(true);
    setForgotPasswordErrorMessage('');

    if (!apiConfig.hasBaseUrl()) {
      setTimeout(() => {
        setForgotPasswordErrorMessage(`OTP sent to ${forgotPasswordEmail} (Mock Mode)`);
        setStep('otp');
        setIsSendingOTP(false);
      }, 1000);
      return;
    }

    try {
      await authApi.forgotPassword({ email: forgotPasswordEmail });
      setForgotPasswordErrorMessage('OTP sent to your email');
      setStep('otp');
    } catch (error: any) {
      console.log('Forgot password error:', error);
      
      let errorMsg = 'Failed to send OTP. Please try again.';
      
      if (error instanceof ApiError) {
        errorMsg = error.message;
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setForgotPasswordErrorMessage(errorMsg);
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      setForgotPasswordErrorMessage('Please enter the OTP');
      return;
    }

    setIsSendingOTP(true);
    setForgotPasswordErrorMessage('');

    if (!apiConfig.hasBaseUrl()) {
      setTimeout(() => {
        if (otp === '123456') {
          setForgotPasswordErrorMessage('OTP verified successfully');
          setStep('reset');
          setResetToken('mock-reset-token');
        } else {
          setForgotPasswordErrorMessage('Invalid OTP. Please try again.');
        }
        setIsSendingOTP(false);
      }, 1000);
      return;
    }

    try {
      const response = await authApi.verifyResetToken({ token: otp });
      if (response.valid) {
        setForgotPasswordErrorMessage('OTP verified successfully');
        setStep('reset');
        setResetToken(otp);
      } else {
        setForgotPasswordErrorMessage('Invalid OTP');
      }
    } catch (error: any) {
      console.log('Verify OTP error:', error);
      
      let errorMsg = 'Failed to verify OTP. Please try again.';
      
      if (error instanceof ApiError) {
        errorMsg = error.message;
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setForgotPasswordErrorMessage(errorMsg);
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setForgotPasswordErrorMessage('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setForgotPasswordErrorMessage('Password must be at least 8 characters long');
      return;
    }

    setIsSendingOTP(true);
    setForgotPasswordErrorMessage('');

    if (!apiConfig.hasBaseUrl()) {
      setTimeout(() => {
        setForgotPasswordErrorMessage('Password reset successfully!');
        setShowForgotPassword(false);
        resetForgotPasswordState();
        setIsSendingOTP(false);
      }, 1000);
      return;
    }

    try {
      await authApi.resetPassword({ 
        token: resetToken, 
        newPassword 
      });
      setForgotPasswordErrorMessage('Password reset successfully! You can now login with your new password.');
      setShowForgotPassword(false);
      resetForgotPasswordState();
    } catch (error: any) {
      console.log('Reset password error:', error);
      
      let errorMsg = 'Failed to reset password. Please try again.';
      
      if (error instanceof ApiError) {
        errorMsg = error.message;
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setForgotPasswordErrorMessage(errorMsg);
    } finally {
      setIsSendingOTP(false);
    }
  };

  const resetForgotPasswordState = () => {
    setForgotPasswordEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setStep('email');
    setResetToken('');
    setForgotPasswordErrorMessage('');
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetForgotPasswordState();
    }
    setShowForgotPassword(open);
  };

  const handleSaveApiUrl = () => {
    if (apiBaseUrl.trim()) {
      try {
        new URL(apiBaseUrl);
        apiConfig.setBaseUrl(apiBaseUrl);
        setShowApiDialog(false);
        setApiConfigErrorMessage('API URL saved. You can now login with your credentials.');
        // Clear the message after 3 seconds
        setTimeout(() => {
          setApiConfigErrorMessage('');
        }, 3000);
      } catch {
        setApiConfigErrorMessage('Please enter a valid URL');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* First Time Login Dialog */}
      <Dialog open={showFirstTimeLogin} onOpenChange={handleFirstTimeDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome to HR & Project Hub!</DialogTitle>
            <DialogDescription>
              This is your first time logging in. Please set your new password to continue.
            </DialogDescription>
          </DialogHeader>
          
          {/* First time login error message */}
          {firstTimeLoginErrorMessage && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md">
              <AlertCircle className="w-4 h-4" />
              <span>{firstTimeLoginErrorMessage}</span>
            </div>
          )}
          
          <form onSubmit={handleFirstTimeLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password-first">New Password</Label>
              <Input
                id="new-password-first"
                type="password"
                placeholder="Enter new password"
                value={firstTimeNewPassword}
                onChange={(e) => setFirstTimeNewPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500">
                Password must be at least 8 characters long
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password-first">Confirm Password</Label>
              <Input
                id="confirm-password-first"
                type="password"
                placeholder="Confirm new password"
                value={firstTimeConfirmPassword}
                onChange={(e) => setFirstTimeConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isUpdatingPassword || firstTimeNewPassword.length < 8 || firstTimeNewPassword !== firstTimeConfirmPassword}
              >
                <Lock className="w-4 h-4 mr-2" />
                {isUpdatingPassword ? 'Updating...' : 'Set Password & Login'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* API Config Dialog */}
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
            
            {/* API config error message */}
            {apiConfigErrorMessage && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md">
                <AlertCircle className="w-4 h-4" />
                <span>{apiConfigErrorMessage}</span>
              </div>
            )}
            
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
                    setApiConfigErrorMessage('Using mock mode');
                    setTimeout(() => {
                      setApiConfigErrorMessage('');
                    }, 3000);
                  }}
                >
                  Use Mock Mode
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {step === 'email' && 'Reset Your Password'}
              {step === 'otp' && 'Verify OTP'}
              {step === 'reset' && 'Create New Password'}
            </DialogTitle>
            <DialogDescription>
              {step === 'email' && 'Enter your email address to receive OTP'}
              {step === 'otp' && 'Enter the 6-digit OTP sent to your email'}
              {step === 'reset' && 'Enter your new password'}
            </DialogDescription>
          </DialogHeader>

          {/* Forgot password error message */}
          {forgotPasswordErrorMessage && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md">
              <AlertCircle className="w-4 h-4" />
              <span>{forgotPasswordErrorMessage}</span>
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email Address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="Enter your email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={isSendingOTP}
                >
                  {isSendingOTP ? (
                    <>Sending OTP...</>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send OTP
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForgotPassword(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">6-digit OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500">
                  Check your email for the OTP
                  {!apiConfig.hasBaseUrl() && (
                    <span className="block text-orange-600">Demo OTP: 123456</span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={isSendingOTP || otp.length !== 6}
                >
                  {isSendingOTP ? 'Verifying...' : 'Verify OTP'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep('email')}
                >
                  Back
                </Button>
              </div>
              <div className="text-center">
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-sm"
                  onClick={handleSendOTP}
                  disabled={isSendingOTP}
                >
                  Resend OTP
                </Button>
              </div>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={isSendingOTP || newPassword.length < 8 || newPassword !== confirmPassword}
                >
                  {isSendingOTP ? 'Resetting...' : 'Reset Password'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep('otp')}
                >
                  Back
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Main Login Card */}
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center">HR & Project Hub</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Login error message display */}
          {loginErrorMessage && (
            <div className="flex items-center gap-2 p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{loginErrorMessage}</span>
            </div>
          )}

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
                className={loginErrorMessage ? 'border-red-300 focus:border-red-500' : ''}
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
                  className={loginErrorMessage ? 'border-red-300 focus:border-red-500' : ''}
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
              <Button 
                type="button" 
                variant="link" 
                className="text-sm"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </Button>
              <p className="text-xs text-gray-500 mt-1">*Test* Admin@123</p>
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