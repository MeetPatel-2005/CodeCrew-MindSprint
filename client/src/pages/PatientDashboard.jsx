import React from 'react'
import Navbar from '../components/Navbar'

const PatientDashboard = () => {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <Navbar />
      <div className='text-center'>
        <h1 className='text-3xl font-semibold mb-2'>Patient Dashboard</h1>
        <p className='text-gray-600'>Welcome! Request blood and track your requests here.</p>
      </div>
    </div>
  )
}

export default PatientDashboard;


