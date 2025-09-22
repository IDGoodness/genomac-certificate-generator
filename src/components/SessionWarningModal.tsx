import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import SessionManager from '../utils/sessionManager';

interface SessionWarningModalProps {
  isVisible: boolean;
  timeRemaining: number;
  onExtendSession: () => void;
  onLogoutNow: () => void;
}

export default function SessionWarningModal({ 
  isVisible, 
  timeRemaining, 
  onExtendSession, 
  onLogoutNow 
}: SessionWarningModalProps) {
  const [countdown, setCountdown] = useState(timeRemaining);

  useEffect(() => {
    if (!isVisible) return;

    setCountdown(timeRemaining);
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        const newValue = prev - 1000;
        if (newValue <= 0) {
          clearInterval(interval);
          return 0;
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, timeRemaining]);

  if (!isVisible) return null;

  const isUrgent = countdown <= 60000; // Less than 1 minute

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className={`w-full max-w-md mx-auto ${isUrgent ? 'border-red-500 shadow-red-500/25' : 'border-orange-500 shadow-orange-500/25'} shadow-2xl animate-pulse`}>
        <CardHeader className={`${isUrgent ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'} border-b`}>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className={`p-2 rounded-full ${isUrgent ? 'bg-red-100' : 'bg-orange-100'}`}>
              <AlertTriangle className={`w-5 h-5 ${isUrgent ? 'text-red-600' : 'text-orange-600'}`} />
            </div>
            Session Expiring Soon
          </CardTitle>
          <CardDescription className={isUrgent ? 'text-red-700' : 'text-orange-700'}>
            Your session will expire due to inactivity
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-4">
          <Alert className={isUrgent ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}>
            <Clock className={`h-4 w-4 ${isUrgent ? 'text-red-600' : 'text-orange-600'}`} />
            <AlertDescription className={`font-semibold ${isUrgent ? 'text-red-800' : 'text-orange-800'}`}>
              <div className="flex items-center justify-between">
                <span>Time remaining:</span>
                <span className={`text-lg font-mono ${isUrgent ? 'text-red-700' : 'text-orange-700'}`}>
                  {SessionManager.formatTime(countdown)}
                </span>
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              For your security, you'll be automatically logged out due to inactivity. 
              Click "Stay Logged In" to continue your session.
            </p>
            
            <div className="flex gap-3">
              <Button
                onClick={onExtendSession}
                className="flex-1 bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Stay Logged In
              </Button>
              
              <Button
                onClick={onLogoutNow}
                variant="outline"
                className={`border-gray-300 text-gray-600 hover:bg-gray-50 ${isUrgent ? 'hover:border-red-300 hover:text-red-600 hover:bg-red-50' : ''}`}
                size="lg"
              >
                Logout Now
              </Button>
            </div>
          </div>

          <div className="text-xs text-gray-500 pt-2 border-t">
            <p><strong>Tip:</strong> Any activity (clicking, typing, scrolling) will automatically extend your session.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
