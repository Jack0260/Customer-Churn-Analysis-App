import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
  LineChart,
  Line,
} from "recharts";
import { ChartCard } from "../components/ChartCard";
import { PageHeader } from "../components/PageHeader";
import { KpiCard } from "../components/KpiCard";
import {
  runABTest,
  calculateSampleSize,
  formatPValue,
  formatPercent,
  type ABTestResult,
  type SampleSizeResult,
} from "../lib/statistics";
import {
  Calculator,
  FlaskConical,
  CheckCircle2,
  XCircle,
  Users,
  Sigma,
  Target,
} from "lucide-react";

export function ABTestPage() {
  const [controlCount, setControlCount] = useState(2500);
  const [controlConversions, setControlConversions] = useState(600);
  const [treatmentCount, setTreatmentCount] = useState(2500);
  const [treatmentConversions, setTreatmentConversions] = useState(520);
  const [confidence, setConfidence] = useState(0.95);

  const [ssBaseline, setSsBaseline] = useState(0.24);
  const [ssMde, setSsMde] = useState(0.03);
  const [ssConfidence, setSsConfidence] = useState(0.95);
  const [ssPower, setSsPower] = useState(0.8);
  const [ssAlternative, setSsAlternative] = useState<"two-sided" | "one-sided">("two-sided");

  const abResult: ABTestResult = runABTest(
    { controlCount, controlConversions, treatmentCount, treatmentConversions },
    confidence
  );

  const ssResult: SampleSizeResult = calculateSampleSize({
    baselineRate: ssBaseline,
    minimumDetectableEffect: ssMde,
    confidenceLevel: ssConfidence,
    statisticalPower: ssPower,
    alternative: ssAlternative,
  });

  const comparisonData = [
    {
      name: "Control",
      rate: abResult.controlRate,
      fill: "#64748b",
    },
    {
      name: "Treatment",
      rate: abResult.treatmentRate,
      fill: abResult.isSignificant ? "#0d9488" : "#f59e0b",
    },
  ];

  const powerCurveData = Array.from({ length: 20 }, (_, i) => {
    const mde = (i + 1) * 0.005;
    const n = calculateSampleSize({
      baselineRate: ssBaseline,
      minimumDetectableEffect: mde,
      confidenceLevel: ssConfidence,
      statisticalPower: ssPower,
      alternative: ssAlternative,
    });
    return {
      mde: mde * 100,
      sampleSize: n.sampleSizePerGroup,
    };
  });

  return (
    <div>
      <PageHeader
        title="A/B Test Calculator"
        description="Calculate statistical significance, confidence intervals, and required sample sizes for churn reduction experiments"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard
          title="Significance Test"
          subtitle="Enter your control and treatment group data to calculate p-value and confidence interval"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Control Group Size
                </label>
                <input
                  type="number"
                  value={controlCount}
                  onChange={(e) => setControlCount(Math.max(1, Number(e.target.value)))}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Control Churned
                </label>
                <input
                  type="number"
                  value={controlConversions}
                  onChange={(e) => setControlConversions(Math.min(controlCount, Math.max(0, Number(e.target.value))))}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Treatment Group Size
                </label>
                <input
                  type="number"
                  value={treatmentCount}
                  onChange={(e) => setTreatmentCount(Math.max(1, Number(e.target.value)))}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Treatment Churned
                </label>
                <input
                  type="number"
                  value={treatmentConversions}
                  onChange={(e) => setTreatmentConversions(Math.min(treatmentCount, Math.max(0, Number(e.target.value))))}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Confidence Level
              </label>
              <div className="flex gap-2 mt-1.5">
                {[0.9, 0.95, 0.99].map((c) => (
                  <button
                    key={c}
                    onClick={() => setConfidence(c)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      confidence === c
                        ? "bg-primary-600 text-white"
                        : "bg-white text-slate-600 border border-slate-200 hover:border-primary-300"
                    }`}
                  >
                    {(c * 100).toFixed(0)}%
                  </button>
                ))}
              </div>
            </div>

            <div className={`rounded-lg p-4 ${abResult.isSignificant ? "bg-success-50" : "bg-warning-50"}`}>
              <div className="flex items-center gap-2 mb-2">
                {abResult.isSignificant ? (
                  <CheckCircle2 className="text-success-600" size={20} />
                ) : (
                  <XCircle className="text-warning-600" size={20} />
                )}
                <span className={`font-semibold text-sm ${abResult.isSignificant ? "text-success-700" : "text-warning-700"}`}>
                  {abResult.isSignificant
                    ? `Result IS statistically significant at ${(confidence * 100).toFixed(0)}% confidence`
                    : `Result is NOT statistically significant at ${(confidence * 100).toFixed(0)}% confidence`}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {abResult.isSignificant
                  ? "The difference between your control and treatment groups is unlikely to be due to random chance. You can confidently attribute the change to your intervention."
                  : "The observed difference could be due to random variation. Consider running the test longer or with a larger sample size to reach significance."}
              </p>
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title="Test Results"
          subtitle="Statistical output from the two-proportion z-test"
        >
          <div className="grid grid-cols-2 gap-3">
            <ResultStat
              label="Control Rate"
              value={formatPercent(abResult.controlRate, 2)}
              color="text-slate-600"
            />
            <ResultStat
              label="Treatment Rate"
              value={formatPercent(abResult.treatmentRate, 2)}
              color="text-slate-600"
            />
            <ResultStat
              label="Absolute Difference"
              value={formatPercent(Math.abs(abResult.absoluteDifference), 2)}
              color={abResult.absoluteDifference < 0 ? "text-success-600" : "text-accent-600"}
              suffix={abResult.absoluteDifference < 0 ? " (improvement)" : " (worse)"}
            />
            <ResultStat
              label="Relative Difference"
              value={`${abResult.relativeDifference >= 0 ? "+" : ""}${(abResult.relativeDifference * 100).toFixed(1)}%`}
              color={abResult.relativeDifference < 0 ? "text-success-600" : "text-accent-600"}
            />
            <ResultStat
              label="Z-Score"
              value={abResult.zScore.toFixed(3)}
              color="text-slate-600"
            />
            <ResultStat
              label="P-Value"
              value={formatPValue(abResult.pValue)}
              color={abResult.pValue < (1 - confidence) ? "text-success-600" : "text-warning-600"}
              bold
            />
            <ResultStat
              label="CI Lower"
              value={formatPercent(abResult.ciLower, 2)}
              color="text-slate-600"
            />
            <ResultStat
              label="CI Upper"
              value={formatPercent(abResult.ciUpper, 2)}
              color="text-slate-600"
            />
          </div>

          <div className="mt-4">
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={comparisonData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                />
                <Tooltip
                  formatter={(v: any) => formatPercent(v, 2)}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Bar dataKey="rate" name="Churn Rate" radius={[4, 4, 0, 0]}>
                  {comparisonData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard
          title="Sample Size Calculator"
          subtitle="Determine how many customers you need per group to detect a meaningful effect"
        >
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Baseline Churn Rate
                </label>
                <span className="text-sm font-bold text-primary-600">
                  {formatPercent(ssBaseline, 1)}
                </span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.5"
                step="0.01"
                value={ssBaseline}
                onChange={(e) => setSsBaseline(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Minimum Detectable Effect
                </label>
                <span className="text-sm font-bold text-primary-600">
                  {formatPercent(ssMde, 1)}
                </span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.1"
                step="0.005"
                value={ssMde}
                onChange={(e) => setSsMde(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Confidence Level
                </label>
                <select
                  value={ssConfidence}
                  onChange={(e) => setSsConfidence(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
                >
                  <option value={0.9}>90%</option>
                  <option value={0.95}>95%</option>
                  <option value={0.99}>99%</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Statistical Power
                </label>
                <select
                  value={ssPower}
                  onChange={(e) => setSsPower(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
                >
                  <option value={0.7}>70%</option>
                  <option value={0.8}>80%</option>
                  <option value={0.9}>90%</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Alternative Hypothesis
              </label>
              <div className="flex gap-2 mt-1.5">
                {(["two-sided", "one-sided"] as const).map((alt) => (
                  <button
                    key={alt}
                    onClick={() => setSsAlternative(alt)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      ssAlternative === alt
                        ? "bg-primary-600 text-white"
                        : "bg-white text-slate-600 border border-slate-200 hover:border-primary-300"
                    }`}
                  >
                    {alt === "two-sided" ? "Two-sided" : "One-sided"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ChartCard>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl p-6 text-white shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users size={20} />
              <span className="text-sm text-primary-100">Required Sample Size</span>
            </div>
            <div className="text-5xl font-bold tracking-tight">
              {ssResult.sampleSizePerGroup.toLocaleString()}
            </div>
            <div className="text-sm text-primary-200 mt-1">per group</div>
            <div className="mt-4 pt-4 border-t border-primary-700 flex justify-between text-sm">
              <span className="text-primary-200">Total customers needed</span>
              <span className="font-semibold">{ssResult.totalSampleSize.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <KpiCard
              label="Z-Alpha"
              value={ssResult.zAlpha.toFixed(3)}
              icon={<Sigma size={18} />}
              accent="primary"
            />
            <KpiCard
              label="Z-Beta"
              value={ssResult.zBeta.toFixed(3)}
              icon={<Target size={18} />}
              accent="success"
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Interpretation
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              To detect a {formatPercent(ssMde)} change from a baseline churn rate of{" "}
              {formatPercent(ssBaseline)} with {(ssConfidence * 100).toFixed(0)}% confidence and{" "}
              {(ssPower * 100).toFixed(0)}% power, you need{" "}
              <strong>{ssResult.sampleSizePerGroup.toLocaleString()} customers</strong> in each
              group ({ssResult.totalSampleSize.toLocaleString()} total). This ensures you can
              reliably detect the effect if it truly exists.
            </p>
          </div>
        </div>
      </div>

      <ChartCard
        title="Sample Size vs. Detectable Effect"
        subtitle="Smaller effects require exponentially larger sample sizes to detect reliably"
      >
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={powerCurveData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="mde"
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickFormatter={(v) => `${v.toFixed(1)}%`}
              label={{ value: "Minimum Detectable Effect", position: "insideBottom", offset: -5, style: { fontSize: 11, fill: "#64748b" } }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString()}
              label={{ value: "Sample Size per Group", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#64748b" } }}
            />
            <Tooltip
              formatter={(v: any) => v.toLocaleString()}
              labelFormatter={(v) => `MDE: ${v}%`}
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="sampleSize"
              name="Required Sample Size"
              stroke="#0d9488"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

interface ResultStatProps {
  label: string;
  value: string;
  color: string;
  suffix?: string;
  bold?: boolean;
}

function ResultStat({ label, value, color, suffix, bold }: ResultStatProps) {
  return (
    <div className="bg-slate-50 rounded-lg px-3 py-2.5">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
        {label}
      </div>
      <div className={`text-lg ${bold ? "font-bold" : "font-semibold"} ${color}`}>
        {value}
        {suffix && <span className="text-xs ml-1">{suffix}</span>}
      </div>
    </div>
  );
}
