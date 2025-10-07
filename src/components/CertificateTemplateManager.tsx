import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  FileText,
  Upload,
  Eye,
  // Edit,
  // Palette,
  Settings,
  Copy,
  // Trash2
} from "lucide-react";
import { toast } from "sonner";
import type { Subsidiary, Program } from "../App";

interface CertificateTemplateManagerProps {
  // allow either managing a single subsidiary or multiple (holdings admin)
  subsidiary?: Subsidiary | null;
  subsidiaries?: Subsidiary[];
}

export default function CertificateTemplateManager({
  subsidiary,
  subsidiaries,
}: CertificateTemplateManagerProps) {
  // If multiple subsidiaries provided, allow selecting which one to manage
  const initialId = subsidiary
    ? subsidiary.id
    : subsidiaries && subsidiaries.length > 0
    ? subsidiaries[0].id
    : null;
  const [targetSubsidiaryId, setTargetSubsidiaryId] = useState<string | null>(
    initialId
  );
  const allSubs = subsidiaries || (subsidiary ? [subsidiary] : []);
  const targetSubsidiary =
    allSubs.find((s) => s.id === targetSubsidiaryId) || subsidiary || null;

  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [templateStyle, setTemplateStyle] = useState("modern");
  const [customFields, setCustomFields] = useState({
    title: "Certificate of Completion",
    subtitle: "This certifies that",
    footer: "has successfully completed the program",
  });

  const templates = [
    {
      id: "modern",
      name: "Modern Gradient",
      description: "Clean design with gradient backgrounds",
      preview:
        "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=200&fit=crop",
    },
    {
      id: "elegant",
      name: "Elegant Classic",
      description: "Traditional certificate design",
      preview:
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&h=200&fit=crop",
    },
    {
      id: "minimal",
      name: "Minimal Clean",
      description: "Simple and professional",
      preview:
        "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop",
    },
    {
      id: "corporate",
      name: "Corporate Professional",
      description: "Business-focused design",
      preview:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop",
    },
  ];

  const handleSaveTemplate = () => {
    toast.success("Template configuration saved successfully!");
  };

  const handlePreviewTemplate = () => {
    // This would open a preview modal in a real implementation
    toast.info("Template preview opened in new window");
  };

  // Reset selected program when the managed subsidiary changes
  useEffect(() => {
    if (targetSubsidiary?.programs && targetSubsidiary.programs.length > 0) {
      setSelectedProgram(targetSubsidiary.programs[0].id);
    } else {
      setSelectedProgram("");
    }
  }, [targetSubsidiary]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Certificate Template Manager
        </CardTitle>
        <CardDescription>
          Customize certificate templates and branding for your programs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Subsidiary selector for holdings admins */}
        {allSubs.length > 1 && (
          <div className="mb-4">
            <Label>Manage Subsidiary</Label>
            <select
              value={targetSubsidiaryId || ""}
              onChange={(e) => setTargetSubsidiaryId(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {allSubs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="customize">Customize</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* Template Selection */}
          <TabsContent value="templates" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Choose Template Style</h3>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Custom
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all ${
                      templateStyle === template.id
                        ? "ring-2 ring-indigo-500 border-indigo-200"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setTemplateStyle(template.id)}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-[4/3] bg-gray-100 rounded-lg mb-3 overflow-hidden">
                        <img
                          src={template.preview}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="font-medium mb-1">{template.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {template.description}
                      </p>
                      <div className="flex gap-2">
                        {templateStyle === template.id && (
                          <Badge className="bg-indigo-100 text-indigo-800">
                            Selected
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Customization */}
          <TabsContent value="customize" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Program Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Program Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Program</Label>
                    <Select
                      value={selectedProgram}
                      onValueChange={setSelectedProgram}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a program" />
                      </SelectTrigger>
                      <SelectContent>
                        {(targetSubsidiary?.programs || []).map(
                          (program: Program) => (
                            <SelectItem key={program.id} value={program.id}>
                              {program.name}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Template Style</Label>
                    <Select
                      value={templateStyle}
                      onValueChange={setTemplateStyle}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Text Customization */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Text Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Certificate Title</Label>
                    <Input
                      value={customFields.title}
                      onChange={(e) =>
                        setCustomFields((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Subtitle Text</Label>
                    <Input
                      value={customFields.subtitle}
                      onChange={(e) =>
                        setCustomFields((prev) => ({
                          ...prev,
                          subtitle: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Footer Text</Label>
                    <Input
                      value={customFields.footer}
                      onChange={(e) =>
                        setCustomFields((prev) => ({
                          ...prev,
                          footer: e.target.value,
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Branding */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Branding & Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={targetSubsidiary?.primaryColor || "#6366f1"}
                        className="w-16 h-10 p-1 border rounded"
                        readOnly
                      />
                      <Input
                        value={targetSubsidiary?.primaryColor || "#6366f1"}
                        className="flex-1"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Logo</Label>
                    <div className="flex items-center gap-4">
                      <img
                        src={targetSubsidiary?.logo}
                        alt="Current logo"
                        className="w-16 h-16 object-cover rounded border"
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Change Logo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    <Button onClick={handleSaveTemplate}>
                      <Settings className="w-4 h-4 mr-2" />
                      Save Configuration
                    </Button>

                    <Button variant="outline" onClick={handlePreviewTemplate}>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Template
                    </Button>

                    <Button variant="outline">
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preview */}
          <TabsContent value="preview" className="space-y-6">
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-8 mb-4">
                <p className="text-gray-500 mb-4">Certificate Preview</p>
                <div className="w-full max-w-2xl mx-auto aspect-[4/3] bg-white rounded shadow-lg flex items-center justify-center">
                  <p className="text-gray-400">
                    Template preview will appear here
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button onClick={handlePreviewTemplate}>
                  <Eye className="w-4 h-4 mr-2" />
                  Full Preview
                </Button>
                <Button variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Generate Sample
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Keep selected program in sync when subsidiary changes
// (placed after export so TypeScript doesn't complain about hooks ordering)
// Actually, use effect inside component is preferred; move below is unnecessary.
