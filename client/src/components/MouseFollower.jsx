import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const MouseFollower = ({
  size = 20,
  color = "blue",
  duration = 0.3,
  ease = "power3.out",
  borderRadius = "50%",
  opacity = 1,
  zIndex = 5000,
  skew = true,
  rotate = true,
  blendMode = "normal",
  hoverScale = 1.5, // default
}) => {
  const followerRef = useRef(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const resetTimeout = useRef(null);

  useEffect(() => {
    const xTo = gsap.quickTo(followerRef.current, "x", { duration, ease });
    const yTo = gsap.quickTo(followerRef.current, "y", { duration, ease });

    const handleMouseMove = (e) => {
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };

      xTo(e.clientX);
      yTo(e.clientY);

      // Skew & rotate
      if (skew || rotate) {
        gsap.to(followerRef.current, {
          skewX: skew ? dx * 0.2 : 0,
          skewY: skew ? dy * 0.2 : 0,
          rotation: rotate ? dx * 0.1 : 0,
          duration: 0.2,
          ease: "power2.out",
        });

        clearTimeout(resetTimeout.current);
        resetTimeout.current = setTimeout(() => {
          gsap.to(followerRef.current, {
            skewX: 0,
            skewY: 0,
            rotation: 0,
            duration: 0.6,
            ease: "elastic.out(1, 0.4)",
          });
        }, 100);
      }
    };

    // Hover scale effect
    const handleHoverEnter = () => {
      gsap.to(followerRef.current, {
        scale: hoverScale,
        duration: 0.3,
        ease: "power3.out",
      });
    };

    const handleHoverLeave = () => {
      gsap.to(followerRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "power3.out",
      });
    };

    // Attach hover to interactive elements
    document.querySelectorAll("a, button, h1, h2, h3").forEach((el) => {
      el.addEventListener("mouseenter", handleHoverEnter);
      el.addEventListener("mouseleave", handleHoverLeave);
    });

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.querySelectorAll("a, button, h1, h2, h3").forEach((el) => {
        el.removeEventListener("mouseenter", handleHoverEnter);
        el.removeEventListener("mouseleave", handleHoverLeave);
      });
      clearTimeout(resetTimeout.current);
    };
  }, [duration, ease, skew, rotate, hoverScale]);

  return (
    <div
      ref={followerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius,
        pointerEvents: "none",
        opacity,
        zIndex,
        mixBlendMode: blendMode,
        transform: "translate(-50%, -50%)",
      }}
    />
  );
};

export default MouseFollower;
