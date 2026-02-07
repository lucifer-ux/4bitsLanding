import { useRef, useLayoutEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Float } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import { Model } from './Model'

gsap.registerPlugin(ScrollTrigger)

export function Experience({ isInteracting, modelColor }: { isInteracting: boolean, modelColor: string }) {
    const meshRef = useRef<THREE.Mesh>(null)
    const groupRef = useRef<THREE.Group>(null)
    const floatRef = useRef<THREE.Group>(null)
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)
    const { camera } = useThree()

    // Mouse Parallax Logic
    useFrame((state) => {
        if (floatRef.current && !isInteracting) {
            // Smoothly move the float group based on mouse position
            // Dividing by 10/20 makes the movement subtle
            const x = state.pointer.x * 0.5
            const y = state.pointer.y * 0.5

            // Lerp for smoothness (Inverted direction, mild intensity)
            // Opposite direction means:
            // Mouse moves right (+x) -> object rotates left (-y)
            // Mouse moves up (+y) -> object rotates down (-x? no, +x tilts forward)
            // Let's use standard inverted look-at
            const intensity = 0.3
            floatRef.current.rotation.x = THREE.MathUtils.lerp(floatRef.current.rotation.x, y * intensity, 0.05)
            floatRef.current.rotation.y = THREE.MathUtils.lerp(floatRef.current.rotation.y, -x * intensity, 0.05)
        }
    })

    useLayoutEffect(() => {
        if (!meshRef.current || !groupRef.current) return

        const mesh = meshRef.current
        const group = groupRef.current
        const material = mesh.material as THREE.MeshStandardMaterial

        // Initial State (Features pose)
        camera.position.set(0, 0, 20)
        group.position.set(0, 0, 0)
        // Orientation to match feature-section screenshot
        const baseRotation = {
            x: 0.05,
            y: Math.PI * 1.55,
            z: 0,
        }
        mesh.rotation.set(baseRotation.x, baseRotation.y, baseRotation.z)
        mesh.scale.set(0, 0, 0)

        // Color definitions for animations
        const colorSpecs = new THREE.Color("#222222")
        const emissiveSpecs = new THREE.Color("#222222")
        const colorPhil = new THREE.Color("#1a1a1a")
        const emissivePhil = new THREE.Color("#000000")

        // Save contexts for cleanup
        const ctx = gsap.context(() => {

            // MASTER TIMELINE
            // Controls the entire sequence from top to bottom
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: document.body, // Pin to body/viewport
                    start: "top top",
                    endTrigger: "footer",
                    end: "bottom bottom",
                    scrub: 1.5, // Smooth but responsive
                    immediateRender: false
                }
            })

            // 2. Features -> Specs (approx 25-50%)
            // Flip rotation for Powers section
            tl.to(group.position, { x: 1, y: 0.2, z: -2, ease: "power1.inOut", duration: 2 })
                // 360 rotation from Powers -> Philosophy
                .to(mesh.rotation, {
                    x: baseRotation.x,
                    y: baseRotation.y + Math.PI * 2 + Math.PI,
                    z: baseRotation.z,
                    duration: 2
                }, "<")
                .to(mesh.scale, { x: 0.1, y: 0.1, z: 0.1, duration: 2 }, "<")
                .to(material, { roughness: 0.1, metalness: 1, duration: 2 }, "<")
                .to(material.emissive, { r: emissiveSpecs.r, g: emissiveSpecs.g, b: emissiveSpecs.b, duration: 2 }, "<")
                .to(material.color, { r: colorSpecs.r, g: colorSpecs.g, b: colorSpecs.b, duration: 2 }, "<")

            // 3. Specs -> Philosophy (approx 50-75%)
            tl.to(group.position, { x: -1, y: 0.5, z: 0, ease: "power1.inOut", duration: 2 })
                // -360 rotation from Philosophy -> See it in action
                .to(mesh.rotation, {
                    x: baseRotation.x,
                    y: baseRotation.y - Math.PI * 4,
                    z: 0.1,
                    duration: 2
                }, "<")
                .to(mesh.scale, { x: 0.08, y: 0.08, z: 0.08, duration: 2 }, "<")
                .to(material, { roughness: 0.4, metalness: 0.8, duration: 2 }, "<")
                .to(material.emissive, { r: emissivePhil.r, g: emissivePhil.g, b: emissivePhil.b, duration: 2 }, "<")
                .to(material.color, { r: colorPhil.r, g: colorPhil.g, b: colorPhil.b, duration: 2 }, "<")

            // Philosophy -> Footer: zoom out and go away
            tl.to(mesh.scale, { x: 0, y: 0, z: 0, duration: 1.5 }, ">")


           

        })

        return () => ctx.revert()

    }, [])

    return (
        <group ref={groupRef}>
            <OrbitControls
                enableZoom={false}
                enablePan={false}
                enabled={!isMobile && isInteracting}
                autoRotate={!isMobile && isInteracting}
                autoRotateSpeed={2.0}
                />

            {/*
              Layering Strategy:
              1. Group (controlled by ScrollTrigger)
              2. Float (controlled by Drei + Mouse Parallax)
              3. Model (Internal)
            */}
            <group ref={floatRef}>
                <Float
                    speed={2} // Animation speed
                    rotationIntensity={0.5} // XYZ rotation intensity
                    floatIntensity={0.5} // Up/down float intensity
                    floatingRange={[-0.1, 0.1]} // Range of y-axis values the object will float within
                >
                    <Model ref={meshRef} modelColor={modelColor} />
                </Float>
            </group>
        </group>
    )
}
