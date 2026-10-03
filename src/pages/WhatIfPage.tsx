import { useState, useMemo } from "react";
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
import { ChartCard } from "../components/ChartCard";
import { PageHeader } from "../components/PageHeader";
import { KpiCard } from "../components/KpiCard";
import { useAnalytics } from "../hooks/useAnalytics";
import { formatCurrency, formatPercent } from "../lib/statistics";
import { TrendingDown, DollarSign, Calendar, Target } from "lucide-react";

export function WhatIfPage() {
  const a = useAnalytics();
  const [reductionPct, setReductionPct] = useState(20);
  const [months, setMonths] = useState(12);

  const data = useMemo(() => {
    if (!a.summary) return null;
    const revenueAtRisk = a.summary.revenueAtRisk;
    const recoveredMonthly = (revenueAtRisk * reductionPct) / 100;
    const newChurnRate = a.summary.churnRate * (1 - reductionPct / 100);
    const newChurnedCount = Math.round(a.summary.churnedCustomers * (1 - reductionPct / 100));
    const customersSaved = a.summary.churnedCustomers - newChurnedCount;
    const cumulativeRecovered = recoveredMonthly * months;

    const monthlyProjection = Array.from({ length: months }, (_, i) => ({
      month: i + 1,
      recovered: recoveredMonthly * (i + 1),
      baseline: 0,
    }));

    const comparisonData = [
      {
        name: "Current State",
        revenue: revenueAtRisk,
        churn: a.summary.churnedCustomers,
        fill: "#ef4444",
      },
      {
        name: "After Intervention",
        revenue: revenueAtRisk - recoveredMonthly,
        churn: newChurnedCount,
        fill: "#0d9488",
      },
      {
        name: "Recovered",
        revenue: recoveredMonthly,
        churn: customersSaved,
        fill: "#22c55e",
      },
    ];

    return {
      revenueAtRisk,
      recoveredMonthly,
      newChurnRate,
      newChurnedCount,
      customersSaved,
      cumulativeRecovered,
      monthlyProjection,
      comparisonData,
    };
  }, [a.summary, reductionPct, months]);

  if (!a.summary || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Revenue What-If Simulator"
        description="Model the financial impact of reducing customer churn. Adjust the sliders to see real-time revenue projections."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Target className="text-primary-600" size={20} />
              <h3 className="text-base font-semibold text-slate-800">Simulation Controls</h3>
            </div>

            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-600">
                  Churn Reduction Target
                </label>
                <span className="text-sm font-bold text-primary-600">
                  {reductionPct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={reductionPct}
                onChange={(e) => setReductionPct(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-600">
                  Time Horizon
                </label>
                <span className="text-sm font-bold text-primary-600">
                  {months} months
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="24"
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>1 mo</span>
                <span>12 mo</span>
                <span>24 mo</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl p-6 text-white shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={20} />
              <span className="text-sm font-medium text-primary-100">
                Cumulative Revenue Recovered
              </span>
            </div>
            <div className="text-4xl font-bold tracking-tight mb-2">
              {formatCurrency(data.cumulativeRecovered)}
            </div>
            <div className="text-sm text-primary-200">
              over {months} months at {reductionPct}% churn reduction
            </div>
            <div className="mt-4 pt-4 border-t border-primary-700">
              <div className="flex justify-between text-sm">
                <span className="text-primary-200">Monthly recovery</span>
                <span className="font-semibold">{formatCurrency(data.recoveredMonthly)}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-primary-200">Customers saved</span>
                <span className="font-semibold">{data.customersSaved.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-primary-200">New churn rate</span>
                <span className="font-semibold">{formatPercent(data.newChurnRate)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard
              label="Current Churn Rate"
              value={formatPercent(a.summary.churnRate)}
              icon={<TrendingDown size={20} />}
              accent="accent"
            />
            <KpiCard
              label="Projected Churn Rate"
              value={formatPercent(data.newChurnRate)}
              subValue={`↓ ${reductionPct}% reduction`}
              icon={<TrendingDown size={20} />}
              accent="success"
            />
            <KpiCard
              label="Monthly Revenue Saved"
              value={formatCurrency(data.recoveredMonthly)}
              subValue={`${formatPercent(data.recoveredMonthly / a.summary.monthlyRevenue)} of total`}
              icon={<DollarSign size={20} />}
              accent="primary"
            />
          </div>

          <ChartCard
            title="Revenue Recovery Projection"
            subtitle={`Cumulative revenue recovered over ${months} months at ${reductionPct}% churn reduction`}
          >
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.monthlyProjection} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="recoveryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(v) => `Mo ${v}`}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v: any) => formatCurrency(v)}
                  labelFormatter={(v) => `Month ${v}`}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="recovered"
                  name="Cumulative Revenue Recovered"
                  stroke="#0d9488"
                  strokeWidth={2}
                  fill="url(#recoveryGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Before vs. After Comparison"
          subtitle="Revenue at risk under the current scenario vs. after intervention"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={data.comparisonData}
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
              <Bar dataKey="revenue" name="Monthly Revenue" radius={[4, 4, 0, 0]}>
                {data.comparisonData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Customer Impact"
          subtitle="How many customers are retained under this scenario"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={[
                { name: "Currently Churned", value: a.summary.churnedCustomers, fill: "#ef4444" },
                { name: "Still Churning", value: data.newChurnedCount, fill: "#f59e0b" },
                { name: "Saved by Intervention", value: data.customersSaved, fill: "#22c55e" },
              ]}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
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
              <Bar dataKey="value" name="Customers" radius={[4, 4, 0, 0]}>
                {[
                  { fill: "#ef4444" },
                  { fill: "#f59e0b" },
                  { fill: "#22c55e" },
                ].map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="text-primary-600" size={18} />
          <h3 className="text-base font-semibold text-slate-800">Scenario Summary</h3>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed">
          If you reduce your churn rate by{" "}
          <strong className="text-primary-600">{reductionPct}%</strong> (from{" "}
          <strong>{formatPercent(a.summary.churnRate)}</strong> to{" "}
          <strong>{formatPercent(data.newChurnRate)}</strong>), you would save{" "}
          <strong className="text-success-600">{data.customersSaved.toLocaleString()} customers</strong>{" "}
          and recover{" "}
          <strong className="text-primary-600">{formatCurrency(data.recoveredMonthly)}/month</strong>{" "}
          in recurring revenue. Over {months} months, this amounts to{" "}
          <strong className="text-primary-600">{formatCurrency(data.cumulativeRecovered)}</strong>{" "}
          in cumulative revenue recovered.
        </p>
      </div>
    </div>
  );
}
