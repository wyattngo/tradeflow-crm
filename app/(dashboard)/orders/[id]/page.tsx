"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { StageProgress } from "@/components/orders/StageProgress";
import { DocumentChecklist } from "@/components/orders/DocumentChecklist";
import { StageAdvanceModal } from "@/components/orders/StageAdvanceModal";
import { FileUpload } from "@/components/shared/FileUpload";
import { getStageLabel } from "@/lib/pipeline";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAdvance, setShowAdvance] = useState(false);
  const [activeTab, setActiveTab] = useState<"docs" | "financials" | "history">("docs");

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      if (res.ok) {
        setOrder(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500">Đang tải...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Không tìm thấy đơn hàng</p>
        <Link href="/orders" className="text-[#ffbf00] text-sm hover:underline mt-2 inline-block">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    ON_HOLD: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    COMPLETED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const docStatusColors: Record<string, string> = {
    PENDING: "text-zinc-400",
    SUBMITTED: "text-blue-400",
    APPROVED: "text-emerald-400",
    REJECTED: "text-red-400",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/orders" className="text-zinc-500 hover:text-zinc-300 text-sm">
              ← Đơn hàng
            </Link>
          </div>
          <h1 className="text-xl font-semibold text-[#ffbf00]">
            {order.orderCode}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            {order.type === "EXPORT" ? "Xuất khẩu" : "Nhập khẩu"} —{" "}
            {order.productDescription}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-xs rounded-full border ${statusColors[order.status]}`}>
            {order.status}
          </span>
          {order.status === "ACTIVE" && (
            <button
              onClick={() => setShowAdvance(true)}
              className="px-4 py-2 bg-[#ffbf00] text-black text-sm font-medium rounded-lg hover:bg-[#cc9900] transition-colors"
            >
              Chuyển bước
            </button>
          )}
        </div>
      </div>

      {/* Stage Progress */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
        <StageProgress
          type={order.type}
          currentStage={order.pipelineStage}
          stageDeadline={order.stageDeadline}
        />
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-3">Thông tin đơn</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Mã HS</span>
              <span className="text-zinc-300">{order.hsCode ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Số lượng</span>
              <span className="text-zinc-300">
                {order.quantity ? `${order.quantity} ${order.unit ?? ""}` : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Giá trị</span>
              <span className="text-zinc-300">
                {order.totalValue
                  ? formatCurrency(Number(order.totalValue), order.currency)
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Incoterms</span>
              <span className="text-zinc-300">{order.incoterms ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Cửa khẩu</span>
              <span className="text-zinc-300">{order.borderGate ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Vận chuyển</span>
              <span className="text-zinc-300">{order.transportMode ?? "—"}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-3">Đối tác</p>
          {order.partners?.length > 0 ? (
            <div className="space-y-2">
              {order.partners.map((op: any) => (
                <div key={op.id} className="flex justify-between text-sm">
                  <span className="text-zinc-500">{op.role}</span>
                  <Link
                    href={`/partners/${op.partnerId}`}
                    className="text-[#ffbf00] hover:underline"
                  >
                    {op.partner.name}
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-600">Chưa có đối tác</p>
          )}
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-3">Chứng từ bắt buộc</p>
          <DocumentChecklist
            orderType={order.type}
            stage={order.pipelineStage}
            documents={order.documents ?? []}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#2a2a2a]">
        {(
          [
            { key: "docs", label: `Chứng từ (${order.documents?.length ?? 0})` },
            { key: "financials", label: `Tài chính (${order.financials?.length ?? 0})` },
            { key: "history", label: "Lịch sử" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? "text-[#ffbf00] border-[#ffbf00]"
                : "text-zinc-500 border-transparent hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "docs" && (
        <div className="space-y-4">
          <FileUpload
            orderId={order.id}
            onUploadComplete={async (data) => {
              await fetch(`/api/orders/${order.id}/documents`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  docType: "OTHER",
                  fileUrl: data.fileUrl,
                  fileKey: data.fileKey,
                  notes: data.filename,
                }),
              });
              fetchOrder();
            }}
          />
          {order.documents?.length > 0 && (
            <div className="space-y-2">
              {order.documents.map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3"
                >
                  <div>
                    <p className="text-sm text-zinc-200">{doc.docType.replace(/_/g, " ")}</p>
                    <p className="text-xs text-zinc-500">{doc.notes ?? doc.docNumber ?? "—"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs ${docStatusColors[doc.status]}`}>
                      {doc.status}
                    </span>
                    {doc.issuedDate && (
                      <span className="text-xs text-zinc-600">
                        {formatDate(doc.issuedDate)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "financials" && (
        <div className="space-y-2">
          {order.financials?.length > 0 ? (
            order.financials.map((f: any) => (
              <div
                key={f.id}
                className="flex items-center justify-between bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3"
              >
                <div>
                  <p className="text-sm text-zinc-200">{f.type.replace(/_/g, " ")}</p>
                  <p className="text-xs text-zinc-500">{f.notes ?? f.paymentRef ?? "—"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-zinc-200">
                    {formatCurrency(Number(f.amount), f.currency)}
                  </p>
                  {f.amountVnd && (
                    <p className="text-xs text-zinc-500">
                      {formatCurrency(Number(f.amountVnd), "VND")}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-500 py-4">Chưa có bản ghi tài chính</p>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-2">
          {order.stageLogs?.map((log: any) => (
            <div
              key={log.id}
              className="flex items-start gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3"
            >
              <div className="w-8 h-8 rounded-full bg-[#ffbf00]/10 text-[#ffbf00] flex items-center justify-center text-xs font-medium flex-shrink-0">
                {log.toStage}
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-200">
                  Bước {log.fromStage} → Bước {log.toStage}
                </p>
                <p className="text-xs text-zinc-500">
                  {getStageLabel(order.type, log.fromStage)} →{" "}
                  {getStageLabel(order.type, log.toStage)}
                </p>
                {log.notes && (
                  <p className="text-xs text-zinc-400 mt-1">{log.notes}</p>
                )}
                <p className="text-[10px] text-zinc-600 mt-1">
                  {log.changedBy?.fullName} — {formatDateTime(log.changedAt)}
                </p>
              </div>
            </div>
          ))}
          {(!order.stageLogs || order.stageLogs.length === 0) && (
            <p className="text-sm text-zinc-500 py-4">Chưa có lịch sử</p>
          )}
        </div>
      )}

      {showAdvance && (
        <StageAdvanceModal
          order={order}
          onClose={() => setShowAdvance(false)}
          onSuccess={() => {
            setShowAdvance(false);
            fetchOrder();
          }}
        />
      )}
    </div>
  );
}
