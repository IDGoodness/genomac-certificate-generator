import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Download, X } from 'lucide-react';
import { useState } from 'react';
import { certificateService } from '../services/certificate.service';
import type { Certificate } from '../services/certificate.service';

interface CertificateFullViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    certificate: Certificate;
}

export default function CertificateFullViewModal({
    isOpen,
    onClose,
    certificate
}: CertificateFullViewModalProps) {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        try {
            setDownloading(true);
            await certificateService.downloadCertificate(certificate._id);
        } catch (err) {
            console.error('Error downloading certificate:', err);
            alert('Failed to download certificate');
        } finally {
            setDownloading(false);
        }
    };

    // Simple certificate template display
    const renderCertificateTemplate = () => {
        return (
            <div className="w-full bg-white border-8 border-yellow-600 p-12 text-center shadow-2xl">
                {/* Certificate Border Design */}
                <div className="border-4 border-yellow-500 p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-5xl font-bold text-gray-800 mb-4">
                            {certificate.header}
                        </h1>
                        <div className="w-32 h-1 bg-yellow-600 mx-auto"></div>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-6 mb-8">
                        <p className="text-xl text-gray-700">This is to certify that</p>
                        
                        <div className="my-8">
                            <h2 className="text-4xl font-bold text-blue-800 border-b-2 border-gray-300 pb-2 inline-block">
                                {certificate.studentName || 'Student Name'}
                            </h2>
                        </div>

                        <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
                            {certificate.description}
                        </p>

                        <div className="my-6">
                            <h3 className="text-2xl font-semibold text-gray-800">
                                {certificate.courseTitle}
                            </h3>
                        </div>

                        <p className="text-lg text-gray-600">
                            Completed on {new Date(certificate.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-end mt-16">
                        <div className="text-center">
                            <div className="border-t-2 border-gray-400 pt-2 w-48">
                                <p className="text-sm text-gray-600">Authorized Signature</p>
                            </div>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-20 h-20 border-2 border-gray-400 rounded-full flex items-center justify-center mb-2">
                                <span className="text-xs text-gray-500">SEAL</span>
                            </div>
                            <p className="text-xs text-gray-500">Official Seal</p>
                        </div>
                        
                        <div className="text-center">
                            <div className="border-t-2 border-gray-400 pt-2 w-48">
                                <p className="text-sm text-gray-600">Date</p>
                                <p className="text-sm text-gray-800">
                                    {new Date(certificate.date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Template Type Indicator */}
                    <div className="mt-8">
                        <p className="text-xs text-gray-400">Template: {certificate.templateType}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle>Certificate - {certificate.header}</DialogTitle>
                            <DialogDescription>
                                View and download the full certificate for {certificate.studentName || 'student'}
                            </DialogDescription>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={onClose}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>
                
                <div className="space-y-4">
                    {/* Certificate Details */}
                    <div className="text-sm text-muted-foreground border-b pb-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <span className="font-medium">Course:</span>
                                <p>{certificate.courseTitle}</p>
                            </div>
                            <div>
                                <span className="font-medium">Date:</span>
                                <p>{new Date(certificate.date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <span className="font-medium">Student:</span>
                                <p>{certificate.studentName || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="font-medium">Template:</span>
                                <p>{certificate.templateType}</p>
                            </div>
                        </div>
                    </div>

                    {/* Certificate Template Display */}
                    <div className="bg-gray-100 p-4 rounded-lg min-h-[600px] flex items-center justify-center">
                        <div className="w-full max-w-4xl transform scale-90 origin-center">
                            {renderCertificateTemplate()}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        <Button 
                            onClick={handleDownload}
                            className="flex items-center gap-2"
                            disabled={downloading}
                        >
                            <Download className="w-4 h-4" />
                            {downloading ? 'Downloading...' : 'Download Certificate'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
