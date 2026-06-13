import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/products/product-card";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { Package, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import type { Category } from "@/types";
import type { ProductWithPrices } from "@/types";

export const metadata: Metadata = {
  title: "Browse PC Components",
  description: "Compare prices on CPUs, GPUs, motherboards, RAM, SSDs, and more.",
};

interface Props {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    sort?: string;
    page?: string;
    limit?: string;
  }>;
}

async function ProductsList({ searchParams }: { searchParams: Awaited<Props["searchParams"]> }) {
  const category = searchParams.category as Category | undefined;
  const brand = searchParams.brand;
  const search = searchParams.search;
  const minPrice = parseFloat(searchParams.minPrice || "0");
  const maxPrice = parseFloat(searchParams.maxPrice || "99999");
  const inStock = searchParams.inStock === "true";
  const sort = searchParams.sort || "price_asc";
  const page = Math.max(1, parseInt(searchParams.page || "1"));
  const limit = 24;
  const skip = (page - 1) * limit;

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
  if (inStock) where.prices = { some: { inStock: true } };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: {
        prices: { include: { retailer: true }, orderBy: { price: "asc" } },
      },
      orderBy:
        sort === "newest" ? { createdAt: "desc" }
        : sort === "popular" ? { viewCount: "desc" }
        : { name: "asc" },
    }),
    prisma.product.count({ where }),
  ]);

  let enriched: ProductWithPrices[] = products.map((p) => {
    const inStockPrices = p.prices.filter((pr) => pr.inStock);
    const lowestPrice = inStockPrices.length > 0 ? Math.min(...inStockPrices.map((pr) => pr.price)) : null;
    return {
      ...p,
      specs: p.specs as Record<string, unknown> | null,
      lowestPrice,
      lowestRetailer: inStockPrices.find((pr) => pr.price === lowestPrice)?.retailer.name || null,
    };
  });

  if (sort === "price_asc") enriched.sort((a, b) => (a.lowestPrice ?? 999999) - (b.lowestPrice ?? 999999));
  else if (sort === "price_desc") enriched.sort((a, b) => (b.lowestPrice ?? 0) - (a.lowestPrice ?? 0));

  const totalPages = Math.ceil(total / limit);

  if (enriched.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <h3 className="font-semibold text-gray-400 mb-1">No products found</h3>
        <p className="text-sm text-gray-600">Try adjusting your filters or search terms.</p>
        <Link href="/products" className="btn-secondary mt-4 inline-flex">Clear Filters</Link>
      </div>
    );
  }

  const pageUrl = (p: number) => {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    params.set("page", String(p));
    return `/products?${params.toString()}`;
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          Showing {skip + 1}–{Math.min(skip + limit, total)} of <span className="text-gray-300">{total}</span> products
          {search && <> for <span className="text-brand-400">"{search}"</span></>}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {enriched.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {page > 1 && (
            <Link href={pageUrl(page - 1)} className="btn-secondary px-3 py-2">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          )}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
            return (
              <Link
                key={p}
                href={pageUrl(p)}
                className={p === page ? "btn-primary px-3 py-2 text-sm" : "btn-secondary px-3 py-2 text-sm"}
              >
                {p}
              </Link>
            );
          })}
          {page < totalPages && (
            <Link href={pageUrl(page + 1)} className="btn-secondary px-3 py-2">
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </>
  );
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">
        {params.category ? `${params.category} Products` : "All PC Components"}
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-56 shrink-0">
          <ProductFilters />
        </aside>

        <div className="flex-1 min-w-0">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            <ProductsList searchParams={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
