"use client";

import Link from "next/link";
import { StageProgress } from "./StageProgress";

interface OrderCardProps {
  order: any;
  onAdvance?: () => void;
}

export function OrderCard({ order, onAdvance }: OrderCardProps) {
  const statusColors: Record<string, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    ON_HOLD: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    COMPLETED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <Link
          href={`/orders/${order.id}`}
          className="text-sm font-medium text-[#ffbf00] hover:underline"
        >
          {order.orderCode}
        </Link>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full border ${
            statusColors[order.status] ?? "text-zinc-400"
          }`}
        >
          {order.status}
        </span>
      </div>
      <p className="text-xs text-zinc-400 mb-2 line-clamp-2">
        {order.productDescription}
      </p>
      <StageProgress
        type={order.type}
        currentStage={order.pipelineStage}
        stageDeadline={order.stageDeadline}
      />
      {order.alerts && order.alerts.length > 0 && (
        <p className="text-[10px] text-red-400 mt-2">
          {order.alerts.length} cảnh báo
        </p>
      )}
      {onAdvance && order.status === "ACTIVE" && (
        <button
          onClick={onAdvance}
          className="mt-2 w-full text-xs py-1.5 bg-[#ffbf00]/10 text-[#ffbf00] rounded hover:bg-[#ffbf00]/20 transition-colors"
        >
          Chuyển bước tiếp
        </button>
      )}
    </div>
  );
}
