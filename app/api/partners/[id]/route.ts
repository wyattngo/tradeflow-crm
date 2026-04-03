import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updatePartnerSchema } from "@/schemas/partner.schema";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const partner = await prisma.partner.findUnique({
    where: { id: params.id },
    include: {
      orderPartners: {
        include: {
          order: { select: { id: true, orderCode: true, type: true, status: true, pipelineStage: true } },
        },
        orderBy: { order: { createdAt: "desc" } },
      },
      contractsBuyer: { orderBy: { createdAt: "desc" } },
      contractsSeller: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!partner) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(partner);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updatePartnerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const partner = await prisma.partner.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json(partner);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  if (!["ADMIN", "MANAGER"].includes(role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  await prisma.partner.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
