import { useRef, useLayoutEffect, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import { Model } from './Model'

gsap.registerPlugin(ScrollTrigger)

export function Experience({ isInteracting, modelColor }: { isInteracting: boolean, modelColor: string }) {
    const meshRef = useRef<THREE.Group>(null)
    const groupRef = useRef<THREE.Group>(null)
    const idleRef = useRef<THREE.Group>(null)
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)
    const { camera, invalidate } = useThree()

    // Subtle idle motion even when frameloop is "demand"
    useFrame((state) => {
        if (!idleRef.current) return
        const t = state.clock.elapsedTime
        idleRef.current.rotation.x = Math.sin(t * 0.7) * 0.06
        idleRef.current.rotation.y = Math.cos(t * 0.6) * 0.08
        idleRef.current.position.y = Math.sin(t * 0.9) * 0.06
    })

    useEffect(() => {
        const interval = window.setInterval(() => {
            invalidate()
        }, 50) // ~20fps idle updates
        return () => window.clearInterval(interval)
    }, [invalidate])

    useLayoutEffect(() => {
        if (!meshRef.current || !groupRef.current) return

        const mesh = meshRef.current
        const group = groupRef.current
        const targetMaterials: THREE.MeshStandardMaterial[] = []
        mesh.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material && (child.material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
                if (child.name === "disk") {
                    targetMaterials.push(child.material as THREE.MeshStandardMaterial)
                }
            }
        })

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
        // Start visible in the hero; scroll will refine scale later
        mesh.scale.set(0.08, 0.08, 0.08)

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
                    immediateRender: false,
                    onUpdate: () => invalidate(),
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
                .to(targetMaterials, { roughness: 0.1, metalness: 1, duration: 2 }, "<")
                .to(targetMaterials.map((m) => m.emissive), { r: emissiveSpecs.r, g: emissiveSpecs.g, b: emissiveSpecs.b, duration: 2 }, "<")
                .to(targetMaterials.map((m) => m.color), { r: colorSpecs.r, g: colorSpecs.g, b: colorSpecs.b, duration: 2 }, "<")

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
                .to(targetMaterials, { roughness: 0.4, metalness: 0.8, duration: 2 }, "<")
                .to(targetMaterials.map((m) => m.emissive), { r: emissivePhil.r, g: emissivePhil.g, b: emissivePhil.b, duration: 2 }, "<")
                .to(targetMaterials.map((m) => m.color), { r: colorPhil.r, g: colorPhil.g, b: colorPhil.b, duration: 2 }, "<")

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
              2. Model (Internal)
            */}
            <group ref={idleRef}>
                <Model ref={meshRef} modelColor={modelColor} />
            </group>
        </group>
    )
}
