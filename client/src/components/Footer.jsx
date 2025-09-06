import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiPhone, HiGlobeAlt } from 'react-icons/hi'
import { MdLocationOn } from 'react-icons/md'

const Footer = ({scrollToSection}) => {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e) => {
    e.preventDefault()
    // Handle subscription logic here
    console.log('Subscribed:', email)
    setEmail('')
  }

  return (
    <footer className="bg-gray-900 text-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#68F432]">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link onClick={() => scrollToSection("home")}  className="text-gray-300 hover:text-[#68F432] transition-colors">Home</Link></li>
              <li><Link onClick={() => scrollToSection("about")} className="text-gray-300 hover:text-[#68F432] transition-colors">About</Link></li>
              <li><Link onClick={() => scrollToSection("testimonials")} className="text-gray-300 hover:text-[#68F432] transition-colors">Testimonials</Link></li>
              <li><Link onClick={() => scrollToSection("contact")} className="text-gray-300 hover:text-[#68F432] transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Connect With Us */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#68F432]">Connect With Us</h3>
            <ul className="space-y-2">
              <li className="text-gray-300 flex items-center gap-2">
                <MdLocationOn className="text-[#68F432] text-2xl" />
                Blood Donation Centers, City Hospital District
              </li>
              <li className="text-gray-300 flex items-center gap-2">
                <HiPhone className="text-[#68F432] text-lg" />
                +91 1800-BLOOD-HELP
              </li>
              <li className="text-gray-300 flex items-center gap-2">
                <HiGlobeAlt className="text-[#68F432] text-lg" />
                www.lifeline.org
              </li>
            </ul>
          </div>

          {/* Blood Donation Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#68F432]">Blood Donation</h3>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-gray-300 hover:text-[#68F432] transition-colors">Be a Donor</Link></li>
              <li><Link to="/login" className="text-gray-300 hover:text-[#68F432] transition-colors">Request Blood</Link></li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#68F432]">Stay Updated</h3>
            <p className="text-gray-300 mb-4 text-sm">
              Get the latest news about blood donation drives, emergency requests, and health tips.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-[#68F432] focus:ring-1 focus:ring-[#68F432] outline-none"
              />
              <button
                type="submit"
                className="w-full bg-[#68F432] hover:bg-[#58d22b] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="text-center">
            <div className="text-gray-400 text-sm">
              © 2024 BloodConnect. All rights reserved. | Saving lives, one donation at a time.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer