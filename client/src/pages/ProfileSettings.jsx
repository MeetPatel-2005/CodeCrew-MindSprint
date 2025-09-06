import React, { useContext, useEffect, useState } from 'react'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { navigateToRoleDashboard } from '../utils/navigation'

const ProfileSettings = () => {
  const { backendUrl, userData, getUserData } = useContext(AppContent)
  const navigate = useNavigate()

  console.log('ProfileSettings component loaded', { userData })

  const [form, setForm] = useState({
    name: '',
    phone: '',
    bloodGroup: '',
    location: ''
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userData) {
      setForm({
        name: userData.name || '',
        phone: userData.phone || '',
        bloodGroup: userData.bloodGroup || '',
        location: userData.location || ''
      })
    }
  }, [userData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data } = await axios.put(backendUrl + '/api/user/profile', form)
      if (data.success) {
        toast.success('Profile updated successfully')
        await getUserData()
        
        // Navigate based on user role
        navigateToRoleDashboard(navigate, userData?.role)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const requiredMissing = !form.name || !form.phone || !form.bloodGroup

  return (
    <div className='min-h-screen bg-white'>
      <div className='container mx-auto px-4 py-10 max-w-2xl'>
        <div className='bg-white rounded-lg border-2 border-gray-200 shadow-sm'>
          <div className='p-6 border-b border-gray-200'>
            <h1 className='text-2xl font-semibold mb-2'>Profile Settings</h1>
            <p className='text-gray-600'>Update your personal information. Fields marked with * are required.</p>
          </div>

          <form onSubmit={handleSubmit} className='p-6 space-y-6'>
            <div>
              <label className='block text-sm font-medium mb-2'>Full Name *</label>
              <input 
                type='text'
                className='w-full border-2 border-gray-300 rounded-md px-3 py-2 focus:border-indigo-500 focus:outline-none' 
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })} 
                required
              />
              {!form.name && <p className='text-xs text-red-600 mt-1'>Name is required</p>}
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>Phone *</label>
              <input 
                type='tel'
                className='w-full border-2 border-gray-300 rounded-md px-3 py-2 focus:border-indigo-500 focus:outline-none' 
                value={form.phone} 
                onChange={e => setForm({ ...form, phone: e.target.value })} 
                required
              />
              {!form.phone && <p className='text-xs text-red-600 mt-1'>Phone is required</p>}
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>Blood Group *</label>
              <select 
                className='w-full border-2 border-gray-300 rounded-md px-3 py-2 focus:border-indigo-500 focus:outline-none' 
                value={form.bloodGroup} 
                onChange={e => setForm({ ...form, bloodGroup: e.target.value })}
                required
              >
                <option value=''>Select Blood Group</option>
                {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              {!form.bloodGroup && <p className='text-xs text-red-600 mt-1'>Blood group is required</p>}
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>Location</label>
              <input 
                type='text'
                className='w-full border-2 border-gray-300 rounded-md px-3 py-2 focus:border-indigo-500 focus:outline-none' 
                value={form.location} 
                onChange={e => setForm({ ...form, location: e.target.value })} 
                placeholder='City, State'
              />
            </div>

            <div className='flex gap-3 pt-4'>
              <button 
                type='submit' 
                disabled={requiredMissing || loading}
                className={`px-6 py-2 rounded-md text-white font-medium ${
                  requiredMissing || loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
              
              <button 
                type='button' 
                onClick={() => {
                  // Navigate back based on user role
                  navigateToRoleDashboard(navigate, userData?.role)
                }}
                className='px-6 py-2 border-2 border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
              >
                Cancel
              </button>
            </div>

            {requiredMissing && (
              <p className='text-sm text-red-600'>
                Please fill all required fields to update your profile.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfileSettings
