import React, { useEffect, useState } from "react";
import gsap from "gsap";

const Loader = ({ itemsToLoad, onComplete }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (itemsToLoad === 0) return;

    let loaded = 0;
    let progress = { val: 0 };

    const updateProgress = () => {
      loaded += 1;
      const target = Math.floor((loaded / itemsToLoad) * 100);

      gsap.to(progress, {
        val: target,
        duration: 0.6,
        ease: "power2.out",
        onUpdate: () => setCount(Math.floor(progress.val)),
        onComplete: () => {
          if (target === 100) {
            // ✅ Only animate overlay up
            gsap.to(".loader-overlay", {
              y: "-100%",
              duration: 1,
              ease: "power4.inOut",
              onComplete, // notify parent
            });
          }
        },
      });
    };

    window.dispatchLoaderProgress = updateProgress;

    return () => {
      delete window.dispatchLoaderProgress;
    };
  }, [itemsToLoad, onComplete]);

  return (
    <div className="loader-overlay fixed top-0 left-0 w-full h-screen bg-[#68F432] text-white flex items-center justify-center flex-col z-[9999]">
      <h1 className="text-9xl font-[Montserrat] tracking-tighter font-bold">{count}%</h1>
    </div>
  );
};

export default Loader;
