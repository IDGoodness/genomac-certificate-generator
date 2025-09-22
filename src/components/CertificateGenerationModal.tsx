import React, { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Award,
  Upload,
  // User,
  Users,
  // FileText,
  Download,
  Eye,
  CheckCircle,
  // AlertCircle,
  Copy,
  ExternalLink,
  Palette,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import CertificateViewer from "./CertificateViewer";
import {
  authService,
  type CreateCertificateRequest,
} from "../services/auth.service";
import {
  generateCertificateId,
  generateSecureCertificateUrl as createCertificateUrl,
} from "../utils/certificateUtils";
// import CertificateTemplateSelector from './CertificateTemplateSelector';
// import CertificateTemplate from './CertificateTemplate';

interface GeneratedCertificate {
  id: string;
  studentName: string;
  email?: string;
  generatedAt: string;
  certificateUrl: string;
}

interface CertificateGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  subsidiaries: any[];
  currentSubsidiary: any;
  onUpdateProgramStats: (
    subsidiaryId: string,
    programId: string,
    certificateCount: number
  ) => void;
  onCertificatesGenerated: (
    certificates: GeneratedCertificate[],
    subsidiary: any,
    program: any
  ) => void;
}

export default function CertificateGenerationModal({
  isOpen,
  onClose,
  user,
  subsidiaries,
  currentSubsidiary,
  onUpdateProgramStats,
  onCertificatesGenerated,
}: CertificateGenerationModalProps) {
  const [activeTab, setActiveTab] = useState("setup");
  const [selectedSubsidiary, setSelectedSubsidiary] = useState(
    currentSubsidiary?.id || ""
  );
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("1");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [bulkStudents, setBulkStudents] = useState("");
  const [generatedCertificates, setGeneratedCertificates] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCertificateId, setSelectedCertificateId] = useState<
    string | null
  >(null);
  // const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [generationType, setGenerationType] = useState<"individual" | "bulk">(
    "individual"
  );

  // Get available subsidiaries based on user permissions
  const availableSubsidiaries =
    user.role === "holdings_admin"
      ? subsidiaries
      : user.subsidiary
      ? [user.subsidiary]
      : [];

  // Get programs for selected subsidiary
  const selectedSubsidiaryData = subsidiaries.find(
    (s) => s.id === selectedSubsidiary
  );
  const availablePrograms = selectedSubsidiaryData?.programs || [];

  // Get selected program data
  interface Program {
    id: string;
    name: string;
    description?: string;
    template: string;
    certificates: number;
    [key: string]: unknown;
    allowedTemplates?: string[];
  }

  // interface Subsidiary {
  //   id: string;
  //   name: string;
  //   shortName: string;
  //   logo: string;
  //   primaryColor?: string;
  //   programs: Program[];
  //   [key: string]: any;
  // }

  const selectedProgramData: Program | undefined = (
    availablePrograms as Program[]
  ).find((p: Program) => p.id === selectedProgram);

  // Determine allowed templates for the current subsidiary/program (fallback = ['1','2'])
  const allowedTemplates: string[] = React.useMemo(() => {
    // program-level allowedTemplates (optional)
    if (
      selectedProgramData?.allowedTemplates &&
      selectedProgramData.allowedTemplates.length
    )
      return selectedProgramData.allowedTemplates;
    // subsidiary-level allowedTemplates (optional)
    if (
      selectedSubsidiaryData?.allowedTemplates &&
      selectedSubsidiaryData.allowedTemplates.length
    )
      return selectedSubsidiaryData.allowedTemplates;
    // default: allow a sensible subset (1 & 2) and include institute special if the subsidiary id contains 'institute'
    return selectedSubsidiaryData?.id?.includes("institute")
      ? ["1", "2", "11"]
      : ["1", "2"];
  }, [selectedProgramData, selectedSubsidiaryData]);

  // Keep selectedTemplate in sync with selected program / allowed list
  useEffect(() => {
    if (selectedProgramData?.template) {
      setSelectedTemplate(selectedProgramData.template);
      return;
    }
    if (allowedTemplates && allowedTemplates.length) {
      setSelectedTemplate((prev) =>
        allowedTemplates.includes(prev) ? prev : allowedTemplates[0]
      );
    }
  }, [
    selectedProgram,
    selectedSubsidiary,
    selectedProgramData,
    selectedSubsidiaryData,
    allowedTemplates,
  ]);

  // Generate certificate URL
  const generateCertificateUrl = (certificateId: string) => {
    return createCertificateUrl(
      selectedSubsidiary,
      selectedProgram,
      certificateId
    );
  };

  // Map template names to numeric IDs for backend API
  const mapTemplateToId = (templateName: string): string => {
    // Only use "1" and "2" - no more confusing template names
    const templateMap: Record<string, string> = {
      "1": "1",
      "2": "2",
      "11":"11",
      basic: "1",
      professional: "2",
      advanced: "2",
      "genomac-research": "2",
      // Legacy template mappings - all map to either 1 or 2
      modern: "1",
      classic: "2",
      elegant: "2",
      genomac: "2",
    };

    const mappedId = templateMap[templateName] || "1";

    console.log("🔄 Template mapping result:", {
      inputTemplate: templateName,
      mappedId: mappedId,
      onlyUsingIds: "Legacy mappings preserved",
    });

    return mappedId;
  };

  // Parse bulk students input
  const parseBulkStudents = (input: string) => {
    const lines = input.trim().split("\n");
    const students = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Support CSV format: "Name, Email" or just "Name"
      const parts = trimmed.split(",").map((p) => p.trim());
      if (parts.length >= 2) {
        students.push({ name: parts[0], email: parts[1] });
      } else if (parts.length === 1) {
        students.push({ name: parts[0], email: "" });
      }
    }

    return students;
  };

  // Generate individual certificate
  const generateIndividualCertificate = async () => {
    if (!selectedSubsidiary || !selectedProgram || !studentName.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsGenerating(true);

    try {
      // Create certificate request using the actual API
      const certificateRequest: CreateCertificateRequest = {
        header: `Certificate of Completion`,
        courseTitle: selectedProgramData?.name || "Course",
        description:
          customMessage.trim() ||
          `This certifies that ${studentName.trim()} has successfully completed the ${
            selectedProgramData?.name || "course"
          }.`,
        date: new Date().toISOString().split("T")[0],
        // Use the explicitly selected template (from selector) if present, otherwise fall back to program template
        templateType: mapTemplateToId(
          selectedTemplate || selectedProgramData?.template || "basic"
        ), // Convert template name to numeric ID
        studentName: studentName.trim(), // Include the student name
      };

      console.log("🎓 Creating certificate with template:", {
        programName: selectedProgramData?.name,
        programTemplateName: selectedProgramData?.template,
        mappedTemplateId: certificateRequest.templateType,
        fullCertificateRequest: certificateRequest,
      });

      // For Holdings admin, include the current subsidiary in the request
      const userInfo = authService.getUserInfo();
      if (userInfo.isHoldingsAdmin && currentSubsidiary) {
        certificateRequest.subsidiary = currentSubsidiary.id;
        console.log(
          "🏢 Holdings admin: Adding subsidiary to certificate request:",
          currentSubsidiary.id
        );
      }

      const response = await authService.createCertificate(certificateRequest);

      console.log("📥 Backend response received:", {
        success: response.success,
        message: response.message,
        responseData: response.data,
        backendCertificateId: response.data?.certificateId || response.data?.id,
      });

      if (response.success) {
        const certificateId = (response.data?.certificateId ||
          response.data?.id ||
          generateCertificateId()) as string;
        const certificateUrl =
          response.data?.certificateUrl ||
          generateCertificateUrl(certificateId);

        const certificate = {
          id: certificateId,
          studentName: studentName.trim(),
          email: studentEmail.trim(),
          generatedAt: new Date().toISOString(),
          certificateUrl: certificateUrl,
          program: { ...selectedProgramData }, // Keep the original program template, don't override it
          subsidiary: selectedSubsidiaryData,
          customMessage: customMessage.trim(),
          backendCertificateId: certificateId, // Store the backend ID for CertificateViewer
        };

        setGeneratedCertificates([certificate]);
        setSelectedCertificateId(certificateId);

        // Update program statistics
        onUpdateProgramStats(selectedSubsidiary, selectedProgram, 1);

        toast.success("Certificate generated successfully!");
        setActiveTab("results");

        // Clear form
        setStudentName("");
        setStudentEmail("");
        setCustomMessage("");
      } else {
        throw new Error(response.message || "Failed to generate certificate");
      }
    } catch (error) {
      console.error("Certificate generation failed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate certificate"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate bulk certificates
  const generateBulkCertificates = async () => {
    if (!selectedSubsidiary || !selectedProgram || !bulkStudents.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const students = parseBulkStudents(bulkStudents);
    if (students.length === 0) {
      toast.error("No valid student data found");
      return;
    }

    setIsGenerating(true);

    try {
      const certificates = [];

      // Generate certificates for each student
      for (const student of students) {
        const certificateRequest: CreateCertificateRequest = {
          header: `Certificate of Completion`,
          courseTitle: selectedProgramData?.name || "Course",
          description:
            customMessage.trim() ||
            `This certifies that ${
              student.name
            } has successfully completed the ${
              selectedProgramData?.name || "course"
            }.`,
          date: new Date().toISOString().split("T")[0],
          templateType: mapTemplateToId(
            selectedTemplate || selectedProgramData?.template || "basic"
          ), // Convert template name to numeric ID
          studentName: student.name, // Include the student name
        };

        // For Holdings admin, include the current subsidiary in the request
        const userInfo = authService.getUserInfo();
        if (userInfo.isHoldingsAdmin && currentSubsidiary) {
          certificateRequest.subsidiary = currentSubsidiary.id;
          console.log(
            "🏢 Holdings admin bulk: Adding subsidiary to certificate request:",
            currentSubsidiary.id
          );
        }

        const response = await authService.createCertificate(
          certificateRequest
        );

        if (response.success) {
          const certificateId = (response.data?.certificateId ||
            response.data?.id ||
            generateCertificateId()) as string;
          const certificateUrl =
            response.data?.certificateUrl ||
            generateCertificateUrl(certificateId);

          certificates.push({
            id: certificateId,
            studentName: student.name,
            email: student.email,
            generatedAt: new Date().toISOString(),
            certificateUrl: certificateUrl,
            program: { ...selectedProgramData }, // Keep the original program template, don't override it
            subsidiary: selectedSubsidiaryData,
            customMessage: customMessage.trim(),
            backendCertificateId: certificateId, // Store the backend ID for CertificateViewer
          });
        } else {
          console.error(
            `Failed to generate certificate for ${student.name}:`,
            response.message
          );
        }
      }

      setGeneratedCertificates(certificates);

      // Update program statistics
      onUpdateProgramStats(
        selectedSubsidiary,
        selectedProgram,
        certificates.length
      );

      toast.success(
        `${certificates.length} certificates generated successfully!`
      );
      setActiveTab("results");

      // Clear form
      setBulkStudents("");
      setCustomMessage("");
    } catch (error) {
      console.error("Bulk certificate generation failed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate certificates"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy certificate URL to clipboard
  const copyCertificateUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Certificate URL copied to clipboard!");
  };

  // Export certificate list as CSV
  const exportCertificateList = () => {
    const csvHeader =
      "Student Name,Email,Certificate ID,Certificate URL,Generated At\n";
    const csvRows = generatedCertificates
      .map(
        (cert) =>
          `"${cert.studentName}","${cert.email}","${cert.id}","${
            cert.certificateUrl
          }","${new Date(cert.generatedAt).toLocaleString()}"`
      )
      .join("\n");

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `certificates-${selectedProgramData?.name || "export"}-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();

    URL.revokeObjectURL(url);
    toast.success("Certificate list exported successfully!");
  };

  // Handle preview button - redirects to Preview Student Experience tab
  const handlePreviewCertificates = () => {
    if (
      generatedCertificates.length > 0 &&
      selectedSubsidiaryData &&
      selectedProgramData
    ) {
      onCertificatesGenerated(
        generatedCertificates,
        selectedSubsidiaryData,
        selectedProgramData
      );
      onClose();
    }
  };

  const resetModal = () => {
    setActiveTab("setup");
    setSelectedSubsidiary(currentSubsidiary?.id || "");
    setSelectedProgram("");
    setSelectedTemplate("1");
    setStudentName("");
    setStudentEmail("");
    setCustomMessage("");
    setBulkStudents("");
    setGeneratedCertificates([]);
    setIsGenerating(false);
    setGenerationType("individual");
    setSelectedCertificateId(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const canProceedToGeneration =
    selectedSubsidiary && selectedProgram && selectedTemplate;

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-default">
                    <Award className="w-5 h-5 text-indigo-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Certificate generation system</p>
                </TooltipContent>
              </Tooltip>
              Generate Certificates
            </DialogTitle>
            <DialogDescription>
              Create beautiful, professional certificates for your students with
              customizable templates
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="template" disabled={!selectedProgram}>
                Template
              </TabsTrigger>
              <TabsTrigger
                value="generation"
                disabled={!canProceedToGeneration}
              >
                Generation
              </TabsTrigger>
              <TabsTrigger
                value="results"
                disabled={generatedCertificates.length === 0}
              >
                Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-6">
              {/* Program Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Program</CardTitle>
                  <CardDescription>
                    Choose the subsidiary and program for certificate generation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Subsidiary</Label>
                      <Select
                        value={selectedSubsidiary}
                        onValueChange={setSelectedSubsidiary}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subsidiary" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSubsidiaries.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              <div className="flex items-center gap-2">
                                <img
                                  src={sub.logo}
                                  alt={sub.name}
                                  className="w-4 h-4 rounded"
                                />
                                {sub.shortName}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Program</Label>
                      <Select
                        value={selectedProgram}
                        onValueChange={setSelectedProgram}
                        disabled={!selectedSubsidiary}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select program" />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePrograms.map((program: Program) => (
                            <SelectItem key={program.id} value={program.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{program.name}</span>
                                <Badge variant="secondary" className="ml-2">
                                  {program.template}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Program Info Display */}
                  {selectedProgramData && (
                    <Card className="bg-gradient-to-r from-indigo-50 to-purple-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{
                              background: `linear-gradient(135deg, ${selectedSubsidiaryData?.primaryColor}40, ${selectedSubsidiaryData?.primaryColor}60)`,
                            }}
                          >
                            <Award
                              className="w-5 h-5"
                              style={{
                                color: selectedSubsidiaryData?.primaryColor,
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">
                              {selectedProgramData.name}
                            </h3>
                            <p className="text-gray-600">
                              {selectedProgramData.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">
                                Template: {selectedProgramData.template}
                              </Badge>
                              <Badge variant="outline">
                                {selectedProgramData.certificates} certificates
                                issued
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setActiveTab("template")}
                      disabled={!selectedProgram}
                    >
                      Next: Choose Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="template" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Certificate Template
                      </CardTitle>
                      <CardDescription>
                        Choose the perfect template for your certificates
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      // onClick={() => setShowTemplateSelector(true)}x
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Browse Templates
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedSubsidiaryData && selectedProgramData && (
                    <div className="space-y-6">
                      {/* Current Template Preview */}
                      <div className="text-center">
                        <div className="inline-block transform scale-50 origin-top">
                          {/* <CertificateTemplate
                            subsidiary={selectedSubsidiaryData}
                            // program={{ ...selectedProgramData, template: selectedTemplate }}
                            studentName="Sample Student Name"
                            certificateId="DEMO-2024-123456"
                            completionDate={new Date().toISOString()}
                            template={selectedTemplate}
                            preview={true}
                          /> */}
                        </div>
                      </div>

                      {/* Template Info */}
                      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <h3 className="font-bold text-lg mb-2">
                              {selectedTemplate.charAt(0).toUpperCase() +
                                selectedTemplate.slice(1)}{" "}
                              Template
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Perfect for {selectedProgramData.name}
                            </p>
                            <Badge variant="default">{selectedTemplate}</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab("setup")}
                        >
                          Back to Setup
                        </Button>
                        <Button onClick={() => setActiveTab("generation")}>
                          Next: Generate Certificates
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="generation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generation Type</CardTitle>
                  <CardDescription>
                    Choose how many certificates to generate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs
                    value={generationType}
                    onValueChange={(value: string) =>
                      setGenerationType(value as "individual" | "bulk")
                    }
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="individual">
                        Individual Certificate
                      </TabsTrigger>
                      <TabsTrigger value="bulk">Bulk Generation</TabsTrigger>
                    </TabsList>

                    <TabsContent value="individual" className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="studentName">Student Name *</Label>
                          <Input
                            id="studentName"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            placeholder="Enter full name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="studentEmail">
                            Email Address (optional)
                          </Label>
                          <Input
                            id="studentEmail"
                            type="email"
                            value={studentEmail}
                            onChange={(e) => setStudentEmail(e.target.value)}
                            placeholder="student@example.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customMessage">
                          Custom Message (optional)
                        </Label>
                        <Textarea
                          id="customMessage"
                          value={customMessage}
                          onChange={(e) => setCustomMessage(e.target.value)}
                          placeholder="Add a personalized message for the certificate..."
                          rows={3}
                        />
                      </div>

                      <Button
                        onClick={generateIndividualCertificate}
                        disabled={isGenerating || !studentName.trim()}
                        className="w-full"
                      >
                        {isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Generating Certificate...
                          </>
                        ) : (
                          <>
                            <Award className="w-4 h-4 mr-2" />
                            Generate Certificate
                          </>
                        )}
                      </Button>
                    </TabsContent>

                    <TabsContent value="bulk" className="space-y-4 mt-6">
                      <div className="space-y-2">
                        <Label htmlFor="bulkStudents">Student List *</Label>
                        <Textarea
                          id="bulkStudents"
                          value={bulkStudents}
                          onChange={(e) => setBulkStudents(e.target.value)}
                          placeholder={`John Doe, john@example.com
                            Jane Smith, jane@example.com
                            Robert Johnson
                            Mary Williams, mary@example.com`}
                          rows={8}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500">
                          {parseBulkStudents(bulkStudents).length} students
                          detected
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bulkCustomMessage">
                          Custom Message (optional)
                        </Label>
                        <Textarea
                          id="bulkCustomMessage"
                          value={customMessage}
                          onChange={(e) => setCustomMessage(e.target.value)}
                          placeholder="Add a personalized message for all certificates..."
                          rows={3}
                        />
                      </div>

                      <Alert>
                        <Upload className="h-4 w-4" />
                        <AlertDescription>
                          You can also upload a CSV file by copying and pasting
                          the content here.
                        </AlertDescription>
                      </Alert>

                      <Button
                        onClick={generateBulkCertificates}
                        disabled={isGenerating || !bulkStudents.trim()}
                        className="w-full"
                      >
                        {isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Generating Certificates...
                          </>
                        ) : (
                          <>
                            <Users className="w-4 h-4 mr-2" />
                            Generate {
                              parseBulkStudents(bulkStudents).length
                            }{" "}
                            Certificates
                          </>
                        )}
                      </Button>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-start mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("template")}
                    >
                      Back to Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              {/* Certificate Display */}
              {generatedCertificates.length === 1 &&
                generatedCertificates[0].backendCertificateId && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Certificate Generated Successfully!
                      </CardTitle>
                      <CardDescription>
                        Your certificate is ready to view, download, and share
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CertificateViewer
                        certificateId={
                          generatedCertificates[0].backendCertificateId
                        }
                        showActions={true}
                      />
                    </CardContent>
                  </Card>
                )}

              {/* Generated Certificates List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        {generatedCertificates.length === 1
                          ? "Certificate Details"
                          : `Generated Certificates (${generatedCertificates.length})`}
                      </CardTitle>
                      <CardDescription>
                        {generatedCertificates.length === 1
                          ? "Certificate information and sharing options"
                          : "Share these links with your students to access their certificates"}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handlePreviewCertificates}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview Student Experience
                      </Button>
                      <Button variant="outline" onClick={exportCertificateList}>
                        <Download className="w-4 h-4 mr-2" />
                        Export List
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {generatedCertificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{cert.studentName}</h4>
                            {cert.email && (
                              <Badge variant="secondary" className="text-xs">
                                {cert.email}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 font-mono">
                            {cert.id}
                          </p>
                          <p className="text-xs text-gray-500">
                            Generated{" "}
                            {new Date(cert.generatedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              copyCertificateUrl(cert.certificateUrl)
                            }
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(cert.certificateUrl, "_blank")
                            }
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          {cert.backendCertificateId && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setSelectedCertificateId(
                                  cert.backendCertificateId
                                )
                              }
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Individual Certificate Viewer Modal */}
              {selectedCertificateId && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Certificate Preview</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCertificateId(null)}
                      >
                        Close Preview
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CertificateViewer
                      certificateId={selectedCertificateId}
                      showActions={true}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Template Selector Modal */}
      {/* {selectedSubsidiaryData && selectedProgramData && (
        <CertificateTemplateSelector
          isOpen={showTemplateSelector}
          onClose={() => setShowTemplateSelector(false)}
          onSelect={handleTemplateSelect}
          subsidiary={selectedSubsidiaryData}
          // testimonials={selectedTestimonialData}
          program={selectedProgramData}
          selectedTemplate={selectedTemplate}
        />
      )} */}
    </TooltipProvider>
  );
}
