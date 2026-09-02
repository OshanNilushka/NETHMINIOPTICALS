import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

// ─── PROCEDURAL TEXTURE GENERATION ──────────────────────────────────────────

// Creates vein texture map for the Sclera (Eyeball)
const createScleraVeinsTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Off-white sclera base
  ctx.fillStyle = '#fcfcfa';
  ctx.fillRect(0, 0, 512, 256);

  // Draw delicate red veins branching from the rear to the front
  ctx.strokeStyle = 'rgba(220, 38, 38, 0.45)';
  ctx.lineWidth = 0.5;

  for (let i = 0; i < 24; i++) {
    // start near the back/middle (left/right bounds of flat map representation)
    let x = Math.random() < 0.5 ? Math.random() * 80 : 432 + Math.random() * 80;
    let y = Math.random() * 256;
    ctx.beginPath();
    ctx.moveTo(x, y);

    const segments = 4 + Math.floor(Math.random() * 6);
    for (let j = 0; j < segments; j++) {
      x += (Math.random() - 0.3) * 15; // branch towards center
      y += (Math.random() - 0.5) * 15;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
};

// Creates radial gradient fiber texture map for Iris
const createIrisFiberTexture = (colorHex) => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Center pupil black hole
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 120);
  grad.addColorStop(0, '#000000');
  grad.addColorStop(0.16, '#000000');
  grad.addColorStop(0.24, colorHex); // Base color
  grad.addColorStop(0.6, '#ffffff'); // Highlights
  grad.addColorStop(0.9, colorHex);
  grad.addColorStop(1, '#020617'); // Dark border edge

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Draw radial lines representing iris fibers
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 360; i += 2.5) {
    const angle = (i * Math.PI) / 180;
    const startX = 128 + Math.cos(angle) * 32;
    const startY = 128 + Math.sin(angle) * 32;
    const endX = 128 + Math.cos(angle) * (95 + Math.random() * 20);
    const endY = 128 + Math.sin(angle) * (95 + Math.random() * 20);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
};

// ─── 3D LIGHT RAYS SIMULATOR ────────────────────────────────────────────────

function LightRays({ condition, isClipped }) {
  const points = useMemo(() => {
    // Retinotopic layout focus coordinates (Retina is at Z = -1.2)
    let focusZ = -1.2;
    if (condition === 'myopia') {
      focusZ = -0.75; // Focus converges early
    } else if (condition === 'hyperopia') {
      focusZ = -1.6; // Focus converges late
    }

    const rays = [];
    // Render 5 parallel laser-like beams entering the eye pupil
    for (let i = -0.25; i <= 0.25; i += 0.12) {
      const pStart = new THREE.Vector3(i, 0, 2.5); // Start outside
      const pCornea = new THREE.Vector3(i * 0.9, 0, 1.0); // Enter cornea
      const pLens = new THREE.Vector3(i * 0.8, 0, 0.6); // Refract through lens
      const pFocus = new THREE.Vector3(0, 0, focusZ); // Bends to focus point
      const pRetina = new THREE.Vector3(-i * 0.2, 0, -1.2); // Hit retina plane

      rays.push([pStart, pCornea, pLens, pFocus, pRetina]);
    }
    return rays;
  }, [condition]);

  // If clipped, shift rays offset slightly to align with the section cut
  const yOffset = isClipped ? 0.01 : 0;

  return (
    <group position={[0, yOffset, 0]}>
      {points.map((ray, idx) => {
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(ray);
        return (
          <line key={idx} geometry={lineGeometry}>
            <lineBasicMaterial
              attach="material"
              color={condition === 'cataract' ? '#ca8a04' : '#10b981'} // Cloudy beam if cataract
              linewidth={2.5}
              transparent
              opacity={0.8}
            />
          </line>
        );
      })}
    </group>
  );
}

// ─── MAIN 3D EYE SCENE ───────────────────────────────────────────────────────

function EyeModelScene({ condition, isClipped, irisColor, activePart, setActivePart }) {
  const scleraTexture = useMemo(() => createScleraVeinsTexture(), []);
  const irisTexture = useMemo(() => createIrisFiberTexture(irisColor), [irisColor]);

  // Determine eyeball stretching scaling based on refractive conditions
  const scaleZ = useMemo(() => {
    if (condition === 'myopia') return 1.18; // Elongated
    if (condition === 'hyperopia') return 0.85; // Flattened
    return 1.0;
  }, [condition]);

  // Clipping Plane definition for Cut-Section View (bisects on the X-axis)
  const clipPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), 0), []);
  const clippingPlanes = isClipped ? [clipPlane] : [];

  return (
    <group rotation={[0.1, -0.4, 0]}>
      {/* 1. Sclera (Eyeball Outer Shell with socket opening at the front +Z) */}
      <mesh 
        onClick={(e) => { e.stopPropagation(); setActivePart('sclera'); }}
        scale={[1, 1, scaleZ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <sphereGeometry args={[1.2, 48, 48, 0, Math.PI * 2, 0.35, Math.PI - 0.35]} />
        <meshStandardMaterial
          map={scleraTexture}
          roughness={0.4}
          metalness={0.02}
          clippingPlanes={clippingPlanes}
          clipShadows
        />
      </mesh>

      {/* Inner Retina Lining (Visible through the pupil opening and on clipping) */}
      <mesh scale={[0.98, 0.98, scaleZ * 0.98]} rotation={[-Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[1.19, 32, 32, 0, Math.PI * 2, 0.35, Math.PI - 0.35]} />
        <meshStandardMaterial
          color="#ef4444"
          roughness={0.85}
          side={THREE.BackSide}
          clippingPlanes={clippingPlanes}
        />
      </mesh>

      {/* 2. Transparent Cornea Cap (Protruding Front Dome) */}
      <mesh 
        onClick={(e) => { e.stopPropagation(); setActivePart('cornea'); }}
        position={[0, 0, 1.12]}
      >
        <sphereGeometry args={[0.43, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.2]} rotation={[Math.PI / 2, 0, 0]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.25}
          roughness={0.0}
          ior={1.376}
          transmission={0.9}
          thickness={0.05}
          clippingPlanes={clippingPlanes}
        />
      </mesh>

      {/* 3. Iris Disc (Flush in Sclera front opening) */}
      <mesh 
        onClick={(e) => { e.stopPropagation(); setActivePart('iris'); }}
        position={[0, 0, 1.12]} 
      >
        <circleGeometry args={[0.42, 32]} />
        <meshStandardMaterial
          map={irisTexture}
          roughness={0.3}
          clippingPlanes={clippingPlanes}
        />
      </mesh>

      {/* 4. Crystalline Lens (Refractive Core) */}
      <mesh 
        onClick={(e) => { e.stopPropagation(); setActivePart('lens'); }}
        position={[0, 0, 0.85]} 
        scale={[1, 1, 0.5]}
      >
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshPhysicalMaterial
          // Turns cloudy-yellow if cataract is active
          color={condition === 'cataract' ? '#eab308' : '#ffffff'}
          transparent
          opacity={condition === 'cataract' ? 0.75 : 0.25}
          roughness={condition === 'cataract' ? 0.5 : 0.05}
          ior={1.41}
          transmission={condition === 'cataract' ? 0.2 : 0.95}
          thickness={0.2}
          clippingPlanes={clippingPlanes}
        />
      </mesh>

      {/* 5. Optics Laser Path Simulation */}
      <LightRays condition={condition} isClipped={isClipped} />

      {/* 6. Optic Nerve Extension (Back) */}
      <mesh 
        onClick={(e) => { e.stopPropagation(); setActivePart('optic-nerve'); }}
        position={[0, 0, -1.5]} 
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
        <meshStandardMaterial
          color="#f1f5f9"
          roughness={0.6}
          clippingPlanes={clippingPlanes}
        />
      </mesh>

      {/* Cross-Section Inner Red Wall Backing */}
      {isClipped && (
        <mesh scale={[0.98, 0.98, scaleZ * 0.98]} position={[0, 0, 0]}>
          <sphereGeometry args={[1.2, 32, 32, Math.PI, Math.PI]} />
          <meshBasicMaterial
            color="#ef4444" // Crimson colored retina lining
            side={THREE.DoubleSide}
            transparent
            opacity={0.35}
          />
        </mesh>
      )}
    </group>
  );
}

// ─── INFO ANNOTATIONS MAPPING ────────────────────────────────────────────────

const ANATOMY_INFO = {
  general: {
    title: "Interactive Eye Model",
    desc: "Rotate and zoom to inspect the eye anatomy. Tweak parameters on the side control panel to simulate vision conditions and see how light rays focus."
  },
  sclera: {
    title: "Sclera (Eyeball Wall)",
    desc: "The white, protective outer layer of the eye. In Myopia (Nearsightedness), the eyeball elongates (stretches along the Z-axis), causing light to focus before reaching the retina."
  },
  cornea: {
    title: "Cornea (Outer Lens)",
    desc: "The dome-shaped, clear front window that bends (refracts) incoming light to begin the focusing process. Its curvature is symmetrical in healthy eyes."
  },
  iris: {
    title: "Iris & Pupil",
    desc: "The colored diaphragm that adjusts pupil size (the central aperture) to regulate the amount of light entering the eye."
  },
  lens: {
    title: "Crystalline Lens",
    desc: "A flexible, double-convex lens that fine-tunes light convergence. In Cataracts, proteins degrade, making this lens cloudy, yellowish, and blocking light transmission."
  },
  'optic-nerve': {
    title: "Optic Nerve",
    desc: "The cable transmitting visual nerve signals from the retina directly to the visual cortex of the brain."
  }
};

// ─── MAIN REACT CONTAINER ───────────────────────────────────────────────────

export default function EyeModel3D({ profile }) {
  const [condition, setCondition] = useState('normal'); // normal, myopia, hyperopia, cataract
  const [isClipped, setIsClipped] = useState(false);
  const [irisColor, setIrisColor] = useState('#2563eb'); // blue default
  const [activePart, setActivePart] = useState('general');

  // Auto-detect patient prescription sphere value on mount
  useEffect(() => {
    if (profile?.glassesPrescription?.od?.sphere) {
      const odSphVal = parseFloat(profile.glassesPrescription.od.sphere);
      if (!isNaN(odSphVal)) {
        if (odSphVal < -0.25) {
          setCondition('myopia');
          setActivePart('sclera');
        } else if (odSphVal > 0.25) {
          setCondition('hyperopia');
          setActivePart('sclera');
        }
      }
    }
  }, [profile]);

  const activeInfo = ANATOMY_INFO[activePart] || ANATOMY_INFO.general;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 font-sans select-none min-h-[580px]">
      
      {/* Left 3D Viewport Column */}
      <div className="lg:col-span-3 bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden h-[540px]">
        {/* Loading Indicator */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <span className="text-[10px] font-bold bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] px-3 py-1 rounded-full uppercase tracking-wider">
            Laser Beam Active
          </span>
          <span className="text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-350 px-3 py-1 rounded-full capitalize">
            Active: {condition}
          </span>
        </div>

        <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} gl={{ localClippingEnabled: true }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} />
          <directionalLight position={[-5, -5, -5]} intensity={0.2} />
          
          <EyeModelScene
            condition={condition}
            isClipped={isClipped}
            irisColor={irisColor}
            activePart={activePart}
            setActivePart={setActivePart}
          />
          <OrbitControls 
            enableZoom={true} 
            enablePan={false}
            maxDistance={8}
            minDistance={2.5}
          />
        </Canvas>

        {/* Dynamic Interactive Hotspot Tag on Canvas */}
        <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 text-left shadow-lg">
          <h4 className="font-extrabold text-sm text-cyan-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            {activeInfo.title}
          </h4>
          <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">{activeInfo.desc}</p>
          {activePart !== 'general' && (
            <button 
              onClick={() => setActivePart('general')}
              className="text-[9px] font-bold text-slate-400 hover:text-slate-200 mt-2 hover:underline cursor-pointer"
            >
              Reset to general info
            </button>
          )}
        </div>
      </div>

      {/* Right Control Dashboard Column */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between h-[540px]">
        <div className="space-y-6">
          <div>
            <h3 className="font-black text-slate-100 text-sm">Visual Optics Simulator</h3>
            <p className="text-slate-400 text-[10px] mt-1 leading-normal">Simulate different visual health impairments and view focal behaviors.</p>
          </div>

          {/* Condition Select Options */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Simulate Condition</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'normal', name: 'Normal (Emmetropic)', desc: 'Light focus matches retina' },
                { id: 'myopia', name: 'Myopia (Near-sighted)', desc: 'Eyeball is too long' },
                { id: 'hyperopia', name: 'Hyperopia (Far-sighted)', desc: 'Eyeball is too flat' },
                { id: 'cataract', name: 'Cataract', desc: 'Lens cloudiness blocks light' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setCondition(opt.id);
                    if (opt.id === 'cataract') setActivePart('lens');
                    else if (opt.id === 'myopia' || opt.id === 'hyperopia') setActivePart('sclera');
                    else setActivePart('general');
                  }}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between h-20 ${
                    condition === opt.id
                      ? "bg-blue-600 border-blue-500 shadow-md text-white"
                      : "bg-slate-800/40 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-slate-100"
                  }`}
                >
                  <span className="font-extrabold text-[10px] block leading-tight">{opt.name}</span>
                  <span className={`text-[8px] font-medium leading-normal block mt-1 ${
                    condition === opt.id ? "text-blue-200" : "text-slate-450"
                  }`}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Iris Color Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Iris Color</label>
            <div className="flex gap-2.5">
              {[
                { hex: '#2563eb', label: 'Blue' },
                { hex: '#16a34a', label: 'Green' },
                { hex: '#7c2d12', label: 'Brown' },
                { hex: '#0f766e', label: 'Hazel' }
              ].map(col => (
                <button
                  key={col.hex}
                  onClick={() => setIrisColor(col.hex)}
                  className={`w-7 h-7 rounded-full border transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center ${
                    irisColor === col.hex ? 'border-white ring-2 ring-blue-500/20' : 'border-slate-800'
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.label}
                >
                  {irisColor === col.hex && <span className="w-1 h-1 rounded-full bg-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Clipping Cross Section Toggle */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3.5 flex justify-between items-center">
            <div>
              <span className="font-bold text-[10px] text-slate-200 block">Cross-Section View</span>
              <span className="text-[8px] text-slate-450 mt-0.5 block">Cut the 3D model in half to look inside.</span>
            </div>
            <button
              onClick={() => setIsClipped(!isClipped)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                isClipped ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform transform ${
                  isClipped ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Bottom Health Advice Badge */}
        <div className="border-t border-slate-800/60 pt-3">
          {profile?.glassesPrescription ? (
            <div className="bg-cyan-950/20 border border-cyan-500/10 text-cyan-400 p-3 rounded-2xl text-[9px] leading-relaxed text-left flex gap-2">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <span className="font-black block uppercase text-[8px] tracking-wider mb-0.5">PRESCRIPTION DETECTED</span>
                Your right eye (OD) SPH is <strong className="text-white">{profile.glassesPrescription.od.sphere} D</strong>. 
                {parseFloat(profile.glassesPrescription.od.sphere) < 0 
                  ? " The simulator has pre-selected Myopia (longer eyeball) to match your visual structure."
                  : " The simulator has pre-selected Hyperopia (flatter eyeball) to match your visual structure."
                }
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/30 border border-slate-800 text-slate-450 p-3 rounded-2xl text-[9px] leading-relaxed text-left">
              No active prescription detected. Use the control panel above to test different visual conditions manually.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
