import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Types
interface Env {
  DB: D1Database;
}

interface Job {
  id: string;
  client_name: string;
  phone?: string;
  zipcode: string;
  full_price: number;
  material_cost: number;
  workers_cost: number;
  profit?: number;
  job_date: string;
  created_at?: string;
  updated_at?: string;
}

interface Goal {
  id: string;
  year: number;
  yearly_target: number;
  distribution_mode: 'even' | 'custom';
  jan?: number;
  feb?: number;
  mar?: number;
  apr?: number;
  may?: number;
  jun?: number;
  jul?: number;
  aug?: number;
  sep?: number;
  oct?: number;
  nov?: number;
  dec?: number;
  created_at?: string;
  updated_at?: string;
}

// Initialize Hono app
const app = new Hono<{ Bindings: Env }>();

// CORS middleware - allow all origins for frontend access
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Helper: Generate UUID
function generateUUID(): string {
  return crypto.randomUUID();
}

// Helper: Get current ISO datetime
function now(): string {
  return new Date().toISOString();
}

// Helper: Get date boundaries for stats
function getDateBoundaries() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDay();
  const date = today.getDate();

  // Start of week (Sunday)
  const weekStart = new Date(today);
  weekStart.setDate(date - day);
  weekStart.setHours(0, 0, 0, 0);

  // Start of month
  const monthStart = new Date(year, month, 1);

  // Start of quarter
  const quarterStartMonth = Math.floor(month / 3) * 3;
  const quarterStart = new Date(year, quarterStartMonth, 1);

  // Start of year
  const yearStart = new Date(year, 0, 1);

  return {
    weekStart: weekStart.toISOString().split('T')[0],
    monthStart: monthStart.toISOString().split('T')[0],
    quarterStart: quarterStart.toISOString().split('T')[0],
    yearStart: yearStart.toISOString().split('T')[0],
    today: today.toISOString().split('T')[0],
  };
}

// ============================================
// JOBS ENDPOINTS
// ============================================

// GET /jobs - List all jobs with optional filters
app.get('/jobs', async (c) => {
  const { start_date, end_date, zipcode } = c.req.query();
  
  let query = 'SELECT * FROM jobs WHERE 1=1';
  const params: string[] = [];

  if (start_date) {
    query += ' AND job_date >= ?';
    params.push(start_date);
  }
  if (end_date) {
    query += ' AND job_date <= ?';
    params.push(end_date);
  }
  if (zipcode) {
    query += ' AND zipcode = ?';
    params.push(zipcode);
  }

  query += ' ORDER BY job_date DESC';

  try {
    const result = await c.env.DB.prepare(query).bind(...params).all();
    return c.json({ success: true, data: result.results });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// GET /jobs/:id - Get single job
app.get('/jobs/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const result = await c.env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(id).first();
    
    if (!result) {
      return c.json({ success: false, error: 'Job not found' }, 404);
    }
    
    return c.json({ success: true, data: result });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// POST /jobs - Create job
app.post('/jobs', async (c) => {
  try {
    const body = await c.req.json<Omit<Job, 'id' | 'profit' | 'created_at' | 'updated_at'>>();
    
    // Validation
    if (!body.client_name || !body.zipcode || body.full_price === undefined || 
        body.material_cost === undefined || body.workers_cost === undefined || !body.job_date) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields: client_name, zipcode, full_price, material_cost, workers_cost, job_date' 
      }, 400);
    }

    const id = generateUUID();
    const timestamp = now();

    await c.env.DB.prepare(`
      INSERT INTO jobs (id, client_name, phone, zipcode, full_price, material_cost, workers_cost, job_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      body.client_name,
      body.phone || null,
      body.zipcode,
      body.full_price,
      body.material_cost,
      body.workers_cost,
      body.job_date,
      timestamp,
      timestamp
    ).run();

    // Fetch the created job (includes computed profit)
    const created = await c.env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(id).first();
    
    return c.json({ success: true, data: created }, 201);
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// PUT /jobs/:id - Update job
app.put('/jobs/:id', async (c) => {
  const id = c.req.param('id');

  try {
    // Check if job exists
    const existing = await c.env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(id).first();
    if (!existing) {
      return c.json({ success: false, error: 'Job not found' }, 404);
    }

    const body = await c.req.json<Partial<Omit<Job, 'id' | 'profit' | 'created_at' | 'updated_at'>>>();
    const timestamp = now();

    // Build dynamic update query
    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (body.client_name !== undefined) {
      updates.push('client_name = ?');
      params.push(body.client_name);
    }
    if (body.phone !== undefined) {
      updates.push('phone = ?');
      params.push(body.phone);
    }
    if (body.zipcode !== undefined) {
      updates.push('zipcode = ?');
      params.push(body.zipcode);
    }
    if (body.full_price !== undefined) {
      updates.push('full_price = ?');
      params.push(body.full_price);
    }
    if (body.material_cost !== undefined) {
      updates.push('material_cost = ?');
      params.push(body.material_cost);
    }
    if (body.workers_cost !== undefined) {
      updates.push('workers_cost = ?');
      params.push(body.workers_cost);
    }
    if (body.job_date !== undefined) {
      updates.push('job_date = ?');
      params.push(body.job_date);
    }

    if (updates.length === 0) {
      return c.json({ success: false, error: 'No fields to update' }, 400);
    }

    updates.push('updated_at = ?');
    params.push(timestamp);
    params.push(id);

    await c.env.DB.prepare(`UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();

    // Fetch updated job
    const updated = await c.env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(id).first();
    
    return c.json({ success: true, data: updated });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// DELETE /jobs/:id - Delete job
app.delete('/jobs/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const existing = await c.env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(id).first();
    if (!existing) {
      return c.json({ success: false, error: 'Job not found' }, 404);
    }

    await c.env.DB.prepare('DELETE FROM jobs WHERE id = ?').bind(id).run();
    
    return c.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// GOALS ENDPOINTS
// ============================================

// GET /goals/:year - Get goals for year
app.get('/goals/:year', async (c) => {
  const year = parseInt(c.req.param('year'));

  if (isNaN(year)) {
    return c.json({ success: false, error: 'Invalid year' }, 400);
  }

  try {
    const result = await c.env.DB.prepare('SELECT * FROM goals WHERE year = ?').bind(year).first();
    
    if (!result) {
      return c.json({ success: false, error: 'Goals not found for this year' }, 404);
    }
    
    return c.json({ success: true, data: result });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// PUT /goals/:year - Create or update goals for year
app.put('/goals/:year', async (c) => {
  const year = parseInt(c.req.param('year'));

  if (isNaN(year)) {
    return c.json({ success: false, error: 'Invalid year' }, 400);
  }

  try {
    const body = await c.req.json<Omit<Goal, 'id' | 'year' | 'created_at' | 'updated_at'>>();

    if (body.yearly_target === undefined) {
      return c.json({ success: false, error: 'yearly_target is required' }, 400);
    }

    const timestamp = now();
    const existing = await c.env.DB.prepare('SELECT * FROM goals WHERE year = ?').bind(year).first();

    // Calculate monthly distribution if mode is 'even'
    let monthlyValues = {
      jan: body.jan, feb: body.feb, mar: body.mar, apr: body.apr,
      may: body.may, jun: body.jun, jul: body.jul, aug: body.aug,
      sep: body.sep, oct: body.oct, nov: body.nov, dec: body.dec
    };

    if (body.distribution_mode === 'even' || !body.distribution_mode) {
      const evenAmount = body.yearly_target / 12;
      monthlyValues = {
        jan: evenAmount, feb: evenAmount, mar: evenAmount, apr: evenAmount,
        may: evenAmount, jun: evenAmount, jul: evenAmount, aug: evenAmount,
        sep: evenAmount, oct: evenAmount, nov: evenAmount, dec: evenAmount
      };
    }

    if (existing) {
      // Update existing
      await c.env.DB.prepare(`
        UPDATE goals SET 
          yearly_target = ?, distribution_mode = ?,
          jan = ?, feb = ?, mar = ?, apr = ?, may = ?, jun = ?,
          jul = ?, aug = ?, sep = ?, oct = ?, nov = ?, dec = ?,
          updated_at = ?
        WHERE year = ?
      `).bind(
        body.yearly_target,
        body.distribution_mode || 'even',
        monthlyValues.jan, monthlyValues.feb, monthlyValues.mar, monthlyValues.apr,
        monthlyValues.may, monthlyValues.jun, monthlyValues.jul, monthlyValues.aug,
        monthlyValues.sep, monthlyValues.oct, monthlyValues.nov, monthlyValues.dec,
        timestamp,
        year
      ).run();
    } else {
      // Create new
      const id = generateUUID();
      await c.env.DB.prepare(`
        INSERT INTO goals (id, year, yearly_target, distribution_mode, 
          jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec,
          created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, year, body.yearly_target, body.distribution_mode || 'even',
        monthlyValues.jan, monthlyValues.feb, monthlyValues.mar, monthlyValues.apr,
        monthlyValues.may, monthlyValues.jun, monthlyValues.jul, monthlyValues.aug,
        monthlyValues.sep, monthlyValues.oct, monthlyValues.nov, monthlyValues.dec,
        timestamp, timestamp
      ).run();
    }

    const result = await c.env.DB.prepare('SELECT * FROM goals WHERE year = ?').bind(year).first();
    return c.json({ success: true, data: result });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// STATS ENDPOINTS
// ============================================

// GET /stats/summary - Week/month/quarter/year totals
app.get('/stats/summary', async (c) => {
  const dates = getDateBoundaries();

  try {
    // Helper to get stats for a date range
    const getStats = async (startDate: string) => {
      const result = await c.env.DB.prepare(`
        SELECT 
          COUNT(*) as job_count,
          COALESCE(SUM(full_price), 0) as total_production,
          COALESCE(SUM(profit), 0) as total_profit,
          COALESCE(AVG(profit), 0) as avg_profit_per_job
        FROM jobs 
        WHERE job_date >= ?
      `).bind(startDate).first();
      return result;
    };

    const [weekStats, monthStats, quarterStats, yearStats] = await Promise.all([
      getStats(dates.weekStart),
      getStats(dates.monthStart),
      getStats(dates.quarterStart),
      getStats(dates.yearStart),
    ]);

    // Get goal for current year
    const currentYear = new Date().getFullYear();
    const goal = await c.env.DB.prepare('SELECT * FROM goals WHERE year = ?').bind(currentYear).first();

    return c.json({
      success: true,
      data: {
        week: {
          start_date: dates.weekStart,
          ...weekStats
        },
        month: {
          start_date: dates.monthStart,
          ...monthStats
        },
        quarter: {
          start_date: dates.quarterStart,
          ...quarterStats
        },
        year: {
          start_date: dates.yearStart,
          ...yearStats,
          goal: goal?.yearly_target || null,
          progress_percent: goal?.yearly_target 
            ? ((yearStats?.total_production as number || 0) / (goal.yearly_target as number) * 100).toFixed(2)
            : null
        }
      }
    });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// GET /stats/zipcodes - Production & profit by zipcode
app.get('/stats/zipcodes', async (c) => {
  const { start_date, end_date } = c.req.query();

  let query = `
    SELECT 
      zipcode,
      COUNT(*) as job_count,
      SUM(full_price) as total_production,
      SUM(profit) as total_profit,
      AVG(profit) as avg_profit,
      AVG(full_price) as avg_job_size
    FROM jobs
    WHERE 1=1
  `;
  const params: string[] = [];

  if (start_date) {
    query += ' AND job_date >= ?';
    params.push(start_date);
  }
  if (end_date) {
    query += ' AND job_date <= ?';
    params.push(end_date);
  }

  query += ' GROUP BY zipcode ORDER BY total_production DESC';

  try {
    const result = await c.env.DB.prepare(query).bind(...params).all();
    return c.json({ success: true, data: result.results });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/', (c) => {
  return c.json({ 
    success: true, 
    message: 'Mr Gutter Production Tracker API',
    version: '1.0.0',
    endpoints: {
      jobs: ['GET /jobs', 'GET /jobs/:id', 'POST /jobs', 'PUT /jobs/:id', 'DELETE /jobs/:id'],
      goals: ['GET /goals/:year', 'PUT /goals/:year'],
      stats: ['GET /stats/summary', 'GET /stats/zipcodes']
    }
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({ success: false, error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ success: false, error: 'Internal server error' }, 500);
});

export default app;