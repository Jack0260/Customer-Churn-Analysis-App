import initSqlJs, { type Database } from "sql.js";
import type { TelcoCustomer, QueryResult } from "./types";

let dbInstance: Database | null = null;
let initPromise: Promise<Database> | null = null;

async function initDb(): Promise<Database> {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const SQL = await initSqlJs({
      locateFile: (file: string) =>
        `https://sql.js.org/dist/${file}`,
    });
    const db = new SQL.Database();

    db.run(`
      CREATE TABLE customers (
        customerID TEXT,
        gender TEXT,
        SeniorCitizen INTEGER,
        Partner TEXT,
        Dependents TEXT,
        tenure INTEGER,
        PhoneService TEXT,
        MultipleLines TEXT,
        InternetService TEXT,
        OnlineSecurity TEXT,
        OnlineBackup TEXT,
        DeviceProtection TEXT,
        TechSupport TEXT,
        StreamingTV TEXT,
        StreamingMovies TEXT,
        Contract TEXT,
        PaperlessBilling TEXT,
        PaymentMethod TEXT,
        MonthlyCharges REAL,
        TotalCharges REAL,
        Churn TEXT
      );
    `);

    return db;
  })();

  return initPromise;
}

export async function loadDatabase(
  data: TelcoCustomer[]
): Promise<Database> {
  const db = await initDb();

  const placeholders = data.map(() => "(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").join(",");
  const values: (string | number)[] = [];
  for (const c of data) {
    values.push(
      c.customerID, c.gender, c.SeniorCitizen, c.Partner, c.Dependents,
      c.tenure, c.PhoneService, c.MultipleLines, c.InternetService,
      c.OnlineSecurity, c.OnlineBackup, c.DeviceProtection, c.TechSupport,
      c.StreamingTV, c.StreamingMovies, c.Contract, c.PaperlessBilling,
      c.PaymentMethod, c.MonthlyCharges, c.TotalCharges, c.Churn
    );
  }

  const batchSize = 500;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const batchPlaceholders = batch.map(() => "(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").join(",");
    const batchValues: (string | number)[] = [];
    for (const c of batch) {
      batchValues.push(
        c.customerID, c.gender, c.SeniorCitizen, c.Partner, c.Dependents,
        c.tenure, c.PhoneService, c.MultipleLines, c.InternetService,
        c.OnlineSecurity, c.OnlineBackup, c.DeviceProtection, c.TechSupport,
        c.StreamingTV, c.StreamingMovies, c.Contract, c.PaperlessBilling,
        c.PaymentMethod, c.MonthlyCharges, c.TotalCharges, c.Churn
      );
    }
    db.run(
      `INSERT INTO customers VALUES ${batchPlaceholders}`,
      batchValues
    );
  }

  dbInstance = db;
  return db;
}

export function query(sqlText: string): QueryResult {
  if (!dbInstance) {
    return { columns: [], rows: [] };
  }
  const result = dbInstance.exec(sqlText);

  if (result.length === 0) {
    return { columns: [], rows: [] };
  }

  return {
    columns: result[0].columns,
    rows: result[0].values,
  };
}

export function getDb(): Database | null {
  return dbInstance;
}
