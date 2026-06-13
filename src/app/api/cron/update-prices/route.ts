import { NextRequest, NextResponse } from "next/server";
import { runPriceUpdate } from "@/services/price-collector";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[Cron] Starting price update...");
    const result = await runPriceUpdate();
    console.log("[Cron] Price update complete:", result);

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Cron] Price update failed:", err);
    return NextResponse.json(
      { error: "Price update failed", message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
