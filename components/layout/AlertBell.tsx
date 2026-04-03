"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function AlertBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchAlerts() {
    try {
      const res = await fetch("/api/alerts?unreadOnly=true&limit=5");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount);
        setAlerts(data.alerts);
      }
    } catch (e) {
      // silently fail
    }
  }

  async function markRead(id: string) {
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchAlerts();
  }

  async function markAllRead() {
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    fetchAlerts();
    setShowDropdown(false);
  }

  const severityColor: Record<string, string> = {
    CRITICAL: "text-red-400",
    WARNING: "text-amber-400",
    INFO: "text-blue-400",
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between p-3 border-b border-[#2a2a2a]">
              <span className="text-sm font-medium text-zinc-200">
                Thông báo
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-[#ffbf00] hover:underline"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>
            {alerts.length === 0 ? (
              <p className="p-4 text-sm text-zinc-500 text-center">
                Không có thông báo mới
              </p>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 border-b border-[#2a2a2a] hover:bg-[#222] cursor-pointer"
                  onClick={() => markRead(alert.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-xs font-medium ${
                        severityColor[alert.severity] ?? "text-zinc-400"
                      }`}
                    >
                      {alert.severity}
                    </p>
                    <span className="text-[10px] text-zinc-600 whitespace-nowrap">
                      {new Date(alert.createdAt).toLocaleTimeString("vi-VN")}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 mt-1">{alert.message}</p>
                  {alert.order && (
                    <p className="text-xs text-zinc-500 mt-1">
                      {alert.order.orderCode}
                    </p>
                  )}
                </div>
              ))
            )}
            <Link
              href="/alerts"
              className="block p-3 text-center text-xs text-[#ffbf00] hover:underline"
              onClick={() => setShowDropdown(false)}
            >
              Xem tất cả thông báo
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
