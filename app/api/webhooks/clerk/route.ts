import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Clerk webhook to sync users to DB
// Set up at: https://dashboard.clerk.com/apps/[appId]/webhooks
export async function POST(request: NextRequest) {
  const payload = await request.json();
  const { type, data } = payload;

  if (type === "user.created" || type === "user.updated") {
    const clerkId = data.id as string;
    const email = (data.email_addresses as { email_address: string }[])?.[0]?.email_address;
    const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || null;
    const imageUrl = data.image_url as string | null;

    await prisma.user.upsert({
      where: { clerkId },
      create: { clerkId, email: email ?? "", name, imageUrl },
      update: { email: email ?? "", name, imageUrl },
    }).catch(() => {});
  }

  if (type === "user.deleted") {
    const clerkId = data.id as string;
    await prisma.user.delete({ where: { clerkId } }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
