import { Environment } from '@react-three/drei'

export function Lights() {
    return (
        <>
            <ambientLight intensity={3.5} />
            <spotLight
                position={[10, 10, 10]}
                angle={0.15}
                penumbra={1}
                intensity={15}
                castShadow
            />
            <pointLight position={[-10, -10, -10]} intensity={8} color="#4f46e5" />
            <Environment preset="city" background={false} />
        </>
    )
}
