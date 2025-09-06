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
    location: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    medicalInfo: {
      weight: '',
      height: '',
      hasMedicalConditions: false,
      medicalConditions: '',
      medications: ''
    }
  })

  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (userData) {
      setForm({
        name: userData.name || '',
        phone: userData.phone || '',
        bloodGroup: userData.bloodGroup || '',
        location: userData.location || '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || '',
        address: {
          street: userData.address?.street || '',
          city: userData.address?.city || '',
          state: userData.address?.state || '',
          zipCode: userData.address?.zipCode || '',
          country: userData.address?.country || ''
        },
        emergencyContact: {
          name: userData.emergencyContact?.name || '',
          phone: userData.emergencyContact?.phone || '',
          relationship: userData.emergencyContact?.relationship || ''
        },
        medicalInfo: {
          weight: userData.medicalInfo?.weight || '',
          height: userData.medicalInfo?.height || '',
          hasMedicalConditions: userData.medicalInfo?.hasMedicalConditions || false,
          medicalConditions: userData.medicalInfo?.medicalConditions || '',
          medications: userData.medicalInfo?.medications || ''
        }
      })
      setChecking(false)
    }
  }, [userData])

  const isVerified = userData?.isAccountVerified
  const requiredMissing = !form.name || !form.phone || !form.bloodGroup || !form.dateOfBirth || !form.gender

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
      <div className='max-w-4xl mx-auto px-4'>
        <div className='bg-white rounded-lg shadow-lg p-8'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>Complete Your Patient Profile</h1>
            <p className='text-gray-600'>Please provide the following information to request blood donations. Fields marked with * are required.</p>
          </div>

          <form className="space-y-8">
            {/* Personal Information */}
            <div className="border-b pb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter your full name"
                  />
                  {!form.name && <p className="text-red-500 text-sm mt-1">Name is required</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="+1 (555) 123-4567"
                  />
                  {!form.phone && <p className="text-red-500 text-sm mt-1">Phone is required</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group *
                  </label>
                  <select
                    value={form.bloodGroup}
                    onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  {!form.bloodGroup && <p className="text-red-500 text-sm mt-1">Blood group is required</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  {!form.dateOfBirth && <p className="text-red-500 text-sm mt-1">Date of birth is required</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {!form.gender && <p className="text-red-500 text-sm mt-1">Gender is required</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="City, State"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="border-b pb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Address Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={form.address.street}
                    onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={form.address.city}
                      onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="New York"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={form.address.state}
                      onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="NY"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={form.address.zipCode}
                      onChange={(e) => setForm({ ...form, address: { ...form.address, zipCode: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="10001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={form.address.country}
                    onChange={(e) => setForm({ ...form, address: { ...form.address, country: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="border-b pb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Emergency Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={form.emergencyContact.name}
                    onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, name: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={form.emergencyContact.phone}
                    onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, phone: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="+1 (555) 987-6543"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={form.emergencyContact.relationship}
                    onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, relationship: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Spouse, Parent, Sibling, etc."
                  />
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="border-b pb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Medical Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (lbs)
                  </label>
                  <input
                    type="number"
                    value={form.medicalInfo.weight}
                    onChange={(e) => setForm({ ...form, medicalInfo: { ...form.medicalInfo, weight: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="150"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (inches)
                  </label>
                  <input
                    type="number"
                    value={form.medicalInfo.height}
                    onChange={(e) => setForm({ ...form, medicalInfo: { ...form.medicalInfo, height: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="70"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.medicalInfo.hasMedicalConditions}
                    onChange={(e) => setForm({ ...form, medicalInfo: { ...form.medicalInfo, hasMedicalConditions: e.target.checked } })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">I have medical conditions</span>
                </label>
              </div>

              {form.medicalInfo.hasMedicalConditions && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical Conditions
                    </label>
                    <textarea
                      value={form.medicalInfo.medicalConditions}
                      onChange={(e) => setForm({ ...form, medicalInfo: { ...form.medicalInfo, medicalConditions: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows="3"
                      placeholder="Please describe any medical conditions..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Medications
                    </label>
                    <textarea
                      value={form.medicalInfo.medications}
                      onChange={(e) => setForm({ ...form, medicalInfo: { ...form.medicalInfo, medications: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows="3"
                      placeholder="Please list any current medications..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={saveProfile}
                className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Save Details
              </button>
              
              {!isVerified && (
                <button
                  type="button"
                  onClick={sendVerifyOtp}
                  className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Verify Email
                </button>
              )}
              
              <button
                type="button"
                disabled={requiredMissing || !isVerified}
                className={`px-8 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                  requiredMissing || !isVerified 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                }`}
                onClick={() => window.location.assign('/patient-dashboard')}
              >
                {requiredMissing || !isVerified ? 'Complete Required Fields' : 'Continue to Dashboard'}
              </button>
            </div>

            {isVerified && (
              <div className="text-center">
                <div className="mt-6 flex items-center justify-center gap-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 animate-pulse">✓</span>
                  <span className="text-green-700 font-medium">Email verified successfully!</span>
                </div>
              </div>
            )}

            {(requiredMissing || !isVerified) && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  {requiredMissing ? 'Please fill all required fields. ' : ''}
                  {!isVerified ? 'Please verify your email before continuing.' : ''}
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default PatientOnboarding


