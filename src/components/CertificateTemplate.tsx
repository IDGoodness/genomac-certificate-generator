import React from 'react';
import {
  Award,
  Star, Shield, Check, Crown, Sparkles, Hexagon
} from 'lucide-react';
import type { Subsidiary, Program } from '../App';
import CertificateTemplate2 from './templates/CertificateTemplate2';

interface CertificateTemplateProps {
  subsidiary: Subsidiary;
  program: Program;
  studentName: string;
  certificateId: string;
  completionDate: string;
  template?: string;
  showWatermark?: boolean;
  preview?: boolean;
}

const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
  subsidiary,
  program,
  studentName,
  certificateId,
  completionDate,
  template = 'modern',
  showWatermark = true,
  preview = false
}) => {
  // Special case for Genomac template - use the dedicated Template2 component
  if (template === 'genomac') {
    return (
      <CertificateTemplate2
        header="Certificate of Completion"
        courseTitle={program.name}
        description={program.description}
        date={completionDate}
        recipientName={studentName}
        isPreview={preview}
        organizationName={subsidiary.name}
      />
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTemplateStyles = () => {
    switch (template) {
      case 'elegant':
        return {
          background: 'bg-gradient-to-br from-slate-50 to-gray-100',
          border: 'border-4 border-double',
          accent: subsidiary.primaryColor,
          decorative: true,
          seal: true
        };
      case 'academic':
        return {
          background: 'bg-white',
          border: 'border-8 border-solid',
          accent: '#1f2937',
          decorative: true,
          seal: true,
          formal: true
        };
      case 'corporate':
        return {
          background: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          border: 'border-2 border-solid',
          accent: subsidiary.primaryColor,
          clean: true,
          modern: true
        };
      case 'professional':
        return {
          background: 'bg-white',
          border: 'border-4 border-solid',
          accent: '#374151',
          minimalist: true,
          clean: true
        };
      case 'dynamic':
        return {
          background: 'bg-gradient-to-br from-orange-50 to-red-50',
          border: 'border-4 border-solid',
          accent: subsidiary.primaryColor,
          energetic: true,
          modern: true
        };
      case 'tech':
        return {
          background: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
          border: 'border-2 border-solid',
          accent: '#4f46e5',
          futuristic: true,
          tech: true
        };
      case 'nature':
        return {
          background: 'bg-gradient-to-br from-green-50 to-emerald-50',
          border: 'border-4 border-solid',
          accent: '#059669',
          organic: true,
          natural: true
        };
      case 'traditional':
        return {
          background: 'bg-gradient-to-br from-amber-50 to-yellow-50',
          border: 'border-8 border-double',
          accent: '#92400e',
          classic: true,
          ornate: true
        };
      case 'green':
        return {
          background: 'bg-gradient-to-br from-lime-50 to-green-50',
          border: 'border-4 border-solid',
          accent: subsidiary.primaryColor,
          eco: true,
          fresh: true
        };
      case 'laboratory':
        return {
          background: 'bg-gradient-to-br from-purple-50 to-violet-50',
          border: 'border-4 border-solid',
          accent: subsidiary.primaryColor,
          scientific: true,
          precise: true
        };
      case 'clinical':
        return {
          background: 'bg-gradient-to-br from-blue-50 to-cyan-50',
          border: 'border-4 border-solid',
          accent: '#0891b2',
          medical: true,
          sterile: true
        };
      case 'genomac':
        return {
          background: 'bg-white',
          border: 'border-[20px] border-purple-500',
          accent: '#8b5cf6',
          institutional: true,
          branded: true,
          watermark: true
        };
      default: // modern
        return {
          background: 'bg-gradient-to-br from-indigo-50 to-purple-50',
          border: 'border-4 border-solid',
          accent: subsidiary.primaryColor,
          modern: true,
          sleek: true
        };
    }
  };

  const styles = getTemplateStyles();

  const DecorativeCorners = () => (
    <>
      {/* Top corners */}
      <div className="absolute top-4 left-4 w-16 h-16 opacity-10">
        <div 
          className="w-full h-full border-t-4 border-l-4 rounded-tl-2xl"
          style={{ borderColor: styles.accent }}
        />
      </div>
      <div className="absolute top-4 right-4 w-16 h-16 opacity-10">
        <div 
          className="w-full h-full border-t-4 border-r-4 rounded-tr-2xl"
          style={{ borderColor: styles.accent }}
        />
      </div>
      
      {/* Bottom corners */}
      <div className="absolute bottom-4 left-4 w-16 h-16 opacity-10">
        <div 
          className="w-full h-full border-b-4 border-l-4 rounded-bl-2xl"
          style={{ borderColor: styles.accent }}
        />
      </div>
      <div className="absolute bottom-4 right-4 w-16 h-16 opacity-10">
        <div 
          className="w-full h-full border-b-4 border-r-4 rounded-br-2xl"
          style={{ borderColor: styles.accent }}
        />
      </div>
    </>
  );

  const CertificateSeal = () => {
    const SealIcon = styles.formal ? Shield : 
                    styles.tech ? Hexagon :
                    styles.energetic ? Star :
                    styles.classic ? Crown : Award;
    
    return (
      <div className="absolute bottom-8 right-8 flex flex-col items-center">
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-4"
          style={{ 
            backgroundColor: styles.accent + '15',
            borderColor: styles.accent 
          }}
        >
          <SealIcon 
            className="w-10 h-10"
            style={{ color: styles.accent }}
          />
        </div>
        <div className="mt-2 text-center">
          <div 
            className="text-xs font-semibold"
            style={{ color: styles.accent }}
          >
            CERTIFIED
          </div>
          <div className="text-xs text-gray-600 font-mono">
            {certificateId}
          </div>
        </div>
      </div>
    );
  };

  const WatermarkPattern = () => {
    if (!showWatermark) return null;
    
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="transform rotate-45 opacity-5">
          <div className="grid grid-cols-6 gap-8">
            {Array.from({ length: 24 }).map((_, i) => (
              <Award 
                key={i} 
                className="w-12 h-12 text-gray-400"
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const OrganizationHeader = () => (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-4 mb-4">
        <img 
          src={subsidiary.logo} 
          alt={subsidiary.name}
          className="h-16 w-auto"
        />
        <div 
          className="w-1 h-16 rounded-full opacity-30"
          style={{ backgroundColor: styles.accent }}
        />
        <div className="text-left">
          <h2 
            className="text-2xl font-bold"
            style={{ color: styles.accent }}
          >
            {subsidiary.shortName}
          </h2>
          <p className="text-gray-600 text-sm">{subsidiary.name}</p>
          <p className="text-gray-500 text-xs">Part of Genomac Holdings</p>
        </div>
      </div>
    </div>
  );

  const CertificateTitle = () => (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-2 mb-2">
        <div 
          className="w-8 h-0.5 rounded-full"
          style={{ backgroundColor: styles.accent }}
        />
        <Award 
          className="w-6 h-6"
          style={{ color: styles.accent }}
        />
        <div 
          className="w-8 h-0.5 rounded-full"
          style={{ backgroundColor: styles.accent }}
        />
      </div>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        Certificate of Completion
      </h1>
      <div 
        className="w-24 h-1 mx-auto rounded-full"
        style={{ backgroundColor: styles.accent }}
      />
    </div>
  );

  const StudentSection = () => (
    <div className="text-center mb-8">
      <p className="text-lg text-gray-600 mb-2">This certifies that</p>
      <h2 
        className="text-5xl font-bold mb-4"
        style={{ color: styles.accent }}
      >
        {studentName}
      </h2>
      <p className="text-lg text-gray-600 mb-2">has successfully completed the</p>
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        {program.name}
      </h3>
      {program.description && (
        <p className="text-gray-600 max-w-2xl mx-auto italic">
          {program.description}
        </p>
      )}
    </div>
  );

  const CompletionDetails = () => (
    <div className="flex justify-between items-end mt-12">
      <div className="text-left">
        <p className="text-gray-600 mb-1">Date of Completion</p>
        <p 
          className="text-xl font-bold"
          style={{ color: styles.accent }}
        >
          {formatDate(completionDate)}
        </p>
        {program.duration && (
          <p className="text-sm text-gray-500 mt-1">
            Duration: {program.duration}
          </p>
        )}
      </div>
      
      <div className="text-center px-8">
        <div 
          className="w-32 h-0.5 mb-2"
          style={{ backgroundColor: styles.accent }}
        />
        <p className="text-sm text-gray-600">Authorized Signature</p>
        <p className="text-xs text-gray-500 mt-1">Program Director</p>
      </div>
      
      <div className="text-right">
        <p className="text-gray-600 mb-1">Certificate ID</p>
        <p 
          className="text-lg font-mono font-bold"
          style={{ color: styles.accent }}
        >
          {certificateId}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Verify at genomac.com/verify
        </p>
      </div>
    </div>
  );

  const SpecialtyElements = () => {
    if (styles.tech) {
      return (
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <div className="grid grid-cols-4 gap-1 p-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <div 
                key={i}
                className="w-2 h-2 rounded-sm"
                style={{ backgroundColor: styles.accent }}
              />
            ))}
          </div>
        </div>
      );
    }
    
    if (styles.natural || styles.eco) {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-8 left-8 opacity-10">
            <Sparkles className="w-8 h-8" style={{ color: styles.accent }} />
          </div>
          <div className="absolute top-16 right-16 opacity-10">
            <Sparkles className="w-6 h-6" style={{ color: styles.accent }} />
          </div>
          <div className="absolute bottom-16 left-16 opacity-10">
            <Sparkles className="w-7 h-7" style={{ color: styles.accent }} />
          </div>
        </div>
      );
    }
    
    if (styles.classic || styles.ornate) {
      return (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-4 transform -translate-y-1/2 opacity-10">
            <Crown className="w-12 h-12" style={{ color: styles.accent }} />
          </div>
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2 opacity-10">
            <Crown className="w-12 h-12" style={{ color: styles.accent }} />
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={`
      relative w-full max-w-4xl mx-auto aspect-[1.414/1] p-8
      ${styles.background}
      ${styles.border}
      print:shadow-none print:border-black
      ${preview ? 'shadow-2xl' : 'shadow-lg'}
    `}
    style={{ borderColor: styles.accent }}
    >
      {/* Watermark */}
      <WatermarkPattern />
      
      {/* Decorative corners */}
      {styles.decorative && <DecorativeCorners />}
      
      {/* Specialty design elements */}
      <SpecialtyElements />
      
      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col">
        <OrganizationHeader />
        <CertificateTitle />
        
        <div className="flex-1 flex flex-col justify-center">
          <StudentSection />
        </div>
        
        <CompletionDetails />
      </div>
      
      {/* Certificate seal */}
      {styles.seal && <CertificateSeal />}
      
      {/* Quality assurance footer */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Check className="w-3 h-3" />
          <span>Verified Digital Certificate</span>
          <Check className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};

export default CertificateTemplate;
