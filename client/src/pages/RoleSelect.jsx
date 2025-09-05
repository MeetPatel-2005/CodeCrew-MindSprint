import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const RoleSelect = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-800 mb-6">
            <span className="mr-2">←</span>
            Back to Home
          </Link>

          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-red-600 rounded-full">
              <img src={assets.logo} alt="LifeLine" className="h-7 w-7" />
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-2">Join LifeLine</h1>
          <p className="text-lg text-gray-600">Choose your role to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Donor Card */}
          <div className="group hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-indigo-600 rounded-xl cursor-pointer">
            <div className="text-center p-8">
              <div className="flex items-center justify-center w-20 h-20 bg-indigo-50 rounded-full mx-auto mb-4 group-hover:bg-indigo-100 transition-colors">
                <img src={assets.person_icon} alt="Donor" className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-semibold">I'm a Donor</h2>
              <p className="text-lg text-gray-600">Ready to save lives by donating blood</p>
              <ul className="text-left space-y-2 mb-6 text-gray-600 mt-6">
                <li>• Toggle your availability</li>
                <li>• See nearby blood requests</li>
                <li>• Track your donation history</li>
                <li>• Get notified of urgent needs</li>
              </ul>
              <Link to="/auth?role=donor" className="inline-flex items-center justify-center w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white">
                Sign Up as Donor
              </Link>
            </div>
          </div>

          {/* Patient Card */}
          <div className="group hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-red-600 rounded-xl cursor-pointer">
            <div className="text-center p-8">
              <div className="flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mx-auto mb-4 group-hover:bg-red-100 transition-colors">
                <img src={assets.person_icon} alt="Patient" className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-semibold">I Need Blood</h2>
              <p className="text-lg text-gray-600">Looking for blood donors in urgent need</p>
              <ul className="text-left space-y-2 mb-6 text-gray-600 mt-6">
                <li>• Request blood quickly</li>
                <li>• Find nearby donors</li>
                <li>• Track request status</li>
                <li>• Emergency priority support</li>
              </ul>
              <Link to="/auth?role=patient" className="inline-flex items-center justify-center w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white">
                Request Blood
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/auth?mode=login" className="text-indigo-600 hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RoleSelect


