import React, { useContext, useEffect } from 'react'
// import { assets } from '../assets/assets';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'
import logo from "../assets/logo.png";


const EmailVerify = () => {

  const {backendUrl, isLoggedIn, userData, getUserData} = useContext(AppContent)

  const navigate = useNavigate()

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

  const onSubmitHandler = async (e) => {
    try
    {
      e.preventDefault();
      const otpArray = inputRefs.current.map(e => e.value)
      const otp = otpArray.join('')
      const {data} = await axios.post(backendUrl + '/api/auth/verify-account', {otp})

      if(data.success)
      {
        toast.success(data.message)
        await getUserData()
        const params = new URLSearchParams(window.location.search)
        const back = params.get('back')
        
        if (back) {
          navigate(`/${back}`)
        } else {
          // Redirect based on user role and profile completion
          const updatedUserData = await getUserData()
          if(updatedUserData?.role === 'donor') {
            // Check if donor profile is completed
            try {
              const profile = await axios.get(backendUrl + '/api/donor/profile')
              if (profile.data?.success && profile.data?.profile?.profileCompleted) {
                navigate('/donor-dashboard')
              } else {
                navigate('/donor-profile')
              }
               } catch {
                 navigate('/donor-profile')
               }
          } else {
            // Check if patient profile is completed
            const needsOnboarding = !updatedUserData.phone || !updatedUserData.bloodGroup
            navigate(needsOnboarding ? '/patient-onboarding' : '/patient-dashboard')
          }
        }
      }
      else
      {
        toast.error(data.message)
      }
    }
    catch(error)
    {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (isLoggedIn && userData && userData.isAccountVerified) {
      // Redirect based on role and profile completion
      if (userData.role === 'donor') {
        // Check if profile is completed by making a request to dashboard
        // If it fails, redirect to profile completion
        navigate('/donor-dashboard')
      } else {
        navigate('/patient-dashboard')
      }
    }
  }, [isLoggedIn, userData, navigate])

  return (
    <div className='flex items-center justify-center min-h-screen bg-[url("/bg_img.png")] bg-repeat bg-center'>
     <div
          className="flex gap-4 justify-center items-center absolute left-5 sm:left-20 top-5 sm:w-32 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="" className="w-16 h-16 object-contain" />
          <h1 className="text-3xl text-gray-800 font-bold">LifeLine</h1>
        </div>
      <form onSubmit={onSubmitHandler} className='bg-white p-8 rounded-2xl shadow-2xl w-96 text-sm border border-green-100'>
        <h1 className='text-gray-800 text-2xl font-semibold text-center mb-4'>Email Verify OTP</h1>
        <p className='text-center mb-6 text-gray-600'>Enter the 6-digit code sent to your email id.</p>
        <div className='flex justify-between mb-8' onPaste={handlePaste}>
          {Array(6).fill(0).map((_, index) => (
            <input type="text" maxLength='1' key={index} required className='w-12 h-12 bg-gray-50 border border-green-200 text-gray-800 text-center text-xl rounded-lg focus:border-[#68F432] focus:ring-2 focus:ring-green-100 transition-all duration-200'
            ref={e => inputRefs.current[index] = e}
            onInput={(e) => handleInput(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)} />
          ))}
        </div>
        <button className='w-full py-3 bg-gradient-to-r from-[#68F432] to-green-500 text-white rounded-full font-medium hover:from-green-500 hover:to-[#68F432] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'>Verify email</button>
      </form>
    </div>
  );
};

export default EmailVerify;