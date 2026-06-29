"use client";

import { useState } from "react";
import { Wand2, Loader2, Sparkles } from "lucide-react";
import { useConfigurator } from "@/lib/stores/configurator";
import type { Mod } from "@/types";

interface AIGeneratorProps {
  vehicleSlug: string;
  availableMods: Mod[];
}

export function AIGenerator({ vehicleSlug, availableMods }: AIGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { applyModToConfig, setBuildName } = useConfigurator();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, vehicleSlug, availableModIds: availableMods.map((m) => m.id) }),
      });

      if (!res.ok) throw new Error("Generation failed");

      const data = await res.json();

      // Apply suggested mods
      if (data.mods && Array.isArray(data.mods)) {
        for (const suggestion of data.mods) {
          const mod = availableMods.find((m) => m.id === suggestion.modId || m.slug === suggestion.slug);
          if (mod) {
            applyModToConfig(mod.categoryId, mod);
          }
        }
      }

      if (data.buildName) setBuildName(data.buildName);
      setResult(data.description ?? "Build generated successfully!");
    } catch (error) {
      setResult("Failed to generate build. Check your OpenAI API key.");
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "stealth black performance build",
    "white pearl daily driver",
    "track-focused aggressive stance",
    "clean minimal look under £3k",
  ];

  return (
    <div className="p-4 border border-white/10 rounded-2xl bg-white/2">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-purple-400" />
        <h4 className="text-white text-sm font-medium">AI Build Generator</h4>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          placeholder="Describe your dream build..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/80 text-sm placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="px-3 py-2 bg-white text-black rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-white/90 transition-all"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
        </button>
      </div>

      {/* Quick suggestions */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => setPrompt(s)}
            className="px-2 py-1 text-xs text-white/40 bg-white/3 border border-white/8 rounded-full hover:text-white/60 hover:border-white/15 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {result && (
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs leading-relaxed">
          {result}
        </div>
      )}
    </div>
  );
}
