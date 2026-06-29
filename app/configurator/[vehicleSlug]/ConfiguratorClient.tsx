"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { CarViewer } from "@/components/configurator/CarViewer";
import { ModPanel } from "@/components/configurator/ModPanel";
import { BuildSummary } from "@/components/configurator/BuildSummary";
import { AIGenerator } from "@/components/configurator/AIGenerator";
import { useConfigurator } from "@/lib/stores/configurator";
import type { Vehicle, ModCategory, Mod } from "@/types";

interface Props {
  vehicle: Vehicle;
  categories: ModCategory[];
  vehicleSlug: string;
}

export function ConfiguratorClient({ vehicle, categories, vehicleSlug }: Props) {
  const { setVehicle, getModList } = useConfigurator();

  useEffect(() => {
    setVehicle(vehicle);
  }, [vehicle, setVehicle]);

  const allMods: Mod[] = categories.flatMap((c) => c.mods ?? []);

  return (
    <div className="pt-16 h-screen flex flex-col bg-[#0a0a0a]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
        <div>
          <p className="text-white/40 text-xs font-medium tracking-wider uppercase">Configurator</p>
          <h1 className="text-white font-bold text-lg">
            Tesla {vehicle.name ?? vehicle.model} {vehicle.year}
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-2 text-white/30 text-sm">
          <span>{getModList().length} mods selected</span>
        </div>
      </div>

      {/* Main layout: 3 columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Mod panel */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-80 flex-shrink-0 border-r border-white/5 flex flex-col overflow-hidden"
        >
          {categories.length > 0 ? (
            <ModPanel categories={categories} vehicleSlug={vehicleSlug} />
          ) : (
            <DemoModPanel vehicleSlug={vehicleSlug} />
          )}
        </motion.div>

        {/* Center: 3D Viewer */}
        <div className="flex-1 p-4 flex flex-col gap-4 min-w-0">
          <div className="flex-1 min-h-0">
            <CarViewer vehicleSlug={vehicleSlug} />
          </div>

          {/* AI Generator below viewer */}
          <div className="flex-shrink-0">
            <AIGenerator vehicleSlug={vehicleSlug} availableMods={allMods} />
          </div>
        </div>

        {/* Right: Build summary */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-72 flex-shrink-0 border-l border-white/5 flex flex-col overflow-hidden"
        >
          <BuildSummary
            vehicleSlug={vehicleSlug}
            vehicleName={`${vehicle.name ?? vehicle.model} ${vehicle.year}`}
          />
        </motion.div>
      </div>
    </div>
  );
}

// Demo mod panel when no DB is connected
function DemoModPanel({ vehicleSlug }: { vehicleSlug: string }) {
  const { applyModToConfig, carConfig } = useConfigurator();

  const demoCategories = [
    { slug: "wrap", name: "Wrap & Paint" },
    { slug: "wheels", name: "Wheels" },
    { slug: "tint", name: "Window Tint" },
    { slug: "spoilers", name: "Spoilers" },
    { slug: "lowering", name: "Suspension" },
  ];

  const demoWrapColors = [
    { label: "Midnight Black", hex: "#0a0a0a", metalness: 0.3, roughness: 0.5 },
    { label: "Pearl White", hex: "#f5f5f0", metalness: 0.2, roughness: 0.3 },
    { label: "Deep Blue", hex: "#1a3a5c", metalness: 0.7, roughness: 0.3 },
    { label: "Racing Red", hex: "#cc1a1a", metalness: 0.3, roughness: 0.4 },
    { label: "Stealth Grey", hex: "#4a4a4a", metalness: 0.1, roughness: 0.8 },
    { label: "Midnight Purple", hex: "#2a0a4a", metalness: 0.4, roughness: 0.4 },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex gap-1.5 p-3 overflow-x-auto border-b border-white/5">
        {demoCategories.map((cat) => (
          <span key={cat.slug} className="text-xs text-white/40 px-3 py-1.5 rounded-lg whitespace-nowrap">
            {cat.name}
          </span>
        ))}
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <p className="text-white/30 text-xs uppercase tracking-wider mb-4">Demo Mode — Connect DB for real mods</p>

        <div className="mb-6">
          <p className="text-white/50 text-xs mb-3">Wrap Color</p>
          <div className="grid grid-cols-3 gap-2">
            {demoWrapColors.map((color) => (
              <button
                key={color.hex}
                onClick={() =>
                  applyModToConfig("wrap", {
                    id: color.label,
                    slug: color.label.toLowerCase().replace(/\s+/g, "-"),
                    name: color.label,
                    brand: "Demo",
                    price: 2500,
                    currency: "GBP",
                    images: [],
                    installDifficulty: 5,
                    deliveryEU: true,
                    deliveryUK: true,
                    isActive: true,
                    isFeatured: false,
                    categoryId: "wrap",
                    attributes: { colorKey: color.label.toLowerCase().replace(/\s+/g, "_") },
                  } as never)
                }
                className="aspect-square rounded-xl border-2 transition-all hover:scale-105"
                style={{
                  backgroundColor: color.hex,
                  borderColor: carConfig.bodyColor === color.hex ? "white" : "transparent",
                }}
                title={color.label}
              />
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-white/50 text-xs mb-3">Spoiler</p>
          <div className="space-y-2">
            {["none", "lip", "ducktail", "wing"].map((type) => (
              <button
                key={type}
                onClick={() => {
                  if (type === "none") {
                    applyModToConfig("spoilers", null);
                  } else {
                    applyModToConfig("spoilers", {
                      id: type,
                      slug: type,
                      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Spoiler`,
                      brand: "Demo",
                      price: 400,
                      currency: "GBP",
                      images: [],
                      installDifficulty: 2,
                      deliveryEU: true,
                      deliveryUK: true,
                      isActive: true,
                      isFeatured: false,
                      categoryId: "spoilers",
                      attributes: { spoilerType: type },
                    } as never);
                  }
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                  (type === "none" && !carConfig.hasSpoiler) || (carConfig.hasSpoiler && carConfig.spoilerType === type)
                    ? "bg-white text-black"
                    : "text-white/50 hover:bg-white/5"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-white/50 text-xs mb-3">Window Tint</p>
          <div className="space-y-2">
            {[
              { label: "No Tint", value: 0 },
              { label: "35%", value: 0.35 },
              { label: "20%", value: 0.55 },
              { label: "5% Limo", value: 0.75 },
            ].map((tint) => (
              <button
                key={tint.value}
                onClick={() =>
                  applyModToConfig("tint", {
                    id: `tint-${tint.value}`,
                    slug: `tint-${tint.value}`,
                    name: `${tint.label} Window Tint`,
                    brand: "Demo",
                    price: 350,
                    currency: "GBP",
                    images: [],
                    installDifficulty: 4,
                    deliveryEU: true,
                    deliveryUK: true,
                    isActive: true,
                    isFeatured: false,
                    categoryId: "tint",
                    attributes: { tintLevel: tint.value * 100 },
                  } as never)
                }
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                  Math.abs(carConfig.windowTint - tint.value) < 0.1
                    ? "bg-white text-black"
                    : "text-white/50 hover:bg-white/5"
                }`}
              >
                {tint.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
