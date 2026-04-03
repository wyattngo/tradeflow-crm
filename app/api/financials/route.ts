import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createFinancialSchema } from "@/schemas/financial.schema";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  const type = searchParams.get("type");

  const where: any = {};
  if (orderId) where.orderId = orderId;
  if (type) where.type = type;

  const financials = await prisma.financial.findMany({
    where,
    include: {
      order: { select: { orderCode: true, type: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(financials);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createFinancialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data } = parsed;

  // Auto-calculate VND amount if exchange rate provided
  let amountVnd = data.amountVnd;
  if (!amountVnd && data.exchangeRate) {
    amountVnd = data.amount * data.exchangeRate;
  }
  if (!amountVnd && data.currency === "VND") {
    amountVnd = data.amount;
  }

  const financial = await prisma.financial.create({
    data: {
      ...data,
      amountVnd,
      paidAt: data.paidAt ? new Date(data.paidAt) : undefined,
    },
  });

  return NextResponse.json(financial, { status: 201 });
}
