"use client";

import { useState } from "react";
import { Share2, Save, Trash2, ExternalLink, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useConfigurator } from "@/lib/stores/configurator";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

interface BuildSummaryProps {
  vehicleSlug: string;
  vehicleName: string;
}

export function BuildSummary({ vehicleSlug, vehicleName }: BuildSummaryProps) {
  const { selectedMods, buildName, setBuildName, getTotalPrice, getModList, reset, isPublic, setIsPublic } = useConfigurator();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const mods = getModList();
  const totalPrice = getTotalPrice();

  const handleSave = async () => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/builds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: buildName,
          vehicleSlug,
          modIds: mods.map((m) => m.id),
          isPublic,
          totalPrice,
        }),
      });

      if (res.ok) {
        const { build } = await res.json();
        setSaved(true);
        setShareUrl(`${window.location.origin}/builds/${build.slug}`);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save build", error);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    const url = shareUrl ?? window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/5">
        <h3 className="text-white font-semibold text-sm mb-1">Build Summary</h3>
        <input
          type="text"
          value={buildName}
          onChange={(e) => setBuildName(e.target.value)}
          className="w-full bg-transparent text-white/50 text-xs focus:text-white outline-none border-b border-transparent focus:border-white/20 pb-0.5 transition-colors"
          placeholder="Name your build..."
        />
      </div>

      {/* Vehicle */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Vehicle</p>
        <p className="text-white text-sm font-medium">Tesla {vehicleName}</p>
      </div>

      {/* Selected mods */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2 py-2">
        <p className="text-white/30 text-xs uppercase tracking-wider mb-2">
          Mods ({mods.length})
        </p>

        {mods.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-white/20 text-xs">No mods selected yet</p>
            <p className="text-white/15 text-xs mt-1">Select mods from the panel →</p>
          </div>
        ) : (
          mods.map((mod) => (
            <div key={mod.id} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-white/70 text-xs truncate">{mod.name}</p>
                <p className="text-white/30 text-xs">{mod.brand}</p>
              </div>
              <span className="text-white text-xs font-medium flex-shrink-0">
                {formatPrice(mod.salePrice ?? mod.price)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Total + actions */}
      <div className="p-4 border-t border-white/5 space-y-3">
        {/* Total price */}
        <div className="flex items-center justify-between">
          <span className="text-white/40 text-sm">Total Mods Cost</span>
          <span className="text-white font-bold text-lg">{formatPrice(totalPrice)}</span>
        </div>

        {/* Public toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => setIsPublic(!isPublic)}
            className={cn(
              "relative w-9 h-5 rounded-full transition-colors",
              isPublic ? "bg-white" : "bg-white/15"
            )}
          >
            <div className={cn(
              "absolute top-0.5 w-4 h-4 rounded-full bg-black transition-transform",
              isPublic ? "translate-x-4" : "translate-x-0.5"
            )} />
          </div>
          <span className="text-white/40 text-xs">Make build public</span>
        </label>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving || mods.length === 0}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all",
              saved
                ? "bg-emerald-500 text-white"
                : "bg-white text-black hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : saved ? (
              <>
                <Check size={14} />
                Saved!
              </>
            ) : (
              <>
                <Save size={14} />
                Save Build
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors"
            title="Copy share link"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} className="text-white/40" />}
          </button>

          <button
            onClick={reset}
            className="p-2.5 rounded-xl border border-white/10 hover:border-red-500/30 hover:bg-red-500/5 transition-colors"
            title="Reset build"
          >
            <Trash2 size={16} className="text-white/40 hover:text-red-400" />
          </button>
        </div>

        {shareUrl && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
            <p className="text-white/40 text-xs flex-1 truncate">{shareUrl}</p>
            <a href={shareUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={12} className="text-white/40" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
