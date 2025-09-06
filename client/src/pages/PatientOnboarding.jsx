import React, { useContext, useEffect, useState } from 'react'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
// Intentionally do NOT include Navbar/logo per requirement

const PatientOnboarding = () => {
  const { backendUrl, userData, getUserData } = useContext(AppContent)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    bloodGroup: '',
    location: ''
  })

  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (userData) {
      setForm({
        name: userData.name || '',
        phone: userData.phone || '',
        bloodGroup: userData.bloodGroup || '',
        location: userData.location || ''
      })
      setChecking(false)
    }
  }, [userData])

  const isVerified = userData?.isAccountVerified
  const requiredMissing = !form.name || !form.phone || !form.bloodGroup

  const sendVerifyOtp = async () => {
    try {
      const { data } = await axios.post(backendUrl + '/api/auth/send-verify-otp')
      if (data.success) {
        toast.success(data.message)
        window.location.assign('/email-verify?back=patient-onboarding')
      } else {
        toast.error(data.message)
      }
    } catch (e) {
      toast.error(e.message)
    }
  }

  const saveProfile = async () => {
    try {
      const { data } = await axios.put(backendUrl + '/api/user/profile', form)
      if (data.success) {
        toast.success('Profile saved')
        await getUserData()
      } else {
        toast.error(data.message)
      }
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-2xl mx-auto px-4'>
        <div className='bg-white rounded-lg shadow-lg p-8'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>Complete Your Patient Profile</h1>
            <p className='text-gray-600'>Please provide the following information to request blood donations. Fields marked with * are required.</p>
          </div>

          <div className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Full Name *</label>
              <input 
                className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500' 
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })} 
                placeholder="Enter your full name"
              />
              {!form.name && <p className='text-xs text-red-600 mt-1'>Name is required</p>}
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Phone Number *</label>
              <input 
                className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500' 
                value={form.phone} 
                onChange={e => setForm({ ...form, phone: e.target.value })} 
                placeholder="+1 (555) 123-4567"
              />
              {!form.phone && <p className='text-xs text-red-600 mt-1'>Phone is required</p>}
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Blood Group *</label>
              <select 
                className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500' 
                value={form.bloodGroup} 
                onChange={e => setForm({ ...form, bloodGroup: e.target.value })}
              >
                <option value=''>Select Blood Group</option>
                {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              {!form.bloodGroup && <p className='text-xs text-red-600 mt-1'>Blood group is required</p>}
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Location</label>
              <input 
                className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500' 
                value={form.location} 
                onChange={e => setForm({ ...form, location: e.target.value })} 
                placeholder="City, State"
              />
            </div>
          </div>

          <div className='flex flex-col sm:flex-row gap-4 justify-center mt-8'>
            <button 
              className='px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500' 
              onClick={saveProfile}
            >
              Save Details
            </button>
            {!isVerified && (
              <button 
                className='px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500' 
                onClick={sendVerifyOtp}
              >
                Verify Email
              </button>
            )}
          </div>

          {isVerified && (
            <div className='mt-6 flex items-center justify-center gap-3'>
              <span className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 animate-pulse'>✓</span>
              <span className='text-green-700 font-medium'>Email verified successfully!</span>
            </div>
          )}

          <div className='mt-8 text-center'>
            <button
              disabled={requiredMissing || !isVerified}
              className={`px-8 py-3 rounded-lg text-white font-medium focus:outline-none focus:ring-2 ${
                requiredMissing || !isVerified 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              }`}
              onClick={() => window.location.assign('/patient-dashboard')}
            >
              {requiredMissing || !isVerified ? 'Complete Required Fields' : 'Continue to Dashboard'}
            </button>
            {(requiredMissing || !isVerified) && (
              <p className='text-sm text-gray-500 mt-3'>
                {requiredMissing ? 'Please fill all required fields. ' : ''}
                {!isVerified ? 'Please verify your email before continuing.' : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientOnboarding


