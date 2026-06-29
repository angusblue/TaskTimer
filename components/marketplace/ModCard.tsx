"use client";

import Link from "next/link";
import { ExternalLink, Wrench, Truck } from "lucide-react";
import { cn, formatPrice, getDifficultyLabel, getDifficultyColor } from "@/lib/utils";
import type { Mod } from "@/types";

interface ModCardProps {
  mod: Mod;
  onTrackClick?: (modId: string, type: string) => void;
}

export function ModCard({ mod, onTrackClick }: ModCardProps) {
  const handleAffiliate = async (e: React.MouseEvent) => {
    e.preventDefault();
    onTrackClick?.(mod.id, "affiliate");

    try {
      await fetch("/api/clicks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modId: mod.id, type: "affiliate", source: "marketplace" }),
      });
    } catch {}

    const url = mod.affiliateUrl ?? mod.checkoutUrl;
    if (url) window.open(url, "_blank");
  };

  const hasSalePrice = mod.salePrice && mod.salePrice < mod.price;
  const discountPct = hasSalePrice
    ? Math.round((1 - (mod.salePrice! / mod.price)) * 100)
    : null;

  return (
    <div className="group relative flex flex-col rounded-2xl border border-white/6 bg-[#111] hover:border-white/15 transition-all duration-300 overflow-hidden">
      {/* Image area */}
      <div className="relative h-44 bg-gradient-to-br from-white/3 to-transparent overflow-hidden">
        {mod.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mod.imageUrl}
            alt={mod.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <ModPlaceholder categorySlug={mod.category?.slug ?? ""} mod={mod} />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {mod.isFeatured && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-white text-black rounded-full">
              Featured
            </span>
          )}
          {discountPct && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
              -{discountPct}%
            </span>
          )}
        </div>

        {/* Delivery badges */}
        <div className="absolute top-3 right-3 flex gap-1">
          {mod.deliveryUK && (
            <span className="text-xs bg-black/60 backdrop-blur-sm text-white/70 px-1.5 py-0.5 rounded">
              🇬🇧
            </span>
          )}
          {mod.deliveryEU && (
            <span className="text-xs bg-black/60 backdrop-blur-sm text-white/70 px-1.5 py-0.5 rounded">
              🇪🇺
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <div className="mb-auto">
          <p className="text-white/40 text-xs font-medium mb-1">{mod.brand}</p>
          <Link href={`/marketplace/${mod.id}`}>
            <h3 className="text-white font-semibold leading-tight hover:text-white/80 transition-colors">
              {mod.name}
            </h3>
          </Link>

          {mod.description && (
            <p className="text-white/30 text-xs mt-2 leading-relaxed line-clamp-2">
              {mod.description}
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1">
            <Wrench size={11} className={getDifficultyColor(mod.installDifficulty)} />
            <span className={cn("text-xs", getDifficultyColor(mod.installDifficulty))}>
              {getDifficultyLabel(mod.installDifficulty)}
            </span>
          </div>
          {mod.installTime && (
            <span className="text-white/25 text-xs">{mod.installTime}</span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <div>
            {hasSalePrice ? (
              <div>
                <span className="text-white font-bold text-lg">{formatPrice(mod.salePrice!)}</span>
                <span className="text-white/30 text-sm line-through ml-2">{formatPrice(mod.price)}</span>
              </div>
            ) : (
              <span className="text-white font-bold text-lg">{formatPrice(mod.price)}</span>
            )}
            <p className="text-white/25 text-xs">{mod.currency}</p>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/marketplace/${mod.id}`}
              className="px-3 py-1.5 text-xs text-white/60 border border-white/10 rounded-lg hover:border-white/25 hover:text-white transition-colors"
            >
              Details
            </Link>
            {(mod.affiliateUrl || mod.checkoutUrl) && (
              <button
                onClick={handleAffiliate}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
              >
                Buy
                <ExternalLink size={10} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModPlaceholder({ categorySlug, mod }: { categorySlug: string; mod: Mod }) {
  const attrs = mod.attributes as Record<string, unknown> | null;

  if (categorySlug === "wrap" && attrs?.colorKey) {
    const colorMap: Record<string, string> = {
      midnight_black: "#0a0a0a",
      pearl_white: "#f5f5f0",
      deep_blue: "#1a3a5c",
      stealth_grey: "#4a4a4a",
      racing_red: "#cc1a1a",
      satin_gold: "#b8860b",
      matte_green: "#2d4a1e",
      chrome_silver: "#e8e8e8",
      midnight_purple: "#2a0a4a",
      satin_black: "#1a1a1a",
    };
    const key = attrs.colorKey as string;
    const color = colorMap[key] ?? "#888";
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: color }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-white/20 mx-auto mb-2" style={{ backgroundColor: color }} />
          <p className="text-white/60 text-xs">Full Wrap</p>
        </div>
      </div>
    );
  }

  const icons: Record<string, string> = {
    wheels: "⬤",
    tint: "◫",
    spoilers: "◬",
    lowering: "↓",
    "body-kits": "▬",
    "mud-flaps": "▪",
    interior: "⬡",
  };

  return (
    <div className="w-full h-full flex items-center justify-center text-white/10 text-5xl">
      {icons[categorySlug] ?? "◯"}
    </div>
  );
}
