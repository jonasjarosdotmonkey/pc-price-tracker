import { BaseProvider } from "./base";
import type { ExternalProduct, ExternalPrice } from "@/types";

/**
 * Newegg provider stub. Newegg offers an affiliate API for approved partners.
 * For demo purposes, this returns empty results.
 * To enable: apply for Newegg Affiliate program and implement their API.
 * See: https://sell.newegg.com/affiliate
 */
export class NeweggProvider extends BaseProvider {
  name = "Newegg";
  slug = "newegg";

  constructor() {
    super();
    this.enabled = false; // Enable when API credentials are available
  }

  async getProducts(): Promise<ExternalProduct[]> {
    return [];
  }

  async getPrice(productId: string): Promise<ExternalPrice | null> {
    void productId;
    return null;
  }
}
