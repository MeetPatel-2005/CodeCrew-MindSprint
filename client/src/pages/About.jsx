import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../index.css";
import b1 from "../assets/b1.jpg";
import b2 from "../assets/b2.jpg";
import b3 from "../assets/b3.jpg";
import arrow from "../assets/arrow_icon.svg";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const About = () => {
  // Refs for animation elements
  const titleRef = useRef(null);
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);
  const decorativeLineRef = useRef(null);

  useEffect(() => {
    // Title animation
    gsap.fromTo(
      titleRef.current,
      { 
        y: 100, 
        opacity: 0,
        scale: 0.8
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // First section animation (About Our Donors)
    gsap.fromTo(
      section1Ref.current.children,
      { 
        x: -100, 
        opacity: 0 
      },
      {
        x: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.3,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section1Ref.current,
          start: "top 75%",
          end: "bottom 25%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Second section animation (For Patients)
    gsap.fromTo(
      section2Ref.current.children,
      { 
        x: 100, 
        opacity: 0 
      },
      {
        x: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.3,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section2Ref.current,
          start: "top 75%",
          end: "bottom 25%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Decorative line animation
    gsap.fromTo(
      decorativeLineRef.current,
      { 
        scaleX: 0,
        transformOrigin: "left center"
      },
      {
        scaleX: 1,
        duration: 1.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: decorativeLineRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Third section animation (Blood Donation Process)
    gsap.fromTo(
      section3Ref.current.children,
      { 
        y: 100, 
        opacity: 0 
      },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section3Ref.current,
          start: "top 75%",
          end: "bottom 25%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="max-w-7xl h-auto mx-auto px-4 p-8 sm:px-6 lg:px-8 ">
      <h1 ref={titleRef} className="text-[6rem] relative font-bold text-center text-zinc-800 mb-12 font-[Alice]">
        "Every Drop, Every Life"
        <div className="absolute z-10 top-[70%] left-[-15%]">
          <svg
            width="1500"
            height="105"
            viewBox="0 0 399 35"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M65 15C217.667 5.33332 486 -7.52779 367 8.99999C223 29 79.3333 28 16 23C5.00001 25 -10.4 29.8 16 33C42.4 36.2 283.333 29.3333 398 28"
              stroke="#68F432"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
      </h1>
      {/* First Section */}
      <section ref={section1Ref} className="flex flex-col z-4 md:flex-row items-center gap-8 mb-16">
        <div className="w-full md:w-1/2 rounded-xl overflow-hidden shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)] hover:scale-[1.01] transition-all">
          <img
            src={b1}
            alt="Blood Donation Process"
            className="w-full h-[30rem] object-cover"
          />
        </div>
        <div className="w-full md:w-1/2 p-4 z-5">
          <h2 className="text-5xl font-bold text-gray-800 mb-6 font-[Alice]">
            About Our Donors
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-5">
            Our dedicated blood donors form the backbone of our life-saving
            mission. They contribute to maintaining a stable and safe blood
            supply, helping thousands of patients in need. Through our
            streamlined donation process, we ensure a comfortable and efficient
            experience for every donor.
          </p>
          <Link
            to="/login"
            className="flex items-center justify-center w-[9rem] gap-2 px-3 py-3 border border-[#68F432] rounded-full bg-[#68F432] hover:bg-white transition-all"
          >
            <img src={arrow} alt="" srcset="" className="h-4 w-4" /> Donate Now
          </Link>
        </div>
      </section>

      {/* Second Section */}
      <section ref={section2Ref} className="relative flex flex-col md:flex-row-reverse items-center gap-8 mb-16">
        <div className="w-full md:w-1/2 rounded-xl shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)] hover:scale-[1.01] transition-all">
          <img
            src={b2}
            alt="Patient Care"
            className="w-full h-[30rem] object-cover rounded-lg shadow-lg"
          />
        </div>
        <div className="w-full md:w-1/2 p-4">
          <h2 className="text-5xl font-bold text-gray-800 mb-6 font-[Alice]">
            For Patients
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-5">
            We understand the critical nature of blood requirements for
            patients. Our platform ensures quick access to verified blood
            donors, maintaining the highest standards of safety and reliability.
            We work closely with healthcare providers to deliver timely support
            to those in need.
          </p>
          <Link
            to="/login"
            className="flex items-center justify-center w-[10rem] gap-2 px-3 py-3 border border-[#68F432] rounded-full bg-[#68F432] hover:bg-white transition-all"
          >
            <img src={arrow} alt="" srcset="" className="h-4 w-4" /> Request
            Blood
          </Link>
        </div>
      </section>

      <div className="-rotate-12 top-[41.5%] -left-8 absolute">
        <svg
          width="2000"
          height="60"
          viewBox="0 0 174 1"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line y1="0.5" x2="174" y2="0.5" stroke="#68F432" strokeWidth={5}/>
        </svg>
      </div>

      {/* Third Section */}
      <section ref={section3Ref} className="z-40 relative flex flex-col md:flex-row items-center gap-8">
        <div className="w-full rounded-xl md:w-1/2 shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)] hover:scale-[1.01] transition-all">
          <img
            src={b3}
            alt="Donation Process"
            className="w-full h-[30rem] object-cover rounded-lg shadow-lg"
          />
        </div>
        <div className="w-full md:w-1/2 p-4">
          <h2 className="text-5xl font-bold text-gray-800 mb-6 font-[Alice]">
            Blood Donation Process
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-5">
            Our blood donation process is designed to be simple, safe, and
            efficient. From registration to post-donation care, we follow strict
            medical protocols to ensure the safety of both donors and
            recipients. Join us in our mission to save lives through voluntary
            blood donation.
          </p>
          <Link
            to="/login"
            className="flex items-center justify-center w-[7rem] gap-2 px-3 py-3 border border-[#68F432] rounded-full bg-[#68F432] hover:bg-white transition-all"
          >
            <img src={arrow} alt="" srcset="" className="h-4 w-4" /> Join Us
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
