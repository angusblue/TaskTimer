export const VEHICLE_MODELS = [
  {
    slug: "tesla-model-3-highland",
    name: "Model 3 Highland",
    make: "Tesla",
    model: "Model 3",
    year: 2024,
    trim: "Highland",
    description: "The refreshed Tesla Model 3 with updated exterior and interior.",
    baseColor: "#1a1a1a",
  },
  {
    slug: "tesla-model-3-legacy",
    name: "Model 3 Legacy",
    make: "Tesla",
    model: "Model 3",
    year: 2022,
    trim: "Long Range AWD",
    description: "The proven Tesla Model 3 with the classic design.",
    baseColor: "#1a1a1a",
  },
  {
    slug: "tesla-model-y",
    name: "Model Y",
    make: "Tesla",
    model: "Model Y",
    year: 2024,
    trim: "Performance",
    description: "Tesla's best-selling SUV crossover.",
    baseColor: "#1a1a1a",
  },
] as const;

export const MOD_CATEGORIES = [
  { slug: "wheels", name: "Wheels", icon: "circle", sortOrder: 1 },
  { slug: "wrap", name: "Wrap & Paint", icon: "palette", sortOrder: 2 },
  { slug: "tint", name: "Window Tint", icon: "sun-dim", sortOrder: 3 },
  { slug: "spoilers", name: "Spoilers", icon: "wind", sortOrder: 4 },
  { slug: "lowering", name: "Suspension", icon: "chevrons-down", sortOrder: 5 },
  { slug: "body-kits", name: "Body Kits", icon: "layers", sortOrder: 6 },
  { slug: "mud-flaps", name: "Mud Flaps", icon: "shield", sortOrder: 7 },
  { slug: "interior", name: "Interior", icon: "armchair", sortOrder: 8 },
] as const;

export const WRAP_COLORS: Record<string, { label: string; hex: string; metalness: number; roughness: number; type: string }> = {
  midnight_black: { label: "Midnight Black", hex: "#0a0a0a", metalness: 0.3, roughness: 0.5, type: "gloss" },
  pearl_white: { label: "Pearl White", hex: "#f5f5f0", metalness: 0.2, roughness: 0.3, type: "gloss" },
  deep_blue: { label: "Deep Blue Metallic", hex: "#1a3a5c", metalness: 0.7, roughness: 0.3, type: "metallic" },
  stealth_grey: { label: "Stealth Grey Satin", hex: "#4a4a4a", metalness: 0.1, roughness: 0.8, type: "satin" },
  racing_red: { label: "Racing Red", hex: "#cc1a1a", metalness: 0.3, roughness: 0.4, type: "gloss" },
  satin_gold: { label: "Satin Gold", hex: "#b8860b", metalness: 0.6, roughness: 0.7, type: "satin" },
  matte_green: { label: "Matte Army Green", hex: "#2d4a1e", metalness: 0.0, roughness: 0.9, type: "matte" },
  chrome_silver: { label: "Chrome Silver", hex: "#c0c0c0", metalness: 0.9, roughness: 0.05, type: "chrome" },
  midnight_purple: { label: "Midnight Purple", hex: "#2a0a4a", metalness: 0.4, roughness: 0.4, type: "metallic" },
  satin_black: { label: "Satin Black", hex: "#1a1a1a", metalness: 0.1, roughness: 0.8, type: "satin" },
};

export const TINT_LEVELS = [
  { value: 0, label: "No Tint", opacity: 0.1 },
  { value: 35, label: "35% (Legal UK)", opacity: 0.35 },
  { value: 20, label: "20% (Medium)", opacity: 0.55 },
  { value: 5, label: "5% (Limo)", opacity: 0.75 },
];

export const WHEEL_TYPES = [
  { id: "stock_18_photon", label: "OEM 18\" Photon", style: "5-spoke", size: 18 },
  { id: "stock_19_induction", label: "OEM 19\" Induction", style: "aero", size: 19 },
  { id: "aftermarket_20_sport", label: "20\" Sport Flow", style: "split-spoke", size: 20 },
  { id: "aftermarket_21_forged", label: "21\" Forged Mesh", style: "mesh", size: 21 },
  { id: "aftermarket_19_turbine", label: "19\" Turbine", style: "turbine", size: 19 },
  { id: "aftermarket_20_aero", label: "20\" Aero Cover", style: "aero", size: 20 },
];

export const LOWER_AMOUNTS = [
  { value: 0, label: "Stock", description: "Factory ride height" },
  { value: 25, label: "-25mm", description: "Mild drop, daily drivable" },
  { value: 40, label: "-40mm", description: "Aggressive stance" },
  { value: 65, label: "-65mm", description: "Track/show stance" },
];
