import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const vehicle = searchParams.get("vehicle");
  const featured = searchParams.get("featured");

  try {
    const mods = await prisma.mod.findMany({
      where: {
        isActive: true,
        ...(category ? { category: { slug: category } } : {}),
        ...(vehicle ? { compats: { some: { vehicle: { slug: vehicle } } } } : {}),
        ...(featured ? { isFeatured: true } : {}),
      },
      include: { category: true },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ mods });
  } catch (error) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

const createModSchema = z.object({
  name: z.string().min(2),
  brand: z.string().min(2),
  price: z.number().positive(),
  categoryId: z.string(),
  description: z.string().optional(),
  installDifficulty: z.number().min(1).max(5).default(3),
  affiliateUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const data = createModSchema.parse(body);

  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const mod = await prisma.mod.create({
    data: { ...data, slug, currency: "GBP", images: [], deliveryEU: true, deliveryUK: true },
  });

  return NextResponse.json({ mod }, { status: 201 });
}
