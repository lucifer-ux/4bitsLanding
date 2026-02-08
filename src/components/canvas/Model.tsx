import { useLoader, ThreeElements } from '@react-three/fiber'
import { STLLoader } from 'three-stdlib'
import { forwardRef, useLayoutEffect, useMemo } from 'react'
import * as THREE from 'three'
import { Center } from '@react-three/drei'
import diskUrl from "@/assets/reduced.stl"

// Custom type combining Mesh props and custom color prop
type ModelProps = ThreeElements['group'] & {
    modelColor?: string
}

export const Model = forwardRef<THREE.Group, ModelProps>(({ modelColor = "#1a1a1a", ...props }, ref) => {
    // Load asset
    const diskGeometry = useLoader(STLLoader, diskUrl) as THREE.BufferGeometry

    const diskMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: new THREE.Color(modelColor),
            roughness: 0.4,
            metalness: 0.8,
            envMapIntensity: 1,
        })
    }, [modelColor])

    useLayoutEffect(() => {
        if (diskGeometry) {
            diskGeometry.computeVertexNormals()
        }
    }, [diskGeometry])

    return (
        <group ref={ref} {...props}>
            <Center>
                <mesh
                    name="disk"
                    geometry={diskGeometry}
                    scale={0.9}
                    rotation={[Math.PI * 0.1, Math.PI * 0.2, 0]}
                    castShadow
                    receiveShadow
                    material={diskMaterial}
                />
            </Center>
        </group>
    )
})
