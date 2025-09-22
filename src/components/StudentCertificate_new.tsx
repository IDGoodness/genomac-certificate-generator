import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import * as htmlToImage from 'html-to-image';
import { 
  Download, 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  MessageCircle,
  Mail,
  Copy,
  CheckCircle,
  Award,
  Eye,
  Globe,
  Shield,
  Calendar,
  User,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import CertificateRenderer from './CertificateRenderer';
import { useTheme } from '../contexts/ThemeContext';
import { certificateService } from '../services/certificate.service';
import type { Subsidiary, Program } from '../App';

interface StudentCertificateProps {
  subsidiaries: Subsidiary[];
}

interface CertificateData {
  id: string;
  studentName: string;
  email?: string;
  program: Program;
  subsidiary: Subsidiary;
  completionDate: string;
  issuedDate: string;
  status: 'valid' | 'revoked' | 'expired';
  verificationCode?: string;
  downloadCount: number;
  lastAccessed: string;
  templateType?: string;
  courseTitle?: string;
  description?: string;
  header?: string; // Add header field
}

const StudentCertificate: React.FC<StudentCertificateProps> = ({ subsidiaries }) => {
  const { subsidiaryId, programId, certificateId } = useParams();
  const { theme } = useTheme();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareUrlCopied, setShareUrlCopied] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800';
      case 'revoked': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        const response = await certificateService.getCertificateById(certificateId!);
        
        if (response) {
          // Find subsidiary and program data
          const subsidiary = subsidiaries.find(s => s.id === subsidiaryId);
          const program = subsidiary?.programs.find(p => p.id === programId);
          
          if (subsidiary && program) {
            setCertificate({
              ...response,
              id: response._id, // Map _id to id for CertificateData interface
              studentName: '', // Start with empty name - will be updated when student submits
              subsidiary,
              program,
              templateType: String(response.templateType) || program.template || '1', // Use backend templateType first
              courseTitle: response.courseTitle || program.name, // Use backend courseTitle first
              description: response.description || program.description, // Use backend description first
              completionDate: response.date || new Date().toISOString(),
              issuedDate: response.createdAt || new Date().toISOString(),
              status: 'valid',
              downloadCount: 0,
              lastAccessed: new Date().toISOString(),
              header: response.header || 'Certificate' // Add header from backend data
            });
          }
        }
      } catch (error) {
        console.error('Error fetching certificate:', error);
        toast.error('Failed to load certificate. Please check the link and try again.');
      } finally {
        setLoading(false);
      }
    };

    // Always fetch certificate data when component mounts, regardless of name submission
    fetchCertificate();
  }, [subsidiaryId, programId, certificateId, subsidiaries]);

  const handleDownload = async (format: 'png' | 'pdf' = 'png') => {
    if (!certificate || !certificateRef.current) {
      toast.error('Certificate not ready for download');
      return;
    }

    setIsDownloading(true);
    try {
      if (format === 'png') {
        // Generate high-quality PNG image
        const dataUrl = await htmlToImage.toPng(certificateRef.current, {
          quality: 1.0,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          width: certificateRef.current.offsetWidth * 2,
          height: certificateRef.current.offsetHeight * 2,
          style: {
            transform: 'scale(2)',
            transformOrigin: 'top left',
            width: certificateRef.current.offsetWidth + 'px',
            height: certificateRef.current.offsetHeight + 'px'
          }
        });

        const link = document.createElement('a');
        link.download = `${certificate.program.name.replace(/\s+/g, '_')}_Certificate_${certificate.studentName.replace(/\s+/g, '_')}.png`;
        link.href = dataUrl;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Certificate image downloaded successfully!');
      } else {
        // Generate PDF using print functionality
        const originalTitle = document.title;
        document.title = `${certificate.program.name} Certificate - ${certificate.studentName}`;
        
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          throw new Error('Popup blocked. Please allow popups and try again.');
        }

        const certificateHTML = certificateRef.current.outerHTML;
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${document.title}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                  font-family: system-ui, -apple-system, sans-serif;
                  background: white;
                  padding: 20px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                }
                @media print {
                  body { padding: 0; margin: 0; }
                  @page { size: A4 landscape; margin: 0; }
                }
              </style>
            </head>
            <body>
              ${certificateHTML}
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 500);
                  }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        
        document.title = originalTitle;
        toast.success('PDF print dialog opened!');
      }
      
      setCertificate(prev => prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : null);
      
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download certificate. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentName.trim()) {
      setNameSubmitted(true);
      // Update certificate with student name
      if (certificate) {
        setCertificate(prev => prev ? { ...prev, studentName: studentName.trim() } : null);
      }
    } else {
      toast.error('Please enter your name');
    }
  };

  const handleShare = (platform: string) => {
    const shareUrl = window.location.href;
    const text = `I've completed the ${certificate?.program.name} at ${certificate?.subsidiary.name}! 🎓 #Certificate #Achievement`;
    
    let url = '';
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent('Check out my certificate!')}&body=${encodeURIComponent(text + '\\n\\n' + shareUrl)}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareUrlCopied(true);
    toast.success('Certificate link copied to clipboard!');
    setTimeout(() => setShareUrlCopied(false), 2000);
  };

  // Show name input form if name hasn't been submitted
  if (!nameSubmitted) {
    return (
      <div className={`min-h-screen ${theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'
      } flex items-center justify-center p-4`}>
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <Award className={`w-16 h-16 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} mx-auto mb-4`} />
              {/* <img 
                src={certificate.subsidiary.logo} 
                alt={certificate.subsidiary.name}
                className="h-10 w-auto"
              /> */}
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'} mb-2`}>
                Access Your Certificate
              </h1>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                Enter your full name as you want it to appear on the certificate.
              </p>
            </div>
            
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div>
                <label htmlFor="studentName" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                  Your Full Name *
                </label>
                <input
                  type="text"
                  id="studentName"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter your full name as you want it to appear on the certificate"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                View My Certificate
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <div className={`flex items-center justify-center gap-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
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
      <div className={`min-h-screen ${theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'
      } flex items-center justify-center`}>
        <Card className={`w-96 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardContent className="text-center p-8">
            <div className={`animate-spin rounded-full h-16 w-16 border-b-2 ${theme === 'dark' ? 'border-indigo-400' : 'border-indigo-600'} mx-auto mb-4`} />
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'} mb-2`}>Loading Certificate</h2>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Please wait while we fetch your certificate...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className={`min-h-screen ${theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'
      } flex items-center justify-center`}>
        <Card className={`w-96 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardContent className="text-center p-8">
            <Award className={`w-16 h-16 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-4`} />
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'} mb-2`}>Certificate Not Found</h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
              The certificate you're looking for doesn't exist or may have been removed.
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`min-h-screen ${theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'
      }`}>
        
        {/* Header */}
        <header className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-indigo-100'} border-b shadow-sm`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <img 
                  src={certificate.subsidiary.logo} 
                  alt={certificate.subsidiary.name}
                  className="h-10 w-auto"
                />
                <div>
                  <h1 className={`text-lg font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                    {certificate.subsidiary.name}
                  </h1>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Digital Certificate</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(certificate.status)}>
                  <Shield className="w-3 h-3 mr-1" />
                  {certificate.status.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  <Globe className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Main Layout: Certificate and Actions Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Certificate Display - Takes up 3 columns */}
            <div className="lg:col-span-3">
              <div className="w-full overflow-x-auto">
                <div ref={certificateRef} className="flex justify-center min-w-max">
                  <CertificateRenderer
                    templateId={certificate.templateType || '2'}
                    header={certificate.header || 'Certificate'} // Use actual header from backend
                    courseTitle={certificate.courseTitle || certificate.program.name}
                    description={certificate.description}
                    date={certificate.completionDate}
                    recipientName={certificate.studentName}
                    isPreview={true}
                  />
                </div>
              </div>
            </div>

            {/* Actions Sidebar - Takes up 1 column */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Actions Card */}
                <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardContent className="p-6">
                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-gray-100' : ''}`}>
                      <Download className="w-4 h-4" />
                      Actions
                    </h3>
                    <div className="space-y-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            onClick={() => handleDownload('png')}
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

                      <Tooltip>
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
                      </Tooltip>

                      <Tooltip>
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
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline"
                            onClick={() => setShowFullDetails(!showFullDetails)}
                            className="w-full"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {showFullDetails ? 'Hide' : 'Show'} Details
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
                <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardContent className="p-6">
                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-gray-100' : ''}`}>
                      <Shield className="w-4 h-4 text-green-600" />
                      Status
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-700">Verified</p>
                          <p className="text-xs text-green-600">Authentic certificate</p>
                        </div>
                      </div>
                      <div className={`pt-3 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-100'}`}>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Verify at <span className="font-mono">genomac.com/verify</span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Share Options Card */}
                <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardContent className="p-6">
                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-gray-100' : ''}`}>
                      <Share2 className="w-4 h-4" />
                      Share
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShare('facebook')}
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
                            onClick={() => handleShare('twitter')}
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
                            onClick={() => handleShare('linkedin')}
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
                            onClick={() => handleShare('whatsapp')}
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
                            onClick={() => handleShare('email')}
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
                <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardContent className="p-6">
                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-gray-100' : ''}`}>
                      <Award className="w-4 h-4" />
                      Certificate Info
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Student:</span>
                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-100' : ''}`}>{certificate.studentName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Organization:</span>
                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-100' : ''}`}>{certificate.subsidiary.shortName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Completed:</span>
                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-100' : ''}`}>{formatDate(certificate.completionDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Download className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Downloads:</span>
                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-100' : ''}`}>{certificate.downloadCount} times</span>
                      </div>

                      {showFullDetails && (
                        <div className={`mt-4 pt-4 border-t space-y-3 ${theme === 'dark' ? 'border-gray-600' : ''}`}>
                          <div>
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Program Description:</span>
                            <p className={`mt-1 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{certificate.program.description}</p>
                          </div>
                          <div>
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Issued Date:</span>
                            <p className={`font-medium ${theme === 'dark' ? 'text-gray-100' : ''}`}>{formatDate(certificate.issuedDate)}</p>
                          </div>
                          {certificate.verificationCode && (
                            <div>
                              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Verification Code:</span>
                              <p className={`font-mono text-xs ${theme === 'dark' ? 'text-gray-100' : ''}`}>{certificate.verificationCode}</p>
                            </div>
                          )}
                          <div>
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Certificate ID:</span>
                            <p className={`font-mono text-xs ${theme === 'dark' ? 'text-gray-100' : ''}`}>{certificate.id}</p>
                          </div>
                          <div>
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Last Accessed:</span>
                            <p className={`font-medium ${theme === 'dark' ? 'text-gray-100' : ''}`}>{formatDate(certificate.lastAccessed)}</p>
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
        <footer className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t mt-12`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                © 2025 Genomac Holdings. All rights reserved.
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                This digital certificate is powered by the Genomac Holdings Certificate Platform
              </p>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
};

export default StudentCertificate;
