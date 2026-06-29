import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Plus, ArrowLeft, Check, X } from "lucide-react";

export default async function AdminModsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } }).catch(() => null);
  if (!dbUser?.isAdmin) redirect("/");

  const mods = await prisma.mod.findMany({
    include: {
      category: true,
      _count: { select: { clicks: true, compats: true } },
    },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  const categories = await prisma.modCategory.findMany({ orderBy: { sortOrder: "asc" } }).catch(() => []);

  return (
    <div className="min-h-screen pt-16 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="py-10 border-b border-white/5 mb-8">
          <Link href="/admin" className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-4 transition-colors w-fit">
            <ArrowLeft size={14} />
            Admin
          </Link>
          <div className="flex items-end justify-between">
            <h1 className="text-2xl font-bold text-white">Manage Mods</h1>
            <Link
              href="/admin/mods/new"
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-colors text-sm"
            >
              <Plus size={14} />
              Add Mod
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Link href="/admin/mods" className="px-3 py-1.5 rounded-full text-xs bg-white text-black font-medium">All</Link>
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/admin/mods?category=${cat.slug}`} className="px-3 py-1.5 rounded-full text-xs text-white/50 border border-white/10 hover:border-white/25">
              {cat.name}
            </Link>
          ))}
        </div>

        <div className="rounded-2xl border border-white/6 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                <th className="text-left px-5 py-3 text-white/30 text-xs font-medium">Product</th>
                <th className="text-left px-5 py-3 text-white/30 text-xs font-medium">Category</th>
                <th className="text-right px-5 py-3 text-white/30 text-xs font-medium">Price</th>
                <th className="text-center px-5 py-3 text-white/30 text-xs font-medium">Active</th>
                <th className="text-center px-5 py-3 text-white/30 text-xs font-medium">Featured</th>
                <th className="text-right px-5 py-3 text-white/30 text-xs font-medium">Vehicles</th>
                <th className="text-right px-5 py-3 text-white/30 text-xs font-medium">Clicks</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {mods.map((mod) => (
                <tr key={mod.id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-white text-sm font-medium">{mod.name}</p>
                    <p className="text-white/30 text-xs">{mod.brand}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-white/50">
                      {mod.category?.name}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-white text-sm">
                    {formatPrice(mod.price)}
                    {mod.salePrice && (
                      <span className="block text-xs text-red-400">{formatPrice(mod.salePrice)}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {mod.isActive ? <Check size={14} className="text-emerald-400 mx-auto" /> : <X size={14} className="text-white/20 mx-auto" />}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {mod.isFeatured ? <Check size={14} className="text-yellow-400 mx-auto" /> : <X size={14} className="text-white/20 mx-auto" />}
                  </td>
                  <td className="px-5 py-3.5 text-right text-white/50 text-sm">{mod._count.compats}</td>
                  <td className="px-5 py-3.5 text-right text-white/50 text-sm">{mod._count.clicks}</td>
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/mods/${mod.id}`} className="text-xs text-white/30 hover:text-white transition-colors">
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {mods.length === 0 && (
          <div className="text-center py-16 text-white/20">
            <p>No mods yet. Run <code>npm run db:seed</code> to populate.</p>
          </div>
        )}
      </div>
    </div>
  );
}
