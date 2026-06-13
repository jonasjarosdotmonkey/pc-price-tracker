import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withCache } from "@/lib/cache";

export async function GET() {
  try {
    const data = await withCache(
      "categories",
      async () => {
        const counts = await prisma.product.groupBy({
          by: ["category"],
          where: { active: true },
          _count: { id: true },
        });
        return counts.map((c) => ({ category: c.category, count: c._count.id }));
      },
      300
    );

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
