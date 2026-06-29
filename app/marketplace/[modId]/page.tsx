import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, getDifficultyLabel, getDifficultyColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ArrowLeft, ExternalLink, Wrench, Truck, Star, ChevronRight } from "lucide-react";

interface PageProps {
  params: Promise<{ modId: string }>;
}

export default async function ModDetailPage({ params }: PageProps) {
  const { modId } = await params;

  let mod;
  try {
    mod = await prisma.mod.findUnique({
      where: { id: modId },
      include: {
        category: true,
        compats: { include: { vehicle: true } },
      },
    });
  } catch {
    notFound();
  }

  if (!mod) notFound();

  // Track view server-side
  await prisma.click.create({
    data: { modId: mod.id, type: "view", source: "marketplace" },
  }).catch(() => {});

  const vehicles = mod.compats.map((c) => c.vehicle);

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-white/30 text-sm mb-8">
          <Link href="/marketplace" className="hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft size={14} />
            Marketplace
          </Link>
          <ChevronRight size={14} />
          <span>{mod.category?.name}</span>
          <ChevronRight size={14} />
          <span className="text-white/60">{mod.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left — image */}
          <div>
            <div className="aspect-square rounded-2xl bg-[#111] border border-white/8 overflow-hidden flex items-center justify-center">
              {mod.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mod.imageUrl} alt={mod.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-white/5 text-9xl">◯</div>
              )}
            </div>

            {/* Thumbnail strip */}
            {mod.images.length > 0 && (
              <div className="flex gap-3 mt-4">
                {mod.images.slice(0, 4).map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={img} alt="" className="w-16 h-16 rounded-xl object-cover border border-white/8" />
                ))}
              </div>
            )}
          </div>

          {/* Right — details */}
          <div>
            <div className="mb-2">
              <span className="text-white/40 text-sm font-medium">{mod.brand}</span>
            </div>
            <h1 className="text-white text-3xl font-bold mb-4">{mod.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              {mod.salePrice && mod.salePrice < mod.price ? (
                <>
                  <span className="text-white text-4xl font-bold">{formatPrice(mod.salePrice)}</span>
                  <span className="text-white/30 text-xl line-through">{formatPrice(mod.price)}</span>
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-sm rounded-full border border-red-500/30">
                    Save {formatPrice(mod.price - mod.salePrice)}
                  </span>
                </>
              ) : (
                <span className="text-white text-4xl font-bold">{formatPrice(mod.price)}</span>
              )}
            </div>

            {/* Description */}
            {mod.description && (
              <p className="text-white/50 leading-relaxed mb-8">{mod.description}</p>
            )}

            {/* Specs grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="p-3 rounded-xl bg-white/3 border border-white/5">
                <p className="text-white/30 text-xs mb-1">Install Difficulty</p>
                <p className={cn("font-medium text-sm", getDifficultyColor(mod.installDifficulty))}>
                  {getDifficultyLabel(mod.installDifficulty)}
                </p>
              </div>
              {mod.installTime && (
                <div className="p-3 rounded-xl bg-white/3 border border-white/5">
                  <p className="text-white/30 text-xs mb-1">Install Time</p>
                  <p className="text-white font-medium text-sm">{mod.installTime}</p>
                </div>
              )}
              <div className="p-3 rounded-xl bg-white/3 border border-white/5">
                <p className="text-white/30 text-xs mb-1">UK Delivery</p>
                <p className="text-white font-medium text-sm">{mod.deliveryUK ? "✓ Available" : "✗ Not available"}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/3 border border-white/5">
                <p className="text-white/30 text-xs mb-1">EU Delivery</p>
                <p className="text-white font-medium text-sm">{mod.deliveryEU ? "✓ Available" : "✗ Not available"}</p>
              </div>
            </div>

            {/* Compatible vehicles */}
            <div className="mb-8">
              <p className="text-white/30 text-xs uppercase tracking-wider mb-3">Compatible Vehicles</p>
              <div className="flex flex-wrap gap-2">
                {vehicles.map((v) => (
                  <Link
                    key={v.id}
                    href={`/configurator/${v.slug}`}
                    className="px-3 py-1.5 rounded-full text-xs border border-white/10 text-white/50 hover:border-white/25 hover:text-white transition-colors"
                  >
                    Tesla {v.name} {v.year}
                  </Link>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              {(mod.affiliateUrl || mod.checkoutUrl) && (
                <a
                  href={mod.affiliateUrl ?? mod.checkoutUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-white text-black font-semibold rounded-2xl hover:bg-white/90 transition-colors text-lg"
                >
                  Buy Now
                  <ExternalLink size={18} />
                </a>
              )}

              {vehicles[0] && (
                <Link
                  href={`/configurator/${vehicles[0].slug}`}
                  className="flex items-center justify-center gap-2 w-full py-4 border border-white/15 text-white font-medium rounded-2xl hover:border-white/30 hover:bg-white/5 transition-colors"
                >
                  See on car in 3D →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
