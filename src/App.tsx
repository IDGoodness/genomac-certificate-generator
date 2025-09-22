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

// Import the provided logos
import genomacInstituteLogo from "./assets/genomacinstitutelogo.png";
import genomacLabsLogo from "./assets/genomaclabs.png";
import gscLogo from "./assets/gsclogo.png";
import gnaturesLogo from "./assets/gnaturesround.png";
import gihubLogo from "./assets/gihublogo.png";

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
  role: "holdings_admin" | "subsidiary_admin";
  company: string;
  subsidiary: Subsidiary | null;
  canSwitchSubsidiaries: boolean;
  permissions: string[];
}

// Initial Genomac Holdings subsidiaries with realistic programs and proper logos
const initialSubsidiaries: Subsidiary[] = [
  {
    id: "genomac_institute",
    name: "Genomac Institute Inc.",
    shortName: "Institute",
    logo: genomacInstituteLogo, // Distinct Institute logo (Holdings is NOT a subsidiary)
    primaryColor: "#6366f1",
    // Allow the institute mentorship template in addition to defaults
    allowedTemplates: ["1", "2", "institute-mentorship"],
    programs: [
      {
        id: "bioinformatics-certificate",
        name: "Bioinformatics Certificate Program",
        template: "1", // Research/certificate program
        certificates: 342,
        testimonials: 125,
        description:
          "Comprehensive program in genomics, proteomics, and computational biology analysis",
      },
      {
        id: "genomic-medicine",
        name: "Genomic Medicine Specialization",
        template: "2", // Advanced specialization program
        certificates: 198,
        testimonials: 87,
        description:
          "Advanced training in personalized medicine and genetic counseling",
      },
      {
        id: "research-methods",
        name: "Scientific Research Methodology",
        template: "institute-mentorship", // Research-focused program
        certificates: 156,
        testimonials: 64,
        description:
          "Research design, data analysis, and publication strategies for life sciences",
      },
    ],
  },
  {
    id: "genomac_services_and_consult",
    name: "Genomac Services and Consult (GSC)",
    shortName: "GSC",
    logo: gscLogo, // Using specific GSC logo
    primaryColor: "#059669",
    programs: [
      {
        id: "business-analytics",
        name: "Healthcare Business Analytics",
        template: "5", // GSC Template 1
        certificates: 278,
        testimonials: 104,
        description: "Data-driven decision making for healthcare organizations",
      },
      {
        id: "quality-management",
        name: "Healthcare Quality Management",
        template: "5", // GSC Template 1
        certificates: 189,
        testimonials: 73,
        description:
          "Quality assurance and regulatory compliance in healthcare settings",
      },
      {
        id: "project-management",
        name: "Healthcare Project Management",
        template: "6", // GSC Template 2
        certificates: 145,
        testimonials: 58,
        description:
          "Specialized project management for healthcare and biotech initiatives",
      },
    ],
  },
  {
    id: "genomac_innovation_hub",
    name: "Genomac Innovation Hub (G-iHub)",
    shortName: "G-iHub",
    logo: gihubLogo, // Orange G-iHub logo as specified
    primaryColor: "#ea580c", // Updated to match the orange theme
    programs: [
      {
        id: "innovation-leadership",
        name: "Innovation Leadership Program",
        template: "3", // G-iHub Template 1
        certificates: 167,
        testimonials: 89,
        description:
          "Leading innovation teams and driving technological advancement",
      },
      {
        id: "startup-bootcamp",
        name: "Biotech Startup Bootcamp",
        template: "3", // G-iHub Template 1
        certificates: 134,
        testimonials: 67,
        description:
          "Entrepreneurship focused on biotechnology and life sciences startups",
      },
      {
        id: "digital-health",
        name: "Digital Health Innovation",
        template: "4", // G-iHub Template 2
        certificates: 98,
        testimonials: 45,
        description:
          "Developing digital solutions for modern healthcare challenges",
      },
    ],
  },
  {
    id: "g_natures",
    name: "GNATURES",
    shortName: "GNATURES",
    logo: gnaturesLogo, // Using specific GNATURES logo
    primaryColor: "#84cc16", // Green to match the natural theme of the logo
    programs: [
      {
        id: "natural-products",
        name: "Natural Products Research",
        template: "7", // GNATURES Template 1
        certificates: 112,
        testimonials: 47,
        description: "Discovery and development of natural bioactive compounds",
      },
      {
        id: "ethnobotany",
        name: "Ethnobotany and Traditional Medicine",
        template: "7", // GNATURES Template 1
        certificates: 89,
        testimonials: 38,
        description:
          "Integration of traditional knowledge with modern scientific methods",
      },
      {
        id: "sustainable-biotech",
        name: "Sustainable Biotechnology",
        template: "8", // GNATURES Template 2
        certificates: 76,
        testimonials: 32,
        description:
          "Environmentally conscious approaches to biotechnology development",
      },
    ],
  },
  {
    id: "genomac_labs",
    name: "Genomac Labs, Lagos",
    shortName: "Labs Lagos",
    logo: genomacLabsLogo, // Using the specific Labs logo
    primaryColor: "#7c3aed", // Purple to match the logo design
    programs: [
      {
        id: "lab-techniques",
        name: "Advanced Laboratory Techniques",
        template: "9", // Labs Template 1
        certificates: 234,
        testimonials: 96,
        description:
          "Hands-on training in modern molecular biology and biochemistry techniques",
      },
      {
        id: "diagnostic-methods",
        name: "Clinical Diagnostic Methods",
        template: "9", // Labs Template 2
        certificates: 167,
        testimonials: 71,
        description:
          "Laboratory diagnostics for infectious diseases and genetic disorders",
      },
      {
        id: "lab-management",
        name: "Laboratory Management and Safety",
        template: "10", // Labs Template 1
        certificates: 143,
        testimonials: 59,
        description:
          "Management principles and safety protocols for clinical laboratories",
      },
    ],
  },
];

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
      // Proactively log out sooner than backend JWT expiry to avoid stuck sessions
      config: {
        sessionTimeout: 10 * 60 * 1000, // 10 minutes inactivity
        warningTime: 3 * 60 * 1000, // warn 3 minutes before
        checkInterval: 30 * 1000, // check every 30s
      },
    });

  // Also schedule logout aligned with JWT expiry (if token has exp), with a small safety margin
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

  // Local state for subsidiaries and UI
  const [subsidiaries, setSubsidiaries] =
    useState<Subsidiary[]>(initialSubsidiaries);
  const [showRegister, setShowRegister] = useState(false);

  // Restore authentication session on app mount
  useEffect(() => {
    // console.log('🚀 App mounting, attempting to restore auth session...');
    restoreSession(subsidiaries);
  }, [restoreSession, subsidiaries]);

  // Authentication handlers - much simpler now!
  const handleLogout = () => {
    // console.log('🚪 App handling logout...');
    logout(); // Zustand handles all the cleanup
  };

  // Function to update subsidiary data (add programs, update certificate counts, etc.)
  const updateSubsidiary = (
    subsidiaryId: string,
    updates: Partial<Subsidiary>
  ) => {
    setSubsidiaries((prev) =>
      prev.map((sub) =>
        sub.id === subsidiaryId ? { ...sub, ...updates } : sub
      )
    );
  };

  // Function to add new program
  const addProgramToSubsidiary = (
    subsidiaryId: string,
    newProgram: Program
  ) => {
    setSubsidiaries((prev) =>
      prev.map((sub) =>
        sub.id === subsidiaryId
          ? { ...sub, programs: [...sub.programs, newProgram] }
          : sub
      )
    );
  };

  // Function to update program statistics (when certificates are generated)
  const updateProgramStats = (
    subsidiaryId: string,
    programId: string,
    certificateCount: number
  ) => {
    setSubsidiaries((prev) =>
      prev.map((sub) =>
        sub.id === subsidiaryId
          ? {
              ...sub,
              programs: sub.programs.map((prog) =>
                prog.id === programId
                  ? {
                      ...prog,
                      certificates: prog.certificates + certificateCount,
                    }
                  : prog
              ),
            }
          : sub
      )
    );
  };

  // Function to update program details (including template)
  const updateProgram = (
    subsidiaryId: string,
    programId: string,
    updates: Partial<Program>
  ) => {
    setSubsidiaries((prev) =>
      prev.map((sub) =>
        sub.id === subsidiaryId
          ? {
              ...sub,
              programs: sub.programs.map((prog) =>
                prog.id === programId ? { ...prog, ...updates } : prog
              ),
            }
          : sub
      )
    );
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
                      subsidiaries={subsidiaries}
                      onBackToLogin={() => setShowRegister(false)}
                    />
                  ) : (
                    <AdminLogin
                      subsidiaries={subsidiaries}
                      onRegister={() => setShowRegister(true)}
                    />
                  )
                }
              />

              {/* Dashboard route - protected */}
              <Route
                path="/dashboard"
                element={
                  isAuthenticated && user ? (
                    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
                      <AdminDashboard
                        user={user}
                        subsidiaries={subsidiaries}
                        onLogout={handleLogout}
                        onUpdateSubsidiary={updateSubsidiary}
                        onAddProgram={addProgramToSubsidiary}
                        onUpdateProgramStats={updateProgramStats}
                        onUpdateProgram={updateProgram}
                      />
                    </div>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              {/* Student certificate routes - public */}
              {/* New encrypted route */}
              <Route
                path="/certificate/:encryptedData"
                element={<StudentCertificate subsidiaries={subsidiaries} />}
              />
              {/* Legacy unencrypted route for backward compatibility */}
              <Route
                path="/certificate/:subsidiaryId/:programId/:certificateId"
                element={<StudentCertificate subsidiaries={subsidiaries} />}
              />

              {/* Default route - redirect to login if not authenticated, dashboard if authenticated */}
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
              // Extend both the session manager timers and auth session timestamp
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
