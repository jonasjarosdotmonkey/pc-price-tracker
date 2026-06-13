import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Bell, BellOff, Trash2, TrendingDown, Package } from "lucide-react";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Price Alerts",
  description: "Manage your PC component price alerts.",
};

export default async function AlertsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const alerts = await prisma.alert.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          prices: { include: { retailer: true }, orderBy: { price: "asc" } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const active = alerts.filter((a) => a.active && !a.triggered);
  const triggered = alerts.filter((a) => a.triggered);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Bell className="h-6 w-6 text-brand-400" />
          Price Alerts
        </h1>
        <p className="text-gray-500 mt-1">You'll receive email notifications when prices drop to your targets.</p>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-16 bg-surface-800 border border-surface-700 rounded-xl">
          <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-400 mb-1">No price alerts yet</h3>
          <p className="text-sm text-gray-600 mb-4">Browse products and set alerts to be notified of price drops.</p>
          <Link href="/products" className="btn-primary inline-flex">Browse Products</Link>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section>
              <h2 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Bell className="h-4 w-4 text-yellow-400" />
                Active Alerts ({active.length})
              </h2>
              <div className="space-y-3">
                {active.map((alert) => {
                  const inStock = alert.product.prices.filter((p) => p.inStock);
                  const currentPrice = inStock.length > 0 ? Math.min(...inStock.map((p) => p.price)) : null;
                  const closeToTarget = currentPrice && currentPrice <= alert.targetPrice * 1.1;

                  return (
                    <div key={alert.id} className="bg-surface-800 border border-surface-700 rounded-xl p-4 flex items-center gap-4">
                      <Image
                        src={alert.product.image || `https://placehold.co/80x80/1e1e28/60a5fa?text=${encodeURIComponent(alert.product.name)}`}
                        alt={alert.product.name}
                        width={64}
                        height={64}
                        className="rounded-lg object-contain bg-surface-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${alert.product.slug}`} className="font-medium text-gray-200 hover:text-brand-400 transition-colors line-clamp-1">
                          {alert.product.name}
                        </Link>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-sm text-gray-500">
                            Target: <span className="text-yellow-400 font-medium">{formatCurrency(alert.targetPrice)}</span>
                          </span>
                          {currentPrice && (
                            <span className="text-sm text-gray-500">
                              Now: <span className={closeToTarget ? "text-orange-400 font-medium" : "text-gray-400"}>{formatCurrency(currentPrice)}</span>
                            </span>
                          )}
                          {closeToTarget && (
                            <span className="text-xs text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full">
                              Almost there!
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">Set {formatRelativeTime(alert.createdAt)}</p>
                      </div>
                      <form action={async () => {
                        "use server";
                        await prisma.alert.delete({ where: { id: alert.id } });
                      }}>
                        <button type="submit" className="p-2 text-gray-600 hover:text-red-400 hover:bg-surface-700 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {triggered.length > 0 && (
            <section>
              <h2 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-green-400" />
                Triggered Alerts ({triggered.length})
              </h2>
              <div className="space-y-3">
                {triggered.map((alert) => (
                  <div key={alert.id} className="bg-surface-800 border border-green-500/20 rounded-xl p-4 flex items-center gap-4 opacity-75">
                    <Image
                      src={alert.product.image || `https://placehold.co/80x80/1e1e28/60a5fa?text=${encodeURIComponent(alert.product.name)}`}
                      alt={alert.product.name}
                      width={64}
                      height={64}
                      className="rounded-lg object-contain bg-surface-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${alert.product.slug}`} className="font-medium text-gray-400 hover:text-brand-400 transition-colors line-clamp-1">
                        {alert.product.name}
                      </Link>
                      <p className="text-sm text-green-400 mt-0.5">
                        Triggered at {formatCurrency(alert.targetPrice)}
                        {alert.triggeredAt && ` · ${formatRelativeTime(alert.triggeredAt)}`}
                      </p>
                    </div>
                    <BellOff className="h-4 w-4 text-gray-600" />
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
