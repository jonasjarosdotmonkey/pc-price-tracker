import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Heart, Package } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import type { ProductWithPrices } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Favorites",
  description: "Your saved PC components.",
};

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          prices: { include: { retailer: true }, orderBy: { price: "asc" } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const products: ProductWithPrices[] = favorites.map((f) => {
    const inStock = f.product.prices.filter((p) => p.inStock);
    return {
      ...f.product,
      specs: f.product.specs as Record<string, unknown> | null,
      lowestPrice: inStock.length > 0 ? Math.min(...inStock.map((p) => p.price)) : null,
      lowestRetailer: inStock.length > 0 ? inStock[0].retailer.name : null,
      isFavorited: true,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-400 fill-red-400" />
          My Favorites
        </h1>
        <p className="text-gray-500 mt-1">{products.length} saved product{products.length !== 1 ? "s" : ""}</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-surface-800 border border-surface-700 rounded-xl">
          <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-400 mb-1">No favorites yet</h3>
          <p className="text-sm text-gray-600 mb-4">Click the heart icon on any product to save it here.</p>
          <Link href="/products" className="btn-primary inline-flex">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
