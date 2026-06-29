"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ExternalLink, ChevronRight, Loader2 } from "lucide-react";
import { cn, formatPrice, getDifficultyLabel, getDifficultyColor } from "@/lib/utils";
import { useConfigurator } from "@/lib/stores/configurator";
import type { ModCategory, Mod } from "@/types";

interface ModPanelProps {
  categories: ModCategory[];
  vehicleSlug: string;
}

export function ModPanel({ categories, vehicleSlug }: ModPanelProps) {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.slug ?? "wheels");
  const [clickingMod, setClickingMod] = useState<string | null>(null);
  const { selectedMods, applyModToConfig } = useConfigurator();

  const currentCategory = categories.find((c) => c.slug === activeCategory);

  const handleModClick = async (mod: Mod) => {
    const current = selectedMods[activeCategory];
    const isSelected = current?.id === mod.id;
    applyModToConfig(activeCategory, isSelected ? null : mod);

    // Track click
    if (!isSelected) {
      setClickingMod(mod.id);
      try {
        await fetch("/api/clicks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ modId: mod.id, type: "view", source: "configurator" }),
        });
      } catch {}
      setClickingMod(null);
    }
  };

  const handleAffiliate = async (mod: Mod) => {
    try {
      await fetch("/api/clicks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modId: mod.id, type: "affiliate", source: "configurator" }),
      });
    } catch {}
    if (mod.affiliateUrl) window.open(mod.affiliateUrl, "_blank");
    else if (mod.checkoutUrl) window.open(mod.checkoutUrl, "_blank");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Category tabs */}
      <div className="flex gap-1.5 p-3 overflow-x-auto scrollbar-hide border-b border-white/5">
        {categories.map((cat) => {
          const hasMod = !!selectedMods[cat.slug];
          return (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0",
                activeCategory === cat.slug
                  ? "bg-white text-black"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              {hasMod && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              )}
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Mod list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {currentCategory?.mods?.length === 0 && (
              <div className="text-center py-8 text-white/30 text-sm">
                No mods available for this category yet
              </div>
            )}

            {currentCategory?.mods?.map((mod) => {
              const isSelected = selectedMods[activeCategory]?.id === mod.id;
              const isLoading = clickingMod === mod.id;

              return (
                <motion.div
                  key={mod.id}
                  layout
                  className={cn(
                    "relative rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer",
                    isSelected
                      ? "border-white/30 bg-white/5"
                      : "border-white/6 bg-white/2 hover:border-white/12 hover:bg-white/4"
                  )}
                  onClick={() => handleModClick(mod)}
                >
                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                        <Check size={11} className="text-black font-bold" />
                      </div>
                    </div>
                  )}

                  {/* Featured badge */}
                  {mod.isFeatured && !isSelected && (
                    <div className="absolute top-3 right-3">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        ★
                      </span>
                    </div>
                  )}

                  <div className="p-3.5">
                    <div className="flex items-start gap-3">
                      {/* Mod image / color swatch */}
                      <ModThumbnail mod={mod} categorySlug={activeCategory} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-white/50 text-xs mb-0.5">{mod.brand}</p>
                            <p className="text-white text-sm font-medium leading-tight">{mod.name}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {mod.salePrice ? (
                              <div>
                                <span className="text-white text-sm font-semibold">{formatPrice(mod.salePrice)}</span>
                                <span className="block text-white/30 text-xs line-through">{formatPrice(mod.price)}</span>
                              </div>
                            ) : (
                              <span className="text-white text-sm font-semibold">{formatPrice(mod.price)}</span>
                            )}
                          </div>
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center gap-3 mt-2">
                          <span className={cn("text-xs", getDifficultyColor(mod.installDifficulty))}>
                            {getDifficultyLabel(mod.installDifficulty)}
                          </span>
                          {mod.installTime && (
                            <span className="text-white/30 text-xs">{mod.installTime}</span>
                          )}
                          {mod.deliveryUK && (
                            <span className="text-white/30 text-xs">🇬🇧 UK</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {mod.description && isSelected && (
                      <p className="mt-2.5 text-white/40 text-xs leading-relaxed border-t border-white/5 pt-2.5">
                        {mod.description}
                      </p>
                    )}

                    {/* CTA buttons when selected */}
                    {isSelected && (mod.affiliateUrl || mod.checkoutUrl) && (
                      <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleAffiliate(mod)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
                        >
                          Buy Now
                          <ExternalLink size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ModThumbnail({ mod, categorySlug }: { mod: Mod; categorySlug: string }) {
  const attrs = mod.attributes as Record<string, unknown> | null;

  if (categorySlug === "wrap" && attrs?.colorKey) {
    const key = attrs.colorKey as string;
    const colorMap: Record<string, string> = {
      midnight_black: "#0a0a0a",
      pearl_white: "#f5f5f0",
      deep_blue: "#1a3a5c",
      stealth_grey: "#4a4a4a",
      racing_red: "#cc1a1a",
      satin_gold: "#b8860b",
      matte_green: "#2d4a1e",
      chrome_silver: "#c0c0c0",
      midnight_purple: "#2a0a4a",
      satin_black: "#1a1a1a",
    };
    return (
      <div
        className="w-10 h-10 rounded-lg border border-white/10 flex-shrink-0"
        style={{ backgroundColor: colorMap[key] ?? "#888" }}
      />
    );
  }

  if (mod.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={mod.imageUrl} alt={mod.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-white/5" />
    );
  }

  // Default icon placeholder
  const icons: Record<string, string> = {
    wheels: "⬤",
    tint: "◫",
    spoilers: "◬",
    lowering: "↓",
    "body-kits": "▬",
    "mud-flaps": "▪",
    interior: "⬡",
    wrap: "◼",
  };

  return (
    <div className="w-10 h-10 rounded-lg border border-white/8 bg-white/3 flex items-center justify-center flex-shrink-0 text-white/30 text-base">
      {icons[categorySlug] ?? "◯"}
    </div>
  );
}
