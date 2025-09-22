import { forwardRef } from 'react';
import { Award, Star } from 'lucide-react';

interface CertificatePreviewProps {
  studentName: string;
  program: any;
  subsidiary: any;
}

const CertificatePreview = forwardRef<HTMLDivElement, CertificatePreviewProps>(
  ({ studentName, program, subsidiary }, ref) => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <div 
        ref={ref}
        className="w-full aspect-[4/3] bg-gradient-to-br from-white via-indigo-50 to-purple-50 relative overflow-hidden border-8 border-gradient-to-r from-indigo-200 to-purple-200 rounded-lg shadow-2xl"
        style={{
          background: `linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #f3e8ff 100%)`,
          border: `8px solid transparent`,
          backgroundClip: 'padding-box'
        }}
      >
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 grid-rows-8 h-full w-full">
            {Array.from({ length: 96 }).map((_, i) => (
              <div key={i} className="border border-indigo-200" />
            ))}
          </div>
        </div>

        {/* Decorative Corner Elements */}
        <div className="absolute top-4 left-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
            <Award className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="absolute top-4 right-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
            <Star className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="absolute bottom-4 left-4 flex space-x-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400" />
          ))}
        </div>

        <div className="absolute bottom-4 right-4 flex space-x-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400" />
          ))}
        </div>

        {/* Certificate Content */}
        <div className="flex flex-col items-center justify-center h-full px-12 py-8 text-center relative z-10">
          {/* Header */}
          <div className="mb-6">
            <img 
              src={subsidiary.logo} 
              alt={subsidiary.name}
              className="h-16 w-auto mx-auto mb-4 rounded-lg shadow-md"
            />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {subsidiary.name}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full" />
          </div>

          {/* Certificate Title */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
              Certificate of Completion
            </h2>
            <p className="text-lg text-gray-600">
              This certifies that
            </p>
          </div>

          {/* Student Name */}
          <div className="mb-8">
            <h3 className="text-5xl font-bold text-gray-800 mb-4 border-b-2 border-gradient-to-r from-indigo-300 to-purple-300 pb-2">
              {studentName}
            </h3>
            <p className="text-xl text-gray-600">
              has successfully completed the
            </p>
          </div>

          {/* Program Name */}
          <div className="mb-8">
            <h4 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              {program.name}
            </h4>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-end w-full mt-auto">
            <div className="text-left">
              <p className="text-sm text-gray-500 mb-1">Date of Completion</p>
              <p className="text-lg font-semibold text-gray-700">{currentDate}</p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-0.5 bg-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-600">Authorized Signature</p>
            </div>
            
            <div className="text-right">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-2">
                <Award className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs text-gray-500">Certificate ID</p>
              <p className="text-sm font-mono text-gray-600">
                {`${subsidiary.id.toUpperCase()}-${Date.now().toString().slice(-6)}`}
              </p>
            </div>
          </div>
        </div>

        {/* Border Frame */}
        <div className="absolute inset-2 border-4 border-gradient-to-r from-indigo-300 to-purple-300 rounded-md pointer-events-none" />
        <div className="absolute inset-4 border-2 border-gradient-to-r from-purple-200 to-indigo-200 rounded-sm pointer-events-none" />
      </div>
    );
  }
);

CertificatePreview.displayName = 'CertificatePreview';

export default CertificatePreview;