import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Html, useProgress } from '@react-three/drei'
import { Lights } from './Lights'
import { Experience } from './Experience'

function Loader() {
    const { progress } = useProgress()
    return (
        <Html center className="text-white font-mono text-sm">
            {progress.toFixed(0)}%
        </Html>
    )
}

export function Scene({ isInteracting, setInteraction, modelColor }: { isInteracting: boolean, setInteraction: (v: boolean) => void, modelColor: string }) {
    return (
        <Canvas
            shadows
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true }}
            camera={{ position: [0, 0, 3], fov: 50 }}
            eventSource={document.body}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: isInteracting ? 'auto' : 'none', // Toggle based on state
                zIndex: 1, // Behind text but visible
            }}
        >
            <Suspense fallback={<Loader />}>
                <Lights />
                <Experience setInteraction={setInteraction} isInteracting={isInteracting} modelColor={modelColor} />
            </Suspense>
        </Canvas>
    )
}
