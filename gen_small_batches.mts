import { readFileSync, writeFileSync } from "fs";

const rows = JSON.parse(readFileSync("/tmp/cc-agent/71651223/customers.json", "utf8"));

function esc(v: string | number) {
  if (typeof v === "string") return "'" + v.replace(/'/g, "''") + "'";
  return String(v);
}

const batchSize = 100;
const batches: string[] = [];
for (let i = 0; i < rows.length; i += batchSize) {
  const batch = rows.slice(i, i + batchSize);
  const values = batch.map((r: (string | number)[]) => "(" + r.map(esc).join(",") + ")").join(",");
  const sql = `INSERT INTO customers (customer_id,gender,senior_citizen,partner,dependents,tenure,phone_service,multiple_lines,internet_service,online_security,online_backup,device_protection,tech_support,streaming_tv,streaming_movies,contract,paperless_billing,payment_method,monthly_charges,total_charges,churn) VALUES ${values} ON CONFLICT (customer_id) DO NOTHING;`;
  batches.push(sql);
}

writeFileSync("small_batches.json", JSON.stringify(batches));
console.log(`Created ${batches.length} small batches, avg size: ${Math.round(batches.reduce((s, b) => s + b.length, 0) / batches.length)}`);
