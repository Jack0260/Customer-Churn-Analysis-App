import { type ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  icon?: ReactNode;
  accent?: "primary" | "accent" | "success" | "warning";
}

export function KpiCard({
  label,
  value,
  subValue,
  trend,
  trendLabel,
  icon,
  accent = "primary",
}: KpiCardProps) {
  const accentBg: Record<string, string> = {
    primary: "bg-primary-50 text-primary-600",
    accent: "bg-accent-50 text-accent-600",
    success: "bg-success-50 text-success-600",
    warning: "bg-warning-50 text-warning-600",
  };

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-success-600"
      : trend === "down"
        ? "text-accent-600"
        : "text-slate-400";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-200 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        {icon && (
          <div className={`p-2 rounded-lg ${accentBg[accent]}`}>{icon}</div>
        )}
      </div>
      <div className="text-3xl font-bold text-slate-800 tracking-tight">
        {value}
      </div>
      {subValue && (
        <div className="text-sm text-slate-400 mt-1">{subValue}</div>
      )}
      {trend && trendLabel && (
        <div className={`flex items-center gap-1 mt-3 text-sm ${trendColor}`}>
          <TrendIcon size={16} />
          <span className="font-medium">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
