import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withCache } from "@/lib/cache";

export async function GET() {
  try {
    const retailers = await withCache(
      "retailers",
      () => prisma.retailer.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
      300
    );
    return NextResponse.json(retailers);
  } catch {
    return NextResponse.json({ error: "Failed to fetch retailers" }, { status: 500 });
  }
}
