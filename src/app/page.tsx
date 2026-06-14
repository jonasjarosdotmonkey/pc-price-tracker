import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/products/product-card";

export const dynamic = "force-dynamic";
import {
  Zap, TrendingDown, Bell, Cpu, Monitor, MemoryStick,
  HardDrive, Fan, Package, ArrowRight, Star,
} from "lucide-react";
import type { ProductWithPrices } from "@/types";

async function getFeaturedProducts(): Promise<ProductWithPrices[]> {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: {
      prices: { include: { retailer: true }, orderBy: { price: "asc" } },
    },
    orderBy: { viewCount: "desc" },
    take: 8,
  });

  return products.map((p) => {
    const inStock = p.prices.filter((pr) => pr.inStock);
    return {
      ...p,
      specs: p.specs as Record<string, unknown> | null,
      lowestPrice: inStock.length > 0 ? Math.min(...inStock.map((pr) => pr.price)) : null,
      lowestRetailer: inStock.length > 0 ? inStock[0].retailer.name : null,
    };
  });
}

const CATEGORIES = [
  { label: "CPUs", category: "CPU", icon: Cpu, desc: "Processors from AMD & Intel", color: "from-blue-500/20 to-blue-600/10" },
  { label: "GPUs", category: "GPU", icon: Monitor, desc: "NVIDIA & AMD graphics cards", color: "from-green-500/20 to-green-600/10" },
  { label: "Memory", category: "RAM", icon: MemoryStick, desc: "DDR4 & DDR5 RAM", color: "from-purple-500/20 to-purple-600/10" },
  { label: "SSDs", category: "SSD", icon: HardDrive, desc: "NVMe & SATA drives", color: "from-orange-500/20 to-orange-600/10" },
  { label: "CPU Coolers", category: "COOLER", icon: Fan, desc: "Air & liquid cooling", color: "from-cyan-500/20 to-cyan-600/10" },
  { label: "Cases", category: "CASE", icon: Package, desc: "ATX, mATX, ITX cases", color: "from-pink-500/20 to-pink-600/10" },
];

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface-800 to-surface-900 border-b border-surface-700">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.15)_0%,_transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Zap className="h-3.5 w-3.5" />
            Live price tracking across 6 major retailers
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-100 mb-4 tracking-tight">
            Never Overpay for
            <span className="text-brand-400"> PC Parts</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Track prices on CPUs, GPUs, RAM, and more across Amazon, Newegg, Best Buy, and other top retailers. Get alerted when prices drop.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/products" className="btn-primary px-6 py-3 text-base flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Browse All Products
            </Link>
            <Link href="/register" className="btn-secondary px-6 py-3 text-base flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Set Price Alerts
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-12">
            {[
              { value: "6", label: "Retailers" },
              { value: "20+", label: "Products" },
              { value: "Hourly", label: "Updates" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-brand-400">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-100">Browse by Category</h2>
          <Link href="/products" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.category}
              href={`/products?category=${cat.category}`}
              className={`bg-gradient-to-br ${cat.color} border border-surface-600 hover:border-brand-600/40 rounded-xl p-4 text-center transition-all duration-200 hover:scale-105`}
            >
              <cat.icon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="font-semibold text-gray-200 text-sm">{cat.label}</p>
              <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <h2 className="text-xl font-bold text-gray-100">Most Popular Products</h2>
          </div>
          <Link href="/products?sort=popular" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Features CTA */}
      <section className="bg-gradient-to-r from-brand-900/30 to-surface-800 border-t border-surface-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              {
                icon: TrendingDown,
                title: "Live Price Tracking",
                desc: "Prices updated every hour from 6 major retailers so you always have the latest data.",
                color: "text-green-400",
              },
              {
                icon: Bell,
                title: "Instant Price Alerts",
                desc: "Set your target price and get email notifications the moment a product drops below it.",
                color: "text-yellow-400",
              },
              {
                icon: Zap,
                title: "Price History",
                desc: "View 90-day price history charts to spot trends and know when it's the best time to buy.",
                color: "text-brand-400",
              },
            ].map((feat) => (
              <div key={feat.title} className="space-y-3">
                <div className={`inline-flex p-3 rounded-xl bg-surface-700 ${feat.color}`}>
                  <feat.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-200">{feat.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
