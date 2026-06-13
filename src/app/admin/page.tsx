import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import {
  Package, RefreshCw, AlertTriangle, Eye, Bell, BarChart3,
  CheckCircle, XCircle, TrendingUp, Users, Store,
} from "lucide-react";
import { formatRelativeTime, categoryLabel } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Dashboard" };

async function getAdminStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalProducts, totalRetailers, totalUsers,
    priceUpdatesToday, failedFetchesToday,
    mostViewedProducts, mostWatchedRaw,
    recentActivity, categoryBreakdown,
  ] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.retailer.count({ where: { active: true } }),
    prisma.user.count(),
    prisma.fetchLog.count({ where: { status: "success", createdAt: { gte: today } } }),
    prisma.fetchLog.count({ where: { status: "error", createdAt: { gte: today } } }),
    prisma.product.findMany({
      where: { active: true }, orderBy: { viewCount: "desc" }, take: 5,
      select: { id: true, name: true, viewCount: true, image: true, slug: true },
    }),
    prisma.alert.groupBy({
      by: ["productId"], where: { active: true },
      _count: { productId: true }, orderBy: { _count: { productId: "desc" } }, take: 5,
    }),
    prisma.fetchLog.findMany({
      orderBy: { createdAt: "desc" }, take: 15,
      select: { retailer: true, status: true, product: true, createdAt: true, error: true, duration: true },
    }),
    prisma.product.groupBy({ by: ["category"], where: { active: true }, _count: { id: true } }),
  ]);

  const watchedProducts = await prisma.product.findMany({
    where: { id: { in: mostWatchedRaw.map((r) => r.productId) } },
    select: { id: true, name: true, image: true, slug: true },
  });

  return {
    totalProducts, totalRetailers, totalUsers,
    priceUpdatesToday, failedFetchesToday,
    mostViewedProducts,
    mostWatchedProducts: watchedProducts.map((p) => ({
      ...p,
      alertCount: mostWatchedRaw.find((r) => r.productId === p.id)?._count.productId || 0,
    })),
    recentActivity,
    categoryBreakdown: categoryBreakdown.map((c) => ({ category: c.category, count: c._count.id })),
  };
}

export default async function AdminPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user?.id || role !== "ADMIN") redirect("/");

  const stats = await getAdminStats();

  const summaryCards = [
    { label: "Total Products", value: stats.totalProducts, icon: Package, color: "text-brand-400", bg: "bg-brand-500/10" },
    { label: "Retailers", value: stats.totalRetailers, icon: Store, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Updates Today", value: stats.priceUpdatesToday, icon: RefreshCw, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Failed Today", value: stats.failedFetchesToday, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Success Rate", value: stats.priceUpdatesToday + stats.failedFetchesToday > 0 ? `${Math.round((stats.priceUpdatesToday / (stats.priceUpdatesToday + stats.failedFetchesToday)) * 100)}%` : "N/A", icon: BarChart3, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor price tracking activity and system health</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/api/cron/update-prices"
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Trigger Update
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-surface-800 border border-surface-700 rounded-xl p-4">
            <div className={`inline-flex p-2 rounded-lg ${card.bg} mb-3`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-100">{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Viewed */}
        <div className="bg-surface-800 border border-surface-700 rounded-xl p-5">
          <h2 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <Eye className="h-4 w-4 text-brand-400" /> Most Viewed Products
          </h2>
          <div className="space-y-3">
            {stats.mostViewedProducts.map((product, i) => (
              <div key={product.id} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-5 text-center">{i + 1}</span>
                <Image
                  src={product.image || `https://placehold.co/40x40/1e1e28/60a5fa?text=P`}
                  alt={product.name}
                  width={36}
                  height={36}
                  className="rounded-lg object-contain bg-surface-700 shrink-0"
                />
                <Link href={`/products/${product.slug}`} className="flex-1 text-sm text-gray-300 hover:text-brand-400 transition-colors truncate">
                  {product.name}
                </Link>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {product.viewCount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Watched */}
        <div className="bg-surface-800 border border-surface-700 rounded-xl p-5">
          <h2 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-yellow-400" /> Most Watched Products
          </h2>
          <div className="space-y-3">
            {stats.mostWatchedProducts.length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-4">No alerts set yet</p>
            ) : (
              stats.mostWatchedProducts.map((product, i) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-5 text-center">{i + 1}</span>
                  <Image
                    src={product.image || `https://placehold.co/40x40/1e1e28/60a5fa?text=P`}
                    alt={product.name}
                    width={36}
                    height={36}
                    className="rounded-lg object-contain bg-surface-700 shrink-0"
                  />
                  <Link href={`/products/${product.slug}`} className="flex-1 text-sm text-gray-300 hover:text-brand-400 transition-colors truncate">
                    {product.name}
                  </Link>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Bell className="h-3 w-3" /> {product.alertCount}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-surface-800 border border-surface-700 rounded-xl p-5">
          <h2 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-400" /> Products by Category
          </h2>
          <div className="space-y-2.5">
            {stats.categoryBreakdown.sort((a, b) => b.count - a.count).map((cat) => {
              const maxCount = Math.max(...stats.categoryBreakdown.map((c) => c.count));
              const pct = (cat.count / maxCount) * 100;
              return (
                <div key={cat.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{categoryLabel(cat.category)}</span>
                    <span className="text-gray-500">{cat.count}</span>
                  </div>
                  <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-surface-800 border border-surface-700 rounded-xl p-5">
          <h2 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-cyan-400" /> Recent Fetch Activity
          </h2>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-4">No activity yet. Run a price update.</p>
            ) : (
              stats.recentActivity.map((log, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-500">
                  {log.status === "success" ? (
                    <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-400">{log.retailer}</span>
                    {log.product && <span className="text-gray-600"> · {log.product}</span>}
                    {log.duration && <span className="text-gray-600"> · {log.duration}ms</span>}
                    {log.error && <p className="text-red-400/70 truncate">{log.error}</p>}
                  </div>
                  <span className="shrink-0">{formatRelativeTime(log.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
