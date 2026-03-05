import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Types
interface Env {
  DB: D1Database;
  ANTHROPIC_API_KEY: string;
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
  jan?: number; feb?: number; mar?: number; apr?: number; may?: number; jun?: number;
  jul?: number; aug?: number; sep?: number; oct?: number; nov?: number; dec?: number;
  created_at?: string;
  updated_at?: string;
}

interface Estimate {
  id: string;
  client_name: string;
  phone?: string;
  zipcode: string;
  estimate_amount?: number;
  stage: 'waiting' | 'estimated' | 'follow_up_1' | 'follow_up_2' | 'follow_up_3' | 'sold' | 'lost';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

function generateUUID(): string { return crypto.randomUUID(); }
function now(): string { return new Date().toISOString(); }

function getDateBoundaries() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDay();
  const date = today.getDate();
  const weekStart = new Date(today); weekStart.setDate(date - day); weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(year, month, 1);
  const quarterStartMonth = Math.floor(month / 3) * 3;
  const quarterStart = new Date(year, quarterStartMonth, 1);
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
// ALICE AI TOOLS
// ============================================

const ALICE_TOOLS = [
  {
    name: "add_estimate",
    description: "Add a new estimate/lead to the pipeline",
    input_schema: {
      type: "object",
      properties: {
        client_name: { type: "string", description: "Customer name" },
        phone: { type: "string", description: "Phone number (optional)" },
        zipcode: { type: "string", description: "5-digit zipcode" },
        estimate_amount: { type: "number", description: "Estimate amount in dollars (optional)" },
        notes: { type: "string", description: "Notes about the lead (optional)" }
      },
      required: ["client_name", "zipcode"]
    }
  },
  {
    name: "update_estimate_stage",
    description: "Move an estimate to a different stage in the pipeline",
    input_schema: {
      type: "object",
      properties: {
        estimate_id: { type: "string", description: "Estimate ID" },
        stage: { type: "string", description: "New stage: waiting, estimated, follow_up_1, follow_up_2, follow_up_3, sold" }
      },
      required: ["estimate_id", "stage"]
    }
  },
  {
    name: "update_estimate_amount",
    description: "Update the estimate amount for a lead",
    input_schema: {
      type: "object",
      properties: {
        estimate_id: { type: "string", description: "Estimate ID" },
        amount: { type: "number", description: "New estimate amount in dollars" }
      },
      required: ["estimate_id", "amount"]
    }
  },
  {
    name: "create_job",
    description: "Create a completed job record",
    input_schema: {
      type: "object",
      properties: {
        client_name: { type: "string", description: "Customer name" },
        phone: { type: "string", description: "Phone number (optional)" },
        zipcode: { type: "string", description: "5-digit zipcode" },
        full_price: { type: "number", description: "Total job price" },
        material_cost: { type: "number", description: "Material cost" },
        workers_cost: { type: "number", description: "Labor cost" },
        job_date: { type: "string", description: "Job date (YYYY-MM-DD)" }
      },
      required: ["client_name", "zipcode", "full_price", "material_cost", "workers_cost", "job_date"]
    }
  },
  {
    name: "get_pipeline_summary",
    description: "Get a summary of the current pipeline by stage",
    input_schema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "search_estimates",
    description: "Search for estimates by client name",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search term (client name)" }
      },
      required: ["query"]
    }
  }
];

async function executeAliceTool(db: D1Database, toolName: string, input: any): Promise<any> {
  const timestamp = now();
  
  switch (toolName) {
    case 'add_estimate': {
      const id = generateUUID();
      await db.prepare(`INSERT INTO estimates (id, client_name, phone, zipcode, estimate_amount, stage, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(id, input.client_name, input.phone || null, input.zipcode, input.estimate_amount || null, 'waiting', input.notes || null, timestamp, timestamp).run();
      return { success: true, message: `Added ${input.client_name} to the pipeline`, id };
    }
    
    case 'update_estimate_stage': {
      await db.prepare(`UPDATE estimates SET stage = ?, updated_at = ? WHERE id = ?`)
        .bind(input.stage, timestamp, input.estimate_id).run();
      return { success: true, message: `Moved estimate to ${input.stage}` };
    }
    
    case 'update_estimate_amount': {
      await db.prepare(`UPDATE estimates SET estimate_amount = ?, updated_at = ? WHERE id = ?`)
        .bind(input.amount, timestamp, input.estimate_id).run();
      return { success: true, message: `Updated estimate amount to $${input.amount}` };
    }
    
    case 'create_job': {
      const id = generateUUID();
      await db.prepare(`INSERT INTO jobs (id, client_name, phone, zipcode, full_price, material_cost, workers_cost, job_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(id, input.client_name, input.phone || null, input.zipcode, input.full_price, input.material_cost, input.workers_cost, input.job_date, timestamp, timestamp).run();
      const profit = input.full_price - input.material_cost - input.workers_cost;
      return { success: true, message: `Created job for ${input.client_name} - $${profit} profit`, id };
    }
    
    case 'get_pipeline_summary': {
      const result = await db.prepare(`SELECT stage, COUNT(*) as count, COALESCE(SUM(estimate_amount), 0) as total FROM estimates WHERE stage != 'sold' GROUP BY stage`).all();
      return { success: true, data: result.results };
    }
    
    case 'search_estimates': {
      const result = await db.prepare(`SELECT * FROM estimates WHERE client_name LIKE ? ORDER BY created_at DESC LIMIT 5`)
        .bind(`%${input.query}%`).all();
      return { success: true, data: result.results };
    }
    
    default:
      return { success: false, error: 'Unknown tool' };
  }
}

// ============================================
// ALICE ENDPOINT
// ============================================

app.post('/alice', async (c) => {
  try {
    const body = await c.req.json<{ system: string; messages: any[] }>();
    
    if (!c.env.ANTHROPIC_API_KEY) {
      return c.json({ error: 'ANTHROPIC_API_KEY not configured' }, 500);
    }

    let messages = [...body.messages];
    
    // Initial API call
    let response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': c.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: body.system,
        messages: messages,
        tools: ALICE_TOOLS
      })
    });

    let data = await response.json() as any;

    // Tool execution loop
    while (data.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: data.content });
      
      const toolResults = [];
      for (const block of data.content) {
        if (block.type === 'tool_use') {
          const result = await executeAliceTool(c.env.DB, block.name, block.input);
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result)
          });
        }
      }
      
      messages.push({ role: 'user', content: toolResults });
      
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': c.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: body.system,
          messages: messages,
          tools: ALICE_TOOLS
        })
      });
      
      data = await response.json();
    }

    return c.json(data);
  } catch (error) {
    console.error('Alice error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================
// JOBS ENDPOINTS
// ============================================

app.get('/jobs', async (c) => {
  const { start_date, end_date, zipcode } = c.req.query();
  let query = 'SELECT * FROM jobs WHERE 1=1';
  const params: string[] = [];
  if (start_date) { query += ' AND job_date >= ?'; params.push(start_date); }
  if (end_date) { query += ' AND job_date <= ?'; params.push(end_date); }
  if (zipcode) { query += ' AND zipcode = ?'; params.push(zipcode); }
  query += ' ORDER BY job_date DESC';
  try {
    const result = await c.env.DB.prepare(query).bind(...params).all();
    return c.json({ success: true, data: result.results });
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

app.get('/jobs/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const result = await c.env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(id).first();
    if (!result) return c.json({ success: false, error: 'Job not found' }, 404);
    return c.json({ success: true, data: result });
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

app.post('/jobs', async (c) => {
  try {
    const body = await c.req.json<Omit<Job, 'id' | 'profit' | 'created_at' | 'updated_at'>>();
    if (!body.client_name || !body.zipcode || body.full_price === undefined || body.material_cost === undefined || body.workers_cost === undefined || !body.job_date) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }
    const id = generateUUID();
    const timestamp = now();
    await c.env.DB.prepare(`INSERT INTO jobs (id, client_name, phone, zipcode, full_price, material_cost, workers_cost, job_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, body.client_name, body.phone || null, body.zipcode, body.full_price, body.material_cost, body.workers_cost, body.job_date, timestamp, timestamp).run();
    const created = await c.env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(id).first();
    return c.json({ success: true, data: created }, 201);
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

app.put('/jobs/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const existing = await c.env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(id).first();
    if (!existing) return c.json({ success: false, error: 'Job not found' }, 404);
    const body = await c.req.json<Partial<Omit<Job, 'id' | 'profit' | 'created_at' | 'updated_at'>>>();
    const timestamp = now();
    const updates: string[] = [];
    const params: (string | number | null)[] = [];
    if (body.client_name !== undefined) { updates.push('client_name = ?'); params.push(body.client_name); }
    if (body.phone !== undefined) { updates.push('phone = ?'); params.push(body.phone); }
    if (body.zipcode !== undefined) { updates.push('zipcode = ?'); params.push(body.zipcode); }
    if (body.full_price !== undefined) { updates.push('full_price = ?'); params.push(body.full_price); }
    if (body.material_cost !== undefined) { updates.push('material_cost = ?'); params.push(body.material_cost); }
    if (body.workers_cost !== undefined) { updates.push('workers_cost = ?'); params.push(body.workers_cost); }
    if (body.job_date !== undefined) { updates.push('job_date = ?'); params.push(body.job_date); }
    if (updates.length === 0) return c.json({ success: false, error: 'No fields to update' }, 400);
    updates.push('updated_at = ?'); params.push(timestamp); params.push(id);
    await c.env.DB.prepare(`UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();
    const updated = await c.env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(id).first();
    return c.json({ success: true, data: updated });
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

app.delete('/jobs/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const existing = await c.env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(id).first();
    if (!existing) return c.json({ success: false, error: 'Job not found' }, 404);
    await c.env.DB.prepare('DELETE FROM jobs WHERE id = ?').bind(id).run();
    return c.json({ success: true, message: 'Job deleted' });
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

// ============================================
// GOALS ENDPOINTS
// ============================================

app.get('/goals/:year', async (c) => {
  const year = parseInt(c.req.param('year'));
  if (isNaN(year)) return c.json({ success: false, error: 'Invalid year' }, 400);
  try {
    const result = await c.env.DB.prepare('SELECT * FROM goals WHERE year = ?').bind(year).first();
    if (!result) return c.json({ success: false, error: 'Goals not found for this year' }, 404);
    return c.json({ success: true, data: result });
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

app.put('/goals/:year', async (c) => {
  const year = parseInt(c.req.param('year'));
  if (isNaN(year)) return c.json({ success: false, error: 'Invalid year' }, 400);
  try {
    const body = await c.req.json<Omit<Goal, 'id' | 'year' | 'created_at' | 'updated_at'>>();
    if (body.yearly_target === undefined) return c.json({ success: false, error: 'yearly_target is required' }, 400);
    const timestamp = now();
    const existing = await c.env.DB.prepare('SELECT * FROM goals WHERE year = ?').bind(year).first();
    let monthlyValues = { jan: body.jan, feb: body.feb, mar: body.mar, apr: body.apr, may: body.may, jun: body.jun, jul: body.jul, aug: body.aug, sep: body.sep, oct: body.oct, nov: body.nov, dec: body.dec };
    if (body.distribution_mode === 'even' || !body.distribution_mode) {
      const evenAmount = body.yearly_target / 12;
      monthlyValues = { jan: evenAmount, feb: evenAmount, mar: evenAmount, apr: evenAmount, may: evenAmount, jun: evenAmount, jul: evenAmount, aug: evenAmount, sep: evenAmount, oct: evenAmount, nov: evenAmount, dec: evenAmount };
    }
    if (existing) {
      await c.env.DB.prepare(`UPDATE goals SET yearly_target = ?, distribution_mode = ?, jan = ?, feb = ?, mar = ?, apr = ?, may = ?, jun = ?, jul = ?, aug = ?, sep = ?, oct = ?, nov = ?, dec = ?, updated_at = ? WHERE year = ?`).bind(body.yearly_target, body.distribution_mode || 'even', monthlyValues.jan, monthlyValues.feb, monthlyValues.mar, monthlyValues.apr, monthlyValues.may, monthlyValues.jun, monthlyValues.jul, monthlyValues.aug, monthlyValues.sep, monthlyValues.oct, monthlyValues.nov, monthlyValues.dec, timestamp, year).run();
    } else {
      const id = generateUUID();
      await c.env.DB.prepare(`INSERT INTO goals (id, year, yearly_target, distribution_mode, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, year, body.yearly_target, body.distribution_mode || 'even', monthlyValues.jan, monthlyValues.feb, monthlyValues.mar, monthlyValues.apr, monthlyValues.may, monthlyValues.jun, monthlyValues.jul, monthlyValues.aug, monthlyValues.sep, monthlyValues.oct, monthlyValues.nov, monthlyValues.dec, timestamp, timestamp).run();
    }
    const result = await c.env.DB.prepare('SELECT * FROM goals WHERE year = ?').bind(year).first();
    return c.json({ success: true, data: result });
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

// ============================================
// ESTIMATES ENDPOINTS
// ============================================

app.get('/estimates', async (c) => {
  const { stage } = c.req.query();
  let query = 'SELECT * FROM estimates WHERE 1=1';
  const params: string[] = [];
  if (stage) { query += ' AND stage = ?'; params.push(stage); }
  query += ' ORDER BY created_at DESC';
  try {
    const result = await c.env.DB.prepare(query).bind(...params).all();
    return c.json({ success: true, data: result.results });
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

app.get('/estimates/stats', async (c) => {
  try {
    const result = await c.env.DB.prepare(`SELECT stage, COUNT(*) as count, COALESCE(SUM(estimate_amount), 0) as total_amount FROM estimates GROUP BY stage`).all();
    return c.json({ success: true, data: result.results });
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

app.get('/estimates/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const result = await c.env.DB.prepare('SELECT * FROM estimates WHERE id = ?').bind(id).first();
    if (!result) return c.json({ success: false, error: 'Estimate not found' }, 404);
    return c.json({ success: true, data: result });
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

app.post('/estimates', async (c) => {
  try {
    const body = await c.req.json<Omit<Estimate, 'id' | 'created_at' | 'updated_at'>>();
    if (!body.client_name || !body.zipcode) return c.json({ success: false, error: 'Missing required fields: client_name, zipcode' }, 400);
    const id = generateUUID();
    const timestamp = now();
    await c.env.DB.prepare(`INSERT INTO estimates (id, client_name, phone, zipcode, estimate_amount, stage, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, body.client_name, body.phone || null, body.zipcode, body.estimate_amount || null, body.stage || 'waiting', body.notes || null, timestamp, timestamp).run();
    const created = await c.env.DB.prepare('SELECT * FROM estimates WHERE id = ?').bind(id).first();
    return c.json({ success: true, data: created }, 201);
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

app.put('/estimates/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const existing = await c.env.DB.prepare('SELECT * FROM estimates WHERE id = ?').bind(id).first();
    if (!existing) return c.json({ success: false, error: 'Estimate not found' }, 404);
    const body = await c.req.json<Partial<Omit<Estimate, 'id' | 'created_at' | 'updated_at'>>>();
    const timestamp = now();
    const updates: string[] = [];
    const params: (string | number | null)[] = [];
    if (body.client_name !== undefined) { updates.push('client_name = ?'); params.push(body.client_name); }
    if (body.phone !== undefined) { updates.push('phone = ?'); params.push(body.phone); }
    if (body.zipcode !== undefined) { updates.push('zipcode = ?'); params.push(body.zipcode); }
    if (body.estimate_amount !== undefined) { updates.push('estimate_amount = ?'); params.push(body.estimate_amount); }
    if (body.stage !== undefined) { updates.push('stage = ?'); params.push(body.stage); }
    if (body.notes !== undefined) { updates.push('notes = ?'); params.push(body.notes); }
    if (updates.length === 0) return c.json({ success: false, error: 'No fields to update' }, 400);
    updates.push('updated_at = ?'); params.push(timestamp); params.push(id);
    await c.env.DB.prepare(`UPDATE estimates SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();
    const updated = await c.env.DB.prepare('SELECT * FROM estimates WHERE id = ?').bind(id).first();
    return c.json({ success: true, data: updated });
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

app.delete('/estimates/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const existing = await c.env.DB.prepare('SELECT * FROM estimates WHERE id = ?').bind(id).first();
    if (!existing) return c.json({ success: false, error: 'Estimate not found' }, 404);
    await c.env.DB.prepare('DELETE FROM estimates WHERE id = ?').bind(id).run();
    return c.json({ success: true, message: 'Estimate deleted' });
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

// ============================================
// STATS ENDPOINTS
// ============================================

app.get('/stats/summary', async (c) => {
  const dates = getDateBoundaries();
  try {
    const getStats = async (startDate: string) => {
      const result = await c.env.DB.prepare(`SELECT COUNT(*) as job_count, COALESCE(SUM(full_price), 0) as total_production, COALESCE(SUM(profit), 0) as total_profit, COALESCE(AVG(profit), 0) as avg_profit_per_job FROM jobs WHERE job_date >= ?`).bind(startDate).first();
      return result;
    };
    const [weekStats, monthStats, quarterStats, yearStats] = await Promise.all([
      getStats(dates.weekStart), getStats(dates.monthStart), getStats(dates.quarterStart), getStats(dates.yearStart),
    ]);
    const currentYear = new Date().getFullYear();
    const goal = await c.env.DB.prepare('SELECT * FROM goals WHERE year = ?').bind(currentYear).first();
    return c.json({
      success: true,
      data: {
        week: { start_date: dates.weekStart, ...weekStats },
        month: { start_date: dates.monthStart, ...monthStats },
        quarter: { start_date: dates.quarterStart, ...quarterStats },
        year: { start_date: dates.yearStart, ...yearStats, goal: goal?.yearly_target || null, progress_percent: goal?.yearly_target ? ((yearStats?.total_production as number || 0) / (goal.yearly_target as number) * 100).toFixed(2) : null }
      }
    });
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

app.get('/stats/zipcodes', async (c) => {
  const { start_date, end_date } = c.req.query();
  let query = `SELECT zipcode, COUNT(*) as job_count, SUM(full_price) as total_production, SUM(profit) as total_profit, AVG(profit) as avg_profit, AVG(full_price) as avg_job_size FROM jobs WHERE 1=1`;
  const params: string[] = [];
  if (start_date) { query += ' AND job_date >= ?'; params.push(start_date); }
  if (end_date) { query += ' AND job_date <= ?'; params.push(end_date); }
  query += ' GROUP BY zipcode ORDER BY total_production DESC';
  try {
    const result = await c.env.DB.prepare(query).bind(...params).all();
    return c.json({ success: true, data: result.results });
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/', (c) => {
  return c.json({ 
    success: true, 
    message: 'Mr Gutter Production Tracker API',
    version: '1.2.0',
    endpoints: {
      jobs: ['GET /jobs', 'GET /jobs/:id', 'POST /jobs', 'PUT /jobs/:id', 'DELETE /jobs/:id'],
      goals: ['GET /goals/:year', 'PUT /goals/:year'],
      estimates: ['GET /estimates', 'GET /estimates/:id', 'POST /estimates', 'PUT /estimates/:id', 'DELETE /estimates/:id', 'GET /estimates/stats'],
      stats: ['GET /stats/summary', 'GET /stats/zipcodes'],
      alice: ['POST /alice']
    }
  });
});

app.notFound((c) => c.json({ success: false, error: 'Not found' }, 404));
app.onError((err, c) => { console.error('Server error:', err); return c.json({ success: false, error: 'Internal server error' }, 500); });

export default app;
