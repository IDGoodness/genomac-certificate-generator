import { useRef } from 'react';
import logo from '../../assets/genomaclabs.png';
import sign1 from '../../assets/sign1.png';
import sign2 from '../../assets/glabsSign.png';
import award from '../../assets/award.png';
import award1 from '../../assets/ribbonDeco.png';
import watermark from '../../assets/watermark.jpg';


interface CertificateTemplate10Props {
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

export default function CertificateTemplate10({
    header,
    courseTitle,
    description,
    date,
    recipientName = "Student Name",
    isPreview = false,
    // organizationName = "Genomac Institute Inc.",
    signatoryName1 = "Oluwaseyi Abraham Olawale",
    signatoryTitle1 = "Founder & CEO of Genomac Holdings.",
    signatoryName2 = "Blessing Afolabi",
    signatoryTitle2 = "Director, Genomac Labs.",
    mode = "student"
}: CertificateTemplate10Props) {
    const ref = useRef<HTMLDivElement>(null);

    const scale = mode === "student" ? 0.3 : 1;
    const marginLeft = mode === "template-selection" ? "440px" : "0";

    const containerClass = isPreview 
        ? "w-full max-w-4xl mx-auto origin-center overflow-visible"
        : "min-w-[1000px] flex justify-center items-center";

    const certificateClass = isPreview
        ? "flex flex-col justify-center items-center -ml-[430px] w-[1000px] h-[600px] relative"
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
          {/* Watermark */}
          <img
            src={watermark}
            alt="watermark"
            className="absolute w-[1000px] h-[600px] opacity-5 z-0 object-cover"
          />

          {/* Main Certificate Container */}
          <div className="relative w-[1000px] h-[600px] border-[20px] m-10 border-purple-600 flex">
            <div className="flex flex-col mx-auto">
              <div className="flex text-center mx-auto mt-4 ">
                <p className=" ">
                  <img src={logo} alt="logo" className="w-[55px]" />
                </p>
              </div>

              <div className="text-center mx-auto">
                <p className="uppercase font-semibold text-black text-3xl">
                  {header || "certificate of participation"}
                </p>
                <p className="text-center italic text-black font-bold">
                  this is to certify that:
                </p>
              </div>

              <div className="text-center mx-auto pt-10 pb-10 w-[1000px] h-[200px] mt-5">
                <p className="text-4xl font-semibold text-purple-800 border-b-2 mx-[200px] mb-1 border-purple-800 ">
                  {recipientName}
                </p>
                <p className="mx-28 pt-5 text-xl font-semibold text-black">
                  {description}
                  <span className="font-bold text-black uppercase"> {courseTitle} </span>
                  organised by Genomac Labs.
                </p>
                <p className="font-bold text-black text-[20px] "> {date}</p>
              </div>

              <div className="flex justify-between mx-28">
                <div className="">
                  <p className="border-b-2 border-purple-800 w-[200px]">
                    <img
                      src={sign1}
                      alt="signature"
                      className="w-[200px] h-[150px] -mb-10"
                    />
                  </p>
                  <p className="text-lg font-semibold text-black">{signatoryName1}</p>
                  <p className="text-sm text-center text-black font-medium">
                    {signatoryTitle1}
                  </p>
                </div>

                <div className="w-[400px] h-auto -mt-[30px] -ml-[400px] -mr-[320px] z-10">
                  <img src={award} alt="award" />
                </div>

                <div className="mt-2">
                  <p className="border-b-2 border-purple-800 w-52">
                    <img
                      src={sign2}
                      alt="signature"
                      className="w-[200px] h-[150px] -mb-12"
                    />
                  </p>
                  <p className="text-lg text-center font-semibold text-black">
                    {signatoryName2}
                  </p>
                  <p className="text-sm text-center font-medium text-black">
                    {signatoryTitle2}
                  </p>
                </div>
              </div>

              <div className="w-[150px] absolute top-8 left-14">
                <img src={award1} alt="award" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}