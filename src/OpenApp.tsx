import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { Lights } from "./components/canvas/Lights";
import { Model } from "./components/canvas/Model";

function FloatingModel() {
  const modelRef = useRef<Group>(null);

  useFrame((state) => {
    if (!modelRef.current) return;
    const t = state.clock.elapsedTime;
    modelRef.current.rotation.x = Math.sin(t * 0.45) * 0.08;
    modelRef.current.rotation.y = t * 0.2;
    modelRef.current.position.y = Math.sin(t * 0.8) * 0.08;
  });

  return (
    <group ref={modelRef}>
      <Model modelColor="#1a1a1a" />
    </group>
  );
}

export default function OpenApp() {
  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        position: "relative",
        overflow: "hidden",
        background: "#050505",
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.3, 3.2], fov: 44 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
        }}
      >
        <Suspense fallback={null}>
          <Lights />
          <FloatingModel />
        </Suspense>
      </Canvas>

      <div
        style={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          width: "100%",
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          background: "radial-gradient(circle at center, rgba(5, 5, 5, 0.2), rgba(5, 5, 5, 0.72))",
          color: "white",
          padding: "24px",
          fontFamily: '"Ubuntu", sans-serif',
          letterSpacing: "0.04em",
        }}
      >
        <p style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)", fontWeight: 500 }}>
          Redirect back to app
        </p>
      </div>
    </div>
  );
}
