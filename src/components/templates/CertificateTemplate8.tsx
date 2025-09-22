import { useRef } from 'react';
import logo from '../../assets/gnaturesround.png';
import sign1 from '../../assets/sign1.png';
import sign2 from '../../assets/signNatures.png';
import award from '../../assets/award.png';
import watermark from '../../assets/watermark1.jpg';

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
    // organizationName = "Genomac Institute Inc.",
    signatoryName1 = "Oluwaseyi Abraham Olawale",
    signatoryTitle1 = "Founder & CEO of Genomac Holdings.",
    signatoryName2 = "Oluwaseyi Praise Ayomide",
    signatoryTitle2 = "Director, G-Natures.",
    mode = "student"
}: CertificateTemplate2Props) {
    const ref = useRef<HTMLDivElement>(null);

    const scale = mode === "student" ? 0.3 : 1;
    const marginLeft = mode === "template-selection" ? "440px" : "0";

    const containerClass = isPreview 
        ? "w-full mx-auto origin-center overflow-visible"
        : "min-w-[1000px] flex justify-center items-center";

    const certificateClass = isPreview
        ? "flex flex-col justify-center items-center -ml-[430px] w-[1000px] h-[600px] relative"
        : "flex flex-col justify-center items-center bg-white relative";

    return (
        <div className={containerClass} style={{ marginLeft, transform: `scale(${scale})`, backgroundColor: "white" }}>
            <div ref={ref} className={certificateClass} style={{ backgroundColor: "white" }} >
                {/* Watermark */}
                <img 
                    src={watermark} 
                    alt="watermark"
                    className='absolute w-[1000px] h-[600px] opacity-10 z-0 object-cover' 
                />
                
                {/* Main Certificate Container */}
                <div className="relative w-[1000px] h-[600px] border-[20px] m-10 border-green-500 flex">
                        <div className="flex flex-col mx-auto">
                            <div className="flex text-center mx-auto -my-8 ">
                                <p className="mt-10" >
                                    <img src={logo} alt="logo" className="w-[72px]" />
                                </p>
                            </div>

                            <div className="text-center mx-auto mt-7 text-black">
                                <p className="uppercase font-semibold text-3xl">
                                {header || "certificate of completion"}
                                </p>
                                <p className="text-center italic font-bold">
                                this certificate is presented to:
                                </p>
                            </div>

                            <div className="text-center mx-auto pt-5 pb-10 w-[1000px] h-[200px] mt-5">
                                <p className="text-3xl font-semibold border-b-2 mx-[200px] pb-2 mt-4 mb-1 border-green-800 text-green-800">
                                {recipientName}
                                </p>
                                <p className="mx-28 pt-3 text-lg font-semibold text-black">
                                    {description}
                                </p>
                                <p className='uppercase text-xl font-bold' >
                                    {courseTitle}
                                </p>
                                <p className='mx-28 text-lg' > organized by G-Natures.</p>
                                <p className="font-bold text-lg">{date}</p>
                            </div>

                            <div className="flex justify-between mx-32">
                                <div className="">
                                <p className="border-b-2 border-dashed border-purple-800 w-[200px]">
                                    <img
                                    src={sign1}
                                    alt="signature"
                                    className="w-[200px] h-[150px] -mb-10"
                                    />
                                </p>
                                <p className="text-base text-black font-semibold">
                                    {signatoryName1}
                                </p>
                                <p className="text-xs text-black font-medium">
                                    {signatoryTitle1}
                                </p>
                                </div>

                                <div className="w-[400px] h-auto -mt-[30px] -ml-[400px] -mr-[320px] z-10">
                                <img src={award} alt="award" />
                                </div>

                                <div className="-mt-3">
                                <p className="border-b-2 border-dashed border-purple-800 w-52">
                                    <img
                                    src={sign2}
                                    alt="signature"
                                    className="w-[150px] h-[200px] -mb-20"
                                    />
                                </p>
                                <p className="text-base text-black font-semibold">
                                    {signatoryName2}
                                </p>
                                <p className="text-xs text-center text-black font-medium">
                                    {signatoryTitle2}
                                </p>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
    );
}
