import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Plus, Globe, Lock, Eye } from "lucide-react";

export default async function BuildsPage() {
  const { userId } = await auth();

  let userBuilds: { id: string; slug: string; name: string; isPublic: boolean; totalPrice: number; viewCount: number; createdAt: Date; vehicle: { name: string; make: string; year: number } | null }[] = [];
  let publicBuilds: typeof userBuilds = [];

  try {
    if (userId) {
      const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
      if (dbUser) {
        userBuilds = await prisma.build.findMany({
          where: { userId: dbUser.id },
          include: { vehicle: { select: { name: true, make: true, year: true } } },
          orderBy: { updatedAt: "desc" },
        });
      }
    }

    publicBuilds = await prisma.build.findMany({
      where: { isPublic: true },
      include: { vehicle: { select: { name: true, make: true, year: true } } },
      orderBy: { viewCount: "desc" },
      take: 12,
    });
  } catch {}

  return (
    <div className="min-h-screen pt-16 px-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="py-16 border-b border-white/5 mb-12">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-3">Builds</h1>
              <p className="text-white/40">Community Tesla configurations</p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-5 py-3 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-colors text-sm"
            >
              <Plus size={16} />
              New Build
            </Link>
          </div>
        </div>

        {/* My Builds */}
        {userId && userBuilds.length > 0 && (
          <div className="mb-16">
            <h2 className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-6">
              My Builds
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {userBuilds.map((build) => (
                <BuildCard key={build.id} build={build} isOwner />
              ))}
            </div>
          </div>
        )}

        {/* Community Builds */}
        <div>
          <h2 className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-6">
            Community Builds
          </h2>

          {publicBuilds.length === 0 ? (
            <div className="text-center py-16 text-white/20">
              <p>No public builds yet. Be the first!</p>
              <Link href="/" className="mt-4 inline-block text-white/40 underline text-sm">
                Create a build
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {publicBuilds.map((build) => (
                <BuildCard key={build.id} build={build} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BuildCard({
  build,
  isOwner = false,
}: {
  build: { id: string; slug: string; name: string; isPublic: boolean; totalPrice: number; viewCount: number; createdAt: Date; vehicle: { name: string; make: string; year: number } | null };
  isOwner?: boolean;
}) {
  return (
    <Link
      href={`/builds/${build.slug}`}
      className="block group p-5 rounded-2xl border border-white/6 bg-[#111] hover:border-white/15 transition-all duration-200"
    >
      {/* Vehicle visual */}
      <div className="h-28 rounded-xl bg-gradient-to-br from-white/3 to-transparent mb-4 flex items-center justify-center border border-white/4">
        <div className="text-white/10 text-5xl">◯</div>
      </div>

      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-white/30 text-xs mb-0.5">
            {build.vehicle?.make} {build.vehicle?.name} {build.vehicle?.year}
          </p>
          <h3 className="text-white font-semibold group-hover:text-white/80 transition-colors">
            {build.name}
          </h3>
        </div>
        <div className="text-white/30">
          {build.isPublic ? <Globe size={14} /> : <Lock size={14} />}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <span className="text-white font-bold">{formatPrice(build.totalPrice)}</span>
        <div className="flex items-center gap-1 text-white/25 text-xs">
          <Eye size={11} />
          {build.viewCount}
        </div>
      </div>

      {isOwner && (
        <div className="mt-2">
          <span className="text-xs text-white/25 bg-white/5 px-2 py-0.5 rounded-full">Your build</span>
        </div>
      )}
    </Link>
  );
}
