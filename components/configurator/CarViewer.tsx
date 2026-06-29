"use client";

import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import { Maximize2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import type { CarConfig } from "@/types";
import { useConfigurator } from "@/lib/stores/configurator";

const Canvas = dynamic(() => import("@react-three/fiber").then((m) => m.Canvas), { ssr: false });
const OrbitControls = dynamic(
  () => import("@react-three/drei").then((m) => m.OrbitControls),
  { ssr: false }
);
const CarScene = dynamic(
  () => import("./CarScene").then((m) => m.CarScene),
  { ssr: false }
);

interface CarViewerProps {
  vehicleSlug: string;
}

export function CarViewer({ vehicleSlug }: CarViewerProps) {
  const { carConfig } = useConfigurator();
  const [resetKey, setResetKey] = useState(0);

  return (
    <div className="relative w-full h-full bg-[#0d0d0d] rounded-2xl overflow-hidden">
      {/* 3D Canvas */}
      <Suspense fallback={<ViewerSkeleton />}>
        <Canvas
          key={resetKey}
          shadows
          camera={{ position: [4.5, 2.2, 4.5], fov: 40, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: false, toneMapping: 4, toneMappingExposure: 0.85 }}
          style={{ background: "linear-gradient(180deg, #111118 0%, #0a0a0a 100%)" }}
        >
          <Suspense fallback={null}>
            <CarScene config={carConfig} vehicleSlug={vehicleSlug} />
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              autoRotate
              autoRotateSpeed={0.5}
              minDistance={3}
              maxDistance={10}
              maxPolarAngle={Math.PI / 2.1}
              minPolarAngle={0.1}
              target={[0, 0, 0]}
            />
          </Suspense>
        </Canvas>
      </Suspense>

      {/* Controls overlay */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setResetKey((k) => k + 1)}
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm"
          title="Reset camera"
        >
          <RotateCcw size={14} className="text-white/60" />
        </button>
      </div>

      {/* Drag hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <span className="text-xs text-white/30 tracking-wider">drag to rotate · scroll to zoom</span>
      </div>

      {/* Vehicle label */}
      <div className="absolute top-4 left-4">
        <span className="text-xs font-medium text-white/40 tracking-wider uppercase">
          {vehicleSlug.replace(/tesla-|model-/g, "Tesla ").replace(/-/g, " ")}
        </span>
      </div>
    </div>
  );
}

function ViewerSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#0d0d0d]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-white/30 text-sm">Loading 3D Model</p>
      </div>
    </div>
  );
}
