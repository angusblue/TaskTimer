import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Package, MousePointer, BarChart3, Settings, ArrowRight } from "lucide-react";

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } }).catch(() => null);
  if (!dbUser?.isAdmin) redirect("/");

  const [modCount, buildCount, vehicleCount, clickStats] = await Promise.all([
    prisma.mod.count().catch(() => 0),
    prisma.build.count().catch(() => 0),
    prisma.vehicle.count().catch(() => 0),
    prisma.click.groupBy({
      by: ["type"],
      _count: { id: true },
    }).catch(() => []),
  ]);

  const totalClicks = clickStats.reduce((sum, s) => sum + s._count.id, 0);
  const affiliateClicks = clickStats.find((s) => s.type === "affiliate")?._count.id ?? 0;

  const topMods = await prisma.mod.findMany({
    take: 5,
    orderBy: { clicks: { _count: "desc" } },
    include: { _count: { select: { clicks: true } }, category: true },
  }).catch(() => []);

  return (
    <div className="min-h-screen pt-16 px-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="py-12 border-b border-white/5 mb-10">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Admin Panel</p>
          <h1 className="text-3xl font-bold text-white">EVMods Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Mods", value: modCount, icon: <Package size={16} /> },
            { label: "Total Builds", value: buildCount, icon: <BarChart3 size={16} /> },
            { label: "Total Clicks", value: totalClicks.toLocaleString(), icon: <MousePointer size={16} /> },
            { label: "Affiliate Clicks", value: affiliateClicks.toLocaleString(), icon: <ArrowRight size={16} /> },
          ].map((stat) => (
            <div key={stat.label} className="p-5 rounded-2xl border border-white/6 bg-[#111]">
              <div className="text-white/30 mb-3">{stat.icon}</div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-white/40 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Link href="/admin/mods" className="flex items-center justify-between p-5 rounded-2xl border border-white/8 hover:border-white/20 bg-[#111] transition-all group">
            <div>
              <p className="text-white font-semibold mb-1">Manage Mods</p>
              <p className="text-white/40 text-sm">{modCount} products</p>
            </div>
            <ArrowRight size={16} className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
          <Link href="/admin/analytics" className="flex items-center justify-between p-5 rounded-2xl border border-white/8 hover:border-white/20 bg-[#111] transition-all group">
            <div>
              <p className="text-white font-semibold mb-1">Analytics</p>
              <p className="text-white/40 text-sm">Clicks & revenue</p>
            </div>
            <ArrowRight size={16} className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
          <Link href="/marketplace" className="flex items-center justify-between p-5 rounded-2xl border border-white/8 hover:border-white/20 bg-[#111] transition-all group">
            <div>
              <p className="text-white font-semibold mb-1">View Marketplace</p>
              <p className="text-white/40 text-sm">Public view</p>
            </div>
            <ArrowRight size={16} className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Top performing mods */}
        {topMods.length > 0 && (
          <div>
            <h2 className="text-white/40 text-xs uppercase tracking-wider mb-5">Top Performing Mods</h2>
            <div className="rounded-2xl border border-white/6 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-5 py-3 text-white/30 text-xs font-medium">Product</th>
                    <th className="text-left px-5 py-3 text-white/30 text-xs font-medium">Category</th>
                    <th className="text-right px-5 py-3 text-white/30 text-xs font-medium">Price</th>
                    <th className="text-right px-5 py-3 text-white/30 text-xs font-medium">Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {topMods.map((mod) => (
                    <tr key={mod.id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-white text-sm font-medium">{mod.name}</p>
                        <p className="text-white/30 text-xs">{mod.brand}</p>
                      </td>
                      <td className="px-5 py-3 text-white/50 text-sm">{mod.category?.name}</td>
                      <td className="px-5 py-3 text-right text-white text-sm font-medium">{formatPrice(mod.price)}</td>
                      <td className="px-5 py-3 text-right text-white/60 text-sm">{mod._count.clicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
