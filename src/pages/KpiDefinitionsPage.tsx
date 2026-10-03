import { PageHeader } from "../components/PageHeader";
import {
  TrendingDown,
  DollarSign,
  Users2,
  Clock,
  Target,
  Calculator,
  Activity,
  BarChart3,
} from "lucide-react";
import { type ReactNode } from "react";

interface KpiDef {
  term: string;
  icon: typeof TrendingDown;
  category: "Churn Metrics" | "Revenue Metrics" | "Cohort Metrics" | "A/B Test Metrics";
  definition: string;
  formula: string;
  datasetMapping: string;
}

const kpiDefs: KpiDef[] = [
  {
    term: "Churn Rate",
    icon: TrendingDown,
    category: "Churn Metrics",
    definition: "The percentage of customers who discontinued their service within a given period. This is the core metric for measuring customer attrition.",
    formula: "Churn Rate = (Customers Churned ÷ Total Customers) × 100",
    datasetMapping: "Customers where Churn = 'Yes' divided by total customer count (7,043).",
  },
  {
    term: "Retention Rate",
    icon: Users2,
    category: "Churn Metrics",
    definition: "The percentage of customers who continued their service. It is the complement of churn rate.",
    formula: "Retention Rate = (Customers Retained ÷ Total Customers) × 100",
    datasetMapping: "Customers where Churn = 'No' divided by total customer count.",
  },
  {
    term: "Revenue at Risk",
    icon: DollarSign,
    category: "Revenue Metrics",
    definition: "The total monthly recurring revenue from customers who have churned or are at high risk of churning. This quantifies the financial impact of attrition.",
    formula: "Revenue at Risk = Σ(MonthlyCharges) where Churn = 'Yes'",
    datasetMapping: "Sum of MonthlyCharges for all customers where Churn = 'Yes'.",
  },
  {
    term: "Average Revenue Per User (ARPU)",
    icon: BarChart3,
    category: "Revenue Metrics",
    definition: "The average monthly revenue generated per customer. Used to benchmark against industry standards and track revenue trends.",
    formula: "ARPU = Total Monthly Revenue ÷ Total Customers",
    datasetMapping: "Sum of MonthlyCharges divided by total customer count.",
  },
  {
    term: "Customer Lifetime Value (CLV) Estimate",
    icon: Activity,
    category: "Revenue Metrics",
    definition: "An estimate of the total revenue a customer will generate over their relationship with the company. Calculated using average tenure and monthly charges.",
    formula: "CLV = Avg Monthly Charges × Avg Tenure (months)",
    datasetMapping: "Avg(MonthlyCharges) × Avg(tenure) across all customers.",
  },
  {
    term: "Cohort Retention Rate",
    icon: Clock,
    category: "Cohort Metrics",
    definition: "The retention rate for a specific group (cohort) of customers who share a common characteristic, such as joining in the same tenure bracket or having the same contract type.",
    formula: "Cohort Retention = (Retained in Cohort ÷ Total in Cohort) × 100",
    datasetMapping: "Customers grouped by tenure bracket (0-6m, 7-12m, etc.) and contract type, with retention calculated per group.",
  },
  {
    term: "Tenure",
    icon: Clock,
    category: "Cohort Metrics",
    definition: "The number of months a customer has been with the company. Used as the primary dimension for cohort analysis.",
    formula: "Tenure = months since customer signup",
    datasetMapping: "The 'tenure' column in the dataset, ranging from 1 to 72 months.",
  },
  {
    term: "Statistical Significance (p-value)",
    icon: Target,
    category: "A/B Test Metrics",
    definition: "The probability that an observed difference between groups occurred by chance. A p-value below 0.05 (at 95% confidence) is typically considered statistically significant.",
    formula: "p-value = 2 × (1 - Φ(|z|)), where z is the z-score from a two-proportion z-test",
    datasetMapping: "Calculated in the A/B Test Calculator using control and treatment group conversion rates.",
  },
  {
    term: "Confidence Interval",
    icon: Calculator,
    category: "A/B Test Metrics",
    definition: "A range of values that likely contains the true difference between two groups' conversion rates. A 95% CI means we are 95% confident the true difference falls within this range.",
    formula: "CI = Difference ± Z(α/2) × Standard Error",
    datasetMapping: "Calculated from the standard error of the difference between two sample proportions.",
  },
  {
    term: "Statistical Power",
    icon: Activity,
    category: "A/B Test Metrics",
    definition: "The probability of detecting a true effect (correctly rejecting the null hypothesis). Higher power means less risk of a false negative. Typically targeted at 80%.",
    formula: "Power = 1 - β, where β is the probability of a Type II error",
    datasetMapping: "Used in the sample size calculator to determine how many customers you need per test group.",
  },
  {
    term: "Minimum Detectable Effect (MDE)",
    icon: Target,
    category: "A/B Test Metrics",
    definition: "The smallest difference in conversion/churn rate between groups that your test is designed to reliably detect. Smaller MDE requires larger sample sizes.",
    formula: "MDE = Treatment Rate - Control Rate",
    datasetMapping: "An input to the sample size calculator — the minimum improvement you want to be able to detect.",
  },
  {
    term: "Sample Size per Group",
    icon: Calculator,
    category: "A/B Test Metrics",
    definition: "The number of customers needed in each group (control and treatment) to reliably detect the minimum detectable effect at the desired confidence and power levels.",
    formula: "n = (Zα√(2p̄q̄) + Zβ√(p1(1-p1)+p2(1-p2)))² ÷ (p2-p1)²",
    datasetMapping: "Calculated in the A/B Test Calculator based on baseline rate, MDE, confidence level, and power.",
  },
];

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  "Churn Metrics": { bg: "bg-accent-50", text: "text-accent-600", border: "border-accent-200" },
  "Revenue Metrics": { bg: "bg-primary-50", text: "text-primary-600", border: "border-primary-200" },
  "Cohort Metrics": { bg: "bg-warning-50", text: "text-warning-600", border: "border-warning-200" },
  "A/B Test Metrics": { bg: "bg-success-50", text: "text-success-600", border: "border-success-200" },
};

export function KpiDefinitionsPage() {
  const categories = Array.from(new Set(kpiDefs.map((k) => k.category)));

  return (
    <div>
      <PageHeader
        title="KPI Definitions"
        description="A glossary of every metric used in this dashboard, with formulas and how they map to the dataset"
      />

      {categories.map((category) => {
        const defs = kpiDefs.filter((d) => d.category === category);
        const colors = categoryColors[category];
        return (
          <div key={category} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${colors.bg} ${colors.text} ${colors.border} border`}>
                {category}
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {defs.map((def) => {
                const Icon = def.icon;
                return (
                  <div
                    key={def.term}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2.5 rounded-lg ${colors.bg} flex-shrink-0`}>
                        <Icon className={colors.text} size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-slate-800">
                          {def.term}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mb-3">
                      {def.definition}
                    </p>
                    <div className="space-y-2">
                      <div className="bg-slate-50 rounded-lg px-3 py-2">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                          Formula
                        </div>
                        <code className="text-xs text-slate-700 font-mono">
                          {def.formula}
                        </code>
                      </div>
                      <div className="bg-primary-50/50 rounded-lg px-3 py-2">
                        <div className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-1">
                          Dataset Mapping
                        </div>
                        <p className="text-xs text-slate-600">
                          {def.datasetMapping}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
