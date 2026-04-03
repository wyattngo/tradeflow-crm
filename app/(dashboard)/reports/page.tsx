"use client";

import { useEffect, useState } from "react";
import { PipelineFunnel } from "@/components/dashboard/PipelineFunnel";
import { KPICard } from "@/components/dashboard/KPICard";
import { getStageLabel } from "@/lib/pipeline";
import { formatDateTime } from "@/lib/utils";

export default function ReportsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [pipeline, setPipeline] = useState<any>(null);
  const [stageLogs, setStageLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [o, p, s] = await Promise.all([
          fetch("/api/reports?type=overview"),
          fetch("/api/reports?type=pipeline"),
          fetch("/api/reports?type=stage-timing"),
        ]);
        if (o.ok) setOverview(await o.json());
        if (p.ok) setPipeline(await p.json());
        if (s.ok) {
          const data = await s.json();
          setStageLogs(data.stageLogs ?? []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <p className="text-zinc-500">Đang tải...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-zinc-100">Báo cáo</h1>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Tổng đơn" value={overview?.totalOrders ?? 0} />
        <KPICard title="Đang xử lý" value={overview?.activeOrders ?? 0} color="#22c55e" />
        <KPICard title="Hoàn thành" value={overview?.completedOrders ?? 0} color="#3b82f6" />
        <KPICard title="Đối tác" value={overview?.totalPartners ?? 0} />
      </div>

      {/* Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PipelineFunnel type="EXPORT" data={pipeline?.exportPipeline ?? []} />
        <PipelineFunnel type="IMPORT" data={pipeline?.importPipeline ?? []} />
      </div>

      {/* Stage timing */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
        <h3 className="text-sm font-medium text-zinc-200 mb-4">
          Lịch sử chuyển bước gần đây
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {stageLogs.slice(0, 50).map((log: any) => (
            <div
              key={log.id}
              className="flex items-center justify-between text-sm border-b border-[#2a2a2a] pb-2"
            >
              <div>
                <span className="text-[#ffbf00]">{log.order?.orderCode}</span>
                <span className="text-zinc-500 mx-2">
                  {log.order?.type === "EXPORT" ? "XK" : "NK"}
                </span>
                <span className="text-zinc-400">
                  B{log.fromStage} → B{log.toStage}
                </span>
              </div>
              <span className="text-xs text-zinc-600">
                {formatDateTime(log.changedAt)}
              </span>
            </div>
          ))}
          {stageLogs.length === 0 && (
            <p className="text-zinc-500 text-center py-4">Chưa có dữ liệu</p>
          )}
        </div>
      </div>
    </div>
  );
}
