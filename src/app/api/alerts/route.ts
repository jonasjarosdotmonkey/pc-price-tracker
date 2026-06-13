import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  productId: z.string().cuid(),
  targetPrice: z.number().positive(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    return NextResponse.json(alerts);
  } catch {
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const alert = await prisma.alert.upsert({
      where: { userId_productId: { userId: session.user.id, productId: parsed.data.productId } },
      update: { targetPrice: parsed.data.targetPrice, active: true, triggered: false },
      create: {
        userId: session.user.id,
        productId: parsed.data.productId,
        targetPrice: parsed.data.targetPrice,
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const alertId = searchParams.get("id");

  if (!alertId) {
    return NextResponse.json({ error: "Alert ID required" }, { status: 400 });
  }

  try {
    await prisma.alert.deleteMany({
      where: { id: alertId, userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete alert" }, { status: 500 });
  }
}
