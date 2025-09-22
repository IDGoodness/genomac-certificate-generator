import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import ChangePasswordForm from "./ChangePasswordForm";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Settings,
  BarChart3,
  Award,
  Share2,
  Building2,
  Plus,
  Shield,
  Zap,
  Eye,
  Download,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  CheckCircle,
  Search,
  Filter,
  AlertTriangle,
  Menu,
  X,
} from "lucide-react";
import SimpleCertificateModal from "./SimpleCertificateModal";
import CertificateList from "./CertificateList";
import NewProgramModal from "./NewProgramModal";
import CertificateTemplate from "./CertificateTemplate";
import ThemeToggle from "./ThemeToggle";
import { toast } from "sonner";
import type { Program, Subsidiary, UserProfile } from "../App";
import {
  certificateService,
  type Certificate,
} from "../services/certificate.service";
// Realtime analytics removed: imports and client usage cleaned up
type RealtimeCounts = {
  totalCertificates: number;
  totalTestimonials?: number;
  totalPrograms?: number;
  updatedAt: number;
};

// Import the Genomac Holdings logo
import genomacHoldingsLogo from "../assets/genomacholdingslogo.png"; // Holdings brand (not a subsidiary)

interface AdminDashboardProps {
  user: UserProfile;
  subsidiaries: Subsidiary[];
  onLogout: () => void;
  onUpdateSubsidiary: (
    subsidiaryId: string,
    updates: Partial<Subsidiary>
  ) => void;
  onAddProgram: (subsidiaryId: string, newProgram: Program) => void;
  onUpdateProgramStats: (
    subsidiaryId: string,
    programId: string,
    certificateCount: number
  ) => void;
  onUpdateProgram: (
    subsidiaryId: string,
    programId: string,
    updates: Partial<Program>
  ) => void;
}

export default function AdminDashboard({
  user,
  subsidiaries,
  // userProfiles,
  onLogout,
  // onUpdateSubsidiary,
  onAddProgram,
}: // onUpdateProgramStats,
// onUpdateProgram
AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  // Holdings admin: null = All Subsidiaries (umbrella, not itself a subsidiary)
  const [currentSubsidiary, setCurrentSubsidiary] = useState<Subsidiary | null>(
    (user.role as string) === "holdings_admin" ? null : user.subsidiary
  );
  const [showCertificateModal, setShowCertificateModal] =
    useState<boolean>(false);
  const [showNewProgramModal, setShowNewProgramModal] =
    useState<boolean>(false);
  const [showChangePassword, setShowChangePassword] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search and filter states
  const [testimonialSearch, setTestimonialSearch] = useState("");
  const [testimonialFilter, setTestimonialFilter] = useState("all");

  // Actual certificates data for real-time stats
  const [actualCertificates, setActualCertificates] = useState<Certificate[]>(
    []
  );
  const [loadingStats, setLoadingStats] = useState(true);
  // Realtime analytics state
  // Realtime analytics disabled (removed). Keep placeholders in state if needed.
  const [realtimeCounts] = useState<RealtimeCounts | null>(null);
  const [realtimeStatus] = useState<string>("disabled");

  // Helper: human readable time ago for realtime updates
  function formatTimeAgo(ts: number) {
    const diff = Date.now() - ts;
    if (diff < 5000) return "just now";
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return sec + "s ago";
    const min = Math.floor(sec / 60);
    if (min < 60) return min + "m ago";
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr + "h ago";
    const d = Math.floor(hr / 24);
    return d + "d ago";
  }

  // Student Experience Preview States
  const [currentStep, setCurrentStep] = useState<
    "name-input" | "testimonial" | "certificate"
  >("name-input");
  const [studentName, setStudentName] = useState("");
  const [previewCertificateId] = useState("PREVIEW-DEMO-123");

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoadingStats(true);

        if ((user.role as string) === "holdings_admin") {
          // Holdings admin: fetch certificates based on current subsidiary selection
          if (currentSubsidiary) {
            // Fetch certificates for the selected subsidiary only
            // onsole.log('Holdings admin: Fetching certificates for subsidiary:', currentSubsidiary.shortName);
            const certificates =
              await certificateService.getCertificatesBySubsidiary(
                currentSubsidiary.id
              );
            console.log(
              "📊 Fetched certificates for",
              currentSubsidiary.shortName,
              ":",
              certificates
            );
            setActualCertificates(certificates);
          } else {
            // Fetch all certificates when viewing "All Subsidiaries"
            console.log(
              "📊 Holdings admin: Fetching all certificates (All Subsidiaries view)"
            );
            const certificates =
              await certificateService.getCertificatesBySubsidiary();
            // console.log('📊 Fetched all certificates:', certificates);
            setActualCertificates(certificates);
          }
        } else if (user.subsidiary) {
          // Subsidiary admin: fetch only their subsidiary's certificates
          // console.log('📊 Subsidiary admin: Fetching certificates for:', user.subsidiary.shortName);
          const certificates =
            await certificateService.getCertificatesBySubsidiary(
              user.subsidiary.id
            );
          console.log(
            "📊 Fetched certificates for",
            user.subsidiary.shortName,
            ":",
            certificates
          );
          setActualCertificates(certificates);
        } else {
          console.log("📊 No subsidiary found for user, using static data");
        }
      } catch (error) {
        console.error("Failed to fetch certificates for stats:", error);
        // Fall back to using static program data
        setActualCertificates([]);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchCertificates();
  }, [user.role, user.subsidiary, currentSubsidiary]);

  // Realtime analytics removed. No side effect required.

  // Calculate statistics based on current view
  const getStats = () => {
    if (
      (user.role as string) === "holdings_admin" &&
      user.canSwitchSubsidiaries
    ) {
      // Holdings admin sees aggregated data from all subsidiaries or selected subsidiary
      const targetSubsidiaries = currentSubsidiary
        ? [currentSubsidiary]
        : subsidiaries;

      // Use actual certificate data if available, otherwise fall back to static program data
      let totalCertificates = 0;
      if (actualCertificates.length > 0 || loadingStats === false) {
        // Use actual API data (including when count is 0)
        if (currentSubsidiary) {
          // Viewing specific subsidiary - use filtered certificates or direct count
          totalCertificates = actualCertificates.filter(
            (cert) => cert.subsidiary === currentSubsidiary.id
          ).length;
        } else {
          // Viewing all subsidiaries - use total count
          // Note: When viewing "All Subsidiaries", we fetch all certificates so this is the total
          totalCertificates = actualCertificates.length;
        }
      } else {
        // Fall back to static program data while loading
        totalCertificates = targetSubsidiaries.reduce(
          (sum: number, sub: Subsidiary) =>
            sum +
            sub.programs.reduce(
              (progSum: number, prog: Program) => progSum + prog.certificates,
              0
            ),
          0
        );
      }

      return {
        totalCertificates,
        totalTestimonials: targetSubsidiaries.reduce(
          (sum: number, sub: Subsidiary) =>
            sum +
            sub.programs.reduce(
              (progSum: number, prog: Program) => progSum + prog.testimonials,
              0
            ),
          0
        ),
        totalPrograms: targetSubsidiaries.reduce(
          (sum: number, sub: Subsidiary) => sum + sub.programs.length,
          0
        ),
        activeSubsidiaries: targetSubsidiaries.length,
        totalShares: 247, // Mock data for now
      };
    } else {
      // Subsidiary admin sees only their own data
      const targetSub = currentSubsidiary || user.subsidiary;
      if (!targetSub) {
        return {
          totalCertificates: 0,
          totalTestimonials: 0,
          totalPrograms: 0,
          averageEngagement: 0,
        };
      }

      // Use actual certificate data if available, otherwise fall back to static program data
      let totalCertificates = 0;
      if (actualCertificates.length > 0 || loadingStats === false) {
        // Use actual API data (including when count is 0)
        totalCertificates = actualCertificates.length; // Since we fetch only this subsidiary's certificates
      } else {
        // Fall back to static program data while loading
        totalCertificates = targetSub.programs.reduce(
          (sum: number, p: Program) => sum + p.certificates,
          0
        );
      }

      return {
        totalCertificates,
        totalTestimonials: targetSub.programs.reduce(
          (sum: number, p: Program) => sum + p.testimonials,
          0
        ),
        totalPrograms: targetSub.programs.length,
        averageEngagement: Math.floor(
          (targetSub.programs.reduce(
            (sum: number, p: Program) => sum + p.testimonials,
            0
          ) /
            Math.max(totalCertificates, 1)) *
            100
        ),
      };
    }
  };

  const stats = getStats();
  const effectiveTotalCertificates =
    realtimeCounts?.totalCertificates ?? stats.totalCertificates;

  // Student Experience Preview Functions
  const demoSubsidiary = currentSubsidiary || subsidiaries[0];
  const demoProgram = demoSubsidiary?.programs[0];

  const shareToSocialMedia = (platform: string) => {
    const demoUrl = `${window.location.origin}/certificate/${demoSubsidiary?.id}/${demoProgram?.id}/${previewCertificateId}`;
    const text = `Proud to have completed the ${demoProgram?.name} at ${demoSubsidiary?.name}! 🎓 #Certificate #Achievement`;

    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          demoUrl
        )}&quote=${encodeURIComponent(text)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}&url=${encodeURIComponent(demoUrl)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          demoUrl
        )}&summary=${encodeURIComponent(text)}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(
          text + " " + demoUrl
        )}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
      toast.success(`Opening ${platform} to share your certificate!`);
    }
  };

  const resetPreview = () => {
    setCurrentStep("name-input");
    setStudentName("");
  };

  // Reset preview when switching tabs
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== "preview" && currentStep !== "name-input") {
      resetPreview();
    }
  };

  // Handle certificate generation callback
  // const handleCertificatesGenerated = (
  //   certificates: GeneratedCertificate[]
  // ) => {
  //   setGeneratedCertificates(certificates);
  //   if (certificates.length > 0) {
  //     setStudentName(certificates[0].studentName);
  //     setCurrentStep('certificate');
  //     setActiveTab('preview');
  //     toast.success('Switching to certificate preview...');
  //   }
  // };

  // Generate analytics data
  // const generateAnalyticsData = () => {
  //   const targetSubsidiaries = user.role === 'holdings_admin'
  //     ? (currentSubsidiary ? [currentSubsidiary] : subsidiaries)
  //     : (user.subsidiary ? [user.subsidiary] : []);

  //   const monthlyData = [
  //     { month: 'Jan', certificates: 45, testimonials: 12 },
  //     { month: 'Feb', certificates: 78, testimonials: 25 },
  //     { month: 'Mar', certificates: 123, testimonials: 43 },
  //     { month: 'Apr', certificates: 89, testimonials: 31 },
  //     { month: 'May', certificates: 156, testimonials: 67 },
  //     { month: 'Jun', certificates: 234, testimonials: 89 }
  //   ];

  //   const programPerformance = targetSubsidiaries.flatMap(sub =>
  //     sub.programs.map(prog => ({
  //       name: prog.name.split(' ').slice(0, 2).join(' '),
  //       certificates: prog.certificates,
  //       testimonials: prog.testimonials,
  //       subsidiary: sub.shortName
  //     }))
  //   );

  //   const subsidiaryDistribution = subsidiaries.map(sub => ({
  //     name: sub.shortName,
  //     value: sub.programs.reduce((sum, prog) => sum + prog.certificates, 0),
  //     color: sub.primaryColor
  //   }));

  //   return { monthlyData, programPerformance, subsidiaryDistribution };
  // };

  // const { monthlyData, programPerformance, subsidiaryDistribution } = generateAnalyticsData();

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-indigo-100 dark:border-gray-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 gap-4">
              {/* Logo and Company Info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center cursor-default overflow-hidden">
                        <img
                          src={genomacHoldingsLogo}
                          alt="Genomac Holdings"
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Genomac Holdings Certificate Platform</p>
                    </TooltipContent>
                  </Tooltip>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                      Genomac Holdings
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Certificate Management Platform
                    </p>
                  </div>
                </div>

                {/* Current Subsidiary Display */}
                {currentSubsidiary && (
                  <div className="hidden md:flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-gray-600">
                    <img
                      src={currentSubsidiary.logo}
                      alt={currentSubsidiary.name}
                      className="h-8 w-auto rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {currentSubsidiary.shortName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {loadingStats
                          ? "Loading..."
                          : `${actualCertificates.length} certificates`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* User Info and Controls */}
              <div className="flex items-center gap-4 flex-shrink-0">
                {/* Desktop Controls */}
                <div className="hidden md:flex items-center gap-4">
                  <ThemeToggle className="shrink-0" />
                  {user.canSwitchSubsidiaries && (
                    <div>
                      <Select
                        value={currentSubsidiary?.id || "all"}
                        onValueChange={(value) => {
                          if (value === "all") {
                            setCurrentSubsidiary(null);
                          } else {
                            const subsidiary = subsidiaries.find(
                              (s) => s.id === value
                            );
                            setCurrentSubsidiary(subsidiary || null);
                          }
                        }}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Subsidiary" />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          <SelectItem value="all">All Subsidiaries</SelectItem>
                          {subsidiaries.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.shortName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="text-right">
                    <p
                      className="font-medium text-gray-900 dark:text-white line-clamp-1 max-w-[140px]"
                      title={user.username}
                    >
                      {user.username}
                    </p>
                    <div className="flex items-center gap-1">
                      {user.role === "holdings_admin" ? (
                        <Shield className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <Building2 className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.role === "holdings_admin"
                          ? "Holdings Admin"
                          : "Subsidiary Admin"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (window.confirm("Sign out?")) onLogout();
                    }}
                  >
                    Sign Out
                  </Button>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden flex items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMobileMenuOpen((o) => !o)}
                    aria-label="Toggle menu"
                  >
                    {mobileMenuOpen ? (
                      <X className="w-4 h-4" />
                    ) : (
                      <Menu className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          {/* Mobile Menu Panel */}
          {mobileMenuOpen && (
            <div className="md:hidden relative">
              <div className="absolute inset-x-0 top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg z-30 animate-in fade-in slide-in-from-top duration-150">
                <div className="px-4 pt-3 pb-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400">
                      MENU
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileMenuOpen(false)}
                      aria-label="Close menu"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid gap-4">
                    {user.canSwitchSubsidiaries && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Subsidiary
                        </p>
                        <Select
                          value={currentSubsidiary?.id || "all"}
                          onValueChange={(value) => {
                            if (value === "all") {
                              setCurrentSubsidiary(null);
                            } else {
                              const subsidiary = subsidiaries.find(
                                (s) => s.id === value
                              );
                              setCurrentSubsidiary(subsidiary || null);
                            }
                            setMobileMenuOpen(false);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Subsidiary" />
                          </SelectTrigger>
                          <SelectContent className="max-h-72">
                            <SelectItem value="all">
                              All Subsidiaries
                            </SelectItem>
                            {subsidiaries.map((sub) => (
                              <SelectItem key={sub.id} value={sub.id}>
                                {sub.shortName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 min-w-0">
                        {user.role === "holdings_admin" ? (
                          <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        ) : (
                          <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p
                            className="text-sm font-medium truncate max-w-[160px]"
                            title={user.username}
                          >
                            {user.username}
                          </p>
                          <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            {user.role === "holdings_admin"
                              ? "Holdings Admin"
                              : "Subsidiary Admin"}
                          </p>
                        </div>
                      </div>
                      <ThemeToggle />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        className="flex-1"
                        size="sm"
                        onClick={() => setShowCertificateModal(true)}
                      >
                        Generate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (window.confirm("Sign out?")) {
                            setMobileMenuOpen(false);
                            onLogout();
                          }
                        }}
                      >
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {[
                  {
                    id: "overview",
                    name: "Overview",
                    icon: LayoutDashboard,
                    tooltip: "Dashboard Overview",
                  },
                  {
                    id: "certificates",
                    name: "Certificates",
                    icon: FileText,
                    tooltip: "Manage Certificates",
                  },
                  // { id: 'testimonials', name: 'Testimonials', icon: MessageSquare, tooltip: 'Student Feedback' },
                  {
                    id: "analytics",
                    name: "Analytics",
                    icon: BarChart3,
                    tooltip: "Performance Analytics",
                  },
                  {
                    id: "settings",
                    name: "Settings",
                    icon: Settings,
                    tooltip: "Platform Settings",
                  },
                  // { id: 'preview', name: 'Preview Student Experience', icon: Eye, tooltip: 'Student Experience Preview' }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <Tooltip key={tab.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleTabChange(tab.id)}
                          className={`${
                            activeTab === tab.id
                              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                          } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="hidden sm:inline">{tab.name}</span>
                          <span className="sm:hidden">
                            {tab.id === "preview" ? "Preview" : tab.name}
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{tab.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Welcome Card */}
              <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        Welcome, {user.username}
                      </h2>
                      <p className="text-indigo-100 mb-2">
                        {(user.role as string) === "holdings_admin"
                          ? `Managing certificate programs across ${subsidiaries.length} Genomac Holdings subsidiaries`
                          : `Managing certificate programs for ${user.subsidiary?.name}`}
                      </p>
                      {(user.role as string) === "holdings_admin" && (
                        <div className="flex items-center gap-2 text-indigo-200">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-default">
                                <Shield className="w-4 h-4" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Full administrative access to all subsidiaries
                              </p>
                            </TooltipContent>
                          </Tooltip>
                          <span className="text-sm">
                            Holdings Administrator Access
                          </span>
                        </div>
                      )}
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-default">
                          <Award className="w-16 h-16 text-white opacity-50" />
                          {/* <img src={currentSubsidiary?.logo} alt={currentSubsidiary?.name} className="h-20 w-auto rounded" /> */}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Certificate Management System</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-1gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-3xl font-medium">
                      Total Certificates
                    </CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-default">
                          {/* <Award className="h-4 w-4 text-indigo-600" /> */}
                          <img
                            src={currentSubsidiary?.logo}
                            alt={currentSubsidiary?.name}
                            className="h-20 w-auto rounded"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div>
                          <p>Total certificates issued</p>
                          {((user.role as string) === "holdings_admin" ||
                            user.subsidiary) && (
                            <p className="text-2xl mt-1">
                              {loadingStats
                                ? "Loading live data..."
                                : !loadingStats
                                ? "🟢 Live data from API"
                                : "🟠 Static program data"}
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {effectiveTotalCertificates.toLocaleString()}
                      {realtimeCounts && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                          {realtimeStatus === "connected" && "LIVE"}
                          {realtimeStatus === "polling" && "POLL"}
                          {realtimeStatus === "connecting" && "..."}
                          {realtimeStatus === "error" && "ERR"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(user.role as string) === "holdings_admin"
                        ? currentSubsidiary
                          ? `${currentSubsidiary.shortName} certificates`
                          : `Across all ${subsidiaries.length} subsidiaries`
                        : "Your subsidiary"}
                      {((user.role as string) === "holdings_admin" ||
                        user.subsidiary) &&
                        !loadingStats && (
                          <span className="text-green-600 ml-1">• Live</span>
                        )}
                    </p>
                  </CardContent>
                </Card>

                {/* Removed deprecated metric cards block */}
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-default">
                          <Zap className="w-5 h-5" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Quick actions and shortcuts</p>
                      </TooltipContent>
                    </Tooltip>
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => setShowCertificateModal(true)}
                          className="h-28 flex flex-col gap-2"
                        >
                          <Award className="w-6 h-6" />
                          Generate Certificates
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Generate new certificates for students</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline"
                          onClick={() => setShowNewProgramModal(true)}
                          className="h-20 flex flex-col gap-2"
                        >
                          <Plus className="w-6 h-6" />
                          Create Program
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Create a new certificate program</p>
                      </TooltipContent>
                    </Tooltip> */}

                    {/* <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline"
                          onClick={() => setActiveTab('analytics')}
                          className="h-20 flex flex-col gap-2"
                        >
                          <BarChart3 className="w-6 h-6" />
                          View Analytics
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View detailed analytics and reports</p>
                      </TooltipContent>
                    </Tooltip> */}
                  </div>
                </CardContent>
              </Card>

              {/* Development Notice for Subsidiary Admins */}
              {/* {user.role === 'subsidiary_admin' && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Development Notice:</strong> Program management features are being integrated with the backend API. 
                    Currently showing static program data. Full CRUD operations for programs will be available once API endpoints are ready.
                  </AlertDescription>
                </Alert>
              )} */}

              {/* Subsidiary Overview (Holdings Admin Only) - commented out */}
            </div>
          )}

          {activeTab === "certificates" && (
            <div className="space-y-6">
              {/* Certificate Management Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Certificate Management
                      </CardTitle>
                      <CardDescription>
                        {(user.role as string) === "holdings_admin"
                          ? currentSubsidiary
                            ? `Managing certificates for ${currentSubsidiary.name}`
                            : `Managing certificates across all ${subsidiaries.length} subsidiaries`
                          : "View, manage, and track all issued certificates"}
                      </CardDescription>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={() => setShowCertificateModal(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Generate Certificates
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Generate new certificates for students</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent>
                  <CertificateList
                    onCreateNew={() => setShowCertificateModal(true)}
                    subsidiaryId={
                      ((user.role as string) === "holdings_admin"
                        ? currentSubsidiary?.id
                        : user.subsidiary?.id) || ""
                    }
                    // subsidiaries={subsidiaries} // Removed: not in CertificateListProps
                    // isHoldingsAdmin removed: not in CertificateListProps
                    // currentSubsidiary removed: not in CertificateListProps
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "testimonials" && (
            <div className="space-y-6">
              {/* Testimonial Management Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Student Testimonials
                      </CardTitle>
                      <CardDescription>
                        View and manage student feedback and testimonials
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 cursor-default">
                              <Search className="text-gray-400 w-4 h-4" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Search testimonials</p>
                          </TooltipContent>
                        </Tooltip>
                        <Input
                          placeholder="Search testimonials by name or content..."
                          value={testimonialSearch}
                          onChange={(e) => setTestimonialSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select
                      value={testimonialFilter}
                      onValueChange={setTestimonialFilter}
                    >
                      <SelectTrigger className="w-full sm:w-48">
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-default">
                                <Filter className="w-4 h-4" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Filter by visibility</p>
                            </TooltipContent>
                          </Tooltip>
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Testimonials</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Testimonial List */}
                  {/* <div className="space-y-4">
                    {filteredTestimonials.map((testimonial) => (
                      <div key={testimonial.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <User className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{testimonial.studentName}</h3>
                                <p className="text-sm text-gray-600">{testimonial.program?.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star 
                                        key={i} 
                                        className={`w-3 h-3 ${
                                          i < testimonial.rating 
                                            ? 'text-yellow-400 fill-current' 
                                            : 'text-gray-300'
                                        }`} 
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(testimonial.submittedAt).toLocaleDateString()}
                                  </span>
                                  <Badge variant={testimonial.isPublic ? 'default' : 'secondary'}>
                                    {testimonial.isPublic ? 'Public' : 'Private'}
                                  </Badge>
                                  {testimonial.imageUrl && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge variant="outline">
                                          <Camera className="w-3 h-3 mr-1" />
                                          Image
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Contains photo attachment</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  {testimonial.videoUrl && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge variant="outline">
                                          <Video className="w-3 h-3 mr-1" />
                                          Video
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Contains video attachment</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-700 mb-3">{testimonial.text}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{testimonial.subsidiary?.shortName}</span>
                              {testimonial.certificateId && (
                                <>
                                  <span>•</span>
                                  <span>Certificate: {testimonial.certificateId}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-4">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  // onClick={() => handleEditTestimonial(testimonial.id)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit testimonial</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  // onClick={() => handleDeleteTestimonial(testimonial.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete testimonial</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {filteredTestimonials.length === 0 && (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Testimonials Found</h3>
                        <p className="text-gray-600">
                          {testimonialSearch || testimonialFilter !== 'all' 
                            ? 'No testimonials match your search criteria' 
                            : 'No testimonials have been submitted yet'
                          }
                        </p>
                      </div>
                    )}
                  </div> */}
                  {/* <BasicUnderConstruction /> */}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Analytics & Reports
                  </CardTitle>
                  <CardDescription>
                    View performance analytics and generate reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Realtime Summary */}
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="p-4 rounded-lg border bg-white dark:bg-gray-900 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          Total Certificates
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold tracking-wide ${
                            realtimeStatus === "connected"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : realtimeStatus === "polling"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                              : realtimeStatus === "connecting"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              : realtimeStatus === "error"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {realtimeStatus.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-3xl font-bold">
                        {effectiveTotalCertificates.toLocaleString()}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {currentSubsidiary
                          ? currentSubsidiary.shortName
                          : (user.role as string) === "holdings_admin"
                          ? "All Subsidiaries"
                          : user.subsidiary?.shortName}
                        {realtimeCounts?.updatedAt && (
                          <span className="ml-2">
                            · Updated {formatTimeAgo(realtimeCounts.updatedAt)}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border bg-white dark:bg-gray-900 flex flex-col gap-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Programs
                      </span>
                      <div className="text-3xl font-bold">
                        {(user.role as string) === "holdings_admin" &&
                        !currentSubsidiary
                          ? subsidiaries.reduce(
                              (s, sub) => s + sub.programs.length,
                              0
                            )
                          : currentSubsidiary?.programs.length ||
                            user.subsidiary?.programs.length ||
                            0}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Configured programs
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border bg-white dark:bg-gray-900 flex flex-col gap-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Testimonials
                      </span>
                      <div className="text-3xl font-bold">
                        {(user.role as string) === "holdings_admin" &&
                        !currentSubsidiary
                          ? subsidiaries.reduce(
                              (s, sub) =>
                                s +
                                sub.programs.reduce(
                                  (pSum, p) => pSum + p.testimonials,
                                  0
                                ),
                              0
                            )
                          : currentSubsidiary
                          ? currentSubsidiary.programs.reduce(
                              (s, p) => s + p.testimonials,
                              0
                            )
                          : user.subsidiary?.programs.reduce(
                              (s, p) => s + p.testimonials,
                              0
                            ) || 0}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Collected feedback
                      </p>
                    </div>
                  </div>

                  {/* Distribution Table */}
                  {(user.role as string) === "holdings_admin" &&
                    !currentSubsidiary && (
                      <div className="mt-8">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-indigo-500" />{" "}
                          Certificates by Subsidiary
                        </h3>
                        <div className="overflow-x-auto border rounded-lg">
                          <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300">
                              <tr>
                                <th className="text-left font-medium px-4 py-2">
                                  Subsidiary
                                </th>
                                <th className="text-right font-medium px-4 py-2">
                                  Certificates
                                </th>
                                <th className="text-right font-medium px-4 py-2">
                                  Programs
                                </th>
                                <th className="text-right font-medium px-4 py-2">
                                  Testimonials
                                </th>
                                <th className="text-right font-medium px-4 py-2">
                                  Share %
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                              {subsidiaries.map((sub) => {
                                const certCount =
                                  actualCertificates.length > 0
                                    ? actualCertificates.filter(
                                        (c) => c.subsidiary === sub.id
                                      ).length
                                    : sub.programs.reduce(
                                        (s, p) => s + p.certificates,
                                        0
                                      );
                                const programCount = sub.programs.length;
                                const testimonialCount = sub.programs.reduce(
                                  (s, p) => s + p.testimonials,
                                  0
                                );
                                const total = effectiveTotalCertificates || 0;
                                const pct =
                                  total > 0
                                    ? ((certCount / total) * 100).toFixed(1)
                                    : "0.0";
                                return (
                                  <tr
                                    key={sub.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40"
                                  >
                                    <td className="px-4 py-2 font-medium flex items-center gap-2">
                                      <span
                                        className="w-2 h-2 rounded-full"
                                        style={{
                                          backgroundColor:
                                            sub.primaryColor || "#6366f1",
                                        }}
                                      />
                                      {sub.shortName}
                                    </td>
                                    <td className="px-4 py-2 text-right font-mono tabular-nums">
                                      {certCount.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 text-right font-mono">
                                      {programCount}
                                    </td>
                                    <td className="px-4 py-2 text-right font-mono">
                                      {testimonialCount}
                                    </td>
                                    <td className="px-4 py-2 text-right font-mono text-gray-500">
                                      {pct}%
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  {/* Helper */}
                  <div className="mt-6 text-[11px] text-gray-500 dark:text-gray-400">
                    Live data updates automatically. SSE first, falls back to
                    polling every 20s.
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    App Settings
                  </CardTitle>
                  <CardDescription>
                    Configure app settings and preferences...
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Alert>
                      <AlertTriangle
                        className="h-4 w-4"
                        style={{ color: "red" }}
                      />
                      <AlertDescription>
                        Update Account Settings
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                          Account Settings
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Change Password</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowChangePassword(true)}
                            >
                              Change
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Change Password Modal/Form */}
              {showChangePassword && (
                <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
                  <div className="rounded-lg p-6 max-w-md w-full mx-4">
                    <ChangePasswordForm
                      onClose={() => setShowChangePassword(false)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "preview" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Student Experience Preview
                  </CardTitle>
                  <CardDescription>
                    Experience the complete student journey from name input to
                    certificate receipt
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      This is a demonstration of the student experience. No
                      actual certificates will be generated.
                    </AlertDescription>
                  </Alert>

                  {currentStep === "certificate" && (
                    <div className="text-center space-y-6">
                      <div>
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">
                          Congratulations, {studentName}!
                        </h2>
                        <p className="text-gray-600">
                          Your certificate is ready
                        </p>
                      </div>

                      {/* Certificate Preview - Using New Template System */}
                      <div className="flex justify-center">
                        <div
                          style={{
                            transform: "scale(0.8)",
                            transformOrigin: "top center",
                          }}
                        >
                          <CertificateTemplate
                            subsidiary={demoSubsidiary}
                            program={demoProgram}
                            studentName={studentName}
                            certificateId={previewCertificateId}
                            completionDate={new Date().toISOString()}
                            template={demoProgram?.template || "modern"}
                            preview={true}
                          />
                        </div>
                      </div>

                      {/* Certificate Actions */}
                      <div className="flex justify-center gap-4">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button>
                              <Download className="w-4 h-4 mr-2" />
                              Download Certificate
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Download certificate as PDF</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline">
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Share certificate link</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Social Sharing */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          Share Your Achievement
                        </h3>
                        <div className="flex justify-center gap-4">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => shareToSocialMedia("facebook")}
                              >
                                <Facebook className="w-4 h-4 mr-2" />
                                Facebook
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Share on Facebook</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => shareToSocialMedia("twitter")}
                              >
                                <Twitter className="w-4 h-4 mr-2" />
                                Twitter
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Share on Twitter</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => shareToSocialMedia("linkedin")}
                              >
                                <Linkedin className="w-4 h-4 mr-2" />
                                LinkedIn
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Share on LinkedIn</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => shareToSocialMedia("whatsapp")}
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                WhatsApp
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Share on WhatsApp</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      <Button variant="outline" onClick={resetPreview}>
                        Try Again
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <SimpleCertificateModal
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
          user={user}
          currentSubsidiary={currentSubsidiary}
        />

        <NewProgramModal
          isOpen={showNewProgramModal}
          onClose={() => setShowNewProgramModal(false)}
          user={user}
          subsidiaries={subsidiaries}
          currentSubsidiary={currentSubsidiary}
          onAddProgram={onAddProgram}
        />
      </div>
    </TooltipProvider>
  );
}
