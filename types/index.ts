export interface Vehicle {
  id: string;
  slug: string;
  name: string;
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  bodyStyle: string;
  basePrice?: number | null;
  imageUrl?: string | null;
  description?: string | null;
  isActive: boolean;
}

export interface ModCategory {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  sortOrder: number;
  mods?: Mod[];
}

export interface Mod {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description?: string | null;
  price: number;
  salePrice?: number | null;
  currency: string;
  imageUrl?: string | null;
  images: string[];
  installDifficulty: number;
  installTime?: string | null;
  deliveryEU: boolean;
  deliveryUK: boolean;
  affiliateUrl?: string | null;
  checkoutUrl?: string | null;
  threeAssetId?: string | null;
  colorVariants?: Record<string, string> | null;
  attributes?: Record<string, unknown> | null;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  category?: ModCategory;
  compats?: ModCompatibility[];
}

export interface ModCompatibility {
  id: string;
  modId: string;
  vehicleId: string;
  notes?: string | null;
  vehicle?: Vehicle;
}

export interface Build {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  isPublic: boolean;
  totalPrice: number;
  viewCount: number;
  userId?: string | null;
  vehicleId: string;
  vehicle?: Vehicle;
  mods?: BuildMod[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BuildMod {
  id: string;
  buildId: string;
  modId: string;
  quantity: number;
  mod?: Mod;
}

export interface CarConfig {
  bodyColor: string;
  metalness: number;
  roughness: number;
  wrapType: "gloss" | "satin" | "matte" | "chrome" | "none";
  wheelType: string;
  wheelColor: string;
  isLowered: boolean;
  lowerAmount: number;
  windowTint: number;
  hasSpoiler: boolean;
  spoilerType: string;
  hasMudflaps: boolean;
  hasBodyKit: boolean;
}

export interface ConfiguratorState {
  selectedVehicle: Vehicle | null;
  selectedMods: Record<string, Mod | null>;
  buildName: string;
  isPublic: boolean;
  carConfig: CarConfig;
}

export type ModCategorySlug =
  | "wheels"
  | "wrap"
  | "tint"
  | "spoilers"
  | "lowering"
  | "body-kits"
  | "mud-flaps"
  | "interior";

export interface ClickPayload {
  modId: string;
  type: "view" | "affiliate" | "checkout" | "install_inquiry";
  buildId?: string;
  source?: string;
}
