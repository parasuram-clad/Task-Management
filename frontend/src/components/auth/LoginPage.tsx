import React, { useState } from 'react';
import { Eye, EyeOff, Settings, Building2, Shield, Users2, TrendingUp, ArrowLeft, Mail, Key, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner';
import { authApi } from '../../services/auth-api';
import { setApiBaseUrl, getApiBaseUrl, ApiError, initializeApiClient } from '../../services/api-client';
import { User } from '../../App';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

type ForgotPasswordStep = 'email' | 'verification' | 'reset' | 'success';

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiBaseUrl, setApiBaseUrlState] = useState(getApiBaseUrl() || '');
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<ForgotPasswordStep>('email');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);

  // Initialize API client on component mount
  React.useEffect(() => {
    initializeApiClient();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      
      const user: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role as User['role'],
        employeeId: response.user.employeeId || `EMP${response.user.id.padStart(3, '0')}`,
        department: 'Department',
        designation: 'Position',
        is_super_admin: response.user.isSuperAdmin,
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
        setApiBaseUrl(apiBaseUrl);
        setShowApiDialog(false);
        toast.success('API URL saved. You can now login with your credentials.');
      } catch {
        toast.error('Please enter a valid URL');
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setIsForgotPasswordLoading(true);
    try {
      await authApi.forgotPassword({ email: forgotPasswordEmail });
      setForgotPasswordStep('verification');
      toast.success('OTP sent to your email');
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsForgotPasswordLoading(true);
    try {
      // Verify OTP with the backend
      await authApi.verifyEmail({ email: forgotPasswordEmail, otp });
      setForgotPasswordStep('reset');
      toast.success('OTP verified successfully');
    } catch (error) {
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsForgotPasswordLoading(true);
    try {
      await authApi.resetPassword({
        email: forgotPasswordEmail,
        otp,
        newPassword
      });
      setForgotPasswordStep('success');
      toast.success('Password reset successfully');
    } catch (error) {
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPasswordDialog(false);
    // Reset all states after a delay to allow the dialog to close smoothly
    setTimeout(() => {
      setForgotPasswordStep('email');
      setForgotPasswordEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    }, 300);
  };

  const renderForgotPasswordContent = () => {
    switch (forgotPasswordStep) {
      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="forgot-email">Email Address</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="Enter your email address"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleForgotPassword} 
              className="w-full"
              disabled={isForgotPasswordLoading}
            >
              {isForgotPasswordLoading ? (
                <>Sending OTP...</>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send OTP
                </>
              )}
            </Button>
          </div>
        );

      case 'verification':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Mail className="w-12 h-12 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                We sent a 6-digit verification code to<br />
                <strong>{forgotPasswordEmail}</strong>
              </p>
            </div>
            <div>
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="mt-1 text-center text-lg font-mono tracking-widest"
                maxLength={6}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setForgotPasswordStep('email')}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleVerifyOtp}
                className="flex-1"
                disabled={isForgotPasswordLoading || otp.length !== 6}
              >
                {isForgotPasswordLoading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </div>
          </div>
        );

      case 'reset':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Key className="w-12 h-12 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Create your new password
              </p>
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setForgotPasswordStep('verification')}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleResetPassword}
                className="flex-1"
                disabled={isForgotPasswordLoading}
              >
                {isForgotPasswordLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Password Reset Successful!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your password has been reset successfully. You can now login with your new password.
              </p>
            </div>
            <Button 
              onClick={handleCloseForgotPassword}
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        );
    }
  };

  const getForgotPasswordTitle = () => {
    switch (forgotPasswordStep) {
      case 'email': return 'Forgot Password';
      case 'verification': return 'Verify Your Email';
      case 'reset': return 'Create New Password';
      case 'success': return 'Success!';
      default: return 'Forgot Password';
    }
  };

  const getForgotPasswordDescription = () => {
    switch (forgotPasswordStep) {
      case 'email': return 'Enter your email address to receive a verification code';
      case 'verification': return 'Enter the 6-digit code sent to your email';
      case 'reset': return 'Enter your new password below';
      case 'success': return 'Your password has been reset successfully';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* API Config Button */}
      <div className="absolute top-4 right-4 z-10">
        <Dialog open={showApiDialog} onOpenChange={setShowApiDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-white/80 backdrop-blur-sm">
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
                  placeholder="http://localhost:4000/api/v1"
                  value={apiBaseUrl}
                  onChange={(e) => setApiBaseUrlState(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Example: http://localhost:4000/api/v1
                </p>
              </div>
              <Button onClick={handleSaveApiUrl} className="w-full">
                Save & Connect
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPasswordDialog} onOpenChange={setShowForgotPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{getForgotPasswordTitle()}</DialogTitle>
            <DialogDescription>
              {getForgotPasswordDescription()}
            </DialogDescription>
          </DialogHeader>
          {renderForgotPasswordContent()}
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden md:block text-center md:text-left">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-primary">HR & Project Hub</h1>
              <p className="text-muted-foreground">Management System</p>
            </div>
          </div>
          
          <h2 className="mb-4">Streamline Your Workforce Management</h2>
          <p className="text-muted-foreground mb-8">
            A comprehensive platform for managing HR operations, projects, and team collaboration all in one place.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users2 className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h4>Employee Management</h4>
                <p className="text-sm text-muted-foreground">Track attendance, manage timesheets, and monitor team performance</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h4>Project Tracking</h4>
                <p className="text-sm text-muted-foreground">Manage projects with Kanban boards and real-time updates</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h4>Secure Authentication</h4>
                <p className="text-sm text-muted-foreground">OTP verification, password reset, and role-based access control</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4 md:hidden">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-7 h-7 text-white" />
              </div>
            </div>
            <CardTitle className="text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white"
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
                    className="bg-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full shadow-md" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Login'}
              </Button>

              <div className="text-center">
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-sm text-muted-foreground"
                  onClick={() => setShowForgotPasswordDialog(true)}
                >
                  Forgot Password?
                </Button>
              <p>SuperAdmin123!</p>
              </div>
            </form>

            {getApiBaseUrl() && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <Shield className="w-4 h-4" />
                  <p className="text-sm">API Connected</p>
                </div>
                <p className="text-xs text-green-800 font-mono break-all">
                  {getApiBaseUrl()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}