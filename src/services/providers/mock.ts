import { BaseProvider } from "./base";
import type { ExternalProduct, ExternalPrice } from "@/types";
import { Category } from "@prisma/client";

/**
 * Mock provider for development/demo. Returns simulated price data
 * with realistic variance to demonstrate the price tracking system.
 * Replace with real providers (Amazon PA-API, etc.) in production.
 */
export class MockProvider extends BaseProvider {
  name = "Mock Provider";
  slug = "mock";

  private mockProducts: ExternalProduct[] = [
    {
      externalId: "mock-cpu-001",
      name: "AMD Ryzen 9 9950X",
      brand: "AMD",
      model: "Ryzen 9 9950X",
      category: Category.CPU,
      url: "https://example.com/product/ryzen-9-9950x",
      specs: { cores: 16, threads: 32 },
    },
    {
      externalId: "mock-gpu-001",
      name: "NVIDIA GeForce RTX 5090",
      brand: "NVIDIA",
      model: "RTX 5090",
      category: Category.GPU,
      url: "https://example.com/product/rtx-5090",
      specs: { vram: "32GB" },
    },
  ];

  private basePrices: Record<string, number> = {
    "mock-cpu-001": 649.99,
    "mock-gpu-001": 1999.99,
  };

  async getProducts(): Promise<ExternalProduct[]> {
    await new Promise((r) => setTimeout(r, 100));
    return this.mockProducts;
  }

  async getPrice(productId: string): Promise<ExternalPrice | null> {
    const base = this.basePrices[productId];
    if (!base) return null;

    await new Promise((r) => setTimeout(r, 50));

    const variance = (Math.random() - 0.5) * 0.1;
    const price = parseFloat((base * (1 + variance)).toFixed(2));

    return {
      externalId: productId,
      price,
      originalPrice: Math.random() > 0.7 ? parseFloat((price * 1.1).toFixed(2)) : undefined,
      url: `https://example.com/product/${productId}`,
      inStock: Math.random() > 0.1,
      shipping: Math.random() > 0.6 ? 0 : parseFloat((Math.random() * 15).toFixed(2)),
    };
  }
}
