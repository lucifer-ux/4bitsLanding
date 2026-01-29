import { useEffect, useState, useRef } from 'react';
// (react-globe.gl not used when embedding official example)
import { motion } from 'framer-motion';
// (three removed after migrating to globe.gl)

// Razorpay Payment Handler (Simple Frontend Only)
const openRazorpayCheckout = (amount: number, currency: string = 'INR') => {
  const razorpayKeyId = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID;

  if (!razorpayKeyId) {
    alert('Razorpay key ID not configured.');
    return;
  }

  try {
    const options = {
      key: razorpayKeyId,
      amount: amount * 100,
      currency: currency,
      name: '4bits',
      description: 'Preorder - 4bits Storage Device',
      handler: function (response: any) {
        console.log('Payment success:', response);
        alert('Payment successful!');
      },
      theme: { color: '#3399cc' }
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  } catch (error) {
    console.error('Payment failed:', error);
  }
};


// 3D Glassy Button Component
function GlassyButton({ size = 'large' }: { size?: 'large' | 'small' }) {
  const [isClicked, setIsClicked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    openRazorpayCheckout(4);
    setTimeout(() => setIsClicked(false), 1000);
  };

  const isSmall = size === 'small';
  const buttonStyles = isSmall ? {
    borderRadius: '30px 10px 30px 10px',
    padding: '10px 30px',
    fontSize: '16px',
    minWidth: '140px',
    height: '45px'
  } : {
    borderRadius: '60px 20px 60px 20px',
    padding: '20px 60px',
    fontSize: '20px',
    minWidth: '280px',
    height: '70px'
  };

  return (
    <motion.button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden cursor-pointer"
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(25px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: buttonStyles.borderRadius,
        padding: buttonStyles.padding,
        fontSize: buttonStyles.fontSize,
        fontWeight: 'bold',
        color: 'white',
        textShadow: '0 0 15px rgba(255, 255, 255, 0.6)',
        boxShadow: `0 15px 40px rgba(0, 0, 0, 0.4)`,
        zIndex: 50,
        pointerEvents: 'auto'
      }}
      animate={{
        scale: isClicked ? 0.9 : isHovered ? 1.02 : 1,
      }}
    >
      <span className="relative z-10 flex items-center justify-center">preorder</span>
    </motion.button>
  );
}

// Header Component
function Header() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4">
      <motion.img
        src="/4bits_without_bg.png"
        alt="4bits"
        className="w-40 h-20"
      />
      <GlassyButton size="small" />
    </div>
  );
}



// Custom Mouse Cursor with bubble effect - Mobile optimized
function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  // no visibility gating; always render on desktop
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if device is mobile/touch
    const checkIsMobile = () => {
      return window.innerWidth <= 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };

    setIsMobile(checkIsMobile());

    // Don't show custom cursor on mobile devices
    if (checkIsMobile()) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => { };

    const handleMouseEnter = () => { };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  // Always render (desktop); hide on mobile
  if (isMobile) return null;

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: mousePosition.x,
        top: mousePosition.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Main cursor circle with bubble effect */}
      <motion.div
        className="relative"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Outer bubble ring */}
        <motion.div
          className="absolute inset-0 w-16 h-16 rounded-full border-2 border-white/30 bg-white/5"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Middle bubble ring */}
        <motion.div
          className="absolute inset-2 w-12 h-12 rounded-full border border-blue-400/40 bg-blue-400/10"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3
          }}
        />

        {/* Inner cursor circle */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400/20 to-green-400/20 border border-white/50 backdrop-blur-sm flex items-center justify-center">
          <motion.div
            className="w-4 h-4 rounded-full bg-white/50"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Sparkle effects */}
        <motion.div
          className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full"
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        <motion.div
          className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-300 rounded-full"
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </motion.div>
    </div>
  );
}

// Blue ocean sphere base
// (Old OceanSphere removed)

// Ultra-dense Earth landmass particles with realistic geography
// (Removed unused Three/R3F remnants after migrating to globe.gl)

// Green storage nodes specifically placed in India
// (Removed unused Three/R3F remnants after migrating to globe.gl)

// (Old Three.js EarthScene removed after migrating to globe.gl)


// Memory Panel Component with manual navigation
// (Old MemoryPanel removed)

function InteractiveEarthWebsite() {

  // Simplified state (UI overlays removed)
  const [typewriterText, setTypewriterText] = useState('');
  const fullText = "Own Your Storage";

  // Parallax state
  const [parallaxProgress, setParallaxProgress] = useState(0); // 0 -> 1 across designed scroll range
  const [freeMode] = useState(false); // when true, allow full globe interaction
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  // Removed firstReady logic - step system handles all timing
  const [viewportH, setViewportH] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);

  // Step scroll state
  const [currentStep, setCurrentStep] = useState(0);
  const scrollTimeoutRef = useRef<number | null>(null);
  const isScrollingRef = useRef(false);

  // Horizontal scroll state for globe interaction
  const [globeRotation, setGlobeRotation] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    const onResize = () => setViewportH(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Step scroll system - 5 distinct steps (0-4)
  const totalSteps = 5;
  const stepHeight = viewportH;

  // Step system working correctly

  // Initialize scroll position on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    setCurrentStep(0);
    setParallaxProgress(0);
  }, []);

  // Update scroll position when currentStep changes (for TypeScript)
  useEffect(() => {
    // This effect ensures currentStep is "used" to satisfy TypeScript
    // The actual scroll handling is done in the wheel event handler
  }, [currentStep]);

  useEffect(() => {
    const handleStepScroll = (e: WheelEvent) => {
      // Prevent default scroll behavior
      e.preventDefault();

      // Add debouncing to prevent rapid scrolling
      if (isScrollingRef.current) return;

      isScrollingRef.current = true;

      // Get current step from state at the time of the event
      setCurrentStep(currentStep => {
        if (e.deltaY > 0 && currentStep < totalSteps - 1) {
          // Scroll down to next step
          const nextStep = currentStep + 1;
          setParallaxProgress(nextStep / (totalSteps - 1));

          window.scrollTo({
            top: nextStep * stepHeight,
            behavior: 'smooth'
          });

          return nextStep;
        } else if (e.deltaY < 0 && currentStep > 0) {
          // Scroll up to previous step
          const prevStep = currentStep - 1;
          setParallaxProgress(prevStep / (totalSteps - 1));

          window.scrollTo({
            top: prevStep * stepHeight,
            behavior: 'smooth'
          });

          return prevStep;
        }
        return currentStep;
      });

      // Reset scrolling state after animation completes
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = window.setTimeout(() => {
        isScrollingRef.current = false;
      }, 600);
    };

    window.addEventListener('wheel', handleStepScroll, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleStepScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [viewportH, totalSteps, stepHeight]);

  // Mobile touch step scroll handler - enhanced
  useEffect(() => {
    let touchStartY = 0;
    let touchStartTime = 0;
    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      touchStartTime = Date.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent default to avoid page scrolling
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndTime = Date.now();
      const deltaY = touchStartY - touchEndY;
      const deltaX = touchStartX - touchEndX;
      const deltaTime = touchEndTime - touchStartTime;

      // Check if it's primarily vertical movement
      if (Math.abs(deltaY) > Math.abs(deltaX) && deltaTime < 1000 && Math.abs(deltaY) > 20) {
        if (isScrollingRef.current) return;

        isScrollingRef.current = true;

        setCurrentStep(currentStep => {
          if (deltaY > 0 && currentStep < totalSteps - 1) {
            // Swipe up (scroll down)
            const nextStep = currentStep + 1;
            setParallaxProgress(nextStep / (totalSteps - 1));
            window.scrollTo({
              top: nextStep * stepHeight,
              behavior: 'smooth'
            });
            return nextStep;
          } else if (deltaY < 0 && currentStep > 0) {
            // Swipe down (scroll up)
            const prevStep = currentStep - 1;
            setParallaxProgress(prevStep / (totalSteps - 1));
            window.scrollTo({
              top: prevStep * stepHeight,
              behavior: 'smooth'
            });
            return prevStep;
          }
          return currentStep;
        });

        // Reset scrolling state after animation completes
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = window.setTimeout(() => {
          isScrollingRef.current = false;
        }, 600);
      }
    };

    // Add touch events to document for better capture
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [viewportH, totalSteps, stepHeight]);

  // Smooth horizontal scroll detection for globe interaction
  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    let isDragging = false;
    let animationFrame: number | null = null;
    let rotationAccumulator = 0;

    const handleWheel = (e: WheelEvent) => {
      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);

      // Only handle horizontal scrolling if we're not in the middle of step scrolling
      if (isHorizontal) {
        e.preventDefault();

        // Accumulate rotation for smooth movement
        rotationAccumulator += e.deltaX * 0.5;

        // Update rotation smoothly
        setGlobeRotation(prev => ({
          lat: prev.lat,
          lng: prev.lng + e.deltaX * 0.5
        }));

        // Clear any existing timeout
        if (animationFrame) clearTimeout(animationFrame);
        animationFrame = window.setTimeout(() => {
          // Rotation timeout - no state update needed
        }, 200);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
        isDragging = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const deltaX = currentX - lastX;
        const deltaY = currentY - lastY;

        // Check if it's primarily horizontal movement
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
          e.preventDefault();
          isDragging = true;

          // Smooth rotation based on touch movement
          const rotationDelta = deltaX * 0.3;
          setGlobeRotation(prev => ({
            lat: prev.lat,
            lng: prev.lng + rotationDelta
          }));

          lastX = currentX;
          lastY = currentY;
        }
      }
    };

    const handleTouchEnd = () => {
      if (isDragging) {
        if (animationFrame) clearTimeout(animationFrame);
        animationFrame = window.setTimeout(() => {
          // Touch end timeout - no state update needed
        }, 200);
      }
    };

    // Add event listeners
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      if (animationFrame) clearTimeout(animationFrame);
    };
  }, []);

  // Communicate rotation data to embedded globe
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage({
          type: 'GLOBE_ROTATION',
          rotation: globeRotation
        }, '*');
      } catch (error) {
        // Silently handle cross-origin issues
      }
    }
  }, [globeRotation]);

  // Remove firstReady logic - step system handles all timing

  // (controls logic removed when using embedded satellites example)

  // Scales: base 1 -> max ~3.0, then gently back to ~2.4 as it exits
  const MAX_SCALE = 3.0;
  const EXIT_SCALE = 2.4;
  const calcScale = (p: number) => {
    if (p <= 0.25) {
      const t = p / 0.25; // 0..1
      return 1 + t * (MAX_SCALE - 1); // 1 -> MAX_SCALE
    } else if (p <= 0.7) {
      const t = (p - 0.25) / 0.45; // 0..1
      return MAX_SCALE - t * (MAX_SCALE - EXIT_SCALE); // MAX -> EXIT_SCALE
    }
    return EXIT_SCALE;
  };

  const globeTransform = () => {
    const p = parallaxProgress;
    const scale = calcScale(p);

    let translateY = 0;
    if (p <= 0.25) {
      translateY = 0;
    } else if (p <= 0.7) {
      const t = (p - 0.25) / 0.45;
      translateY = -t * (viewportH * 1.2);
    } else {
      translateY = -viewportH * 1.2;
    }

    return `translateY(${translateY}px) scale(${scale})`;
  };

  // Stage triggers based on scroll progress directly to ensure late stages are reachable
  const currentScale = calcScale(parallaxProgress);
  const zoomThreshold = 1.5; // start text when zoomed-in notably
  // Use parallaxProgress as the stage driver for text sequence (0..1)
  const stageBase = parallaxProgress;
  // All texts now use smoothBox timing for strict sequential rendering
  // No latching needed - each text appears and disappears based on its window timing

  // Crossfade helper to show only one message at a time as we scroll
  // Non-overlapping smooth box window so only one message is visible at a time
  const smoothBox = (start: number, end: number, fade = 0.04, stayVisible = false) => {
    // Ensure non-overlap by using distinct [start,end] per message
    const a = start;
    const b = start + fade;
    const c = end - fade;
    const d = end;

    // Special case for elements that should stay visible once shown
    if (stayVisible && stageBase >= a) return 1;

    if (stageBase <= a || stageBase >= d) return 0;
    if (stageBase < b) return (stageBase - a) / (b - a);
    if (stageBase > c) return (d - stageBase) / (d - c);
    return 1;
  };

  // Define step-based windows (each step gets its own section)
  const W1: [number, number] = [0.2, 0.4]; // Step 1: 400 million terabytes
  const W2: [number, number] = [0.4, 0.6]; // Step 2: Receipt popup
  const W3: [number, number] = [0.6, 0.8]; // Step 3: They can delete account
  const W4: [number, number] = [0.8, 1.0]; // Step 4: Combined section (all stay visible)

  // Step system working correctly

  // Mobile gesture routing: vertical swipes scroll page; horizontal/diagonal drags control globe
  const [allowGlobeTouch, setAllowGlobeTouch] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const decisionMadeRef = useRef(false);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
    decisionMadeRef.current = false;
    setAllowGlobeTouch(false);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || decisionMadeRef.current) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    const threshold = 8;
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;
    decisionMadeRef.current = true;
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal intent → pass through to globe iframe
      setAllowGlobeTouch(true);
    } else {
      // Vertical intent → handle step scrolling
      setAllowGlobeTouch(false);
      e.preventDefault(); // Prevent default scroll

      if (isScrollingRef.current) return;

      isScrollingRef.current = true;

      setCurrentStep(currentStep => {
        if (dy > 30 && currentStep < totalSteps - 1) {
          // Swipe down
          const nextStep = currentStep + 1;
          setParallaxProgress(nextStep / (totalSteps - 1));

          window.scrollTo({
            top: nextStep * stepHeight,
            behavior: 'smooth'
          });
          return nextStep;
        } else if (dy < -30 && currentStep > 0) {
          // Swipe up
          const prevStep = currentStep - 1;
          setParallaxProgress(prevStep / (totalSteps - 1));

          window.scrollTo({
            top: prevStep * stepHeight,
            behavior: 'smooth'
          });
          return prevStep;
        }
        return currentStep;
      });

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = window.setTimeout(() => {
        isScrollingRef.current = false;
      }, 600);
    }
  };
  const onTouchEnd = () => {
    touchStartRef.current = null;
    decisionMadeRef.current = false;
    setAllowGlobeTouch(false);
  };

  // Billing follows same appear/disappear logic shape as headline (no latching)

  // Smooth fade-out for globe around threshold instead of abrupt hide
  const FADE_START = zoomThreshold;           // begin fading at threshold
  const FADE_END = zoomThreshold + 0.35;      // longer fade window
  const MIN_OPACITY = 0.25;                   // keep globe slightly visible
  const globeOpacity = (() => {
    if (currentScale <= FADE_START) return 1;
    if (currentScale >= FADE_END) return MIN_OPACITY;
    const t = (currentScale - FADE_START) / (FADE_END - FADE_START);
    return 1 - t * (1 - MIN_OPACITY);
  })();

  // Emit-arc behavior adapted from globe.gl example
  // (emit arcs removed)

  // Ensure full text is always shown after a certain time or scroll
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typewriterText.length < fullText.length) {
        setTypewriterText(fullText);
      }
    }, 3000); // Show full text after 3 seconds regardless of scroll

    return () => clearTimeout(timer);
  }, [typewriterText.length, fullText]);

  // (no custom position updater)

  // Manual sync removed


  // Extra scroll handlers removed

  // (explore handlers removed)

  // (Old R3F node click handler removed)

  // (old next/prev handlers removed)

  // (old next/prev handlers removed)


  return (
    <div
      className="relative w-full cursor-none sm:cursor-none"
      style={{
        height: `${viewportH * totalSteps}px`, // exact height for step scrolling
        touchAction: 'auto',
        overscrollBehavior: 'none',
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth',
        willChange: 'scroll-position'
      }}
    >
      {/* Globe.gl implementation (replacing previous Canvas-based globe) */}
      <div
        className="fixed top-0 left-0 w-full h-screen"
        style={{
          // Allow page to handle vertical swipes (pan-y); gesture overlay below decides when to enable globe interaction
          pointerEvents: globeOpacity > 0.05 ? 'auto' : 'none',
          touchAction: 'pan-y',
          transform: globeTransform(),
          transformOrigin: 'center center',
          transition: 'transform 300ms ease-out, opacity 300ms ease-out',
          opacity: globeOpacity,
          visibility: globeOpacity < 0.01 ? 'hidden' : 'visible'
        }}
      >
        <iframe
          title="Satellites Globe"
          src={"/satellites/index.html"}
          ref={iframeRef}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: (allowGlobeTouch || freeMode) ? 'auto' : 'none'
          }}
          allowFullScreen
        />
        {/* Starry background overlay to restyle the embedded globe's backdrop */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: "url('//unpkg.com/three-globe/example/img/night-sky.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.6,
            mixBlendMode: 'screen',
            zIndex: 2,
            pointerEvents: 'none'
          }}
        />

        {/* Gesture router: detects intent; lets horizontal/diagonal drags reach the globe, vertical drags scroll page */}
        {!freeMode && (
          <div
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 3,
              background: 'transparent',
              // Allow clicks to pass through to buttons
              pointerEvents: 'none'
            }}
          />
        )}
        {/* No extra overlays needed; timer removed in self-hosted page */}
        {/* Removed bottom-right mask */}
      </div>

      {/* Parallax overlay: messages crossfade one at a time */}
      <div className="fixed top-0 left-0 w-full h-screen pointer-events-none z-10 flex items-center justify-center">
        <div className="w-full flex flex-col items-center justify-center px-4">
          {/* Step 1: 400 million terabytes */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: smoothBox(W1[0], W1[1]), y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-white text-2xl sm:text-3xl md:text-5xl font-black text-center max-w-[90%] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] absolute"
          >
            400 million terabytes created today. You own none of it.
          </motion.div>

          {/* Step 2: Receipt popup - positioned differently */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: smoothBox(W2[0], W2[1]), y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full flex justify-center"
            style={{ position: 'relative', top: '0px' }}
          >
            <BillingReceipt opacity={smoothBox(W2[0], W2[1])} />
          </motion.div>

          {/* Step 3: They can delete account */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: smoothBox(W3[0], W3[1]), y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-white text-xl sm:text-2xl md:text-3xl font-black text-center max-w-[90%] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] absolute"
          >
            They can delete your account tomorrow. Raise prices next month. Disappear forever.
          </motion.div>

          {/* Step 4: Combined section - All three elements together */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: smoothBox(W4[0], W4[1], 0.04, true),
              y: 0,
              scale: 1
            }}
            transition={{
              duration: 0.4,
              ease: 'easeOut'
            }}
            className="absolute flex flex-col items-center gap-6"
          >
            {/* First text: Your photos your files your hardware , own everything you rent. */}
            <div className="text-white text-lg sm:text-xl md:text-2xl font-semibold text-center max-w-[90%] drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              Your photos, your files, your hardware , own everything you rent.
            </div>

            {/* OWN YOUR MEMORY text */}
            <div
              className="text-2xl sm:text-3xl md:text-4xl font-black text-center tracking-wider max-w-[90%] px-4 relative"
              style={{
                color: '#7AF6D8',
                textShadow: '0 0 8px rgba(122, 246, 216, 0.6)',
                filter: 'none'
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-100%', '100%'],
                  opacity: [0, 0.8, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: 'easeInOut'
                }}
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  transform: 'skewX(-20deg)',
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none' // Allow clicks to pass through
                }}
              />
              <span className="relative z-10">OWN YOUR MEMORY</span>
            </div>

            {/* Preorder button */}
            <GlassyButton />
          </motion.div>
        </div>
      </div>

      {/* Header with Logo and Preorder Button */}
      <Header />

      {/* Custom Mouse Cursor */}
      <CustomCursor />

      {/* Always-visible bottom bar with T&C/Privacy */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-16px)] sm:w-auto flex items-center gap-4 justify-center pointer-events-auto">
        <a
          href="/4bits Terms and Conditions.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/70 hover:text-white transition-colors underline text-xs sm:text-sm"
        >
          Terms & Conditions
        </a>
        <a
          href="/4bits Privacy Policy.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/70 hover:text-white transition-colors underline text-xs sm:text-sm"
        >
          Privacy Policy
        </a>
      </div>
    </div>
  );
}

export default InteractiveEarthWebsite;

function BillingReceipt({ opacity }: { opacity: number }) {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [years, setYears] = useState(20); // service duration in years

  const pricePerMonth = currency === 'INR' ? 650 : 10; // per spec (monthly)
  const total = pricePerMonth * 12 * years; // yearly calc

  const fmt = (v: number) => currency === 'INR'
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(v)
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(v);

  return (
    <div
      className="pointer-events-auto w-[92%] sm:w-[80%] md:w-[640px]"
      style={{ opacity }}
    >
      <div
        className="relative mx-auto rounded-2xl border border-white/10 bg-[rgba(10,12,20,0.85)] backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.6)] px-6 py-4 sm:px-8 sm:py-6"
        style={{ transform: `translateZ(0)` }}
      >
        <div className="text-center text-white/90 font-mono text-sm tracking-widest mb-4">
          —— CLOUD STORAGE RECEIPT ——
        </div>
        <div className="h-px w-full bg-white/10" />

        <div className="mt-4 grid grid-cols-2 gap-2 text-[13px] text-white/80 font-mono">
          <div>Service Duration:</div>
          <div className="text-right"><span className="text-white">{years}</span> years</div>
          <div>Monthly Payment:</div>
          <div className="text-right">{fmt(pricePerMonth)}</div>
        </div>

        <div className="my-4 h-px w-full bg-white/10" />
        <div className="grid grid-cols-2 gap-2 text-[14px] font-mono">
          <div className="text-white/80 tracking-wide">TOTAL PAID:</div>
          <div className="text-right text-[#ff6666] font-bold">{fmt(total)}</div>
        </div>

        <div className="my-4 h-px w-full bg-white/10" />
        <div className="grid grid-cols-2 gap-2 font-mono text-[13px]">
          <div className="text-white/70">YOUR OWNERSHIP:</div>
          <div className="text-right text-white">{fmt(0)}</div>
          <div className="text-white/70">THEIR OWNERSHIP:</div>
          <div className="text-right text-[#ff6b6b] font-extrabold">EVERYTHING</div>
        </div>

        <div className="mt-6 text-center text-white/60 text-[12px] font-mono">
          Thank you for renting your memories from us
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-between gap-3 text-white/80 text-sm">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-3 py-1 rounded-md border ${currency === 'INR' ? 'bg-white/15 border-white/30 text-white' : 'border-white/10 text-white/70 hover:bg-white/10'}`}
            >INR</button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 rounded-md border ${currency === 'USD' ? 'bg-white/15 border-white/30 text-white' : 'border-white/10 text-white/70 hover:bg-white/10'}`}
            >USD</button>
          </div>
          <div className="font-mono text-white/80">Adjust duration</div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-white/60 text-xs font-mono">1 year</span>
          <input
            type="range"
            min={1}
            max={50}
            step={1}
            value={years}
            onChange={(e) => setYears(parseInt(e.target.value))}
            className="flex-1 accent-[#7AF6D8] h-2 rounded-lg bg-white/10"
          />
          <span className="text-white/60 text-xs font-mono">50 years</span>
        </div>
        <div className="mt-2 text-right text-white/80 text-sm font-mono">
          {years} years
        </div>

      </div>
    </div>
  );
}
