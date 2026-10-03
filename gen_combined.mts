import { readFileSync, writeFileSync } from "fs";

const batches: string[] = JSON.parse(readFileSync("small_batches.json", "utf8"));

// Combine 5 batches at a time (500 rows)
const combined: string[] = [];
for (let i = 0; i < batches.length; i += 5) {
  combined.push(batches.slice(i, i + 5).join("\n"));
}

writeFileSync("combined_batches.json", JSON.stringify(combined));
console.log(`Created ${combined.length} combined batches, avg size: ${Math.round(combined.reduce((s, b) => s + b.length, 0) / combined.length)}`);
