"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [rates, setRates] = useState<any[]>([]);
  const [newRate, setNewRate] = useState({
    currency: "USD" as string,
    rateToVnd: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchRates();
  }, []);

  async function fetchRates() {
    try {
      const res = await fetch("/api/exchange-rates");
      if (res.ok) setRates(await res.json());
    } catch (e) {
      console.error(e);
    }
  }

  async function addRate(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/exchange-rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newRate,
        rateToVnd: parseFloat(newRate.rateToVnd),
      }),
    });
    fetchRates();
    setNewRate({ ...newRate, rateToVnd: "" });
  }

  const inputClass =
    "w-full px-3 py-2 bg-[#141414] border border-[#2a2a2a] rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-[#ffbf00]/50";

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-zinc-100">Cài đặt</h1>

      {/* User info */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
        <p className="text-xs text-zinc-500 mb-3">Tài khoản</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Họ tên</span>
            <span className="text-zinc-200">{session?.user?.name ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Email</span>
            <span className="text-zinc-200">{session?.user?.email ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Vai trò</span>
            <span className="text-[#ffbf00]">{(session?.user as any)?.role ?? "—"}</span>
          </div>
        </div>
      </div>

      {/* Exchange Rates */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
        <p className="text-xs text-zinc-500 mb-3">Tỷ giá hối đoái</p>

        <form onSubmit={addRate} className="flex gap-3 mb-4">
          <select
            value={newRate.currency}
            onChange={(e) => setNewRate({ ...newRate, currency: e.target.value })}
            className={inputClass + " max-w-[100px]"}
          >
            <option value="USD">USD</option>
            <option value="CNY">CNY</option>
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Tỷ giá VND"
            value={newRate.rateToVnd}
            onChange={(e) => setNewRate({ ...newRate, rateToVnd: e.target.value })}
            className={inputClass}
            required
          />
          <input
            type="date"
            value={newRate.date}
            onChange={(e) => setNewRate({ ...newRate, date: e.target.value })}
            className={inputClass + " max-w-[160px]"}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#ffbf00] text-black text-sm font-medium rounded-lg hover:bg-[#cc9900] whitespace-nowrap"
          >
            Thêm
          </button>
        </form>

        <div className="space-y-1">
          {rates.slice(0, 20).map((r: any) => (
            <div key={r.id} className="flex justify-between text-sm py-1">
              <span className="text-zinc-400">
                {r.currency} — {new Date(r.date).toLocaleDateString("vi-VN")}
              </span>
              <span className="text-zinc-200">
                {Number(r.rateToVnd).toLocaleString("vi-VN")} VNĐ
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
