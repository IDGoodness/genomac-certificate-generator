import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Award, 
  Plus, 
  FileText,
  Palette,
  CheckCircle,
  Users,
  Briefcase,
  GraduationCap,
  Microscope
} from 'lucide-react';
import { toast } from 'sonner';
import { generateProgramId } from '../utils/certificateUtils';

interface NewProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  subsidiaries: any[];
  currentSubsidiary: any;
  onAddProgram: (subsidiaryId: string, newProgram: any) => void;
}

const certificateTemplates = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Clean and simple design perfect for general certificates and workshops',
    icon: Users,
    preview: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=200&fit=crop',
    features: ['Clean design', 'Easy to read', 'Professional appearance'],
    useCases: ['Workshops', 'Seminars', 'Basic courses', 'Attendance certificates']
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Modern business-oriented design for corporate training and professional development',
    icon: Briefcase,
    preview: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
    features: ['Professional layout', 'Business-ready design', 'Skills-focused'],
    useCases: ['Workshops', 'Training programs', 'Capacity building', 'Professional development']
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Sophisticated design for research programs, certificates, diplomas, and advanced studies',
    icon: GraduationCap,
    preview: 'https://images.unsplash.com/photo-1523050854058-8df90110c9d1?w=300&h=200&fit=crop',
    features: ['Academic excellence', 'Research-focused', 'Premium appearance'],
    useCases: ['Research programs', 'Certificate courses', 'Diploma programs', 'Advanced studies']
  },
  {
    id: 'genomac-research',
    name: 'Genomac Research',
    description: 'Premium research-focused design with purple gradient for Genomac Institute programs',
    icon: Microscope,
    preview: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=300&h=200&fit=crop',
    features: ['Research institution branding', 'Purple gradient design', 'Dual signatures', 'Official registration details'],
    useCases: ['Research internships', 'Genomics programs', 'Bioinformatics courses', 'Institute certifications']
  }
];

export default function NewProgramModal({ 
  isOpen, 
  onClose, 
  user, 
  subsidiaries, 
  currentSubsidiary,
  onAddProgram 
}: NewProgramModalProps) {
  const [selectedSubsidiary, setSelectedSubsidiary] = useState(currentSubsidiary?.id || '');
  const [programName, setProgramName] = useState('');
  const [programDescription, setProgramDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [duration, setDuration] = useState('');
  const [prerequisites, setPrerequisites] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Get available subsidiaries based on user permissions
  const availableSubsidiaries = user.role === 'holdings_admin' 
    ? subsidiaries 
    : user.subsidiary ? [user.subsidiary] : [];

  // Get selected subsidiary data
  const selectedSubsidiaryData = subsidiaries.find(s => s.id === selectedSubsidiary);
  const selectedTemplateData = certificateTemplates.find(t => t.id === selectedTemplate);

  // Create new program
  const createProgram = () => {
    if (!selectedSubsidiary || !programName.trim() || !programDescription.trim() || !selectedTemplate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreating(true);

    const newProgram = {
      id: generateProgramId(),
      name: programName.trim(),
      description: programDescription.trim(),
      template: selectedTemplate,
      duration: duration.trim() || 'Self-paced',
      prerequisites: prerequisites.trim() || 'None',
      certificates: 0,
      testimonials: 0,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    // Simulate API call
    setTimeout(() => {
      try {
        onAddProgram(selectedSubsidiary, newProgram);
        toast.success(`Program "${programName}" created successfully!`);
        handleClose();
      } catch (error) {
        toast.error('Failed to create program. Please try again.');
      } finally {
        setIsCreating(false);
      }
    }, 1000);
  };

  const handleClose = () => {
    setSelectedSubsidiary(currentSubsidiary?.id || '');
    setProgramName('');
    setProgramDescription('');
    setSelectedTemplate('');
    setDuration('');
    setPrerequisites('');
    setIsCreating(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl sm:max-w-7xl md:max-w-7xl lg:max-w-7xl xl:max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Certificate Program
          </DialogTitle>
          <DialogDescription>
            Add a new certificate program to your subsidiary
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Subsidiary Selection */}
            <div className="space-y-2">
              <Label>Subsidiary *</Label>
              <Select value={selectedSubsidiary} onValueChange={setSelectedSubsidiary}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subsidiary" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubsidiaries.map(sub => (
                    <SelectItem key={sub.id} value={sub.id}>
                      <div className="flex items-center gap-2">
                        <img src={sub.logo} alt={sub.name} className="w-4 h-4 rounded" />
                        {sub.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSubsidiaryData && (
                <p className="text-sm text-gray-500">
                  Currently has {selectedSubsidiaryData.programs.length} active programs
                </p>
              )}
            </div>

            {/* Program Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Program Information
                </CardTitle>
                <CardDescription>Basic details about your certificate program</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="programName">Program Name *</Label>
                  <Input
                    id="programName"
                    value={programName}
                    onChange={(e) => setProgramName(e.target.value)}
                    placeholder="e.g., Advanced Molecular Biology Certificate"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="programDescription">Program Description *</Label>
                  <Textarea
                    id="programDescription"
                    value={programDescription}
                    onChange={(e) => setProgramDescription(e.target.value)}
                    placeholder="Describe what students will learn and achieve in this program..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (optional)</Label>
                  <Input
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g., 8 weeks, 3 months"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prerequisites">Prerequisites (optional)</Label>
                  <Input
                    id="prerequisites"
                    value={prerequisites}
                    onChange={(e) => setPrerequisites(e.target.value)}
                    placeholder="e.g., Basic biology knowledge"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Template Selection */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Certificate Template *
                </CardTitle>
                <CardDescription>Choose the appropriate template based on your program type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {certificateTemplates.map((template) => {
                    const IconComponent = template.icon;
                    return (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`w-full p-6 border rounded-lg text-left transition-all hover:shadow-md ${
                          selectedTemplate === template.id
                            ? 'border-indigo-500 bg-indigo-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Template Info */}
                          <div className="lg:w-1/2 space-y-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-lg ${
                                selectedTemplate === template.id ? 'bg-indigo-100' : 'bg-gray-100'
                              }`}>
                                <IconComponent className={`w-6 h-6 ${
                                  selectedTemplate === template.id ? 'text-indigo-600' : 'text-gray-600'
                                }`} />
                              </div>
                              <h4 className="font-semibold text-lg">{template.name}</h4>
                            </div>
                            
                            <p className="text-sm text-gray-600">{template.description}</p>
                            
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-700">Features:</p>
                              <div className="flex flex-wrap gap-1">
                                {template.features.map((feature, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-700">Best for:</p>
                              <div className="text-xs text-gray-500">
                                {template.useCases.join(', ')}
                              </div>
                            </div>
                          </div>
                          
                          {/* Template Preview */}
                          <div className="lg:w-1/2">
                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border">
                              <img 
                                src={template.preview} 
                                alt={template.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedTemplateData && (
                  <Alert className="mt-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Selected template: <strong>{selectedTemplateData.name}</strong> - {selectedTemplateData.description}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview Section */}
        {selectedSubsidiaryData && programName && selectedTemplateData && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Program Preview</CardTitle>
              <CardDescription>How this program will appear in your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(135deg, ${selectedSubsidiaryData.primaryColor}40, ${selectedSubsidiaryData.primaryColor}60)` 
                    }}
                  >
                    <Award className="w-6 h-6" style={{ color: selectedSubsidiaryData.primaryColor }} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{programName}</h3>
                    <p className="text-sm text-gray-600 mb-1">{programDescription}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>0 certificates</span>
                      <span>0 testimonials</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedTemplate}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t mt-6">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={createProgram}
            disabled={isCreating || !selectedSubsidiary || !programName.trim() || !programDescription.trim() || !selectedTemplate}
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creating Program...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Program
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
