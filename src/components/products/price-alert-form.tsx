"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Bell, BellOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface PriceAlertFormProps {
  productId: string;
  productName: string;
  currentPrice: number | null;
  existingAlert?: { targetPrice: number; active: boolean } | null;
}

export function PriceAlertForm({
  productId,
  productName,
  currentPrice,
  existingAlert,
}: PriceAlertFormProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState(
    existingAlert?.targetPrice?.toString() || (currentPrice ? (currentPrice * 0.9).toFixed(2) : "")
  );
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      setError("Please enter a valid price");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, targetPrice: price }),
      });

      if (!res.ok) throw new Error("Failed to save alert");

      setSaved(true);
      setTimeout(() => {
        setOpen(false);
        setSaved(false);
      }, 1500);
    } catch {
      setError("Failed to save alert. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!session) {
    return (
      <Link href="/login" className="flex items-center gap-2 bg-surface-700 hover:bg-surface-600 text-gray-400 hover:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
        <Bell className="h-4 w-4" />
        Set Price Alert
      </Link>
    );
  }

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setOpen(true)}
        className={existingAlert?.active ? "text-yellow-400 border-yellow-500/30" : ""}
      >
        {existingAlert?.active ? (
          <>
            <BellOff className="h-4 w-4" />
            Alert: {formatCurrency(existingAlert.targetPrice)}
          </>
        ) : (
          <>
            <Bell className="h-4 w-4" />
            Set Price Alert
          </>
        )}
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Set Price Alert">
        {saved ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="h-6 w-6 text-green-400" />
            </div>
            <p className="font-semibold text-gray-200">Alert saved!</p>
            <p className="text-sm text-gray-500 mt-1">We'll email you when the price drops</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">{productName}</p>
              {currentPrice && (
                <p className="text-sm text-gray-500">
                  Current lowest price:{" "}
                  <span className="text-green-400 font-medium">{formatCurrency(currentPrice)}</span>
                </p>
              )}
            </div>

            <Input
              label="Alert me when price drops to"
              type="number"
              step="0.01"
              min="0.01"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="e.g. 299.99"
              error={error}
              icon={<span className="text-gray-400 text-sm">$</span>}
            />

            <p className="text-xs text-gray-500">
              You'll receive an email notification when this product reaches your target price.
            </p>

            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" loading={loading} className="flex-1">
                <Bell className="h-4 w-4" />
                Save Alert
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
