import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const publicOnly = searchParams.get("public");

  try {
    const builds = await prisma.build.findMany({
      where: { ...(publicOnly ? { isPublic: true } : {}) },
      include: {
        vehicle: true,
        mods: { include: { mod: { include: { category: true } } } },
        user: { select: { name: true } },
      },
      orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
      take: 24,
    });
    return NextResponse.json({ builds });
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

const createBuildSchema = z.object({
  name: z.string().min(1).max(100),
  vehicleSlug: z.string(),
  modIds: z.array(z.string()),
  isPublic: z.boolean().default(false),
  totalPrice: z.number().default(0),
});

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const body = await request.json();
  const data = createBuildSchema.parse(body);

  let dbUser = null;
  if (userId) {
    dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { slug: data.vehicleSlug } });
  if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });

  const build = await prisma.build.create({
    data: {
      name: data.name,
      vehicleId: vehicle.id,
      isPublic: data.isPublic,
      totalPrice: data.totalPrice,
      ...(dbUser ? { userId: dbUser.id } : {}),
      mods: {
        create: data.modIds.map((modId) => ({ modId })),
      },
    },
    include: { vehicle: true, mods: { include: { mod: true } } },
  });

  return NextResponse.json({ build }, { status: 201 });
}
