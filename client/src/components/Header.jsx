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
  // const {userData} = useContext(AppContent)

  return (
    <>
      <FaPlus className="t1 text-[#8cff5e] text-[45rem] absolute rotate-[25deg] left-[-1%] top-[2%] z-[7]" />
      <MdOutlineHealthAndSafety className="t2 text-[#8cff5e] text-[40rem] absolute rotate-[-15deg] right-[5%] top-[3%] z-[7]"  />
      <div className="w-full h-screen flex flex-col justify-center items-center text-center gap-4 sm:gap-6 p-4 sm:p-6 lg:p-6">
        {/* <img src={assets.header_img} alt="" className='w-36 h-36 rounded-full mb-6' /> */}

        {/* <h1 className='flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2'>Hey {userData ? userData.name : 'Developer'}!
            <img className='w-8 aspect-square' src={assets.hand_wave} alt="" />
        </h1> */}
        <h1 className="text-[5rem] font-extrabold tracking-tight w-[55vw] z-[9] leading-[1.2] mb-2 text-zinc-800 mt-[10.5rem] font-[Alice]">
          Connecting Blood Donors with Patients in Urgent Need
        </h1>
        <h3 className="text-[1.5rem] w-[43vw] text-center text-gray-600 z-[9]">
          A trusted platform that instantly connects patients in urgent need of
          blood with nearby donors, making life-saving help faster and more
          accessible.
        </h3>

        <Link
          to="/login"
          className="px-3 py-3 border border-[#68F432] rounded-full bg-[#68F432] hover:bg-white transition-all mt-5"
        >
          Get Started
        </Link>

        <div className="">
          <h3 className="font-medium mt-14 text-lg">
            Trusted by patients, donors, and hospitals alike:
          </h3>
          <div className="mt-8 w-[50vw]">
            <Marquee
              pauseOnHover={true}
              speed={60}
              gradient={true}
              gradientWidth={100}
              autoFill={true}
            >
              <div className="flex items-center gap-12">
                <div className="w-20 h-20 flex items-center justify-center">
                  <img src={Blood_1} alt="Badge 1" className="object-contain" />
                </div>
                <div className="w-20 h-20 flex items-center justify-center">
                  <img src={Blood_2} alt="Badge 2" className="object-contain" />
                </div>
                <div className="w-20 h-20 flex items-center justify-center">
                  <img src={Blood_3} alt="Badge 3" className="object-contain" />
                </div>
                <div className="w-20 h-20 flex items-center justify-center">
                  <img src={Blood_4} alt="Badge 4" className="object-contain" />
                </div>
                <div className="w-20 h-20 flex items-center justify-center">
                  <img src={Blood_5} alt="Badge 5" className="object-contain" />
                </div>
                <div className="w-20 h-20 flex items-center justify-center mr-6">
                  <img src={Blood_6} alt="Badge 6" className="object-contain" />
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
