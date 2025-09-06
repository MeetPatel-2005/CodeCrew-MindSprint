import React from 'react';
import Header from '../components/Header';
import About from '../pages//About';
import Navbar from '../components/Navbar';
import Testimonial from './Testimonial';
import Contact from './Contact';
import Footer from '../components/Footer';

const Home = ({ scrollToSection }) => {
  return (
    <div className='flex flex-col items-center z-20 justify-center min-h-screen font-sans bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-x-hidden'>
      {/* Background pattern overlay */}
      <div className="absolute inset-0 bg-[url('/bg_img.png')] bg-repeat bg-center opacity-5"></div>
      
      <Navbar scrollToSection={scrollToSection} />

      {/* Hero Section */}
      <section id="home" className="w-full flex items-center justify-center py-8 sm:py-12 relative z-10">
        <Header />
      </section>

      {/* About Section */}
      <section id="about" className="w-full pt-16 sm:pt-20 pb-8 sm:pb-12 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <About />
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="w-full pt-16 sm:pt-20 pb-8 sm:pb-12 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm">
        <Testimonial />
      </section>

      {/* Contact Section */}
      <section id="contact" className="w-full py-16 sm:py-20 flex items-center justify-center bg-white/90 backdrop-blur-sm">
        <Contact />
      </section>

      {/* Footer */}
      <Footer scrollToSection={scrollToSection}/>
    </div>
  );
};

export default Home;