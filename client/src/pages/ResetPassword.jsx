import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import logo from "../assets/logo.png";

const ResetPassword = () => {

  const {backendUrl} = useContext(AppContent)

  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [otp, setOtp] = useState(0)
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false)

  const inputRefs = React.useRef([])
  
  const handleInput = (e, index) => {
    if(e.target.value.length > 0 && index < inputRefs.current.length - 1)
    {
      inputRefs.current[index + 1].focus();
    }
  }

  const handleKeyDown = (e, index) => {
    if(e.key === 'Backspace' && e.target.value === '' && index > 0)
    {
      inputRefs.current[index - 1].focus();
    }
  }

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text')
    const pasteArray = paste.split('');
    pasteArray.forEach((char, index) => {
      if(inputRefs.current[index])
      {
        inputRefs.current[index].value = char;
      }
    })
  }

  const onSubmitEmail = async (e) => {
    e.preventDefault();

    try
    {
      const {data} = await axios.post(backendUrl + '/api/auth/send-reset-otp', {email})
      data.success ? toast.success(data.message) : toast.error(data.message)
      data.success && setIsEmailSent(true)
    }
    catch(error)
    {
      toast.error(error.message)
    }
  }

  const onSubmitOTP = async (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map(e => e.value)
    setOtp(otpArray.join(''))
    setIsOtpSubmitted(true)
  }

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();

    try
    {
      const {data} = await axios.post(backendUrl + '/api/auth/reset-password', {email, otp, newPassword})
      data.success ? toast.success(data.message) : toast.error(data.message)
      data.success && navigate('/login')
    }
    catch(error)
    {
      toast.error(error.message)
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-[url("/bg_img.png")] bg-repeat bg-center'>
      <div
          className="flex gap-4 justify-center items-center absolute left-5 sm:left-20 top-5 sm:w-32 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="" className="w-16 h-16 object-contain" />
          <h1 className="text-3xl text-gray-800 font-bold">LifeLine</h1>
        </div>

      {/* enter email id */}

      {!isEmailSent && 

      <form onSubmit={onSubmitEmail} className='bg-white p-8 rounded-2xl shadow-2xl w-96 text-sm border border-green-100'>
        <h1 className='text-gray-800 text-2xl font-semibold text-center mb-4'>Reset Password</h1>
        <p className='text-center mb-6 text-gray-600'>Enter your registered email address</p>

        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-gray-50 border border-green-200 focus-within:border-[#68F432] focus-within:ring-2 focus-within:ring-green-100 transition-all duration-200'>
          <img src={assets.mail_icon} alt="" className='w-5 h-5' />
          <input type="email" placeholder='Email id' className='bg-transparent outline-none text-gray-800 placeholder-gray-500'
          value={email} onChange={e => setEmail(e.target.value)} required />
        </div>

        <button className='w-full py-2.5 bg-gradient-to-r from-[#68F432] to-green-500 text-white rounded-full mt-3 font-medium hover:from-green-500 hover:to-[#68F432] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'>Submit</button>
      </form>

      }

      {/* otp input form */}

      {!isOtpSubmitted && isEmailSent && 
      <form onSubmit={onSubmitOTP} className='bg-white p-8 rounded-2xl shadow-2xl w-96 text-sm border border-green-100'>
        <h1 className='text-gray-800 text-2xl font-semibold text-center mb-4'>Reset Password OTP</h1>
        <p className='text-center mb-6 text-gray-600'>Enter the 6-digit code sent to your email id.</p>
        <div className='flex justify-between mb-8' onPaste={handlePaste}>
          {Array(6).fill(0).map((_, index) => (
            <input type="text" maxLength='1' key={index} required className='w-12 h-12 bg-gray-50 border border-green-200 text-gray-800 text-center text-xl rounded-lg focus:border-[#68F432] focus:ring-2 focus:ring-green-100 transition-all duration-200'
            ref={e => inputRefs.current[index] = e}
            onInput={(e) => handleInput(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)} />
          ))}
        </div>
        <button className='w-full py-2.5 bg-gradient-to-r from-[#68F432] to-green-500 text-white rounded-full font-medium hover:from-green-500 hover:to-[#68F432] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'>Submit</button>
      </form>

      }

      {/* enter new password */}

      {isOtpSubmitted && isEmailSent && 

      <form onSubmit={onSubmitNewPassword} className='bg-white p-8 rounded-2xl shadow-2xl w-96 text-sm border border-green-100'>
        <h1 className='text-gray-800 text-2xl font-semibold text-center mb-4'>New Password</h1>
        <p className='text-center mb-6 text-gray-600'>Enter the new password below</p>

        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-gray-50 border border-green-200 focus-within:border-[#68F432] focus-within:ring-2 focus-within:ring-green-100 transition-all duration-200'>
          <img src={assets.lock_icon} alt="" className='w-5 h-5' />
          <input type="password" placeholder='Password' className='bg-transparent outline-none text-gray-800 placeholder-gray-500'
          value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
        </div>

        <button className='w-full py-2.5 bg-gradient-to-r from-[#68F432] to-green-500 text-white rounded-full mt-3 font-medium hover:from-green-500 hover:to-[#68F432] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'>Submit</button>
      </form>

      }

    </div>
  );
};

export default ResetPassword;