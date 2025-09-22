import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  LogIn, 
  Shield, 
  Building2, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Crown,
  Lock,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import type { Subsidiary } from '../App';
import Logo from "../assets/genomacholdingslogo.png";
import ThemeToggle from './ThemeToggle';
import type { LoginRequest } from '../services/auth.service';
import { useAuthStore } from '../stores/authStore';
// Counts are intentionally not shown on the login page

interface AdminLoginProps {
  subsidiaries: Subsidiary[];
  onRegister?: () => void;
}

interface LoginCredentials {
  username: string;
  password: string;
  selectedSubsidiaryId: string | null;
}

export default function AdminLogin({ subsidiaries, onRegister }: AdminLoginProps) {
  // Use Zustand store for login action
  const { login, isLoading: authLoading } = useAuthStore();
  
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
    selectedSubsidiaryId: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Certificate counts removed

  // Use auth loading state from store
  const isLoading = authLoading;

  const handleSubsidiarySelect = (subsidiaryId: string) => {
    setCredentials(prev => ({
      ...prev,
      selectedSubsidiaryId: subsidiaryId,
      username: '',
      password: ''
    }));
    setLoginError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!credentials.selectedSubsidiaryId) {
      setLoginError('Please select a subsidiary to sign in to');
      return;
    }

    if (!credentials.username || !credentials.password) {
      setLoginError('Please enter both username and password');
      return;
    }

    try {
      // Use Zustand login action - it handles everything!
      const loginData: LoginRequest = {
        email: credentials.username,
        password: credentials.password
      };

      // console.log('🔐 Attempting login with Zustand store...');
      await login(loginData, subsidiaries);
      
      // If we get here, login was successful!
      // The store handles all the state updates and navigation will happen automatically
      const selectedSubsidiaryName = credentials.selectedSubsidiaryId === 'genomac_holdings' 
        ? 'Genomac Holdings' 
        : subsidiaries.find(s => s.id === credentials.selectedSubsidiaryId)?.name;
        
      toast.success(`Welcome back! Signed in successfully to ${selectedSubsidiaryName}`);
      // console.log('✅ Login successful, redirecting...');
      
    } catch (error) {
      // console.error('❌ Login error:', error);
      setLoginError(error instanceof Error ? error.message : 'Invalid username or password');
    }
  };

  

  const selectedSubsidiary = credentials.selectedSubsidiaryId 
    ? subsidiaries.find(s => s.id === credentials.selectedSubsidiaryId)
    : null;

  // No aggregate counts displayed on login

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        
        {/* Theme Toggle - positioned in top right */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
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
          <Badge className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 px-4 py-2">
            <Shield className="w-4 h-4 mr-2" />
            Administrator Portal
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Subsidiary Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-500" />
                  Select Your Subsidiary
                </CardTitle>
                <CardDescription>
                  Choose the subsidiary you want to administer from the Genomac Holdings portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  
                  {/* Holdings Admin Option */}
                  <button
                    onClick={() => handleSubsidiarySelect('genomac_holdings')}
                    className={`p-4 rounded-xl border-2 transition-all hover:shadow-lg ${
                      credentials.selectedSubsidiaryId === 'genomac_holdings'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                        : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="">
                        <img src={Logo} alt="Holdings" className="h-12 w-12 rounded-lg object-contain" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Holdings Admin</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Full platform access</p>
                        <Badge variant="outline" className="mt-2 text-xs">All Subsidiaries</Badge>
                      </div>
                    </div>
                  </button>

                  {/* Subsidiary Options */}
                  {subsidiaries.map((subsidiary) => (
                    <button
                      key={subsidiary.id}
                      onClick={() => handleSubsidiarySelect(subsidiary.id)}
                      className={`p-4 rounded-xl border-2 transition-all hover:shadow-lg ${
                        credentials.selectedSubsidiaryId === subsidiary.id
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                          : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center space-y-3  ">
                        <img 
                          src={subsidiary.logo}
                          alt={subsidiary.name}
                          className="h-12 w-12 rounded-lg object-contain "
                        />
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">{subsidiary.shortName}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{subsidiary.name}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Login Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {credentials.selectedSubsidiaryId === 'genomac_holdings' ? (
                    <Crown className="w-5 h-5 text-purple-600" />
                  ) : selectedSubsidiary ? (
                    <img 
                      src={selectedSubsidiary.logo} 
                      alt={selectedSubsidiary.name}
                      className="h-5 w-5 rounded"
                    />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                  Administrator Sign In
                </CardTitle>
                <CardDescription>
                  {credentials.selectedSubsidiaryId === 'genomac_holdings' 
                    ? 'Sign in as Holdings Administrator'
                    : selectedSubsidiary 
                    ? `Sign in to ${selectedSubsidiary.name}`
                    : 'Select a subsidiary first'
                  }
                </CardDescription>
                {/* Context badges removed intentionally */}
              </CardHeader>
              <CardContent>
                {!credentials.selectedSubsidiaryId ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please select a subsidiary from the options on the left to continue.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-4">
                    {/* Username */}
                    <div className="space-y-2">
                      <label htmlFor="username">Email Address</label>
                      <Input
                        id="username"
                        type="email"
                        value={credentials.username}
                        onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Enter your email"
                        disabled={isLoading}
                        className="h-11"
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <label htmlFor="password">Password</label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={credentials.password}
                          onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter your password"
                          disabled={isLoading}
                          className="h-11 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Error Message */}
                    {loginError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{loginError}</AlertDescription>
                      </Alert>
                    )}

                    {/* Login Button */}
                    <Button 
                      type="submit" 
                      className="w-full h-11" 
                      disabled={isLoading || !credentials.username || !credentials.password}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Signing In...
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign In
                        </>
                      )}
                    </Button>

                    {/* Register Button */}
                    {onRegister && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          Don't have an account?
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={onRegister}
                          className="w-full h-11"
                          disabled={isLoading}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Register as Administrator
                        </Button>
                      </div>
                    )}
                  </form>
                )}
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