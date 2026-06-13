import { BaseProvider } from "./base";
import type { ExternalProduct, ExternalPrice } from "@/types";

/**
 * Amazon provider stub. To enable real Amazon data:
 * 1. Sign up for Amazon Product Advertising API
 * 2. Add credentials to .env: AMAZON_PRODUCT_API_KEY, AMAZON_PRODUCT_API_SECRET, AMAZON_ASSOCIATE_TAG
 * 3. Install: npm install amazon-paapi
 * 4. Implement getProducts() and getPrice() using the PA-API SearchItems and GetItems operations
 * See: https://webservices.amazon.com/paapi5/documentation/
 */
export class AmazonProvider extends BaseProvider {
  name = "Amazon";
  slug = "amazon";

  constructor() {
    super();
    this.enabled = !!(
      process.env.AMAZON_PRODUCT_API_KEY &&
      process.env.AMAZON_PRODUCT_API_SECRET &&
      process.env.AMAZON_ASSOCIATE_TAG
    );
  }

  async getProducts(): Promise<ExternalProduct[]> {
    if (!this.enabled) {
      this.log("Amazon PA-API credentials not configured", "warn");
      return [];
    }
    // TODO: Implement using amazon-paapi SearchItems
    // const results = await searchItems({ Keywords: "PC Components", SearchIndex: "Electronics" });
    return [];
  }

  async getPrice(productId: string): Promise<ExternalPrice | null> {
    if (!this.enabled) return null;
    // TODO: Implement using amazon-paapi GetItems with ASIN
    void productId;
    return null;
  }
}
