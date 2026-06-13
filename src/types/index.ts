import type { Category } from "@prisma/client";

export type { Category };

export interface ProductWithPrices {
  id: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  category: Category;
  description: string | null;
  image: string | null;
  specs: Record<string, unknown> | null;
  viewCount: number;
  createdAt: Date;
  prices: PriceWithRetailer[];
  lowestPrice: number | null;
  lowestRetailer: string | null;
  isFavorited?: boolean;
  hasAlert?: boolean;
}

export interface PriceWithRetailer {
  id: string;
  price: number;
  originalPrice: number | null;
  url: string;
  inStock: boolean;
  shipping: number | null;
  lastChecked: Date;
  retailer: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    website: string;
  };
}

export interface PriceHistoryPoint {
  price: number;
  retailerId: string;
  retailerName?: string;
  recordedAt: string;
}

export interface ProductFilters {
  category?: Category;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  sort?: "price_asc" | "price_desc" | "newest" | "popular" | "value";
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminStats {
  totalProducts: number;
  totalRetailers: number;
  priceUpdatesToday: number;
  failedFetchesToday: number;
  mostViewedProducts: Array<{ id: string; name: string; viewCount: number; image: string | null }>;
  mostWatchedProducts: Array<{ id: string; name: string; alertCount: number; image: string | null }>;
  recentActivity: Array<{ retailer: string; status: string; product?: string; createdAt: Date }>;
  categoryBreakdown: Array<{ category: Category; count: number }>;
}

export interface PriceProvider {
  name: string;
  slug: string;
  enabled: boolean;
  getProducts(): Promise<ExternalProduct[]>;
  getPrice(productId: string): Promise<ExternalPrice | null>;
}

export interface ExternalProduct {
  externalId: string;
  name: string;
  brand: string;
  model: string;
  category: Category;
  image?: string;
  url: string;
  specs?: Record<string, unknown>;
}

export interface ExternalPrice {
  externalId: string;
  price: number;
  originalPrice?: number;
  url: string;
  inStock: boolean;
  shipping?: number;
}

export interface AlertWithProduct {
  id: string;
  targetPrice: number;
  active: boolean;
  triggered: boolean;
  triggeredAt: Date | null;
  createdAt: Date;
  product: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    prices: PriceWithRetailer[];
  };
}

export interface BuildItem {
  category: Category;
  product?: ProductWithPrices;
  quantity?: number;
}

export interface PCBuild {
  id: string;
  name: string;
  items: BuildItem[];
  totalPrice: number;
  createdAt: Date;
}
