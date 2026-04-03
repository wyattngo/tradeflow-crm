"use client";

import { useState } from "react";
import { EXPORT_STAGES, IMPORT_STAGES } from "@/lib/pipeline";
import { OrderCard } from "./OrderCard";
import { StageAdvanceModal } from "./StageAdvanceModal";

interface Props {
  orders: any[];
  type: "EXPORT" | "IMPORT";
  onRefresh: () => void;
}

export function OrderKanban({ orders, type, onRefresh }: Props) {
  const stages = type === "EXPORT" ? EXPORT_STAGES : IMPORT_STAGES;
  const [advancingOrder, setAdvancingOrder] = useState<any | null>(null);

  const ordersByStage = Object.keys(stages).reduce((acc, stage) => {
    acc[parseInt(stage)] = orders.filter(
      (o) => o.pipelineStage === parseInt(stage)
    );
    return acc;
  }, {} as Record<number, any[]>);

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Object.entries(stages).map(([stage, label]) => {
          const stageOrders = ordersByStage[parseInt(stage)] ?? [];
          return (
            <div
              key={stage}
              className="flex-shrink-0 w-72 bg-[#141414] rounded-xl border border-[#2a2a2a]"
            >
              <div className="p-3 border-b border-[#2a2a2a]">
                <p className="text-xs text-zinc-500 mb-1">Bước {stage}</p>
                <p className="text-sm font-medium text-white truncate">
                  {label}
                </p>
                <span className="text-xs text-zinc-400">
                  {stageOrders.length} đơn
                </span>
              </div>
              <div className="p-2 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
                {stageOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onAdvance={() => setAdvancingOrder(order)}
                  />
                ))}
                {stageOrders.length === 0 && (
                  <p className="text-xs text-zinc-600 text-center py-4">
                    Trống
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {advancingOrder && (
        <StageAdvanceModal
          order={advancingOrder}
          onClose={() => setAdvancingOrder(null)}
          onSuccess={() => {
            setAdvancingOrder(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
