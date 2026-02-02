import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { ReactLenis } from "lenis/react";
import { Scene } from "./components/canvas/Scene";
import { InputForm } from "./components/canvas/InputForm";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import bitsLogo from "@/assets/white_logo.png";
import { PopupModal } from "react-calendly";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ============================================
// PREMIUM LANDING PAGE - Personal Storage Assistant
// Inspired by vibex.space - Persistent 3D Product
// Clean, Dark, Minimal Design
// ============================================

// Color Palette - Clean Dark Theme
const colors = {
  bgPrimary: "#000000",
  bgSecondary: "#0a0a0a",
  bgCard: "rgba(15, 15, 15, 0.95)",
  textPrimary: "#ffffff",
  textSecondary: "rgba(255, 255, 255, 0.7)",
  textMuted: "rgba(255, 255, 255, 0.4)",
  accent: "#ffffff",
  border: "rgba(255, 255, 255, 0.1)",
};

// Clean CTA Button
function CTAButton({
  text,
  variant = "primary",
  handleCtaButton,
}: {
  text: string;
  variant?: "primary" | "secondary";
  handleCtaButton?: () => void;
}) {
  const isPrimary = variant === "primary";

  return (
    <motion.button
      className="relative px-8 py-3.5 rounded-full font-medium text-base tracking-wide cursor-pointer pointer-events-auto"
      style={{
        background: isPrimary ? "#fff" : "transparent",
        color: isPrimary ? "#000" : colors.textPrimary,
        border: isPrimary ? "none" : `1px solid ${colors.border}`,
      }}
      onClick={handleCtaButton}
      whileHover={{
        scale: 1.02,
        background: isPrimary ? "#e8e8e8" : "rgba(255,255,255,0.05)",
      }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="flex items-center gap-2">
        {text}
        {isPrimary && <span>→</span>}
      </span>
    </motion.button>
  );
}

// Feature item
function FeatureItem({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="flex items-start gap-5 cursor-pointer pointer-events-auto"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200"
        style={{
          background: isHovered ? "rgba(255,255,255,0.1)" : "transparent",
          border: `1px solid ${isHovered ? "rgba(255,255,255,0.3)" : colors.border}`,
          color: isHovered ? colors.textPrimary : colors.textMuted,
        }}
      >
        {number}
      </div>

      <div>
        <h4
          className="text-3xl font-medium mb-2 transition-colors duration-200"
          style={{
            color: isHovered ? colors.textPrimary : colors.textSecondary,
          }}
        >
          {title}
        </h4>
        <p
          className="text-base leading-relaxed max-w-sm"
          style={{ color: "#f3dddd" }}
        >
          {description}
        </p>
      </div>
    </motion.div>
  );
}

// Spec item
function SpecItem({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <motion.div
      className="text-center py-8 px-4"
      style={{ borderRight: isLast ? "none" : `1px solid ${colors.border}` }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div
        className="text-2xl sm:text-3xl font-light mb-2"
        style={{ color: colors.textPrimary }}
      >
        {value}
      </div>
      <div
        className="text-xs uppercase tracking-widest"
        style={{ color: colors.textMuted }}
      >
        {label}
      </div>
    </motion.div>
  );
}

// Footer
function Footer() {
  return (
    <footer
      className="py-16 px-6 pointer-events-auto"
      style={{
        background: colors.bgPrimary,
        borderTop: `1px solid ${colors.border}`,
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          <img src={bitsLogo} alt="4bits" className="h-40 w-40" />

          <div
            className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs"
            style={{
              color: colors.textMuted,
            }}
          >
            <div className="flex gap-6">
              <a
                href="/4bits Terms and Conditions.pdf"
                target="_blank"
                className="hover:text-white text-2xl transition-colors cursor-pointer select-none"
              >
                Terms
              </a>
              <a
                href="/4bits Privacy Policy.pdf"
                target="_blank"
                className="hover:text-white text-2xl transition-colors cursor-pointer select-none"
              >
                Privacy
              </a>
            </div>
            <p className="text-base">© 2025 4bits</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Custom Color Palette
const productColors = [
  { name: "Matte Black", value: "#1a1a1a" },
  { name: "Titanium Silver", value: "#e2e2e2" },
  { name: "Deep Navy", value: "#172554" },
  { name: "Crimson", value: "#9f1239" },
];

export type LeadProps = 'existing' | 'new';

// Main Component
export default function NewDesignLanding() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isCalendlyVisible, setIsCalendlyVisible] = useState(false);
  const modelColor = productColors[0].value;
  const lenisRef = useRef<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [lead, setLead] = useState<{ email: string } | null>(null);
  const [leadSuccess, setLeadSuccess] = useState<LeadProps | null>(null);

  const handleCtaButton = () => {
    setIsCalendlyVisible(true);
  };

  const handleFormOpening = () => {
    setIsFormOpen(true);
  }

  const handleFormSubmit = async (values: { email: string }) => {
    try {
      const resp = await fetch('https://pengu1n-bot.peng1n.workers.dev/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      body: JSON.stringify(values),
      } 
    )
    console.log(resp, "responsee");
    if (resp.status === 200) setLeadSuccess('new');
    else if (resp.status === 401) setLeadSuccess('existing');

      setLead(values);
      console.log("Lead submitted:", lead);
    }
    catch (e) {
      console.error("Error submitting lead:", e);
    }
    
  }

  useEffect(() => {
    // Sync Lenis scroll with GSAP ScrollTrigger
    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000);
    };
    gsap.ticker.add(update);

    // Traveling CTA Animation
    const ctaAnim = gsap
      .timeline({
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          immediateRender: false,
        },
      })
      .to("#floating-cta", {
        top: "85vh",
        ease: "none",
      });

    // CTA Visibility
    ScrollTrigger.create({
      trigger: document.body,
      start: "10% top",
      onEnter: () => gsap.to("#floating-cta", { opacity: 1, duration: 0.5 }),
      onLeaveBack: () =>
        gsap.to("#floating-cta", { opacity: 0, duration: 0.5 }),
    });

    return () => {
      gsap.ticker.remove(update);
      ctaAnim.kill();
    };
  }, []);

  const handleScroll = (e: any) => {
    setScrollProgress(e.progress);
    ScrollTrigger.update();
  };

  // Clean up body styles - CRITICAL FOR MOBILE SCROLL
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "newdesign-page-overrides";
    style.textContent = `
            /* Restore native cursor */
            body {
                cursor: default !important;
            }

            /* Kill the star background */
            #root::before {
                content: none !important;
                display: none !important;
            }

            /* CRITICAL: Force scrollability on mobile */
            html, body {
                height: auto !important;
                min-height: 100vh !important;
                overflow-x: hidden !important;
                overflow-y: auto !important;
                -webkit-overflow-scrolling: touch !important;
                overscroll-behavior-y: none !important;
            }
            
            #root {
                min-height: 100vh !important;
                height: auto !important;
                overflow: visible !important;
            }
            
            /* Ensure Lenis doesn't lock scroll */
            html.lenis, html.lenis body {
                height: auto !important;
                overflow: visible !important;
            }

            /* Allow touch scrolling through canvas */
            canvas {
                touch-action: pan-y !important;
            }
        `;
    document.head.appendChild(style);

    // Direct manipulation
    document.body.style.overflow = "auto";
    document.body.style.height = "auto";
    document.documentElement.style.overflow = "auto";
    document.documentElement.style.height = "auto";

    return () => {
      const styleEl = document.getElementById("newdesign-page-overrides");
      if (styleEl) styleEl.remove();
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
    };
  }, []);

  return (
    <>
    <InputForm
        opened={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        messageToDisplay={leadSuccess}
    />
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        // CRITICAL: Disable smooth scroll on touch devices
        touchMultiplier: 0,
        infinite: false,
      }}
      className="lenis lenis-smooth"
      onScroll={handleScroll}
    >
      {/* 3D SCENE LAYER */}
      <Scene
        isInteracting={isInteracting}
        setInteraction={setIsInteracting}
        modelColor={modelColor}
      />

      <div
        className={`min-h-screen relative w-full ${isInteracting ? "select-none" : ""}`}
        style={{
          background: "#171717ff",
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
          // CRITICAL: Don't use pointer-events none on the main container
          pointerEvents: "auto",
        }}
      >
        {/* CONTENT LAYER */}
        <div className="relative z-10">
          {/* ==================== HERO SECTION ==================== */}
          <section
            id="section-hero"
            className="relative min-h-screen flex flex-col items-center justify-end pb-24 px-6 pointer-events-auto"
          >
            {/* Large background text */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
              style={{
                opacity: Math.max(0, 1 - scrollProgress * 4),
              }}
            >
              <h1
                className="text-[18vw] sm:text-[15vw] font-bold tracking-tighter whitespace-nowrap"
                style={{
                  color: "rgba(255, 255, 255, 0.3)",
                  fontWeight: 800,
                }}
              >
                4BITS
              </h1>
            </div>

            {/* Hero content */}
            <motion.div
              className="relative z-10 text-center max-w-3xl mx-auto pointer-events-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{
                opacity: Math.max(0, 1 - scrollProgress * 3),
              }}
            >
              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-5 leading-tight"
                style={{ color: colors.textPrimary }}
              >
                Save <span className="font-semibold">Everything.</span>
                <br />
                Intelligently.
              </h1>

              <p
                className="text-3xl sm:text-lg mb-8 max-w-md mx-auto"
                style={{ color: colors.textSecondary }}
              >
                Local storage that actually remembers.
              </p>
              {isCalendlyVisible ? (
                <PopupModal
                  url="https://calendly.com/contact-4bits/new-meeting"
                  open={isCalendlyVisible}
                  onModalClose={() => setIsCalendlyVisible(false)}
                  rootElement={document.body}
                />
              ) : (
                <CTAButton
                  text="Book a Demo"
                  handleCtaButton={handleCtaButton}
                />
              )}
             <span style={{marginLeft: '20px'}}>
                <CTAButton
                  text="Pre-Order Now"
                  handleCtaButton={handleFormOpening}
                  variant="secondary"
                />
             </span>
              
            </motion.div>

            {/* Scroll indicator */}
           
          </section>

          {/* ==================== FEATURES SECTION ==================== */}
          <section
            id="section-features"
            className="relative min-h-screen py-32 px-6 pointer-events-auto"
          >
            <div className="max-w-5xl mx-auto pointer-events-auto">
              <motion.div
                className="mb-20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p
                  className="text-xs uppercase tracking-[0.3em] mb-4"
                  style={{ color: colors.textMuted }}
                >
                  Features
                </p>
                <h2
                  className="text-3xl sm:text-4xl font-light"
                  style={{ color: colors.textPrimary }}
                >
                  Built for Your Lifestyle
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
                <FeatureItem
                  number={1}
                  title="Search without perfect recall"
                  description="Find files by what you remember, not what you named them. That contract from the Berlin client just works."
                />
                <FeatureItem
                  number={2}
                  title="One view for everything"
                  description="Internal drives, external disks, network folders, all unified. No more hunting across locations."
                />
                <FeatureItem
                  number={3}
                  title="Context that doesn’t expire"
                  description="Files remember their relationships. What project. Which version. Why it mattered, even years later."
                />
                <FeatureItem
                  number={4}
                  title="One device. Shared with family."
                  description="Share storage securely with your family from a single device. Everyone gets access. You stay in control."
                />
              </div>
            </div>
          </section>

          {/* ==================== SPECS SECTION ==================== */}
          <section
            id="section-specs"
            className="relative py-24 px-6 pointer-events-auto"
          >
            <div className="max-w-4xl mx-auto pointer-events-auto">
              <motion.p
                className="text-xs uppercase tracking-[0.3em] mb-12 text-center"
                style={{ color: colors.textMuted }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                Powers
              </motion.p>

              <div
                className="grid grid-cols-2 md:grid-cols-4 rounded-2xl overflow-hidden"
                style={{
                  background: colors.bgCard,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <SpecItem label="Built to grow." value="Storage filling up?" />
                <SpecItem
                  label="Context preserved."
                  value="Lost in old files?"
                />
                <SpecItem
                  label="One device. Many users."
                  value="Sharing across people?"
                />
                <SpecItem
                  label="You don’t have to."
                  value="Trust the cloud?"
                  isLast
                />
              </div>
            </div>
          </section>

          {/* ==================== PHILOSOPHY SECTION ==================== */}
          <section
            id="section-philosophy"
            className="relative py-32 px-6 pointer-events-auto"
          >
            <div className="max-w-3xl mx-auto text-center pointer-events-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p
                  className="text-xs uppercase tracking-[0.3em] mb-8"
                  style={{ color: colors.textMuted }}
                >
                  Philosophy
                </p>
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl font-light leading-relaxed mb-10"
                  style={{ color: colors.textPrimary }}
                >
                  Most traditional storage systems forget as they grow,{" "}
                  <span style={{ color: colors.textSecondary }}>
                    and break when shared.
                  </span>
                </h2>
                <p
                  className="text-3xl sm:text-lg max-w-xl mx-auto mb-12"
                  style={{ color: colors.textMuted }}
                >
                  4bits was built for accumulation and continuity. It keeps
                  context intact, works across people, and stays private on one
                  device
                </p>
                <p
                  className="text-3xl sm:text-lg max-w-xl mx-auto mb-12"
                  style={{ color: colors.textMuted }}
                >
                  Storage stops being personal silos. It becomes a shared
                  memory.
                </p>
                <div className="flex flex-wrap justify-center gap-12 md:gap-20">
                  {["Intelligent", "Local", "Effortless"].map((word, i) => (
                    <motion.div
                      key={word}
                      className="text-center"
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div
                        className="text-lg sm:text-xl font-medium"
                        style={{ color: colors.textPrimary }}
                      >
                        {word}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* ==================== FINAL CTA ==================== */}
          <section
            id="section-cta"
            className="relative py-32 px-6 pointer-events-auto"
          >
            <div className="max-w-2xl mx-auto text-center pointer-events-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl font-light mb-5"
                  style={{ color: colors.textPrimary }}
                >
                  See it in action.
                </h2>
                <p
                  className="text-3xl mb-8"
                  style={{ color: colors.textMuted }}
                >
                  Book a demo and experience storage that remembers.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  {isCalendlyVisible ? (
                    <PopupModal
                      url="https://calendly.com/contact-4bits/new-meeting"
                      open={isCalendlyVisible}
                      onModalClose={() => setIsCalendlyVisible(false)}
                      rootElement={document.body}
                    />
                  ) : (
                    <CTAButton
                      text="Book a Demo"
                      handleCtaButton={handleCtaButton}
                    />
                  )}
                  <span style={{marginLeft: '20px'}}>
                <CTAButton
                  text="Pre-Order Now"
                  handleCtaButton={handleFormOpening}
                  variant="secondary"
                />
             </span>
                </div>
              </motion.div>
            </div>
          </section>

          {/* ==================== FOOTER ==================== */}
          <Footer />
        </div>
      </div>
    </ReactLenis>
          
</>
  );
}
