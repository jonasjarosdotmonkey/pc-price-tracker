"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { PriceHistoryPoint } from "@/types";
import { format } from "date-fns";

const PERIOD_OPTIONS = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "All", days: 365 },
];

const RETAILER_COLORS = [
  "#60a5fa", "#34d399", "#fb923c", "#f472b6", "#a78bfa", "#facc15",
];

interface PriceHistoryChartProps {
  productId: string;
}

interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

export function PriceHistoryChart({ productId }: PriceHistoryChartProps) {
  const [days, setDays] = useState(30);

  const { data: history, isLoading } = useQuery<PriceHistoryPoint[]>({
    queryKey: ["price-history", productId, days],
    queryFn: () =>
      fetch(`/api/products/${productId}/history?days=${days}`).then((r) => r.json()),
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  if (!history || history.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 bg-surface-700/30 rounded-xl border border-surface-600">
        No price history available
      </div>
    );
  }

  const retailers = [...new Set(history.map((h) => h.retailerName || "Unknown"))];
  const colorMap = Object.fromEntries(retailers.map((r, i) => [r, RETAILER_COLORS[i % RETAILER_COLORS.length]]));

  const grouped: Record<string, Record<string, number>> = {};
  history.forEach((point) => {
    const dateKey = format(new Date(point.recordedAt), "MMM d");
    if (!grouped[dateKey]) grouped[dateKey] = {};
    const retailer = point.retailerName || "Unknown";
    if (!grouped[dateKey][retailer] || point.price < grouped[dateKey][retailer]) {
      grouped[dateKey][retailer] = point.price;
    }
  });

  const chartData: ChartDataPoint[] = Object.entries(grouped).map(([date, prices]) => ({
    date,
    ...prices,
  }));

  const allPrices = history.map((h) => h.price);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const yDomain = [
    Math.floor(minPrice * 0.95),
    Math.ceil(maxPrice * 1.05),
  ];

  return (
    <div className="space-y-4">
      {/* Period selector */}
      <div className="flex items-center gap-2">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            onClick={() => setDays(opt.days)}
            className={cn(
              "px-3 py-1 rounded-lg text-sm font-medium transition-colors",
              days === opt.days
                ? "bg-brand-600 text-white"
                : "bg-surface-700 text-gray-400 hover:text-gray-200 hover:bg-surface-600"
            )}
          >
            {opt.label}
          </button>
        ))}
        <div className="ml-auto text-xs text-gray-500">
          {chartData.length} data points
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#252533" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={{ stroke: "#252533" }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={yDomain}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
              width={60}
            />
            <Tooltip
              contentStyle={{
                background: "#16161d",
                border: "1px solid #252533",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#e5e7eb",
              }}
              formatter={(value: number) => [formatCurrency(value), ""]}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }}
            />
            {retailers.map((retailer) => (
              <Line
                key={retailer}
                type="monotone"
                dataKey={retailer}
                stroke={colorMap[retailer]}
                dot={false}
                strokeWidth={2}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-700/50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">All-time Low</p>
          <p className="font-bold text-green-400 text-sm">{formatCurrency(minPrice)}</p>
        </div>
        <div className="bg-surface-700/50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">All-time High</p>
          <p className="font-bold text-red-400 text-sm">{formatCurrency(maxPrice)}</p>
        </div>
        <div className="bg-surface-700/50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Price Range</p>
          <p className="font-bold text-gray-200 text-sm">{formatCurrency(maxPrice - minPrice)}</p>
        </div>
      </div>
    </div>
  );
}
