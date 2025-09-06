import React, { useContext, useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const DonorDashboard = () => {
  const { backendUrl, userData } = useContext(AppContent)
  const [loading, setLoading] = useState(true)
  const [isAvailable, setIsAvailable] = useState(true)
  const [donorInfo, setDonorInfo] = useState({ name: '', bloodGroup: '', lastDonation: '', totalDonations: 0, phone: '' })
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

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${backendUrl}/api/donor/dashboard`)
      if (!data.success) return toast.error(data.message || 'Failed to load dashboard')
      const { donorInfo, isAvailable, nearbyRequests, donationHistory, acceptedRequests } = data.data
      setDonorInfo(donorInfo)
      setIsAvailable(isAvailable)
      setNearbyRequests(nearbyRequests)
      setDonationHistory(donationHistory)
      setAcceptedRequests(acceptedRequests || [])
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleAvailability = async (checked) => {
    try {
      setIsAvailable(checked)
      const { data } = await axios.post(`${backendUrl}/api/donor/availability`, { isAvailable: checked })
      if (!data.success) {
        setIsAvailable(!checked)
        toast.error(data.message || 'Failed to update availability')
      }
    } catch (err) {
      setIsAvailable(!checked)
      toast.error(err.message)
    }
  }

  const handleDecision = async (requestId, action) => {
    try {
      const url = action === 'accept' ? 'accept' : 'decline'
      const { data } = await axios.post(`${backendUrl}/api/donor/${url}`, { requestId })
      if (!data.success) return toast.error(data.message || `Failed to ${action}`)
      
      if (action === 'accept') {
        toast.success(data.message || 'Request accepted! Your donation count has been updated.')
        // Update donor stats if provided
        if (data.newStats) {
          setDonorInfo(prev => ({
            ...prev,
            totalDonations: data.newStats.totalDonations,
            lastDonation: 'Just now'
          }))
        }
      } else {
        toast.success('Request declined')
      }
      
      // Remove the request from the list immediately
      setNearbyRequests(prev => prev.filter(req => req.id !== requestId))
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleProfileSettings = () => {
    navigate('/donor-profile')
  }

  const handleLogout = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/logout`)
      if (data.success) {
        toast.success('Logged out successfully')
        navigate('/')
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  return (
    <div className='min-h-screen bg-white'>
      <Navbar />
      <div className='max-w-6xl mx-auto px-4 py-6'>
        {loading ? (
          <div className='text-center py-20'>Loading...</div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2 space-y-6'>
              <div className='bg-white border rounded-xl'>
                <div className='border-b px-6 py-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold'>
                        {donorInfo.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h1 className='text-xl font-semibold'>Hi {donorInfo.name.split(' ')[0]}, thanks for being a donor! 🩸</h1>
                        <p className='text-sm text-gray-500'>Blood Group: {donorInfo.bloodGroup}</p>
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <button onClick={handleProfileSettings} className='border px-3 py-2 rounded-md text-sm hover:bg-gray-50'>Profile Settings</button>
                      <button onClick={handleLogout} className='border px-3 py-2 rounded-md text-sm hover:bg-gray-50 text-red-600 border-red-300 hover:bg-red-50'>Logout</button>
                    </div>
                  </div>
                </div>
                <div className='px-6 py-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>{isAvailable ? 'Available for donation' : 'Not available'}</p>
                      <p className='text-sm text-gray-500'>{isAvailable ? "You'll receive notifications for blood requests" : "You won't receive any notifications"}</p>
                    </div>
                    <label className='inline-flex items-center cursor-pointer'>
                      <input type='checkbox' className='sr-only peer' checked={isAvailable} onChange={(e) => toggleAvailability(e.target.checked)} />
                      <div className='w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[" "] after:w-5 after:h-5 after:bg-white after:rounded-full after:transition-all after:shadow peer-checked:bg-green-500'></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className='bg-white border rounded-xl'>
                <div className='border-b px-6 py-4'>
                  <h2 className='text-lg font-semibold'>Nearby Blood Requests</h2>
                </div>
                <div className='px-6 py-4 space-y-4'>
                  {nearbyRequests.length === 0 && (
                    <div className='text-sm text-gray-500'>No nearby requests right now.</div>
                  )}
                  {nearbyRequests.map((request) => (
                    <div key={request.id} className='border rounded-lg p-4 space-y-3'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold'>
                            B
                          </div>
                           <div>
                             <p className='font-medium'>{request.patientName}</p>
                             <p className='text-sm text-gray-500'>{request.hospital}</p>
                             {request.additionalInfo && (
                               <p className='text-xs text-gray-400 mt-1'>{request.additionalInfo}</p>
                             )}
                           </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${urgencyClass[request.urgency] || 'bg-gray-100 text-gray-700'}`}>{request.urgency}</span>
                      </div>
                      <div className='grid grid-cols-3 gap-4 text-sm'>
                        <div>
                          <span className='text-gray-500'>Blood Type:</span>
                          <p className='font-medium'>{request.bloodGroup}</p>
                        </div>
                        <div>
                          <span className='text-gray-500'>Units Needed:</span>
                          <p className='font-medium'>{request.unitsNeeded}</p>
                        </div>
                        <div>
                          <span className='text-gray-500'>Distance:</span>
                          <p className='font-medium'>{request.distance}</p>
                        </div>
                      </div>
                      <div className='flex items-center justify-between'>
                        <p className='text-xs text-gray-500'>{request.timeAgo}</p>
                        <div className='flex gap-2'>
                          <button onClick={() => handleDecision(request.id, 'decline')} className='border px-3 py-1 rounded text-sm'>Decline</button>
                          <button onClick={() => handleDecision(request.id, 'accept')} className='bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm'>Accept</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className='space-y-6'>
              <div className='bg-white border rounded-xl'>
                <div className='border-b px-6 py-4'>
                  <h3 className='font-semibold'>Your Impact</h3>
                </div>
                <div className='px-6 py-4 grid grid-cols-3 gap-4 text-center'>
                  <div>
                    <div className='text-3xl font-bold text-red-600'>{donorInfo.totalDonations}</div>
                    <div className='text-sm text-gray-500'>Total Donations</div>
                  </div>
                  <div>
                    <div className='text-3xl font-bold text-green-600'>36+</div>
                    <div className='text-sm text-gray-500'>Lives Potentially Saved</div>
                  </div>
                  <div>
                    <div className='text-lg font-medium'>{donorInfo.lastDonation}</div>
                    <div className='text-sm text-gray-500'>Last Donation</div>
                  </div>
                </div>
              </div>

              <div className='bg-white border rounded-xl'>
                <div className='border-b px-6 py-4'>
                  <h3 className='font-semibold'>Contact Information</h3>
                </div>
                <div className='px-6 py-4 space-y-2 text-sm'>
                  <div className='flex items-center gap-2'><span className='text-gray-500'>Name:</span> <span>{donorInfo.name}</span></div>
                  <div className='flex items-center gap-2'><span className='text-gray-500'>Phone:</span> <span>{donorInfo.phone || '—'}</span></div>
                  <div className='flex items-center gap-2'><span className='text-gray-500'>Blood Group:</span> <span>{donorInfo.bloodGroup}</span></div>
                </div>
              </div>

              <div className='bg-white border rounded-xl'>
                <div className='border-b px-6 py-4 flex items-center gap-2'>
                  <h3 className='font-semibold'>Accepted Requests</h3>
                </div>
                <div className='px-6 py-4 space-y-3 text-sm'>
                  {acceptedRequests.length === 0 && <div className='text-gray-500'>No accepted requests yet.</div>}
                  {acceptedRequests.map((request) => (
                    <div key={request._id} className='border rounded-lg p-3 space-y-2'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='font-medium text-sm'>{request.hospital}</p>
                          <p className='text-xs text-gray-500'>{request.bloodGroup} - {request.unitsNeeded} units</p>
                        </div>
                        <span className='px-2 py-1 rounded bg-green-50 text-green-700 text-xs'>
                          Accepted
                        </span>
                      </div>
                      {request.patientContact && (
                        <div className='text-xs text-gray-600'>
                          <span className='font-medium'>Patient:</span> {request.patientContact.name}
                          <br />
                          <span className='font-medium'>Contact:</span> {request.patientContact.phone || 'Not provided'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className='bg-white border rounded-xl'>
                <div className='border-b px-6 py-4 flex items-center gap-2'>
                  <h3 className='font-semibold'>Recent Donations</h3>
                </div>
                <div className='px-6 py-4 space-y-3 text-sm'>
                  {donationHistory.length === 0 && <div className='text-gray-500'>No donations yet.</div>}
                  {donationHistory.map((donation, idx) => (
                    <div key={idx} className='flex items-center justify-between'>
                      <div>
                        <p className='font-medium'>{donation.date}</p>
                        <p className='text-gray-500'>{donation.hospital}</p>
                      </div>
                      <span className='px-2 py-1 rounded bg-green-50 text-green-700'>
                        {donation.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DonorDashboard

