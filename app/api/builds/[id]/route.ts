import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const build = await prisma.build.findUnique({
    where: { slug: id },
    include: {
      vehicle: true,
      mods: { include: { mod: { include: { category: true } } } },
      user: { select: { name: true } },
    },
  }).catch(() => null);

  if (!build) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Increment view count
  await prisma.build.update({ where: { id: build.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  return NextResponse.json({ build });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const build = await prisma.build.findUnique({ where: { slug: id }, include: { user: true } });
  if (!build) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (build.userId !== dbUser?.id && !dbUser?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.build.update({
    where: { id: build.id },
    data: {
      name: body.name,
      isPublic: body.isPublic,
      description: body.description,
    },
  });

  return NextResponse.json({ build: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const build = await prisma.build.findUnique({ where: { slug: id } });
  if (!build) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (build.userId !== dbUser?.id && !dbUser?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.build.delete({ where: { id: build.id } });
  return NextResponse.json({ ok: true });
}
