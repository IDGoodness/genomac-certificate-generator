import { useState, useEffect } from "react";
import { Toaster } from "./components/ui/sonner";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminLogin from "./components/AdminLogin";
import AdminRegister from "./components/AdminRegister";
import AdminDashboard from "./components/AdminDashboard";
import StudentCertificate from "./components/StudentCertificate";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuthStore } from "./stores/authStore";
import { useSessionManager } from "./hooks/useSessionManager";
import SessionWarningModal from "./components/SessionWarningModal";

// TypeScript interfaces
interface Program {
  id: string;
  name: string;
  template:
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "10"
    | "institute-mentorship";
  certificates: number;
  testimonials: number;
  description: string;
  duration?: string;
  prerequisites?: string;
  createdAt?: string;
  createdBy?: string;
  allowedTemplates?: string[];
}

interface Subsidiary {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  primaryColor: string;
  programs: Program[];
  allowedTemplates?: string[];
}

interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  role: "admin" | "holdings_admin" | "subsidiary_admin";
  company: string;
  permissions: string[];
  subsidiary?: Subsidiary | null;
  canSwitchSubsidiaries?: boolean;
}

export default function App() {
  const {
    user,
    isAuthenticated,
    isLoading,
    token,
    restoreSession,
    logout,
    extendSession: extendAuthSession,
  } = useAuthStore();

  // Session management - handles auto-logout and session warnings
  const { showWarning, timeRemaining, extendSession, logoutNow } =
    useSessionManager({
      onLogout: logout,
      onSessionExtended: extendAuthSession,
      config: {
        sessionTimeout: 10 * 60 * 1000, // 10 minutes inactivity
        warningTime: 3 * 60 * 1000, // warn 3 minutes before
        checkInterval: 30 * 1000, // check every 30s
      },
    });

  // Schedule logout aligned with JWT expiry
  useEffect(() => {
    if (!token) return;
    const decodeExp = (jwt: string): number | null => {
      try {
        const parts = jwt.split(".");
        if (parts.length !== 3) return null;
        const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const json = atob(b64);
        const payload = JSON.parse(json) as { exp?: number };
        return payload.exp ? payload.exp * 1000 : null;
      } catch {
        return null;
      }
    };
    const expMs = decodeExp(token);
    if (!expMs) return;
    const safety = 60 * 1000; // 1 minute before exp
    const delay = Math.max(0, expMs - Date.now() - safety);
    const id = window.setTimeout(() => {
      logout();
    }, delay);
    return () => window.clearTimeout(id);
  }, [token, logout]);

  const [showRegister, setShowRegister] = useState(false);

  // Restore authentication session on app mount
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Authentication handlers
  const handleLogout = () => {
    logout();
  };

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen">
          {/* Show loading spinner during session restoration */}
          {isLoading ? (
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <Routes>
              {/* Sign-in route */}
              <Route
                path="/login"
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" replace />
                  ) : showRegister ? (
                    <AdminRegister
                      onBackToLogin={() => setShowRegister(false)}
                    />
                  ) : (
                    <AdminLogin onRegister={() => setShowRegister(true)} />
                  )
                }
              />

              {/* Dashboard route - protected */}
              <Route
                path="/dashboard"
                element={
                  isAuthenticated && user ? (
                    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
                      <AdminDashboard user={user} onLogout={handleLogout} />
                    </div>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              {/* Student certificate routes - public */}
              <Route
                path="/certificate/:encryptedData"
                element={<StudentCertificate />}
              />
              <Route
                path="/certificate/:subsidiaryId/:programId/:certificateId"
                element={<StudentCertificate />}
              />

              {/* Default route */}
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              {/* Catch all other routes */}
              <Route
                path="*"
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
            </Routes>
          )}
          {/* Global session warning modal */}
          <SessionWarningModal
            isVisible={showWarning}
            timeRemaining={timeRemaining}
            onExtendSession={() => {
              extendSession();
              extendAuthSession();
            }}
            onLogoutNow={logoutNow}
          />
        </div>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

// Export types for use in other components
export type { Program, Subsidiary, UserProfile };
