import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const DonorProfile = () => {
  const { backendUrl, userData } = useContext(AppContent)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    bloodGroup: '',
    phone: '',
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

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!userData || userData.role !== 'donor') {
      navigate('/')
      return
    }
    
    if (userData.isAccountVerified === false) {
      navigate('/email-verify')
      return
    }
    
    loadProfile()
  }, [userData])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${backendUrl}/api/donor/profile`)
      if (data.success && data.profile) {
        setFormData(prev => ({
          ...prev,
          ...data.profile,
          dateOfBirth: data.profile.dateOfBirth ? new Date(data.profile.dateOfBirth).toISOString().split('T')[0] : '',
          address: { ...prev.address, ...data.profile.address },
          emergencyContact: { ...prev.emergencyContact, ...data.profile.emergencyContact },
          medicalInfo: { ...prev.medicalInfo, ...data.profile.medicalInfo }
        }))
      }
    } catch (err) {
      console.error('Error loading profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required'
    if (!formData.phone) newErrors.phone = 'Phone number is required'
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
    if (!formData.gender) newErrors.gender = 'Gender is required'
    if (!formData.address.street) newErrors['address.street'] = 'Street address is required'
    if (!formData.address.city) newErrors['address.city'] = 'City is required'
    if (!formData.address.state) newErrors['address.state'] = 'State is required'
    if (!formData.address.zipCode) newErrors['address.zipCode'] = 'ZIP code is required'
    if (!formData.emergencyContact.name) newErrors['emergencyContact.name'] = 'Emergency contact name is required'
    if (!formData.emergencyContact.phone) newErrors['emergencyContact.phone'] = 'Emergency contact phone is required'
    if (!formData.emergencyContact.relationship) newErrors['emergencyContact.relationship'] = 'Emergency contact relationship is required'
    if (!formData.medicalInfo.weight) newErrors['medicalInfo.weight'] = 'Weight is required'
    if (!formData.medicalInfo.height) newErrors['medicalInfo.height'] = 'Height is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      const { data } = await axios.post(`${backendUrl}/api/donor/profile`, formData)
      if (data.success) {
        toast.success('Profile saved successfully!')
      } else {
        toast.error(data.message || 'Failed to save profile')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleContinue = () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields before continuing')
      return
    }
    navigate('/donor-dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Donor Profile</h1>
            <p className="text-gray-600">Please provide the following information to become a blood donor</p>
          </div>

          <form className="space-y-8">
            {/* Personal Information */}
            <div className="border-b pb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group *
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.bloodGroup ? 'border-red-500' : 'border-gray-300'}`}
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
                  {errors.bloodGroup && <p className="text-red-500 text-sm mt-1">{errors.bloodGroup}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.gender ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="border-b pb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Address Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['address.street'] ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="123 Main Street"
                  />
                  {errors['address.street'] && <p className="text-red-500 text-sm mt-1">{errors['address.street']}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => handleInputChange('address.city', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['address.city'] ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="New York"
                    />
                    {errors['address.city'] && <p className="text-red-500 text-sm mt-1">{errors['address.city']}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => handleInputChange('address.state', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['address.state'] ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="NY"
                    />
                    {errors['address.state'] && <p className="text-red-500 text-sm mt-1">{errors['address.state']}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={formData.address.zipCode}
                      onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['address.zipCode'] ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="10001"
                    />
                    {errors['address.zipCode'] && <p className="text-red-500 text-sm mt-1">{errors['address.zipCode']}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.address.country}
                    onChange={(e) => handleInputChange('address.country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact.name}
                    onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['emergencyContact.name'] ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="John Doe"
                  />
                  {errors['emergencyContact.name'] && <p className="text-red-500 text-sm mt-1">{errors['emergencyContact.name']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['emergencyContact.phone'] ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="+1 (555) 987-6543"
                  />
                  {errors['emergencyContact.phone'] && <p className="text-red-500 text-sm mt-1">{errors['emergencyContact.phone']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship *
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact.relationship}
                    onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['emergencyContact.relationship'] ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Spouse, Parent, Sibling, etc."
                  />
                  {errors['emergencyContact.relationship'] && <p className="text-red-500 text-sm mt-1">{errors['emergencyContact.relationship']}</p>}
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="border-b pb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Medical Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (lbs) *
                  </label>
                  <input
                    type="number"
                    value={formData.medicalInfo.weight}
                    onChange={(e) => handleInputChange('medicalInfo.weight', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['medicalInfo.weight'] ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="150"
                  />
                  {errors['medicalInfo.weight'] && <p className="text-red-500 text-sm mt-1">{errors['medicalInfo.weight']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (inches) *
                  </label>
                  <input
                    type="number"
                    value={formData.medicalInfo.height}
                    onChange={(e) => handleInputChange('medicalInfo.height', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['medicalInfo.height'] ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="70"
                  />
                  {errors['medicalInfo.height'] && <p className="text-red-500 text-sm mt-1">{errors['medicalInfo.height']}</p>}
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.medicalInfo.hasMedicalConditions}
                    onChange={(e) => handleInputChange('medicalInfo.hasMedicalConditions', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">I have medical conditions</span>
                </label>
              </div>

              {formData.medicalInfo.hasMedicalConditions && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical Conditions
                    </label>
                    <textarea
                      value={formData.medicalInfo.medicalConditions}
                      onChange={(e) => handleInputChange('medicalInfo.medicalConditions', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Please describe any medical conditions..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Medications
                    </label>
                    <textarea
                      value={formData.medicalInfo.medications}
                      onChange={(e) => handleInputChange('medicalInfo.medications', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Details'}
              </button>
              
              <button
                type="button"
                onClick={handleContinue}
                disabled={!userData?.isAccountVerified}
                className={`px-8 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                  userData?.isAccountVerified 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {userData?.isAccountVerified ? 'Continue to Dashboard' : 'Verify Email First'}
              </button>
            </div>

            {!userData?.isAccountVerified && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Please verify your email to continue to dashboard</p>
                <button
                  onClick={() => navigate('/email-verify')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Go to Email Verification
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default DonorProfile
