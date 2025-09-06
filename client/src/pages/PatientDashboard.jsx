import React, { useContext, useEffect, useMemo, useState } from 'react'
import ContactModal from '../components/ContactModal'
import ChatModal from '../components/ChatModal'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const PatientDashboard = () => {
  const { backendUrl, userData, setIsLoggedIn, setUserData } = useContext(AppContent)
  const navigate = useNavigate()
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
    <div className='min-h-screen bg-white'>
      <div className='max-w-6xl mx-auto px-4 py-6'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2 space-y-6'>
            <div className='bg-white border-2 border-gray-300 rounded-xl sticky top-0 z-50 shadow-sm'>
              <div className='border-b px-6 py-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='h-12 w-12 rounded-full bg-red-600 text-white flex items-center justify-center text-lg font-semibold'>
                      {userData?.name?.split(' ').map(n => n[0]).join('') || 'P'}
                    </div>
                    <div>
                      <h1 className='text-xl font-semibold'>Hi {userData?.name?.split(' ')[0] || 'Patient'}, need help? Let's find a donor! 🩸</h1>
                      <p className='text-sm text-gray-500'>Blood Group: {userData?.bloodGroup || 'Not set'}</p>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <button 
                      onClick={() => navigate('/profile-settings')} 
                      className='border-2 border-gray-300 px-3 py-2 rounded-md text-sm hover:bg-gray-50 no-underline'
                    >
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
                      className='border-2 border-red-300 px-3 py-2 rounded-md text-sm hover:bg-red-50 text-red-600 no-underline'
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
              <div className='px-6 py-4'>
                <h2 className='text-lg font-semibold flex items-center gap-2 mb-4'>
                  <span className='text-red-600'>🩸</span>
                  Blood Request
                </h2>
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
                            B
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
                          <p className='font-medium'>{r.acceptedDonors}</p>
                        </div>
                      </div>
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
            <div className='bg-white border-2 border-gray-300 rounded-xl'>
              <div className='border-b px-6 py-4'>
                <h3 className='font-semibold'>Your Information</h3>
              </div>
              <div className='px-6 py-4 space-y-2 text-sm'>
                <div className='flex items-center gap-2'><span className='text-gray-500'>Name:</span><span>{userData?.name}</span></div>
                <div className='flex items-center gap-2'><span className='text-gray-500'>Phone:</span><span>{userData?.phone || 'Not set'}</span></div>
                <div className='flex items-center gap-2'><span className='text-gray-500'>Hospital:</span><span>{userData?.hospital || 'Not set'}</span></div>
                <div className='flex items-center gap-2'><span className='text-gray-500'>Blood Group:</span><span>{userData?.bloodGroup || 'Not set'}</span></div>
                <div className='flex items-center gap-2'><span className='text-gray-500'>Location:</span><span>{userData?.location || 'Not set'}</span></div>
              </div>
            </div>

            <div className='bg-white border-2 border-gray-300 rounded-xl'>
              <div className='border-b px-6 py-4'>
                <h3 className='font-semibold'>Request Status</h3>
              </div>
              <div className='px-6 py-4 grid grid-cols-3 text-center gap-4'>
                <div>
                  <div className='text-3xl font-bold text-red-600'>{activeRequests.length}</div>
                  <div className='text-sm text-gray-500'>Active Requests</div>
                </div>
                <div>
                  <div className='text-3xl font-bold text-green-600'>{matchingDonors.length}</div>
                  <div className='text-sm text-gray-500'>Donors Found</div>
                </div>
                <div>
                  <div className='text-lg font-medium'>{history.length}</div>
                  <div className='text-sm text-gray-500'>Previous Requests</div>
                </div>
              </div>
            </div>

            <div className='bg-white border-2 border-gray-300 rounded-xl'>
              <div className='border-b px-6 py-4'>
                <h3 className='font-semibold'>Request History</h3>
              </div>
              <div className='px-6 py-4 space-y-3'>
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

      {/* Contact Modal */}
      <ContactModal
        isOpen={contactModal.isOpen}
        onClose={() => setContactModal({ isOpen: false, donorId: null, donorName: '', donorBloodGroup: '' })}
        donorId={contactModal.donorId}
        donorName={contactModal.donorName}
        donorBloodGroup={contactModal.donorBloodGroup}
        onStartChat={handleStartChat}
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

export default PatientDashboard;



