import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext'
import ContactModal from '../components/ContactModal'
import ChatModal from '../components/ChatModal'
import axios from 'axios'
import { toast } from 'react-toastify'

const PatientDashboard = () => {
  const { backendUrl, userData, setIsLoggedIn, setUserData } = useContext(AppContent)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [activeRequests, setActiveRequests] = useState([])
  const [history, setHistory] = useState([])
  const [matchingDonors, setMatchingDonors] = useState([])
  const [acceptedDonors, setAcceptedDonors] = useState({})
  const [contactModal, setContactModal] = useState({ isOpen: false, donorId: null, donorName: '', donorBloodGroup: '' })
  
  const [chatModal, setChatModal] = useState({
    isOpen: false,
    donorId: null,
    donorName: '',
    donorBloodGroup: '',
    donorDetails: null
  })

  const [form, setForm] = useState({
    bloodGroup: '',
    unitsNeeded: 1,
    urgency: 'high',
    hospitalName: '',
    hospitalAddress: '',
    notes: ''
  })

  // Update form when userData changes
  useEffect(() => {
    if (userData) {
      setForm(prev => ({
        ...prev,
        bloodGroup: userData.bloodGroup || ''
      }))
    }
  }, [userData])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [a, h, d] = await Promise.all([
        axios.get(backendUrl + '/api/patient/requests/active'),
        axios.get(backendUrl + '/api/patient/requests/history'),
        axios.get(backendUrl + '/api/patient/donors/matching', { params: { bloodGroup: form.bloodGroup } })
      ])
      a.data.success && setActiveRequests(a.data.requests)
      h.data.success && setHistory(h.data.requests)
      d.data.success && setMatchingDonors(d.data.donors)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // If required details missing or email not verified, redirect to onboarding
    if (!userData) return
    const needsOnboarding = !userData.phone || !userData.bloodGroup || !userData.isAccountVerified
    if (needsOnboarding) {
      navigate('/patient-onboarding')
      return
    }
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, navigate])

  // Fetch accepted donors for each active request
  useEffect(() => {
    if (activeRequests.length > 0) {
      activeRequests.forEach(request => {
        fetchAcceptedDonors(request._id)
      })
    }
  }, [activeRequests])

  const submitRequest = async () => {
    // Validate required fields
    if (!form.bloodGroup || !form.unitsNeeded || !form.urgency || !form.hospitalName || !form.hospitalAddress) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      console.log('Sending request data:', form)
      const { data } = await axios.post(backendUrl + '/api/patient/requests', form)
      if (data.success) {
        toast.success('Request created')
        setShowForm(false)
        fetchAll()
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  const cancelRequest = async (requestId) => {
    try {
      const { data } = await axios.put(backendUrl + `/api/patient/requests/${requestId}/cancel`)
      if (data.success) {
        toast.success('Request cancelled successfully')
        fetchAll()
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  const statusColor = (s) => {
    if (s === 'Active') return 'bg-yellow-100 text-yellow-700'
    if (s === 'Completed' || s === 'Accepted') return 'bg-green-100 text-green-700'
    return 'bg-gray-100 text-gray-700'
  }

  const handleStartChat = (donorId, donorName, donorBloodGroup, donorDetails) => {
    setContactModal({ isOpen: false, donorId: null, donorName: '', donorBloodGroup: '' })
    setChatModal({
      isOpen: true,
      donorId,
      donorName,
      donorBloodGroup,
      donorDetails
    })
  }

  const fetchAcceptedDonors = async (requestId) => {
    try {
      const response = await axios.get(`${backendUrl}/api/patient/requests/${requestId}/accepted-donors`)
      if (response.data.success) {
        setAcceptedDonors(prev => ({
          ...prev,
          [requestId]: response.data.acceptedDonors
        }))
      }
    } catch (error) {
      console.error('Error fetching accepted donors:', error)
    }
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b sticky top-0 z-50 shadow-sm'>
        <div className='max-w-6xl mx-auto px-4 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <div className='h-12 w-12 rounded-full bg-red-600 text-white flex items-center justify-center text-lg font-semibold'>
                {userData?.name?.split(' ').map(n => n[0]).join('') || 'P'}
              </div>
              <div>
                <h1 className='text-2xl font-bold'>Hi {userData?.name?.split(' ')[0] || 'Patient'}, need help? Let's find a donor! 🩸</h1>
                <p className='text-gray-500'>Blood Group: {userData?.bloodGroup || 'Not set'}</p>
              </div>
            </div>
            <div className='flex gap-2'>
              <button 
                onClick={() => navigate('/profile-settings')} 
                className='flex items-center gap-2 border-2 border-gray-300 px-3 py-2 rounded-md text-sm hover:bg-gray-50 no-underline'
              >
                <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' />
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                </svg>
                Profile Settings
              </button>
              <button 
                onClick={async () => {
                  try {
                    await axios.post(backendUrl + '/api/auth/logout')
                    setIsLoggedIn(false)
                    setUserData(false)
                    navigate('/')
                  } catch (error) {
                    console.error('Logout error:', error)
                  }
                }} 
                className='flex items-center gap-2 border-2 border-red-300 px-3 py-2 rounded-md text-sm hover:bg-red-50 text-red-600 no-underline'
              >
                <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-4 py-8'>
        {loading ? (
          <div className='text-center py-20'>Loading...</div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2 space-y-6'>
              <div className='bg-white border-2 border-gray-300 rounded-xl'>
                <div className='border-b px-6 py-4'>
                  <h2 className='text-lg font-semibold flex items-center gap-2'>
                    <span className='text-red-600'>🩸</span>
                    Blood Request
                  </h2>
                </div>
                <div className='px-6 py-4'>
                  {!showForm ? (
                    <div className='text-center py-8'>
                      <p className='text-gray-500 mb-4'>Need blood urgently? Create a request to find donors nearby.</p>
                      <button className='px-5 py-2 rounded-md bg-red-600 text-white hover:bg-red-700' onClick={() => setShowForm(true)}>Request Blood Now</button>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>Blood Group</label>
                          <select className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500' value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
                            {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>Units Needed</label>
                          <input type='number' min='1' max='10' className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500' value={form.unitsNeeded} onChange={e => setForm({ ...form, unitsNeeded: Number(e.target.value) })} />
                        </div>
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>Urgency</label>
                          <select className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500' value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })}>
                            <option value='critical'>Critical</option>
                            <option value='high'>High</option>
                            <option value='medium'>Medium</option>
                          </select>
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>Hospital Name</label>
                          <input className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500' value={form.hospitalName} onChange={e => setForm({ ...form, hospitalName: e.target.value })} placeholder='Hospital name' />
                        </div>
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Hospital Address</label>
                        <input className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500' value={form.hospitalAddress} onChange={e => setForm({ ...form, hospitalAddress: e.target.value })} placeholder='Hospital address' />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Additional Notes</label>
                        <textarea rows='3' className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500' value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                      </div>

                      <div className='flex gap-3'>
                        <button className='px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700' onClick={submitRequest}>Submit Request</button>
                        <button className='px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50' onClick={() => setShowForm(false)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {activeRequests.length > 0 && (
                <div className='bg-white border-2 border-gray-300 rounded-xl'>
                  <div className='border-b px-6 py-4'>
                    <h2 className='text-lg font-semibold'>Active Blood Requests</h2>
                  </div>
                  <div className='px-6 py-4 space-y-4'>
                    {activeRequests.map(r => (
                      <div key={r._id} className='border-2 border-gray-300 rounded-lg p-4 space-y-3'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold'>
                              {r.bloodGroup}
                            </div>
                            <div>
                              <p className='font-medium'>Blood Request #{r._id.slice(-6)}</p>
                              <p className='text-sm text-gray-500'>{r.hospitalName}</p>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${r.urgency === 'critical' ? 'bg-red-600 text-white' : r.urgency === 'high' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            {r.urgency}
                          </span>
                        </div>
                        <div className='grid grid-cols-3 gap-4 text-sm'>
                          <div>
                            <span className='text-gray-500'>Blood Type:</span>
                            <p className='font-medium'>{r.bloodGroup}</p>
                          </div>
                          <div>
                            <span className='text-gray-500'>Units Needed:</span>
                            <p className='font-medium'>{r.unitsNeeded}</p>
                          </div>
                          <div>
                            <span className='text-gray-500'>Donors Found:</span>
                            <p className='font-medium'>{Array.isArray(r.acceptedDonors) ? r.acceptedDonors.length : 0}</p>
                          </div>
                        </div>
                        {/* Accepted Donors Section */}
                        {acceptedDonors[r._id] && acceptedDonors[r._id].length > 0 && (
                          <div className='border-t pt-3'>
                            <h4 className='text-sm font-medium text-gray-700 mb-2'>Accepted Donors ({acceptedDonors[r._id].length})</h4>
                            <div className='space-y-2'>
                              {acceptedDonors[r._id].map((donor, index) => (
                                <div key={index} className='flex items-center justify-between bg-green-50 p-2 rounded'>
                                  <div className='flex items-center gap-2'>
                                    <div className='w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold text-sm'>
                                      {donor.donorName?.split(' ').map(n => n[0]).join('') || 'D'}
                                    </div>
                                    <div>
                                      <p className='text-sm font-medium'>{donor.donorName}</p>
                                      <p className='text-xs text-gray-500'>{donor.donorBloodGroup} • {donor.status}</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleStartChat(donor.donorId, donor.donorName, donor.donorBloodGroup, donor)}
                                    className='px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700'
                                  >
                                    Chat
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className='flex items-center justify-between'>
                          <p className='text-xs text-gray-500'>{new Date(r.createdAt).toLocaleString()}</p>
                          <div className='flex items-center gap-2'>
                            <span className={`px-2 py-1 rounded-md text-xs ${statusColor(r.status)}`}>{r.status}</span>
                            {r.status === 'Active' && (
                              <button 
                                onClick={() => cancelRequest(r._id)}
                                className='px-2 py-1 rounded-md text-xs bg-red-100 text-red-700 hover:bg-red-200'
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchingDonors.length > 0 && (
                <div className='bg-white border-2 border-gray-300 rounded-xl'>
                  <div className='border-b px-6 py-4'>
                    <h2 className='text-lg font-semibold'>Matching Donors</h2>
                  </div>
                  <div className='px-6 py-4 space-y-4'>
                    {matchingDonors.map(d => (
                      <div key={d.id} className='border-2 border-gray-300 rounded-lg p-4 space-y-3'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold'>
                              {d.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className='font-medium'>{d.name}</p>
                              <p className='text-sm text-gray-500'>{d.bloodGroup} • {d.distance}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-md text-xs ${statusColor(d.status)}`}>{d.status}</span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <div className='text-sm'>
                            <span className='text-gray-500'>Last donation: </span>
                            <span>{d.lastDonation}</span>
                          </div>
                          <div className='flex gap-2'>
                            <button className='px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50'>{d.phone}</button>
                            <button 
                              onClick={() => setContactModal({ 
                                isOpen: true, 
                                donorId: d.id, 
                                donorName: d.name, 
                                donorBloodGroup: d.bloodGroup 
                              })}
                              className='px-3 py-1 rounded-md bg-green-600 text-white text-sm hover:bg-green-700'
                            >
                              Contact
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className='space-y-6'>
              {/* Your Information */}
              <div className='bg-white border-2 border-gray-300 rounded-xl'>
                <div className='border-b px-6 py-4'>
                  <h3 className='font-semibold flex items-center gap-2'>
                    <svg className='h-5 w-5 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                    </svg>
                    Your Information
                  </h3>
                </div>
                <div className='px-6 py-4 space-y-3'>
                  <div className='flex items-center space-x-2'>
                    <svg className='h-4 w-4 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                    </svg>
                    <span>{userData?.name}</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <svg className='h-4 w-4 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                    </svg>
                    <span>{userData?.phone || 'Not set'}</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <svg className='h-4 w-4 text-gray-500' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/>
                    </svg>
                    <span>Blood Group: {userData?.bloodGroup || 'Not set'}</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <svg className='h-4 w-4 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                    </svg>
                    <span>{userData?.location || 'Not set'}</span>
                  </div>
                </div>
              </div>

              {/* Request Status */}
              <div className='bg-white border-2 border-gray-300 rounded-xl'>
                <div className='border-b px-6 py-4'>
                  <h3 className='font-semibold flex items-center gap-2'>
                    <svg className='h-5 w-5 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                    </svg>
                    Request Status
                  </h3>
                </div>
                <div className='px-6 py-4 space-y-4'>
                  <div className='text-center'>
                    <div className='text-3xl font-bold text-red-600'>{activeRequests.length}</div>
                    <div className='text-sm text-gray-500'>Active Requests</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-3xl font-bold text-green-600'>{matchingDonors.length}</div>
                    <div className='text-sm text-gray-500'>Donors Found</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-lg font-medium'>{history.length}</div>
                    <div className='text-sm text-gray-500'>Previous Requests</div>
                  </div>
                </div>
              </div>

              {/* Request History */}
              <div className='bg-white border-2 border-gray-300 rounded-xl'>
                <div className='border-b px-6 py-4'>
                  <h3 className='font-semibold flex items-center gap-2'>
                    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                    Request History
                  </h3>
                </div>
                <div className='px-6 py-4'>
                  <div className='space-y-3'>
                    {history.length === 0 && <div className='text-gray-500 text-sm'>No previous requests.</div>}
                    {history.map(r => (
                      <div key={r._id} className='flex items-center justify-between text-sm'>
                        <div>
                          <p className='font-medium'>{new Date(r.createdAt).toLocaleDateString()}</p>
                          <p className='text-gray-500'>{r.bloodGroup} • {r.unitsNeeded} units</p>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-xs ${statusColor(r.status)}`}>{r.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={contactModal.isOpen}
        onClose={() => setContactModal({ isOpen: false, donorId: null, donorName: '', donorBloodGroup: '' })}
        donorId={contactModal.donorId}
        donorName={contactModal.donorName}
        donorBloodGroup={contactModal.donorBloodGroup}
        onStartChat={handleStartChat}
        isRequestAccepted={false} // For matching donors, request is not yet accepted
      />

      {/* Chat Modal */}
      <ChatModal
        isOpen={chatModal.isOpen}
        onClose={() => setChatModal({ isOpen: false, donorId: null, donorName: '', donorBloodGroup: '', donorDetails: null })}
        donorId={chatModal.donorId}
        donorName={chatModal.donorName}
        donorBloodGroup={chatModal.donorBloodGroup}
        donorDetails={chatModal.donorDetails}
      />
    </div>
  )
}

export default PatientDashboard