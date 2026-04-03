"use client";

import { REQUIRED_DOCS } from "@/lib/pipeline";

interface Props {
  orderType: "EXPORT" | "IMPORT";
  stage: number;
  documents: any[];
}

const docTypeLabels: Record<string, string> = {
  INVOICE: "Hoá đơn thương mại",
  PACKING_LIST: "Phiếu đóng gói",
  CERTIFICATE_OF_ORIGIN: "C/O - Giấy chứng nhận xuất xứ",
  CUSTOMS_DECLARATION: "Tờ khai hải quan",
  QUARANTINE_CERT: "Giấy kiểm dịch",
  BL_AWB: "Vận đơn (B/L, AWB)",
  QUALITY_CERT: "Giấy kiểm tra chất lượng",
  TAX_PAYMENT_RECEIPT: "Biên lai nộp thuế",
  SPECIALIZED_INSPECTION: "Giấy kiểm tra chuyên ngành",
  PHYTOSANITARY_CERT: "Giấy kiểm dịch thực vật",
  FUMIGATION_CERT: "Giấy hun trùng",
  PAYMENT_CONFIRMATION: "Xác nhận thanh toán",
  OTHER: "Khác",
};

export function DocumentChecklist({ orderType, stage, documents }: Props) {
  const key = `${orderType}_${stage}`;
  const required = REQUIRED_DOCS[key] ?? [];

  if (required.length === 0) {
    return (
      <p className="text-xs text-zinc-500">
        Không yêu cầu chứng từ bắt buộc ở bước này
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-500 mb-2">
        Chứng từ bắt buộc — Bước {stage}
      </p>
      {required.map((docType) => {
        const doc = documents.find(
          (d: any) => d.docType === docType && d.status === "APPROVED"
        );
        const pending = documents.find(
          (d: any) =>
            d.docType === docType && ["PENDING", "SUBMITTED"].includes(d.status)
        );

        return (
          <div
            key={docType}
            className="flex items-center gap-2 text-sm"
          >
            {doc ? (
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                ✓
              </span>
            ) : pending ? (
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">
                ⏳
              </span>
            ) : (
              <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs">
                ✗
              </span>
            )}
            <span
              className={
                doc
                  ? "text-zinc-300"
                  : pending
                  ? "text-amber-400"
                  : "text-red-400"
              }
            >
              {docTypeLabels[docType] ?? docType}
            </span>
          </div>
        );
      })}
    </div>
  );
}
