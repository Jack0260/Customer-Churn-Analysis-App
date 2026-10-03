import jsPDF from "jspdf";
import { query } from "../data/sqlEngine";
import { formatCurrency, formatPercent } from "./statistics";

interface PdfContext {
  reductionPct: number;
  months: number;
}

export function generatePdfReport(ctx: PdfContext) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = 0;

  function ensureSpace(needed: number) {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function addHeading(text: string, size = 14) {
    ensureSpace(size + 20);
    y += 10;
    doc.setFontSize(size);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 118, 110);
    doc.text(text, margin, y);
    y += size + 8;
    doc.setDrawColor(220, 230, 228);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  }

  function addParagraph(text: string, size = 10) {
    doc.setFontSize(size);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    for (const line of lines) {
      ensureSpace(size + 4);
      doc.text(line, margin, y);
      y += size + 4;
    }
  }

  function addKeyValue(key: string, value: string) {
    ensureSpace(16);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(key, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    doc.text(value, margin + 140, y);
    y += 16;
  }

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 70, "F");
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 184, 166);
  doc.text("ChurnLens", margin, 35);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("Customer Churn Analysis Report", margin, 52);
  doc.setFontSize(8);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    pageWidth - margin - 120,
    52
  );
  y = 95;

  // Executive Summary
  addHeading("Executive Summary");
  const summary = query(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END) as churned,
      SUM(MonthlyCharges) as revenue,
      SUM(CASE WHEN Churn = 'Yes' THEN MonthlyCharges ELSE 0 END) as revenue_at_risk,
      AVG(MonthlyCharges) as avg_monthly,
      AVG(tenure) as avg_tenure
    FROM customers
  `);
  if (summary.rows.length) {
    const r = summary.rows[0];
    const total = r[0] as number;
    const churned = r[1] as number;
    const revenue = r[2] as number;
    const revAtRisk = r[3] as number;
    const avgMonthly = r[4] as number;
    const avgTenure = r[5] as number;

    addParagraph(
      `This report analyzes customer churn across ${total.toLocaleString()} customers from the IBM Telco Churn dataset. The overall churn rate is ${formatPercent(churned / total)}, representing ${churned.toLocaleString()} lost customers and ${formatCurrency(revAtRisk)}/month in revenue at risk. The average customer tenure is ${avgTenure.toFixed(1)} months with an average monthly charge of ${formatCurrency(avgMonthly, 2)}.`
    );
  }

  // KPI Summary
  addHeading("Key Performance Indicators");
  if (summary.rows.length) {
    const r = summary.rows[0];
    const total = r[0] as number;
    const churned = r[1] as number;
    const revenue = r[2] as number;
    const revAtRisk = r[3] as number;
    const avgMonthly = r[4] as number;
    const avgTenure = r[5] as number;
    addKeyValue("Total Customers", total.toLocaleString());
    addKeyValue("Churned Customers", churned.toLocaleString());
    addKeyValue("Churn Rate", formatPercent(churned / total));
    addKeyValue("Total Monthly Revenue", formatCurrency(revenue));
    addKeyValue("Revenue at Risk", formatCurrency(revAtRisk));
    addKeyValue("Avg. Monthly Charges", formatCurrency(avgMonthly, 2));
    addKeyValue("Avg. Customer Tenure", `${avgTenure.toFixed(1)} months`);
  }

  // Top Churn Segments
  addHeading("Top Churn Segments");
  const segmentQueries = [
    { label: "Contract Type", sql: "Contract" },
    { label: "Payment Method", sql: "PaymentMethod" },
    { label: "Internet Service", sql: "InternetService" },
  ];
  for (const sq of segmentQueries) {
    const segResult = query(`
      SELECT ${sq.sql} as segment,
        COUNT(*) as total,
        SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END) as churned,
        SUM(CASE WHEN Churn = 'Yes' THEN MonthlyCharges ELSE 0 END) as rev_at_risk
      FROM customers GROUP BY ${sq.sql} ORDER BY churned DESC LIMIT 3
    `);
    addParagraph(`${sq.label}:`);
    for (const row of segResult.rows) {
      const segTotal = row[1] as number;
      const segChurned = row[2] as number;
      addParagraph(
        `  - ${row[0]}: ${formatPercent(segChurned / segTotal)} churn rate (${segChurned.toLocaleString()}/${segTotal.toLocaleString()} customers), ${formatCurrency(row[3] as number)}/month at risk`
      );
    }
    y += 4;
  }

  // What-If Scenario
  addHeading("What-If Scenario Analysis");
  if (summary.rows.length) {
    const r = summary.rows[0];
    const revAtRisk = r[3] as number;
    const churned = r[1] as number;
    const total = r[0] as number;
    const recoveredMonthly = (revAtRisk * ctx.reductionPct) / 100;
    const cumulative = recoveredMonthly * ctx.months;
    const newChurnRate = (churned / total) * (1 - ctx.reductionPct / 100);
    const customersSaved = Math.round(churned * (ctx.reductionPct / 100));

    addParagraph(
      `Scenario: ${ctx.reductionPct}% churn reduction over ${ctx.months} months.`
    );
    addKeyValue("Projected Churn Rate", formatPercent(newChurnRate));
    addKeyValue("Customers Saved", customersSaved.toLocaleString());
    addKeyValue("Monthly Revenue Recovered", formatCurrency(recoveredMonthly));
    addKeyValue("Cumulative Recovery", formatCurrency(cumulative));
  }

  // Recommendations
  addHeading("Business Recommendations");

  const contractResult = query(`
    SELECT Contract,
      COUNT(*) as total,
      SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END) as churned,
      SUM(CASE WHEN Churn = 'Yes' THEN MonthlyCharges ELSE 0 END) as rev_at_risk
    FROM customers GROUP BY Contract ORDER BY churned DESC
  `);
  const fiberResult = query(`
    SELECT InternetService,
      COUNT(*) as total,
      SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END) as churned,
      SUM(CASE WHEN Churn = 'Yes' THEN MonthlyCharges ELSE 0 END) as rev_at_risk
    FROM customers WHERE InternetService != 'No' GROUP BY InternetService
  `);
  const paymentResult = query(`
    SELECT PaymentMethod,
      COUNT(*) as total,
      SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END) as churned,
      SUM(CASE WHEN Churn = 'Yes' THEN MonthlyCharges ELSE 0 END) as rev_at_risk
    FROM customers GROUP BY PaymentMethod ORDER BY churned DESC
  `);

  const recommendations: { title: string; evidence: string; action: string; impact: string }[] = [];

  if (contractResult.rows.length >= 2) {
    const m2m = contractResult.rows.find((r) => r[0] === "Month-to-month");
    const twoY = contractResult.rows.find((r) => r[0] === "Two year");
    if (m2m && twoY) {
      const m2mRate = (m2m[2] as number) / (m2m[1] as number);
      const twoYRate = (twoY[2] as number) / (twoY[1] as number);
      recommendations.push({
        title: "1. Migrate Month-to-Month Customers to Annual Contracts",
        evidence: `Month-to-month churn rate is ${formatPercent(m2mRate)} vs. ${formatPercent(twoYRate)} for two-year contracts. Revenue at risk: ${formatCurrency(m2m[3] as number)}/month.`,
        action: "Offer discounts or bonus services to incentivize contract upgrades, targeting high-tenure month-to-month customers first.",
        impact: `Estimated recovery: ${formatCurrency((m2m[3] as number) * 0.15 * 0.4)}/month.`,
      });
    }
  }

  if (fiberResult.rows.length >= 1) {
    const fiber = fiberResult.rows.find((r) => r[0] === "Fiber optic");
    if (fiber) {
      const fiberRate = (fiber[2] as number) / (fiber[1] as number);
      recommendations.push({
        title: "2. Investigate Fiber Optic Service Quality",
        evidence: `Fiber optic customers churn at ${formatPercent(fiberRate)}, representing ${formatCurrency(fiber[3] as number)}/month in revenue at risk.`,
        action: "Run a targeted NPS survey for fiber customers under 12 months tenure. Assign customer success managers to high-value at-risk accounts.",
        impact: `Estimated recovery: ${formatCurrency((fiber[3] as number) * 0.2)}/month.`,
      });
    }
  }

  if (paymentResult.rows.length >= 2) {
    const eCheck = paymentResult.rows.find((r) => r[0] === "Electronic check");
    const cc = paymentResult.rows.find((r) => r[0] === "Credit card (automatic)");
    if (eCheck && cc) {
      const eRate = (eCheck[2] as number) / (eCheck[1] as number);
      const ccRate = (cc[2] as number) / (cc[1] as number);
      recommendations.push({
        title: "3. Migrate Electronic Check Customers to Auto-Pay",
        evidence: `Electronic check customers churn at ${formatPercent(eRate)} vs. ${formatPercent(ccRate)} for credit card auto-pay. Revenue at risk: ${formatCurrency(eCheck[3] as number)}/month.`,
        action: "Offer a bill credit or one-time bonus to electronic check users who switch to auto-pay. This reduces both voluntary and involuntary churn.",
        impact: `Estimated recovery: ${formatCurrency((eCheck[3] as number) * 0.3 * 0.35)}/month.`,
      });
    }
  }

  for (const rec of recommendations) {
    addParagraph(rec.title, 11);
    addParagraph(`Evidence: ${rec.evidence}`);
    addParagraph(`Action: ${rec.action}`);
    addParagraph(`Expected Impact: ${rec.impact}`);
    y += 6;
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(
      "ChurnLens - Customer Churn Analysis | Data: IBM Telco Churn Dataset (7,043 customers)",
      margin,
      pageHeight - 20
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 50, pageHeight - 20);
  }

  doc.save("churnlens-report.pdf");
}
