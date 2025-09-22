import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import SessionManager, { type SessionConfig, type SessionCallbacks } from '../utils/sessionManager';

interface UseSessionManagerOptions {
  enabled?: boolean;
  config?: Partial<SessionConfig>;
  onLogout: () => void;
  onWarning?: (timeRemaining: number) => void;
  onSessionExtended?: () => void;
}

interface UseSessionManagerReturn {
  showWarning: boolean;
  timeRemaining: number;
  extendSession: () => void;
  logoutNow: () => void;
  isSessionActive: boolean;
}

/**
 * Custom hook for managing user sessions with automatic logout
 */
export function useSessionManager({
  enabled = true,
  config,
  onLogout,
  onWarning,
  onSessionExtended
}: UseSessionManagerOptions): UseSessionManagerReturn {
  const sessionManagerRef = useRef<SessionManager | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);

  useEffect(() => {
    if (!enabled) {
      // Clean up if disabled
      if (sessionManagerRef.current) {
        sessionManagerRef.current.stop();
        sessionManagerRef.current = null;
        setIsSessionActive(false);
        setShowWarning(false);
      }
      return;
    }

    // console.log('🔧 Setting up session manager...');

    const callbacks: SessionCallbacks = {
      onWarning: (timeLeft: number) => {
        // console.log('⚠️ Session warning triggered:', timeLeft);
        setShowWarning(true);
        setTimeRemaining(timeLeft);
        
        // Show toast notification
        toast.warning('Your session will expire soon due to inactivity', {
          description: `You'll be logged out in ${SessionManager.formatTime(timeLeft)}`,
          duration: 5000,
        });
        
        // Call custom warning handler if provided
        if (onWarning) {
          onWarning(timeLeft);
        }
      },

      onLogout: () => {
        // console.log('🚪 Session expired, logging out...');
        setShowWarning(false);
        setIsSessionActive(false);
        
        // Show expiration toast
        toast.error('Session expired due to inactivity', {
          description: 'You have been logged out due to inactivity.',
          duration: 5000,
        });
        
        // Clean up session manager
        if (sessionManagerRef.current) {
          sessionManagerRef.current.stop();
          sessionManagerRef.current = null;
        }
        
        // Call logout handler
        onLogout();
      },

      onSessionExtended: () => {
        // console.log('✅ Session extended');
        setShowWarning(false);
        
        // Call custom session extended handler if provided
        if (onSessionExtended) {
          onSessionExtended();
        }
      }
    };

    // Create and start session manager
    sessionManagerRef.current = new SessionManager(callbacks, config);
    sessionManagerRef.current.start();
    setIsSessionActive(true);

    // Cleanup on unmount
    return () => {
      if (sessionManagerRef.current) {
        // console.log('🧹 Cleaning up session manager...');
        sessionManagerRef.current.stop();
        sessionManagerRef.current = null;
      }
      setIsSessionActive(false);
      setShowWarning(false);
    };
  }, [enabled, onLogout, onWarning, onSessionExtended, config]);

  const extendSession = () => {
    if (sessionManagerRef.current) {
      sessionManagerRef.current.extendSession();
      setShowWarning(false);
      
      toast.success('Session extended successfully!', {
        description: 'Your session has been renewed.',
        duration: 3000,
      });
    }
  };

  const logoutNow = () => {
    if (sessionManagerRef.current) {
      sessionManagerRef.current.stop();
      sessionManagerRef.current = null;
    }
    
    setShowWarning(false);
    setIsSessionActive(false);
    
    toast.info('Logged out manually', {
      description: 'You have been logged out.',
      duration: 3000,
    });
    
    onLogout();
  };

  return {
    showWarning,
    timeRemaining,
    extendSession,
    logoutNow,
    isSessionActive
  };
}
