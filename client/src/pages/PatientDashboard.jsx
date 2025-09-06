import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PatientDashboard = () => {
  const { backendUrl, userData } = useContext(AppContent)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [patientInfo, setPatientInfo] = useState({ name: '', email: '', phone: '', bloodGroup: '' })
  const [requests, setRequests] = useState([])
  const [acceptedRequests, setAcceptedRequests] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newRequest, setNewRequest] = useState({
    bloodGroup: '',
    unitsNeeded: 1,
    urgency: 'Medium',
    hospital: '',
    distanceKm: 1.0,
    additionalInfo: ''
  })

  const urgencyClass = {
    Critical: 'bg-red-600 text-white',
    High: 'bg-orange-500 text-white',
    Medium: 'bg-gray-200 text-gray-800',
    Low: 'bg-gray-100 text-gray-700'
  }

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${backendUrl}/api/patient/dashboard`)
      if (!data.success) return toast.error(data.message || 'Failed to load dashboard')
      const { patientInfo, requests, acceptedRequests } = data.data
      setPatientInfo(patientInfo)
      setRequests(requests)
      setAcceptedRequests(acceptedRequests)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRequest = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post(`${backendUrl}/api/patient/create-request`, newRequest)
      if (data.success) {
        toast.success('Blood request created successfully!')
        setShowCreateForm(false)
        setNewRequest({
          bloodGroup: '',
          unitsNeeded: 1,
          urgency: 'Medium',
          hospital: '',
          distanceKm: 1.0,
          additionalInfo: ''
        })
        fetchDashboard()
      } else {
        toast.error(data.message || 'Failed to create request')
      }
    } catch (err) {
      toast.error(err.message)
    }
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
      <div className='max-w-6xl mx-auto px-4 py-6'>
        {loading ? (
          <div className='text-center py-20'>Loading...</div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2 space-y-6'>
              {/* Header */}
              <div className='bg-white border rounded-xl'>
                <div className='border-b px-6 py-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='h-12 w-12 rounded-full bg-red-600 text-white flex items-center justify-center text-lg font-semibold'>
                        {patientInfo.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h1 className='text-xl font-semibold'>Hi {patientInfo.name.split(' ')[0]}, we're here to help! 🩸</h1>
                        <p className='text-sm text-gray-500'>Need Blood: {patientInfo.bloodGroup || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <button 
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm'
                      >
                        {showCreateForm ? 'Cancel' : 'Create Request'}
                      </button>
                      <button onClick={handleLogout} className='border px-3 py-2 rounded-md text-sm hover:bg-gray-50 text-red-600 border-red-300 hover:bg-red-50'>Logout</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Create Request Form */}
              {showCreateForm && (
                <div className='bg-white border rounded-xl'>
                  <div className='border-b px-6 py-4'>
                    <h2 className='text-lg font-semibold'>Create Blood Request</h2>
                  </div>
                  <form onSubmit={handleCreateRequest} className='px-6 py-4 space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Blood Group Required *</label>
                        <select
                          value={newRequest.bloodGroup}
                          onChange={(e) => setNewRequest({...newRequest, bloodGroup: e.target.value})}
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
                          required
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
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Units Needed *</label>
                        <input
                          type='number'
                          min='1'
                          value={newRequest.unitsNeeded}
                          onChange={(e) => setNewRequest({...newRequest, unitsNeeded: parseInt(e.target.value)})}
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
                          required
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Urgency *</label>
                        <select
                          value={newRequest.urgency}
                          onChange={(e) => setNewRequest({...newRequest, urgency: e.target.value})}
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
                        >
                          <option value="Critical">Critical</option>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Hospital *</label>
                        <input
                          type='text'
                          value={newRequest.hospital}
                          onChange={(e) => setNewRequest({...newRequest, hospital: e.target.value})}
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
                          placeholder='Hospital name'
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>Additional Information</label>
                      <textarea
                        value={newRequest.additionalInfo}
                        onChange={(e) => setNewRequest({...newRequest, additionalInfo: e.target.value})}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
                        rows='3'
                        placeholder='Any additional details...'
                      />
                    </div>
                    <button type='submit' className='w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md'>
                      Create Request
                    </button>
                  </form>
                </div>
              )}

              {/* My Requests */}
              <div className='bg-white border rounded-xl'>
                <div className='border-b px-6 py-4'>
                  <h2 className='text-lg font-semibold'>My Blood Requests</h2>
                </div>
                <div className='px-6 py-4 space-y-4'>
                  {requests.length === 0 && (
                    <div className='text-sm text-gray-500'>No requests created yet.</div>
                  )}
                  {requests.map((request) => (
                    <div key={request._id} className='border rounded-lg p-4 space-y-3'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold'>
                            {request.bloodGroup}
                          </div>
                          <div>
                            <p className='font-medium'>{request.hospital}</p>
                            <p className='text-sm text-gray-500'>{new Date(request.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${urgencyClass[request.urgency] || 'bg-gray-100 text-gray-700'}`}>
                          {request.urgency}
                        </span>
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
                          <span className='text-gray-500'>Status:</span>
                          <p className='font-medium'>{request.status}</p>
                        </div>
                      </div>
                      {request.additionalInfo && (
                        <div className='text-sm text-gray-600'>
                          <span className='font-medium'>Additional Info:</span> {request.additionalInfo}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className='space-y-6'>
              {/* Accepted Requests */}
              <div className='bg-white border rounded-xl'>
                <div className='border-b px-6 py-4'>
                  <h3 className='font-semibold'>Accepted Requests</h3>
                </div>
                <div className='px-6 py-4 space-y-3'>
                  {acceptedRequests.length === 0 && (
                    <div className='text-sm text-gray-500'>No accepted requests yet.</div>
                  )}
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
                      {request.acceptedBy && (
                        <div className='text-xs text-gray-600'>
                          <span className='font-medium'>Donor:</span> {request.acceptedBy.name}
                          <br />
                          <span className='font-medium'>Contact:</span> {request.acceptedBy.phone || 'Not provided'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className='bg-white border rounded-xl'>
                <div className='border-b px-6 py-4'>
                  <h3 className='font-semibold'>Your Information</h3>
                </div>
                <div className='px-6 py-4 space-y-2 text-sm'>
                  <div className='flex items-center gap-2'><span className='text-gray-500'>Name:</span> <span>{patientInfo.name}</span></div>
                  <div className='flex items-center gap-2'><span className='text-gray-500'>Email:</span> <span>{patientInfo.email}</span></div>
                  <div className='flex items-center gap-2'><span className='text-gray-500'>Phone:</span> <span>{patientInfo.phone || '—'}</span></div>
                  <div className='flex items-center gap-2'><span className='text-gray-500'>Blood Group:</span> <span>{patientInfo.bloodGroup || '—'}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientDashboard