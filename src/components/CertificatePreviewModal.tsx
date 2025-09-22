import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { 
  Award,
  Download, 
  Share2,
  Eye,
  // X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Calendar,
  Hash,
  // User
} from 'lucide-react';
import { toast } from 'sonner';
import type { Subsidiary, Program } from '../App';

interface GeneratedCertificate {
  id: string;
  studentName: string;
  email?: string;
  generatedAt: string;
  certificateUrl: string;
}

interface CertificatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificates: GeneratedCertificate[];
  subsidiary: Subsidiary;
  program: Program;
}

export default function CertificatePreviewModal({
  isOpen,
  onClose,
  certificates,
  subsidiary,
  program
}: CertificatePreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'preview'>('list');

  const currentCertificate = certificates[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : certificates.length - 1);
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev < certificates.length - 1 ? prev + 1 : 0);
  };

  const handleDownloadCertificate = (certificate: GeneratedCertificate) => {
    toast.success(`Downloading certificate for ${certificate.studentName}`);
    // In a real app, this would trigger the actual download
  };

  const handleSendCertificate = (certificate: GeneratedCertificate) => {
    toast.success(`Certificate sent to ${certificate.email || certificate.studentName}`);
    // In a real app, this would send the certificate via email
  };

  const handleViewStudentPortal = (certificate: GeneratedCertificate) => {
    const url = `${window.location.origin}/certificate/${subsidiary.id}/${program.id}/${certificate.id}`;
    window.open(url, '_blank');
  };

  if (!currentCertificate) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            Generated Certificates Preview
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>
              Preview and manage certificates for {program.name} • {subsidiary.shortName}
            </span>
            <Badge variant="outline">
              {certificates.length} certificate{certificates.length !== 1 ? 's' : ''} generated
            </Badge>
          </DialogDescription>
        </DialogHeader>

        {/* View Toggle */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
          <Button
            variant={viewMode === 'preview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('preview')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Mode
          </Button>
        </div>

        {viewMode === 'list' ? (
          /* List View */
          <div className="space-y-4">
            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {certificates.map((certificate, index) => (
                <Card key={certificate.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ 
                            background: `linear-gradient(135deg, ${subsidiary.primaryColor}40, ${subsidiary.primaryColor}60)` 
                          }}
                        >
                          <Award 
                            className="w-6 h-6" 
                            style={{ color: subsidiary.primaryColor }} 
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold">{certificate.studentName}</h4>
                          {certificate.email && (
                            <p className="text-sm text-gray-600">{certificate.email}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(certificate.generatedAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Hash className="w-3 h-3" />
                              {certificate.id}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCurrentIndex(index);
                            setViewMode('preview');
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadCertificate(certificate)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleViewStudentPortal(certificate)}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Portal
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Preview Mode */
          <div className="space-y-6">
            {/* Navigation Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={certificates.length <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="text-center">
                  <h3 className="font-semibold">{currentCertificate.studentName}</h3>
                  <p className="text-sm text-gray-600">
                    Certificate {currentIndex + 1} of {certificates.length}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={certificates.length <= 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadCertificate(currentCertificate)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleViewStudentPortal(currentCertificate)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Portal
                </Button>
              </div>
            </div>

            {/* Certificate Preview */}
            <Card>
              <CardContent className="p-8">
                {/* Demo Certificate Design */}
                <div className="w-full aspect-[4/3] bg-gradient-to-br from-white via-indigo-50 to-purple-50 relative overflow-hidden border-8 border-gradient-to-r rounded-lg shadow-2xl">
                  <div className="flex flex-col items-center justify-center h-full px-12 py-8 text-center">
                    {/* Header */}
                    <div className="mb-6">
                      <img 
                        src={subsidiary.logo} 
                        alt={subsidiary.name}
                        className="h-16 w-auto mx-auto mb-4 rounded-lg"
                      />
                      <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        {subsidiary.name}
                      </h1>
                    </div>

                    {/* Certificate Title */}
                    <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
                      Certificate of Completion
                    </h2>
                    
                    <p className="text-lg text-gray-600 mb-4">This certifies that</p>

                    {/* Student Name */}
                    <h3 className="text-5xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-300 pb-2">
                      {currentCertificate.studentName}
                    </h3>
                    
                    <p className="text-xl text-gray-600 mb-4">has successfully completed the</p>

                    {/* Program Name */}
                    <h4 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-8">
                      {program.name}
                    </h4>

                    {/* Footer */}
                    <div className="flex justify-between items-end w-full mt-auto">
                      <div className="text-left">
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="text-lg font-semibold text-gray-700">
                          {new Date(currentCertificate.generatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-32 h-0.5 bg-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-600">Authorized Signature</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Certificate ID</p>
                        <p className="text-sm font-mono text-gray-600">{currentCertificate.id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificate Details */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4">Certificate Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Student Name</p>
                    <p className="font-medium">{currentCertificate.studentName}</p>
                  </div>
                  {currentCertificate.email && (
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{currentCertificate.email}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Generated</p>
                    <p className="font-medium">
                      {new Date(currentCertificate.generatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Certificate ID</p>
                    <p className="font-medium font-mono">{currentCertificate.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Program</p>
                    <p className="font-medium">{program.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Institution</p>
                    <p className="font-medium">{subsidiary.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{program.template} template</Badge>
                <Badge variant="secondary">{subsidiary.shortName}</Badge>
              </div>
              
              <div className="flex gap-2">
                {currentCertificate.email && (
                  <Button
                    variant="outline"
                    onClick={() => handleSendCertificate(currentCertificate)}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Send Certificate
                  </Button>
                )}
                <Button onClick={onClose}>
                  Close Preview
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}