import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const createRateSchema = z.object({
  currency: z.enum(["USD", "CNY", "VND"]),
  rateToVnd: z.number().positive(),
  date: z.string(),
  source: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rates = await prisma.exchangeRate.findMany({
    orderBy: [{ date: "desc" }, { currency: "asc" }],
    take: 50,
  });

  return NextResponse.json(rates);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createRateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data } = parsed;
  const rate = await prisma.exchangeRate.upsert({
    where: {
      currency_date: {
        currency: data.currency,
        date: new Date(data.date),
      },
    },
    update: { rateToVnd: data.rateToVnd, source: data.source },
    create: {
      currency: data.currency,
      rateToVnd: data.rateToVnd,
      date: new Date(data.date),
      source: data.source,
    },
  });

  return NextResponse.json(rate);
}
