/*
# Create customers table for ChurnLens analytics

## Overview
Creates the core `customers` table that stores telecom customer records
for the ChurnLens churn analysis dashboard. This is a single-tenant app
with no authentication — all data is intentionally public/shared so the
anon-key frontend can read it directly.

## New Tables
- `customers` — one row per customer, mirroring the IBM Telco Churn dataset schema:
  - `customer_id` (text, primary key) — unique customer identifier (e.g. "C-0001")
  - `gender` (text) — "Male" or "Female"
  - `senior_citizen` (int) — 0 or 1
  - `partner` (text) — "Yes" or "No"
  - `dependents` (text) — "Yes" or "No"
  - `tenure` (int) — months of service, 1–72
  - `phone_service` (text) — "Yes" or "No"
  - `multiple_lines` (text) — "No", "Yes", or "No phone service"
  - `internet_service` (text) — "DSL", "Fiber optic", or "No"
  - `online_security` (text) — "Yes", "No", or "No internet service"
  - `online_backup` (text) — same enum as online_security
  - `device_protection` (text) — same enum
  - `tech_support` (text) — same enum
  - `streaming_tv` (text) — same enum
  - `streaming_movies` (text) — same enum
  - `contract` (text) — "Month-to-month", "One year", or "Two year"
  - `paperless_billing` (text) — "Yes" or "No"
  - `payment_method` (text) — one of four payment method strings
  - `monthly_charges` (numeric) — monthly bill amount
  - `total_charges` (numeric) — cumulative charges
  - `churn` (text) — "Yes" or "No"
  - `created_at` (timestamptz) — row insertion timestamp

## Security
- RLS enabled on `customers`.
- Four policies (SELECT/INSERT/UPDATE/DELETE) scoped to `anon, authenticated`
  with `USING (true)` / `WITH CHECK (true)` because this is a single-tenant
  app with no sign-in screen and the data is intentionally public.

## Indexes
- `idx_customers_churn` on `churn` — every dashboard query filters on this column.
- `idx_customers_contract` on `contract` — segment and cohort queries group by this.
- `idx_customers_internet_service` on `internet_service` — segment queries.
- `idx_customers_tenure` on `tenure` — cohort bucketing.
*/

CREATE TABLE IF NOT EXISTS customers (
  customer_id        text PRIMARY KEY,
  gender             text NOT NULL,
  senior_citizen     int  NOT NULL,
  partner            text NOT NULL,
  dependents         text NOT NULL,
  tenure             int  NOT NULL,
  phone_service      text NOT NULL,
  multiple_lines     text NOT NULL,
  internet_service   text NOT NULL,
  online_security    text NOT NULL,
  online_backup      text NOT NULL,
  device_protection  text NOT NULL,
  tech_support       text NOT NULL,
  streaming_tv       text NOT NULL,
  streaming_movies   text NOT NULL,
  contract           text NOT NULL,
  paperless_billing  text NOT NULL,
  payment_method     text NOT NULL,
  monthly_charges    numeric(10,2) NOT NULL,
  total_charges      numeric(12,2) NOT NULL,
  churn              text NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_churn            ON customers (churn);
CREATE INDEX IF NOT EXISTS idx_customers_contract         ON customers (contract);
CREATE INDEX IF NOT EXISTS idx_customers_internet_service ON customers (internet_service);
CREATE INDEX IF NOT EXISTS idx_customers_tenure           ON customers (tenure);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_customers" ON customers;
CREATE POLICY "anon_select_customers"
  ON customers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_customers" ON customers;
CREATE POLICY "anon_insert_customers"
  ON customers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_customers" ON customers;
CREATE POLICY "anon_update_customers"
  ON customers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_customers" ON customers;
CREATE POLICY "anon_delete_customers"
  ON customers FOR DELETE
  TO anon, authenticated USING (true);
