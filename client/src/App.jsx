import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import DonorDashboard from './pages/DonorDashboard'
import DonorProfile from './pages/DonorProfile'
import PatientDashboard from './pages/PatientDashboard'
import RoleSelect from './pages/RoleSelect'

const App = () => {
  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} /> {/* ✅ outside Routes */}
      
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<RoleSelect />} />
        <Route path='/auth' element={<Login />} />
        <Route path='/email-verify' element={<EmailVerify />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/donor-profile' element={<DonorProfile />} />
        <Route path='/donor-dashboard' element={<DonorDashboard />} />
        <Route path='/patient-dashboard' element={<PatientDashboard />} />
      </Routes>
    </div>
  )
}

export default App;
