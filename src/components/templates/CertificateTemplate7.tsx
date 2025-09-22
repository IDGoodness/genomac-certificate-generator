import { useRef } from 'react';
import gnatureslogo from "../../assets/gnaturesround.png";
import sign1 from '../../assets/sign1.png';
import sign2 from '../../assets/signNatures.png';
// import usa from "../../assets/usa.png";
// import nig from "../../assets/nig.png";
import barcode from '../../assets/barcode.jpg';
import award from "../../assets/award.png"
import watermark from '../../assets/watermark.jpg';



interface CertificateTemplate7Props {
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

export default function CertificateTemplate7({
    header,
    courseTitle,
    description,
    date,
    recipientName = "Student Name",
    isPreview = false,
    organizationName = "G-Natures.",
    signatoryName1 = "Oluwaseyi Abraham Olawale",
    signatoryTitle1 = "Founder & CEO of Genomac Holdings.",
    signatoryName2 = "Oluwaseyi Praise Ayomide",
    signatoryTitle2 = "Director, G-Natures.",
    mode = "student"
}: CertificateTemplate7Props) {
    const ref = useRef<HTMLDivElement>(null);

    const scale = mode === "student" ? 0.3 : 1;
    const marginLeft = mode === "template-selection" ? "440px" : "0";

    const containerClass = isPreview 
        ? "w-full mx-auto origin-center overflow-visible"
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
          <div className="relative w-[1000px] h-[600px] flex overflow-hidden z-10">
            <div className="bg-gradient-to-b from-green-500 via-green-700 to-green-900 w-[200px] h-[600px] flex flex-col">
              <div className="flex pt-4">
                <div className="mx-auto">
                  <img src={gnatureslogo} alt="logo2" className="w-20 " />
                </div>
              </div>
              <div className="px-2">
                <p className="text-white text-center text-[11px] font-medium">
                  {organizationName}
                </p>
                <p className="text-white text-center font-thin text-[7px]">
                  ...wellness through nature.
                </p>
              </div>
            </div>

            <div className="w-[800px] h-[600px] relative bg-white">
              <img
                src={watermark}
                alt="genes"
                className="absolute w-[800px] h-[600px] opacity-20 z-0 object-cover"
              />
              <div className="w-[800px] h-[600px] p-6 relative z-10">
                <div className="p-4 bg-green-900 text-white text-3xl text-center tracking-widest uppercase">
                  {header || "CERTIFICATE OF Participation"}
                </div>

                <div className="font-base text-black text-center mt-8 italic text-lg">
                  This Certificate is Presented to:
                </div>

                <div
                  id="name"
                  className="capitalize border-b-4 border-green-900 pb-2 text-center text-green-900 mx-[60px] mt-16 text-3xl font-bold"
                >
                  {recipientName}
                </div>

                <p className="capitalize py-12 text-center font-semibold text-base leading-relaxed text-black">
                  {description}
                  <span className="font-bold text-black uppercase">
                    {" "}
                    {courseTitle}
                  </span>
                  Organized by G-Natures.
                </p>

                <p className="font-bold text-black mx-auto text-center w-[300px] uppercase text-lg">
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
                      className="w-[300px] object-contain opacity-100"
                    />
                  </div>

                  <div className="flex-1 flex justify-between px-6">
                    <div className="text-center">
                      <div className="border-b-2 border-green-800 w-[200px] -mt-10">
                        <img
                          src={sign1}
                          alt="signature"
                          className="w-[200px] h-[150px] object-contain mx-auto -mb-15"
                        />
                      </div>
                      <p className="font-bold text-black text-base text-left mt-2">
                        {signatoryName1}
                      </p>
                      <p className="text-sm text-gray-700 font-medium">
                        {signatoryTitle1}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="border-b-2 border-green-800 w-[200px] pb-3 -mt-6 ">
                        <img
                          src={sign2}
                          alt="signature"
                          className="w-[200px] h-[150px] object-contain mx-auto -mb-20"
                        />
                      </div>
                      <p className="font-bold text-black text-base mt-2">
                        {signatoryName2}
                      </p>
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