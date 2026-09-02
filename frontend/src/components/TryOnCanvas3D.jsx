import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

class TryOnErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("3D Try-On Rendering Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-[1px] rounded-2xl z-20 text-white p-4 text-center pointer-events-none">
          <p className="text-xs text-red-400 font-semibold bg-slate-900/90 px-3 py-1.5 rounded-lg border border-red-500/20">
            ⚠️ 3D Try-On Unavailable (WebGL/Asset Error)
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Inner component inside Canvas to handle the animation frame loops at 60 FPS
function GlassesFollower({ modelPath, landmarksRef, isMirrored, calibration = {} }) {
  const glassesRef = useRef();
  const { scene } = useGLTF(modelPath);

  const {
    scaleMultiplier = 1.0,
    xOffset = 0,
    yOffset = 0,
    zOffset = 0,
    rotationX = 0,
    rotationY = 0,
    rotationZ = 0
  } = calibration || {};

  // Clone the scene so that multiple canvases can display it independently without reference hijacking
  const templeMeshes = useRef([]);

  const clonedScene = useMemo(() => {
    if (!scene) return null;
    templeMeshes.current = [];
    const clone = scene.clone();
    clone.traverse((child) => {
      if (child.isMesh) {
        // Disable shadow passes for mobile GPU rendering optimization
        child.castShadow = false;
        child.receiveShadow = false;

        const matName = (child.material?.name || "").toLowerCase();
        const meshName = (child.name || "").toLowerCase();
        const parentName = (child.parent?.name || "").toLowerCase();

        // Detect if this mesh is glass / lens
        const isGlass =
          matName.includes("glass") ||
          matName.includes("lens") ||
          matName.includes("trans") ||
          meshName.includes("glass") ||
          meshName.includes("lens") ||
          meshName.includes("trans");

        // Universal Temple Arm Detection (Geometric + Naming):
        // Catches handles, legs, stems, hinges, dushka, brow, ear hooks across all 3D formats
        const isTempleName =
          meshName.includes("temple") ||
          meshName.includes("arm") ||
          meshName.includes("leg") ||
          meshName.includes("stem") ||
          meshName.includes("dushka") ||
          meshName.includes("brow") ||
          meshName.includes("hinge") ||
          meshName.includes("ear") ||
          meshName.includes("handle") ||
          meshName.includes("object_6") ||
          meshName.includes("object_7") ||
          meshName.includes("object_9") ||
          meshName.includes("cube.002") ||
          meshName.includes("cube.003") ||
          meshName.includes("cube.004") ||
          meshName.includes("cube.007") ||
          meshName.includes("cylinder.001") ||
          meshName.includes("cylinder.006") ||
          meshName.includes("empty") ||
          parentName.includes("temple") ||
          parentName.includes("arm") ||
          parentName.includes("leg") ||
          parentName.includes("dushka") ||
          parentName.includes("brow") ||
          parentName.includes("handle") ||
          parentName.includes("empty");

        if (!isGlass && isTempleName) {
          child.userData.isTemple = true;
          templeMeshes.current.push(child);
        }

        if (child.material) {
          child.material = child.material.clone();
          child.material.side = THREE.DoubleSide;

          // Enhanced material parameters for 3D realism
          if (isGlass) {
            child.renderOrder = 2; // Render lenses after frame & head occlusion
            child.material = new THREE.MeshPhysicalMaterial({
              color: child.material.color || new THREE.Color(0xffffff),
              transparent: true,
              opacity: 0.35,
              transmission: 0.9,
              roughness: 0.0,
              metalness: 0.05,
              ior: 1.5,
              thickness: 0.2,
              clearcoat: 1.0,
              clearcoatRoughness: 0.0,
              side: THREE.DoubleSide,
              depthWrite: false
            });
          } else {
            child.renderOrder = 1;
            child.material.depthWrite = true;
            child.material.depthTest = true;
            // For frames, enable realistic metallic reflections and smooth surface coat
            if (
              matName.includes("metal") ||
              meshName.includes("metal") ||
              matName.includes("gold") ||
              matName.includes("silver") ||
              matName.includes("chrome") ||
              meshName.includes("frame")
            ) {
              child.material.metalness = 0.95;
              child.material.roughness = 0.15;
            } else {
              child.material.metalness = 0.1;
              child.material.roughness = 0.3;
            }
          }
        }
      }
    });
    return clone;
  }, [scene]);

  // Compute the bounding box of the cloned scene and find its width and center offsets
  const { modelWidth, centerOffset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Set the pivot at the nose bridge: X/Y center, and front-most Z face of the glasses
    return {
      modelWidth: size.x > 0.001 ? size.x : 1.5,
      centerOffset: new THREE.Vector3(center.x, center.y, box.max.z)
    };
  }, [clonedScene]);

  const { camera, size } = useThree();

  useFrame(() => {
    if (!glassesRef.current) return;

    const landmarks = landmarksRef.current;
    if (!landmarks || landmarks.length === 0) {
      glassesRef.current.visible = false;
      return;
    }

    glassesRef.current.visible = true;
    const bridge = landmarks[168];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    const leftTemple = landmarks[127];
    const rightTemple = landmarks[356];
    const leftEar = landmarks[234] || landmarks[127];
    const rightEar = landmarks[454] || landmarks[356];
    const forehead = landmarks[10];
    const chin = landmarks[152];

    if (!bridge || !leftEye || !rightEye || !leftTemple || !rightTemple || !forehead || !chin) {
      glassesRef.current.visible = false;
      return;
    }

    const mirrorMultiplier = isMirrored ? -1 : 1;
    const rotationMultiplier = isMirrored ? 1 : -1;

    // 1. DEPTH (Z) CALCULATION BASED ON EYE/TEMPLE/EAR SPAN
    const rawDx = rightTemple.x - leftTemple.x;
    const rawDy = rightTemple.y - leftTemple.y;
    const templeDistance = Math.sqrt(rawDx * rawDx + rawDy * rawDy);

    // Calibrate the focal distance constant.
    const zDistance = 0.82 / Math.max(templeDistance, 0.05);
    const targetZ = camera.position.z - zDistance + (zOffset * 0.05);

    // 2. TRANSLATION (SCREEN TO 3D WORLD PROJECTION AT THE FACE DEPTH)
    const vFov = (camera.fov * Math.PI) / 180;
    const hWorldAtDepth = 2 * Math.tan(vFov / 2) * zDistance;
    const aspect = size.width / size.height;
    const wWorldAtDepth = hWorldAtDepth * aspect;

    // Standard webcam stream aspect ratio is 4:3 (1.333)
    const videoAspect = 4 / 3;
    const containerAspect = aspect;

    let bridgeX = bridge.x;
    let bridgeY = bridge.y;
    let templeDistNorm = templeDistance;

    if (containerAspect < videoAspect) {
      // Container is taller/narrower than 4:3 video (e.g. mobile portrait mode)
      // 2D video image is cropped horizontally by object-cover
      const scaleX = videoAspect / containerAspect;
      bridgeX = (bridge.x - 0.5) * scaleX + 0.5;
      templeDistNorm = templeDistance * scaleX;
    } else if (containerAspect > videoAspect) {
      // Container is wider than 4:3 video (e.g. ultra-wide desktop view)
      // 2D video image is cropped vertically by object-cover
      const scaleY = containerAspect / videoAspect;
      bridgeY = (bridge.y - 0.5) * scaleY + 0.5;
    }

    // Map adjusted bridge position to Three.js coordinates + custom per-frame offsets
    const targetX = ((bridgeX - 0.5) * wWorldAtDepth * mirrorMultiplier) + (xOffset * 0.05 * mirrorMultiplier);
    const targetY = ((0.5 - bridgeY) * hWorldAtDepth) + (yOffset * 0.05);

    // Smooth position updates using linear interpolation (lerp)
    glassesRef.current.position.x = THREE.MathUtils.lerp(glassesRef.current.position.x, targetX, 0.25);
    glassesRef.current.position.y = THREE.MathUtils.lerp(glassesRef.current.position.y, targetY, 0.25);
    glassesRef.current.position.z = THREE.MathUtils.lerp(glassesRef.current.position.z, targetZ, 0.25);

    // 3. SCALE CALCULATION (Device-Adaptive Solution 1: Preserves 100% exact laptop scale, adapts on mobile)
    const isMobile = (typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) || size.width < size.height;

    // Laptop landscape keeps its proven 0.95 factor; Mobile portrait applies aspect-ratio compensation
    let fitFactor = isMirrored ? 0.95 : 0.85;
    if (isMobile) {
      const mobileAspectCompensation = containerAspect < videoAspect ? (containerAspect / videoAspect) : 0.75;
      fitFactor = fitFactor * Math.max(0.50, mobileAspectCompensation);
    }

    const faceWidthWorld = templeDistNorm * wWorldAtDepth;
    const desiredWidth = faceWidthWorld * fitFactor;
    const targetScale = (desiredWidth / modelWidth) * (scaleMultiplier || 1.0);

    // Smooth scale updates
    const currentScale = glassesRef.current.scale.x;
    const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.25);
    glassesRef.current.scale.set(nextScale, nextScale, nextScale);

    // 4. ORIENTATION (3D RIGID BASIS MATRIX & ANATOMICAL EAR ANCHORING)
    // Construct orthonormal 3D basis vectors directly from eye and ear landmarks
    const vecX = new THREE.Vector3(
      (rightEye.x - leftEye.x) * mirrorMultiplier,
      -(rightEye.y - leftEye.y),
      -(rightEye.z - leftEye.z) * 0.75
    ).normalize();

    const vecYRaw = new THREE.Vector3(
      (forehead.x - chin.x) * mirrorMultiplier,
      -(forehead.y - chin.y),
      -(forehead.z - chin.z) * 0.75
    );

    // Z Axis: Perpendicular normal vector pointing forward out of the face
    const vecZ = new THREE.Vector3().crossVectors(vecX, vecYRaw).normalize();

    // True Orthonormal Y Axis (Up vector): Cross product of Z and X
    const vecY = new THREE.Vector3().crossVectors(vecZ, vecX).normalize();

    // Build 3D Transformation Basis Matrix
    const rotationMatrix = new THREE.Matrix4().makeBasis(vecX, vecY, vecZ);
    const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);

    // glTF specification defines front-facing geometry along -Z axis.
    // Apply 180° Y rotation so the front frame faces the camera and temple arms point back toward ears.
    const gltfForwardQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    targetQuaternion.multiply(gltfForwardQuat);

    // Apply custom frame calibration rotations (Pitch X, Yaw Y, Roll Z) in Quaternion space
    if (rotationX || rotationY || rotationZ) {
      const rotXRad = ((rotationX || 0) * Math.PI) / 180;
      const rotYRad = ((rotationY || 0) * Math.PI) / 180;
      const rotZRad = ((rotationZ || 0) * Math.PI) / 180;

      const calibQuat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(rotXRad, rotYRad, rotZRad, 'YXZ')
      );
      targetQuaternion.multiply(calibQuat);
    }

    // Smooth rotation updates using Quaternion Spherical Linear Interpolation (slerp)
    glassesRef.current.quaternion.slerp(targetQuaternion, 0.25);

    // 5. DYNAMIC TEMPLE/HANDLE VISIBILITY (Front View = Clean & Hidden, Head Turn = Visible & Ear-Anchored)
    // When looking straight into the mirror (Yaw angle < 7.5°), temple arms are hidden to prevent lens intrusion
    // When rotating head left or right (Yaw angle >= 7.5°), temple arms dynamically appear over the ear
    const headYawRad = Math.atan2(Math.abs(vecZ.x), Math.abs(vecZ.z));
    const headYawDeg = headYawRad * (180 / Math.PI);
    const showTemples = headYawDeg >= 7.5;

    if (templeMeshes.current && templeMeshes.current.length > 0) {
      templeMeshes.current.forEach((mesh) => {
        mesh.visible = showTemples;
      });
    }
  });

  // Anatomical Head Depth Occluder (Clips temple arms behind the ears and skull)
  const headOcclusionGeometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(1.0, 32, 24);
    geo.scale(0.68, 1.05, 0.80);
    return geo;
  }, []);

  const headOcclusionMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      colorWrite: false, // Invisible
      depthWrite: true   // Depth buffer write
    });
  }, []);

  return (
    <group ref={glassesRef}>
      {/* Invisible Anatomical Head Depth Mask */}
      <mesh
        renderOrder={0}
        geometry={headOcclusionGeometry}
        material={headOcclusionMaterial}
        position={[0, -0.15, -0.90]}
      />

      {/* 3D Glasses Model */}
      <primitive
        object={clonedScene}
        position={[-centerOffset.x, -centerOffset.y, -centerOffset.z]}
      />
    </group>
  );
}

export default function TryOnCanvas3D({ modelPath, landmarksRef, isMirrored = true, calibration = {} }) {
  const resolvedModelPath = useMemo(() => {
    if (!modelPath) return null;
    if (modelPath.startsWith('/src/assets/')) {
      if (!modelPath.includes('/models/')) {
        return modelPath.replace('/src/assets/', '/src/assets/models/');
      }
    }
    return modelPath;
  }, [modelPath]);

  if (!resolvedModelPath) return null;

  return (
    <TryOnErrorBoundary>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 40 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 20
        }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[0, 10, 5]} intensity={1.0} />
        <directionalLight position={[0, -5, -2]} intensity={0.3} />
        <Suspense fallback={null}>
          <GlassesFollower modelPath={resolvedModelPath} landmarksRef={landmarksRef} isMirrored={isMirrored} calibration={calibration} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </TryOnErrorBoundary>
  );
}

