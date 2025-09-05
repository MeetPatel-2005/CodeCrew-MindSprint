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
    <div className='min-h-screen bg-white'>
      <div className='container mx-auto px-4 py-10 max-w-2xl'>
        <div className='bg-white rounded-lg border-2 border-gray-200 shadow-sm p-8'>
        <h1 className='text-2xl font-semibold mb-2'>Patient Details</h1>
        <p className='text-gray-600 mb-6'>Please complete your details. Fields marked with * are required.</p>

        <div className='space-y-4'>
          <div>
            <label className='block text-sm mb-1'>Full Name *</label>
            <input className='w-full border rounded-md px-3 py-2' value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            {!form.name && <p className='text-xs text-red-600 mt-1'>Name is required</p>}
          </div>
          <div>
            <label className='block text-sm mb-1'>Phone *</label>
            <input className='w-full border rounded-md px-3 py-2' value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            {!form.phone && <p className='text-xs text-red-600 mt-1'>Phone is required</p>}
          </div>
          {/* Hospital removed from onboarding per requirement */}
          <div>
            <label className='block text-sm mb-1'>Blood Group *</label>
            <select className='w-full border rounded-md px-3 py-2' value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
              <option value=''>Select</option>
              {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            {!form.bloodGroup && <p className='text-xs text-red-600 mt-1'>Blood group is required</p>}
          </div>
          <div>
            <label className='block text-sm mb-1'>Location</label>
            <input className='w-full border rounded-md px-3 py-2' value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          </div>
        </div>

        <div className='flex items-center gap-3 mt-6'>
          <button className='px-4 py-2 rounded-md bg-indigo-600 text-white' onClick={saveProfile}>Save Details</button>
          {!isVerified && (
            <button className='px-4 py-2 rounded-md border' onClick={sendVerifyOtp}>Verify Email</button>
          )}
        </div>

        {isVerified && (
          <div className='mt-6 flex items-center gap-3'>
            <span className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 animate-pulse'>✓</span>
            <span className='text-green-700'>Email verified</span>
          </div>
        )}

        <div className='mt-6'>
          <button
            disabled={requiredMissing || !isVerified}
            className={`px-5 py-2 rounded-md text-white ${requiredMissing || !isVerified ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
            onClick={() => window.location.assign('/patient-dashboard')}
          >
            Continue to Dashboard
          </button>
          {(requiredMissing || !isVerified) && (
            <p className='text-xs text-gray-500 mt-2'>
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


