import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createPartnerSchema } from "@/schemas/partner.schema";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const country = searchParams.get("country");
  const search = searchParams.get("search");

  const where: any = {};
  if (type) where.type = type;
  if (country) where.country = country;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { contactPerson: { contains: search, mode: "insensitive" } },
      { taxCode: { contains: search, mode: "insensitive" } },
    ];
  }

  const partners = await prisma.partner.findMany({
    where,
    include: {
      _count: {
        select: { orderPartners: true, contractsBuyer: true, contractsSeller: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(partners);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createPartnerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const partner = await prisma.partner.create({ data: parsed.data });

  return NextResponse.json(partner, { status: 201 });
}
