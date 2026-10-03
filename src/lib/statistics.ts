// Statistics library for A/B test calculator

// Normal CDF using the error function approximation
function normalCdf(x: number, mean = 0, stdDev = 1): number {
  const z = (x - mean) / (stdDev * Math.SQRT2);
  const t = 1 / (1 + 0.3275911 * Math.abs(z));
  const erf =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t -
      0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-z * z);
  return 0.5 * (1 + (z >= 0 ? erf : -erf));
}

// Inverse normal CDF (quantile function) using Beasley-Springer-Moro
function invNorm(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;

  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549726516986094, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number;
  let r: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q +
        c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r +
        a[5]) *
        q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return (
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q +
        c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
}

export interface ABTestInput {
  controlCount: number;
  controlConversions: number;
  treatmentCount: number;
  treatmentConversions: number;
}

export interface ABTestResult {
  controlRate: number;
  treatmentRate: number;
  absoluteDifference: number;
  relativeDifference: number;
  pooledProportion: number;
  standardError: number;
  zScore: number;
  pValue: number;
  isSignificant: boolean;
  confidenceLevel: number;
  ciLower: number;
  ciUpper: number;
  power: number;
}

export function runABTest(
  input: ABTestInput,
  confidenceLevel = 0.95
): ABTestResult {
  const { controlCount, controlConversions, treatmentCount, treatmentConversions } = input;

  const controlRate = controlConversions / controlCount;
  const treatmentRate = treatmentConversions / treatmentCount;
  const absoluteDifference = treatmentRate - controlRate;
  const relativeDifference =
    controlRate !== 0 ? absoluteDifference / controlRate : 0;

  const pooledProportion =
    (controlConversions + treatmentConversions) /
    (controlCount + treatmentCount);

  const standardError = Math.sqrt(
    pooledProportion * (1 - pooledProportion) * (1 / controlCount + 1 / treatmentCount)
  );

  const zScore = standardError > 0 ? absoluteDifference / standardError : 0;
  const pValue = 2 * (1 - normalCdf(Math.abs(zScore)));

  const alpha = 1 - confidenceLevel;
  const isSignificant = pValue < alpha;

  const zCritical = invNorm(1 - alpha / 2);
  const ciLower = absoluteDifference - zCritical * standardError;
  const ciUpper = absoluteDifference + zCritical * standardError;

  const effectSize = Math.abs(absoluteDifference);
  const power = effectSize > 0 && standardError > 0
    ? 1 - normalCdf(zCritical - effectSize / standardError) +
      normalCdf(-zCritical - effectSize / standardError)
    : 0;

  return {
    controlRate,
    treatmentRate,
    absoluteDifference,
    relativeDifference,
    pooledProportion,
    standardError,
    zScore,
    pValue,
    isSignificant,
    confidenceLevel,
    ciLower,
    ciUpper,
    power,
  };
}

export interface SampleSizeInput {
  baselineRate: number;
  minimumDetectableEffect: number;
  confidenceLevel: number;
  statisticalPower: number;
  alternative: "two-sided" | "one-sided";
}

export interface SampleSizeResult {
  sampleSizePerGroup: number;
  totalSampleSize: number;
  zAlpha: number;
  zBeta: number;
}

export function calculateSampleSize(input: SampleSizeInput): SampleSizeResult {
  const {
    baselineRate,
    minimumDetectableEffect,
    confidenceLevel,
    statisticalPower,
    alternative,
  } = input;

  const alpha = 1 - confidenceLevel;
  const zAlpha =
    alternative === "two-sided"
      ? invNorm(1 - alpha / 2)
      : invNorm(1 - alpha);
  const zBeta = invNorm(statisticalPower);

  const p1 = baselineRate;
  const p2 = baselineRate + minimumDetectableEffect;

  const pBar = (p1 + p2) / 2;
  const qBar = 1 - pBar;

  const n =
    (zAlpha * Math.sqrt(2 * pBar * qBar) +
      zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2 /
    (p2 - p1) ** 2;

  const sampleSizePerGroup = Math.ceil(n);

  return {
    sampleSizePerGroup,
    totalSampleSize: sampleSizePerGroup * 2,
    zAlpha,
    zBeta,
  };
}

export function formatPValue(p: number): string {
  if (p < 0.0001) return "< 0.0001";
  return p.toFixed(4);
}

export function formatPercent(v: number, decimals = 1): string {
  return `${(v * 100).toFixed(decimals)}%`;
}

export function formatCurrency(v: number, decimals = 0): string {
  return `$${v.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
