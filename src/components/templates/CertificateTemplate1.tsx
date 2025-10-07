import { useRef } from 'react';
import logo from '../../assets/ginsti.png';
import sign1 from '../../assets/sign1.png';
import sign2 from '../../assets/signInsti.png';
import usa from "../../assets/usa.png";
import nig from "../../assets/nig.png";
import barcode from '../../assets/barcode.jpg';
import award from "../../assets/award.png"
import watermark from '../../assets/watermark.jpg';



interface CertificateTemplate1Props {
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

export default function CertificateTemplate1({
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
}: CertificateTemplate1Props) {
    const ref = useRef<HTMLDivElement>(null);
    const scale = mode === "student" ? 0.3 : 1;
    const marginLeft = mode === "template-selection" ? "0" : "0";

    const containerClass = isPreview 
        ? "w-full mx-auto origin-center overflow-visible"
        : "min-w-[1000px] flex justify-center items-center";

    const certificateClass = isPreview
        ? "flex flex-col justify-center items-center bg-white relative w-[100px]shadow-lg"
        : "flex flex-col justify-center items-center bg-white relative";
    return (
        <div className={containerClass} style={{ transform: `scale(${scale})`, marginLeft, backgroundColor: "white" }} >
            <div ref={ref} className={certificateClass} style={{ backgroundColor: "white" }} >
                <div className="relative w-[1000px] h-[600px] flex overflow-hidden z-10">
                        <div className="bg-gradient-to-b from-pink-400 via-purple-900 to-purple-900 w-[200px] h-[600px] flex flex-col">
                            <div className="flex pt-4">
                                <div className="mx-auto">
                                    <img src={logo} alt="logo2" className="w-20" />
                                </div>
                            </div>
                            <div className="px-2 -mt-1">
                                <p className="text-white text-center text-[11px] font-medium">
                                    {organizationName}
                                </p>
                                <p className="text-white text-center font-thin text-[7px]">
                                    ...discovering new things, improving life
                                </p>
                            </div>

                            <div className="text-white text-[9px] m-2 p-3 bg-purple-950 rounded-lg text-left mt-40 flex-shrink-0">
                                <p className="leading-relaxed">
                                    This certificate is issued by Genomac Institute Inc. a
                                    registered research institution in the United States of
                                    America.
                                </p>
                                <p className="mt-2 font-semibold">Registration Number: 3844801</p>
                            </div>

                            <div className="text-[8px] m-2 p-3 bg-purple-950 rounded-lg text-left flex-shrink-0 mt-4">
                                <div className="bg-white w-fit px-3 py-2 mx-auto flex items-center font-medium text-purple-900 rounded mb-2">
                                    <img src={usa} alt="usa" className="w-5 mr-1" />
                                    USA Office
                                </div>
                                <p className="text-white leading-relaxed text-[7px]">
                                    16192 Coastal Highway, Lewes, Delaware 19958, County of Sussex
                                </p>
                            </div>

                            <div className="text-[8px] m-2 p-3 bg-purple-950 rounded-lg text-left flex-shrink-0 mt-4">
                                <div className="bg-white w-fit px-3 py-2 mx-auto flex items-center font-medium text-purple-900 rounded mb-2">
                                    <img src={nig} alt="nig" className="w-5 mr-1" />
                                    NIG Office
                                </div>
                                <p className="text-white leading-relaxed text-[7px]">
                                    Beside Alari Akata Filling Station, Under-G, Ogbomoso, Oyo State, Nigeria
                                </p>
                            </div>
                        </div>

                        <div className="w-[800px] h-[600px] relative bg-white">
                            <img src={watermark} alt="genes" className='absolute w-[800px] h-[600px] opacity-20 z-0 object-cover' />
                            <div className="w-[800px] h-[600px] p-6 relative z-10">
                                <div className="p-4 bg-purple-900 text-white text-3xl text-center tracking-widest uppercase">
                                    {header || "CERTIFICATE OF Participation"}
                                </div>

                                <div className="font-base text-center text-black mt-8 italic text-lg">
                                    This Certificate is Presented to:
                                </div>

                                <div
                                    id="name"
                                    className="capitalize border-b-4 border-purple-900 pb-2 text-center text-purple-900 mx-[60px] mt-16 text-3xl font-bold"
                                >
                                    {recipientName}
                                </div>

                                <p className="capitalize py-6 text-center text-black font-base text-sm leading-relaxed">
                                    {description}
                                    <span className="font-bold uppercase text-black"> {courseTitle} </span>
                                    Organized by Genomac Institute Inc.
                                </p>

                                <p className="font-bold mx-auto text-center text-black w-[300px] uppercase text-lg">
                                    {date}
                                </p>

                                <div className="flex justify-between items-end mt-10 relative">
                                    <div className="w-[60px]">
                                        <img src={barcode} alt="barcode" className="w-full" />
                                    </div>

                                    <div className="absolute left-1/2 top-[60%] transform -translate-x-1/2 -translate-y-1/2 z-20">
                                        <img src={award} alt="award" className="w-[300px] object-contain opacity-100" />
                                    </div>

                                    <div className="flex-1 flex justify-between px-6">
                                        <div className="text-center">
                                            <div className="border-b-2 border-purple-800 w-[200px] -mt-10">
                                                <img
                                                    src={sign1}
                                                    alt="signature"
                                                    className="w-[200px] h-[150px] object-contain mx-auto -mb-15"
                                                />
                                            </div>
                                            <p className="font-bold text-black text-base text-left mt-2">{signatoryName1}</p>
                                            <p className="text-sm text-gray-700 font-medium">{signatoryTitle1}</p>
                                        </div>

                                        <div className="text-right">
                                            <div className="border-b-2 border-purple-800 w-[200px] pb-3 -mt-6 ">
                                                <img
                                                    src={sign2}
                                                    alt="signature"
                                                    className="w-[200px] h-[150px] object-contain mx-auto -mb-20"
                                                />
                                            </div>
                                            <p className="font-bold text-base text-black mt-2">{signatoryName2}</p>
                                            <p className="text-sm text-gray-700 font-medium">{signatoryTitle2}</p>
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
