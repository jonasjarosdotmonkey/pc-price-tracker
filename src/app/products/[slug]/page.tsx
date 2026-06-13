import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { PriceComparison } from "@/components/products/price-comparison";
import { PriceHistoryChart } from "@/components/products/price-history-chart";
import { PriceAlertForm } from "@/components/products/price-alert-form";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatRelativeTime, categoryLabel, categoryIcon } from "@/lib/utils";
import { ArrowLeft, Package, RefreshCw, Eye } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  const product = await prisma.product.findFirst({
    where: { OR: [{ slug }, { id: slug }], active: true },
    include: {
      prices: { include: { retailer: true }, orderBy: { price: "asc" } },
    },
  });
  return product;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };

  const inStock = product.prices.filter((p) => p.inStock);
  const lowestPrice = inStock.length > 0 ? Math.min(...inStock.map((p) => p.price)) : null;

  return {
    title: product.name,
    description: `${product.description || product.name}. ${lowestPrice ? `Current lowest price: ${formatCurrency(lowestPrice)}.` : ""}`,
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      images: product.image ? [product.image] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const [product, session] = await Promise.all([
    getProduct(slug),
    auth(),
  ]);

  if (!product) notFound();

  await prisma.product.update({
    where: { id: product.id },
    data: { viewCount: { increment: 1 } },
  });

  const inStockPrices = product.prices.filter((p) => p.inStock);
  const lowestPrice = inStockPrices.length > 0 ? Math.min(...inStockPrices.map((p) => p.price)) : null;
  const specs = product.specs as Record<string, unknown> | null;
  const lastUpdated = product.prices[0]?.lastChecked;

  let userAlert = null;
  if (session?.user?.id) {
    userAlert = await prisma.alert.findUnique({
      where: { userId_productId: { userId: session.user.id, productId: product.id } },
      select: { targetPrice: true, active: true },
    });
  }

  const relatedProducts = await prisma.product.findMany({
    where: { category: product.category, id: { not: product.id }, active: true },
    include: { prices: { include: { retailer: true }, orderBy: { price: "asc" } } },
    take: 4,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/products" className="hover:text-gray-300 flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Products
        </Link>
        <span>/</span>
        <Link href={`/products?category=${product.category}`} className="hover:text-gray-300">
          {categoryLabel(product.category)}
        </Link>
        <span>/</span>
        <span className="text-gray-400 truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="bg-surface-800 border border-surface-700 rounded-xl p-8 flex items-center justify-center">
          <Image
            src={product.image || `https://placehold.co/500x400/1e1e28/60a5fa?text=${encodeURIComponent(product.name)}`}
            alt={product.name}
            width={400}
            height={320}
            className="object-contain max-h-80"
          />
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="blue">{categoryIcon(product.category)} {categoryLabel(product.category)}</Badge>
              <Badge variant="gray">{product.brand}</Badge>
              {inStockPrices.length > 0 ? (
                <Badge variant="green">In Stock</Badge>
              ) : (
                <Badge variant="red">Out of Stock</Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-100 leading-tight">{product.name}</h1>
            {product.description && (
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">{product.description}</p>
            )}
          </div>

          {lowestPrice && (
            <div className="bg-surface-700/50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Lowest Price Available</p>
              <p className="text-4xl font-bold text-green-400 price-tag">{formatCurrency(lowestPrice)}</p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Updated {lastUpdated ? formatRelativeTime(lastUpdated) : "recently"}
                <Eye className="h-3 w-3 ml-2" />
                {product.viewCount.toLocaleString()} views
              </p>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {lowestPrice && (
              <a
                href={inStockPrices[0]?.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Buy at {inStockPrices[0]?.retailer.name}
              </a>
            )}
            <PriceAlertForm
              productId={product.id}
              productName={product.name}
              currentPrice={lowestPrice}
              existingAlert={userAlert}
            />
          </div>

          {/* Specs */}
          {specs && Object.keys(specs).length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-300 mb-3 text-sm">Specifications</h3>
              <div className="bg-surface-700/30 rounded-xl border border-surface-600 overflow-hidden">
                {Object.entries(specs).map(([key, value], i) => (
                  <div
                    key={key}
                    className={`flex justify-between py-2.5 px-4 text-sm ${
                      i % 2 === 0 ? "bg-surface-700/20" : ""
                    }`}
                  >
                    <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                    <span className="text-gray-200 font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Price comparison */}
      <div className="bg-surface-800 border border-surface-700 rounded-xl p-6">
        <h2 className="font-semibold text-gray-200 mb-4">Price Comparison</h2>
        <PriceComparison prices={product.prices} />
      </div>

      {/* Price history chart */}
      <div className="bg-surface-800 border border-surface-700 rounded-xl p-6">
        <h2 className="font-semibold text-gray-200 mb-4">Price History</h2>
        <PriceHistoryChart productId={product.id} />
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-200 mb-4">Similar {categoryLabel(product.category)}s</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => {
              const inStock = p.prices.filter((pr) => pr.inStock);
              const lowest = inStock.length > 0 ? Math.min(...inStock.map((pr) => pr.price)) : null;
              return (
                <Link key={p.id} href={`/products/${p.slug}`} className="group bg-surface-800 border border-surface-700 hover:border-brand-600/40 rounded-xl p-4 transition-all">
                  <Image
                    src={p.image || `https://placehold.co/200x150/1e1e28/60a5fa?text=${encodeURIComponent(p.name)}`}
                    alt={p.name}
                    width={200}
                    height={130}
                    className="w-full object-contain h-24 mb-3"
                  />
                  <p className="text-xs text-gray-500">{p.brand}</p>
                  <p className="text-sm font-medium text-gray-200 group-hover:text-brand-400 transition-colors line-clamp-2">{p.name}</p>
                  {lowest && <p className="text-brand-400 font-bold mt-2 text-sm">{formatCurrency(lowest)}</p>}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
