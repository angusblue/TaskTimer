import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding EV Mod Marketplace...");

  // Affiliate partners
  const tsportsline = await prisma.affiliatePartner.upsert({
    where: { slug: "tsportline" },
    update: {},
    create: { name: "T Sportline", slug: "tsportline", website: "https://tsportline.com", commissionRate: 0.08 },
  });

  const tirerack = await prisma.affiliatePartner.upsert({
    where: { slug: "tirerack" },
    update: {},
    create: { name: "Tire Rack", slug: "tirerack", website: "https://tirerack.com", commissionRate: 0.05 },
  });

  // Vehicles
  const model3Highland = await prisma.vehicle.upsert({
    where: { slug: "tesla-model-3-highland" },
    update: {},
    create: {
      slug: "tesla-model-3-highland",
      name: "Model 3 Highland",
      make: "Tesla",
      model: "Model 3",
      year: 2024,
      trim: "Highland",
      bodyStyle: "sedan",
      basePrice: 42990,
      description: "The refreshed Tesla Model 3 Highland with a sleeker exterior, upgraded interior, and improved range.",
    },
  });

  const model3Legacy = await prisma.vehicle.upsert({
    where: { slug: "tesla-model-3-legacy" },
    update: {},
    create: {
      slug: "tesla-model-3-legacy",
      name: "Model 3 Legacy",
      make: "Tesla",
      model: "Model 3",
      year: 2022,
      trim: "Long Range AWD",
      bodyStyle: "sedan",
      basePrice: 38990,
      description: "The classic Tesla Model 3 design — the car that changed EV adoption forever.",
    },
  });

  const modelY = await prisma.vehicle.upsert({
    where: { slug: "tesla-model-y" },
    update: {},
    create: {
      slug: "tesla-model-y",
      name: "Model Y",
      make: "Tesla",
      model: "Model Y",
      year: 2024,
      trim: "Performance",
      bodyStyle: "suv",
      basePrice: 47990,
      description: "Tesla's best-selling SUV — versatile, spacious, and incredibly capable.",
    },
  });

  const vehicles = [model3Highland, model3Legacy, modelY];

  // Categories
  const cats = await Promise.all([
    prisma.modCategory.upsert({ where: { slug: "wheels" }, update: {}, create: { slug: "wheels", name: "Wheels", icon: "circle", sortOrder: 1 } }),
    prisma.modCategory.upsert({ where: { slug: "wrap" }, update: {}, create: { slug: "wrap", name: "Wrap & Paint", icon: "palette", sortOrder: 2 } }),
    prisma.modCategory.upsert({ where: { slug: "tint" }, update: {}, create: { slug: "tint", name: "Window Tint", icon: "sun-dim", sortOrder: 3 } }),
    prisma.modCategory.upsert({ where: { slug: "spoilers" }, update: {}, create: { slug: "spoilers", name: "Spoilers", icon: "wind", sortOrder: 4 } }),
    prisma.modCategory.upsert({ where: { slug: "lowering" }, update: {}, create: { slug: "lowering", name: "Suspension", icon: "chevrons-down", sortOrder: 5 } }),
    prisma.modCategory.upsert({ where: { slug: "body-kits" }, update: {}, create: { slug: "body-kits", name: "Body Kits", icon: "layers", sortOrder: 6 } }),
    prisma.modCategory.upsert({ where: { slug: "mud-flaps" }, update: {}, create: { slug: "mud-flaps", name: "Mud Flaps", icon: "shield", sortOrder: 7 } }),
    prisma.modCategory.upsert({ where: { slug: "interior" }, update: {}, create: { slug: "interior", name: "Interior", icon: "armchair", sortOrder: 8 } }),
  ]);

  const [wheelsCat, wrapCat, tintCat, spoilersCat, loweringCat, bodyKitsCat, mudFlapsCat] = cats;

  // WHEELS
  const wheelMods = [
    {
      slug: "tsportline-zero-g-20",
      name: "Zero-G 20\" Wheels",
      brand: "T Sportline",
      price: 1899,
      description: "Forged flow-formed 20\" wheels designed specifically for Tesla. Lightweight, strong, and stunning.",
      installDifficulty: 3,
      installTime: "2-3 hours",
      isFeatured: true,
      attributes: { wheelTypeId: "aftermarket_20_sport", size: 20, style: "split-spoke" },
      partnerId: tsportsline.id,
    },
    {
      slug: "hre-flowform-ff21-19",
      name: "HRE FlowForm FF21 19\"",
      brand: "HRE Wheels",
      price: 2840,
      description: "HRE's legendary FlowForm technology in a 19\" fitment. Track-proven, road-ready.",
      installDifficulty: 3,
      installTime: "2-3 hours",
      isFeatured: true,
      attributes: { wheelTypeId: "aftermarket_19_turbine", size: 19, style: "turbine" },
      partnerId: tsportsline.id,
    },
    {
      slug: "oem-19-induction-set",
      name: "OEM 19\" Induction Upgrade",
      brand: "Tesla",
      price: 1200,
      description: "Official Tesla 19\" Induction wheels — the factory sport wheel. Perfect fitment guaranteed.",
      installDifficulty: 2,
      installTime: "1 hour",
      attributes: { wheelTypeId: "stock_19_induction", size: 19, style: "aero" },
    },
    {
      slug: "tsportline-vm-forged-21",
      name: "VM Series Forged 21\"",
      brand: "T Sportline",
      price: 3499,
      description: "Full forged monoblock 21\" wheels. Maximum performance meets extreme aesthetics.",
      installDifficulty: 3,
      installTime: "2-4 hours",
      isFeatured: true,
      attributes: { wheelTypeId: "aftermarket_21_forged", size: 21, style: "mesh" },
      partnerId: tsportsline.id,
    },
    {
      slug: "aero-cover-upgrade-20",
      name: "Precision Aero Covers 20\"",
      brand: "Evannex",
      price: 289,
      description: "Improved aerodynamics with a sporty look. Easy DIY install — no tools required.",
      installDifficulty: 1,
      installTime: "15 minutes",
      attributes: { wheelTypeId: "aftermarket_20_aero", size: 20, style: "aero" },
    },
  ];

  // WRAPS
  const wrapMods = [
    {
      slug: "3m-satin-black-full-wrap",
      name: "3M Satin Black Full Wrap",
      brand: "3M",
      price: 2800,
      description: "3M 1080 Satin Black vinyl wrap. Deep, rich satin finish that transforms your Tesla.",
      installDifficulty: 5,
      installTime: "2 days (professional install)",
      isFeatured: true,
      attributes: { colorKey: "satin_black", wrapType: "satin" },
    },
    {
      slug: "avery-stealth-grey-wrap",
      name: "Avery Dennison Stealth Grey",
      brand: "Avery Dennison",
      price: 3100,
      description: "Avery SW900 Supreme Satin Metallic Grey. Military stealth meets luxury.",
      installDifficulty: 5,
      installTime: "2 days (professional install)",
      isFeatured: true,
      attributes: { colorKey: "stealth_grey", wrapType: "satin" },
    },
    {
      slug: "xpel-stealth-ppf-clear",
      name: "XPEL Stealth PPF",
      brand: "XPEL",
      price: 4200,
      description: "Paint protection film with a satin/matte finish. Protects AND transforms.",
      installDifficulty: 5,
      installTime: "3 days (professional install)",
      isFeatured: true,
      attributes: { colorKey: "stealth_grey", wrapType: "satin" },
    },
    {
      slug: "3m-racing-red-wrap",
      name: "3M Racing Red Gloss Wrap",
      brand: "3M",
      price: 2600,
      description: "Turn heads with vibrant Racing Red. 3M's premium gloss vinyl.",
      installDifficulty: 5,
      installTime: "2 days (professional install)",
      attributes: { colorKey: "racing_red", wrapType: "gloss" },
    },
    {
      slug: "midnight-purple-metallic-wrap",
      name: "Midnight Purple Metallic Wrap",
      brand: "Hexis",
      price: 3400,
      description: "Deep midnight purple with metallic flake. Shifts colour in different light.",
      installDifficulty: 5,
      installTime: "2 days (professional install)",
      attributes: { colorKey: "midnight_purple", wrapType: "metallic" },
    },
  ];

  // TINTS
  const tintMods = [
    {
      slug: "llumar-ctx-20-full-tint",
      name: "LLumar CTX 20% Full Tint",
      brand: "LLumar",
      price: 420,
      description: "Ceramic nano-particle tint at 20% VLT. Blocks 99% UV, stays legal.",
      installDifficulty: 4,
      installTime: "3-4 hours",
      isFeatured: true,
      attributes: { tintLevel: 20 },
    },
    {
      slug: "3m-ceramic-ir-35",
      name: "3M Ceramic IR 35% Tint",
      brand: "3M",
      price: 380,
      description: "3M Ceramic IR series at 35% VLT. Legal in UK and EU, heat-rejecting.",
      installDifficulty: 4,
      installTime: "3 hours",
      attributes: { tintLevel: 35 },
    },
    {
      slug: "xpel-xr-plus-5",
      name: "XPEL XR Plus 5% Limo Tint",
      brand: "XPEL",
      price: 490,
      description: "5% VLT limo tint for maximum privacy. Ceramic IR blocking for heat rejection.",
      installDifficulty: 4,
      installTime: "3-4 hours",
      attributes: { tintLevel: 5 },
    },
  ];

  // SPOILERS
  const spoilerMods = [
    {
      slug: "carbon-fiber-lip-spoiler",
      name: "Carbon Fiber Lip Spoiler",
      brand: "T Sportline",
      price: 489,
      description: "Real carbon fiber trunk lip spoiler. Adds downforce and aggressive looks.",
      installDifficulty: 2,
      installTime: "30 minutes",
      isFeatured: true,
      attributes: { spoilerType: "lip" },
      partnerId: tsportsline.id,
    },
    {
      slug: "ducktail-spoiler-abs",
      name: "Ducktail Trunk Spoiler",
      brand: "Evannex",
      price: 299,
      description: "Track-inspired ducktail spoiler in gloss black ABS. Bold stance upgrade.",
      installDifficulty: 2,
      installTime: "45 minutes",
      attributes: { spoilerType: "ducktail" },
    },
    {
      slug: "carbon-racing-wing",
      name: "Carbon Fiber GT Wing",
      brand: "MCarbon",
      price: 895,
      description: "Adjustable GT wing in real carbon fiber. Maximum downforce for track use.",
      installDifficulty: 3,
      installTime: "2-3 hours",
      attributes: { spoilerType: "wing" },
    },
  ];

  // LOWERING
  const loweringMods = [
    {
      slug: "unplugged-performance-lowering-springs",
      name: "UP Stage 1 Lowering Springs",
      brand: "Unplugged Performance",
      price: 349,
      description: "25mm drop springs for improved handling and stance. Maintains OEM ride quality.",
      installDifficulty: 4,
      installTime: "3-4 hours",
      isFeatured: true,
      attributes: { lowerAmount: 25 },
    },
    {
      slug: "bc-racing-coilovers-br",
      name: "BC Racing BR Coilovers",
      brand: "BC Racing",
      price: 1299,
      description: "Fully adjustable coilovers. Tune from -25mm to -65mm drop. 30-level damping.",
      installDifficulty: 5,
      installTime: "4-6 hours",
      isFeatured: true,
      attributes: { lowerAmount: 40 },
    },
    {
      slug: "air-lift-3p-airride",
      name: "Air Lift 3P Air Suspension",
      brand: "Air Lift",
      price: 3200,
      description: "Full air suspension system. Raise and lower on the fly via phone app.",
      installDifficulty: 5,
      installTime: "8-12 hours",
      attributes: { lowerAmount: 65 },
    },
  ];

  // BODY KITS
  const bodyKitMods = [
    {
      slug: "unplugged-performance-body-kit",
      name: "UP Ascension Aero Kit",
      brand: "Unplugged Performance",
      price: 2890,
      description: "Complete aero kit: front splitter, side skirts, rear diffuser. All carbon fiber.",
      installDifficulty: 4,
      installTime: "4-6 hours",
      isFeatured: true,
      attributes: { kitType: "full" },
    },
    {
      slug: "carbon-front-splitter",
      name: "Carbon Front Splitter",
      brand: "T Sportline",
      price: 429,
      description: "Real carbon fiber front lip splitter. Adds downforce and aggressive look.",
      installDifficulty: 3,
      installTime: "1-2 hours",
      attributes: { kitType: "front" },
      partnerId: tsportsline.id,
    },
    {
      slug: "carbon-rear-diffuser",
      name: "Carbon Rear Diffuser",
      brand: "T Sportline",
      price: 389,
      description: "Carbon fiber rear diffuser for improved aerodynamics and sportier appearance.",
      installDifficulty: 3,
      installTime: "1-2 hours",
      attributes: { kitType: "rear" },
      partnerId: tsportsline.id,
    },
  ];

  // MUD FLAPS
  const mudFlapsMods = [
    {
      slug: "tesloid-mud-flaps-set",
      name: "Tesloid Mud Flaps Set",
      brand: "Tesloid",
      price: 79,
      description: "Custom-fit mud flaps for all four wheels. Protects paint from road debris.",
      installDifficulty: 1,
      installTime: "15 minutes",
      attributes: { coverage: "full" },
    },
    {
      slug: "evannex-mud-flap-kit",
      name: "Evannex Mud Flap Kit",
      brand: "Evannex",
      price: 69,
      description: "Precision-fit no-drill mud flaps. Easy installation, premium look.",
      installDifficulty: 1,
      installTime: "15 minutes",
      attributes: { coverage: "full" },
    },
  ];

  const allModsData = [
    ...wheelMods.map((m) => ({ ...m, categoryId: wheelsCat.id })),
    ...wrapMods.map((m) => ({ ...m, categoryId: wrapCat.id })),
    ...tintMods.map((m) => ({ ...m, categoryId: tintCat.id })),
    ...spoilerMods.map((m) => ({ ...m, categoryId: spoilersCat.id })),
    ...loweringMods.map((m) => ({ ...m, categoryId: loweringCat.id })),
    ...bodyKitMods.map((m) => ({ ...m, categoryId: bodyKitsCat.id })),
    ...mudFlapsMods.map((m) => ({ ...m, categoryId: mudFlapsCat.id })),
  ];

  const createdMods = [];
  for (const modData of allModsData) {
    const { attributes, partnerId, ...rest } = modData;
    const mod = await prisma.mod.upsert({
      where: { slug: rest.slug },
      update: {},
      create: {
        ...rest,
        images: [],
        currency: "GBP",
        attributes: attributes ?? {},
        deliveryEU: true,
        deliveryUK: true,
        ...(partnerId ? { partnerId } : {}),
      },
    });
    createdMods.push(mod);
  }

  // Compatibility — all mods work with all 3 Tesla vehicles for MVP
  for (const mod of createdMods) {
    for (const vehicle of vehicles) {
      await prisma.modCompatibility.upsert({
        where: { modId_vehicleId: { modId: mod.id, vehicleId: vehicle.id } },
        update: {},
        create: { modId: mod.id, vehicleId: vehicle.id },
      });
    }
  }

  // Example public build
  const exampleBuild = await prisma.build.upsert({
    where: { slug: "stealth-black-m3-performance" },
    update: {},
    create: {
      slug: "stealth-black-m3-performance",
      name: "Stealth Black Performance",
      description: "The ultimate stealth Model 3 build. Black on black with aggressive stance.",
      isPublic: true,
      totalPrice: 7737,
      vehicleId: model3Highland.id,
    },
  });

  // Add mods to the example build
  const spoilerMod = createdMods.find((m) => m.slug === "carbon-fiber-lip-spoiler");
  const wrapMod = createdMods.find((m) => m.slug === "3m-satin-black-full-wrap");
  const tintMod = createdMods.find((m) => m.slug === "llumar-ctx-20-full-tint");
  const wheelsMod = createdMods.find((m) => m.slug === "tsportline-zero-g-20");
  const springsMod = createdMods.find((m) => m.slug === "unplugged-performance-lowering-springs");

  for (const mod of [spoilerMod, wrapMod, tintMod, wheelsMod, springsMod]) {
    if (mod) {
      await prisma.buildMod.upsert({
        where: { buildId_modId: { buildId: exampleBuild.id, modId: mod.id } },
        update: {},
        create: { buildId: exampleBuild.id, modId: mod.id },
      });
    }
  }

  console.log(`✅ Seeded:
  - ${vehicles.length} vehicles
  - ${cats.length} categories
  - ${createdMods.length} mods
  - 1 example build
  `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
