/**
 * Session Management Utility
 * Handles automatic logout based on user inactivity
 */

export interface SessionConfig {
  sessionTimeout: number;
  warningTime: number;
  checkInterval: number;
}

export interface SessionCallbacks {
  onWarning: (timeLeft: number) => void;
  onLogout: () => void;
  onSessionExtended?: () => void;
}

class SessionManager {
  private config: SessionConfig;
  private callbacks: SessionCallbacks;
  private lastActivity: number;
  private warningShown: boolean = false;
  private checkIntervalId: number | null = null;
  private activityListeners: Array<() => void> = [];

  // Default configuration: 2 hour session, 5 minute warning
  private static DEFAULT_CONFIG: SessionConfig = {
    sessionTimeout: 2 * 60 * 60 * 1000, // 2 hours
    warningTime: 5 * 60 * 1000, // 5 minutes
    checkInterval: 60 * 1000, // 1 minute
  };

  constructor(callbacks: SessionCallbacks, config?: Partial<SessionConfig>) {
    this.config = { ...SessionManager.DEFAULT_CONFIG, ...config };
    this.callbacks = callbacks;
    this.lastActivity = Date.now();
    
    // console.log('🕒 SessionManager initialized with config:', {
    //   sessionTimeout: `${this.config.sessionTimeout / (60 * 1000)} minutes`,
    //   warningTime: `${this.config.warningTime / (60 * 1000)} minutes`,
    //   checkInterval: `${this.config.checkInterval / 1000} seconds`
    // });
  }

  /**
   * Start session monitoring
   */
  start(): void {
    this.lastActivity = Date.now();
    this.warningShown = false;
    
    // Start activity tracking
    this.startActivityTracking();
    
    // Start session checking
    this.startSessionChecking();
  }

  /**
   * Stop session monitoring
   */
  stop(): void {
    // console.log('🛑 Stopping session monitoring...');
    this.stopActivityTracking();
    this.stopSessionChecking();
  }

  /**
   * Extend the session (reset the timer)
   */
  extendSession(): void {
    // console.log('⏰ Session extended due to user activity');
    this.lastActivity = Date.now();
    this.warningShown = false;
    
    if (this.callbacks.onSessionExtended) {
      this.callbacks.onSessionExtended();
    }
  }

  /**
   * Get remaining session time in milliseconds
   */
  getRemainingTime(): number {
    const elapsed = Date.now() - this.lastActivity;
    const remaining = this.config.sessionTimeout - elapsed;
    return Math.max(0, remaining);
  }

  /**
   * Check if session is expired
   */
  isExpired(): boolean {
    return this.getRemainingTime() <= 0;
  }

  /**
   * Check if we should show warning
   */
  shouldShowWarning(): boolean {
    const remaining = this.getRemainingTime();
    return remaining <= this.config.warningTime && remaining > 0;
  }

  /**
   * Start tracking user activity
   */
  private startActivityTracking(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const activityHandler = () => {
      this.extendSession();
    };

    events.forEach(event => {
      document.addEventListener(event, activityHandler, true);
      this.activityListeners.push(() => {
        document.removeEventListener(event, activityHandler, true);
      });
    });

    // console.log('👂 Activity tracking started for events:', events);
  }

  /**
   * Stop tracking user activity
   */
  private stopActivityTracking(): void {
    this.activityListeners.forEach(removeListener => removeListener());
    this.activityListeners = [];
    // console.log('🔇 Activity tracking stopped');
  }

  /**
   * Start periodic session checking
   */
  private startSessionChecking(): void {
    this.checkIntervalId = window.setInterval(() => {
      this.checkSession();
    }, this.config.checkInterval);
    
    // console.log('⏱️ Session checking started');
  }

  /**
   * Stop periodic session checking
   */
  private stopSessionChecking(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
      // console.log('⏹️ Session checking stopped');
    }
  }

  /**
   * Check current session status
   */
  private checkSession(): void {
    const remaining = this.getRemainingTime();
    
    if (this.isExpired()) {
      console.log('⏰ Session expired, triggering logout');
      this.stop();
      this.callbacks.onLogout();
      return;
    }

    if (this.shouldShowWarning() && !this.warningShown) {
      console.log('⚠️ Session warning triggered, time remaining:', remaining);
      this.warningShown = true;
      this.callbacks.onWarning(remaining);
    }
  }

  /**
   * Format time for display
   */
  static formatTime(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / (60 * 1000));
    const seconds = Math.floor((milliseconds % (60 * 1000)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }
}

export default SessionManager;
