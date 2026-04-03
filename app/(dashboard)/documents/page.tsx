"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function DocumentsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders?limit=50");
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
    fetchOrders();
  }, []);

  const allDocs = orders.flatMap((order: any) =>
    (order.documents ?? []).map((doc: any) => ({
      ...doc,
      orderCode: order.orderCode,
      orderId: order.id,
    }))
  );

  const statusColors: Record<string, string> = {
    PENDING: "text-zinc-400 bg-zinc-500/10",
    SUBMITTED: "text-blue-400 bg-blue-500/10",
    APPROVED: "text-emerald-400 bg-emerald-500/10",
    REJECTED: "text-red-400 bg-red-500/10",
  };

  if (loading) return <p className="text-zinc-500">Đang tải...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-zinc-100">Chứng từ</h1>
      <p className="text-sm text-zinc-500">
        Tổng cộng {allDocs.length} chứng từ từ {orders.length} đơn hàng
      </p>

      <div className="space-y-2">
        {allDocs.length === 0 ? (
          <p className="text-zinc-500 py-8 text-center">Chưa có chứng từ nào</p>
        ) : (
          allDocs.map((doc: any) => (
            <div
              key={doc.id}
              className="flex items-center justify-between bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3"
            >
              <div className="flex items-center gap-4">
                <Link
                  href={`/orders/${doc.orderId}`}
                  className="text-xs text-[#ffbf00] hover:underline min-w-[100px]"
                >
                  {doc.orderCode}
                </Link>
                <div>
                  <p className="text-sm text-zinc-200">
                    {doc.docType.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {doc.docNumber ?? doc.notes ?? "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {doc.expiryDate && (
                  <span className="text-xs text-zinc-500">
                    Hết hạn: {formatDate(doc.expiryDate)}
                  </span>
                )}
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    statusColors[doc.status] ?? ""
                  }`}
                >
                  {doc.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
