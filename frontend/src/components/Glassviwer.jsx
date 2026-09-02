import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage } from '@react-three/drei';

function Model({ modelPath }) {
  const { scene } = useGLTF(modelPath);
  // Clone the scene so that multiple canvases can display it independently without reference hijacking
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  return <primitive object={clonedScene} scale={1.5} />;
}

export default function GlassesViewer({ modelPath, height = "h-[400px]", autoRotate = false, enableZoom = true, isListMode = false }) {
  return (
    <div className={`w-full ${height} bg-slate-50 rounded-xl overflow-hidden border border-slate-100`}>
      <Canvas 
        camera={{ position: [0, 0, 4], fov: 45 }}
        frameloop={isListMode ? "demand" : "always"}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />
        <Suspense fallback={
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#deff9a" wireframe />
          </mesh>
        }>
          <Stage environment="city" intensity={0.6} contactShadow={true}>
            <Model modelPath={modelPath} />
          </Stage>
        </Suspense>
        {!isListMode && (
          <OrbitControls enableZoom={enableZoom} enablePan={false} autoRotate={autoRotate} />
        )}
      </Canvas>
    </div>
  );
}