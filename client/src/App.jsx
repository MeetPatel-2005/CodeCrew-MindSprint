import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import MouseFollower from './components/Mousefollower'
import Loader from './components/Loader'


const App = () => {
  const [loading, setLoading] = useState(true);
  const [itemsToLoad] = useState(3);

  // Simulate loading resources
  useEffect(() => {
    const fakeLoad = (time) =>
      setTimeout(() => window.dispatchLoaderProgress?.(), time);

    fakeLoad(800);
    fakeLoad(1500);
    fakeLoad(2200);
  }, []);

  // 🔹 Disable scroll while loader is active
  useEffect(() => {
    if (loading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [loading]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {loading && (
        <Loader
          itemsToLoad={itemsToLoad}
          onComplete={() => setLoading(false)}
        />
      )}

      {/* ✅ Content already rendered behind loader */}
      <div className="app-content relative">
        <MouseFollower
          size={30}
          color="#68F432"
          skew={false}
          rotate={true}
          hoverScale={2}
          blendMode="normal"
          opacity={0.4}
        />
        <ToastContainer position="top-right" autoClose={3000} />

        <Routes>
          <Route path='/' element={<Home scrollToSection={scrollToSection} />} />
          <Route path='/login' element={<Login />} />
          <Route path='/email-verify' element={<EmailVerify />} />
          <Route path='/reset-password' element={<ResetPassword />} />
        </Routes>
      </div>
    </>
  )
}

export default App;
