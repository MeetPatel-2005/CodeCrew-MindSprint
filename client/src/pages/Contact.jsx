import React from 'react'
import heroImg from '../assets/contact.jpg'

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault()
  }

  return (
    <section className="relative w-full">
      <div className="absolute h-[30vh] w-screen bg-gradient-to-r from-[#588d43] via-[#68F432] to-[#588d43] -z-10 top-[25rem]"></div>

      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center">
        <h1 className='text-7xl font-bold text-zinc-800 mb-14 font-[Alice]'>Be a Lifesaver. Connect With Us.</h1>
        </div>
        <div className="grid h-[50rem] grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
          {/* Left: Demo image */}
          <div className="z-10 rounded-3xl overflow-hidden ring-1 ring-gray-200 shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)]">
            <img
              src={heroImg}
              alt="Modern hospital building for blood donation"
              className="h-full w-full object-cover object-center"
            />
          </div>

          {/* Right: Form */}
          <div className="z-10 bg-white rounded-3xl ring-1 ring-gray-200 shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)] p-8 lg:p-10">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEFFD6] text-[#2c7f1f] text-xs font-medium ring-1 ring-[#CFF7A1]">
                Blood Donation Support
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">
                Let’s Get In Touch
              </h1>
              <p className="mt-2 text-gray-600">
                Need blood or want to donate? Send us a message and our team will
                help you connect with verified donors, schedule donations, and answer
                eligibility questions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your first name..."
                    className="w-full rounded-xl border border-gray-200 focus:border-[#68F432] focus:ring-2 focus:ring-[#BBFC72] px-4 py-3 outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your last name..."
                    className="w-full rounded-xl border border-gray-200 focus:border-[#68F432] focus:ring-2 focus:ring-[#BBFC72] px-4 py-3 outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  className="w-full rounded-xl border border-gray-200 focus:border-[#68F432] focus:ring-2 focus:ring-[#BBFC72] px-4 py-3 outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  className="w-full rounded-xl border border-gray-200 focus:border-[#68F432] focus:ring-2 focus:ring-[#BBFC72] px-4 py-3 outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  rows="5"
                  placeholder="Tell us about your need (blood type, location, hospital) or your interest to donate."
                  className="w-full rounded-xl border border-gray-200 focus:border-[#68F432] focus:ring-2 focus:ring-[#BBFC72] px-4 py-3 outline-none bg-white resize-none"
                />
                <p className="mt-2 text-xs text-gray-500">We’ll respond within a few hours.</p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-xl bg-[#68F432] hover:bg-[#58d22b] text-white font-semibold shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#BBFC72]"
                >
                  Submit Form
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact