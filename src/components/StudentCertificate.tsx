import React, { useCallback, useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { useParams } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { toJpeg } from "html-to-image";
import {
  Download,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Mail,
  CheckCircle,
  Award,
  Eye,
  Globe,
  Shield,
  Calendar,
  User,
  Building2,
  AlertTriangle,
  Clock,
  Menu,
  X,
} from "lucide-react";
import { toast } from "sonner";
import CertificateRenderer from "./CertificateRenderer";
import { useTheme } from "../contexts/ThemeContext";
import { certificateService } from "../services/certificate.service";
import {
  decryptCertificateData,
  getCertificateLinkTimeRemaining,
} from "../utils/encryption";
import type { Subsidiary, Program } from "../App";

interface StudentCertificateProps {}

interface CertificateData {
  id: string;
  studentName: string;
  email?: string;
  program: Program;
  subsidiary: Subsidiary;
  completionDate: string;
  issuedDate: string;
  status: "valid" | "revoked" | "expired";
  verificationCode?: string;
  downloadCount: number;
  lastAccessed: string;
  templateType?: string;
  courseTitle?: string;
  description?: string;
  header?: string;
}

const StudentCertificate: React.FC<StudentCertificateProps> = () => {
  // URL params (encrypted or legacy)
  type EncryptedRoute = { encryptedData?: string };
  type LegacyRoute = {
    subsidiaryId?: string;
    programId?: string;
    certificateId?: string;
  };
  const params = useParams<EncryptedRoute & LegacyRoute>();
  const encryptedData = params.encryptedData;
  const legacySubsidiaryId = params.subsidiaryId;
  const legacyProgramId = params.programId;
  const legacyCertificateId = params.certificateId;

  const { theme } = useTheme();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [urlExpired, setUrlExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showFullDetails, setShowFullDetails] = useState(false);

  // Get certificate URL key for storage
  const getCertificateKey = () => {
    const currentUrl = window.location.pathname;
    return `certificate_name_${currentUrl.replace(/\//g, "_")}`;
  };

  // Initialize name and nameSubmitted from sessionStorage
  const [studentName, setStudentName] = useState(() => {
    const savedName = sessionStorage.getItem(getCertificateKey());
    return savedName || "";
  });

  const [nameSubmitted, setNameSubmitted] = useState(() => {
    const savedName = sessionStorage.getItem(getCertificateKey());
    return !!savedName; // Convert to boolean - if name exists, then it was submitted
  });

  // Add a separate state to track if we've initialized from sessionStorage
  const [isNameInitialized, setIsNameInitialized] = useState(false);

  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  // Derive the actual certificate parameters
  const [subsidiaryId, setSubsidiaryId] = useState<string | null>(null);
  const [programId, setProgramId] = useState<string | null>(null);
  const [certificateId, setCertificateId] = useState<string | null>(null);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle URL decryption on component mount
  useEffect(() => {
    // Initialize name from sessionStorage when component mounts
    const savedName = sessionStorage.getItem(getCertificateKey());
    if (savedName && !isNameInitialized) {
      setStudentName(savedName);
      setNameSubmitted(true);
      setIsNameInitialized(true);
      // restored student name from sessionStorage
    } else if (!isNameInitialized) {
      setIsNameInitialized(true);
    }

    if (encryptedData) {
      // processing encrypted certificate URL
      setIsEncrypted(true);

      const decryptedData = decryptCertificateData(encryptedData);
      if (decryptedData) {
        // successfully decrypted certificate data
        setSubsidiaryId(decryptedData.subsidiaryId);
        setProgramId(decryptedData.programId);
        setCertificateId(decryptedData.certificateId);

        // Set up time remaining countdown
        const remaining = getCertificateLinkTimeRemaining(encryptedData);
        setTimeRemaining(remaining);

        // Set up periodic update for time remaining
        const interval = setInterval(() => {
          const newRemaining = getCertificateLinkTimeRemaining(encryptedData);
          setTimeRemaining(newRemaining);

          if (newRemaining === null || newRemaining <= 0) {
            setUrlExpired(true);
            clearInterval(interval);
          }
        }, 60000); // Update every minute

        return () => clearInterval(interval);
      } else {
        // failed to decrypt certificate data or URL expired
        setUrlExpired(true);
        setLoading(false);
      }
    } else if (legacySubsidiaryId && legacyProgramId && legacyCertificateId) {
      // processing legacy unencrypted certificate URL
      setIsEncrypted(false);
      setSubsidiaryId(legacySubsidiaryId);
      setProgramId(legacyProgramId);
      setCertificateId(legacyCertificateId);
    } else {
      // invalid certificate URL format
      setLoading(false);
    }
  }, [
    encryptedData,
    legacySubsidiaryId,
    legacyProgramId,
    legacyCertificateId,
    isNameInitialized,
  ]);

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to format certificate date with ordinal suffix (JULY 22nd 2025)
  const formatCertificateDate = (dateString: string) => {
    // date formatting; debug logs removed

    // Handle different possible date formats from backend
    let date: Date;

    if (!dateString || dateString === "undefined" || dateString === "null") {
      // no valid date provided, using current date
      date = new Date();
    } else {
      // Try to parse the date - handle ISO strings and regular date strings
      date = new Date(dateString);
    }

    // If the date is still invalid, use current date as fallback
    if (isNaN(date.getTime())) {
      // invalid date format; using current date as fallback
      date = new Date();
    }

    // Get date components - use local time since we want to display the actual date
    const day = date.getDate();
    const month = date
      .toLocaleDateString("en-US", { month: "long" })
      .toUpperCase();
    const year = date.getFullYear();

    // Add ordinal suffix to day
    const getOrdinalSuffix = (day: number) => {
      if (day > 3 && day < 21) return "TH";
      switch (day % 10) {
        case 1:
          return "ST";
        case 2:
          return "ND";
        case 3:
          return "RD";
        default:
          return "TH";
      }
    };

    const formattedResult = `${day}${getOrdinalSuffix(day)} ${month} ${year}`;

    return formattedResult;
  };

  // Helper function to format time remaining
  const formatTimeRemaining = (milliseconds: number): string => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} day${days !== 1 ? "s" : ""}, ${hours} hour${
        hours !== 1 ? "s" : ""
      }`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? "s" : ""}, ${minutes} minute${
        minutes !== 1 ? "s" : ""
      }`;
    } else {
      return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-100 text-green-800";
      case "revoked":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        // fetching certificate

        const certificate_data = await certificateService.getCertificateById(
          certificateId!,
        );
        // certificate data received

        if (certificate_data) {
          // Create fallback subsidiary and program objects
          const fallbackSubsidiary: Subsidiary = {
            id: subsidiaryId!,
            name: "Certificate Organization",
            shortName: "CO",
            logo: "/genomac.png",
            primaryColor: "#6366f1",
            programs: [],
          };

          const fallbackProgram: Program = {
            id: programId!,
            name: certificate_data.courseTitle || "Certificate Program",
            description:
              certificate_data.description ||
              "Professional Certificate Program",
            template: "1" as const,
            certificates: 0,
            testimonials: 0,
          };

          setCertificate({
            id: certificate_data._id || certificateId!,
            studentName: studentName || "", // Use current student name (from state or sessionStorage)
            subsidiary: fallbackSubsidiary,
            program: fallbackProgram,
            templateType:
              String(certificate_data.templateType) ||
              fallbackProgram.template ||
              "1", // Prioritize backend certificate data
            courseTitle: certificate_data.courseTitle || fallbackProgram.name,
            description:
              certificate_data.description || fallbackProgram.description,
            header: certificate_data.header || "Certificate", // Add header from backend data
            completionDate: certificate_data.date || new Date().toISOString(),
            issuedDate: certificate_data.createdAt || new Date().toISOString(),
            status: "valid" as const,
            downloadCount: 0,
            lastAccessed: new Date().toISOString(),
          });
          setLoading(false);
        } else {
          // no certificate data received
          toast.error("Certificate not found. Please check the link.");
          setLoading(false);
        }
      } catch {
        // error fetching certificate
        toast.error(
          "Failed to load certificate. Please check the link and try again.",
        );
        setLoading(false);
      }
    };

    // deps debug removed
    // Always fetch certificate data when component mounts
    if (certificateId && subsidiaryId && programId && isNameInitialized) {
      fetchCertificate();
    } else if (!isNameInitialized) {
      setTimeout(() => {
        if (!isNameInitialized) {
          // name not initialized after delay
        }
      }, 2000);
    } else {
      // If IDs are missing after a short delay, show an error
      setTimeout(() => {
        if (!(certificateId && subsidiaryId && programId)) {
          toast.error(
            "Certificate link is invalid or incomplete. Please check the URL.",
          );
          setLoading(false);
        }
      }, 2000);
    }
  }, [subsidiaryId, programId, certificateId, studentName, isNameInitialized]);

  // Prepare an offscreen, fixed-size render to avoid mobile viewport scaling issues
  const waitForImages = async (container: HTMLElement) => {
    const imgs = Array.from(container.querySelectorAll("img"));
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((resolve) => {
            if ((img as HTMLImageElement).complete) return resolve();
            (img as HTMLImageElement).addEventListener(
              "load",
              () => resolve(),
              {
                once: true,
              },
            );
            (img as HTMLImageElement).addEventListener(
              "error",
              () => resolve(),
              { once: true },
            );
          }),
      ),
    );
  };

  const renderCertificateOffscreen =
    React.useCallback(async (): Promise<string> => {
      if (!certificate) throw new Error("No certificate data");

      // Offscreen container (render in viewport but invisible for reliable layout)
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "0";
      container.style.top = "0";
      container.style.opacity = "0";
      container.style.pointerEvents = "none";
      container.style.width = "1000px"; // design width
      container.style.height = "600px"; // design height
      container.style.background = "#ffffff";
      container.style.padding = "0";
      container.style.margin = "0";
      container.style.zIndex = "-1";
      document.body.appendChild(container);

      const root = createRoot(container);
      const cleanup = () => {
        try {
          root.unmount();
        } catch {
          // offscreen root unmount error
        }
        try {
          container.remove();
        } catch {
          // offscreen container remove error
        }
      };

      try {
        root.render(
          <div
            id="export-root"
            style={{
              width: "1000px",
              height: "600px",
              background: "#ffffff",
              overflow: "hidden",
            }}
          >
            <CertificateRenderer
              templateId={certificate.templateType || "1"}
              header={certificate.header || "Certificate"}
              courseTitle={certificate.courseTitle || certificate.program.name}
              description={certificate.description}
              date={formatCertificateDate(certificate.completionDate)}
              recipientName={certificate.studentName}
              isPreview={false}
              mode="student"
            />
          </div>,
        );

        // Let React paint
        await new Promise((r) => setTimeout(r, 50));

        // Ensure fonts and images are ready (guard for browsers without CSS Font Loading API types)
        type DocumentWithFonts = Document & {
          fonts?: { ready?: Promise<unknown> };
        };
        const docWithFonts = document as DocumentWithFonts;
        if (docWithFonts.fonts?.ready) {
          try {
            await docWithFonts.fonts.ready;
          } catch {
            // fonts.ready wait failed
          }
        }
        const target =
          (container.querySelector(
            '#export-root [class*="w-[1000px]"][class*="h-[600px]"]',
          ) as HTMLElement) ||
          (container.querySelector("#export-root") as HTMLElement) ||
          container;
        await waitForImages(target as HTMLElement);

        // Measure the actual rendered size of the certificate inside the offscreen container
        const measuredRect = (target as HTMLElement).getBoundingClientRect();
        const measuredWidth = Math.max(1, Math.round(measuredRect.width));
        const measuredHeight = Math.max(1, Math.round(measuredRect.height));

        // Ensure the offscreen container matches the measured size to avoid extra whitespace
        container.style.width = `${measuredWidth}px`;
        container.style.height = `${measuredHeight}px`;

        const dataUrl = await toJpeg(target as HTMLElement, {
          cacheBust: true,
          backgroundColor: "#ffffff",
          width: measuredWidth,
          height: measuredHeight,
          pixelRatio: Math.min(2, window.devicePixelRatio || 1),
        });
        return dataUrl;
      } finally {
        cleanup();
      }
    }, [certificate]);

  // Capture the on-screen certificate by normalizing transforms/sizes temporarily
  const captureOnscreenNormalized =
    React.useCallback(async (): Promise<string> => {
      const root = certificateRef.current as HTMLElement | null;
      if (!root) throw new Error("No onscreen certificate ref");

      // Try to locate the inner 1000x600 canvas inside templates
      const target =
        (root.querySelector(
          '[class*="w-[1000px]"][class*="h-[600px]"]',
        ) as HTMLElement) || root;

      // Save previous inline styles to restore later
      const prev: Record<string, string> = {
        transform: target.style.transform,
        width: target.style.width,
        height: target.style.height,
        marginLeft: target.style.marginLeft,
      };
      const child = target.firstElementChild as HTMLElement | null;
      const prevChild: Record<string, string> = child
        ? {
            transform: child.style.transform,
            width: child.style.width,
            height: child.style.height,
            marginLeft: child.style.marginLeft,
          }
        : {};

      try {
        // Neutralize preview scaling/offsets so the capture area is exact
        // target.style.transform = "none";
        // target.style.width = "1000px";
        // target.style.height = "600px";
        target.style.marginLeft = "0";
        // Calculate actual sizes from the DOM so capture matches the visible certificate
        const targetRect = target.getBoundingClientRect();
        const targetWidth = Math.round(targetRect.width);
        const targetHeight = Math.round(targetRect.height);
        if (child) {
          child.style.transform = "none";
          // set the child to the measured width/height
          child.style.width = `${targetWidth}px`;
          child.style.height = `${targetHeight}px`;
          child.style.marginLeft = "0";
        }

        // Ensure assets ready
        type DocumentWithFonts = Document & {
          fonts?: { ready?: Promise<unknown> };
        };
        const docWithFonts = document as DocumentWithFonts;
        if (docWithFonts.fonts?.ready) {
          try {
            await docWithFonts.fonts.ready;
          } catch {
            // fonts.ready wait failed (onscreen)
          }
        }
        await waitForImages(target);

        const dataUrl = await toJpeg(target, {
          cacheBust: true,
          backgroundColor: "#ffffff",
          // use the measured dimensions so the output matches the rendered certificate
          width: targetWidth,
          height: targetHeight,
          pixelRatio: Math.min(2, window.devicePixelRatio || 1),
        });
        return dataUrl;
      } finally {
        // Restore styles
        target.style.transform = prev.transform;
        target.style.width = prev.width;
        target.style.height = prev.height;
        target.style.marginLeft = prev.marginLeft;
        if (child) {
          child.style.transform = prevChild.transform || "";
          child.style.width = prevChild.width || "";
          child.style.height = prevChild.height || "";
          child.style.marginLeft = prevChild.marginLeft || "";
        }
      }
    }, []);

  // Handle certificate download
  const handleDownload = useCallback(() => {
    if (!certificate) {
      toast.error("Certificate not ready for download");
      return;
    }
    setIsDownloading(true);
    // Try on-screen capture first (usually more robust), then offscreen fallback
    captureOnscreenNormalized()
      .catch(() => renderCertificateOffscreen())
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `${certificate.studentName.replace(/\s+/g, "_")}.jpeg`;
        link.href = dataUrl;
        link.click();
      })
      .catch(() => {
        alert(
          "An error occurred while generating your certificate. Please try again.",
        );
      })
      .finally(() => {
        setIsDownloading(false);
      });
  }, [certificate, captureOnscreenNormalized, renderCertificateOffscreen]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentName.trim()) {
      // Save name to sessionStorage for persistence across page reloads
      sessionStorage.setItem(getCertificateKey(), studentName.trim());

      setNameSubmitted(true);
      setIsNameInitialized(true); // <-- Ensure fetch effect can run
      // Update the certificate with the submitted student name
      if (certificate) {
        setCertificate({
          ...certificate,
          studentName: studentName.trim(),
        });
      }

      // name saved (debug removed)
    } else {
      toast.error("Please enter your name");
    }
  };

  const handleShare = (platform: string) => {
    const shareUrl = window.location.href;
    const text = `I've completed the ${certificate?.program.name} at ${certificate?.subsidiary.name}! 🎓 #Certificate #Achievement`;

    let url = "";
    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl,
        )}&quote=${encodeURIComponent(text)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          shareUrl,
        )}&text=${encodeURIComponent(text)}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          shareUrl,
        )}`;
        break;
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(
          text + " " + shareUrl,
        )}`;
        break;
      case "email":
        url = `mailto:?subject=${encodeURIComponent(
          "Check out my certificate!",
        )}&body=${encodeURIComponent(text + "\\n\\n" + shareUrl)}`;
        break;
    }

    if (url) {
      window.open(url, "_blank", "width=600,height=400");
    }
  };

  // const handleCopyLink = () => {
  //   navigator.clipboard.writeText(window.location.href);
  //   setShareUrlCopied(true);
  //   toast.success('Certificate link copied to clipboard!');
  //   setTimeout(() => setShareUrlCopied(false), 2000);
  // };

  // Show name input form if name hasn't been submitted
  if (!nameSubmitted) {
    return (
      <div
        className={`min-h-screen ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-indigo-50 via-white to-purple-50"
        } flex items-center justify-center p-4`}
      >
        <Card
          className={`w-full max-w-md ${
            theme === "dark" ? "bg-gray-800 border-gray-700" : ""
          }`}
        >
          <CardContent className="p-8">
            <div className="text-center mb-6">
              {certificate?.subsidiary?.logo ? (
                <img
                  src={certificate.subsidiary.logo}
                  alt={certificate.subsidiary.name}
                  className="h-12 w-auto mx-auto mb-4"
                />
              ) : (
                <Award
                  className={`w-16 h-16 ${
                    theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                  } mx-auto mb-4`}
                />
              )}
              <h1
                className={`text-2xl font-bold ${
                  theme === "dark" ? "text-gray-100" : "text-gray-800"
                } mb-2`}
              >
                Access Your Certificate
              </h1>
              <p
                className={theme === "dark" ? "text-gray-300" : "text-gray-600"}
              >
                {certificate ? (
                  <>
                    Enter your full name as you want it to appear on the
                    certificate.
                  </>
                ) : (
                  "Enter your full name as you want it to appear on the certificate."
                )}
              </p>
            </div>

            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="studentName"
                  className={`block text-sm font-medium ${
                    theme === "dark" ? "text-gray-200" : "text-gray-700"
                  } mb-2`}
                >
                  Your Full Name *
                </label>
                <input
                  type="text"
                  id="studentName"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="Enter your full name as you want it to appear on the certificate."
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                View My Certificate
              </Button>
            </form>

            <div className="mt-6 text-center">
              <div
                className={`flex items-center justify-center gap-2 text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <Shield className="w-3 h-3" />
                <span>Secure certificate verification</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-indigo-50 via-white to-purple-50"
        } flex items-center justify-center`}
      >
        <Card
          className={`w-96 ${
            theme === "dark" ? "bg-gray-800 border-gray-700" : ""
          }`}
        >
          <CardContent className="text-center p-8">
            <div
              className={`animate-spin rounded-full h-16 w-16 border-b-2 ${
                theme === "dark" ? "border-indigo-400" : "border-indigo-600"
              } mx-auto mb-4`}
            />
            <h2
              className={`text-xl font-bold ${
                theme === "dark" ? "text-gray-100" : "text-gray-800"
              } mb-2`}
            >
              Loading Certificate
            </h2>
            <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
              Please wait while we fetch your certificate...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div
        className={`min-h-screen ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-indigo-50 via-white to-purple-50"
        } flex items-center justify-center`}
      >
        <Card
          className={`w-96 ${
            theme === "dark" ? "bg-gray-800 border-gray-700" : ""
          }`}
        >
          <CardContent className="text-center p-8">
            <Award
              className={`w-16 h-16 ${
                theme === "dark" ? "text-gray-500" : "text-gray-400"
              } mx-auto mb-4`}
            />
            <h2
              className={`text-xl font-bold ${
                theme === "dark" ? "text-gray-100" : "text-gray-800"
              } mb-2`}
            >
              Certificate Not Found
            </h2>
            <p
              className={`${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              } mb-4`}
            >
              The certificate you're looking for doesn't exist or may have been
              removed.
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle expired URL
  if (urlExpired) {
    return (
      <TooltipProvider>
        <div
          className={`min-h-screen flex items-center justify-center ${
            theme === "dark"
              ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
              : "bg-gradient-to-br from-indigo-50 via-white to-purple-50"
          }`}
        >
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Certificate Link Expired
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                This certificate link has expired for security reasons. Please
                contact the issuing organization for a new link.
              </p>
              <Badge variant="outline" className="text-red-600 border-red-200">
                <Clock className="w-3 h-3 mr-1" />
                Expired Link
              </Badge>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div
        className={`min-h-screen ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-indigo-50 via-white to-purple-50"
        }`}
      >
        {/* Header (responsive) */}
        <header
          className={`${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-indigo-100"
          } border-b shadow-sm`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 gap-4">
              {/* Logo and Org Info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <img
                  src={certificate.subsidiary.logo}
                  alt={certificate.subsidiary.name}
                  className="h-10 w-auto"
                />
                <div>
                  <h1
                    className={`text-lg font-bold ${
                      theme === "dark" ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    {certificate.subsidiary.name}
                  </h1>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Certificate Preview
                  </p>
                </div>
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                <Badge className={getStatusColor(certificate.status)}>
                  <Shield className="w-3 h-3 mr-1" />
                  {certificate.status.toUpperCase()}
                </Badge>
                <Badge variant="outline" />
                <Globe className="w-3 h-3 mr-1" />
                Verified
                {isEncrypted && (
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          Secure Link
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <p className="font-medium">
                            Encrypted Certificate Link
                          </p>
                          <p className="text-xs text-gray-600">
                            Safely download certificate
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                    {timeRemaining && timeRemaining > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-orange-50 text-orange-700 border-orange-200"
                      >
                        Time left:
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimeRemaining(timeRemaining)}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <div className="md:hidden flex items-center flex-shrink-0">
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
          {/* Mobile Menu Panel */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="px-4 py-3 space-y-3">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(certificate.status)}>
                    <Shield className="w-3 h-3 mr-1" />
                    {certificate.status.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" />
                  <Globe className="w-3 h-3 mr-1" />
                  Verified
                </div>
                {isEncrypted && (
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          Secure Link
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <p className="font-medium">
                            Encrypted Certificate Link
                          </p>
                          <p className="text-xs text-gray-600">
                            Safely download certificate
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                    {timeRemaining && timeRemaining > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-orange-50 text-orange-700 border-orange-200"
                      >
                        Time left:
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimeRemaining(timeRemaining)}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        <div className="max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            <div className="xl:col-span-4">
              <div className="w-full">
                <div
                  ref={certificateRef}
                  className="flex justify-center w-full z-10"
                >
                  <div className="min-w-[340px] sm:min-w-0 w-[1000px] max-w-full mx-auto">
                    <CertificateRenderer
                      templateId={certificate.templateType || "1"}
                      header={certificate.header || "Certificate"} // Use actual header from backend
                      courseTitle={
                        certificate.courseTitle || certificate.program.name
                      }
                      description={certificate.description}
                      date={formatCertificateDate(certificate.completionDate)} // Format date as "JULY 22nd 2025"
                      recipientName={certificate.studentName}
                      isPreview={true}
                      mode="template-selection"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Sidebar - Takes up 1 column */}
            <div className="xl:col-span-1 z-50">
              <div className="space-y-6">
                {/* Actions Card */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Actions
                    </h3>
                    <div className="space-y-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => handleDownload()}
                            disabled={isDownloading}
                            className="w-full"
                          >
                            {isDownloading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                Download Image
                              </>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download as high-quality PNG image</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            // onClick={() => handleDownload('pdf')}
                            disabled={isDownloading}
                            variant="outline"
                            className="w-full"
                          >
                            {isDownloading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                Print PDF
                              </>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Open print dialog for PDF generation</p>
                        </TooltipContent>
                      </Tooltip> */}

                      {/* <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline"
                            onClick={handleCopyLink}
                            className="w-full"
                          >
                            {shareUrlCopied ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Link
                              </>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy certificate link to share</p>
                        </TooltipContent>
                      </Tooltip> */}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => setShowFullDetails(!showFullDetails)}
                            className="w-full"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {showFullDetails ? "Hide" : "Show"} Details
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Toggle certificate details</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </CardContent>
                </Card>

                {/* Certificate Status Card */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      Status
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-700">Verified</p>
                          <p className="text-xs text-green-600">
                            Authentic certificate
                          </p>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Verify at{" "}
                          <span className="font-mono">genomac.com/verify</span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Share Options Card */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Share
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShare("facebook")}
                            className="w-full"
                          >
                            <Facebook className="w-4 h-4" />
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
                            onClick={() => handleShare("twitter")}
                            className="w-full"
                          >
                            <Twitter className="w-4 h-4" />
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
                            onClick={() => handleShare("linkedin")}
                            className="w-full"
                          >
                            <Linkedin className="w-4 h-4" />
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
                            onClick={() => handleShare("whatsapp")}
                            className="w-full"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Share on WhatsApp</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShare("email")}
                            className="col-span-2"
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Email
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Share via email</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </CardContent>
                </Card>

                {/* Certificate Info Card */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Certificate Info
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Student:</span>
                        <span className="font-medium">
                          {certificate.studentName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Organization:</span>
                        <span className="font-medium">
                          {certificate.subsidiary.shortName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Completed:</span>
                        <span className="font-medium">
                          {formatDate(certificate.completionDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Downloads:</span>
                        <span className="font-medium">
                          {certificate.downloadCount} times
                        </span>
                      </div>

                      {showFullDetails && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          <div>
                            <span className="text-gray-600">
                              Program Description:
                            </span>
                            <p className="mt-1 text-gray-800">
                              {certificate.program.description}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Issued Date:</span>
                            <p className="font-medium">
                              {formatDate(certificate.issuedDate)}
                            </p>
                          </div>
                          {certificate.verificationCode && (
                            <div>
                              <span className="text-gray-600">
                                Verification Code:
                              </span>
                              <p className="font-mono text-xs">
                                {certificate.verificationCode}
                              </p>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-600">
                              Certificate ID:
                            </span>
                            <p className="font-mono text-xs">
                              {certificate.id}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Last Accessed:
                            </span>
                            <p className="font-medium">
                              {formatDate(certificate.lastAccessed)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-gray-600 mb-2">
                © 2025 Genomac Holdings. All rights reserved.
              </p>
              <p className="text-sm text-gray-500">
                This digital certificate is powered by the Genomac Holdings
                Certificate Platform
              </p>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
};

export default StudentCertificate;
