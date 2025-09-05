import React from 'react'
import Navbar from '../components/Navbar'

const DonorDashboard = () => {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <Navbar />
      <div className='text-center'>
        <h1 className='text-3xl font-semibold mb-2'>Donor Dashboard</h1>
        <p className='text-gray-600'>Welcome! Manage your donation availability and requests here.</p>
      </div>
    </div>
  )
}

export default DonorDashboard;


