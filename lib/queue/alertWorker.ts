import { Worker } from "bullmq";
import { prisma } from "../prisma";
import { redis } from "../redis";
import { getMissingDocs } from "../pipeline";

export function createAlertWorker() {
  const worker = new Worker(
    "alerts",
    async (job) => {
      if (job.name === "check-stage-alerts") {
        const { orderId, stage, type } = job.data;

        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            documents: { select: { docType: true, status: true } },
          },
        });
        if (!order) return;

        const approvedDocs = order.documents
          .filter((d: any) => d.status === "APPROVED")
          .map((d: any) => d.docType);

        const missingDocs = getMissingDocs(type, stage, approvedDocs);
        if (missingDocs.length > 0) {
          await prisma.alert.create({
            data: {
              orderId,
              alertType: "DOCUMENT_MISSING",
              severity: "WARNING",
              message: `Đơn ${order.orderCode}: Thiếu ${missingDocs.length} chứng từ bắt buộc ở bước ${stage}`,
            },
          });
        }
      }

      if (job.name === "check-overdue-stages") {
        const overdueOrders = await prisma.order.findMany({
          where: {
            status: "ACTIVE",
            stageDeadline: { lt: new Date() },
          },
          select: { id: true, orderCode: true, pipelineStage: true },
        });

        for (const order of overdueOrders) {
          const existing = await prisma.alert.findFirst({
            where: {
              orderId: order.id,
              alertType: "STAGE_OVERDUE",
              isRead: false,
            },
          });
          if (!existing) {
            await prisma.alert.create({
              data: {
                orderId: order.id,
                alertType: "STAGE_OVERDUE",
                severity: "CRITICAL",
                message: `Đơn ${order.orderCode} quá hạn tại bước ${order.pipelineStage}`,
              },
            });
          }
        }
      }

      if (job.name === "check-document-expiry") {
        const thresholds = [7, 3, 1];
        for (const days of thresholds) {
          const target = new Date();
          target.setDate(target.getDate() + days);

          const docs = await prisma.document.findMany({
            where: {
              expiryDate: {
                gte: new Date(),
                lte: target,
              },
              status: "APPROVED",
            },
            include: { order: { select: { orderCode: true } } },
          });

          for (const doc of docs) {
            await prisma.alert.create({
              data: {
                orderId: doc.orderId,
                alertType: "INSPECTION_EXPIRY",
                severity: days <= 1 ? "CRITICAL" : "WARNING",
                message: `Chứng từ ${doc.docType} của đơn ${doc.order.orderCode} sẽ hết hạn trong ${days} ngày`,
              },
            });
          }
        }
      }
    },
    { connection: redis }
  );

  return worker;
}
