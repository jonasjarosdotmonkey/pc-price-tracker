"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, TrendingDown, ExternalLink, Bell } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatRelativeTime, categoryLabel, categoryIcon } from "@/lib/utils";
import type { ProductWithPrices } from "@/types";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: ProductWithPrices;
  onFavorite?: (productId: string) => void;
}

export function ProductCard({ product, onFavorite }: ProductCardProps) {
  const { data: session } = useSession();
  const [favorited, setFavorited] = useState(product.isFavorited ?? false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const inStockPrices = product.prices.filter((p) => p.inStock);
  const lowestPrice = inStockPrices.length > 0 ? Math.min(...inStockPrices.map((p) => p.price)) : null;
  const lowestRetailer = lowestPrice
    ? inStockPrices.find((p) => p.price === lowestPrice)?.retailer
    : null;
  const highestPrice = inStockPrices.length > 1 ? Math.max(...inStockPrices.map((p) => p.price)) : null;
  const savings = lowestPrice && highestPrice ? highestPrice - lowestPrice : null;

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    if (!session || favoriteLoading) return;

    setFavoriteLoading(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await res.json();
      setFavorited(data.favorited);
      onFavorite?.(product.id);
    } finally {
      setFavoriteLoading(false);
    }
  }

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="group bg-surface-800 border border-surface-700 rounded-xl overflow-hidden card-hover cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 bg-surface-700 overflow-hidden">
          <Image
            src={product.image || `https://placehold.co/400x300/1e1e28/60a5fa?text=${encodeURIComponent(product.name)}`}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <Badge variant="blue">
              {categoryIcon(product.category)} {categoryLabel(product.category)}
            </Badge>
            {savings && savings > 5 && (
              <Badge variant="green">
                <TrendingDown className="h-3 w-3" />
                Save {formatCurrency(savings)}
              </Badge>
            )}
          </div>
          {session && (
            <button
              onClick={toggleFavorite}
              disabled={favoriteLoading}
              className={cn(
                "absolute top-2 right-2 p-1.5 rounded-full transition-all duration-150",
                favorited
                  ? "bg-red-500/20 text-red-400"
                  : "bg-black/30 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-400"
              )}
            >
              <Heart className={cn("h-4 w-4", favorited && "fill-current")} />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="mb-3 flex-1">
            <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
            <h3 className="font-semibold text-gray-200 text-sm leading-snug line-clamp-2 group-hover:text-brand-400 transition-colors">
              {product.name}
            </h3>
          </div>

          <div className="space-y-3">
            {lowestPrice ? (
              <>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Lowest Price</p>
                    <p className="text-2xl font-bold text-green-400 price-tag">
                      {formatCurrency(lowestPrice)}
                    </p>
                  </div>
                  {lowestRetailer && (
                    <span className="text-xs text-gray-500 bg-surface-700 px-2 py-1 rounded-lg">
                      {lowestRetailer.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-slow" />
                    {inStockPrices.length} retailer{inStockPrices.length !== 1 ? "s" : ""}
                  </span>
                  <span>Updated {formatRelativeTime(product.prices[0]?.lastChecked || new Date())}</span>
                </div>
              </>
            ) : (
              <div className="text-center py-2">
                <Badge variant="red">Out of Stock</Badge>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 text-xs font-medium py-2 px-3 rounded-lg text-center transition-colors flex items-center justify-center gap-1">
                <ExternalLink className="h-3 w-3" />
                Compare Prices
              </div>
              {session && (
                <div className="bg-surface-700 hover:bg-surface-600 text-gray-400 hover:text-gray-200 text-xs p-2 rounded-lg transition-colors">
                  <Bell className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
