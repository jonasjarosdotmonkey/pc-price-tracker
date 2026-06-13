"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { categoryLabel } from "@/lib/utils";
import type { Category } from "@/types";

const CATEGORIES: Category[] = [
  "CPU", "GPU", "MOTHERBOARD", "RAM", "SSD", "HDD", "PSU", "CASE", "COOLER",
];

const BRANDS = [
  "AMD", "NVIDIA", "Intel", "ASUS", "MSI", "Gigabyte", "ASRock",
  "Corsair", "G.SKILL", "Kingston", "Crucial",
  "Samsung", "Western Digital", "Seagate",
  "Fractal Design", "Lian Li", "NZXT",
  "Noctua", "be quiet!", "ARCTIC", "Cooler Master",
];

const SORT_OPTIONS = [
  { value: "price_asc", label: "Lowest Price" },
  { value: "price_desc", label: "Highest Price" },
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
];

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";
  const sort = searchParams.get("sort") || "price_asc";
  const inStock = searchParams.get("inStock") || "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  const hasFilters = category || brand || inStock;

  return (
    <div className="bg-surface-800 border border-surface-700 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-200 text-sm">Filters</h3>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/products")}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      <Select
        label="Category"
        value={category}
        onChange={(e) => updateParam("category", e.target.value)}
        options={[
          { value: "", label: "All Categories" },
          ...CATEGORIES.map((c) => ({ value: c, label: categoryLabel(c) })),
        ]}
      />

      <Select
        label="Brand"
        value={brand}
        onChange={(e) => updateParam("brand", e.target.value)}
        options={[
          { value: "", label: "All Brands" },
          ...BRANDS.map((b) => ({ value: b, label: b })),
        ]}
      />

      <Select
        label="Sort By"
        value={sort}
        onChange={(e) => updateParam("sort", e.target.value)}
        options={SORT_OPTIONS}
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">Availability</label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStock === "true"}
            onChange={(e) => updateParam("inStock", e.target.checked ? "true" : "")}
            className="w-4 h-4 rounded bg-surface-700 border-surface-500 text-brand-500 focus:ring-brand-500"
          />
          <span className="text-sm text-gray-400">In Stock Only</span>
        </label>
      </div>
    </div>
  );
}
