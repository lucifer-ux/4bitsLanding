import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ReactLenis } from 'lenis/react'
import { Scene } from './components/canvas/Scene';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ============================================
// PREMIUM LANDING PAGE - Personal Storage Assistant
// Inspired by vibex.space - Persistent 3D Product
// Clean, Dark, Minimal Design
// ============================================

// Color Palette - Clean Dark Theme
const colors = {
    bgPrimary: '#000000',
    bgSecondary: '#0a0a0a',
    bgCard: 'rgba(15, 15, 15, 0.95)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textMuted: 'rgba(255, 255, 255, 0.4)',
    accent: '#ffffff',
    border: 'rgba(255, 255, 255, 0.1)',
};

// Clean CTA Button
function CTAButton({ text, variant = 'primary' }: { text: string; variant?: 'primary' | 'secondary' }) {
    const isPrimary = variant === 'primary';

    return (
        <motion.button
            className="relative px-8 py-3.5 rounded-full font-medium text-sm tracking-wide cursor-pointer pointer-events-auto"
            style={{
                background: isPrimary ? '#fff' : 'transparent',
                color: isPrimary ? '#000' : colors.textPrimary,
                border: isPrimary ? 'none' : `1px solid ${colors.border}`,
            }}
            whileHover={{
                scale: 1.02,
                background: isPrimary ? '#e8e8e8' : 'rgba(255,255,255,0.05)',
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
    description
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
                    background: isHovered ? 'rgba(255,255,255,0.1)' : 'transparent',
                    border: `1px solid ${isHovered ? 'rgba(255,255,255,0.3)' : colors.border}`,
                    color: isHovered ? colors.textPrimary : colors.textMuted,
                }}
            >
                {number}
            </div>

            <div>
                <h4
                    className="text-base font-medium mb-2 transition-colors duration-200"
                    style={{ color: isHovered ? colors.textPrimary : colors.textSecondary }}
                >
                    {title}
                </h4>
                <p
                    className="text-sm leading-relaxed max-w-sm"
                    style={{ color: colors.textMuted }}
                >
                    {description}
                </p>
            </div>
        </motion.div>
    );
}

// Spec item
function SpecItem({ label, value, isLast = false }: { label: string; value: string; isLast?: boolean }) {
    return (
        <motion.div
            className="text-center py-8 px-4"
            style={{ borderRight: isLast ? 'none' : `1px solid ${colors.border}` }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
        >
            <div className="text-2xl sm:text-3xl font-light mb-2" style={{ color: colors.textPrimary }}>
                {value}
            </div>
            <div className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>
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
                    <img src="/4bits_without_bg.png" alt="4bits" className="h-10" />
                    <div className="flex gap-8">
                        {['About', 'Technology', 'Support'].map(link => (
                            <a
                                key={link}
                                href="#"
                                className="text-sm transition-colors hover:text-white cursor-pointer"
                                style={{ color: colors.textMuted }}
                            >
                                {link}
                            </a>
                        ))}
                    </div>
                </div>

                <div
                    className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs"
                    style={{
                        borderTop: `1px solid ${colors.border}`,
                        color: colors.textMuted,
                    }}
                >
                    <p>© 2024 4bits</p>
                    <div className="flex gap-6">
                        <a href="/4bits Terms and Conditions.pdf" target="_blank" className="hover:text-white transition-colors cursor-pointer">
                            Terms
                        </a>
                        <a href="/4bits Privacy Policy.pdf" target="_blank" className="hover:text-white transition-colors cursor-pointer">
                            Privacy
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// Custom Color Palette
const productColors = [
    { name: 'Matte Black', value: '#1a1a1a' },
    { name: 'Titanium Silver', value: '#e2e2e2' },
    { name: 'Deep Navy', value: '#172554' },
    { name: 'Crimson', value: '#9f1239' }
]

// Main Component
export default function NewDesignLanding() {
    const [scrollProgress, setScrollProgress] = useState(0)
    const [isInteracting, setIsInteracting] = useState(false) // Lifted state for pointer-events
    const [modelColor, setModelColor] = useState(productColors[0].value) // Color state
    const lenisRef = useRef<any>(null)

    useEffect(() => {
        // Sync Lenis scroll with GSAP ScrollTrigger
        const update = (time: number) => {
            lenisRef.current?.lenis?.raf(time * 1000)
        }
        gsap.ticker.add(update)

        // Traveling CTA Animation
        // Moves the button down the rail as user scrolls
        const ctaAnim = gsap.timeline({
            scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "bottom bottom",
                scrub: true,
                immediateRender: false
            }
        })
            .to("#floating-cta", {
                top: "85vh",
                ease: "none"
            })

        // CTA Visibility (Fade in after Hero)
        ScrollTrigger.create({
            trigger: document.body,
            start: "10% top",
            onEnter: () => gsap.to("#floating-cta", { opacity: 1, duration: 0.5 }),
            onLeaveBack: () => gsap.to("#floating-cta", { opacity: 0, duration: 0.5 })
        })

        return () => {
            gsap.ticker.remove(update)
            ctaAnim.kill()
        }
    }, [])

    const handleScroll = (e: any) => {
        setScrollProgress(e.progress)
        ScrollTrigger.update()
    }

    // Clean up body styles
    useEffect(() => {
        // 1. Create style element to override global CSS
        const style = document.createElement('style');
        style.id = 'newdesign-page-overrides';
        style.textContent = `
            /* Restore native cursor */
            body, html, *, *::before, *::after {
                cursor: auto !important;
            }
            
            /* Kill the star background effectively */
            #root::before {
                content: none !important;
                display: none !important;
                opacity: 0 !important;
            }
            
            /* FORCE SCROLLABILITY - Override potential height: 100% locks */
            html {
                height: auto !important;
                overflow: auto !important;
                overflow-x: hidden !important;
            }
            body {
                height: auto !important;
                overflow: auto !important;
                overflow-x: hidden !important;
                background: #000000 !important;
                position: relative !important; /* Ensure generic stacking works */
            }
            
            /* Ensure root grows too */
            #root {
                min-height: 100vh;
                height: auto !important;
                background: #000000 !important;
                overflow: visible !important;
            }
            
            /* Lenis specific */
            html.lenis, html.lenis body {
                height: auto !important;
            }
        `;
        document.head.appendChild(style);

        // 2. Direct style manipulation as backup
        document.body.style.cursor = 'auto';
        document.body.style.background = '#000000';
        document.documentElement.style.background = '#000000';

        // Critical: Unlock scroll
        document.body.style.overflow = 'visible';
        document.documentElement.style.overflow = 'visible';
        document.body.style.height = 'auto';
        document.documentElement.style.height = 'auto';

        return () => {
            const styleEl = document.getElementById('newdesign-page-overrides');
            if (styleEl) styleEl.remove();
            // Cleanup styles
            document.body.style.cursor = '';
            document.body.style.background = '';
            document.documentElement.style.background = '';
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            document.body.style.height = '';
            document.documentElement.style.height = '';
        };
    }, []);

    return (
        <ReactLenis
            ref={lenisRef}
            root
            options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}
            className="lenis lenis-smooth"
            onScroll={handleScroll}
        >
            {/* 3D SCENE LAYER - Fixed relative to viewport, sibling to content */}
            {/* Pass current interaction state and setter */}
            <Scene isInteracting={isInteracting} setInteraction={setIsInteracting} modelColor={modelColor} />

            <div
                className={`min-h-screen relative w-full ${isInteracting ? 'select-none cursor-grab active:cursor-grabbing' : ''}`}
                style={{
                    background: '#000000', // Keep background black
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
            >
                {/* CONTENT LAYER - Relative and transparent where needed */}
                <div className="relative z-10">

                    {/* ==================== HERO SECTION ==================== */}
                    <section id="section-hero" className="relative min-h-screen flex flex-col items-center justify-end pb-24 px-6 pointer-events-none">
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
                                    color: 'rgba(255, 255, 255, 0.3)',
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
                                Your Files.{' '}
                                <span className="font-semibold">Organized.</span>
                                <br />
                                Intelligently.
                            </h1>

                            <p
                                className="text-base sm:text-lg mb-8 max-w-md mx-auto"
                                style={{ color: colors.textSecondary }}
                            >
                                The personal storage assistant that understands you.
                            </p>

                            <CTAButton text="Pre-order Now" />
                        </motion.div>

                        {/* Scroll indicator */}
                        <motion.div
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto"
                            style={{ color: colors.textMuted }}
                            animate={{ y: [0, 6, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] mb-1.5 tracking-[0.2em] uppercase">Scroll</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M7 10l5 5 5-5" />
                                </svg>
                            </div>
                        </motion.div>
                    </section>

                    {/* ==================== FEATURES SECTION ==================== */}
                    <section id="section-features" className="relative min-h-screen py-32 px-6 pointer-events-none">
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
                                    title="Natural Language Search"
                                    description="Just type what you're looking for. Our AI understands context, so 'vacation photos from last summer' finds exactly what you need."
                                />
                                <FeatureItem
                                    number={2}
                                    title="Automatic Organization"
                                    description="Drop files anywhere. They automatically sort themselves into intuitive categories without any effort on your part."
                                />
                                <FeatureItem
                                    number={3}
                                    title="Local-First Privacy"
                                    description="Your data stays on your hardware. No cloud dependency, no subscriptions, no compromises on privacy."
                                />
                                <FeatureItem
                                    number={4}
                                    title="Wireless Access"
                                    description="Connect from any device on your network. WiFi or direct connect — your files, everywhere you need them."
                                />
                            </div>
                        </div>
                    </section>

                    {/* ==================== SPECS SECTION ==================== */}
                    <section id="section-specs" className="relative py-24 px-6 pointer-events-none">
                        <div className="max-w-4xl mx-auto pointer-events-auto">
                            <motion.p
                                className="text-xs uppercase tracking-[0.3em] mb-12 text-center"
                                style={{ color: colors.textMuted }}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                Specifications
                            </motion.p>

                            <div
                                className="grid grid-cols-2 md:grid-cols-4 rounded-2xl overflow-hidden"
                                style={{
                                    background: colors.bgCard,
                                    border: `1px solid ${colors.border}`,
                                }}
                            >
                                <SpecItem label="Storage" value="2TB" />
                                <SpecItem label="Speed" value="540MB/s" />
                                <SpecItem label="WiFi" value="WiFi 6" />
                                <SpecItem label="Encryption" value="AES-256" isLast />
                            </div>
                        </div>
                    </section>

                    {/* ==================== PHILOSOPHY SECTION ==================== */}
                    <section id="section-philosophy" className="relative py-32 px-6 pointer-events-none">
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
                                    A personal AI that lives with your files,{' '}
                                    <span style={{ color: colors.textSecondary }}>not in the cloud.</span>
                                </h2>
                                <p
                                    className="text-base sm:text-lg max-w-xl mx-auto mb-12"
                                    style={{ color: colors.textMuted }}
                                >
                                    Intelligent local storage that organizes, searches, and manages your digital life—autonomously and privately.
                                </p>

                                <div className="flex flex-wrap justify-center gap-12 md:gap-20">
                                    {['Intelligent', 'Local', 'Effortless'].map((word, i) => (
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
                    <section id="section-cta" className="relative py-32 px-6 pointer-events-none">
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
                                    Ready to own your data?
                                </h2>
                                <p
                                    className="text-base mb-8"
                                    style={{ color: colors.textMuted }}
                                >
                                    Join the waitlist for early access.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                    <CTAButton text="Pre-order Now" />
                                    <CTAButton text="Learn More" variant="secondary" />
                                </div>
                            </motion.div>
                        </div>
                    </section>

                    {/* ==================== 3D PLAYGROUND SECTION ==================== */}
                    <section id="section-playground" className="relative h-screen flex flex-col items-center justify-center pointer-events-none select-none">

                        {/* Interaction Hint */}
                        <motion.div
                            className="absolute bottom-12 pointer-events-auto"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div
                                className="flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-md"
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${colors.border}`
                                }}
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs uppercase tracking-widest" style={{ color: colors.textSecondary }}>
                                    Drag to Rotate
                                </span>
                            </div>
                        </motion.div>

                        {/* Color Picker Sidebar - Right aligned */}
                        <motion.div
                            className="absolute right-8 top-1/2 -translate-y-1/2 p-4 rounded-2xl backdrop-blur-md pointer-events-auto"
                            style={{
                                background: 'rgba(20, 20, 20, 0.6)',
                                border: `1px solid ${colors.border}`
                            }}
                            initial={{ x: 50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="flex flex-col gap-4">
                                {productColors.map((color) => (
                                    <div
                                        key={color.value}
                                        className="group relative flex items-center"
                                    >
                                        <button
                                            onClick={() => setModelColor(color.value)}
                                            className="w-10 h-10 rounded-full border-2 transition-all duration-300 hover:scale-110"
                                            style={{
                                                backgroundColor: color.value,
                                                borderColor: modelColor === color.value ? '#fff' : 'transparent',
                                                boxShadow: modelColor === color.value ? `0 0 15px ${color.value}80` : 'none'
                                            }}
                                            aria-label={`Select ${color.name}`}
                                        />
                                        <span
                                            className="absolute right-14 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
                                            style={{ border: `1px solid ${colors.border}` }}
                                        >
                                            {color.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                    </section>

                    {/* ==================== FOOTER ==================== */}
                    <Footer />

                    {/* Progress Line - Visual Track */}
                    <div
                        className="fixed right-12 top-[15vh] bottom-[15vh] w-[1px] z-40 pointer-events-none mix-blend-difference"
                        style={{ background: 'rgba(255,255,255,0.1)' }}
                    />

                    {/* Persistent Traveling Pre-order Button */}
                    <motion.div
                        id="floating-cta"
                        className="fixed right-8 z-50 mix-blend-difference"
                        initial={{ opacity: 0, y: 0 }}
                        style={{ top: '15vh' }} // Start position
                    >
                        <CTAButton text="Pre-order" />
                    </motion.div>

                    {/* Back to home */}
                    <a
                        href="/"
                        className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all hover:bg-white/5 cursor-pointer pointer-events-auto"
                        style={{
                            background: 'rgba(0,0,0,0.9)',
                            color: colors.textMuted,
                            border: `1px solid ${colors.border}`,
                        }}
                    >
                        ← Home
                    </a>
                </div>
            </div>
        </ReactLenis>
    );
}
