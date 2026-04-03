"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CurrencyInput } from "@/components/shared/CurrencyInput";

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    type: "EXPORT" as "EXPORT" | "IMPORT",
    productDescription: "",
    hsCode: "",
    quantity: undefined as number | undefined,
    unit: "",
    totalValue: undefined as number | undefined,
    currency: "USD" as "USD" | "CNY" | "VND",
    incoterms: "",
    borderGate: "",
    transportMode: "" as "" | "ROAD" | "RAIL" | "SEA" | "AIR",
    notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload: any = {
        type: form.type,
        productDescription: form.productDescription,
        currency: form.currency,
      };
      if (form.hsCode) payload.hsCode = form.hsCode;
      if (form.quantity) payload.quantity = form.quantity;
      if (form.unit) payload.unit = form.unit;
      if (form.totalValue) payload.totalValue = form.totalValue;
      if (form.incoterms) payload.incoterms = form.incoterms;
      if (form.borderGate) payload.borderGate = form.borderGate;
      if (form.transportMode) payload.transportMode = form.transportMode;
      if (form.notes) payload.notes = form.notes;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.fieldErrors ? JSON.stringify(data.error.fieldErrors) : "Có lỗi xảy ra");
        return;
      }

      const order = await res.json();
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 bg-[#141414] border border-[#2a2a2a] rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-[#ffbf00]/50";

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-zinc-100 mb-6">
        Tạo đơn hàng mới
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type */}
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5">
            Loại đơn *
          </label>
          <div className="flex gap-3">
            {(["EXPORT", "IMPORT"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, type: t })}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  form.type === t
                    ? t === "EXPORT"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    : "text-zinc-400 border-[#2a2a2a] hover:border-zinc-600"
                }`}
              >
                {t === "EXPORT" ? "Xuất khẩu" : "Nhập khẩu"}
              </button>
            ))}
          </div>
        </div>

        {/* Product Description */}
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5">
            Mô tả hàng hoá *
          </label>
          <textarea
            value={form.productDescription}
            onChange={(e) =>
              setForm({ ...form, productDescription: e.target.value })
            }
            className={inputClass}
            rows={3}
            placeholder="VD: Thanh long ruột đỏ, 20 tấn, đóng thùng carton"
            required
          />
        </div>

        {/* HS Code + Unit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">
              Mã HS
            </label>
            <input
              type="text"
              value={form.hsCode}
              onChange={(e) => setForm({ ...form, hsCode: e.target.value })}
              className={inputClass}
              placeholder="0804.50"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">
              Đơn vị
            </label>
            <input
              type="text"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className={inputClass}
              placeholder="Tấn, Kiện, Container..."
            />
          </div>
        </div>

        {/* Quantity + Value */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">
              Số lượng
            </label>
            <input
              type="number"
              step="0.001"
              value={form.quantity ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  quantity: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className={inputClass}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">
              Giá trị ({form.currency})
            </label>
            <CurrencyInput
              value={form.totalValue}
              onChange={(v) => setForm({ ...form, totalValue: v })}
              currency={form.currency}
            />
          </div>
        </div>

        {/* Currency + Incoterms */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">
              Đồng tiền
            </label>
            <select
              value={form.currency}
              onChange={(e) =>
                setForm({ ...form, currency: e.target.value as any })
              }
              className={inputClass}
            >
              <option value="USD">USD</option>
              <option value="CNY">CNY</option>
              <option value="VND">VND</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">
              Incoterms
            </label>
            <select
              value={form.incoterms}
              onChange={(e) => setForm({ ...form, incoterms: e.target.value })}
              className={inputClass}
            >
              <option value="">-- Chọn --</option>
              <option value="FOB">FOB</option>
              <option value="CIF">CIF</option>
              <option value="CFR">CFR</option>
              <option value="EXW">EXW</option>
              <option value="DAP">DAP</option>
              <option value="DDP">DDP</option>
            </select>
          </div>
        </div>

        {/* Border Gate + Transport */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">
              Cửa khẩu
            </label>
            <select
              value={form.borderGate}
              onChange={(e) => setForm({ ...form, borderGate: e.target.value })}
              className={inputClass}
            >
              <option value="">-- Chọn --</option>
              <option value="Tân Thanh">Tân Thanh (Lạng Sơn)</option>
              <option value="Hữu Nghị">Hữu Nghị (Lạng Sơn)</option>
              <option value="Móng Cái">Móng Cái (Quảng Ninh)</option>
              <option value="Lào Cai">Lào Cai</option>
              <option value="Kim Thành">Kim Thành (Lào Cai)</option>
              <option value="Cầu Treo">Cầu Treo (Hà Tĩnh)</option>
              <option value="Hải Phòng">Cảng Hải Phòng</option>
              <option value="TP.HCM">Cảng TP.HCM</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">
              Phương thức vận chuyển
            </label>
            <select
              value={form.transportMode}
              onChange={(e) =>
                setForm({ ...form, transportMode: e.target.value as any })
              }
              className={inputClass}
            >
              <option value="">-- Chọn --</option>
              <option value="ROAD">Đường bộ</option>
              <option value="RAIL">Đường sắt</option>
              <option value="SEA">Đường biển</option>
              <option value="AIR">Đường hàng không</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5">
            Ghi chú
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className={inputClass}
            rows={2}
            placeholder="Ghi chú thêm..."
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 text-sm text-zinc-400 border border-[#2a2a2a] rounded-lg hover:border-zinc-600 transition-colors"
          >
            Huỷ
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#ffbf00] text-black text-sm font-medium rounded-lg hover:bg-[#cc9900] disabled:opacity-50 transition-colors"
          >
            {loading ? "Đang tạo..." : "Tạo đơn hàng"}
          </button>
        </div>
      </form>
    </div>
  );
}
