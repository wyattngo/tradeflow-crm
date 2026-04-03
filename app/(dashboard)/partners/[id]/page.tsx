"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function PartnerDetailPage() {
  const params = useParams();
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPartner() {
      try {
        const res = await fetch(`/api/partners/${params.id}`);
        if (res.ok) setPartner(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchPartner();
  }, [params.id]);

  if (loading) return <p className="text-zinc-500">Đang tải...</p>;
  if (!partner) return <p className="text-zinc-500">Không tìm thấy đối tác</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/partners" className="text-zinc-500 hover:text-zinc-300 text-sm">
          ← Đối tác
        </Link>
        <h1 className="text-xl font-semibold text-zinc-100 mt-2">{partner.name}</h1>
        <p className="text-sm text-zinc-400">
          {partner.type.replace(/_/g, " ")} — {partner.country === "VN" ? "Việt Nam" : partner.country === "CN" ? "Trung Quốc" : "Khác"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-2 text-sm">
          <p className="text-xs text-zinc-500 mb-2">Thông tin liên hệ</p>
          <div className="flex justify-between">
            <span className="text-zinc-500">Người liên hệ</span>
            <span className="text-zinc-300">{partner.contactPerson ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Điện thoại</span>
            <span className="text-zinc-300">{partner.phone ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Email</span>
            <span className="text-zinc-300">{partner.email ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">MST</span>
            <span className="text-zinc-300">{partner.taxCode ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Giấy phép</span>
            <span className="text-zinc-300">{partner.licenseNumber ?? "—"}</span>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-3">Đơn hàng liên quan</p>
          {partner.orderPartners?.length > 0 ? (
            <div className="space-y-2">
              {partner.orderPartners.map((op: any) => (
                <Link
                  key={op.id}
                  href={`/orders/${op.order.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-[#222] transition-colors"
                >
                  <span className="text-sm text-[#ffbf00]">{op.order.orderCode}</span>
                  <span className="text-xs text-zinc-500">{op.order.status}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-600">Chưa có đơn hàng</p>
          )}
        </div>
      </div>

      {partner.notes && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-2">Ghi chú</p>
          <p className="text-sm text-zinc-300">{partner.notes}</p>
        </div>
      )}
    </div>
  );
}
