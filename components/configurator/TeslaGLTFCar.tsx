"use client";

/**
 * GLTF-based Tesla car loader.
 *
 * HOW TO USE:
 * 1. Download GLB models from Sketchfab (free account needed):
 *    - Model 3 Legacy:  https://sketchfab.com/3d-models/free-tesla-model-3-4cea980ba0934fea8e1861e7513e8c58
 *    - Model 3 2020:    https://sketchfab.com/3d-models/tesla-model-3-2020-596bbf266fce430181e6d0e2b1903364
 *    - Model 3 Highland:https://sketchfab.com/3d-models/tesla-model-3-highland-9d7a2a77a2f141c7a7dc0f472be139a6
 *    - Model Y 2021:    https://sketchfab.com/3d-models/tesla-model-y-2021-c0a86cac582d4b33aba0fb1b1912d970
 *    - Model Y 2025:    https://sketchfab.com/3d-models/2025-tesla-model-y-619601e7800d418da5922c4fa7833f74
 *
 * 2. Place downloaded files in: public/models/
 *    - public/models/tesla-model-3-legacy.glb
 *    - public/models/tesla-model-3-highland.glb
 *    - public/models/tesla-model-y.glb
 *
 * 3. This component will load them and apply paint/tint overrides.
 *
 * LICENSE NOTE: Sketchfab free models use CC-BY (Attribution).
 * Add credits in your app footer: e.g. "3D models via Sketchfab"
 */

import { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CarConfig } from "@/types";

const MODEL_PATHS: Record<string, string> = {
  "tesla-model-3-highland": "/models/tesla-model-3-highland.glb",
  "tesla-model-3-legacy": "/models/tesla-model-3-legacy.glb",
  "tesla-model-y": "/models/tesla-model-y.glb",
};

// Mesh name patterns from Sketchfab models that correspond to car body parts
// These vary per model — inspect with <primitive object={scene} /> and drei's useGLTF debug
const BODY_MESH_PATTERNS = ["body", "paint", "car_body", "exterior", "chassis", "hood", "door", "fender", "bumper", "roof", "trunk"];
const GLASS_MESH_PATTERNS = ["glass", "window", "windshield", "windscreen", "transparent"];
const WHEEL_MESH_PATTERNS = ["wheel", "tire", "rim", "tyre"];

interface Props {
  vehicleSlug: string;
  config: CarConfig;
}

export function TeslaGLTFCar({ vehicleSlug, config }: Props) {
  const modelPath = MODEL_PATHS[vehicleSlug] ?? MODEL_PATHS["tesla-model-3-legacy"];
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);

  // Clone scene so each vehicle instance is independent
  const clonedScene = scene.clone(true);

  // Apply config overrides to materials
  useEffect(() => {
    clonedScene.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      const name = node.name.toLowerCase();

      const isBody = BODY_MESH_PATTERNS.some((p) => name.includes(p));
      const isGlass = GLASS_MESH_PATTERNS.some((p) => name.includes(p));
      const isWheel = WHEEL_MESH_PATTERNS.some((p) => name.includes(p));

      if (isGlass) {
        // Apply tint
        const mat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color("#0a1520"),
          transparent: true,
          opacity: 0.25 + config.windowTint * 0.65,
          roughness: 0.05,
          metalness: 0,
          transmission: 1 - config.windowTint * 0.9,
          ior: 1.5,
        });
        node.material = mat;
        node.castShadow = false;
      } else if (isBody) {
        // Apply wrap/paint
        const mat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(config.bodyColor),
          metalness: config.metalness,
          roughness: config.roughness,
          clearcoat: config.wrapType === "gloss" || config.wrapType === "chrome" ? 1.0 : 0.2,
          clearcoatRoughness: config.wrapType === "chrome" ? 0.02 : config.roughness * 0.4,
        });
        node.material = mat;
        node.castShadow = true;
        node.receiveShadow = true;
      } else if (isWheel) {
        node.castShadow = true;
      }
    });
  }, [clonedScene, config]);

  // Subtle idle hover animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.015;
    }
  });

  // Apply lowering
  const lowerY = -(config.lowerAmount / 1000) * 3;

  return (
    <group ref={groupRef} position={[0, lowerY, 0]}>
      <primitive
        object={clonedScene}
        scale={[1, 1, 1]}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      />
    </group>
  );
}

// Preload models for performance
Object.values(MODEL_PATHS).forEach((path) => {
  useGLTF.preload(path);
});
