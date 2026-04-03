import { prisma } from "./prisma";

type DocType = string;

export const EXPORT_STAGES: Record<number, string> = {
  1: "Ký hợp đồng",
  2: "Chuẩn bị hàng",
  3: "Khai hải quan VN",
  4: "Kiểm dịch / Kiểm tra chất lượng",
  5: "Vận chuyển lên cửa khẩu",
  6: "Hải quan VN thông quan",
  7: "Xe qua cửa khẩu",
  8: "Hải quan Trung Quốc nhập khẩu",
  9: "Giao hàng cho buyer",
  10: "Thanh toán",
};

export const IMPORT_STAGES: Record<number, string> = {
  1: "Ký hợp đồng mua",
  2: "Supplier giao hàng",
  3: "Vận chuyển đến cửa khẩu / cảng",
  4: "Khai hải quan VN",
  5: "Nộp thuế nhập khẩu + VAT",
  6: "Kiểm tra chuyên ngành",
  7: "Thông quan",
  8: "Giao hàng về kho",
  9: "Thanh toán",
};

export const REQUIRED_DOCS: Record<string, DocType[]> = {
  EXPORT_3: ["INVOICE", "PACKING_LIST"],
  EXPORT_4: ["QUARANTINE_CERT", "QUALITY_CERT"],
  EXPORT_6: ["CUSTOMS_DECLARATION", "CERTIFICATE_OF_ORIGIN"],
  EXPORT_8: ["BL_AWB"],
  EXPORT_10: ["PAYMENT_CONFIRMATION"],
  IMPORT_4: ["INVOICE", "PACKING_LIST", "BL_AWB"],
  IMPORT_5: ["TAX_PAYMENT_RECEIPT"],
  IMPORT_6: ["SPECIALIZED_INSPECTION"],
  IMPORT_7: ["CUSTOMS_DECLARATION"],
  IMPORT_9: ["PAYMENT_CONFIRMATION"],
};

export function getStageLabel(
  type: "EXPORT" | "IMPORT",
  stage: number
): string {
  const map = type === "EXPORT" ? EXPORT_STAGES : IMPORT_STAGES;
  return map[stage] ?? `Stage ${stage}`;
}

export function getMaxStage(type: "EXPORT" | "IMPORT"): number {
  return type === "EXPORT" ? 10 : 9;
}

export function getMissingDocs(
  type: "EXPORT" | "IMPORT",
  stage: number,
  existingDocs: DocType[]
): DocType[] {
  const key = `${type}_${stage}`;
  const required = REQUIRED_DOCS[key] ?? [];
  return required.filter((doc) => !existingDocs.includes(doc));
}

export function canAdvanceStage(
  type: "EXPORT" | "IMPORT",
  currentStage: number,
  existingDocs: DocType[]
): { allowed: boolean; missingDocs: DocType[] } {
  const missing = getMissingDocs(type, currentStage, existingDocs);
  return {
    allowed: missing.length === 0,
    missingDocs: missing,
  };
}

export async function generateOrderCode(type: "EXPORT" | "IMPORT"): Promise<string> {
  const prefix = type === "EXPORT" ? "EXP" : "IMP";
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, "0");

  const count = await prisma.order.count({
    where: {
      type,
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
  });

  const seq = (count + 1).toString().padStart(4, "0");
  return `${prefix}-${year}${month}-${seq}`;
}
