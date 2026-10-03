import { useMemo } from "react";
import { query } from "../data/sqlEngine";

export interface KpiSummary {
  totalCustomers: number;
  churnedCustomers: number;
  churnRate: number;
  retainedCustomers: number;
  retentionRate: number;
  monthlyRevenue: number;
  revenueAtRisk: number;
  avgMonthlyCharges: number;
  avgTenure: number;
  avgTotalCharges: number;
}

export interface SegmentData {
  segment: string;
  category: string;
  total: number;
  churned: number;
  churnRate: number;
  revenue: number;
  revenueAtRisk: number;
}

export interface CohortRow {
  cohort: string;
  size: number;
  retained: number;
  retentionRate: number;
  churnRate: number;
}

export interface TenureChurnData {
  tenure: string;
  total: number;
  churned: number;
  churnRate: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
  label: string;
}

export function useAnalytics() {
  const summary = useMemo<KpiSummary | null>(() => {
    const result = query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END) as churned,
        SUM(CASE WHEN Churn = 'No' THEN 1 ELSE 0 END) as retained,
        SUM(MonthlyCharges) as revenue,
        SUM(CASE WHEN Churn = 'Yes' THEN MonthlyCharges ELSE 0 END) as revenue_at_risk,
        AVG(MonthlyCharges) as avg_monthly,
        AVG(tenure) as avg_tenure,
        AVG(TotalCharges) as avg_total
      FROM customers
    `);
    if (!result.rows.length) return null;
    const r = result.rows[0];
    const total = r[0] as number;
    const churned = r[1] as number;
    return {
      totalCustomers: total,
      churnedCustomers: churned,
      churnRate: churned / total,
      retainedCustomers: r[2] as number,
      retentionRate: (r[2] as number) / total,
      monthlyRevenue: r[3] as number,
      revenueAtRisk: r[4] as number,
      avgMonthlyCharges: r[5] as number,
      avgTenure: r[6] as number,
      avgTotalCharges: r[7] as number,
    };
  }, []);

  const tenureChurn = useMemo<TenureChurnData[]>(() => {
    const result = query(`
      SELECT
        CASE
          WHEN tenure <= 6 THEN '0-6 months'
          WHEN tenure <= 12 THEN '7-12 months'
          WHEN tenure <= 24 THEN '13-24 months'
          WHEN tenure <= 36 THEN '25-36 months'
          WHEN tenure <= 48 THEN '37-48 months'
          WHEN tenure <= 60 THEN '49-60 months'
          ELSE '61-72 months'
        END as tenure_bucket,
        COUNT(*) as total,
        SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END) as churned
      FROM customers
      GROUP BY tenure_bucket
      ORDER BY tenure_bucket
    `);
    return result.rows.map((r) => {
      const total = r[1] as number;
      const churned = r[2] as number;
      return {
        tenure: r[0] as string,
        total,
        churned,
        churnRate: churned / total,
      };
    });
  }, []);

  const segments = useMemo(() => {
    const categories: { name: string; column: string }[] = [
      { name: "Contract", column: "Contract" },
      { name: "Payment Method", column: "PaymentMethod" },
      { name: "Internet Service", column: "InternetService" },
      { name: "Senior Citizen", column: "CASE WHEN SeniorCitizen = 1 THEN 'Yes' ELSE 'No' END" },
      { name: "Partner", column: "Partner" },
      { name: "Dependents", column: "Dependents" },
      { name: "Paperless Billing", column: "PaperlessBilling" },
      { name: "Tech Support", column: "TechSupport" },
      { name: "Online Security", column: "OnlineSecurity" },
    ];

    const allSegments: SegmentData[] = [];
    for (const cat of categories) {
      const result = query(`
        SELECT
          '${cat.name}' as category,
          ${cat.column} as segment,
          COUNT(*) as total,
          SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END) as churned,
          SUM(MonthlyCharges) as revenue,
          SUM(CASE WHEN Churn = 'Yes' THEN MonthlyCharges ELSE 0 END) as revenue_at_risk
        FROM customers
        GROUP BY ${cat.column}
        ORDER BY churned DESC
      `);
      for (const r of result.rows) {
        const total = r[2] as number;
        const churned = r[3] as number;
        allSegments.push({
          category: r[0] as string,
          segment: r[1] as string,
          total,
          churned,
          churnRate: churned / total,
          revenue: r[4] as number,
          revenueAtRisk: r[5] as number,
        });
      }
    }
    return allSegments;
  }, []);

  const cohorts = useMemo<CohortRow[]>(() => {
    const result = query(`
      SELECT
        CASE
          WHEN tenure <= 6 THEN 'Cohort 1 (0-6m)'
          WHEN tenure <= 12 THEN 'Cohort 2 (7-12m)'
          WHEN tenure <= 24 THEN 'Cohort 3 (13-24m)'
          WHEN tenure <= 36 THEN 'Cohort 4 (25-36m)'
          WHEN tenure <= 48 THEN 'Cohort 5 (37-48m)'
          WHEN tenure <= 60 THEN 'Cohort 6 (49-60m)'
          ELSE 'Cohort 7 (61-72m)'
        END as cohort,
        COUNT(*) as size,
        SUM(CASE WHEN Churn = 'No' THEN 1 ELSE 0 END) as retained,
        SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END) as churned
      FROM customers
      GROUP BY cohort
      ORDER BY cohort
    `);
    return result.rows.map((r) => {
      const size = r[1] as number;
      const retained = r[2] as number;
      return {
        cohort: r[0] as string,
        size,
        retained,
        retentionRate: retained / size,
        churnRate: (r[3] as number) / size,
      };
    });
  }, []);

  const cohortMatrix = useMemo(() => {
    const result = query(`
      SELECT
        CASE
          WHEN tenure <= 6 THEN '0-6m'
          WHEN tenure <= 12 THEN '7-12m'
          WHEN tenure <= 24 THEN '13-24m'
          WHEN tenure <= 36 THEN '25-36m'
          WHEN tenure <= 48 THEN '37-48m'
          WHEN tenure <= 60 THEN '49-60m'
          ELSE '61-72m'
        END as tenure_cohort,
        Contract,
        COUNT(*) as total,
        SUM(CASE WHEN Churn = 'No' THEN 1 ELSE 0 END) as retained
      FROM customers
      GROUP BY tenure_cohort, Contract
      ORDER BY tenure_cohort, Contract
    `);

    const contracts = ["Month-to-month", "One year", "Two year"];
    const cohortsList = ["0-6m", "7-12m", "13-24m", "25-36m", "37-48m", "49-60m", "61-72m"];
    const matrix: Record<string, Record<string, number | null>> = {};
    for (const c of cohortsList) {
      matrix[c] = {};
      for (const contract of contracts) {
        const row = result.rows.find(
          (r) => r[0] === c && r[1] === contract
        );
        if (row) {
          const total = row[2] as number;
          const retained = row[3] as number;
          matrix[c][contract] = total > 0 ? retained / total : null;
        } else {
          matrix[c][contract] = null;
        }
      }
    }
    return { matrix, contracts, cohorts: cohortsList };
  }, []);

  const funnel = useMemo<FunnelStage[]>(() => {
    const result = query(`
      SELECT
        SUM(CASE WHEN PhoneService = 'Yes' THEN 1 ELSE 0 END) as phone,
        SUM(CASE WHEN InternetService != 'No' THEN 1 ELSE 0 END) as internet,
        SUM(CASE WHEN InternetService != 'No' AND (StreamingTV = 'Yes' OR StreamingMovies = 'Yes') THEN 1 ELSE 0 END) as streaming,
        SUM(CASE WHEN Churn = 'No' THEN 1 ELSE 0 END) as retained,
        COUNT(*) as total
      FROM customers
    `);
    const r = result.rows[0];
    const total = r[4] as number;
    return [
      { stage: "signed_up", label: "Signed Up", count: total },
      { stage: "phone_service", label: "Phone Service", count: r[0] as number },
      { stage: "internet_service", label: "Internet Service", count: r[1] as number },
      { stage: "streaming", label: "Streaming Add-on", count: r[2] as number },
      { stage: "retained", label: "Retained (12mo)", count: r[3] as number },
    ];
  }, []);

  const churnByMonthlyCharges = useMemo(() => {
    const result = query(`
      SELECT
        CASE
          WHEN MonthlyCharges < 25 THEN '0-25'
          WHEN MonthlyCharges < 50 THEN '25-50'
          WHEN MonthlyCharges < 75 THEN '50-75'
          WHEN MonthlyCharges < 100 THEN '75-100'
          ELSE '100+'
        END as charge_band,
        COUNT(*) as total,
        SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END) as churned
      FROM customers
      GROUP BY charge_band
      ORDER BY charge_band
    `);
    return result.rows.map((r) => {
      const total = r[1] as number;
      const churned = r[2] as number;
      return {
        band: r[0] as string,
        total,
        churned,
        churnRate: churned / total,
      };
    });
  }, []);

  return {
    summary,
    tenureChurn,
    segments,
    cohorts,
    cohortMatrix,
    funnel,
    churnByMonthlyCharges,
  };
}
