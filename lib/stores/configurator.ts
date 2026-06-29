"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Vehicle, Mod, CarConfig } from "@/types";
import { WRAP_COLORS } from "@/lib/constants";

interface ConfiguratorStore {
  selectedVehicle: Vehicle | null;
  selectedMods: Record<string, Mod | null>;
  buildName: string;
  isPublic: boolean;
  carConfig: CarConfig;

  setVehicle: (vehicle: Vehicle) => void;
  setMod: (categorySlug: string, mod: Mod | null) => void;
  removeMod: (categorySlug: string) => void;
  setBuildName: (name: string) => void;
  setIsPublic: (val: boolean) => void;
  setCarConfig: (config: Partial<CarConfig>) => void;
  applyModToConfig: (categorySlug: string, mod: Mod | null) => void;
  getTotalPrice: () => number;
  getModList: () => Mod[];
  reset: () => void;
}

const defaultCarConfig: CarConfig = {
  bodyColor: "#0a0a0a",
  metalness: 0.3,
  roughness: 0.5,
  wrapType: "gloss",
  wheelType: "stock_18_photon",
  wheelColor: "#1a1a1a",
  isLowered: false,
  lowerAmount: 0,
  windowTint: 0,
  hasSpoiler: false,
  spoilerType: "none",
  hasMudflaps: false,
  hasBodyKit: false,
};

export const useConfigurator = create<ConfiguratorStore>()(
  persist(
    (set, get) => ({
      selectedVehicle: null,
      selectedMods: {},
      buildName: "My Tesla Build",
      isPublic: false,
      carConfig: defaultCarConfig,

      setVehicle: (vehicle) => set({ selectedVehicle: vehicle }),

      setMod: (categorySlug, mod) =>
        set((state) => ({
          selectedMods: { ...state.selectedMods, [categorySlug]: mod },
        })),

      removeMod: (categorySlug) =>
        set((state) => {
          const mods = { ...state.selectedMods };
          delete mods[categorySlug];
          return { selectedMods: mods };
        }),

      setBuildName: (name) => set({ buildName: name }),
      setIsPublic: (val) => set({ isPublic: val }),

      setCarConfig: (config) =>
        set((state) => ({
          carConfig: { ...state.carConfig, ...config },
        })),

      applyModToConfig: (categorySlug, mod) => {
        const state = get();
        const config = { ...state.carConfig };

        if (!mod) {
          // Revert category to default
          if (categorySlug === "wrap") {
            config.bodyColor = "#0a0a0a";
            config.metalness = 0.3;
            config.roughness = 0.5;
            config.wrapType = "gloss";
          } else if (categorySlug === "wheels") {
            config.wheelType = "stock_18_photon";
          } else if (categorySlug === "tint") {
            config.windowTint = 0;
          } else if (categorySlug === "spoilers") {
            config.hasSpoiler = false;
            config.spoilerType = "none";
          } else if (categorySlug === "lowering") {
            config.isLowered = false;
            config.lowerAmount = 0;
          } else if (categorySlug === "mud-flaps") {
            config.hasMudflaps = false;
          } else if (categorySlug === "body-kits") {
            config.hasBodyKit = false;
          }
        } else {
          const attrs = mod.attributes as Record<string, unknown> | null;

          if (categorySlug === "wrap" && attrs?.colorKey) {
            const colorKey = attrs.colorKey as string;
            const wrapColor = WRAP_COLORS[colorKey];
            if (wrapColor) {
              config.bodyColor = wrapColor.hex;
              config.metalness = wrapColor.metalness;
              config.roughness = wrapColor.roughness;
              config.wrapType = wrapColor.type as CarConfig["wrapType"];
            }
          } else if (categorySlug === "wheels" && attrs?.wheelTypeId) {
            config.wheelType = attrs.wheelTypeId as string;
          } else if (categorySlug === "tint" && attrs?.tintLevel !== undefined) {
            config.windowTint = Number(attrs.tintLevel);
          } else if (categorySlug === "spoilers") {
            config.hasSpoiler = true;
            config.spoilerType = (attrs?.spoilerType as string) ?? "lip";
          } else if (categorySlug === "lowering" && attrs?.lowerAmount !== undefined) {
            config.isLowered = Number(attrs.lowerAmount) > 0;
            config.lowerAmount = Number(attrs.lowerAmount);
          } else if (categorySlug === "mud-flaps") {
            config.hasMudflaps = true;
          } else if (categorySlug === "body-kits") {
            config.hasBodyKit = true;
          }
        }

        set((state) => ({
          selectedMods: { ...state.selectedMods, [categorySlug]: mod },
          carConfig: config,
        }));
      },

      getTotalPrice: () => {
        const mods = get().selectedMods;
        return Object.values(mods).reduce((sum, mod) => {
          if (!mod) return sum;
          return sum + (mod.salePrice ?? mod.price);
        }, 0);
      },

      getModList: () => {
        const mods = get().selectedMods;
        return Object.values(mods).filter((m): m is Mod => m !== null);
      },

      reset: () =>
        set({
          selectedMods: {},
          buildName: "My Tesla Build",
          carConfig: defaultCarConfig,
        }),
    }),
    { name: "ev-configurator" }
  )
);
