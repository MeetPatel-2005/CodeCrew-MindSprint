import React, { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const DonorChatModal = ({ isOpen, onClose, patientId, patientName, patientBloodGroup }) => {
  const { backendUrl, userData } = React.useContext(AppContent)
  const [patientDetails, setPatientDetails] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState('')
  const [loading, setLoading] = useState(false)
  const [socket, setSocket] = useState(null)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Create room ID based on user IDs
  const roomId = React.useMemo(() => {
    if (!userData?._id || !patientId) return null
    const ids = [userData._id, patientId].sort()
    return `${ids[0]}_${ids[1]}`
  }, [userData?._id, patientId])

  // Initialize socket connection
  useEffect(() => {
    if (isOpen && roomId) {
      const newSocket = io(backendUrl.replace('/api', ''), {
        withCredentials: true
      })

      newSocket.on('connect', () => {
        console.log('Connected to chat server')
        newSocket.emit('join-room', roomId)
      })

      newSocket.on('receive-message', (data) => {
        setMessages(prev => [...prev, data])
        scrollToBottom()
      })

      newSocket.on('user-typing', (data) => {
        setTypingUser(data.userName)
        setIsTyping(data.isTyping)
        
        if (data.isTyping) {
          setTimeout(() => {
            setIsTyping(false)
            setTypingUser('')
          }, 3000)
        }
      })

      setSocket(newSocket)

      return () => {
        newSocket.disconnect()
      }
    }
  }, [isOpen, roomId, backendUrl])

  // Fetch patient details and chat history
  useEffect(() => {
    if (isOpen && patientId) {
      fetchPatientDetails()
      fetchChatHistory()
    }
  }, [isOpen, patientId])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchPatientDetails = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${backendUrl}/api/donor/patients/${patientId}`)
      if (data.success) {
        setPatientDetails(data.patient)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Error fetching patient details:', error)
      toast.error('Failed to fetch patient details')
    } finally {
      setLoading(false)
    }
  }

  const fetchChatHistory = async () => {
    try {
      // For now, we'll start with an empty chat history
      // In a real implementation, you would fetch chat history from the server
      setMessages([])
    } catch (error) {
      console.error('Failed to fetch chat history:', error)
    }
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return

    const messageData = {
      roomId,
      message: newMessage.trim(),
      senderId: userData._id,
      senderName: userData.name,
      senderRole: userData.role
    }

    socket.emit('send-message', messageData)
    setNewMessage('')
    
    // Stop typing indicator
    socket.emit('typing', { roomId, isTyping: false, userName: userData.name })
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    
    if (socket) {
      // Emit typing indicator
      socket.emit('typing', { roomId, isTyping: true, userName: userData.name })
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { roomId, isTyping: false, userName: userData.name })
      }, 1000)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold">
              {patientName?.split(' ').map(n => n[0]).join('') || 'P'}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{patientName}</h2>
              <p className="text-gray-500">Blood Group: {patientBloodGroup}</p>
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

        <div className="flex flex-1 overflow-hidden">
          {/* Patient Details Sidebar */}
          <div className="w-1/3 border-r bg-gray-50 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : patientDetails ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">{patientDetails.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Blood Group</label>
                  <p className="text-gray-900">{patientDetails.bloodGroup}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{patientDetails.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-gray-900">{patientDetails.location || 'Not provided'}</p>
                </div>
                {patientDetails.hospital && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Hospital</label>
                    <p className="text-gray-900">{patientDetails.hospital}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Status</label>
                  <p className={`font-medium ${patientDetails.isAccountVerified ? 'text-green-600' : 'text-red-600'}`}>
                    {patientDetails.isAccountVerified ? 'Verified' : 'Not Verified'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">Failed to load patient details</div>
            )}
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Start a conversation with {patientName}
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.senderId === userData._id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === userData._id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
                    <p className="text-sm italic">{typingUser} is typing...</p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DonorChatModal
