import React from 'react'
import { AppContent } from "../context/AppContext";
import { Link } from "react-router-dom";
import Marquee from "react-fast-marquee";
import Blood_1 from "../assets/blood-bag.png";
import Blood_2 from "../assets/blood-donation.png";
import Blood_3 from "../assets/blood.png";
import Blood_4 from "../assets/location.png";
import Blood_5 from "../assets/medicine.png";
import Blood_6 from "../assets/sign.png";
import { FaPlus } from "react-icons/fa";
import { MdOutlineHealthAndSafety } from "react-icons/md";
import '../index.css'

const Header = () => {
  return (
    <>
      {/* Background decorative elements */}
      <FaPlus className="t1 text-[#8cff5e] text-[25rem] sm:text-[35rem] lg:text-[45rem] absolute rotate-[25deg] left-[-5%] sm:left-[-2%] top-[5%] sm:top-[2%] z-[7] opacity-20" />
      <MdOutlineHealthAndSafety className="t2 text-[#8cff5e] text-[20rem] sm:text-[30rem] lg:text-[40rem] absolute rotate-[-15deg] right-[2%] sm:right-[5%] top-[8%] sm:top-[3%] z-[7] opacity-20" />
      
      <div className="w-full h-auto flex flex-col justify-center items-center text-center gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8 relative z-10">
        {/* Main heading with better responsive design */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5rem] font-extrabold tracking-tight w-full max-w-6xl z-[9] leading-[1.1] sm:leading-[1.2] mb-4 text-zinc-800 mt-20 sm:mt-24 lg:mt-[10.5rem] font-[Alice] px-4">
          Connecting Blood Donors with Patients in Urgent Need
        </h1>
        
        {/* Subtitle with better responsive design */}
        <h3 className="text-lg sm:text-xl md:text-2xl lg:text-[1.5rem] w-full max-w-4xl text-center text-gray-600 z-[9] leading-relaxed px-4">
          A trusted platform that instantly connects patients in urgent need of
          blood with nearby donors, making life-saving help faster and more
          accessible.
        </h3>

        {/* CTA Button with better styling */}
        <Link
          to="/login"
          className="px-8 py-4 border-2 border-[#68F432] rounded-full bg-[#68F432] hover:bg-white hover:text-[#68F432] text-white font-semibold text-lg transition-all duration-300 mt-6 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Get Started
        </Link>

        {/* Trusted Partners Section */}
        <div className="w-full max-w-6xl mt-16 sm:mt-20">
          <h3 className="font-semibold text-lg sm:text-xl text-gray-700 mb-8">
            Trusted by patients, donors, and hospitals alike:
          </h3>
          <div className="w-full overflow-hidden">
            <Marquee
              pauseOnHover={true}
              speed={50}
              gradient={true}
              gradientWidth={80}
              autoFill={true}
              className="py-4"
            >
              <div className="flex items-center gap-8 sm:gap-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-white rounded-full shadow-md p-2">
                  <img src={Blood_1} alt="Blood Donation" className="object-contain w-full h-full" />
                </div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-white rounded-full shadow-md p-2">
                  <img src={Blood_2} alt="Medical Care" className="object-contain w-full h-full" />
                </div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-white rounded-full shadow-md p-2">
                  <img src={Blood_3} alt="Health Services" className="object-contain w-full h-full" />
                </div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-white rounded-full shadow-md p-2">
                  <img src={Blood_4} alt="Location Services" className="object-contain w-full h-full" />
                </div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-white rounded-full shadow-md p-2">
                  <img src={Blood_5} alt="Medical Support" className="object-contain w-full h-full" />
                </div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-white rounded-full shadow-md p-2 mr-6">
                  <img src={Blood_6} alt="Healthcare" className="object-contain w-full h-full" />
                </div>
              </div>
            </Marquee>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
