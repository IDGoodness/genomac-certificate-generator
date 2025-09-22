import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { authService, type ChangePasswordRequest } from '../services/auth.service';

interface ChangePasswordFormProps {
    onClose?: () => void;
}

interface PasswordData {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export default function ChangePasswordForm({ onClose }: ChangePasswordFormProps) {
  const [passwordData, setPasswordData] = useState<PasswordData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): string | null => {
    if (!passwordData.oldPassword) return 'Current password is required';
    if (!passwordData.newPassword) return 'New password is required';
    if (passwordData.newPassword.length < 6) return 'New password must be at least 6 characters';
    if (passwordData.newPassword !== passwordData.confirmPassword) return 'New passwords do not match';
    if (passwordData.oldPassword === passwordData.newPassword) return 'New password must be different from current password';
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const changePasswordRequest: ChangePasswordRequest = {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      };

      await authService.changePassword(changePasswordRequest);
      
      toast.success('Password changed successfully!');
      
      // Clear the form
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Close the form if onClose is provided
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Change password error:', error);
      setError(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Change Password
        </CardTitle>
        <CardDescription>
          Update your account password for security
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <label htmlFor="oldPassword" className="text-sm font-medium">
              Current Password
            </label>
            <div className="relative">
              <Input
                id="oldPassword"
                type={showOldPassword ? 'text' : 'password'}
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                placeholder="Enter your current password"
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-medium">
              New Password
            </label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter your new password"
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm New Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm your new password"
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
        <div className="flex gap-2">
            <Button 
                type="submit" 
                className="flex-1" 
                disabled={isLoading || !passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            >
                {isLoading ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Changing...
                </>
                ) : (
                <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Change Password
                </>
                )}
            </Button>
        
            {onClose && (
                <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
                >
                Cancel
                </Button>
            )}
        </div>
        </form>
      </CardContent>
    </Card>
  );
}
