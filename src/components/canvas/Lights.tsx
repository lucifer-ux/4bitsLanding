import { Environment } from '@react-three/drei'
import hdrUrl from '@/assets/studio_small_09_1k.exr'

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
            <Environment files={hdrUrl} />
        </>
    )
}
