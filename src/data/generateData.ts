import type { TelcoCustomer } from "./types";

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const pick = <T,>(rng: () => number, arr: T[]): T =>
  arr[Math.floor(rng() * arr.length)];

const yesNo = (rng: () => number, probYes: number): "Yes" | "No" =>
  rng() < probYes ? "Yes" : "No";

export function generateTelcoData(): TelcoCustomer[] {
  const rng = seededRandom(42);
  const customers: TelcoCustomer[] = [];

  for (let i = 0; i < 7043; i++) {
    const gender = pick(rng, ["Male", "Female"]) as "Male" | "Female";
    const SeniorCitizen: 0 | 1 = rng() < 0.16 ? 1 : 0;
    const Partner = yesNo(rng, 0.48);
    const Dependents = yesNo(rng, 0.3);

    const InternetService = pick(rng, [
      "Fiber optic",
      "Fiber optic",
      "DSL",
      "DSL",
      "No",
    ]) as TelcoCustomer["InternetService"];

    const PhoneService = yesNo(rng, 0.9);

    const MultipleLines: TelcoCustomer["MultipleLines"] = PhoneService === "No"
      ? "No phone service"
      : pick(rng, ["No", "Yes", "Yes"]) as TelcoCustomer["MultipleLines"];

    const noInternet = InternetService === "No" ? "No internet service" : null;

    const OnlineSecurity: TelcoCustomer["OnlineSecurity"] =
      noInternet ?? (rng() < 0.37 ? "Yes" : "No");
    const OnlineBackup: TelcoCustomer["OnlineBackup"] =
      noInternet ?? (rng() < 0.34 ? "Yes" : "No");
    const DeviceProtection: TelcoCustomer["DeviceProtection"] =
      noInternet ?? (rng() < 0.36 ? "Yes" : "No");
    const TechSupport: TelcoCustomer["TechSupport"] =
      noInternet ?? (rng() < 0.37 ? "Yes" : "No");
    const StreamingTV: TelcoCustomer["StreamingTV"] =
      noInternet ?? (rng() < 0.38 ? "Yes" : "No");
    const StreamingMovies: TelcoCustomer["StreamingMovies"] =
      noInternet ?? (rng() < 0.39 ? "Yes" : "No");

    const Contract = pick(rng, [
      "Month-to-month",
      "Month-to-month",
      "Month-to-month",
      "One year",
      "Two year",
    ]) as TelcoCustomer["Contract"];

    const PaperlessBilling = yesNo(rng, 0.59);
    const PaymentMethod = pick(rng, [
      "Electronic check",
      "Electronic check",
      "Mailed check",
      "Bank transfer (automatic)",
      "Credit card (automatic)",
    ]) as TelcoCustomer["PaymentMethod"];

    const baseMonthly =
      InternetService === "Fiber optic"
        ? 70 + rng() * 50
        : InternetService === "DSL"
          ? 35 + rng() * 35
          : 18 + rng() * 15;

    const addons =
      (OnlineSecurity === "Yes" ? 5 : 0) +
      (OnlineBackup === "Yes" ? 5 : 0) +
      (DeviceProtection === "Yes" ? 5 : 0) +
      (TechSupport === "Yes" ? 5 : 0) +
      (StreamingTV === "Yes" ? 8 : 0) +
      (StreamingMovies === "Yes" ? 8 : 0) +
      (MultipleLines === "Yes" ? 10 : 0);

    const MonthlyCharges = Math.round((baseMonthly + addons) * 100) / 100;

    let tenure: number;
    if (Contract === "Month-to-month") {
      tenure = Math.floor(rng() * 30) + 1;
      if (rng() < 0.15) tenure = Math.floor(rng() * 72) + 1;
    } else if (Contract === "One year") {
      tenure = Math.floor(rng() * 60) + 12;
    } else {
      tenure = Math.floor(rng() * 72) + 24;
    }
    tenure = Math.min(tenure, 72);

    const TotalCharges = Math.round(tenure * MonthlyCharges * 100) / 100;

    let churnProb = 0.2;
    if (Contract === "Month-to-month") churnProb += 0.25;
    if (Contract === "One year") churnProb -= 0.1;
    if (Contract === "Two year") churnProb -= 0.18;
    if (InternetService === "Fiber optic") churnProb += 0.1;
    if (InternetService === "No") churnProb -= 0.1;
    if (PaymentMethod === "Electronic check") churnProb += 0.08;
    if (SeniorCitizen === 1) churnProb += 0.05;
    if (PaperlessBilling === "Yes") churnProb += 0.05;
    if (tenure < 12) churnProb += 0.15;
    if (tenure > 36) churnProb -= 0.1;
    if (OnlineSecurity === "Yes") churnProb -= 0.05;
    if (TechSupport === "Yes") churnProb -= 0.05;
    if (Dependents === "Yes") churnProb -= 0.05;
    if (Partner === "Yes") churnProb -= 0.03;
    churnProb = Math.max(0.02, Math.min(0.85, churnProb));

    const Churn: "Yes" | "No" = rng() < churnProb ? "Yes" : "No";

    customers.push({
      customerID: `C-${String(i + 1).padStart(4, "0")}`,
      gender,
      SeniorCitizen,
      Partner,
      Dependents,
      tenure,
      PhoneService,
      MultipleLines,
      InternetService,
      OnlineSecurity,
      OnlineBackup,
      DeviceProtection,
      TechSupport,
      StreamingTV,
      StreamingMovies,
      Contract,
      PaperlessBilling,
      PaymentMethod,
      MonthlyCharges,
      TotalCharges,
      Churn,
    });
  }

  return customers;
}
