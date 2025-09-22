import { useRef } from "react";
import award from "../../assets/award.png";
import logo from "../../assets/ginsti.png";
import gihub from "../../assets/gihub.png";
import sign1 from "../../assets/sign1.png";
import sign2 from "../../assets/sign2.png";
import barcode from "../../assets/barcode.jpg";
import watermark from "../../assets/watermark.jpg";
// import usa from "../../assets/usa.png";
// import nig from "../../assets/nig.png";


interface CertificateTemplate4Props {
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

export default function CertificateTemplate4({
    header,
    courseTitle,
    description,
    date,
    recipientName = "Student Name",
    isPreview = false,
    // organizationName = "Genomac Innovation Hub.",
    signatoryName1 = "Oluwaseyi Abraham Olawale",
    signatoryTitle1 = "Founder & CEO of Genomac Holdings.",
    signatoryName2 = "Abraham Oluwaseun Aderinto",
    signatoryTitle2 = "Director, Genomac Innovation Hub.",
    mode = "student",
}: CertificateTemplate4Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Set scale and marginLeft based on mode
    const scale = mode === "student" ? 0.3 : 1;
    const marginLeft = mode === "student" ? "0" : "440px";

  const containerClass = isPreview
    ? "w-full max-w-4xl mx-auto z-0 origin-center overflow-visible"
    : "min-w-[1000px] flex justify-center items-center";

  const certificateClass = isPreview
    ? "flex flex-col justify-center items-center bg-white relative w-[100px] shadow-lg"
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
        <div className="relative w-[1000px] h-[600px] flex ">
          <div className="bg-gradient-to-b from-pink-400 via-purple-900 to-purple-900 w-[200px] h-[600px] flex flex-col">
            <div className="flex absolute ">
              <div className="w-[70px] relative top-3 left-8 ">
                <img src={logo} alt="logo2" className="" />
              </div>
              <div className="w-[106px] relative -mt-[5px] ">
                <img src={gihub} alt="logo2" className="" />
              </div>
            </div>

            <div className="px-2 mt-24">
              <p className="text-white text-center text-[11px] font-medium">
                GENOMAC INNOVATION HUB
              </p>
              <p className="text-white text-center font-thin text-[7px]">
                ...discovering new things, improving life
              </p>
            </div>
          </div>

          <div className="w-[800px] h-[600px] relative bg-white">
            <img
              src={watermark}
              alt="genes"
              className="absolute w-[800px] h-[600px] opacity-15 z-0 object-cover"
            />
            <div className="w-[800px] h-[600px] p-6 relative z-10">
              <div className="p-4 bg-purple-900 text-white text-3xl text-center tracking-widest uppercase">
                {header || "Certificate of Participation"}
              </div>

              <div className="font-base text-center mt-8 italic text-black text-lg">
                This Certificate is Presented to:
              </div>

              <div
                id="name"
                className="capitalize border-b-4 border-purple-900 pb-2 text-center text-purple-900 mx-[100px] mt-16 text-3xl font-bold"
              >
                {recipientName}
              </div>

              <p className="capitalize py-8 text-center mx-[20px] font-semibold text-base leading-relaxed text-black">
                {description}
                <span className="font-bold uppercase text-black">
                  {" "}
                  {courseTitle}{" "}
                </span>
                organized by Genomac Innovation Hub.
              </p>

              <p className="font-bold mx-auto text-black text-center w-[300px] uppercase text-lg mt-4">
                {date}
              </p>

              <div className="flex justify-between items-end mt-16 relative">
                <div className="w-[60px]">
                  <img src={barcode} alt="barcode" className="w-full" />
                </div>

                {/* Award image positioned in center */}
                <div className="absolute left-1/2 top-[60%] transform -translate-x-1/2 -translate-y-1/2 z-20">
                  <img
                    src={award}
                    alt="award"
                    className="w-[400px] object-contain opacity-100"
                  />
                </div>

                <div className="flex-1 flex justify-between px-6">
                  <div className="text-center">
                    <div className="border-b-2 border-purple-800 w-[200px] -mt-5">
                      <img
                        src={sign1}
                        alt="signature"
                        className="w-[200px] h-[150px] object-contain mx-auto -mb-15"
                      />
                    </div>
                    <p className="font-bold text- text-black text-left mt-2">
                      {signatoryName1}
                    </p>
                    <p className="text-sm text-gray-700 font-medium">
                      {signatoryTitle1}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="border-b-2 border-purple-800 w-[200px] pb-3 ">
                      <img
                        src={sign2}
                        alt="signature"
                        className="w-[180px] h-[130px] object-contain mx-auto -mb-15"
                      />
                    </div>
                    <p className="font-bold text-base mt-2 text-black">{signatoryName2}</p>
                    <p className="text-sm text-gray-700 font-medium">
                      {signatoryTitle2}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}