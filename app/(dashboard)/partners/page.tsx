"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<any, any>[] = [
  {
    accessorKey: "name",
    header: "Tên đối tác",
    cell: ({ row }) => (
      <Link
        href={`/partners/${row.original.id}`}
        className="text-[#ffbf00] hover:underline font-medium"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "type",
    header: "Loại",
    cell: ({ row }) => (
      <span className="text-zinc-300">
        {row.original.type.replace(/_/g, " ")}
      </span>
    ),
  },
  {
    accessorKey: "country",
    header: "Quốc gia",
    cell: ({ row }) => {
      const flags: Record<string, string> = { VN: "🇻🇳", CN: "🇨🇳" };
      return (
        <span>
          {flags[row.original.country] ?? ""} {row.original.country}
        </span>
      );
    },
  },
  {
    accessorKey: "contactPerson",
    header: "Liên hệ",
  },
  {
    accessorKey: "phone",
    header: "Điện thoại",
  },
  {
    accessorKey: "_count.orderPartners",
    header: "Đơn hàng",
    cell: ({ row }) => row.original._count?.orderPartners ?? 0,
  },
];

export default function PartnersPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "BUYER" as string,
    country: "VN" as string,
    contactPerson: "",
    phone: "",
    email: "",
    taxCode: "",
    notes: "",
  });

  async function fetchPartners() {
    try {
      const res = await fetch("/api/partners");
      if (res.ok) setPartners(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPartners();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ name: "", type: "BUYER", country: "VN", contactPerson: "", phone: "", email: "", taxCode: "", notes: "" });
      fetchPartners();
    }
  }

  const inputClass =
    "w-full px-3 py-2 bg-[#141414] border border-[#2a2a2a] rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-[#ffbf00]/50";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-100">Đối tác</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#ffbf00] text-black text-sm font-medium rounded-lg hover:bg-[#cc9900] transition-colors"
        >
          + Thêm đối tác
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Tên *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Loại</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={inputClass}
              >
                <option value="BUYER">Buyer</option>
                <option value="SUPPLIER">Supplier</option>
                <option value="FREIGHT_FORWARDER">Freight Forwarder</option>
                <option value="CUSTOMS_BROKER">Customs Broker</option>
                <option value="INSPECTION_AGENCY">Inspection Agency</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Quốc gia</label>
              <select
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className={inputClass}
              >
                <option value="VN">Việt Nam</option>
                <option value="CN">Trung Quốc</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Người liên hệ</label>
              <input
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Điện thoại</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Mã số thuế</label>
              <input
                value={form.taxCode}
                onChange={(e) => setForm({ ...form, taxCode: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-zinc-400 border border-[#2a2a2a] rounded-lg"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#ffbf00] text-black text-sm font-medium rounded-lg hover:bg-[#cc9900]"
            >
              Lưu
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-zinc-500">Đang tải...</p>
      ) : (
        <DataTable
          columns={columns}
          data={partners}
          searchPlaceholder="Tìm tên, MST, liên hệ..."
        />
      )}
    </div>
  );
}
