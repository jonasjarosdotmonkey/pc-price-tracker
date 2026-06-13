import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { withCache } from "@/lib/cache";

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user?.id || role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const stats = await withCache(
      "admin:stats",
      async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
          totalProducts,
          totalRetailers,
          priceUpdatesToday,
          failedFetchesToday,
          mostViewedProducts,
          mostWatchedRaw,
          recentActivity,
          categoryBreakdown,
        ] = await Promise.all([
          prisma.product.count({ where: { active: true } }),
          prisma.retailer.count({ where: { active: true } }),
          prisma.fetchLog.count({ where: { status: "success", createdAt: { gte: today } } }),
          prisma.fetchLog.count({ where: { status: "error", createdAt: { gte: today } } }),
          prisma.product.findMany({
            where: { active: true },
            orderBy: { viewCount: "desc" },
            take: 5,
            select: { id: true, name: true, viewCount: true, image: true },
          }),
          prisma.alert.groupBy({
            by: ["productId"],
            where: { active: true },
            _count: { productId: true },
            orderBy: { _count: { productId: "desc" } },
            take: 5,
          }),
          prisma.fetchLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 10,
            select: { retailer: true, status: true, product: true, createdAt: true },
          }),
          prisma.product.groupBy({
            by: ["category"],
            where: { active: true },
            _count: { id: true },
          }),
        ]);

        const mostWatchedProducts = await prisma.product.findMany({
          where: { id: { in: mostWatchedRaw.map((r) => r.productId) } },
          select: { id: true, name: true, image: true },
        });

        const watchedWithCount = mostWatchedProducts.map((p) => ({
          ...p,
          alertCount: mostWatchedRaw.find((r) => r.productId === p.id)?._count.productId || 0,
        }));

        return {
          totalProducts,
          totalRetailers,
          priceUpdatesToday,
          failedFetchesToday,
          mostViewedProducts,
          mostWatchedProducts: watchedWithCount,
          recentActivity,
          categoryBreakdown: categoryBreakdown.map((c) => ({
            category: c.category,
            count: c._count.id,
          })),
        };
      },
      30
    );

    return NextResponse.json(stats);
  } catch (err) {
    console.error("[GET /api/admin/stats]", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
