import CertificateTemplate1 from "./templates/CertificateTemplate1";
import CertificateTemplate2 from "./templates/CertificateTemplate2";
import CertificateTemplate3 from "./templates/CertificateTemplate3";
import CertificateTemplate4 from "./templates/CertificateTemplate4";
import CertificateTemplate5 from "./templates/CertificateTemplate5";
import CertificateTemplate6 from "./templates/CertificateTemplate6";
import CertificateTemplate7 from "./templates/CertificateTemplate7";
import CertificateTemplate8 from "./templates/CertificateTemplate8";
import CertificateTemplate9 from "./templates/CertificateTemplate9";
import CertificateTemplate10 from "./templates/CertificateTemplate10";
import InstituteMentorshipTemplate from "./templates/InstituteMentorshipTemplate";

interface CertificateRendererProps {
  templateId: string;
  header: string;
  courseTitle: string;
  description?: string;
  date: string;
  recipientName: string;
  isPreview?: boolean;
  mode?: "student" | "template-selection";
}

export default function CertificateRenderer({
  templateId,
  header,
  courseTitle,
  description,
  date,
  recipientName,
  isPreview = false,
  mode = "student",
}: CertificateRendererProps) {
  // console.log('🎨 CertificateRenderer: Using template ID:', templateId);

  const templateProps = {
    header,
    courseTitle,
    description,
    date,
    recipientName,
    isPreview,
    mode,
  };

  // Template system for all subsidiaries
  switch (templateId) {
    case "1":
      return <CertificateTemplate1 {...templateProps} />;
    case "2":
      return <CertificateTemplate2 {...templateProps} />;
    case "3":
      return <CertificateTemplate3 {...templateProps} />;
    case "4":
      return <CertificateTemplate4 {...templateProps} />;
    case "5":
      return <CertificateTemplate5 {...templateProps} />;
    case "6":
      return <CertificateTemplate6 {...templateProps} />;
    case "7":
      return <CertificateTemplate7 {...templateProps} />;
    case "8":
      return <CertificateTemplate8 {...templateProps} />;
    case "9":
      return <CertificateTemplate9 {...templateProps} />;
    case "10":
      return <CertificateTemplate10 {...templateProps} />;
    case "11":
      return <InstituteMentorshipTemplate {...templateProps} />;
    // Legacy fallbacks
    case "basic":
      return <CertificateTemplate1 {...templateProps} />;
    case "professional":
      return <CertificateTemplate3 {...templateProps} />;
    case "advanced":
      return <CertificateTemplate4 {...templateProps} />;
    case "genomac-research":
    case "genomac":
      return <CertificateTemplate2 {...templateProps} />;
    default:
      return <CertificateTemplate1 {...templateProps} />;
  }
}
