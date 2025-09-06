import React, { useContext } from "react";
// import { assets } from '../assets/assets'
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png"
import "../index.css";

const Navbar = ({ scrollToSection }) => {
  const navigate = useNavigate();

  const { userData, backendUrl, setUserData, setIsLoggedIn } =
    useContext(AppContent);

  const sendVerificationOtp = async () => {
    if (!userData || !userData.email) {
      toast.error("Please wait, loading your data...");
      return;
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-verify-otp`,
        {
          email: userData.email,
        }
      );

      data.success ? toast.success(data.message) : toast.error(data.message);
    // try {
    //   const { data } = await axios.post(`${backendUrl}/api/auth/send-verify-otp`);
    //   if (data.success) {
    //     toast.success(data.message);
    //     navigate('/email-verify');
    //   } else {
    //     toast.error(data.message);
    //   }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = async () => {
    try {
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      data.success && setIsLoggedIn(false);
      data.success && setUserData(false);
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <div className="w-full flex justify-center fixed top-0 z-50">
        <div className="w-[60vw] h-16 flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0 border border-2-black mt-7 rounded-full font-medium bg-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]">
          <div className="cursor-pointer flex justify-center items-center gap-3" onClick={() => scrollToSection("home")}>
            <img src={logo} alt="" className='w-[2.5rem] h-[2.5rem] object-cover' />
            <h1 className="text-3xl">LifeLine</h1>
    {/* <div className='w-full flex justify-between items-center p-2 sm:p-3 sm:px-24 sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200'>

        {!hideLogo && <img src={assets.logo} alt="" className='w-24 sm:w-28' />}

        {userData ? 
        <div className='w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group ml-auto'>
          {userData.name?.[0]?.toUpperCase() || 'U'}
          <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10'>
            <ul className='list-none m-0 p-2 bg-gray-100 text-sm shadow-lg border'>
              {!userData.isAccountVerified && <li>
                  <button onClick={sendVerificationOtp} className='py-1 px-2 hover:bg-gray-200 w-full text-left'>
                    Verify email
                  </button>
                </li>}
              
              <li>
                <button onClick={logout} className='py-1 px-2 hover:bg-gray-200 w-full text-left pr-10'>
                  Logout
                </button>
              </li>
            </ul> */}
          </div>

          <div className="Links flex gap-6 text-xl">
            <div className="overflow-hidden relative">
              <Link className="Link" onClick={() => scrollToSection("home")}>
                Home
              </Link>
            </div>
            <div className="overflow-hidden relative">
              <Link className="Link" onClick={() => scrollToSection("about")}>
                About
              </Link>
            </div>
            <div className="overflow-hidden relative">
              <Link className="Link" onClick={() => scrollToSection("testimonials")}>
                Testimonials
              </Link>
            </div>
            <div className="overflow-hidden relative">
              <Link className="Link" onClick={() => scrollToSection("contact")}>
                Contact
              </Link>
            </div>
          </div>

          {userData ? (
            <div className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group">
              {userData.name?.[0]?.toUpperCase() || "U"}
              <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10">
                <ul className="list-none m-0 p-2 bg-gray-100 text-sm">
                  {!userData.isAccountVerified && (
                    <li>
                      <button
                        onClick={sendVerificationOtp}
                        className="py-1 px-2 hover:bg-gray-200 w-full text-left"
                      >
                        Verify email
                      </button>
                    </li>
                  )}

                  <li>
                    <button
                      onClick={logout}
                      className="py-1 px-2 hover:bg-gray-200 w-full text-left pr-10"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {navigate("/login")}}
              className="flex items-center gap-2 border border-[#68F432] rounded-full px-6 py-2 text-gray-800 hover:bg-[#68F432] hover:text-white transition-all"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
