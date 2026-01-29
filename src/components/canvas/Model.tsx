import { useLoader, ThreeElements } from '@react-three/fiber'
import { STLLoader } from 'three-stdlib'
import { forwardRef, useLayoutEffect } from 'react'
import * as THREE from 'three'
import { Center } from '@react-three/drei'
import modelUrl from "@/assets/small_3d.stl"

// Custom type combining Mesh props and custom color prop
type ModelProps = ThreeElements['mesh'] & {
    modelColor?: string
}

export const Model = forwardRef<THREE.Mesh, ModelProps>(({ modelColor = "#1a1a1a", ...props }, ref) => {
    // Cast the loader result to BufferGeometry because TS might infer it loosely
    const geometry = useLoader(STLLoader, modelUrl) as THREE.BufferGeometry

    useLayoutEffect(() => {
        if (geometry) {
            geometry.computeVertexNormals()
        }
    }, [geometry])

    return (
        <Center>
            <mesh ref={ref} geometry={geometry} scale={0.01} position={[0, 0, 0]} castShadow receiveShadow {...props}>
                <meshStandardMaterial
                    color={modelColor}
                    roughness={0.4}
                    metalness={0.8}
                    envMapIntensity={1}
                />
            </mesh>
        </Center>
    )
})
