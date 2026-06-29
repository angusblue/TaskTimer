import { prisma } from "@/lib/prisma";
import { ModCard } from "@/components/marketplace/ModCard";
import { Filter } from "lucide-react";
import type { ModCategory, Mod } from "@/types";

export const revalidate = 60;

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; vehicle?: string; q?: string }>;
}) {
  const { category, vehicle, q } = await searchParams;

  let categories: ModCategory[] = [];
  let mods: Mod[] = [];

  try {
    categories = await prisma.modCategory.findMany({
      orderBy: { sortOrder: "asc" },
    }) as ModCategory[];

    mods = await prisma.mod.findMany({
      where: {
        isActive: true,
        ...(category ? { category: { slug: category } } : {}),
        ...(vehicle ? { compats: { some: { vehicle: { slug: vehicle } } } } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { brand: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { category: true },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    }) as Mod[];
  } catch {
    // Demo mode
  }

  const featuredMods = mods.filter((m) => m.isFeatured);
  const regularMods = mods.filter((m) => !m.isFeatured);

  return (
    <div className="min-h-screen pt-16 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="py-16 border-b border-white/5 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">EV Mod Marketplace</h1>
          <p className="text-white/40 text-lg max-w-2xl">
            Premium aftermarket parts for Tesla. Every product is verified, UK-stocked, and ready to ship.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-10 flex-wrap">
          <a
            href="/marketplace"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !category ? "bg-white text-black" : "text-white/50 hover:text-white border border-white/10"
            }`}
          >
            All
          </a>
          {categories.map((cat) => (
            <a
              key={cat.slug}
              href={`/marketplace?category=${cat.slug}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === cat.slug
                  ? "bg-white text-black"
                  : "text-white/50 hover:text-white border border-white/10"
              }`}
            >
              {cat.name}
            </a>
          ))}

          {/* Vehicle filter */}
          <div className="ml-auto flex gap-2">
            {["tesla-model-3-highland", "tesla-model-3-legacy", "tesla-model-y"].map((v) => (
              <a
                key={v}
                href={`/marketplace?vehicle=${v}${category ? `&category=${category}` : ""}`}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                  vehicle === v
                    ? "bg-white/15 text-white border border-white/20"
                    : "text-white/30 border border-white/8 hover:border-white/15"
                }`}
              >
                {v.replace("tesla-", "").replace(/-/g, " ").split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
              </a>
            ))}
          </div>
        </div>

        {/* No DB demo */}
        {mods.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Filter size={24} className="text-white/30" />
            </div>
            <h2 className="text-white font-semibold text-xl mb-3">Connect your database</h2>
            <p className="text-white/40 max-w-md mx-auto text-sm leading-relaxed">
              Set <code className="text-white/60 bg-white/5 px-1 rounded">DATABASE_URL</code> and run{" "}
              <code className="text-white/60 bg-white/5 px-1 rounded">npm run db:seed</code> to populate the marketplace.
            </p>
          </div>
        )}

        {/* Featured */}
        {featuredMods.length > 0 && (
          <div className="mb-16">
            <h2 className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-6">
              Featured
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredMods.map((mod) => (
                <ModCard key={mod.id} mod={mod} />
              ))}
            </div>
          </div>
        )}

        {/* All mods */}
        {regularMods.length > 0 && (
          <div>
            <h2 className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-6">
              All Products {category && `· ${category}`}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {regularMods.map((mod) => (
                <ModCard key={mod.id} mod={mod} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
