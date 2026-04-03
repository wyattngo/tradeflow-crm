import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMaxStage, getMissingDocs } from "@/lib/pipeline";
import { alertQueue } from "@/lib/queue/jobs";
import { z } from "zod";

const advanceSchema = z.object({
  notes: z.string().optional(),
  force: z.boolean().optional().default(false),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = advanceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      documents: { select: { docType: true, status: true } },
    },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status !== "ACTIVE") {
    return NextResponse.json({ error: "Order is not active" }, { status: 400 });
  }

  const maxStage = getMaxStage(order.type);
  if (order.pipelineStage >= maxStage) {
    return NextResponse.json({ error: "Already at final stage" }, { status: 400 });
  }

  const approvedDocTypes = order.documents
    .filter((d: any) => d.status === "APPROVED")
    .map((d: any) => d.docType);

  const missingDocs = getMissingDocs(order.type, order.pipelineStage, approvedDocTypes);

  if (missingDocs.length > 0 && !parsed.data.force) {
    return NextResponse.json(
      { error: "Missing required documents", missingDocs },
      { status: 422 }
    );
  }

  if (missingDocs.length > 0 && parsed.data.force) {
    const role = (session.user as any).role;
    if (!["MANAGER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }
  }

  const newStage = order.pipelineStage + 1;
  const isCompleted = newStage > maxStage;

  const slaConfig = await prisma.sLAConfig.findUnique({
    where: { orderType_stage: { orderType: order.type, stage: newStage } },
  });

  const stageDeadline = slaConfig
    ? new Date(Date.now() + slaConfig.targetHours * 3600 * 1000)
    : null;

  const [updatedOrder] = await prisma.$transaction([
    prisma.order.update({
      where: { id: params.id },
      data: {
        pipelineStage: isCompleted ? maxStage : newStage,
        stageEnteredAt: new Date(),
        stageDeadline,
        status: isCompleted ? "COMPLETED" : "ACTIVE",
      },
    }),
    prisma.stageLog.create({
      data: {
        orderId: params.id,
        fromStage: order.pipelineStage,
        toStage: newStage,
        changedById: (session.user as any).id,
        notes: parsed.data.notes,
      },
    }),
  ]);

  try {
    await alertQueue.add("check-stage-alerts", {
      orderId: params.id,
      stage: newStage,
      type: order.type,
    });
  } catch (e) {
    console.error("Failed to queue alert check:", e);
  }

  return NextResponse.json(updatedOrder);
}
