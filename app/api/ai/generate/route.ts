import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const generateSchema = z.object({
  prompt: z.string().min(3).max(500),
  vehicleSlug: z.string(),
  availableModIds: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { prompt, vehicleSlug, availableModIds } = generateSchema.parse(body);

  // Fetch available mods for context
  let mods: { id: string; name: string; slug: string; brand: string; price: number; categoryId: string; category: { slug: string } | null }[] = [];
  try {
    mods = await prisma.mod.findMany({
      where: {
        isActive: true,
        ...(availableModIds?.length ? { id: { in: availableModIds } } : {}),
      },
      include: { category: { select: { slug: true } } },
      take: 50,
    });
  } catch {}

  if (!process.env.OPENAI_API_KEY) {
    // Demo mode — rule-based suggestions
    return NextResponse.json(demoGenerate(prompt, mods));
  }

  try {
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const modSummary = mods
      .slice(0, 20)
      .map((m) => `ID:${m.id} [${m.category?.slug}] ${m.name} by ${m.brand} £${m.price}`)
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an EV modification expert helping Tesla owners build their perfect car.
Given a user's description, suggest the best mods from the available inventory.
Return JSON with: { buildName: string, description: string, mods: [{ modId: string, slug: string, reason: string }] }
Only suggest mods from the provided inventory. Max 5 mods.`,
        },
        {
          role: "user",
          content: `User wants: "${prompt}"\n\nAvailable mods:\n${modSummary}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response");

    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(demoGenerate(prompt, mods));
  }
}

function demoGenerate(
  prompt: string,
  mods: { id: string; name: string; slug: string; brand: string; price: number; categoryId: string; category: { slug: string } | null }[]
) {
  const lp = prompt.toLowerCase();

  // Rule-based mod selection
  const selectedMods: { modId: string; slug: string; reason: string }[] = [];
  const usedCategories = new Set<string>();

  const pickMod = (categorySlug: string, preferredSlug?: string) => {
    const catMods = mods.filter((m) => m.category?.slug === categorySlug);
    if (!catMods.length || usedCategories.has(categorySlug)) return;
    const mod = preferredSlug
      ? catMods.find((m) => m.slug.includes(preferredSlug)) ?? catMods[0]
      : catMods[0];
    if (mod) {
      selectedMods.push({ modId: mod.id, slug: mod.slug, reason: `Matches your ${categorySlug} preference` });
      usedCategories.add(categorySlug);
    }
  };

  if (lp.includes("black") || lp.includes("stealth") || lp.includes("dark")) {
    pickMod("wrap", "satin-black");
    pickMod("tint", "llumar");
  } else if (lp.includes("white") || lp.includes("clean") || lp.includes("minimal")) {
    pickMod("wrap", "pearl");
  } else if (lp.includes("red") || lp.includes("racing")) {
    pickMod("wrap", "racing-red");
    pickMod("wheels", "hre");
  }

  if (lp.includes("performance") || lp.includes("track") || lp.includes("sport")) {
    pickMod("wheels", "tsportline");
    pickMod("lowering", "bc-racing");
    pickMod("spoilers", "carbon");
    pickMod("body-kits", "unplugged");
  } else if (lp.includes("daily") || lp.includes("clean") || lp.includes("subtle")) {
    pickMod("wheels", "oem");
    pickMod("spoilers", "lip");
    pickMod("mud-flaps");
  } else {
    pickMod("wheels");
    pickMod("tint");
  }

  if (!selectedMods.length) {
    pickMod("wrap");
    pickMod("wheels");
    pickMod("tint");
  }

  return {
    buildName: generateBuildName(prompt),
    description: `Based on your "${prompt}" vision, we've selected ${selectedMods.length} mods to create your perfect Tesla.`,
    mods: selectedMods.slice(0, 5),
  };
}

function generateBuildName(prompt: string): string {
  const words = prompt.split(" ").filter((w) => w.length > 3);
  const key = words.slice(0, 2).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return key || "Custom Build";
}
