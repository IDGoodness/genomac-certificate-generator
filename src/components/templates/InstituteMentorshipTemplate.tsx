import { useRef } from "react";
import award from "../../assets/awardpurple.png";
import logo from "../../assets/genomacinstitutelogo.png";
import sign1 from "../../assets/sign1.png";
import sign2 from "../../assets/signInsti.png";
import angle1 from "../../assets/purpleangleleft.png";
import angle2 from "../../assets/purpleangleright.png";
import barcode from "../../assets/barcode.jpg";

interface InstituteMentorshipTemplateProps {
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
  // header,
  courseTitle,
  description,
  date,
  recipientName = "Student Name",
  isPreview = false,
  // organizationName = "Genomac Innovation Hub.",
  signatoryName1 = "Oluwaseyi Abraham Olawale",
  signatoryTitle1 = "Founder & CEO of Genomac Holdings.",
  signatoryName2 = "Oluwaseun Oyekunle Agboola",
  signatoryTitle2 = "Director, Genomac Institute Inc.",
  mode = "student",
}: InstituteMentorshipTemplateProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Set scale and marginLeft based on mode
  const scale = mode === "student" ? 0.3 : 1;
  const marginLeft = mode === "student" ? "-130px" : "-15px";

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
          <section className="border-2 border-pink-400 m-10 h-[600px] relative">
            <div
              style={{
                position: "absolute",
                top: -179,
                left: -398,
                pointerEvents: "none",
                zIndex: 0,
              }}
            >
              <img src={angle1} alt="" className="w-[900px] h-auto" />
            </div>
            <div
              style={{
                position: "absolute",
                top: 17,
                right: -384,
                pointerEvents: "none",
                zIndex: 0,
              }}
            >
              <img src={angle2} alt="" className="w-[900px] h-auto" />
            </div>

            {/* ...existing certificate content would go here (keeps z-index above decorations) */}

            <section>
              <div className="text-center mx-auto">
                <p className="uppercase text-black font-light mt-20 text-5xl">
                  certificate
                </p>
                <p className="uppercase text-2xl font-medium mt-4 bg-fuchsia-500 mx-[320px] p-2 text-white px-3">
                  of mentorship
                </p>
              </div>

              <div className="mx-[320px] absolute top-[57px] right-[-220px] ">
                <img src={logo} alt="" className="w-[100px] h-auto mx-auto" />
                <p className="text-center -mt-5 text-purple-900 text-xl ">
                  Genomac Institute Inc.
                </p>
                <p className="text-purple-950 text-[8px] text-center -mt-2 ">
                  ...discovering new things, improving life
                </p>
              </div>

              <div className="text-gray-800 uppercase mx-auto text-center mt-4 font-medium text-lg">
                THIS CERTIFICATE IS PROUDLY PRESENTED TO
              </div>
            </section>

            <section className="mt-10">
              <p className="text-3xl font-bold text-center text-fuchsia-500 border-b-2 border-fuchsia-500 mx-[200px] ">
                {recipientName}
              </p>

              <p className="text-gray-800 text-center mt-2 mx-[150px] font-bold ">
                {courseTitle}
              </p>

              <p className="text-gray-800 text-center mx-[150px] font-medium ">
                {description}
              </p>

              <p className="text-gray-800 text-center mt-1 mx-[150px] font-bold ">
                {date}
              </p>
            </section>

            {/* <div className="mx-auto absolute top-[77%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
              <img src={barcode} alt="" className="w-20" />
            </div> */}

            <div className="absolute w-[250px] h-auto -ml-10">
              <img src={award} alt="" />
            </div>

            <section>
              <div className="flex justify-between mx-[180px] ">
                <div className="mt-[7px]">
                  <p className="border-b-2 border-fuchsia-500 w-40">
                    <img
                      src={sign1}
                      alt="signature"
                      className="w-[200px] h-[150px] -mb-10"
                    />
                  </p>
                  <p className="text-xs font-semibold text-black">
                    {signatoryName1}
                  </p>
                  <p className="text-xs font-medium text-black">
                    {signatoryTitle1}
                  </p>
                </div>

                <div className="w-[80px] h-auto mt-[10px]  z-10">
                  <img src={barcode} alt="award" className="" />
                </div>

                <div className="mt[10px]">
                  <p className="border-b-2 border-fuchsia-500 w-40">
                    <img
                      src={sign2}
                      alt="signature"
                      className="w-[200px] h-[150px] -mb-12"
                    />
                  </p>
                  <p className="text-xs font-semibold text-black">
                    {signatoryName2}
                  </p>
                  <p className="text-xs font-medium text-black">
                    {signatoryTitle2}
                  </p>
                </div>
              </div>
            </section>
          </section>
        </div>
      </div>
    </div>
  );
}
