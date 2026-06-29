import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default async function AdminAnalyticsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } }).catch(() => null);
  if (!dbUser?.isAdmin) redirect("/");

  const since30 = new Date();
  since30.setDate(since30.getDate() - 30);

  const [clicksByType, topModsByClicks, recentClicks] = await Promise.all([
    prisma.click.groupBy({
      by: ["type"],
      _count: { id: true },
      where: { createdAt: { gte: since30 } },
    }).catch(() => []),

    prisma.click.groupBy({
      by: ["modId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
      where: { createdAt: { gte: since30 } },
    }).catch(() => []),

    prisma.click.findMany({
      where: { createdAt: { gte: since30 } },
      include: { mod: { select: { name: true, brand: true, price: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }).catch(() => []),
  ]);

  // Enrich top mods
  const modIds = topModsByClicks.map((c) => c.modId);
  const mods = await prisma.mod.findMany({ where: { id: { in: modIds } }, select: { id: true, name: true, brand: true, price: true } }).catch(() => []);
  const modMap = Object.fromEntries(mods.map((m) => [m.id, m]));

  const totalClicks = clicksByType.reduce((s, c) => s + c._count.id, 0);
  const affiliateClicks = clicksByType.find((c) => c.type === "affiliate")?._count.id ?? 0;

  // Estimated revenue (assume avg 7% commission on £1500 avg order)
  const estimatedRevenue = affiliateClicks * 1500 * 0.07;

  return (
    <div className="min-h-screen pt-16 px-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="py-10 border-b border-white/5 mb-8">
          <Link href="/admin" className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-4 transition-colors w-fit">
            <ArrowLeft size={14} />
            Admin
          </Link>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-white/40 text-sm mt-1">Last 30 days</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Clicks", value: totalClicks.toLocaleString() },
            { label: "Affiliate Clicks", value: affiliateClicks.toLocaleString() },
            { label: "Click → Affiliate Rate", value: totalClicks ? `${((affiliateClicks / totalClicks) * 100).toFixed(1)}%` : "0%" },
            { label: "Est. Revenue", value: formatPrice(estimatedRevenue) },
          ].map((kpi) => (
            <div key={kpi.label} className="p-5 rounded-2xl border border-white/6 bg-[#111]">
              <p className="text-2xl font-bold text-white mb-1">{kpi.value}</p>
              <p className="text-white/40 text-xs">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Clicks by type */}
        <div className="mb-10">
          <h2 className="text-white/40 text-xs uppercase tracking-wider mb-5">Clicks by Type</h2>
          <div className="flex gap-4 flex-wrap">
            {clicksByType.map((c) => (
              <div key={c.type} className="px-4 py-3 rounded-xl border border-white/6 bg-white/2">
                <p className="text-white font-bold text-xl">{c._count.id}</p>
                <p className="text-white/40 text-xs capitalize">{c.type}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top mods */}
        {topModsByClicks.length > 0 && (
          <div className="mb-10">
            <h2 className="text-white/40 text-xs uppercase tracking-wider mb-5">Top Mods by Clicks</h2>
            <div className="rounded-2xl border border-white/6 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 bg-white/2">
                    <th className="text-left px-5 py-3 text-white/30 text-xs font-medium">Mod</th>
                    <th className="text-right px-5 py-3 text-white/30 text-xs font-medium">Price</th>
                    <th className="text-right px-5 py-3 text-white/30 text-xs font-medium">Clicks (30d)</th>
                    <th className="text-right px-5 py-3 text-white/30 text-xs font-medium">Est. Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topModsByClicks.map((c) => {
                    const mod = modMap[c.modId];
                    if (!mod) return null;
                    return (
                      <tr key={c.modId} className="border-b border-white/3 hover:bg-white/2">
                        <td className="px-5 py-3">
                          <p className="text-white text-sm font-medium">{mod.name}</p>
                          <p className="text-white/30 text-xs">{mod.brand}</p>
                        </td>
                        <td className="px-5 py-3 text-right text-white/70 text-sm">{formatPrice(mod.price)}</td>
                        <td className="px-5 py-3 text-right text-white text-sm font-medium">{c._count.id}</td>
                        <td className="px-5 py-3 text-right text-emerald-400 text-sm">
                          {formatPrice(c._count.id * mod.price * 0.07)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent clicks */}
        {recentClicks.length > 0 && (
          <div>
            <h2 className="text-white/40 text-xs uppercase tracking-wider mb-5">Recent Activity</h2>
            <div className="space-y-2">
              {recentClicks.map((click) => (
                <div key={click.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/4 bg-white/1">
                  <div>
                    <span className="text-white/60 text-sm">{click.mod.name}</span>
                    <span className="mx-2 text-white/20">·</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      click.type === "affiliate" ? "bg-emerald-500/15 text-emerald-400" :
                      click.type === "checkout" ? "bg-blue-500/15 text-blue-400" :
                      "bg-white/5 text-white/30"
                    }`}>{click.type}</span>
                  </div>
                  <span className="text-white/25 text-xs">
                    {new Date(click.createdAt).toLocaleDateString("en-GB")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
