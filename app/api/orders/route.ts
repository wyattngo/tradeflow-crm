import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createOrderSchema, orderFilterSchema } from "@/schemas/order.schema";
import { generateOrderCode } from "@/lib/pipeline";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const params = Object.fromEntries(searchParams.entries());
  const parsed = orderFilterSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { type, status, stage, search, page, limit } = parsed.data;

  const where: any = {};
  if (type) where.type = type;
  if (status) where.status = status;
  if (stage) where.pipelineStage = stage;
  if (search) {
    where.OR = [
      { orderCode: { contains: search, mode: "insensitive" } },
      { productDescription: { contains: search, mode: "insensitive" } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        contract: { include: { buyer: true, seller: true } },
        partners: { include: { partner: true } },
        alerts: { where: { isRead: false } },
        _count: { select: { documents: true, financials: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({ orders, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data } = parsed;
  const orderCode = await generateOrderCode(data.type);

  const order = await prisma.order.create({
    data: {
      ...data,
      orderCode,
      createdById: (session.user as any).id,
      pipelineStage: 1,
      stageEnteredAt: new Date(),
    },
  });

  return NextResponse.json(order, { status: 201 });
}
