import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Award, Loader2, CheckCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  authService,
  type CreateCertificateRequest,
  type CreateCertificateResponse,
} from "../services/auth.service";
import TemplatePreviewSelector from "./TemplatePreviewSelector";
import CertificateViewer from "./CertificateViewer";
import CertificateRenderer from "./CertificateRenderer";
import { getTemplateName } from "../utils/templateUtils";
import type { UserProfile, Subsidiary } from "../App";

interface SimpleCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  currentSubsidiary: Subsidiary | null;
}

export default function SimpleCertificateModal({
  isOpen,
  onClose,
  user,
  currentSubsidiary,
}: SimpleCertificateModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCertificate, setGeneratedCertificate] =
    useState<CreateCertificateResponse | null>(null);
  const [certificateId, setCertificateId] = useState<string | null>(null);

  // Form fields matching the API interface
  const [formData, setFormData] = useState<CreateCertificateRequest>({
    header: "",
    description: "",
    courseTitle: "",
    date: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
    templateType: "1", // Default to template 1
  });

  const handleInputChange = (
    field: keyof CreateCertificateRequest,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGenerate = async () => {
    // Validate required fields
    if (
      !formData.header.trim() ||
      !formData.courseTitle.trim() ||
      !formData.templateType
    ) {
      toast.error("Please fill in all required fields and select a template");
      return;
    }

    setIsGenerating(true);

    try {
      // Unified auth: all users can create certificates
      const certificateRequest = { ...formData };

      // Include subsidiary if one is selected
      if (currentSubsidiary) {
        certificateRequest.subsidiary = currentSubsidiary.id;
      }

      const response = await authService.createCertificate(certificateRequest);

      setGeneratedCertificate(response);

      // Extract certificate ID from response
      const certId = response.data?.certificateId || response.data?.id || "";
      if (certId && typeof certId === "string") {
        setCertificateId(certId);
      }

      toast.success("Certificate generated successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate certificate"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setFormData({
      header: "",
      description: "",
      courseTitle: "",
      date: new Date().toISOString().split("T")[0],
      templateType: "1",
    });
    setGeneratedCertificate(null);
    setCertificateId(null);
    onClose();
  };

  // Helper function to format certificate date with ordinal suffix (JULY 22nd 2025)
  const formatCertificateDate = (dateString: string) => {
    const date = new Date(dateString);

    // Get date components
    const day = date.getDate();
    const month = date
      .toLocaleDateString("en-US", { month: "long" })
      .toUpperCase();
    const year = date.getFullYear();

    // Add ordinal suffix to day
    const getOrdinalSuffix = (day: number) => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
  };

  const handleDownloadCertificate = () => {
    const data = generatedCertificate?.data as { downloadUrl?: string };
    if (data?.downloadUrl) {
      window.open(data.downloadUrl, "_blank");
    } else {
      toast.error("Download URL not available");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl sm:max-w-7xl md:max-w-7xl lg:max-w-7xl xl:max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Generate Certificate
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to generate a new certificate
          </DialogDescription>
        </DialogHeader>

        {!generatedCertificate ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form Fields */}
            <div className="space-y-6">
              <div className="space-y-4">
                {/* Certificate Header */}
                <div className="space-y-2">
                  <Label htmlFor="header">Certificate Header *</Label>
                  <Input
                    id="header"
                    placeholder="e.g., Certificate of Completion"
                    value={formData.header}
                    onChange={(e) =>
                      handleInputChange("header", e.target.value)
                    }
                  />
                </div>

                {/* Course Title */}
                <div className="space-y-2">
                  <Label htmlFor="courseTitle">Course Title *</Label>
                  <Input
                    id="courseTitle"
                    placeholder="e.g., Advanced Web Development"
                    value={formData.courseTitle}
                    onChange={(e) =>
                      handleInputChange("courseTitle", e.target.value)
                    }
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Additional details about the achievement..."
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={3}
                  />
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date">Completion Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                  />
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="min-w-[120px]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Right Column - Template Selection */}
            <div className="space-y-4">
              <div className="border-l pl-6">
                <h3 className="text-lg font-semibold mb-4">
                  Template Selection
                </h3>
                <TemplatePreviewSelector
                  selectedTemplateId={formData.templateType}
                  onSelectTemplate={(templateId) =>
                    handleInputChange("templateType", templateId)
                  }
                  formData={formData}
                  user={user}
                  currentSubsidiary={currentSubsidiary}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Success State - Show Certificate Viewer */
          <div className="space-y-6">
            <div className="text-center pb-4">
              <h3 className="text-lg font-medium text-green-600 mb-2">
                Certificate Generated Successfully! 🎉
              </h3>
              <p className="text-sm text-muted-foreground">
                Your certificate is ready to view, download, and share.
              </p>
            </div>

            {/* Certificate Viewer */}
            {certificateId ? (
              <CertificateViewer
                certificateId={certificateId}
                showActions={true}
              />
            ) : (
              /* Fallback to original response display */
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    Certificate Generated Successfully!
                  </CardTitle>
                  <CardDescription>
                    Your certificate has been created and is ready for use.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Certificate Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Header:</span>
                      <p className="text-muted-foreground">
                        {formData.header ?? ""}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Course:</span>
                      <p className="text-muted-foreground">
                        {formData.courseTitle ?? ""}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Date:</span>
                      <p className="text-muted-foreground">
                        {formData.date ?? ""}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Template:</span>
                      <p className="text-muted-foreground">
                        {getTemplateName(formData.templateType)}
                      </p>
                    </div>
                  </div>

                  {/* Generated Certificate Preview */}
                  {generatedCertificate?.data && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <h4 className="font-medium text-green-700">
                          Certificate Generated Successfully!
                        </h4>
                      </div>
                      <div className="border rounded-lg p-6 bg-gradient-to-br from-gray-50 to-blue-50 shadow-sm">
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">
                            Preview of your generated certificate:
                          </p>
                        </div>
                        <div className="transform scale-75 origin-top">
                          <CertificateRenderer
                            templateId={formData.templateType}
                            header={formData.header}
                            courseTitle={formData.courseTitle}
                            description={formData.description}
                            date={formatCertificateDate(formData.date)}
                            recipientName="[Student Name]"
                            isPreview={true}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={handleClose}>
                      Generate Another
                    </Button>
                    <div className="flex gap-2">
                      {(generatedCertificate?.data as { downloadUrl?: string })
                        ?.downloadUrl && (
                        <Button onClick={handleDownloadCertificate}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                      {(
                        generatedCertificate?.data as {
                          certificateUrl?: string;
                        }
                      )?.certificateUrl && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            const data = generatedCertificate.data as {
                              certificateUrl?: string;
                            };
                            if (data?.certificateUrl) {
                              window.open(data.certificateUrl, "_blank");
                            }
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bottom Actions */}
            <div className="flex justify-center pt-4 border-t">
              <Button variant="outline" onClick={handleClose}>
                Generate Another Certificate
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
