import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withCache } from "@/lib/cache";
import type { Category } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const category = searchParams.get("category") as Category | null;
  const brand = searchParams.get("brand");
  const search = searchParams.get("search");
  const minPrice = parseFloat(searchParams.get("minPrice") || "0");
  const maxPrice = parseFloat(searchParams.get("maxPrice") || "99999");
  const inStock = searchParams.get("inStock");
  const sort = searchParams.get("sort") || "price_asc";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "24"));
  const skip = (page - 1) * limit;

  const cacheKey = `products:${JSON.stringify({ category, brand, search, minPrice, maxPrice, inStock, sort, page, limit })}`;

  try {
    const result = await withCache(
      cacheKey,
      async () => {
        const where: Record<string, unknown> = { active: true };
        if (category) where.category = category;
        if (brand) where.brand = { contains: brand, mode: "insensitive" };
        if (search) {
          where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { brand: { contains: search, mode: "insensitive" } },
            { model: { contains: search, mode: "insensitive" } },
          ];
        }
        if (inStock === "true") {
          where.prices = { some: { inStock: true } };
        }

        const priceFilter =
          minPrice > 0 || maxPrice < 99999
            ? { some: { price: { gte: minPrice, lte: maxPrice } } }
            : undefined;
        if (priceFilter) where.prices = priceFilter;

        const [products, total] = await Promise.all([
          prisma.product.findMany({
            where,
            skip,
            take: limit,
            include: {
              prices: {
                include: { retailer: true },
                orderBy: { price: "asc" },
              },
            },
            orderBy:
              sort === "newest"
                ? { createdAt: "desc" }
                : sort === "popular"
                ? { viewCount: "desc" }
                : { name: "asc" },
          }),
          prisma.product.count({ where }),
        ]);

        let sorted = products.map((p) => {
          const inStockPrices = p.prices.filter((pr) => pr.inStock);
          const lowestPrice = inStockPrices.length > 0 ? Math.min(...inStockPrices.map((pr) => pr.price)) : null;
          return { ...p, lowestPrice };
        });

        if (sort === "price_asc") {
          sorted = sorted.sort((a, b) => (a.lowestPrice ?? 999999) - (b.lowestPrice ?? 999999));
        } else if (sort === "price_desc") {
          sorted = sorted.sort((a, b) => (b.lowestPrice ?? 0) - (a.lowestPrice ?? 0));
        }

        return {
          data: sorted,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      },
      60
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/products]", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
