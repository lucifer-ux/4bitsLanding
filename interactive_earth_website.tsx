import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Globe } from 'lucide-react';

// Type definitions for custom userData
interface BubbleUserData {
  originalPosition: THREE.Vector3;
  velocity: THREE.Vector3;
  isHighlighted: boolean;
  blinkPhase: number;
}

interface CometUserData {
  speed: number;
  resetPosition: () => void;
}

interface LandBubbleData {
  position: { x: number; y: number; z: number };
  lat: number;
  lon: number;
}

const InteractiveEarthWebsite = () => {
  console.log('InteractiveEarthWebsite component is rendering...');

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null);
  const earthGroupRef = useRef<THREE.Group>(null);
  const bubblesRef = useRef<THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhongMaterial>[]>([]);
  const cometsRef = useRef<THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const [showZoomButton, setShowZoomButton] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [storageOwners] = useState(42);
  const [isAnimating, setIsAnimating] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [showPreorder, setShowPreorder] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const fullText = "Own Your Storage";

  // Detailed Asia, Europe, and Australia regions
  const landmassRegions = [
    // Europe (more detailed)
    { latMin: 36, latMax: 71, lonMin: -10, lonMax: 40, density: 1 },
    // Asia (more detailed, broken into subregions)
    { latMin: 5, latMax: 55, lonMin: 40, lonMax: 90, density: 1 }, // West/Central Asia
    { latMin: 15, latMax: 50, lonMin: 90, lonMax: 135, density: 1 }, // East Asia
    { latMin: -10, latMax: 28, lonMin: 70, lonMax: 145, density: 1 }, // South/Southeast Asia
    { latMin: 35, latMax: 75, lonMin: 60, lonMax: 180, density: 1 }, // Northern Asia/Russia
    // Australia
    { latMin: -44, latMax: -10, lonMin: 113, lonMax: 154, density: 1 },
  ];

  const isOnLand = (lat: number, lon: number): boolean => {
    let normLon = ((lon + 180) % 360) - 180;
    
    return landmassRegions.some(region => {
      const latInRange = lat >= region.latMin && lat <= region.latMax;
      let lonInRange = normLon >= region.lonMin && normLon <= region.lonMax;
      return latInRange && lonInRange;
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a4d3c);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 15;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x4488ff, 0.6, 100);
    pointLight2.position.set(-10, -5, 5);
    scene.add(pointLight2);

    // Create Earth group
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    // Create bubble particles for Earth
    const bubbleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const normalMaterial = new THREE.MeshPhongMaterial({
      color: 0x4488ff, // Blue color
      transparent: true,
      opacity: 0.75,
      shininess: 80,
    });

    const highlightMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ff66,
      emissive: 0x00ff44,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.95,
      shininess: 100,
    });

    const radius = 5;
    const totalBubbles = 2500;
    const bubbles: THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhongMaterial>[] = [];
    const landBubbles: LandBubbleData[] = [];

    // First pass: create all land bubbles with higher density
    for (let i = 0; i < totalBubbles; i++) {
      const phi = Math.acos(-1 + (2 * i) / totalBubbles);
      const theta = Math.sqrt(totalBubbles * Math.PI) * phi;

      // Convert to lat/lon
      const lat = 90 - (phi * 180) / Math.PI;
      const lon = ((theta * 180) / Math.PI) % 360 - 180;

      if (isOnLand(lat, lon)) {
        const x = radius * Math.cos(theta) * Math.sin(phi);
        const y = radius * Math.sin(theta) * Math.sin(phi);
        const z = radius * Math.cos(phi);

        landBubbles.push({
          position: { x, y, z },
          lat,
          lon,
        });
      }
    }

    // Randomly select 42 bubbles to highlight
    const shuffled = [...landBubbles].sort(() => Math.random() - 0.5);
    const highlightedIndices = new Set(
      shuffled.slice(0, storageOwners).map(b => landBubbles.indexOf(b))
    );

    // Create visible bubbles only for land
    landBubbles.forEach((bubbleData, index) => {
      const isHighlighted = highlightedIndices.has(index);
      const material = isHighlighted ? highlightMaterial.clone() : normalMaterial.clone();

      const bubble = new THREE.Mesh(bubbleGeometry, material);
      bubble.position.set(
        bubbleData.position.x,
        bubbleData.position.y,
        bubbleData.position.z
      );
      (bubble.userData as BubbleUserData) = {
        originalPosition: new THREE.Vector3(
          bubbleData.position.x,
          bubbleData.position.y,
          bubbleData.position.z
        ),
        velocity: new THREE.Vector3(0, 0, 0),
        isHighlighted: isHighlighted,
        blinkPhase: Math.random() * Math.PI * 2,
      };

      earthGroup.add(bubble);
      bubbles.push(bubble);
    });

    bubblesRef.current = bubbles;

    // Stars background
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.5,
    });

    const starsVertices: number[] = [];
    for (let i = 0; i < 800; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(starsVertices, 3)
    );
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Create Comets
    const cometCount = 5;
    const comets: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>[] = [];

    for (let i = 0; i < cometCount; i++) {
      const cometGeometry = new THREE.BufferGeometry();
      const cometMaterial = new THREE.LineBasicMaterial({
        color: 0xaaccff,
        transparent: true,
        opacity: 0.6,
        linewidth: 2,
      });

      const points: THREE.Vector3[] = [];
      const startX = (Math.random() - 0.5) * 60;
      const startY = (Math.random() - 0.5) * 60;
      const startZ = -50;

      for (let j = 0; j < 20; j++) {
        points.push(
          new THREE.Vector3(
            startX - j * 0.3,
            startY + j * 0.2,
            startZ + j * 0.5
          )
        );
      }

      cometGeometry.setFromPoints(points);
      const comet = new THREE.Line(cometGeometry, cometMaterial);

      (comet.userData as CometUserData) = {
        speed: 0.15 + Math.random() * 0.15,
        resetPosition: () => {
          const newPoints: THREE.Vector3[] = [];
          const newStartX = (Math.random() - 0.5) * 60;
          const newStartY = (Math.random() - 0.5) * 60;
          const newStartZ = -50;

          for (let j = 0; j < 20; j++) {
            newPoints.push(
              new THREE.Vector3(
                newStartX - j * 0.3,
                newStartY + j * 0.2,
                newStartZ + j * 0.5
              )
            );
          }
          comet.geometry.setFromPoints(newPoints);
        }
      };

      scene.add(comet);
      comets.push(comet);
    }

    cometsRef.current = comets;

    // Animation loop
    let blinkTime = 0;
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (!isAnimating) {
        earthGroup.rotation.y += 0.001;
      }

      // Animate comets
      comets.forEach(comet => {
        const positions = comet.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 2] += (comet.userData as CometUserData).speed; // Move towards camera

          // Reset if too close
          if (positions[i + 2] > 20) {
            (comet.userData as CometUserData).resetPosition();
          }
        }
        comet.geometry.attributes.position.needsUpdate = true;
      });

      // Blinking effect for highlighted bubbles when animating
      if (isAnimating) {
        blinkTime += 0.05;
        bubbles.forEach(bubble => {
          const userData = bubble.userData as BubbleUserData;
          if (userData.isHighlighted) {
            const intensity = (Math.sin(blinkTime + userData.blinkPhase) + 1) / 2;
            bubble.material.emissiveIntensity = 0.5 + intensity * 1.5;
            bubble.material.opacity = 0.7 + intensity * 0.3;
          }
        });
      }

      // Mouse interaction with bubbles
      const mouse3D = new THREE.Vector3(
        (mouseRef.current.x / window.innerWidth) * 2 - 1,
        -(mouseRef.current.y / window.innerHeight) * 2 + 1,
        0.5
      );

      mouse3D.unproject(camera);
      mouse3D.sub(camera.position).normalize();
      const distance = -camera.position.z / mouse3D.z;
      const mouseWorldPos = camera.position
        .clone()
        .add(mouse3D.multiplyScalar(distance));

      bubbles.forEach(bubble => {
        const worldPos = bubble.getWorldPosition(new THREE.Vector3());
        const distanceToMouse = worldPos.distanceTo(mouseWorldPos);
        const userData = bubble.userData as BubbleUserData;

        if (distanceToMouse < 2) {
          const direction = worldPos.clone().sub(mouseWorldPos).normalize();
          userData.velocity.add(direction.multiplyScalar(0.02));
        }

        bubble.position.add(userData.velocity);

        const returnForce = userData.originalPosition
          .clone()
          .sub(bubble.position)
          .multiplyScalar(0.05);
        userData.velocity.add(returnForce);

        userData.velocity.multiplyScalar(0.92);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Event handlers
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      if (isDraggingRef.current && !isAnimating) {
        const deltaX = e.clientX - previousMouseRef.current.x;
        const deltaY = e.clientY - previousMouseRef.current.y;

        earthGroup.rotation.y += deltaX * 0.005;
        earthGroup.rotation.x += deltaY * 0.005;

        previousMouseRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (!isAnimating) {
        isDraggingRef.current = true;
        previousMouseRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (!isAnimating) {
        e.preventDefault();
        const zoomSpeed = 0.002;
        const newZ = camera.position.z + e.deltaY * zoomSpeed;
        camera.position.z = Math.max(8, Math.min(20, newZ));
      }
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isAnimating, storageOwners]);

  // Handle scroll for zoom and text animation
  useEffect(() => {
    const handleScroll = () => {
      if (!cameraRef.current || !isAnimating) return;

      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollY / maxScroll, 1);
      setScrollProgress(progress);

      // Zoom in as user scrolls
      const startZ = 15;
      const endZ = 8;
      cameraRef.current.position.z = startZ - (startZ - endZ) * progress;

      // Trigger typewriter when zoomed in enough
      if (progress > 0.3 && typewriterText.length < fullText.length) {
        const charsToShow = Math.floor((progress - 0.3) / 0.7 * fullText.length);
        setTypewriterText(fullText.substring(0, charsToShow));
      }

      // Show preorder button when text is complete
      if (progress > 0.7) {
        setShowPreorder(true);
      }
    };

    if (isAnimating) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isAnimating, typewriterText]);

  const handleExploreClick = () => {
    if (!earthGroupRef.current || isAnimating) return;

    setIsAnimating(true);
    setShowZoomButton(false);

    const startRotation = earthGroupRef.current.rotation.y;
    const targetRotation = startRotation + Math.PI * 2;
    const duration = 3000;
    const startTime = Date.now();

    const animateRotation = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      if (earthGroupRef.current) {
        earthGroupRef.current.rotation.y = startRotation + (targetRotation - startRotation) * eased;
      }

      if (progress < 1) {
        requestAnimationFrame(animateRotation);
      }
    };

    animateRotation();
  };

  return (
    <div className="relative w-full" style={{ height: '300vh' }}>
      {/* Three.js Canvas */}
      <div
        ref={containerRef}
        className="fixed top-0 left-0 w-full h-screen"
        style={{ cursor: isDraggingRef.current ? 'grabbing' : isAnimating ? 'default' : 'grab' }}
      />

      {/* Hero Section Overlay */}
      <div className="fixed top-0 left-0 w-full h-screen pointer-events-none z-10">
        <div className="relative w-full h-full flex items-center justify-center px-4">
          {/* Storage Owners Counter */}
          <div
            className="absolute top-8 sm:top-20 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 sm:px-6 sm:py-3 border border-white/20 pointer-events-auto"
            style={{
              opacity: isAnimating ? 0 : 1,
              transition: 'opacity 0.5s',
            }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <Globe className="text-green-400" size={typeof window !== 'undefined' && window.innerWidth < 640 ? 20 : 24} />
              <div>
                <div className="text-lg sm:text-2xl font-bold text-white">
                  {storageOwners}
                </div>
                <div className="text-xs text-green-200">People Own Their Storage</div>
              </div>
            </div>
          </div>

          {/* Zoom Button */}
          {showZoomButton && (
            <button
              onClick={handleExploreClick}
              className="absolute right-4 sm:right-20 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-sm sm:text-lg shadow-2xl transition-all duration-300 hover:scale-105 pointer-events-auto"
            >
              <span className="hidden sm:inline">Explore Storage Network</span>
              <span className="sm:hidden">Explore Network</span>
            </button>
          )}

          {/* Instructions */}
          <div
            className="absolute bottom-20 sm:bottom-32 left-1/2 transform -translate-x-1/2 text-center text-white/60 text-xs sm:text-sm pointer-events-auto px-4"
            style={{
              opacity: isAnimating ? 0 : 1,
              transition: 'opacity 0.5s',
            }}
          >
            <p className="hidden sm:block">Click and drag to rotate • Scroll to zoom • Mouse over bubbles</p>
            <p className="sm:hidden">Drag to rotate • Scroll to zoom</p>
          </div>
        </div>
      </div>

      {/* Typewriter Text Section */}
      {isAnimating && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20"
          style={{
            opacity: scrollProgress > 0.3 ? 1 : 0,
            transition: 'opacity 0.5s',
          }}
        >
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-6 sm:mb-8 px-4">
            {typewriterText}
            <span className="animate-pulse">|</span>
          </h2>
          
          {showPreorder && (
            <button className="bg-white text-green-700 hover:bg-green-100 px-8 py-4 sm:px-12 sm:py-5 rounded-full font-bold text-lg sm:text-xl shadow-2xl transition-all duration-300 hover:scale-105 pointer-events-auto animate-fadeIn">
              Pre-Order Now
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default InteractiveEarthWebsite;