import React, { useContext, useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const PatientDashboard = () => {
  const { backendUrl, userData } = useContext(AppContent)
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [activeRequests, setActiveRequests] = useState([])
  const [history, setHistory] = useState([])
  const [matchingDonors, setMatchingDonors] = useState([])

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

  return (
    <div className='min-h-screen bg-white'>
      <Navbar hideLogo={true} />

      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2 space-y-6'>
            <div className='bg-white rounded-lg border-2 border-gray-200 shadow-sm'>
              <div className='p-5 border-b'>
                <h2 className='text-lg font-semibold flex items-center gap-2'>
                  <span className='text-red-600'>🩸</span>
                  Blood Request
                </h2>
              </div>
              <div className='p-5'>
                {!showForm ? (
                  <div className='text-center py-8'>
                    <p className='text-gray-500 mb-4'>Need blood urgently? Create a request to find donors nearby.</p>
                    <button className='px-5 py-2 rounded-md bg-red-600 text-white' onClick={() => setShowForm(true)}>Request Blood Now</button>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm mb-1'>Blood Group</label>
                        <select className='w-full border rounded-md px-3 py-2' value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
                          {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className='block text-sm mb-1'>Units Needed</label>
                        <input type='number' min='1' max='10' className='w-full border rounded-md px-3 py-2' value={form.unitsNeeded} onChange={e => setForm({ ...form, unitsNeeded: Number(e.target.value) })} />
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm mb-1'>Urgency</label>
                        <select className='w-full border rounded-md px-3 py-2' value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })}>
                          <option value='critical'>Critical</option>
                          <option value='high'>High</option>
                          <option value='medium'>Medium</option>
                        </select>
                      </div>
                      <div>
                        <label className='block text-sm mb-1'>Hospital Name</label>
                        <input className='w-full border rounded-md px-3 py-2' value={form.hospitalName} onChange={e => setForm({ ...form, hospitalName: e.target.value })} placeholder='Hospital name' />
                      </div>
                    </div>

                    <div>
                      <label className='block text-sm mb-1'>Hospital Address</label>
                      <input className='w-full border rounded-md px-3 py-2' value={form.hospitalAddress} onChange={e => setForm({ ...form, hospitalAddress: e.target.value })} placeholder='Hospital address' />
                    </div>

                    <div>
                      <label className='block text-sm mb-1'>Additional Notes</label>
                      <textarea rows='3' className='w-full border rounded-md px-3 py-2' value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                    </div>

                    <div className='flex gap-3'>
                      <button className='px-4 py-2 rounded-md bg-red-600 text-white' onClick={submitRequest}>Submit Request</button>
                      <button className='px-4 py-2 rounded-md border' onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {activeRequests.length > 0 && (
              <div className='bg-white rounded-lg border-2 border-gray-200 shadow-sm'>
                <div className='p-5 border-b'><h3 className='font-semibold'>Active Requests</h3></div>
                <div className='p-5 space-y-4'>
                  {activeRequests.map(r => (
                    <div key={r._id} className='border-2 border-gray-200 rounded-lg p-4 space-y-3'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='font-medium'>Blood Request #{r._id.slice(-6)}</p>
                          <p className='text-sm text-gray-500'>{r.hospital}</p>
                        </div>
                        <span className='px-2 py-1 rounded-md text-sm bg-red-100 text-red-700 capitalize'>{r.urgency}</span>
                      </div>
                      <div className='grid grid-cols-3 gap-4 text-sm'>
                        <div><span className='text-gray-500'>Blood Type:</span><p className='font-medium'>{r.bloodGroup}</p></div>
                        <div><span className='text-gray-500'>Units Needed:</span><p className='font-medium'>{r.unitsNeeded}</p></div>
                        <div><span className='text-gray-500'>Donors Found:</span><p className='font-medium'>{r.acceptedDonors}</p></div>
                      </div>
                      <div className='flex items-center justify-between'>
                        <p className='text-xs text-gray-500'>Created {new Date(r.createdAt).toLocaleString()}</p>
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
              <div className='bg-white rounded-lg border-2 border-gray-200 shadow-sm'>
                <div className='p-5 border-b'><h3 className='font-semibold'>Matching Donors</h3></div>
                <div className='p-5 space-y-4'>
                  {matchingDonors.map(d => (
                    <div key={d.id} className='border-2 border-gray-200 rounded-lg p-4 space-y-3'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='font-medium'>{d.name}</p>
                          <p className='text-sm text-gray-500'>{d.bloodGroup} • {d.distance}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-xs ${statusColor(d.status)}`}>{d.status}</span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <div className='text-sm'>
                          <span className='text-gray-500'>Last donation: </span>
                          <span>{d.lastDonation}</span>
                        </div>
                        <div className='flex gap-2'>
                          <button className='px-3 py-1 border rounded-md text-sm'>{d.phone}</button>
                          <button className='px-3 py-1 rounded-md bg-green-600 text-white text-sm'>Contact</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className='space-y-6'>
            <div className='bg-white rounded-lg border-2 border-gray-200 shadow-sm'>
              <div className='p-5 border-b flex items-center justify-between'>
                <h3 className='font-semibold'>Your Information</h3>
                <button 
                  className='text-sm underline hover:text-indigo-600' 
                  onClick={() => {
                    console.log('Navigating to profile settings...')
                    navigate('/profile-settings')
                  }}
                >
                  Profile Settings
                </button>
              </div>
              <div className='p-5 space-y-2 text-sm'>
                <div className='flex items-center gap-2'><span className='text-gray-500'>Name:</span><span>{userData?.name}</span></div>
                <div className='flex items-center gap-2'><span className='text-gray-500'>Phone:</span><span>{userData?.phone || 'Not set'}</span></div>
                <div className='flex items-center gap-2'><span className='text-gray-500'>Hospital:</span><span>{userData?.hospital || 'Not set'}</span></div>
              </div>
            </div>

            <div className='bg-white rounded-lg border-2 border-gray-200 shadow-sm'>
              <div className='p-5 border-b'><h3 className='font-semibold'>Request Status</h3></div>
              <div className='p-5 grid grid-cols-3 text-center gap-4'>
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

            <div className='bg-white rounded-lg border-2 border-gray-200 shadow-sm'>
              <div className='p-5 border-b'><h3 className='font-semibold'>Request History</h3></div>
              <div className='p-5 space-y-3'>
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
    </div>
  )
}

export default PatientDashboard;


