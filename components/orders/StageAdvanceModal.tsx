"use client";

import { useState } from "react";
import { getStageLabel, getMaxStage, getMissingDocs } from "@/lib/pipeline";

interface Props {
  order: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function StageAdvanceModal({ order, onClose, onSuccess }: Props) {
  const [notes, setNotes] = useState("");
  const [force, setForce] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const maxStage = getMaxStage(order.type);
  const nextStage = order.pipelineStage + 1;
  const isLast = nextStage > maxStage;

  async function handleAdvance() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/orders/${order.id}/stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, force }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.missingDocs) {
          setError(
            `Thiếu chứng từ: ${data.missingDocs.join(", ")}. Bật "Bỏ qua kiểm tra" nếu cần.`
          );
        } else {
          setError(data.error ?? "Có lỗi xảy ra");
        }
        return;
      }

      onSuccess();
    } catch (err) {
      setError("Có lỗi kết nối");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-medium text-zinc-100 mb-4">
          Chuyển bước
        </h3>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500">Hiện tại:</span>
            <span className="text-zinc-200">
              Bước {order.pipelineStage} —{" "}
              {getStageLabel(order.type, order.pipelineStage)}
            </span>
          </div>
          {!isLast && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-500">Tiếp theo:</span>
              <span className="text-[#ffbf00]">
                Bước {nextStage} — {getStageLabel(order.type, nextStage)}
              </span>
            </div>
          )}
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ghi chú (tùy chọn)..."
          className="w-full px-3 py-2 bg-[#141414] border border-[#2a2a2a] rounded-lg text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#ffbf00]/50 mb-3"
          rows={3}
        />

        <label className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
          <input
            type="checkbox"
            checked={force}
            onChange={(e) => setForce(e.target.checked)}
            className="rounded border-zinc-600"
          />
          Bỏ qua kiểm tra chứng từ (chỉ Manager/Admin)
        </label>

        {error && (
          <p className="text-sm text-red-400 mb-4">{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 border border-[#2a2a2a] rounded-lg hover:border-zinc-600 transition-colors"
          >
            Huỷ
          </button>
          <button
            onClick={handleAdvance}
            disabled={loading || isLast}
            className="px-4 py-2 text-sm bg-[#ffbf00] text-black font-medium rounded-lg hover:bg-[#cc9900] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Đang xử lý..." : isLast ? "Đã hoàn thành" : "Xác nhận chuyển"}
          </button>
        </div>
      </div>
    </div>
  );
}
