import { prisma } from "@/lib/db";
import { withRetry, sleep } from "@/lib/rate-limiter";
import type { PriceProvider } from "@/types";

const RATE_LIMIT_DELAY_MS = 500;

export class PriceCollector {
  private providers: PriceProvider[];

  constructor(providers: PriceProvider[]) {
    this.providers = providers.filter((p) => p.enabled);
  }

  async updateAllPrices(): Promise<{ updated: number; failed: number }> {
    let updated = 0;
    let failed = 0;

    const products = await prisma.product.findMany({
      where: { active: true },
      include: { prices: { include: { retailer: true } } },
    });

    for (const provider of this.providers) {
      const retailer = await prisma.retailer.findUnique({
        where: { slug: provider.slug },
      });

      if (!retailer) {
        console.warn(`[PriceCollector] Retailer not found for provider: ${provider.slug}`);
        continue;
      }

      for (const product of products) {
        const start = Date.now();
        try {
          const externalPrice = await withRetry(() => provider.getPrice(product.id), 3, 1000);

          if (!externalPrice) {
            await sleep(RATE_LIMIT_DELAY_MS);
            continue;
          }

          await prisma.price.upsert({
            where: { productId_retailerId: { productId: product.id, retailerId: retailer.id } },
            update: {
              price: externalPrice.price,
              originalPrice: externalPrice.originalPrice,
              url: externalPrice.url,
              inStock: externalPrice.inStock,
              shipping: externalPrice.shipping,
              lastChecked: new Date(),
            },
            create: {
              productId: product.id,
              retailerId: retailer.id,
              price: externalPrice.price,
              originalPrice: externalPrice.originalPrice,
              url: externalPrice.url,
              inStock: externalPrice.inStock,
              shipping: externalPrice.shipping,
            },
          });

          await prisma.priceHistory.create({
            data: {
              productId: product.id,
              retailerId: retailer.id,
              price: externalPrice.price,
              inStock: externalPrice.inStock,
            },
          });

          await this.checkAlerts(product.id, externalPrice.price);

          await prisma.fetchLog.create({
            data: {
              retailer: provider.name,
              product: product.name,
              status: "success",
              duration: Date.now() - start,
            },
          });

          updated++;
        } catch (err) {
          failed++;
          await prisma.fetchLog.create({
            data: {
              retailer: provider.name,
              product: product.name,
              status: "error",
              error: err instanceof Error ? err.message : String(err),
              duration: Date.now() - start,
            },
          });
          console.error(`[PriceCollector] Failed for ${provider.name}/${product.name}:`, err);
        }

        await sleep(RATE_LIMIT_DELAY_MS);
      }
    }

    console.log(`[PriceCollector] Done: ${updated} updated, ${failed} failed`);
    return { updated, failed };
  }

  private async checkAlerts(productId: string, currentPrice: number): Promise<void> {
    const triggerable = await prisma.alert.findMany({
      where: {
        productId,
        active: true,
        triggered: false,
        targetPrice: { gte: currentPrice },
      },
      include: {
        user: true,
        product: true,
      },
    });

    for (const alert of triggerable) {
      await prisma.alert.update({
        where: { id: alert.id },
        data: { triggered: true, triggeredAt: new Date() },
      });

      if (alert.user.email) {
        try {
          const { sendPriceAlertEmail } = await import("@/lib/email");
          await sendPriceAlertEmail({
            to: alert.user.email,
            userName: alert.user.name || "there",
            productName: alert.product.name,
            currentPrice,
            targetPrice: alert.targetPrice,
            retailerName: "Multiple Retailers",
            productUrl: `${process.env.NEXTAUTH_URL}/products/${alert.product.slug}`,
            productSlug: alert.product.slug,
          });
        } catch (err) {
          console.error("[PriceCollector] Failed to send alert email:", err);
        }
      }
    }
  }
}

export async function runPriceUpdate() {
  const { MockProvider } = await import("./providers/mock");
  const { AmazonProvider } = await import("./providers/amazon");
  const { NeweggProvider } = await import("./providers/newegg");

  const collector = new PriceCollector([
    new MockProvider(),
    new AmazonProvider(),
    new NeweggProvider(),
  ]);

  return collector.updateAllPrices();
}
