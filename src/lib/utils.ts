import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    CPU: "CPU",
    GPU: "Graphics Card",
    MOTHERBOARD: "Motherboard",
    RAM: "Memory",
    SSD: "SSD",
    HDD: "Hard Drive",
    PSU: "Power Supply",
    CASE: "Case",
    COOLER: "CPU Cooler",
    MONITOR: "Monitor",
    KEYBOARD: "Keyboard",
    MOUSE: "Mouse",
    HEADSET: "Headset",
  };
  return labels[category] ?? category;
}

export function categoryIcon(category: string): string {
  const icons: Record<string, string> = {
    CPU: "🖥️",
    GPU: "🎮",
    MOTHERBOARD: "🔌",
    RAM: "💾",
    SSD: "💿",
    HDD: "🗄️",
    PSU: "⚡",
    CASE: "📦",
    COOLER: "❄️",
    MONITOR: "🖥️",
    KEYBOARD: "⌨️",
    MOUSE: "🖱️",
    HEADSET: "🎧",
  };
  return icons[category] ?? "📦";
}

export function calculateSavings(currentPrice: number, originalPrice: number): number {
  return parseFloat((originalPrice - currentPrice).toFixed(2));
}

export function calculateSavingsPercent(currentPrice: number, originalPrice: number): number {
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

export function getLowestPrice(prices: Array<{ price: number; inStock: boolean }>): number | null {
  const inStockPrices = prices.filter((p) => p.inStock).map((p) => p.price);
  if (inStockPrices.length === 0) return null;
  return Math.min(...inStockPrices);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
