import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  Eye, 
  Download, 
  Palette, 
  Award,
  Building2,
  Sparkles,
  Shield,
  Hexagon,
  Star,
  Crown,
  Leaf,
  Microscope,
  Heart,
  Zap
} from 'lucide-react';
import CertificateTemplate from './CertificateTemplate';
import type { Subsidiary } from '../App';
import { generateDemoCertificateId } from '../utils/certificateUtils';

interface CertificateTemplatePreviewProps {
  subsidiaries: Subsidiary[];
  onTemplateSelect?: (template: string) => void;
  selectedTemplate?: string;
  previewMode?: boolean;
}

interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  bestFor: string[];
  characteristics: string[];
  color: string;
}

const CertificateTemplatePreview: React.FC<CertificateTemplatePreviewProps> = ({
  subsidiaries,
  onTemplateSelect,
  selectedTemplate = 'modern',
  previewMode = false
}) => {
  const [currentSubsidiary, setCurrentSubsidiary] = useState(subsidiaries[0]);
  const [currentProgram, setCurrentProgram] = useState(subsidiaries[0]?.programs[0]);
  const [previewTemplate, setPreviewTemplate] = useState(selectedTemplate);

  const templates: TemplateInfo[] = [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Clean, contemporary design with gradient backgrounds and sleek typography',
      icon: Sparkles,
      bestFor: ['Technology programs', 'Innovation courses', 'Digital skills'],
      characteristics: ['Gradient backgrounds', 'Clean lines', 'Modern typography'],
      color: '#6366f1'
    },
    {
      id: 'elegant',
      name: 'Elegant',
      description: 'Sophisticated design with decorative borders and formal elements',
      icon: Award,
      bestFor: ['Executive programs', 'Leadership training', 'Premium courses'],
      characteristics: ['Double borders', 'Decorative corners', 'Formal typography'],
      color: '#8b5cf6'
    },
    {
      id: 'academic',
      name: 'Academic',
      description: 'Traditional university-style certificate with formal academic elements',
      icon: Shield,
      bestFor: ['Academic courses', 'Research programs', 'Scientific training'],
      characteristics: ['Classic borders', 'Formal seals', 'Academic typography'],
      color: '#1f2937'
    },
    {
      id: 'corporate',
      name: 'Corporate',
      description: 'Professional business design perfect for corporate training',
      icon: Building2,
      bestFor: ['Business training', 'Corporate programs', 'Professional development'],
      characteristics: ['Clean layout', 'Business colors', 'Professional feel'],
      color: '#0891b2'
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Minimalist design focusing on content clarity and professionalism',
      icon: Star,
      bestFor: ['Certification programs', 'Professional skills', 'Quality management'],
      characteristics: ['Minimalist design', 'Clear typography', 'Professional layout'],
      color: '#374151'
    },
    {
      id: 'dynamic',
      name: 'Dynamic',
      description: 'Energetic design with vibrant colors and modern elements',
      icon: Zap,
      bestFor: ['Innovation programs', 'Startup training', 'Creative courses'],
      characteristics: ['Vibrant colors', 'Dynamic elements', 'Energetic feel'],
      color: '#ea580c'
    },
    {
      id: 'tech',
      name: 'Tech',
      description: 'Futuristic design with tech-inspired elements and color schemes',
      icon: Hexagon,
      bestFor: ['Technology training', 'Digital courses', 'IT certifications'],
      characteristics: ['Tech elements', 'Futuristic design', 'Digital aesthetics'],
      color: '#4f46e5'
    },
    {
      id: 'nature',
      name: 'Nature',
      description: 'Organic design with natural colors and environmental themes',
      icon: Leaf,
      bestFor: ['Environmental courses', 'Sustainability training', 'Natural sciences'],
      characteristics: ['Natural colors', 'Organic elements', 'Earth tones'],
      color: '#059669'
    },
    {
      id: 'traditional',
      name: 'Traditional',
      description: 'Classic ornate design with traditional decorative elements',
      icon: Crown,
      bestFor: ['Traditional medicine', 'Cultural programs', 'Heritage courses'],
      characteristics: ['Ornate decorations', 'Classic design', 'Traditional colors'],
      color: '#92400e'
    },
    {
      id: 'green',
      name: 'Green',
      description: 'Fresh eco-friendly design with sustainable themes',
      icon: Leaf,
      bestFor: ['Sustainability programs', 'Green technology', 'Environmental studies'],
      characteristics: ['Eco colors', 'Fresh design', 'Sustainable themes'],
      color: '#84cc16'
    },
    {
      id: 'laboratory',
      name: 'Laboratory',
      description: 'Scientific design perfect for laboratory and research programs',
      icon: Microscope,
      bestFor: ['Laboratory training', 'Research programs', 'Scientific methods'],
      characteristics: ['Scientific elements', 'Precise design', 'Research focus'],
      color: '#7c3aed'
    },
    {
      id: 'clinical',
      name: 'Clinical',
      description: 'Medical design with healthcare themes and sterile aesthetics',
      icon: Heart,
      bestFor: ['Medical training', 'Healthcare programs', 'Clinical skills'],
      characteristics: ['Medical themes', 'Clean design', 'Healthcare colors'],
      color: '#0891b2'
    }
  ];

  const demoStudent = 'Alexandra Johnson';
  const demoCertificateId = generateDemoCertificateId();
  const demoDate = new Date().toISOString();

  const handleTemplateSelect = (templateId: string) => {
    setPreviewTemplate(templateId);
    onTemplateSelect?.(templateId);
  };

  const handleSubsidiaryChange = (subsidiaryId: string) => {
    const subsidiary = subsidiaries.find(s => s.id === subsidiaryId);
    if (subsidiary) {
      setCurrentSubsidiary(subsidiary);
      setCurrentProgram(subsidiary.programs[0]);
    }
  };

  const handleProgramChange = (programId: string) => {
    const program = currentSubsidiary.programs.find(p => p.id === programId);
    if (program) {
      setCurrentProgram(program);
    }
  };

  if (previewMode) {
    return (
      <div className="w-full">
        <CertificateTemplate
          subsidiary={currentSubsidiary}
          program={currentProgram}
          studentName={demoStudent}
          certificateId={demoCertificateId}
          completionDate={demoDate}
          template={previewTemplate}
          preview={true}
        />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        
        {/* Header Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Certificate Template Designer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Preview Subsidiary</label>
                <select 
                  value={currentSubsidiary.id}
                  onChange={(e) => handleSubsidiaryChange(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {subsidiaries.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Preview Program</label>
                <select 
                  value={currentProgram?.id || ''}
                  onChange={(e) => handleProgramChange(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {currentSubsidiary.programs.map(prog => (
                    <option key={prog.id} value={prog.id}>{prog.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gallery">Template Gallery</TabsTrigger>
            <TabsTrigger value="preview">Live Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="gallery" className="space-y-6">
            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => {
                const Icon = template.icon;
                const isSelected = previewTemplate === template.id;
                
                return (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: template.color + '20' }}
                          >
                            <Icon 
                              className="w-5 h-5"
                              style={{ color: template.color }}
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{template.name}</h3>
                            {isSelected && (
                              <Badge variant="default" className="text-xs">Selected</Badge>
                            )}
                          </div>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Preview this template</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <p className="text-gray-600 text-sm mb-4">
                        {template.description}
                      </p>

                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Best for:</h4>
                          <div className="flex flex-wrap gap-1">
                            {template.bestFor.map(item => (
                              <Badge key={item} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-2">Features:</h4>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {template.characteristics.map(char => (
                              <li key={char} className="flex items-center gap-2">
                                <div 
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: template.color }}
                                />
                                {char}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-6">
            {/* Selected Template Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const currentTemplate = templates.find(t => t.id === previewTemplate);
                      const Icon = currentTemplate?.icon || Award;
                      return (
                        <>
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: (currentTemplate?.color || '#6366f1') + '20' }}
                          >
                            <Icon 
                              className="w-6 h-6"
                              style={{ color: currentTemplate?.color || '#6366f1' }}
                            />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold">{currentTemplate?.name} Template</h2>
                            <p className="text-gray-600">{currentTemplate?.description}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="flex gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download certificate as PDF</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificate Preview */}
            <Card>
              <CardContent className="p-8">
                <div className="flex justify-center">
                  <div className="w-full max-w-4xl">
                    <CertificateTemplate
                      subsidiary={currentSubsidiary}
                      program={currentProgram}
                      studentName={demoStudent}
                      certificateId={demoCertificateId}
                      completionDate={demoDate}
                      template={previewTemplate}
                      preview={true}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Template Selection Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Different Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {templates.map(template => {
                    const Icon = template.icon;
                    const isSelected = previewTemplate === template.id;
                    
                    return (
                      <Tooltip key={template.id}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isSelected ? "default" : "outline"}
                            className="h-16 flex flex-col gap-1"
                            onClick={() => handleTemplateSelect(template.id)}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs">{template.name}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{template.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default CertificateTemplatePreview;