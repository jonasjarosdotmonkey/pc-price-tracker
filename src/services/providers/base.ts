import type { PriceProvider, ExternalProduct, ExternalPrice } from "@/types";

export abstract class BaseProvider implements PriceProvider {
  abstract name: string;
  abstract slug: string;
  enabled: boolean = true;

  abstract getProducts(): Promise<ExternalProduct[]>;
  abstract getPrice(productId: string): Promise<ExternalPrice | null>;

  protected async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeoutMs = 10000
  ): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      return res;
    } finally {
      clearTimeout(timer);
    }
  }

  protected log(message: string, level: "info" | "warn" | "error" = "info"): void {
    const prefix = `[${this.name}]`;
    if (level === "error") console.error(prefix, message);
    else if (level === "warn") console.warn(prefix, message);
    else console.log(prefix, message);
  }
}
