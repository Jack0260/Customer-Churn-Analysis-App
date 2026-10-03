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
import { formatPercent } from "../lib/statistics";
import { Users2 } from "lucide-react";

function retentionColor(rate: number | null): string {
  if (rate === null) return "#f1f5f9";
  if (rate >= 0.9) return "#0d9488";
  if (rate >= 0.8) return "#2dd4bf";
  if (rate >= 0.7) return "#5eead4";
  if (rate >= 0.6) return "#fbbf24";
  if (rate >= 0.5) return "#f59e0b";
  return "#ef4444";
}

export function CohortPage() {
  const a = useAnalytics();

  if (!a.summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  const { matrix, contracts, cohorts: cohortLabels } = a.cohortMatrix;

  return (
    <div>
      <PageHeader
        title="Cohort Retention Analysis"
        description="Retention rates across customer cohorts defined by tenure brackets and contract types"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Users2 className="text-primary-600" size={18} />
            <span className="text-sm text-slate-500">Largest Cohort</span>
          </div>
          <div className="text-xl font-bold text-slate-800">
            {a.cohorts.reduce((max, c) => (c.size > max.size ? c : max), a.cohorts[0]).cohort}
          </div>
          <div className="text-sm text-slate-400 mt-1">
            {a.cohorts.reduce((max, c) => (c.size > max.size ? c : max), a.cohorts[0]).size.toLocaleString()} customers
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <span className="text-sm text-slate-500">Highest Retention</span>
          <div className="text-xl font-bold text-success-600">
            {formatPercent(
              a.cohorts.reduce((max, c) => (c.retentionRate > max.retentionRate ? c : max), a.cohorts[0]).retentionRate
            )}
          </div>
          <div className="text-sm text-slate-400 mt-1">
            {a.cohorts.reduce((max, c) => (c.retentionRate > max.retentionRate ? c : max), a.cohorts[0]).cohort}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <span className="text-sm text-slate-500">Lowest Retention</span>
          <div className="text-xl font-bold text-accent-600">
            {formatPercent(
              a.cohorts.reduce((min, c) => (c.retentionRate < min.retentionRate ? c : min), a.cohorts[0]).retentionRate
            )}
          </div>
          <div className="text-sm text-slate-400 mt-1">
            {a.cohorts.reduce((min, c) => (c.retentionRate < min.retentionRate ? c : min), a.cohorts[0]).cohort}
          </div>
        </div>
      </div>

      <ChartCard
        title="Cohort Retention Heatmap"
        subtitle="Retention rate by tenure cohort (rows) and contract type (columns). Darker teal = higher retention."
        className="mb-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left px-3 py-2 text-sm font-semibold text-slate-600">
                  Tenure Cohort
                </th>
                {contracts.map((c) => (
                  <th
                    key={c}
                    className="text-center px-3 py-2 text-sm font-semibold text-slate-600"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohortLabels.map((cohort) => (
                <tr key={cohort}>
                  <td className="px-3 py-2 text-sm font-medium text-slate-700 whitespace-nowrap">
                    {cohort}
                  </td>
                  {contracts.map((contract) => {
                    const rate = matrix[cohort]?.[contract] ?? null;
                    return (
                      <td key={contract} className="px-2 py-2">
                        <div
                          className="rounded-lg py-3 text-center text-sm font-semibold transition-all duration-200 hover:scale-105 cursor-default"
                          style={{
                            backgroundColor: retentionColor(rate),
                            color: rate !== null && rate < 0.6 ? "white" : "#1e293b",
                          }}
                          title={`${cohort} / ${contract}: ${rate !== null ? formatPercent(rate) : "N/A"}`}
                        >
                          {rate !== null ? formatPercent(rate) : "—"}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
          <span>Low</span>
          <div className="flex gap-1">
            {["#ef4444", "#f59e0b", "#fbbf24", "#5eead4", "#2dd4bf", "#0d9488"].map((c) => (
              <div key={c} className="w-8 h-4 rounded" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span>High</span>
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Retention Rate by Cohort"
          subtitle="Overall retention across tenure brackets"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={a.cohorts.map((c) => ({
                name: c.cohort,
                retention: c.retentionRate,
                churned: c.churnRate,
              }))}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#64748b" }}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              />
              <Tooltip
                formatter={(v: any) => formatPercent(v)}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="retention" name="Retention Rate" radius={[4, 4, 0, 0]}>
                {a.cohorts.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={retentionColor(entry.retentionRate)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Cohort Size Distribution"
          subtitle="Number of customers in each tenure bracket"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={a.cohorts.map((c) => ({
                name: c.cohort,
                size: c.size,
              }))}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#64748b" }}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(v) => v.toLocaleString()}
              />
              <Tooltip
                formatter={(v: any) => v.toLocaleString()}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="size" name="Customers" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard
        title="Cohort Summary Table"
        subtitle="Detailed retention metrics for each tenure bracket"
        className="mt-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-3 py-2.5 font-semibold text-slate-600">Cohort</th>
                <th className="text-right px-3 py-2.5 font-semibold text-slate-600">Customers</th>
                <th className="text-right px-3 py-2.5 font-semibold text-slate-600">Retained</th>
                <th className="text-right px-3 py-2.5 font-semibold text-slate-600">Churned</th>
                <th className="text-right px-3 py-2.5 font-semibold text-slate-600">Retention Rate</th>
                <th className="text-right px-3 py-2.5 font-semibold text-slate-600">Churn Rate</th>
              </tr>
            </thead>
            <tbody>
              {a.cohorts.map((c) => (
                <tr key={c.cohort} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2.5 font-medium text-slate-700">{c.cohort}</td>
                  <td className="text-right px-3 py-2.5 text-slate-600">{c.size.toLocaleString()}</td>
                  <td className="text-right px-3 py-2.5 text-success-600">{c.retained.toLocaleString()}</td>
                  <td className="text-right px-3 py-2.5 text-accent-600">{(c.size - c.retained).toLocaleString()}</td>
                  <td className="text-right px-3 py-2.5 font-semibold text-slate-700">{formatPercent(c.retentionRate)}</td>
                  <td className="text-right px-3 py-2.5 font-semibold text-slate-700">{formatPercent(c.churnRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
