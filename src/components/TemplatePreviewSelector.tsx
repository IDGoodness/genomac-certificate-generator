import CertificateTemplate1 from './templates/CertificateTemplate1';
import CertificateTemplate2 from './templates/CertificateTemplate2';
import CertificateTemplate3 from './templates/CertificateTemplate3';
import CertificateTemplate4 from './templates/CertificateTemplate4';
import CertificateTemplate5 from './templates/CertificateTemplate5';
import CertificateTemplate6 from './templates/CertificateTemplate6';
import CertificateTemplate7 from './templates/CertificateTemplate7';
import CertificateTemplate8 from './templates/CertificateTemplate8';
import CertificateTemplate9 from './templates/CertificateTemplate9';
import CertificateTemplate10 from './templates/CertificateTemplate10';
import InstituteMentorshipTemplate from './templates/InstituteMentorshipTemplate';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Check } from 'lucide-react';
import type { UserProfile, Subsidiary } from '../App';

interface TemplateComponentProps {
  header: string;
  courseTitle: string;
  description?: string;
  date: string;
  recipientName?: string;
  isPreview?: boolean;
}

interface TemplateOption {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<TemplateComponentProps>;
}

interface TemplatePreviewSelectorProps {
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  formData: {
    header: string;
    courseTitle: string;
    description: string;
    date: string;
  };
  user: UserProfile;
  currentSubsidiary: Subsidiary | null;
}

const allTemplates: TemplateOption[] = [
  {
    id: "1",
    name: "Genomac Institute Premium",
    description:
      "Genomac Institute premium template with institutional branding and signatures",
    component: CertificateTemplate1,
  },
  {
    id: "2",
    name: "Genomac Institute Professional",
    description:
      "Official Genomac Institute template with institutional branding and signatures",
    component: CertificateTemplate2,
  },
  {
    id: "11",
    name: "Genomac Institute Mentorship",
    description:
      "Official Genomac Institute template for mentorship programs with dual signatures.",
    component: InstituteMentorshipTemplate,
  },
  {
    id: "3",
    name: "G-iHub Professional",
    description:
      "G-iHub branded template with dual logo design and professional styling",
    component: CertificateTemplate3,
  },
  {
    id: "4",
    name: "G-iHub Premium",
    description: "G-iHub premium template with enhanced branding elements",
    component: CertificateTemplate4,
  },
  {
    id: "5",
    name: "GSC Premium",
    description:
      "Genomac Services and Consult Premium template with GSC branding",
    component: CertificateTemplate5,
  },
  {
    id: "6",
    name: "GSC Professional",
    description:
      "Genomac Services and Consult professional template with enhanced styling",
    component: CertificateTemplate6,
  },
  {
    id: "7",
    name: "GNATURES Premium",
    description:
      "GNATURES template with natural theme and green branding elements",
    component: CertificateTemplate7,
  },
  {
    id: "8",
    name: "GNATURES Professional",
    description:
      "G-NATURES professional template with enhanced natural design and styling",
    component: CertificateTemplate8,
  },
  {
    id: "9",
    name: "G-Labs Professional",
    description: "Genomac Labs professional template with laboratory branding",
    component: CertificateTemplate9,
  },
  {
    id: "10",
    name: "G-Labs Premium",
    description:
      "Genomac Labs premium template with enhanced laboratory design",
    component: CertificateTemplate10,
  },
];

// Access control function to filter templates based on user permissions
const getAccessibleTemplates = (user: UserProfile, currentSubsidiary: Subsidiary | null): TemplateOption[] => {
  // Holdings admin can see all templates
  if (user.role === 'holdings_admin') {
    return allTemplates;
  }
  
  // Get the subsidiary ID from currentSubsidiary or user.subsidiary
  const subsidiaryId = currentSubsidiary?.id || user.subsidiary?.id;
  
  // Filter templates based on subsidiary access
  switch (subsidiaryId) {
    case 'genomac_institute':
      // Institute gets templates 1 and 2 (Institute-specific)
      return allTemplates.filter(template => template.id === '1' || template.id === '2' || template.id === '11');
    case 'genomac_innovation_hub':
      // G-iHub gets templates 3 and 4 (G-iHub-specific)
      return allTemplates.filter(template => template.id === '3' || template.id === '4');
    case 'genomac_services_and_consult':
      // GSC gets templates 5 and 6 (GSC-specific)
      return allTemplates.filter(template => template.id === '5' || template.id === '6');
    case 'g_natures':
      // GNATURES gets templates 7 and 8 (GNATURES-specific)
      return allTemplates.filter(template => template.id === '7' || template.id === '8');
    case 'genomac_labs':
      // G-Labs gets templates 9 and 10 (G-Labs-specific)
      return allTemplates.filter(template => template.id === '9' || template.id === '10');
    default:
      // Default fallback for unknown subsidiaries - only generic template 1
      return allTemplates.filter(template => template.id === '1');
  }
};

export default function TemplatePreviewSelector({
  selectedTemplateId,
  onSelectTemplate,
  formData,
  user,
  currentSubsidiary,
}: TemplatePreviewSelectorProps) {
  const templates = getAccessibleTemplates(user, currentSubsidiary);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Choose Certificate Template</h3>
      
      <div className="space-y-6">
        {templates.map((template: TemplateOption) => {
          const TemplateComponent = template.component;
          const isSelected = selectedTemplateId === template.id;
          
          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all duration-200 w-[450px] hover:shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-indigo-500 border-indigo-200 bg-indigo-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onSelectTemplate(template.id)}
            >
              <CardContent className="p-6">
                <div className="space-y-4 w-[400px] ">
                  <div className="flex items-center justify-between ">
                    <div>
                      <h4 className="text-xl font-semibold">{template.name}</h4>
                      <p className="text-gray-600">{template.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {isSelected && (
                        <div className="flex items-center justify-center w-6 h-6 bg-indigo-500 rounded-full">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTemplate(template.id);
                        }}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                  </div>
                  {/* border border-gray-200 rounded-lg overflow-hidden bg-red-500 p-0 m-0 leading-none h-60 flex justify-center items-center */}
                  <div className="">
                    <div className="p-0 m-0 mx-auto flex justify-center items-center w-[200px] h-[200px]  ">
                      <TemplateComponent
                        header={formData.header || "Certificate of Completion"}
                        courseTitle={formData.courseTitle || "Sample Course"}
                        description={formData.description || "Sample description"}
                        date={formData.date || new Date().toISOString().split('T')[0]}
                        recipientName="John Doe"
                        isPreview={true}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
