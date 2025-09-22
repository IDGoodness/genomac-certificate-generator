import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  UserPlus, 
  Shield, 
  Building2, 
  Eye, 
  EyeOff, 
  AlertCircle,
  ArrowLeft,
  Key,
  Mail,
  User,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { authService, type RegisterRequest } from '../services/auth.service';
import type { Subsidiary } from '../App';
import Logo from "../assets/genomacholdingslogo.png";
import ThemeToggle from './ThemeToggle';

interface AdminRegisterProps {
  subsidiaries: Subsidiary[];
  onBackToLogin: () => void;
}

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  subsidiaryId: string;
  adminKey: string;
}

export default function AdminRegister({ subsidiaries, onBackToLogin }: AdminRegisterProps) {
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    subsidiaryId: '',
    adminKey: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.subsidiaryId) return 'Please select a subsidiary';
    if (!formData.adminKey.trim()) return 'Admin key is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Please enter a valid email address';
    
    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    const validationError = validateForm();
    if (validationError) {
      setRegisterError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Prepare registration data with proper field mapping
      const registerData: RegisterRequest = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        subsidiary: formData.subsidiaryId, // Always include subsidiary, even for 'holdings'
        adminKey: formData.adminKey.trim()
      };

      console.log('Sending registration data:', {
        ...registerData,
        password: '[REDACTED]',
        adminKey: '[REDACTED]'
      });

      await authService.register(registerData);
      
      // Registration successful! Since the backend doesn't return user details,
      // we'll show a success message and clear the form
      const selectedSubsidiary = formData.subsidiaryId === 'genomac_holdings' 
        ? null 
        : subsidiaries.find(s => s.id === formData.subsidiaryId);

      toast.success(`Registration successful! Welcome ${formData.firstName}! You can now log in to ${selectedSubsidiary?.name || 'Genomac Holdings'}.`);
      
      // Clear the form after successful registration
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        subsidiaryId: '',
        adminKey: ''
      });
      
      // Redirect to login page after successful registration
      setTimeout(() => {
        onBackToLogin();
      }, 1500); // Small delay to let user see the success message
    } catch (error) {
      console.error('Registration error:', error);
      
      // Enhanced error handling for better debugging
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check for specific error patterns
        if (error.message.includes('400') || error.message.includes('Bad Request')) {
          errorMessage = 'Invalid registration data. Please check all fields and try again.';
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Invalid admin key. Please check your admin key and try again.';
        } else if (error.message.includes('409') || error.message.includes('Conflict')) {
          errorMessage = 'An account with this email already exists.';
        } else if (error.message.includes('timeout') || error.message.includes('fetch') || error.message.includes('network')) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
        }
      }
      
      setRegisterError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSubsidiary = formData.subsidiaryId 
    ? subsidiaries.find(s => s.id === formData.subsidiaryId)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        
        {/* Theme Toggle - positioned in top right */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        {/* Back to Login */}
        <div className="absolute top-4 left-4">
          <Button
            variant="ghost"
            onClick={onBackToLogin}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Button>
        </div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img 
              src={Logo}
              alt="Genomac Holdings"
              className="h-16 w-auto rounded-lg shadow-md"
            />
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Genomac Holdings</h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">Certificate Management Platform</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 text-green-800 dark:text-green-200 px-4 py-2">
            <UserPlus className="w-4 h-4 mr-2" />
            Administrator Registration
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-600" />
                Create Administrator Account
              </CardTitle>
              <CardDescription>
                Register as a new administrator for a Genomac Holdings subsidiary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter your first name"
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter your last name"
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email address"
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                {/* Subsidiary Selection */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Subsidiary
                  </Label>
                  <Select 
                    value={formData.subsidiaryId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, subsidiaryId: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select your subsidiary" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="genomac_holdings">Genomac Holdings (Administrator)</SelectItem>
                      {subsidiaries.map((subsidiary) => (
                        <SelectItem key={subsidiary.id} value={subsidiary.id}>
                          {subsidiary.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter your password (min. 6 characters)"
                      disabled={isLoading}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm your password"
                      disabled={isLoading}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Admin Key */}
                <div className="space-y-2">
                  <Label htmlFor="adminKey" className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Admin Key
                  </Label>
                  <div className="relative">
                    <Input
                      id="adminKey"
                      type={showAdminKey ? 'text' : 'password'}
                      value={formData.adminKey}
                      onChange={(e) => setFormData(prev => ({ ...prev, adminKey: e.target.value }))}
                      placeholder="Enter the admin key"
                      disabled={isLoading}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminKey(!showAdminKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showAdminKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Required admin key to register as an administrator
                  </p>
                </div>

                {/* Error Message */}
                {registerError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{registerError}</AlertDescription>
                  </Alert>
                )}

                {/* Register Button */}
                <Button 
                  type="submit" 
                  className="w-full h-11" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Administrator Account
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Selected Subsidiary Info */}
          <div className="space-y-6">
            {formData.subsidiaryId && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {formData.subsidiaryId === 'genomac_holdings' ? (
                      <Shield className="w-5 h-5 text-purple-600" />
                    ) : selectedSubsidiary ? (
                      <img 
                        src={selectedSubsidiary.logo} 
                        alt={selectedSubsidiary.name}
                        className="h-5 w-5 rounded"
                      />
                    ) : (
                      <Building2 className="w-5 h-5 text-gray-400" />
                    )}
                    {formData.subsidiaryId === 'genomac_holdings' 
                      ? 'Holdings Administrator'
                      : selectedSubsidiary?.name || 'Selected Subsidiary'
                    }
                  </CardTitle>
                  <CardDescription>
                    {formData.subsidiaryId === 'genomac_holdings' 
                      ? 'Full access to all subsidiaries and programs'
                      : `Administrative access for ${selectedSubsidiary?.name}`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {formData.subsidiaryId === 'genomac_holdings' ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Manage all subsidiaries</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Access all analytics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Create and manage programs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Generate certificates</span>
                      </div>
                    </div>
                  ) : selectedSubsidiary && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">{selectedSubsidiary.programs.length} programs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">Manage subsidiary programs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">Generate certificates</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">View analytics</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Admin Key Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Key className="w-4 h-4 text-amber-500" />
                  Admin Key Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    An admin key is required to register as an administrator. 
                    Contact your system administrator to obtain the admin key.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    🔐 This ensures only authorized personnel can create admin accounts
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2025 Genomac Holdings. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Secure certificate management platform for all Genomac subsidiaries.
          </p>
        </div>
      </div>
    </div>
  );
}
