import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }], active: true },
      include: {
        prices: {
          include: { retailer: true },
          orderBy: { price: "asc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(product);
  } catch (err) {
    console.error("[GET /api/products/:id]", err);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
