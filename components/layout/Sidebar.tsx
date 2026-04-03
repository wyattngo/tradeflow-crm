"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/orders", label: "Đơn hàng", icon: "📦" },
  { href: "/partners", label: "Đối tác", icon: "🤝" },
  { href: "/documents", label: "Chứng từ", icon: "📄" },
  { href: "/financials", label: "Tài chính", icon: "💰" },
  { href: "/reports", label: "Báo cáo", icon: "📈" },
  { href: "/settings", label: "Cài đặt", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 bg-[#141414] border-r border-[#2a2a2a] flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-[#2a2a2a]">
        <span className="text-xl font-bold text-[#ffbf00]">TradeFlow</span>
        <span className="text-xs text-zinc-500 ml-2">CRM</span>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        {nav.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                isActive
                  ? "text-[#ffbf00] bg-[#ffbf00]/10 border-r-2 border-[#ffbf00]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1a1a]"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[#2a2a2a]">
        <p className="text-xs text-zinc-600">TradeFlow CRM v1.0</p>
      </div>
    </aside>
  );
}
