import React from 'react';
import Header from '../components/Header';
import About from '../pages//About';
import Navbar from '../components/Navbar';
import Testimonial from './Testimonial';
import Contact from './Contact';
import Footer from '../components/Footer';

const Home = ({ scrollToSection }) => {
  return (
    <div className='flex flex-col items-center z-20 justify-center min-h-screen font-sans bg-[url("/bg_img.png")] bg-repeat bg-center relative overflow-x-hidden'>
      <Navbar scrollToSection={scrollToSection} />

      <section id="home" className="w-full flex items-center justify-center py-2">
        <Header />
      </section>

      <section id="about" className="w-full pt-20 pb-5 flex items-center justify-center">
        <About />
      </section>

      <section id="testimonials" className="w-full pt-20 flex items-center justify-center">
        <Testimonial />
      </section>

      <section id="contact" className="w-full py-20 flex items-center justify-center">
        <Contact />
      </section>

      <Footer scrollToSection={scrollToSection}/>
    </div>
  );
};

export default Home;