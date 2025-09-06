import React, { useContext, useEffect, useState, useMemo } from 'react'
import { AppContent } from '../context/AppContext'
import DonorChatModal from '../components/DonorChatModal'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const DonorDashboard = () => {
  const { backendUrl, userData, getUserData, setIsLoggedIn, setUserData } = useContext(AppContent)
  const [isAvailable, setIsAvailable] = useState(true)
  const [nearbyRequests, setNearbyRequests] = useState([])
  const [donationHistory, setDonationHistory] = useState([])
  const [acceptedRequests, setAcceptedRequests] = useState([])

  const navigate = useNavigate()  
  const urgencyClass = useMemo(() => ({
    Critical: 'bg-red-600 text-white',
    High: 'bg-orange-500 text-white',
    Medium: 'bg-gray-200 text-gray-800',
    Low: 'bg-gray-100 text-gray-700'
  }), [])

  const [loading, setLoading] = useState(true)
  const [chatModal, setChatModal] = useState({ isOpen: false, patientId: null, patientName: '', patientBloodGroup: '' })
  const [acceptedRequestIds, setAcceptedRequestIds] = useState(new Set())
  const [recentlyAccepted, setRecentlyAccepted] = useState(new Set())

  const donorInfo = {
    name: userData?.name || "John Smith",
    bloodGroup: userData?.bloodGroup || "O+",
    lastDonation: "45 days ago",
    totalDonations: userData?.totalDonations || 12,
    phone: userData?.phone || "+1 (555) 123-4567"
  }

  useEffect(() => {
    if (userData) {
      fetchData()
    }
  }, [userData])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch real data from API
      const response = await axios.get(`${backendUrl}/api/donor/dashboard`)
      
      if (response.data.success) {
        const { donorInfo, isAvailable, nearbyRequests, donationHistory, acceptedRequests } = response.data.data
        setIsAvailable(isAvailable)
        setNearbyRequests(nearbyRequests || [])
        setDonationHistory(donationHistory || [])
        setAcceptedRequests(acceptedRequests || [])
      } else {
        console.log('Dashboard response:', response.data)
        // Don't show error toast for profile completion - just show empty state
        if (!response.data.message.includes('complete your profile')) {
          toast.error(response.data.message)
        }
        setNearbyRequests([])
        setDonationHistory([])
        setAcceptedRequests([])
      }
      
      // Fetch accepted requests for chat
      await fetchAcceptedRequests()

    } catch (err) {
      console.error('Error fetching data:', err)
      toast.error('Failed to load dashboard data')
      setNearbyRequests([])
      setDonationHistory([])
      setAcceptedRequests([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAcceptedRequests = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/donor/accepted-requests`)
      if (response.data.success) {
        setAcceptedRequests(response.data.acceptedRequests || [])
      }
    } catch (error) {
      console.error('Error fetching accepted requests:', error)
    }
  }

  const handleAvailabilityToggle = async () => {
    try {
      const newAvailability = !isAvailable
      // API call to update availability
      // await axios.put(backendUrl + '/api/donor/availability', { isAvailable: newAvailability })
      setIsAvailable(newAvailability)
      toast.success(`You are now ${newAvailability ? 'available' : 'unavailable'} for donations`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDecision = async (requestId, decision) => {
    try {
      if (decision === 'accept') {
        // API call to accept request
        const response = await axios.post(`${backendUrl}/api/donor/accept`, { requestId })
        
        if (response.data.success) {
          toast.success('Request accepted successfully!')
          
          // Add to accepted requests set
          setAcceptedRequestIds(prev => new Set([...prev, requestId]))
          
          // Add to recently accepted for animation
          setRecentlyAccepted(prev => new Set([...prev, requestId]))
          
          // Remove animation after 3 seconds
          setTimeout(() => {
            setRecentlyAccepted(prev => {
              const newSet = new Set(prev)
              newSet.delete(requestId)
              return newSet
            })
          }, 3000)
          
          // Refresh accepted requests
          await fetchAcceptedRequests()
          
          // Remove from nearby requests
          setNearbyRequests(prev => prev.filter(req => req.id !== requestId))
          
          // Refresh the entire dashboard to get updated data
          await fetchData()
        } else {
          toast.error(response.data.message)
        }
      } else if (decision === 'decline') {
        // API call to decline request
        const response = await axios.post(`${backendUrl}/api/donor/decline`, { requestId })
        
        if (response.data.success) {
          toast.success('Request declined')
          
          // Remove from nearby requests
          setNearbyRequests(prev => prev.filter(req => req.id !== requestId))
        } else {
          toast.error(response.data.message)
        }
      }
    } catch (err) {
      console.error('Error handling decision:', err)
      toast.error('Failed to process request')
    }
  }

  const handleProfileSettings = () => {
    navigate('/profile-settings')
  }

  const handleLogout = async () => {
    try {
      await axios.post(backendUrl + '/api/auth/logout')
      setIsLoggedIn(false)
      setUserData(false)
      navigate('/')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "Critical": return "bg-red-100 text-red-800"
      case "High": return "bg-orange-100 text-orange-800"
      case "Medium": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold">
                {donorInfo.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h1 className="text-2xl font-bold">Hi {donorInfo.name.split(' ')[0]}, thanks for being a donor! 🩸</h1>
                <p className="text-gray-500">Blood Group: {donorInfo.bloodGroup}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleProfileSettings} 
                className="flex items-center gap-2 border-2 border-gray-300 px-3 py-2 rounded-md text-sm hover:bg-gray-50 no-underline"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Profile Settings
              </button>
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 border-2 border-red-300 px-3 py-2 rounded-md text-sm hover:bg-red-50 text-red-600 no-underline"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Availability Toggle */}
              <div className="bg-white border-2 border-gray-300 rounded-xl">
                <div className="border-b px-6 py-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    Donation Availability
                  </h2>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {isAvailable ? "Available for donation" : "Not available"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {isAvailable ? "You'll receive notifications for blood requests" : "You won't receive any notifications"}
                      </p>
                    </div>
                    <button
                      onClick={handleAvailabilityToggle}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        isAvailable ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isAvailable ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Accepted Requests for Chat */}
              {acceptedRequests.length > 0 && (
                <div className="bg-white border-2 border-green-300 rounded-xl">
                  <div className="border-b px-6 py-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-green-700">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Accepted Requests - Chat Available
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {acceptedRequests.map((request) => (
                      <div key={request.requestId} className="border border-green-200 rounded-lg p-4 bg-green-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-green-800">{request.patientName}</h3>
                            <p className="text-sm text-green-600">Blood Group: {request.bloodGroup} | {request.unitsNeeded} {request.unitsNeeded === 1 ? 'unit' : 'units'} needed</p>
                            <p className="text-sm text-green-600">Hospital: {request.hospitalName}</p>
                            <p className="text-xs text-green-500">Accepted: {new Date(request.acceptedAt).toLocaleDateString()}</p>
                          </div>
                          <button
                            onClick={() => setChatModal({
                              isOpen: true,
                              patientId: request.patientId,
                              patientName: request.patientName,
                              patientBloodGroup: request.patientBloodGroup
                            })}
                            className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Chat
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nearby Requests */}
              <div className="bg-white border-2 border-gray-300 rounded-xl">
                <div className="border-b px-6 py-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Nearby Blood Requests
                  </h2>
                </div>
                <div className="px-6 py-4 space-y-4">
                  {nearbyRequests.length === 0 && (
                    <div className="text-sm text-gray-500">No nearby requests right now.</div>
                  )}
                  {nearbyRequests.map((request) => {
                    // Check if this request is already accepted by this donor
                    const isAccepted = acceptedRequests.some(acc => acc.requestId === request.id) || 
                                     acceptedRequestIds.has(request.id);
                    
                    return (
                      <div key={request.id} className={`border-2 rounded-lg p-4 space-y-3 transition-all duration-500 ${
                        recentlyAccepted.has(request.id) 
                          ? 'border-green-500 bg-green-50 shadow-lg scale-105' 
                          : 'border-gray-300'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                              <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium">{request.patientName}</p>
                              <p className="text-sm text-gray-500">{request.hospital}</p>
                              {request.additionalInfo && (
                                <p className="text-xs text-gray-400 mt-1">{request.additionalInfo}</p>
                              )}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                            {request.urgency}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Blood Type:</span>
                            <p className="font-medium">{request.bloodGroup}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Units Needed:</span>
                            <p className="font-medium">{request.unitsNeeded}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Distance:</span>
                            <p className="font-medium">{request.distance}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 flex items-center">
                            <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {request.timeAgo}
                          </p>
                          <div className="flex space-x-2">
                            {isAccepted ? (
                              <button 
                                onClick={() => setChatModal({
                                  isOpen: true,
                                  patientId: request.patientId,
                                  patientName: request.patientName,
                                  patientBloodGroup: request.bloodGroup
                                })}
                                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm relative overflow-hidden group"
                              >
                                {/* Animated background */}
                                <div className="absolute inset-0 bg-blue-500 rounded animate-ping opacity-20"></div>
                                <div className="absolute inset-0 bg-blue-400 rounded animate-pulse opacity-30"></div>
                                
                                {/* Button content */}
                                <div className="relative flex items-center gap-1">
                                  <svg className="h-4 w-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  <span className="font-medium">Contact</span>
                                </div>
                                
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 group-hover:animate-pulse"></div>
                              </button>
                            ) : (
                              <>
                                <button 
                                  onClick={() => handleDecision(request.id, 'decline')} 
                                  className="flex items-center gap-1 border-2 border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-50"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Decline
                                </button>
                                <button 
                                  onClick={() => handleDecision(request.id, 'accept')} 
                                  className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Accept
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Your Impact */}
              <div className="bg-white border-2 border-gray-300 rounded-xl">
                <div className="border-b px-6 py-4">
                  <h3 className="font-semibold">Your Impact</h3>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{donorInfo.totalDonations}</div>
                    <div className="text-sm text-gray-500">Total Donations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">36+</div>
                    <div className="text-sm text-gray-500">Lives Potentially Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-medium">{donorInfo.lastDonation}</div>
                    <div className="text-sm text-gray-500">Last Donation</div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white border-2 border-gray-300 rounded-xl">
                <div className="border-b px-6 py-4">
                  <h3 className="font-semibold">Contact Information</h3>
                </div>
                <div className="px-6 py-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{donorInfo.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{donorInfo.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span>Blood Group: {donorInfo.bloodGroup}</span>
                  </div>
                </div>
              </div>

              {/* Recent Donations */}
              <div className="bg-white border-2 border-gray-300 rounded-xl">
                <div className="border-b px-6 py-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Recent Donations
                  </h3>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-3">
                    {donationHistory.map((donation, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium">{donation.date}</p>
                          <p className="text-gray-500">{donation.hospital}</p>
                        </div>
                        <span className="px-2 py-1 rounded-md text-xs bg-green-100 text-green-800">
                          {donation.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Modal */}
      <DonorChatModal
        isOpen={chatModal.isOpen}
        onClose={() => setChatModal({ isOpen: false, patientId: null, patientName: '', patientBloodGroup: '' })}
        patientId={chatModal.patientId}
        patientName={chatModal.patientName}
        patientBloodGroup={chatModal.patientBloodGroup}
      />
    </div>
  )
}

export default DonorDashboard
