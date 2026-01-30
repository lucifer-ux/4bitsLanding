import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useState } from 'react'
import { Html, useProgress } from '@react-three/drei'
import { Lights } from './Lights'
import { Experience } from './Experience'

function Loader() {
    const { progress } = useProgress()
    const [value, setValue] = useState(0)

    useEffect(() => {
        setValue(progress)
    }, [progress])

    return (
        <Html center className="text-white font-mono text-base">
            {value.toFixed(0)}%
        </Html>
    )
}

export function Scene({ isInteracting, setInteraction, modelColor }: { isInteracting: boolean, setInteraction: (v: boolean) => void, modelColor: string }) {
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)
    
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
                
                // ✅ KEY FIX: Always none on mobile, conditional on desktop
                pointerEvents: isMobile ? 'none' : (isInteracting ? 'auto' : 'none'),
                
                // ✅ Allow vertical scroll on touch devices
                touchAction: 'pan-y',
            }}
        >
            <Suspense fallback={<Loader />}>
                <Lights />
                <Experience setInteraction={setInteraction} isInteracting={isInteracting} modelColor={modelColor} />
            </Suspense>
        </Canvas>
    )
}