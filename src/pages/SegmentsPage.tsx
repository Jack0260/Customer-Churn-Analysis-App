import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { ChartCard } from "../components/ChartCard";
import { PageHeader } from "../components/PageHeader";
import { useAnalytics } from "../hooks/useAnalytics";
import { formatPercent, formatCurrency } from "../lib/statistics";
import { Layers, ChevronDown } from "lucide-react";

const categoryLabels: Record<string, string> = {
  "Contract": "Contract Type",
  "Payment Method": "Payment Method",
  "Internet Service": "Internet Service",
  "Senior Citizen": "Senior Citizen Status",
  "Partner": "Has Partner",
  "Dependents": "Has Dependents",
  "Paperless Billing": "Paperless Billing",
  "Tech Support": "Tech Support",
  "Online Security": "Online Security",
};

export function SegmentsPage() {
  const a = useAnalytics();
  const [selectedCategory, setSelectedCategory] = useState("Contract");
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(a.segments.map((s) => s.category))),
    [a.segments]
  );

  const currentSegments = useMemo(
    () =>
      a.segments
        .filter((s) => s.category === selectedCategory)
        .sort((x, y) => y.churnRate - x.churnRate),
    [a.segments, selectedCategory]
  );

  if (!a.summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Churn by Segment"
        description="Break down churn rates across contract types, services, demographics, and billing preferences"
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setExpandedSegment(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              selectedCategory === cat
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:border-primary-300 hover:text-primary-700"
            }`}
          >
            {categoryLabels[cat] || cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard
          title={`Churn Rate — ${categoryLabels[selectedCategory] || selectedCategory}`}
          subtitle="Sorted by churn rate, highest to lowest"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={currentSegments.map((s) => ({
                name: s.segment,
                churnRate: s.churnRate,
                total: s.total,
              }))}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#475569" }}
                width={120}
              />
              <Tooltip
                formatter={(v: any) => formatPercent(v)}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="churnRate" name="Churn Rate" radius={[0, 4, 4, 0]}>
                {currentSegments.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.churnRate > 0.4
                        ? "#dc2626"
                        : entry.churnRate > 0.25
                          ? "#f59e0b"
                          : "#14b8a6"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title={`Revenue at Risk — ${categoryLabels[selectedCategory] || selectedCategory}`}
          subtitle="Monthly revenue lost to churn within each segment"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={currentSegments.map((s) => ({
                name: s.segment,
                revenue: s.revenueAtRisk,
                total: s.revenue,
              }))}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#475569" }}
                width={120}
              />
              <Tooltip
                formatter={(v: any) => formatCurrency(v)}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="revenue" name="Revenue at Risk" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard
        title="Segment Detail Table"
        subtitle="Click any row to see detailed breakdown"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-3 py-2.5 font-semibold text-slate-600">Segment</th>
                <th className="text-right px-3 py-2.5 font-semibold text-slate-600">Customers</th>
                <th className="text-right px-3 py-2.5 font-semibold text-slate-600">Churned</th>
                <th className="text-right px-3 py-2.5 font-semibold text-slate-600">Churn Rate</th>
                <th className="text-right px-3 py-2.5 font-semibold text-slate-600">Monthly Revenue</th>
                <th className="text-right px-3 py-2.5 font-semibold text-slate-600">Revenue at Risk</th>
                <th className="text-center px-3 py-2.5 font-semibold text-slate-600">% of Revenue</th>
              </tr>
            </thead>
            <tbody>
              {currentSegments.map((s) => {
                const isExpanded = expandedSegment === s.segment;
                const revenuePct = (s.revenueAtRisk / s.revenue) * 100;
                return (
                  <>
                    <tr
                      key={s.segment}
                      onClick={() =>
                        setExpandedSegment(isExpanded ? null : s.segment)
                      }
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="px-3 py-2.5 font-medium text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <ChevronDown
                            size={14}
                            className={`text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          />
                          {s.segment}
                        </div>
                      </td>
                      <td className="text-right px-3 py-2.5 text-slate-600">{s.total.toLocaleString()}</td>
                      <td className="text-right px-3 py-2.5 text-accent-600">{s.churned.toLocaleString()}</td>
                      <td className="text-right px-3 py-2.5">
                        <span
                          className={`font-semibold ${
                            s.churnRate > 0.4
                              ? "text-accent-600"
                              : s.churnRate > 0.25
                                ? "text-warning-600"
                                : "text-success-600"
                          }`}
                        >
                          {formatPercent(s.churnRate)}
                        </span>
                      </td>
                      <td className="text-right px-3 py-2.5 text-slate-600">{formatCurrency(s.revenue)}</td>
                      <td className="text-right px-3 py-2.5 text-warning-600">{formatCurrency(s.revenueAtRisk)}</td>
                      <td className="text-center px-3 py-2.5">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${revenuePct}%`,
                                backgroundColor:
                                  revenuePct > 40
                                    ? "#dc2626"
                                    : revenuePct > 25
                                      ? "#f59e0b"
                                      : "#14b8a6",
                              }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 w-10 text-right">
                            {revenuePct.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <div className="text-xs text-slate-400 mb-0.5">Avg. Monthly Charge</div>
                              <div className="text-sm font-semibold text-slate-700">
                                {formatCurrency(s.revenue / s.total, 2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-400 mb-0.5">Retained Customers</div>
                              <div className="text-sm font-semibold text-success-600">
                                {(s.total - s.churned).toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-400 mb-0.5">Retained Revenue</div>
                              <div className="text-sm font-semibold text-slate-700">
                                {formatCurrency(s.revenue - s.revenueAtRisk)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-400 mb-0.5">% of Total Customer Base</div>
                              <div className="text-sm font-semibold text-slate-700">
                                {((s.total / a.summary!.totalCustomers) * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <Layers size={14} />
          Click any row to expand detailed metrics for that segment
        </div>
      </ChartCard>
    </div>
  );
}
