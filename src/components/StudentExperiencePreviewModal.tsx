import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { 
  Award,
  Download, 
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  // Upload,
  Camera,
  Video,
  Star,
  Heart,
  Eye,
  CheckCircle,
  Globe,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Trophy,
  Calendar,
  Shield,
  Users,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import type { Subsidiary, Program } from '../App';

interface StudentExperiencePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  subsidiaries: Subsidiary[];
  selectedSubsidiary?: Subsidiary | null;
  selectedProgram?: Program | null;
}

export default function StudentExperiencePreviewModal({ 
  isOpen, 
  onClose, 
  subsidiaries,
  selectedSubsidiary,
  selectedProgram 
}: StudentExperiencePreviewModalProps) {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'name-input' | 'testimonial' | 'certificate'>('welcome');
  const [studentName, setStudentName] = useState('');
  const [testimonialData, setTestimonialData] = useState({
    text: '',
    rating: 5,
    isPublic: true,
    hasPhoto: false,
    hasVideo: false
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewCertificateId] = useState('CERT-DEMO-2024-001');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Use default subsidiary and program if none selected
  const demoSubsidiary = selectedSubsidiary || subsidiaries[0];
  const demoProgram = selectedProgram || demoSubsidiary?.programs[0];

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('welcome');
      setStudentName('');
      setTestimonialData({
        text: '',
        rating: 5,
        isPublic: true,
        hasPhoto: false,
        hasVideo: false
      });
      setCompletedSteps([]);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep === 'welcome') {
      setCurrentStep('name-input');
      setCompletedSteps(['welcome']);
    } else if (currentStep === 'name-input') {
      if (!studentName.trim()) {
        toast.error('Please enter your name to continue');
        return;
      }
      setCurrentStep('testimonial');
      setCompletedSteps(prev => [...prev, 'name-input']);
    } else if (currentStep === 'testimonial') {
      handleGenerateCertificate();
    }
  };

  const handleGenerateCertificate = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      setIsGenerating(false);
      setCurrentStep('certificate');
      setCompletedSteps(prev => [...prev, 'testimonial']);
      toast.success('🎉 Certificate generated successfully!');
    }, 2000);
  };

  const handleSkipTestimonial = () => {
    if (!studentName.trim()) {
      toast.error('Please enter your name first');
      return;
    }
    handleGenerateCertificate();
  };

  const shareToSocialMedia = (platform: string) => {
    const demoUrl = `${window.location.origin}/certificate/${demoSubsidiary?.id}/${demoProgram?.id}/${previewCertificateId}`;
    // const text = `🎓 Proud to have completed the ${demoProgram?.name} at ${demoSubsidiary?.name}! #CertificateAchievement #GenomacHoldings`;
    
    toast.success(`This would open ${platform} sharing - Certificate URL: ${demoUrl}`);
  };

  const handleMediaUpload = (type: 'photo' | 'video') => {
    setTestimonialData(prev => ({
      ...prev,
      [type === 'photo' ? 'hasPhoto' : 'hasVideo']: true
    }));
    toast.success(`${type === 'photo' ? '📸' : '🎥'} ${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`);
  };

  const resetPreview = () => {
    setCurrentStep('welcome');
    setStudentName('');
    setTestimonialData({
      text: '',
      rating: 5,
      isPublic: true,
      hasPhoto: false,
      hasVideo: false
    });
    setCompletedSteps([]);
  };

  const handleClose = () => {
    resetPreview();
    onClose();
  };

  if (!demoSubsidiary || !demoProgram) {
    return null;
  }

  const steps = [
    { id: 'welcome', label: 'Welcome', icon: Trophy },
    { id: 'name-input', label: 'Your Name', icon: Users },
    { id: 'testimonial', label: 'Testimonial', icon: Heart },
    { id: 'certificate', label: 'Certificate', icon: Award }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${demoSubsidiary.primaryColor}20` }}>
              <Eye className="w-5 h-5" style={{ color: demoSubsidiary.primaryColor }} />
            </div>
            Student Experience Preview
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>Interactive preview of the student certificate journey</span>
            <Badge variant="outline" className="ml-2">
              <Globe className="w-3 h-3 mr-1" />
              {demoSubsidiary.shortName} • {demoProgram.name}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        {/* Main Preview Container */}
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-2 bg-gray-50">
          <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-lg min-h-[700px] shadow-inner">
            
            {/* Enhanced Progress Steps */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-6">
              <div className="flex items-center justify-between max-w-3xl mx-auto">
                {steps.map((step, index) => {
                  const isActive = currentStep === step.id;
                  const isCompleted = completedSteps.includes(step.id);
                  const StepIcon = step.icon;
                  
                  return (
                    <div key={step.id} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div 
                          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                            isActive 
                              ? 'border-indigo-600 bg-indigo-50 shadow-lg scale-110' 
                              : isCompleted
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : (
                            <StepIcon 
                              className={`w-5 h-5 ${
                                isActive ? 'text-indigo-600' : 'text-gray-400'
                              }`} 
                            />
                          )}
                        </div>
                        <span 
                          className={`text-sm font-medium mt-2 transition-colors ${
                            isActive ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div 
                          className={`w-16 h-px mx-4 transition-colors ${
                            completedSteps.includes(steps[index + 1].id) ? 'bg-green-300' : 'bg-gray-300'
                          }`} 
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-8">
              {/* Welcome Step */}
              {currentStep === 'welcome' && (
                <div className="max-w-4xl mx-auto text-center space-y-8">
                  <div className="flex items-center justify-center gap-6 mb-8">
                    <img 
                      src={demoSubsidiary.logo} 
                      alt={demoSubsidiary.name}
                      className="h-20 w-auto rounded-lg shadow-md"
                    />
                    <div className="text-left">
                      <h1 className="text-3xl font-bold text-gray-900">{demoSubsidiary.name}</h1>
                      <p className="text-lg text-gray-600 mt-1">{demoProgram.name}</p>
                      <Badge 
                        className="mt-2" 
                        style={{ 
                          backgroundColor: `${demoSubsidiary.primaryColor}20`, 
                          color: demoSubsidiary.primaryColor,
                          borderColor: `${demoSubsidiary.primaryColor}40`
                        }}
                      >
                        Certificate Program
                      </Badge>
                    </div>
                  </div>

                  <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                      <div className="flex items-center justify-center mb-4">
                        <div 
                          className="p-4 rounded-full" 
                          style={{ backgroundColor: `${demoSubsidiary.primaryColor}20` }}
                        >
                          <Trophy className="w-8 h-8" style={{ color: demoSubsidiary.primaryColor }} />
                        </div>
                      </div>
                      <CardTitle className="text-2xl">Welcome to Your Certificate Portal</CardTitle>
                      <CardDescription className="text-lg">
                        Congratulations on completing the {demoProgram.name}! 
                        Generate your personalized certificate in just a few simple steps.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <h3 className="font-semibold">Personalized</h3>
                          <p className="text-sm text-gray-600">Certificate with your name</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <h3 className="font-semibold">Verified</h3>
                          <p className="text-sm text-gray-600">Secure & authenticated</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <Share2 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                          <h3 className="font-semibold">Shareable</h3>
                          <p className="text-sm text-gray-600">Social media ready</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Name Input Step */}
              {currentStep === 'name-input' && (
                <div className="max-w-lg mx-auto">
                  <Card>
                    <CardHeader className="text-center">
                      <div className="flex items-center justify-center mb-4">
                        <div 
                          className="p-4 rounded-full animate-pulse" 
                          style={{ backgroundColor: `${demoSubsidiary.primaryColor}20` }}
                        >
                          <Users className="w-8 h-8" style={{ color: demoSubsidiary.primaryColor }} />
                        </div>
                      </div>
                      <CardTitle className="text-2xl">Enter Your Full Name</CardTitle>
                      <CardDescription>
                        This name will appear on your official certificate. 
                        Please ensure it matches your official records.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="student-name" className="text-base">Full Name *</Label>
                        <Input
                          id="student-name"
                          type="text"
                          placeholder="Enter your full name as you want it to appear"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          className="text-lg py-3 text-center border-2 focus:border-indigo-500"
                        />
                        <p className="text-sm text-gray-500 text-center">
                          Example: John Michael Smith
                        </p>
                      </div>
                      
                      {studentName && (
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Certificate Preview:</span>
                          </div>
                          <p className="text-green-600 mt-1 text-lg">
                            "This certifies that <strong>{studentName}</strong> has successfully completed..."
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Testimonial Step */}
              {currentStep === 'testimonial' && (
                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                      <div 
                        className="p-4 rounded-full" 
                        style={{ backgroundColor: `${demoSubsidiary.primaryColor}20` }}
                      >
                        <Heart className="w-8 h-8" style={{ color: demoSubsidiary.primaryColor }} />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Share Your Experience</h2>
                    <p className="text-gray-600">
                      Help future students by sharing your journey with the {demoProgram.name}
                    </p>
                  </div>

                  <Card>
                    <CardContent className="p-6 space-y-6">
                      {/* Rating Section */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Rate your overall experience *</Label>
                        <div className="flex items-center justify-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setTestimonialData(prev => ({ ...prev, rating: star }))}
                              className="p-2 rounded-full hover:bg-yellow-50 transition-colors"
                            >
                              <Star 
                                className={`w-8 h-8 transition-colors ${
                                  star <= testimonialData.rating 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300 hover:text-yellow-200'
                                }`} 
                              />
                            </button>
                          ))}
                        </div>
                        <p className="text-center text-gray-600">
                          {testimonialData.rating} out of 5 stars
                        </p>
                      </div>

                      <Separator />

                      {/* Written Testimonial */}
                      <div className="space-y-3">
                        <Label htmlFor="testimonial" className="text-base font-medium">
                          Share your experience *
                        </Label>
                        <Textarea
                          id="testimonial"
                          value={testimonialData.text}
                          onChange={(e) => setTestimonialData(prev => ({ ...prev, text: e.target.value }))}
                          placeholder="Tell us about your learning journey, key takeaways, and how this program has impacted your career or personal growth..."
                          rows={4}
                          className="resize-none"
                        />
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>{testimonialData.text.length} characters</span>
                          <span>Minimum 50 characters recommended</span>
                        </div>
                      </div>

                      {/* Media Upload */}
                      <div className="space-y-4">
                        <Label className="text-base font-medium">Add media to your testimonial (optional)</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Button 
                            variant="outline" 
                            onClick={() => handleMediaUpload('photo')}
                            className={`flex items-center gap-2 h-20 ${
                              testimonialData.hasPhoto ? 'border-green-500 bg-green-50' : ''
                            }`}
                          >
                            <Camera className={`w-6 h-6 ${testimonialData.hasPhoto ? 'text-green-600' : 'text-gray-400'}`} />
                            <div className="text-left">
                              <div className="font-medium">
                                {testimonialData.hasPhoto ? 'Photo Added ✓' : 'Add Photo'}
                              </div>
                              <div className="text-sm text-gray-500">JPG, PNG up to 5MB</div>
                            </div>
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            onClick={() => handleMediaUpload('video')}
                            className={`flex items-center gap-2 h-20 ${
                              testimonialData.hasVideo ? 'border-green-500 bg-green-50' : ''
                            }`}
                          >
                            <Video className={`w-6 h-6 ${testimonialData.hasVideo ? 'text-green-600' : 'text-gray-400'}`} />
                            <div className="text-left">
                              <div className="font-medium">
                                {testimonialData.hasVideo ? 'Video Added ✓' : 'Add Video'}
                              </div>
                              <div className="text-sm text-gray-500">MP4 up to 50MB</div>
                            </div>
                          </Button>
                        </div>
                      </div>

                      {/* Privacy Setting */}
                      <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                        <input
                          type="checkbox"
                          id="public-testimonial"
                          checked={testimonialData.isPublic}
                          onChange={(e) => setTestimonialData(prev => ({ ...prev, isPublic: e.target.checked }))}
                          className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <Label htmlFor="public-testimonial" className="font-medium">
                            Display publicly
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            Allow {demoSubsidiary.name} to showcase your testimonial on our website and marketing materials to inspire future students.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Certificate Step */}
              {currentStep === 'certificate' && studentName && (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div 
                        className="p-4 rounded-full animate-bounce" 
                        style={{ backgroundColor: `${demoSubsidiary.primaryColor}20` }}
                      >
                        <Sparkles className="w-8 h-8" style={{ color: demoSubsidiary.primaryColor }} />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">🎉 Congratulations!</h2>
                    <p className="text-lg text-gray-600">
                      Your certificate has been generated successfully
                    </p>
                  </div>

                  {/* Enhanced Certificate Preview */}
                  <Card className="max-w-5xl mx-auto">
                    <CardContent className="p-8">
                      <div className="w-full aspect-[4/3] bg-gradient-to-br from-white via-gray-50 to-indigo-50 relative overflow-hidden border-8 rounded-xl shadow-2xl"
                           style={{ borderImage: `linear-gradient(45deg, ${demoSubsidiary.primaryColor}, #6366f1) 1` }}>
                        
                        {/* Decorative Background Elements */}
                        <div className="absolute inset-0 opacity-5">
                          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-indigo-200"></div>
                          <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full bg-purple-200"></div>
                          <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-blue-200"></div>
                        </div>

                        <div className="relative flex flex-col items-center justify-center h-full px-12 py-8 text-center">
                          {/* Header */}
                          <div className="mb-8">
                            <img 
                              src={demoSubsidiary.logo} 
                              alt={demoSubsidiary.name}
                              className="h-20 w-auto mx-auto mb-4 rounded-lg shadow-md"
                            />
                            <h1 className="text-xl font-bold text-gray-800 mb-2">
                              {demoSubsidiary.name}
                            </h1>
                            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent mx-auto"></div>
                          </div>

                          {/* Certificate Title */}
                          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">
                            Certificate of Completion
                          </h2>
                          
                          <p className="text-lg text-gray-600 mb-4">This certifies that</p>

                          {/* Student Name - Enhanced */}
                          <div className="mb-6">
                            <h3 className="text-5xl font-bold text-gray-800 mb-2">
                              {studentName}
                            </h3>
                            <div className="w-64 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent mx-auto"></div>
                          </div>
                          
                          <p className="text-xl text-gray-600 mb-4">has successfully completed the</p>

                          {/* Program Name - Enhanced */}
                          <h4 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-8">
                            {demoProgram.name}
                          </h4>

                          {/* Footer - Enhanced */}
                          <div className="flex justify-between items-end w-full mt-auto">
                            <div className="text-left">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <p className="text-sm text-gray-500">Date Issued</p>
                              </div>
                              <p className="text-lg font-semibold text-gray-700">
                                {new Date().toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                            
                            <div className="text-center">
                              <div className="w-32 h-0.5 bg-gray-400 mb-2" />
                              <p className="text-sm font-medium text-gray-600">Authorized Signature</p>
                              <p className="text-xs text-gray-500 mt-1">Academic Director</p>
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center gap-2 mb-2 justify-end">
                                <Shield className="w-4 h-4 text-gray-500" />
                                <p className="text-sm text-gray-500">Certificate ID</p>
                              </div>
                              <p className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                {previewCertificateId}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons - Enhanced */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg" 
                      className="flex items-center gap-2 px-8 py-3"
                      style={{ backgroundColor: demoSubsidiary.primaryColor }}
                    >
                      <Download className="w-5 h-5" />
                      Download Certificate
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="flex items-center gap-2 px-8 py-3"
                    >
                      <Share2 className="w-5 h-5" />
                      Share Achievement
                    </Button>
                  </div>

                  {/* Enhanced Social Sharing */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center flex items-center justify-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Share Your Success
                      </CardTitle>
                      <CardDescription className="text-center">
                        Celebrate your achievement and inspire others in your network!
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Button
                          variant="outline"
                          onClick={() => shareToSocialMedia('facebook')}
                          className="flex flex-col items-center gap-3 h-20 bg-blue-50 hover:bg-blue-100 border-blue-200"
                        >
                          <Facebook className="w-6 h-6 text-blue-600" />
                          <span className="font-medium">Facebook</span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => shareToSocialMedia('twitter')}
                          className="flex flex-col items-center gap-3 h-20 bg-sky-50 hover:bg-sky-100 border-sky-200"
                        >
                          <Twitter className="w-6 h-6 text-sky-600" />
                          <span className="font-medium">Twitter</span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => shareToSocialMedia('linkedin')}
                          className="flex flex-col items-center gap-3 h-20 bg-blue-50 hover:bg-blue-100 border-blue-200"
                        >
                          <Linkedin className="w-6 h-6 text-blue-700" />
                          <span className="font-medium">LinkedIn</span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => shareToSocialMedia('whatsapp')}
                          className="flex flex-col items-center gap-3 h-20 bg-green-50 hover:bg-green-100 border-green-200"
                        >
                          <MessageCircle className="w-6 h-6 text-green-600" />
                          <span className="font-medium">WhatsApp</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              Interactive Student Experience Preview
            </div>
            {isGenerating && (
              <div className="flex items-center gap-2 text-sm text-indigo-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" />
                Generating certificate...
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            {currentStep !== 'welcome' && currentStep !== 'certificate' && (
              <Button 
                variant="outline" 
                onClick={() => {
                  if (currentStep === 'testimonial') setCurrentStep('name-input');
                  else if (currentStep === 'name-input') setCurrentStep('welcome');
                }}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            
            {currentStep === 'testimonial' && (
              <Button 
                variant="outline" 
                onClick={handleSkipTestimonial}
                disabled={isGenerating}
              >
                Skip Testimonial
              </Button>
            )}
            
            {currentStep !== 'certificate' && (
              <Button 
                onClick={handleNext}
                disabled={isGenerating || (currentStep === 'name-input' && !studentName.trim())}
                className="flex items-center gap-2"
              >
                {currentStep === 'testimonial' ? (
                  isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Certificate
                      <Award className="w-4 h-4" />
                    </>
                  )
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
            
            <Button variant="outline" onClick={resetPreview}>
              Reset Preview
            </Button>
            
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}