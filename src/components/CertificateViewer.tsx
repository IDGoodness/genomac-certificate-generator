import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { 
    Award, 
    Download, 
    ExternalLink, 
    Eye, 
    Calendar, 
    FileText, 
    Loader2,
    AlertCircle,
    Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { certificateService, type Certificate } from '../services/certificate.service';
import { getTemplateName } from '../utils/templateUtils';
import CertificateFullViewModal from './CertificateFullViewModal';

interface CertificateViewerProps {
    certificateId: string;
    showActions?: boolean;
    className?: string;
}

export default function CertificateViewer({ 
    certificateId, 
    showActions = true, 
    className = "" 
}: CertificateViewerProps) {
    const [certificate, setCertificate] = useState<Certificate | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [showFullView, setShowFullView] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const loadCertificate = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await certificateService.getCertificateById(certificateId);
                setCertificate(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load certificate');
            } finally {
                setLoading(false);
            }
        };

        loadCertificate();
    }, [certificateId]);

    const handleDownload = async () => {
        if (!certificate) return;

        try {
            setDownloading(true);
            await certificateService.downloadCertificate(certificate._id);
            toast.success('Certificate downloaded successfully!');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to download certificate');
        } finally {
            setDownloading(false);
        }
    };

    const handlePreview = async () => {
        if (!certificate) return;

        try {
            setLoadingPreview(true);
            const url = await certificateService.getCertificatePreviewUrl(certificate._id);
            window.open(url, '_blank');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to load preview');
        } finally {
            setLoadingPreview(false);
        }
    };

    const handleViewCertificate = () => {
        if (!certificate) return;
        setShowFullView(true);
    };

    const handleDelete = async () => {
        if (!certificate) return;

        const confirmDelete = window.confirm(
            `Are you sure you want to delete this certificate for "${certificate.studentName || 'this student'}"? This action cannot be undone.`
        );

        if (!confirmDelete) return;

        try {
            setDeleting(true);
            await certificateService.deleteCertificate(certificate._id);
            toast.success('Certificate deleted successfully!');
            // Optionally, redirect or refresh the parent component
            window.location.reload(); // Simple approach - you might want to use a callback instead
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete certificate');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-24" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={className}>
                <CardContent className="pt-6">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    <Button 
                        onClick={() => window.location.reload()} 
                        className="mt-4"
                        variant="outline"
                    >
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!certificate) {
        return (
            <Card className={className}>
                <CardContent className="pt-6">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>Certificate not found</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    {certificate.header}
                </CardTitle>
                <CardDescription>
                    {certificate.courseTitle}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Certificate Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Course:</span>
                        <span className="text-muted-foreground">{certificate.courseTitle}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Date:</span>
                        <span className="text-muted-foreground">
                            {new Date(certificate.date).toLocaleDateString()}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Template:</span>
                        <Badge variant="secondary">
                            {getTemplateName(certificate.templateType)}
                        </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className="font-medium">Created:</span>
                        <span className="text-muted-foreground">
                            {new Date(certificate.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {/* Description */}
                {certificate.description && (
                    <div className="space-y-2">
                        <h4 className="font-medium">Description</h4>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                            {certificate.description}
                        </p>
                    </div>
                )}

                {/* Student Name if available */}
                {certificate.studentName && (
                    <div className="space-y-2">
                        <h4 className="font-medium">Recipient</h4>
                        <p className="text-sm text-muted-foreground">
                            {certificate.studentName}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                {showActions && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                        <Button 
                            onClick={handleViewCertificate}
                            variant="default"
                            className="flex items-center gap-2"
                        >
                            <ExternalLink className="w-4 h-4" />
                            View Certificate
                        </Button>
                        
                        <Button 
                            onClick={handlePreview}
                            variant="outline"
                            disabled={loadingPreview}
                            className="flex items-center gap-2"
                        >
                            {loadingPreview ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                            Preview
                        </Button>
                        
                        <Button 
                            onClick={handleDownload}
                            variant="outline"
                            disabled={downloading}
                            className="flex items-center gap-2"
                        >
                            {downloading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            Download
                        </Button>

                        <Button 
                            onClick={handleDelete}
                            variant="destructive"
                            disabled={deleting}
                            className="flex items-center gap-2"
                        >
                            {deleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                            Delete
                        </Button>
                    </div>
                )}
            </CardContent>

            {/* Full View Modal */}
            {certificate && (
                <CertificateFullViewModal
                    isOpen={showFullView}
                    onClose={() => setShowFullView(false)}
                    certificate={certificate}
                />
            )}
        </Card>
    );
}
