import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets';
import '../Login.css'; // We'll add autofill fix here
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify'
import axios from 'axios';
import logo from "../assets/logo.png"


const Login = () => {

  const navigate = useNavigate()


  const {backendUrl, setIsLoggedIn,setUserData, getUserData} = useContext(AppContent)

  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmitHandler = async (e) => {
    try
    {
      e.preventDefault();

      if(state === 'Sign Up')
      {
        const {data} = await axios.post(backendUrl + '/api/auth/register', {name, email, password})

        if(data.success)
        {
          setIsLoggedIn(true)
          await getUserData()
          navigate('/')
        }
        else
        {
          toast.error(data.message)
        }
      }
      else
      {
        const {data} = await axios.post(backendUrl + '/api/auth/login', {email, password})

        if(data.success)
        {
          setIsLoggedIn(true)
          await getUserData()
          navigate('/')
        }
        else
        {
          toast.error(data.message)
        }
      }
    }
    catch(error)
    {
      toast.error(error.message)
    }
  }

  return (

    <>   

    <div className='flex flex-col items-center justify-center min-h-screen px-6 sm:px-0 bg-[url("/bg_img.png")] bg-repeat bg-center'>
    <div className="flex gap-4 justify-center items-center absolute left-5 sm:left-20 top-5 sm:w-32 cursor-pointer" onClick={() => navigate('/')}>
      <img src={logo} alt="" className="w-16 h-16 object-contain" />
      <h1 className='text-3xl text-gray-800 font-bold'>LifeLine</h1>
    </div>
      <div className='bg-white p-10 rounded-2xl shadow-2xl w-full sm:w-96 text-gray-700 text-sm border border-green-100'>

        <h2 className='text-3xl font-semibold text-gray-800 text-center mb-3'>
          {state === 'Sign Up' ? 'Create Account' : 'Login'}
        </h2>

        <p className='text-center text-sm mb-6 text-gray-600'>
          {state === 'Sign Up' ? 'Create your Account' : 'Login to your account!'}
        </p>

        <form onSubmit={onSubmitHandler}>
          {state === 'Sign Up' && (
            <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-gray-50 border border-green-200 focus-within:border-[#68F432] focus-within:ring-2 focus-within:ring-green-100 transition-all duration-200'>
              <img src={assets.person_icon} alt="" className="w-5 h-5" />
              <input
                onChange={e => setName(e.target.value)}
                value={name}
                className='bg-transparent w-full outline-none focus:outline-none focus:ring-0 border-none text-gray-800 placeholder-gray-500'
                type="text"
                placeholder="Full Name"
                required
              />
            </div>
          )}

          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-gray-50 border border-green-200 focus-within:border-[#68F432] focus-within:ring-2 focus-within:ring-green-100 transition-all duration-200'>
            <img src={assets.mail_icon} alt="" className="w-5 h-5" />
            <input
              onChange={e => setEmail(e.target.value)}
              value={email}
              className='bg-transparent w-full outline-none focus:outline-none focus:ring-0 border-none text-gray-800 placeholder-gray-500'
              type="email"
              placeholder="Email id"
              required
            />
          </div>

          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-gray-50 border border-green-200 focus-within:border-[#68F432] focus-within:ring-2 focus-within:ring-green-100 transition-all duration-200'>
            <img src={assets.lock_icon} alt="" className="w-5 h-5" />
            <input
              onChange={e => setPassword(e.target.value)}
              value={password}
              className='bg-transparent w-full outline-none focus:outline-none focus:ring-0 border-none text-gray-800 placeholder-gray-500'
              type="password"
              placeholder="Password"
              required
            />
          </div>

          <p onClick={() => navigate('/reset-password')} className='mb-4 text-[#68F432] cursor-pointer hover:text-green-600 transition-colors duration-200'>Forget Password ?</p>

          <button type='submit' className='w-full py-2.5 rounded-full bg-gradient-to-r from-[#68F432] to-green-500 text-white font-medium hover:from-green-500 hover:to-[#68F432] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'>
            {state}
          </button>
        </form>

        {state === 'Sign Up' ? (
          <p className='text-gray-500 text-center text-xs mt-4'>
            Already have an account?{' '}
            <span
              onClick={() => setState('Login')}
              className='text-[#68F432] cursor-pointer underline hover:text-green-600 transition-colors duration-200'
            >
              Login here
            </span>
          </p>
        ) : (
          <p className='text-gray-500 text-center text-xs mt-4'>
            Don't have an account?{' '}
            <span
              onClick={() => setState('Sign Up')}
              className='text-[#68F432] cursor-pointer underline hover:text-green-600 transition-colors duration-200'
            >
              Sign up
            </span>
          </p>
        )}
      </div>
    </div>

    </>
  );
};

export default Login;
