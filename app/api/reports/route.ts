import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const reportType = searchParams.get("type") ?? "overview";

  if (reportType === "overview") {
    const [
      totalOrders,
      activeOrders,
      completedOrders,
      exportOrders,
      importOrders,
      totalPartners,
      unreadAlerts,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "ACTIVE" } }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.order.count({ where: { type: "EXPORT" } }),
      prisma.order.count({ where: { type: "IMPORT" } }),
      prisma.partner.count(),
      prisma.alert.count({ where: { isRead: false } }),
    ]);

    return NextResponse.json({
      totalOrders,
      activeOrders,
      completedOrders,
      exportOrders,
      importOrders,
      totalPartners,
      unreadAlerts,
    });
  }

  if (reportType === "pipeline") {
    const exportPipeline = await prisma.order.groupBy({
      by: ["pipelineStage"],
      where: { type: "EXPORT", status: "ACTIVE" },
      _count: true,
    });

    const importPipeline = await prisma.order.groupBy({
      by: ["pipelineStage"],
      where: { type: "IMPORT", status: "ACTIVE" },
      _count: true,
    });

    return NextResponse.json({ exportPipeline, importPipeline });
  }

  if (reportType === "financial-summary") {
    const financials = await prisma.financial.groupBy({
      by: ["type", "currency"],
      _sum: { amount: true, amountVnd: true },
      _count: true,
    });

    return NextResponse.json({ financials });
  }

  if (reportType === "stage-timing") {
    const stageLogs = await prisma.stageLog.findMany({
      include: {
        order: { select: { type: true, orderCode: true } },
      },
      orderBy: { changedAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ stageLogs });
  }

  return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
}
