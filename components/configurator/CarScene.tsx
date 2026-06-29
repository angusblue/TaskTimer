"use client";

import { useRef, useMemo, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import type { CarConfig } from "@/types";
import { WRAP_COLORS } from "@/lib/constants";

// When GLB files are placed in public/models/, swap the Car component to TeslaGLTFCar:
// import { TeslaGLTFCar } from "./TeslaGLTFCar";
// Then replace <Car ... /> with <TeslaGLTFCar vehicleSlug={vehicleSlug} config={config} />

interface CarSceneProps {
  config: CarConfig;
  vehicleSlug: string;
}

export function CarScene({ config, vehicleSlug }: CarSceneProps) {
  const isModelY = vehicleSlug === "tesla-model-y";

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-5, 4, -5]} intensity={0.4} color="#4488ff" />
      <pointLight position={[0, 5, 0]} intensity={0.6} color="#ffffff" />

      <Environment preset="city" />

      <Car config={config} isModelY={isModelY} />

      {/* Studio floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.85, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0a0a0a"
          metalness={0.8}
          mirror={0}
        />
      </mesh>

      <ContactShadows
        position={[0, -0.84, 0]}
        opacity={0.6}
        scale={6}
        blur={2}
        far={4}
        color="#000000"
      />
    </>
  );
}

function Car({ config, isModelY }: { config: CarConfig; isModelY: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  // Animate subtle hover
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.015;
    }
  });

  const lowerY = -(config.lowerAmount / 1000) * 2;
  const bodyY = lowerY;

  const bodyMaterial = useMemo(() => {
    const colorKey = Object.entries(WRAP_COLORS).find(([, v]) => v.hex === config.bodyColor)?.[0];
    const wrapData = colorKey ? WRAP_COLORS[colorKey] : null;

    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(config.bodyColor),
      metalness: config.metalness,
      roughness: config.roughness,
      clearcoat: config.wrapType === "gloss" || config.wrapType === "chrome" ? 1.0 : 0.2,
      clearcoatRoughness: config.wrapType === "chrome" ? 0.05 : config.roughness * 0.5,
      reflectivity: config.metalness * 0.8 + 0.2,
    });
  }, [config.bodyColor, config.metalness, config.roughness, config.wrapType]);

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#0a1520"),
        metalness: 0,
        roughness: 0.05,
        transmission: 1 - config.windowTint * 0.8,
        opacity: 0.3 + config.windowTint * 0.65,
        transparent: true,
        ior: 1.5,
        thickness: 0.1,
      }),
    [config.windowTint]
  );

  const trimMaterial = new THREE.MeshStandardMaterial({ color: "#1a1a1a", metalness: 0.8, roughness: 0.3 });
  const wheelRimMaterial = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(config.wheelColor), metalness: 0.9, roughness: 0.1 });
  const tireRubberMaterial = new THREE.MeshStandardMaterial({ color: "#111111", roughness: 0.9 });

  // Model Y is wider and taller
  const scaleY = isModelY ? 1.15 : 1.0;
  const widthScale = isModelY ? 1.08 : 1.0;

  return (
    <group ref={groupRef} position={[0, bodyY, 0]}>
      {/* === MAIN BODY === */}
      <group>
        {/* Lower body sill */}
        <mesh position={[0, -0.22, 0]} castShadow>
          <boxGeometry args={[4.2, 0.28, 1.88 * widthScale]} />
          <primitive object={bodyMaterial} />
        </mesh>

        {/* Rear quarter / trunk area */}
        <mesh position={[-1.4, 0.05, 0]} castShadow>
          <boxGeometry args={[1.4, 0.52 * scaleY, 1.84 * widthScale]} />
          <primitive object={bodyMaterial} />
        </mesh>

        {/* Center body section */}
        <mesh position={[0.2, 0.05, 0]} castShadow>
          <boxGeometry args={[1.6, 0.52 * scaleY, 1.88 * widthScale]} />
          <primitive object={bodyMaterial} />
        </mesh>

        {/* Front hood area */}
        <mesh position={[1.55, -0.04, 0]} castShadow>
          <boxGeometry args={[1.3, 0.34 * scaleY, 1.82 * widthScale]} />
          <primitive object={bodyMaterial} />
        </mesh>

        {/* Front bumper */}
        <mesh position={[2.16, -0.18, 0]} castShadow>
          <boxGeometry args={[0.12, 0.24, 1.7 * widthScale]} />
          <primitive object={bodyMaterial} />
        </mesh>

        {/* Rear bumper */}
        <mesh position={[-2.16, -0.18, 0]} castShadow>
          <boxGeometry args={[0.12, 0.24, 1.7 * widthScale]} />
          <primitive object={bodyMaterial} />
        </mesh>

        {/* Door panels */}
        <mesh position={[0.35, 0.08, 0.945 * widthScale]} castShadow>
          <boxGeometry args={[2.1, 0.58 * scaleY, 0.04]} />
          <primitive object={bodyMaterial} />
        </mesh>
        <mesh position={[0.35, 0.08, -0.945 * widthScale]} castShadow>
          <boxGeometry args={[2.1, 0.58 * scaleY, 0.04]} />
          <primitive object={bodyMaterial} />
        </mesh>
      </group>

      {/* === CABIN / ROOF === */}
      <group>
        {/* A-pillar area + front roof */}
        <mesh position={[0.85, 0.58 * scaleY, 0]} castShadow>
          <boxGeometry args={[0.55, 0.68 * scaleY, 1.56 * widthScale]} />
          <primitive object={bodyMaterial} />
        </mesh>

        {/* Main roof */}
        <mesh position={[-0.1, 0.72 * scaleY, 0]} castShadow>
          <boxGeometry args={[1.6, 0.14, 1.54 * widthScale]} />
          <primitive object={bodyMaterial} />
        </mesh>

        {/* Rear C-pillar */}
        <mesh position={[-1.0, 0.52 * scaleY, 0]} castShadow>
          <boxGeometry args={[0.7, 0.48 * scaleY, 1.56 * widthScale]} />
          <primitive object={bodyMaterial} />
        </mesh>

        {/* Panoramic glass roof */}
        <mesh position={[-0.1, 0.76 * scaleY, 0]}>
          <boxGeometry args={[1.4, 0.04, 1.3 * widthScale]} />
          <primitive object={glassMaterial} />
        </mesh>
      </group>

      {/* === WINDOWS === */}
      {/* Windshield */}
      <mesh position={[1.1, 0.44 * scaleY, 0]} rotation={[0, 0, -0.55]}>
        <planeGeometry args={[0.85, 1.38 * widthScale]} />
        <primitive object={glassMaterial} />
      </mesh>

      {/* Rear window */}
      <mesh position={[-1.42, 0.34 * scaleY, 0]} rotation={[0, 0, 0.6]}>
        <planeGeometry args={[0.65, 1.36 * widthScale]} />
        <primitive object={glassMaterial} />
      </mesh>

      {/* Side windows - driver */}
      <mesh position={[0.55, 0.52 * scaleY, 0.94 * widthScale]}>
        <planeGeometry args={[0.85, 0.4]} />
        <primitive object={glassMaterial} />
      </mesh>
      <mesh position={[-0.35, 0.52 * scaleY, 0.94 * widthScale]}>
        <planeGeometry args={[0.75, 0.4]} />
        <primitive object={glassMaterial} />
      </mesh>

      {/* Side windows - passenger */}
      <mesh position={[0.55, 0.52 * scaleY, -0.94 * widthScale]}>
        <planeGeometry args={[0.85, 0.4]} />
        <primitive object={glassMaterial} />
      </mesh>
      <mesh position={[-0.35, 0.52 * scaleY, -0.94 * widthScale]}>
        <planeGeometry args={[0.75, 0.4]} />
        <primitive object={glassMaterial} />
      </mesh>

      {/* === LIGHTS === */}
      {/* Headlights (sleek LED bar style for Model 3 Highland) */}
      <mesh position={[2.17, -0.05, 0]}>
        <boxGeometry args={[0.04, 0.06, 1.5 * widthScale]} />
        <meshStandardMaterial color="#ddeeff" emissive="#88aaff" emissiveIntensity={0.4} />
      </mesh>

      {/* Taillights */}
      <mesh position={[-2.17, -0.05, 0]}>
        <boxGeometry args={[0.04, 0.06, 1.5 * widthScale]} />
        <meshStandardMaterial color="#ff2222" emissive="#ff4444" emissiveIntensity={0.5} />
      </mesh>

      {/* === TRIM === */}
      {/* Window trim */}
      <mesh position={[0.15, 0.68 * scaleY, 0.955 * widthScale]}>
        <boxGeometry args={[2.2, 0.04, 0.02]} />
        <primitive object={trimMaterial} />
      </mesh>
      <mesh position={[0.15, 0.68 * scaleY, -0.955 * widthScale]}>
        <boxGeometry args={[2.2, 0.04, 0.02]} />
        <primitive object={trimMaterial} />
      </mesh>

      {/* Rocker panels */}
      <mesh position={[0.2, -0.34, 0.96 * widthScale]}>
        <boxGeometry args={[3.0, 0.08, 0.04]} />
        <primitive object={trimMaterial} />
      </mesh>
      <mesh position={[0.2, -0.34, -0.96 * widthScale]}>
        <boxGeometry args={[3.0, 0.08, 0.04]} />
        <primitive object={trimMaterial} />
      </mesh>

      {/* === WHEELS === */}
      <WheelSet
        config={config}
        positions={[
          [1.45, -0.55, 0.92 * widthScale],
          [1.45, -0.55, -0.92 * widthScale],
          [-1.45, -0.55, 0.92 * widthScale],
          [-1.45, -0.55, -0.92 * widthScale],
        ]}
        rimMaterial={wheelRimMaterial}
        tireMaterial={tireRubberMaterial}
      />

      {/* === SPOILER === */}
      {config.hasSpoiler && (
        <Spoiler type={config.spoilerType} bodyMaterial={bodyMaterial} bodyY={0} isModelY={isModelY} />
      )}

      {/* === BODY KIT === */}
      {config.hasBodyKit && (
        <BodyKit bodyMaterial={bodyMaterial} widthScale={widthScale} />
      )}

      {/* === MUD FLAPS === */}
      {config.hasMudflaps && (
        <>
          <mesh position={[1.95, -0.48, 0.85 * widthScale]}>
            <boxGeometry args={[0.04, 0.2, 0.18]} />
            <primitive object={trimMaterial} />
          </mesh>
          <mesh position={[1.95, -0.48, -0.85 * widthScale]}>
            <boxGeometry args={[0.04, 0.2, 0.18]} />
            <primitive object={trimMaterial} />
          </mesh>
          <mesh position={[-0.92, -0.48, 0.85 * widthScale]}>
            <boxGeometry args={[0.04, 0.2, 0.18]} />
            <primitive object={trimMaterial} />
          </mesh>
          <mesh position={[-0.92, -0.48, -0.85 * widthScale]}>
            <boxGeometry args={[0.04, 0.2, 0.18]} />
            <primitive object={trimMaterial} />
          </mesh>
        </>
      )}
    </group>
  );
}

function WheelSet({
  config,
  positions,
  rimMaterial,
  tireMaterial,
}: {
  config: CarConfig;
  positions: [number, number, number][];
  rimMaterial: THREE.Material;
  tireMaterial: THREE.Material;
}) {
  return (
    <>
      {positions.map((pos, i) => (
        <Wheel key={i} position={pos} wheelType={config.wheelType} rimMaterial={rimMaterial} tireMaterial={tireMaterial} />
      ))}
    </>
  );
}

function Wheel({
  position,
  wheelType,
  rimMaterial,
  tireMaterial,
}: {
  position: [number, number, number];
  wheelType: string;
  rimMaterial: THREE.Material;
  tireMaterial: THREE.Material;
}) {
  const spokeCount = wheelType.includes("mesh") ? 8 : wheelType.includes("turbine") ? 5 : wheelType.includes("sport") ? 5 : 5;
  const rimRadius = wheelType.includes("21") ? 0.28 : wheelType.includes("20") ? 0.265 : 0.25;

  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      {/* Tire */}
      <mesh castShadow>
        <cylinderGeometry args={[rimRadius + 0.045, rimRadius + 0.045, 0.2, 24]} />
        <primitive object={tireMaterial} />
      </mesh>

      {/* Rim outer ring */}
      <mesh castShadow>
        <torusGeometry args={[rimRadius, 0.025, 8, 24]} />
        <primitive object={rimMaterial} />
      </mesh>

      {/* Center hub */}
      <mesh>
        <cylinderGeometry args={[0.06, 0.06, 0.22, 12]} />
        <primitive object={rimMaterial} />
      </mesh>

      {/* Spokes */}
      {Array.from({ length: spokeCount }).map((_, i) => {
        const angle = (i / spokeCount) * Math.PI * 2;
        const x = Math.cos(angle) * rimRadius * 0.6;
        const z = Math.sin(angle) * rimRadius * 0.6;
        return (
          <mesh key={i} position={[x, 0, z]} rotation={[0, 0, angle]}>
            <boxGeometry args={[rimRadius * 0.08, 0.18, rimRadius * 0.9]} />
            <primitive object={rimMaterial} />
          </mesh>
        );
      })}

      {/* Center cap */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 8]} />
        <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

function Spoiler({ type, bodyMaterial, bodyY, isModelY }: { type: string; bodyMaterial: THREE.Material; bodyY: number; isModelY: boolean }) {
  if (type === "lip") {
    return (
      <mesh position={[-1.88, 0.08, 0]} castShadow>
        <boxGeometry args={[0.06, 0.08, 1.5]} />
        <meshPhysicalMaterial color="#111" metalness={0.9} roughness={0.1} clearcoat={1} />
      </mesh>
    );
  }
  if (type === "ducktail") {
    return (
      <mesh position={[-1.88, 0.14, 0]} rotation={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.12, 0.1, 1.55]} />
        <meshPhysicalMaterial color="#111" metalness={0.9} roughness={0.1} clearcoat={1} />
      </mesh>
    );
  }
  if (type === "wing") {
    return (
      <group position={[-1.8, 0.3, 0]}>
        {/* Main wing element */}
        <mesh castShadow>
          <boxGeometry args={[0.2, 0.05, 1.7]} />
          <meshPhysicalMaterial color="#111" metalness={0.9} roughness={0.05} clearcoat={1} />
        </mesh>
        {/* End plates */}
        <mesh position={[0, -0.1, 0.88]}>
          <boxGeometry args={[0.2, 0.3, 0.04]} />
          <meshPhysicalMaterial color="#111" metalness={0.9} roughness={0.05} clearcoat={1} />
        </mesh>
        <mesh position={[0, -0.1, -0.88]}>
          <boxGeometry args={[0.2, 0.3, 0.04]} />
          <meshPhysicalMaterial color="#111" metalness={0.9} roughness={0.05} clearcoat={1} />
        </mesh>
        {/* Supports */}
        <mesh position={[0, -0.15, 0.6]}>
          <boxGeometry args={[0.04, 0.32, 0.04]} />
          <primitive object={bodyMaterial} />
        </mesh>
        <mesh position={[0, -0.15, -0.6]}>
          <boxGeometry args={[0.04, 0.32, 0.04]} />
          <primitive object={bodyMaterial} />
        </mesh>
      </group>
    );
  }
  return null;
}

function BodyKit({ bodyMaterial, widthScale }: { bodyMaterial: THREE.Material; widthScale: number }) {
  return (
    <>
      {/* Front splitter */}
      <mesh position={[2.22, -0.35, 0]}>
        <boxGeometry args={[0.08, 0.06, 1.6 * widthScale]} />
        <meshPhysicalMaterial color="#111" metalness={0.9} roughness={0.1} clearcoat={1} />
      </mesh>

      {/* Side skirts */}
      <mesh position={[0.2, -0.39, 0.98 * widthScale]}>
        <boxGeometry args={[2.8, 0.1, 0.06]} />
        <meshPhysicalMaterial color="#111" metalness={0.9} roughness={0.1} clearcoat={1} />
      </mesh>
      <mesh position={[0.2, -0.39, -0.98 * widthScale]}>
        <boxGeometry args={[2.8, 0.1, 0.06]} />
        <meshPhysicalMaterial color="#111" metalness={0.9} roughness={0.1} clearcoat={1} />
      </mesh>

      {/* Rear diffuser */}
      <mesh position={[-2.22, -0.32, 0]}>
        <boxGeometry args={[0.1, 0.12, 1.5 * widthScale]} />
        <meshPhysicalMaterial color="#111" metalness={0.9} roughness={0.1} clearcoat={1} />
      </mesh>
    </>
  );
}
