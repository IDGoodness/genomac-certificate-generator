import { useRef } from 'react';
import logo from '../../assets/ginsti.png';
import sign1 from '../../assets/sign1.png';
import sign2 from '../../assets/signInsti.png';
import award from '../../assets/award.png';
import award1 from '../../assets/purpleribbon.png';
import watermark from '../../assets/watermark.jpg';

interface CertificateTemplate2Props {
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

export default function CertificateTemplate2({
    header,
    courseTitle,
    description,
    date,
    recipientName = "Student Name",
    isPreview = false,
    organizationName = "Genomac Institute Inc.",
    signatoryName1 = "Oluwaseyi Abraham Olawale",
    signatoryTitle1 = "Founder & CEO of Genomac Holdings.",
    signatoryName2 = "Oluwaseun Oyekunle Agboola",
    signatoryTitle2 = "Director, Genomac Institute INC.",
    mode = "student"
}: CertificateTemplate2Props) {
    const ref = useRef<HTMLDivElement>(null);

    const scale = mode === "student" ? 0.3 : 1;
    const marginLeft = mode === "template-selection" ? "415px" : "0";

    const containerClass = isPreview 
        ? "w-full max-w-4xl mx-auto origin-center overflow-visible"
        : "min-w-[1000px] flex justify-center items-center min-h-screen";

    const certificateClass = isPreview
        ? "flex flex-col justify-center items-center -ml-[430px] w-[1000px] h-[600px] relative"
        : "flex flex-col justify-center items-center bg-white relative";

    return (
      <div
        className={containerClass}
        style={{
          transform: `scale(${scale})`,
          marginLeft,
          backgroundColor: "white",
        }}
      >
        <div
          ref={ref}
          className={certificateClass}
          style={{ backgroundColor: "white" }}
        >
          {/* Watermark */}
          <img
            src={watermark}
            alt="watermark"
            className="absolute w-[1000px] h-[600px] opacity-30 z-0 object-cover"
          />

            {/* Main Certificate Container */}
            <div className="relative w-[1000px] h-[600px] border-[20px] border-purple-500 overflow-hidden">
              <div className="flex flex-col h-full p-6 justify-between">
                {/* Header with Logo */}
                <div className="flex text-center mx-auto pl-[200px] ">
                  <p className="mr-2">
                    <img src={logo} alt="logo" className="w-[80px]" />
                  </p>
                  <p className="w-[1px] h-[50px] bg-purple-600 mt-4"></p>
                  <p className="mt-5 pr-16 font-bold text-black text-xs w-[200px]">
                    {organizationName}
                    <p className="-ml-2 text-black">| USA Incorporated</p>
                  </p>
                </div>

                {/* Certificate Title */}
                <div className="text-center ml-32">
                  <p className="uppercase font-semibold text-3xl text-black">
                    {header || "certificate of attendance"}
                  </p>
                  <p className="text-center italic text-black font-bold">
                    this certificate is awarded to:
                  </p>
                </div>

                {/* Student Info Section */}
                <div className="text-center pt-5 pb-10 w-[1000px] h-[200px] mt-5">
                  <p className="text-3xl text-purple-800 font-semibold border-b-2 mx-[200px] pb-2 mb-3 border-purple-800 border-dashed">
                    {recipientName}
                  </p>
                  <p className='text-black text-lg font-semibold'>
                    For successfully participating in the fully funded program on:
                  </p>
                  <p className="uppercase text-xl text-purple-800 font-bold">
                    {courseTitle}
                  </p>
                  {description && (
                    <p className="mx-28 text-lg font-semibold text-black">
                      {description}
                    </p>
                  )}
                  <p className="font-bold text-black">{date}</p>
                </div>

                {/* Signatures Section */}
                <div className="flex justify-between mx-32">
                  {/* First Signature */}
                  <div className="">
                    <p className="border-b-2 border-dashed border-purple-800 w-[200px]">
                      <img
                        src={sign1}
                        alt="signature"
                        className="w-[200px] h-[150px] -mb-10"
                      />
                    </p>
                    <p className="text-base font-semibold text-black">{signatoryName1}</p>
                    <p className="text-xs font-medium text-black">{signatoryTitle1}</p>
                  </div>

                  {/* Center Award */}
                  <div className="w-[400px] h-auto -mt-[30px] -ml-[400px] -mr-[320px] z-10">
                    <img src={award} alt="award" />
                  </div>

                  {/* Second Signature */}
                  <div className="mt-2">
                    <p className="border-b-2 border-dashed border-purple-800 w-52">
                      <img
                        src={sign2}
                        alt="signature"
                        className="w-[200px] h-[150px] -mb-12"
                      />
                    </p>
                    <p className="text-base font-semibold text-black">{signatoryName2}</p>
                    <p className="text-xs font-medium text-black">{signatoryTitle2}</p>
                  </div>
                </div>

                {/* Purple Ribbon Award */}
                <div className="w-[150px] absolute top-8 left-14">
                  <img src={award1} alt="award" />
                </div>
              </div>
            </div>
        </div>
      </div>
    );
}