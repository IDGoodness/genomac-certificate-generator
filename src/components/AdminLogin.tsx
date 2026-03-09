import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import {
  LogIn,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  Lock,
  UserPlus,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import Logo from "../assets/genomacholdingslogo.png";
import ThemeToggle from "./ThemeToggle";
import type { LoginRequest } from "../services/auth.service";
import { useAuthStore } from "../stores/authStore";

interface AdminLoginProps {
  onRegister?: () => void;
}

interface LoginCredentials {
  username: string;
  password: string;
}

export default function AdminLogin({ onRegister }: AdminLoginProps) {
  const { login, isLoading: authLoading } = useAuthStore();

  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const isLoading = authLoading;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!credentials.username || !credentials.password) {
      setLoginError("Please enter both email and password");
      return;
    }

    try {
      const loginData: LoginRequest = {
        email: credentials.username,
        password: credentials.password,
      };

      await login(loginData);

      toast.success("Welcome back! Signed in successfully");
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "Invalid email or password"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Theme Toggle - positioned in top right */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img
              src={Logo}
              alt="Genomac"
              className="h-16 w-auto rounded-lg shadow-md"
            />
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Genomac
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Certificate Platform
              </p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 px-4 py-2">
            <Shield className="w-4 h-4 mr-2" />
            Administrator Portal
          </Badge>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              Sign In
            </CardTitle>
            <CardDescription>
              Enter your credentials to access the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <Input
                  id="username"
                  type="email"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  placeholder="Enter your email"
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Enter your password"
                    disabled={isLoading}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
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
                disabled={
                  isLoading || !credentials.username || !credentials.password
                }
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
                <div className="text-center pt-4 border-t">
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
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2025 Genomac. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Secure certificate management platform
          </p>
        </div>
      </div>
    </div>
  );
}
