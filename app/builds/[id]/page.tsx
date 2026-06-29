import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Globe, Lock, Share2 } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BuildDetailPage({ params }: PageProps) {
  const { id } = await params;

  let build;
  try {
    build = await prisma.build.findUnique({
      where: { slug: id },
      include: {
        vehicle: true,
        mods: { include: { mod: { include: { category: true } } } },
        user: { select: { name: true } },
      },
    });

    if (!build) notFound();

    // Increment view count
    await prisma.build.update({ where: { id: build.id }, data: { viewCount: { increment: 1 } } });
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen pt-16 px-4 pb-20">
      <div className="max-w-5xl mx-auto">
        <div className="pt-8 mb-8">
          <Link href="/builds" className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors w-fit">
            <ArrowLeft size={14} />
            All Builds
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {build.isPublic ? (
                  <span className="flex items-center gap-1 text-xs text-white/30">
                    <Globe size={12} /> Public
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-white/30">
                    <Lock size={12} /> Private
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-white mb-1">{build.name}</h1>
              <p className="text-white/40">
                Tesla {build.vehicle.name} {build.vehicle.year}
                {build.user?.name && ` · by ${build.user.name}`}
              </p>
            </div>

            <div className="text-right">
              <p className="text-white/30 text-sm mb-1">Total Value</p>
              <p className="text-white text-3xl font-bold">{formatPrice(build.totalPrice)}</p>
            </div>
          </div>
        </div>

        {/* Configure this build CTA */}
        <div className="p-6 rounded-2xl border border-white/8 bg-gradient-to-r from-white/3 to-transparent mb-8 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold mb-1">Like this build?</p>
            <p className="text-white/40 text-sm">Load it in the configurator and customise it further.</p>
          </div>
          <Link
            href={`/configurator/${build.vehicle.slug}`}
            className="px-5 py-2.5 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-colors text-sm whitespace-nowrap"
          >
            Configure →
          </Link>
        </div>

        {/* Mods list */}
        <div>
          <h2 className="text-white/40 text-xs font-semibold tracking-widest uppercase mb-6">
            Mods ({build.mods.length})
          </h2>

          {build.mods.length === 0 ? (
            <p className="text-white/25 text-sm">No mods in this build.</p>
          ) : (
            <div className="space-y-3">
              {build.mods.map(({ mod }) => (
                <div key={mod.id} className="flex items-center justify-between p-4 rounded-xl border border-white/6 bg-white/2">
                  <div>
                    <p className="text-white/40 text-xs mb-0.5">{mod.category?.name} · {mod.brand}</p>
                    <p className="text-white font-medium">{mod.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{formatPrice(mod.salePrice ?? mod.price)}</p>
                    {mod.affiliateUrl && (
                      <a
                        href={mod.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-white/30 hover:text-white/60 transition-colors"
                      >
                        Buy →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
