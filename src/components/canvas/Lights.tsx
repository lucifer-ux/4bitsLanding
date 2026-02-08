import { Environment } from '@react-three/drei'

export function Lights() {
    return (
        <>
            <ambientLight intensity={5.5} />
            <hemisphereLight args={["#ffffff", "#1a1a1a", 1.2]} />
            <spotLight
                position={[10, 10, 10]}
                angle={0.15}
                penumbra={1}
                intensity={50}
                castShadow
            />
            <pointLight position={[-8, -11,-12]} intensity={20} color="#4f46e5" />
            <pointLight position={[8, 6, -6]} intensity={14} color="#ffffff" />
            <pointLight position={[0, -6, 6]} intensity={12} color="#ffffff" />
            <Environment preset="city" background={false} />
        </>
    )
}
