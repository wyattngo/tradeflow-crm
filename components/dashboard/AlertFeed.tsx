"use client";

import Link from "next/link";

interface AlertFeedProps {
  alerts: any[];
}

export function AlertFeed({ alerts }: AlertFeedProps) {
  const severityConfig: Record<string, { color: string; bg: string }> = {
    CRITICAL: { color: "text-red-400", bg: "bg-red-500/10" },
    WARNING: { color: "text-amber-400", bg: "bg-amber-500/10" },
    INFO: { color: "text-blue-400", bg: "bg-blue-500/10" },
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
      <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-200">Cảnh báo gần đây</h3>
        <Link href="/alerts" className="text-xs text-[#ffbf00] hover:underline">
          Xem tất cả
        </Link>
      </div>
      <div className="divide-y divide-[#2a2a2a] max-h-80 overflow-y-auto">
        {alerts.length === 0 ? (
          <p className="p-4 text-sm text-zinc-500 text-center">
            Không có cảnh báo
          </p>
        ) : (
          alerts.map((alert) => {
            const config = severityConfig[alert.severity] ?? severityConfig.INFO;
            return (
              <div
                key={alert.id}
                className={`p-3 ${config.bg} hover:bg-[#222] transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <span className={`text-xs font-medium ${config.color}`}>
                    {alert.alertType.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] text-zinc-600">
                    {new Date(alert.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                <p className="text-sm text-zinc-300 mt-1">{alert.message}</p>
                {alert.order && (
                  <Link
                    href={`/orders/${alert.orderId}`}
                    className="text-xs text-[#ffbf00] hover:underline mt-1 inline-block"
                  >
                    {alert.order.orderCode}
                  </Link>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
