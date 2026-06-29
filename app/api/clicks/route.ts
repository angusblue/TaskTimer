import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const clickSchema = z.object({
  modId: z.string(),
  type: z.enum(["view", "affiliate", "checkout", "install_inquiry"]),
  buildId: z.string().optional(),
  source: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const body = await request.json();

  const parsed = clickSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { modId, type, buildId, source } = parsed.data;

  try {
    let dbUserId: string | undefined;
    if (userId) {
      const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
      dbUserId = dbUser?.id;
    }

    const click = await prisma.click.create({
      data: {
        modId,
        type,
        buildId,
        source,
        userId: dbUserId,
        metadata: {
          userAgent: request.headers.get("user-agent"),
          referer: request.headers.get("referer"),
        },
      },
    });

    return NextResponse.json({ click }, { status: 201 });
  } catch {
    // Silently fail — don't break the UX for analytics
    return NextResponse.json({ ok: true });
  }
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const modId = searchParams.get("modId");
  const days = parseInt(searchParams.get("days") ?? "30");

  const since = new Date();
  since.setDate(since.getDate() - days);

  const clicks = await prisma.click.groupBy({
    by: ["modId", "type"],
    where: {
      createdAt: { gte: since },
      ...(modId ? { modId } : {}),
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  return NextResponse.json({ clicks });
}
