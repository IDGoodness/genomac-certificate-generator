import { useRef } from 'react';
import logo from '../../assets/gsclogo.png';
import sign2 from '../../assets/gscsignature.png';
import sign1 from '../../assets/sign1.png';
import glogo from '../../assets/genomac.png';
import award from '../../assets/ribbon3.png';
import ribbon from '../../assets/ribbon2.png';


interface CertificateTemplate6Props {
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

export default function CertificateTemplate6({
    header,
    courseTitle,
    description,
    date,
    recipientName = "Student Name",
    isPreview = false,
    // organizationName = "Genomac Services and Consult (GSC)",
    signatoryName1 = "Oluwaseyi Abraham Olawale",
    signatoryTitle1 = "Founder & CEO of Genomac Holdings.",
    signatoryName2 = "Stephen Akanbi",
    signatoryTitle2 = "Director, Genomac Services and Consult.",
    mode = "student"
}: CertificateTemplate6Props) {
    const ref = useRef<HTMLDivElement>(null);

    const scale = mode === "student" ? 0.3 : 1;
    const marginLeft = mode === "student" ? "0" : "430px";

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
          {/* Certificate Content - Premium Design */}
          <div className="relative w-[1000px] h-[600px] border border-purple-500 flex ">
            <div
              className="absolute inset-0 bg bg-center opacity-5"
              style={{ backgroundImage: `url(${logo})` }}
            ></div>

            <div className="flex flex-col mx-auto">
              <div className="flex text-center justify-between ">
                <p className="ml-10 mt-3 w-[100px] ">
                  <img src={glogo} alt="logo" className=" " />
                </p>
                <p className="mr-10 mt-3 w-[100px] ">
                  <img src={logo} alt="logo" className=" " />
                </p>
              </div>

              <div className="text-center mx-auto -mt-[70px]  ">
                <p className="uppercase font-semibold text-4xl  ">
                  {header || "certificate of participation"}
                </p>
                <p className="text-center italic text-black font-bold pt-2 ">
                  this is to certify that:
                </p>
              </div>

              <div className=" text-center mx-auto pt-10 pb-10 text-black w-[1000px] h-[200px] mt-20 bg-purple-800 ">
                <div className="bg-white w-[800px] -mt-[40px] h-[210px] mx-auto ">
                  <p className="text-3xl font-bold pt-10 border-b-2 border-purple-800 mx-24 font-serif ">
                    {" "}
                    {recipientName}{" "}
                  </p>
                  <p className="mx-auto pt-3 px-10 text-black capitalize text-lg font-semibold ">
                    {" "}
                    {description}
                    <span className="font-bold uppercase text-black">
                      {" "}
                      {courseTitle}{" "}
                    </span>
                    Organized by Genomac Services and Consults.
                  </p>
                  <p className="font-extrabold uppercase text-black"> {date}</p>
                </div>
              </div>

              <div className="flex justify-around mx-20 -mt-5 ">
                <div className=" ">
                  <p className="border-b-2 border-purple-800 w-[200px] ">
                    <img
                      src={sign1}
                      alt="signature"
                      className="w-[200px] h-[150px] -mb-10 "
                    />
                  </p>
                  <p className="text-base text-black font-semibold">{signatoryName1}</p>
                  <p className="text-xs font-medium text-black">{signatoryTitle1}</p>
                </div>

                <div className="w-[170px] mt-5 -ml-10 ">
                  <img src={award} alt="award" />
                </div>

                <div className=" ">
                  <p className="border-b-2 border-purple-800 w-52 ">
                    <img
                      src={sign2}
                      alt="signature"
                      className="w-[200px] h-[150px] -mb-12 "
                    />
                  </p>
                  <p className="text-base font-semibold">{signatoryName2}</p>
                  <p className="text-xs font-medium">{signatoryTitle2}</p>
                </div>
              </div>

              <div className="mx-auto -mt-10 ">
                <img
                  src={ribbon}
                  alt="ribbon"
                  className="w-[700px] h-[100px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}
