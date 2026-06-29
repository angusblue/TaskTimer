import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ConfiguratorClient } from "./ConfiguratorClient";

interface PageProps {
  params: Promise<{ vehicleSlug: string }>;
}

export async function generateStaticParams() {
  const vehicles = await prisma.vehicle.findMany({ where: { isActive: true }, select: { slug: true } });
  return vehicles.map((v) => ({ vehicleSlug: v.slug }));
}

export default async function ConfiguratorPage({ params }: PageProps) {
  const { vehicleSlug } = await params;

  let vehicle;
  let categories;

  try {
    vehicle = await prisma.vehicle.findUnique({
      where: { slug: vehicleSlug, isActive: true },
    });

    if (!vehicle) notFound();

    categories = await prisma.modCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        mods: {
          where: {
            isActive: true,
            compats: { some: { vehicleId: vehicle.id } },
          },
          orderBy: [{ isFeatured: "desc" }, { price: "asc" }],
          include: { category: true },
        },
      },
    });
  } catch {
    // Fallback for demo mode without DB
    vehicle = { id: "demo", slug: vehicleSlug, name: vehicleSlug.replace("tesla-", "").replace(/-/g, " "), make: "Tesla", model: "Model 3", year: 2024, trim: null, bodyStyle: "sedan", basePrice: null, imageUrl: null, description: null, isActive: true };
    categories = [];
  }

  return (
    <ConfiguratorClient
      vehicle={vehicle}
      categories={categories as never}
      vehicleSlug={vehicleSlug}
    />
  );
}
