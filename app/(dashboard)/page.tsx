"use client";

import { useEffect, useState } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { PipelineFunnel } from "@/components/dashboard/PipelineFunnel";
import { AlertFeed } from "@/components/dashboard/AlertFeed";

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [pipeline, setPipeline] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewRes, pipelineRes, alertsRes] = await Promise.all([
          fetch("/api/reports?type=overview"),
          fetch("/api/reports?type=pipeline"),
          fetch("/api/alerts?unreadOnly=true&limit=10"),
        ]);

        if (overviewRes.ok) setOverview(await overviewRes.json());
        if (pipelineRes.ok) setPipeline(await pipelineRes.json());
        if (alertsRes.ok) {
          const data = await alertsRes.json();
          setAlerts(data.alerts);
        }
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-zinc-100">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Tổng đơn hàng"
          value={overview?.totalOrders ?? 0}
          subtitle={`${overview?.activeOrders ?? 0} đang xử lý`}
        />
        <KPICard
          title="Xuất khẩu"
          value={overview?.exportOrders ?? 0}
          color="#22c55e"
        />
        <KPICard
          title="Nhập khẩu"
          value={overview?.importOrders ?? 0}
          color="#3b82f6"
        />
        <KPICard
          title="Cảnh báo"
          value={overview?.unreadAlerts ?? 0}
          color={overview?.unreadAlerts > 0 ? "#ef4444" : "#888"}
          subtitle="chưa đọc"
        />
      </div>

      {/* Pipeline Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PipelineFunnel
          type="EXPORT"
          data={pipeline?.exportPipeline ?? []}
        />
        <PipelineFunnel
          type="IMPORT"
          data={pipeline?.importPipeline ?? []}
        />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
            <h3 className="text-sm font-medium text-zinc-200 mb-3">
              Tổng quan
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-zinc-500">Đơn hoàn thành</p>
                <p className="text-lg font-semibold text-emerald-400">
                  {overview?.completedOrders ?? 0}
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Đối tác</p>
                <p className="text-lg font-semibold text-zinc-200">
                  {overview?.totalPartners ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>
        <AlertFeed alerts={alerts} />
      </div>
    </div>
  );
}
