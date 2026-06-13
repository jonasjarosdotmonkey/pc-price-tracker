import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withCache } from "@/lib/cache";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = req.nextUrl;
  const days = Math.min(365, parseInt(searchParams.get("days") || "30"));
  const retailerId = searchParams.get("retailerId");

  const cacheKey = `price-history:${id}:${days}:${retailerId || "all"}`;

  try {
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const data = await withCache(
      cacheKey,
      async () => {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const where: Record<string, unknown> = {
          productId: product.id,
          recordedAt: { gte: since },
        };
        if (retailerId) where.retailerId = retailerId;

        const history = await prisma.priceHistory.findMany({
          where,
          include: { product: { select: { name: true } } },
          orderBy: { recordedAt: "asc" },
          take: 500,
        });

        const retailers = await prisma.retailer.findMany({
          where: { id: { in: [...new Set(history.map((h) => h.retailerId))] } },
          select: { id: true, name: true, slug: true },
        });

        const retailerMap = Object.fromEntries(retailers.map((r) => [r.id, r]));

        return history.map((h) => ({
          price: h.price,
          retailerId: h.retailerId,
          retailerName: retailerMap[h.retailerId]?.name || "Unknown",
          recordedAt: h.recordedAt.toISOString(),
          inStock: h.inStock,
        }));
      },
      120
    );

    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET /api/products/:id/history]", err);
    return NextResponse.json({ error: "Failed to fetch price history" }, { status: 500 });
  }
}
