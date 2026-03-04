# Mr Gutter Production Tracker - Backend API

A Cloudflare Worker with D1 database for tracking gutter installation jobs, profitability, and goals.

## Prerequisites

- Node.js 18+
- Cloudflare account
- Wrangler CLI (`npm install -g wrangler`)

## Quick Start

### 1. Install Dependencies

```bash
cd worker
npm install
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Create the D1 Database

```bash
wrangler d1 create mr-gutter-db
```

**Important:** Copy the `database_id` from the output and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "mr-gutter-db"
database_id = "YOUR_ACTUAL_DATABASE_ID"  # <-- Replace this!
```

### 4. Initialize the Database Schema

For production:
```bash
wrangler d1 execute mr-gutter-db --file=./schema.sql
```

For local development:
```bash
wrangler d1 execute mr-gutter-db --local --file=./schema.sql
```

### 5. Deploy

```bash
wrangler deploy
```

Your API will be available at: `https://mr-gutter-worker.<your-subdomain>.workers.dev`

## Local Development

```bash
npm run dev
```

This starts a local server at `http://localhost:8787`

---

## API Reference

### Base URL

- **Production:** `https://mr-gutter-worker.<your-subdomain>.workers.dev`
- **Local:** `http://localhost:8787`

---

### Jobs Endpoints

#### List Jobs
```
GET /jobs
GET /jobs?start_date=2024-01-01&end_date=2024-12-31&zipcode=35801
```

**Query Parameters:**
- `start_date` (optional) - Filter jobs on or after this date (YYYY-MM-DD)
- `end_date` (optional) - Filter jobs on or before this date (YYYY-MM-DD)
- `zipcode` (optional) - Filter by zipcode

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "client_name": "John Smith",
      "phone": "256-555-1234",
      "zipcode": "35801",
      "full_price": 2500.00,
      "material_cost": 800.00,
      "workers_cost": 600.00,
      "profit": 1100.00,
      "job_date": "2024-03-01",
      "created_at": "2024-03-01T10:00:00Z",
      "updated_at": "2024-03-01T10:00:00Z"
    }
  ]
}
```

#### Get Single Job
```
GET /jobs/:id
```

#### Create Job
```
POST /jobs
Content-Type: application/json

{
  "client_name": "John Smith",
  "phone": "256-555-1234",
  "zipcode": "35801",
  "full_price": 2500.00,
  "material_cost": 800.00,
  "workers_cost": 600.00,
  "job_date": "2024-03-01"
}
```

**Required Fields:** `client_name`, `zipcode`, `full_price`, `material_cost`, `workers_cost`, `job_date`

#### Update Job
```
PUT /jobs/:id
Content-Type: application/json

{
  "full_price": 2800.00,
  "material_cost": 900.00
}
```

#### Delete Job
```
DELETE /jobs/:id
```

---

### Goals Endpoints

#### Get Goals for Year
```
GET /goals/2024
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "year": 2024,
    "yearly_target": 500000.00,
    "distribution_mode": "even",
    "jan": 41666.67,
    "feb": 41666.67,
    ...
  }
}
```

#### Set Goals for Year
```
PUT /goals/2024
Content-Type: application/json

{
  "yearly_target": 500000.00,
  "distribution_mode": "even"
}
```

**Distribution Modes:**
- `even` - Divides yearly target equally across 12 months
- `custom` - Uses provided monthly values (jan, feb, mar, etc.)

**Custom Distribution Example:**
```json
{
  "yearly_target": 500000.00,
  "distribution_mode": "custom",
  "jan": 30000,
  "feb": 35000,
  "mar": 45000,
  ...
}
```

---

### Stats Endpoints

#### Summary Stats
```
GET /stats/summary
```

Returns production and profit totals for current week, month, quarter, and year.

**Response:**
```json
{
  "success": true,
  "data": {
    "week": {
      "start_date": "2024-03-03",
      "job_count": 5,
      "total_production": 12500.00,
      "total_profit": 5500.00,
      "avg_profit_per_job": 1100.00
    },
    "month": {
      "start_date": "2024-03-01",
      "job_count": 12,
      "total_production": 32000.00,
      "total_profit": 14000.00,
      "avg_profit_per_job": 1166.67
    },
    "quarter": {
      "start_date": "2024-01-01",
      "job_count": 45,
      "total_production": 125000.00,
      "total_profit": 55000.00,
      "avg_profit_per_job": 1222.22
    },
    "year": {
      "start_date": "2024-01-01",
      "job_count": 45,
      "total_production": 125000.00,
      "total_profit": 55000.00,
      "avg_profit_per_job": 1222.22,
      "goal": 500000.00,
      "progress_percent": "25.00"
    }
  }
}
```

#### Stats by Zipcode
```
GET /stats/zipcodes
GET /stats/zipcodes?start_date=2024-01-01&end_date=2024-03-31
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "zipcode": "35801",
      "job_count": 15,
      "total_production": 45000.00,
      "total_profit": 19500.00,
      "avg_profit": 1300.00,
      "avg_job_size": 3000.00
    },
    {
      "zipcode": "35802",
      "job_count": 10,
      "total_production": 28000.00,
      "total_profit": 12000.00,
      "avg_profit": 1200.00,
      "avg_job_size": 2800.00
    }
  ]
}
```

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Server Error

---

## CORS

CORS is enabled for all origins. The API can be called from any frontend domain.

---

## File Structure

```
worker/
├── src/
│   └── index.ts      # Main worker code
├── schema.sql        # D1 database schema
├── wrangler.toml     # Cloudflare configuration
├── package.json
├── tsconfig.json
└── README.md
```