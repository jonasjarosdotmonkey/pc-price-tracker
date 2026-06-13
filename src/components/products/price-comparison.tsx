"use client";

import { ExternalLink, CheckCircle, XCircle, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { PriceWithRetailer } from "@/types";
import { cn } from "@/lib/utils";

interface PriceComparisonProps {
  prices: PriceWithRetailer[];
}

export function PriceComparison({ prices }: PriceComparisonProps) {
  const sorted = [...prices].sort((a, b) => {
    if (!a.inStock && b.inStock) return 1;
    if (a.inStock && !b.inStock) return -1;
    return a.price - b.price;
  });

  const lowestInStock = sorted.find((p) => p.inStock);

  return (
    <div className="space-y-2">
      {sorted.map((price, i) => {
        const isLowest = price.id === lowestInStock?.id;
        const savings = lowestInStock && price.inStock && price.price > lowestInStock.price
          ? price.price - lowestInStock.price
          : null;

        return (
          <div
            key={price.id}
            className={cn(
              "flex items-center gap-4 p-3 rounded-xl border transition-all",
              isLowest
                ? "bg-green-500/10 border-green-500/30"
                : "bg-surface-700/50 border-surface-600 hover:border-surface-500"
            )}
          >
            {/* Rank */}
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
              isLowest ? "bg-green-500 text-white" : "bg-surface-600 text-gray-400"
            )}>
              {i + 1}
            </div>

            {/* Retailer */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-gray-200">{price.retailer.name}</span>
                {isLowest && <Badge variant="green">Best Price</Badge>}
                {savings && <Badge variant="yellow">+{formatCurrency(savings)}</Badge>}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {price.inStock ? (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle className="h-3 w-3" />
                    In Stock
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-red-400">
                    <XCircle className="h-3 w-3" />
                    Out of Stock
                  </span>
                )}
                {price.shipping !== null && (
                  <span className="text-xs text-gray-500">
                    {price.shipping === 0 ? "Free shipping" : `+${formatCurrency(price.shipping)} shipping`}
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="text-right shrink-0">
              <div className={cn(
                "text-xl font-bold price-tag",
                !price.inStock ? "text-gray-500" : isLowest ? "text-green-400" : "text-gray-200"
              )}>
                {formatCurrency(price.price)}
              </div>
              {price.originalPrice && price.originalPrice > price.price && (
                <div className="flex items-center gap-1 justify-end">
                  <span className="text-xs text-gray-500 line-through">
                    {formatCurrency(price.originalPrice)}
                  </span>
                  <Badge variant="red">
                    <TrendingDown className="h-2.5 w-2.5" />
                    {Math.round(((price.originalPrice - price.price) / price.originalPrice) * 100)}% off
                  </Badge>
                </div>
              )}
            </div>

            {/* Link */}
            <a
              href={price.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "p-2 rounded-lg transition-colors shrink-0",
                price.inStock
                  ? "bg-brand-600/20 text-brand-400 hover:bg-brand-600/40"
                  : "bg-surface-600 text-gray-600 cursor-not-allowed"
              )}
              onClick={price.inStock ? undefined : (e) => e.preventDefault()}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        );
      })}
    </div>
  );
}
