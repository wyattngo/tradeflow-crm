import { AlertSeverity, AlertType } from "@prisma/client";
import { prisma } from "./prisma";

export async function createAlert(params: {
  orderId?: string;
  alertType: AlertType;
  severity?: AlertSeverity;
  message: string;
}) {
  return prisma.alert.create({
    data: {
      orderId: params.orderId,
      alertType: params.alertType,
      severity: params.severity ?? "WARNING",
      message: params.message,
    },
  });
}

export async function getUnreadAlerts(limit = 20) {
  return prisma.alert.findMany({
    where: { isRead: false },
    include: {
      order: { select: { orderCode: true, type: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function markAlertRead(id: string) {
  return prisma.alert.update({
    where: { id },
    data: { isRead: true },
  });
}

export async function markAllAlertsRead() {
  return prisma.alert.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  });
}
