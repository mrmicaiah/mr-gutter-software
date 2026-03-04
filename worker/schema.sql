-- Mr Gutter Production Tracker - D1 Database Schema
-- Run this with: wrangler d1 execute mr-gutter-db --file=./schema.sql

-- Jobs table - tracks individual gutter installation jobs
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  phone TEXT,
  zipcode TEXT NOT NULL,
  full_price REAL NOT NULL,
  material_cost REAL NOT NULL,
  workers_cost REAL NOT NULL,
  profit REAL GENERATED ALWAYS AS (full_price - material_cost - workers_cost) STORED,
  job_date TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Goals table - tracks yearly production/profit targets
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  year INTEGER NOT NULL UNIQUE,
  yearly_target REAL NOT NULL,
  distribution_mode TEXT DEFAULT 'even' CHECK (distribution_mode IN ('even', 'custom')),
  jan REAL,
  feb REAL,
  mar REAL,
  apr REAL,
  may REAL,
  jun REAL,
  jul REAL,
  aug REAL,
  sep REAL,
  oct REAL,
  nov REAL,
  dec REAL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_jobs_date ON jobs(job_date);
CREATE INDEX IF NOT EXISTS idx_jobs_zipcode ON jobs(zipcode);
CREATE INDEX IF NOT EXISTS idx_goals_year ON goals(year);