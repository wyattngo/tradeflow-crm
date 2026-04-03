"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function FinancialsPage() {
  const [financials, setFinancials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [finRes, sumRes] = await Promise.all([
          fetch("/api/financials"),
          fetch("/api/reports?type=financial-summary"),
        ]);
        if (finRes.ok) setFinancials(await finRes.json());
        if (sumRes.ok) setSummary(await sumRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <p className="text-zinc-500">Đang tải...</p>;

  const totalVnd = financials.reduce(
    (sum: number, f: any) => sum + (Number(f.amountVnd) || 0),
    0
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-zinc-100">Tài chính</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <p className="text-xs text-zinc-500">Tổng giao dịch</p>
          <p className="text-2xl font-bold text-[#ffbf00]">{financials.length}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <p className="text-xs text-zinc-500">Tổng giá trị (VNĐ)</p>
          <p className="text-2xl font-bold text-zinc-100">
            {formatCurrency(totalVnd, "VND")}
          </p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <p className="text-xs text-zinc-500">Loại giao dịch</p>
          <p className="text-2xl font-bold text-zinc-100">
            {summary?.financials?.length ?? 0}
          </p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {financials.length === 0 ? (
          <p className="text-zinc-500 py-8 text-center">Chưa có bản ghi tài chính</p>
        ) : (
          financials.map((f: any) => (
            <div
              key={f.id}
              className="flex items-center justify-between bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3"
            >
              <div className="flex items-center gap-4">
                <Link
                  href={`/orders/${f.orderId}`}
                  className="text-xs text-[#ffbf00] hover:underline min-w-[100px]"
                >
                  {f.order?.orderCode ?? f.orderId}
                </Link>
                <div>
                  <p className="text-sm text-zinc-200">
                    {f.type.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-zinc-500">{f.notes ?? f.paymentRef ?? "—"}</p>
                </div>
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
        )}
      </div>
    </div>
  );
}
