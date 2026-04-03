interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  color?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  color = "#ffbf00",
}: KPICardProps) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-zinc-700 transition-colors">
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
        {title}
      </p>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
          {trend === "up" && <span className="text-emerald-400">↑</span>}
          {trend === "down" && <span className="text-red-400">↓</span>}
          {subtitle}
        </p>
      )}
    </div>
  );
}
