import React, { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const ContactModal = ({ isOpen, onClose, donorId, donorName, donorBloodGroup, onStartChat }) => {
  const { backendUrl, userData } = React.useContext(AppContent)
  const [donorDetails, setDonorDetails] = useState(null)
  const [loading, setLoading] = useState(false)

  // Fetch donor details
  useEffect(() => {
    if (isOpen && donorId) {
      fetchDonorDetails()
    }
  }, [isOpen, donorId])

  const fetchDonorDetails = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${backendUrl}/api/patient/donors/${donorId}`)
      if (data.success) {
        setDonorDetails(data.donor)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to fetch donor details')
    } finally {
      setLoading(false)
    }
  }

  const handleStartChat = () => {
    if (onStartChat) {
      onStartChat(donorId, donorName, donorBloodGroup, donorDetails)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
              {donorName?.split(' ').map(n => n[0]).join('') || 'D'}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{donorName}</h2>
              <p className="text-gray-500">Blood Group: {donorBloodGroup}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Donor Details */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-lg font-semibold mb-4">Donor Information</h3>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : donorDetails ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900">{donorDetails.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Blood Group</label>
                <p className="text-gray-900">{donorDetails.bloodGroup}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">{donorDetails.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p className="text-gray-900">{donorDetails.location || 'Not provided'}</p>
              </div>
              {donorDetails.address && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900">
                    {donorDetails.address.street && `${donorDetails.address.street}, `}
                    {donorDetails.address.city && `${donorDetails.address.city}, `}
                    {donorDetails.address.state && `${donorDetails.address.state}`}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Total Donations</label>
                <p className="text-gray-900">{donorDetails.totalDonations || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Donation</label>
                <p className="text-gray-900">
                  {donorDetails.lastDonationAt ? 
                    new Date(donorDetails.lastDonationAt).toLocaleDateString() : 
                    'Never'
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Availability</label>
                <p className={`font-medium ${donorDetails.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {donorDetails.isAvailable ? 'Available' : 'Not Available'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">Failed to load donor details</div>
          )}
        </div>

        {/* Chat Button */}
        <div className="border-t p-6">
          <button
            onClick={handleStartChat}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
          >
            {/* Emergency Ring Animation */}
            <div className="absolute inset-0 bg-green-500 rounded-lg animate-ping opacity-30"></div>
            <div className="absolute inset-0 bg-green-400 rounded-lg animate-pulse opacity-20"></div>
            
            {/* Button Content */}
            <div className="relative flex items-center justify-center space-x-2 z-10">
              <div className="relative">
                <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {/* Emergency indicator */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <span className="font-bold">Start Emergency Chat</span>
            </div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 group-hover:animate-pulse"></div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContactModal

