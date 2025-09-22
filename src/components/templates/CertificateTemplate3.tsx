import { useRef } from "react";
import award from "../../assets/award-simple.png";
import logo from "../../assets/gihub-full.png";
import sign1 from "../../assets/sign1.png";
import sign2 from "../../assets/sign2.png";
import angle1 from "../../assets/angle1.jpg";
import angle2 from "../../assets/angle2.jpg";

interface CertificateTemplate3Props {
  header: string;
  courseTitle: string;
  description?: string;
  date: string;
  recipientName?: string;
  isPreview?: boolean;
  organizationName?: string;
  signatoryName1?: string;
  signatoryTitle1?: string;
  signatoryName2?: string;
  signatoryTitle2?: string;
  mode?: "student" | "template-selection";
}

export default function CertificateTemplate3({
  header,
  courseTitle,
  description,
  date,
  recipientName = "Student Name",
  isPreview = false,
  organizationName = "Genomac Innovation Hub.",
  signatoryName1 = "Oluwaseyi Abraham Olawale",
  signatoryTitle1 = "Founder & CEO of Genomac Holdings.",
  signatoryName2 = "Abraham Oluwaseun Aderinto",
  signatoryTitle2 = "Director, Genomac Innovation Hub.",
  mode = "student",
}: CertificateTemplate3Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Set scale and marginLeft based on mode
  const scale = mode === "student" ? 0.3 : 1;
  const marginLeft = mode === "student" ? "-140px" : "0";

  // Only apply preview-specific styles for tutor/admin preview
  const containerClass = isPreview
    ? "w-full max-w-4xl mx-auto origin-center overflow-visible"
    : "min-w-[1000px] flex justify-center items-center";

  const certificateClass = isPreview
    ? "flex flex-col justify-center items-center w-[1000px] h-[600px] relative"
    : "flex flex-col justify-center items-center bg-white relative";

  return (
    <div
      className={containerClass}
      style={{
        marginLeft,
        transform: `scale(${scale})`,
        backgroundColor: "white",
      }}
    >
      <div
        ref={ref}
        className={certificateClass}
        style={{ backgroundColor: "white" }}
      >
        <div className="relative w-[1000px] h-[600px] flex flex-col z-10 border border-gray-100 shadow-xl ">
          <div className="p-5 z-10">
            <img src={logo} alt="Logo" className="w-24" />
          </div>

          <div className="z-10">
            <p className="text-center text-5xl text-orange-500 uppercase -mt-5 italic font-semibold ">
              {header || "Certificate of Participation"}
            </p>

            <p className="text-center text-black text-3xl ">
              This certificate is presented to:
            </p>
          </div>

          <div className="text-center mt-28 mx-40 z-10">
            <p className="text-4xl font-bold border-b-2 text-orange-500 border-orange-500 pb-2 ">
              {recipientName}
            </p>
            <p className="text-xl text-black mt-3 ">
              {description}
              <span className="font-bold text-black uppercase">
                {" "}
                {courseTitle}{" "}
              </span>
              Organised by {organizationName}
            </p>
            <p className="text-xl font-bold text-black">{date}</p>
          </div>

          <div className="absolute top-0 right-0 z-0 opacity-80">
            <img src={angle2} alt="Angle 2" className="w-[600px] " />
          </div>
          <div className="absolute bottom-0 left-0 z-0 opacity-80">
            <img src={angle1} alt="Angle 1" className="w-[400px] " />
          </div>

          <section className="flex justify-between mx-12 mt-10 text-center z-10">
            <div className="mt-3">
              <p className="border-b-2 border-orange-500 ">
                <img
                  src={sign1}
                  alt="Signature 1"
                  className="w-40 ml-10 -mb-5"
                />
              </p>
              <p className="text-lg font-bold text-black">{signatoryName1} </p>
              <p className="text-sm text-black">{signatoryTitle1} </p>
            </div>
            <div className="mt-10">
              <img src={award} alt="Award" className="w-20" />
            </div>
            <div className="text-center mt-10 ">
              <p className="border-b-2 border-orange-500 pl-7 ">
                <img src={sign2} alt="Signature 2" className="w-32" />
              </p>
              <p className="text-lg font-bold text-black">{signatoryName2} </p>
              <p className="text-sm text-black">{signatoryTitle2} </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
