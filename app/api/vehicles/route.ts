import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ vehicles });
  } catch (error) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
