import {
  Users,
  TrendingDown,
  DollarSign,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  Cell,
} from "recharts";
import { KpiCard } from "../components/KpiCard";
import { ChartCard } from "../components/ChartCard";
import { PageHeader } from "../components/PageHeader";
import { useAnalytics } from "../hooks/useAnalytics";
import { formatCurrency, formatPercent } from "../lib/statistics";
import type { PageId } from "../components/Sidebar";

interface OverviewPageProps {
  onNavigate: (page: PageId) => void;
}

export function OverviewPage({ onNavigate }: OverviewPageProps) {
  const a = useAnalytics();

  if (!a.summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading analytics...</div>
      </div>
    );
  }

  const funnelMax = Math.max(...a.funnel.map((f) => f.count));

  return (
    <div>
      <PageHeader
        title="Dashboard Overview"
        description="High-level churn metrics across your entire customer base"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Customers"
          value={a.summary.totalCustomers.toLocaleString()}
          subValue={`${a.summary.retainedCustomers.toLocaleString()} retained`}
          icon={<Users size={20} />}
          accent="primary"
        />
        <KpiCard
          label="Churn Rate"
          value={formatPercent(a.summary.churnRate)}
          subValue={`${a.summary.churnedCustomers.toLocaleString()} customers lost`}
          trend="up"
          trendLabel="Needs attention"
          icon={<TrendingDown size={20} />}
          accent="accent"
        />
        <KpiCard
          label="Monthly Revenue at Risk"
          value={formatCurrency(a.summary.revenueAtRisk)}
          subValue={`of ${formatCurrency(a.summary.monthlyRevenue)} total`}
          trend="down"
          trendLabel="Recoverable revenue"
          icon={<DollarSign size={20} />}
          accent="warning"
        />
        <KpiCard
          label="Avg. Customer Tenure"
          value={`${a.summary.avgTenure.toFixed(1)} months`}
          subValue={`Avg. spend: ${formatCurrency(a.summary.avgMonthlyCharges, 2)}/mo`}
          icon={<Clock size={20} />}
          accent="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard
          title="Churn Rate by Tenure Bracket"
          subtitle="Customers in their first year churn at significantly higher rates"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={a.tenureChurn} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="tenure"
                tick={{ fontSize: 11, fill: "#64748b" }}
                angle={-20}
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
              <Bar dataKey="churnRate" name="Churn Rate" radius={[4, 4, 0, 0]}>
                {a.tenureChurn.map((entry, i) => (
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
          title="Customer Retention Funnel"
          subtitle="From sign-up through service adoption to retention"
        >
          <div className="space-y-3 pt-2">
            {a.funnel.map((stage, i) => {
              const widthPercent = (stage.count / funnelMax) * 100;
              const pct = i > 0 ? (stage.count / a.funnel[i - 1].count) * 100 : 100;
              return (
                <div key={stage.stage}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 font-medium">{stage.label}</span>
                    <span className="text-slate-400">
                      {stage.count.toLocaleString()}
                      {i > 0 && (
                        <span className="ml-2 text-xs">
                          ({pct.toFixed(0)}% of previous)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg flex items-center px-3 text-white text-xs font-medium transition-all duration-500"
                      style={{
                        width: `${widthPercent}%`,
                        backgroundColor:
                          i === a.funnel.length - 1 ? "#0d9488" : `rgb(${20 + i * 20}, ${184 - i * 15}, ${166 - i * 10})`,
                      }}
                    >
                      {stage.count.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Churn by Monthly Charge Band"
          subtitle="Higher monthly charges correlate with elevated churn rates"
        >
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={a.churnByMonthlyCharges} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="churnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="band"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(v) => `$${v}`}
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
              <Area
                type="monotone"
                dataKey="churnRate"
                name="Churn Rate"
                stroke="#0d9488"
                strokeWidth={2}
                fill="url(#churnGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Revenue: Retained vs. At Risk"
          subtitle="Monthly recurring revenue breakdown by customer status"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={[
                {
                  name: "Retained Revenue",
                  value: a.summary.monthlyRevenue - a.summary.revenueAtRisk,
                },
                {
                  name: "Revenue at Risk",
                  value: a.summary.revenueAtRisk,
                },
              ]}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v: any) => formatCurrency(v)}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" name="Monthly Revenue" radius={[4, 4, 0, 0]}>
                <Cell fill="#0d9488" />
                <Cell fill="#ef4444" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate("whatif")}
          className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-primary-300 hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">What-If Simulator</span>
            <ArrowRight className="text-slate-400 group-hover:text-primary-600 transition-colors" size={18} />
          </div>
          <p className="text-sm text-slate-500">
            Simulate the revenue impact of reducing churn by any percentage
          </p>
        </button>
        <button
          onClick={() => onNavigate("recommendations")}
          className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-primary-300 hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">Recommendations</span>
            <ArrowRight className="text-slate-400 group-hover:text-primary-600 transition-colors" size={18} />
          </div>
          <p className="text-sm text-slate-500">
            Auto-generated business findings with evidence and expected impact
          </p>
        </button>
        <button
          onClick={() => onNavigate("abtest")}
          className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-primary-300 hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">A/B Test Calculator</span>
            <ArrowRight className="text-slate-400 group-hover:text-primary-600 transition-colors" size={18} />
          </div>
          <p className="text-sm text-slate-500">
            Calculate sample size, p-values, and confidence intervals
          </p>
        </button>
      </div>
    </div>
  );
}
