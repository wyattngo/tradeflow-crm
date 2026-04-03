"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OrderTable } from "@/components/orders/OrderTable";
import { OrderKanban } from "@/components/orders/OrderKanban";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"table" | "kanban">("table");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [kanbanType, setKanbanType] = useState<"EXPORT" | "IMPORT">("EXPORT");

  async function fetchOrders() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.set("type", typeFilter);
      if (statusFilter) params.set("status", statusFilter);
      params.set("limit", "100");

      const res = await fetch(`/api/orders?${params}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, [typeFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-100">Đơn hàng</h1>
        <Link
          href="/orders/new"
          className="px-4 py-2 bg-[#ffbf00] text-black text-sm font-medium rounded-lg hover:bg-[#cc9900] transition-colors"
        >
          + Tạo đơn mới
        </Link>
      </div>

      {/* Filters + View Toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-[#ffbf00]/50"
        >
          <option value="">Tất cả loại</option>
          <option value="EXPORT">Xuất khẩu</option>
          <option value="IMPORT">Nhập khẩu</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-[#ffbf00]/50"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang xử lý</option>
          <option value="ON_HOLD">Tạm dừng</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="CANCELLED">Đã huỷ</option>
        </select>

        <div className="ml-auto flex gap-1">
          <button
            onClick={() => setView("table")}
            className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
              view === "table"
                ? "bg-[#ffbf00]/10 text-[#ffbf00] border-[#ffbf00]/30"
                : "text-zinc-400 border-[#2a2a2a] hover:border-zinc-600"
            }`}
          >
            Bảng
          </button>
          <button
            onClick={() => setView("kanban")}
            className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
              view === "kanban"
                ? "bg-[#ffbf00]/10 text-[#ffbf00] border-[#ffbf00]/30"
                : "text-zinc-400 border-[#2a2a2a] hover:border-zinc-600"
            }`}
          >
            Kanban
          </button>
        </div>
      </div>

      {/* Kanban type switcher */}
      {view === "kanban" && (
        <div className="flex gap-2">
          <button
            onClick={() => setKanbanType("EXPORT")}
            className={`px-3 py-1.5 text-xs rounded-lg ${
              kanbanType === "EXPORT"
                ? "bg-emerald-500/10 text-emerald-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Xuất khẩu
          </button>
          <button
            onClick={() => setKanbanType("IMPORT")}
            className={`px-3 py-1.5 text-xs rounded-lg ${
              kanbanType === "IMPORT"
                ? "bg-blue-500/10 text-blue-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Nhập khẩu
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-zinc-500">Đang tải...</p>
        </div>
      ) : view === "table" ? (
        <OrderTable orders={orders} />
      ) : (
        <OrderKanban
          orders={orders.filter((o) => o.type === kanbanType)}
          type={kanbanType}
          onRefresh={fetchOrders}
        />
      )}
    </div>
  );
}
