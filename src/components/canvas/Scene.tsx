import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useRef } from 'react'
import { Html, useProgress } from '@react-three/drei'
import { motion } from 'framer-motion'
import { Lights } from './Lights'
import { Experience } from './Experience'

function Loader() {
    return null
}

function ProgressReporter({ onLoaded }: { onLoaded?: () => void }) {
    const { progress } = useProgress()
    const hasReported = useRef(false)

    useEffect(() => {
        if (!hasReported.current && progress >= 100) {
            hasReported.current = true
            onLoaded?.()
        }
    }, [progress, onLoaded])

    return null
}

export function Scene({
    isInteracting,
    modelColor,
    revealProgress = 0,
    onAssetsLoaded,
}: {
    isInteracting: boolean
    modelColor: string
    revealProgress?: number
    onAssetsLoaded?: () => void
}) {
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)
    const opacity = Math.max(0, Math.min(1, 1 - Math.max(0, revealProgress - 0.68) * 6))

    return (
        <Canvas
            shadows
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true }}
            camera={{ position: [0, 0, 3], fov: 50 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 1,
                opacity,
                transition: 'opacity 0.6s ease',
                // ✅ KEY FIX: Always none on mobile, conditional on desktop
                pointerEvents: isMobile ? 'none' : (isInteracting ? 'auto' : 'none'),
                
                // ✅ Allow vertical scroll on touch devices
                touchAction: 'pan-y',
            }}
        >
            <Suspense fallback={<Loader />}>
                <ProgressReporter onLoaded={onAssetsLoaded} />
                <Lights />
                <Experience isInteracting={isInteracting} modelColor={modelColor} />
            </Suspense>
        </Canvas>
    )
}
