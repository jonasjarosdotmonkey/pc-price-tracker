"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Cpu, Monitor, Package, Zap, HardDrive, Fan, MemoryStick, Server, Plus, Trash2, ExternalLink, ShoppingCart } from "lucide-react";
import { formatCurrency, categoryLabel } from "@/lib/utils";
import type { Category, ProductWithPrices } from "@/types";

const BUILD_SLOTS: { category: Category; label: string; icon: React.ElementType; required: boolean }[] = [
  { category: "CPU", label: "CPU", icon: Cpu, required: true },
  { category: "MOTHERBOARD", label: "Motherboard", icon: Server, required: true },
  { category: "GPU", label: "GPU", icon: Monitor, required: false },
  { category: "RAM", label: "Memory", icon: MemoryStick, required: true },
  { category: "SSD", label: "Storage (SSD)", icon: HardDrive, required: false },
  { category: "HDD", label: "Storage (HDD)", icon: HardDrive, required: false },
  { category: "PSU", label: "Power Supply", icon: Zap, required: true },
  { category: "CASE", label: "Case", icon: Package, required: false },
  { category: "COOLER", label: "CPU Cooler", icon: Fan, required: false },
];

interface BuildState {
  [key: string]: ProductWithPrices | null;
}

export default function BuildsPage() {
  const [build, setBuild] = useState<BuildState>({});
  const [products, setProducts] = useState<Record<string, ProductWithPrices[]>>({});
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState<string | null>(null);
  const [buildName, setBuildName] = useState("My Gaming PC Build");

  async function loadProducts(category: Category) {
    if (products[category]) return;
    setLoadingCategory(category);
    try {
      const res = await fetch(`/api/products?category=${category}&limit=20&sort=price_asc`);
      const data = await res.json();
      setProducts((prev) => ({ ...prev, [category]: data.data || [] }));
    } finally {
      setLoadingCategory(null);
    }
  }

  function openPicker(category: Category) {
    setPickerOpen(category);
    loadProducts(category);
  }

  function selectProduct(category: string, product: ProductWithPrices) {
    setBuild((prev) => ({ ...prev, [category]: product }));
    setPickerOpen(null);
  }

  function removeProduct(category: string) {
    setBuild((prev) => ({ ...prev, [category]: null }));
  }

  const totalPrice = Object.values(build).reduce((sum, p) => {
    if (!p) return sum;
    const inStock = p.prices.filter((pr) => pr.inStock);
    const lowest = inStock.length > 0 ? Math.min(...inStock.map((pr) => pr.price)) : 0;
    return sum + lowest;
  }, 0);

  const itemCount = Object.values(build).filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">PC Build Planner</h1>
        <p className="text-gray-500 mt-1">Select components to plan your build and compare total costs.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Build slots */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={buildName}
              onChange={(e) => setBuildName(e.target.value)}
              className="bg-surface-700 border border-surface-600 text-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-brand-500 flex-1"
            />
          </div>

          {BUILD_SLOTS.map(({ category, label, icon: Icon, required }) => {
            const selected = build[category];
            const inStock = selected ? selected.prices.filter((p) => p.inStock) : [];
            const price = inStock.length > 0 ? Math.min(...inStock.map((p) => p.price)) : null;

            return (
              <div
                key={category}
                className="bg-surface-800 border border-surface-700 rounded-xl overflow-hidden"
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="w-8 h-8 bg-surface-700 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-gray-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-300">{label}</span>
                      {required && <span className="text-xs text-gray-600">(required)</span>}
                    </div>
                    {selected ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <Link href={`/products/${selected.slug}`} className="text-sm text-brand-400 hover:text-brand-300 truncate max-w-xs transition-colors">
                          {selected.name}
                        </Link>
                        {price && <span className="text-xs text-green-400 font-medium shrink-0">{formatCurrency(price)}</span>}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 mt-0.5">No {label.toLowerCase()} selected</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {selected && (
                      <>
                        <a
                          href={selected.prices.find((p) => p.inStock)?.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-500 hover:text-brand-400 hover:bg-surface-700 rounded-lg transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={() => removeProduct(category)}
                          className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-surface-700 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => openPicker(category)}
                      className="flex items-center gap-1.5 bg-surface-700 hover:bg-surface-600 text-gray-300 text-xs px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {selected ? "Change" : "Add"}
                    </button>
                  </div>
                </div>

                {/* Product picker */}
                {pickerOpen === category && (
                  <div className="border-t border-surface-700 bg-surface-900/50 p-4">
                    {loadingCategory === category ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-16 bg-surface-700 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-72 overflow-y-auto">
                        {(products[category] || []).map((product) => {
                          const pInStock = product.prices.filter((p) => p.inStock);
                          const pLowest = pInStock.length > 0 ? Math.min(...pInStock.map((p) => p.price)) : null;
                          return (
                            <button
                              key={product.id}
                              onClick={() => selectProduct(category, product)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-surface-700 rounded-lg text-left transition-colors"
                            >
                              <Image
                                src={product.image || `https://placehold.co/48x48/1e1e28/60a5fa?text=P`}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="rounded-lg object-contain bg-surface-700 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-200 truncate">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.brand}</p>
                              </div>
                              {pLowest ? (
                                <span className="text-sm font-medium text-green-400 shrink-0">{formatCurrency(pLowest)}</span>
                              ) : (
                                <span className="text-xs text-red-400 shrink-0">OOS</span>
                              )}
                            </button>
                          );
                        })}
                        {(products[category] || []).length === 0 && (
                          <p className="text-sm text-gray-600 text-center py-4">No products found for this category.</p>
                        )}
                      </div>
                    )}
                    <div className="mt-2 pt-2 border-t border-surface-700">
                      <Link
                        href={`/products?category=${category}`}
                        className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                      >
                        Browse all {categoryLabel(category)}s →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Build summary */}
        <div className="space-y-4">
          <div className="bg-surface-800 border border-surface-700 rounded-xl p-5 sticky top-20">
            <h2 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-brand-400" />
              Build Summary
            </h2>

            <div className="space-y-2 mb-4">
              {BUILD_SLOTS.map(({ category, label }) => {
                const selected = build[category];
                if (!selected) return null;
                const inStock = selected.prices.filter((p) => p.inStock);
                const price = inStock.length > 0 ? Math.min(...inStock.map((p) => p.price)) : null;
                return (
                  <div key={category} className="flex justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="text-gray-300 font-medium">{price ? formatCurrency(price) : "—"}</span>
                  </div>
                );
              })}
              {itemCount === 0 && (
                <p className="text-sm text-gray-600 text-center py-4">Add components to see your total</p>
              )}
            </div>

            {itemCount > 0 && (
              <>
                <div className="border-t border-surface-600 pt-3 mb-4">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-300">Total ({itemCount} items)</span>
                    <span className="text-green-400 text-lg">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const text = BUILD_SLOTS
                        .filter(({ category }) => build[category])
                        .map(({ category, label }) => {
                          const p = build[category];
                          const inStock = p!.prices.filter((pr) => pr.inStock);
                          const price = inStock.length > 0 ? Math.min(...inStock.map((pr) => pr.price)) : 0;
                          return `${label}: ${p!.name} - ${formatCurrency(price)}`;
                        })
                        .join("\n");
                      navigator.clipboard.writeText(`${buildName}\n${text}\nTotal: ${formatCurrency(totalPrice)}`);
                    }}
                    className="btn-secondary w-full justify-center text-sm"
                  >
                    Copy Build List
                  </button>
                  <button
                    onClick={() => setBuild({})}
                    className="btn-ghost w-full justify-center text-sm text-red-400 hover:text-red-300"
                  >
                    Clear Build
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
