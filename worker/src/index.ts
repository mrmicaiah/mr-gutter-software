import { Hono } from 'hono';
import { cors } from 'hono/cors';

interface Env {
  DB: D1Database;
  ANTHROPIC_API_KEY: string;
  JWT_SECRET: string;
}

interface Job {
  id: string;
  client_name: string;
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
  estimate_amount?: number;
  stage: 'waiting' | 'estimated' | 'follow_up_1' | 'follow_up_2' | 'follow_up_3' | 'sold' | 'lost';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'user';
  created_at?: string;
}

const app = new Hono<{ Bindings: Env; Variables: { user?: User } }>();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

function generateUUID(): string { return crypto.randomUUID(); }
function now(): string { return new Date().toISOString(); }

// Simple hash function using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Simple JWT implementation
async function createToken(payload: object, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (obj: object) => btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const headerB64 = encode(header);
  const payloadB64 = encode({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }); // 7 days
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(`${headerB64}.${payloadB64}`));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

async function verifyToken(token: string, secret: string): Promise<any | null> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(`${headerB64}.${payloadB64}`));
    if (!valid) return null;
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch { return null; }
}

// Auth middleware
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  const token = authHeader.slice(7);
  const payload = await verifyToken(token, c.env.JWT_SECRET || 'mr-gutter-secret-key-2024');
  if (!payload) {
    return c.json({ success: false, error: 'Invalid or expired token' }, 401);
  }
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(payload.userId).first();
  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 401);
  }
  c.set('user', user);
  await next();
};

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
// AUTH ENDPOINTS (public)
// ============================================

app.post('/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) {
      return c.json({ success: false, error: 'Email and password required' }, 400);
    }
    
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email.toLowerCase()).first() as User | null;
    if (!user) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }
    
    const passwordHash = await hashPassword(password);
    if (passwordHash !== user.password_hash) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }
    
    const token = await createToken({ userId: user.id, email: user.email }, c.env.JWT_SECRET || 'mr-gutter-secret-key-2024');
    
    return c.json({ 
      success: true, 
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get('/auth/verify', authMiddleware, async (c) => {
  const user = c.get('user') as User;
  return c.json({ 
    success: true, 
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

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
        estimate_amount: { type: "number", description: "Estimate amount in dollars (optional)" },
        notes: { type: "string", description: "Notes about the lead (optional)" }
      },
      required: ["client_name"]
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
        full_price: { type: "number", description: "Total job price" },
        material_cost: { type: "number", description: "Material cost" },
        workers_cost: { type: "number", description: "Labor cost" },
        job_date: { type: "string", description: "Job date (YYYY-MM-DD)" }
      },
      required: ["client_name", "full_price", "material_cost", "workers_cost", "job_date"]
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
      await db.prepare(`INSERT INTO estimates (id, client_name, estimate_amount, stage, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .bind(id, input.client_name, input.estimate_amount || null, 'waiting', input.notes || null, timestamp, timestamp).run();
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
      await db.prepare(`INSERT INTO jobs (id, client_name, full_price, material_cost, workers_cost, job_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(id, input.client_name, input.full_price, input.material_cost, input.workers_cost, input.job_date, timestamp, timestamp).run();
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
// PROTECTED ROUTES
// ============================================

// Alice endpoint
app.post('/alice', authMiddleware, async (c) => {
  try {
    const body = await c.req.json<{ system: string; messages: any[] }>();
    
    if (!c.env.ANTHROPIC_API_KEY) {
      return c.json({ error: 'ANTHROPIC_API_KEY not configured' }, 500);
    }

    let messages = [...body.messages];
    
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

// Jobs endpoints
app.get('/jobs', authMiddleware, async (c) => {
  const { start_date, end_date } = c.req.query();
  let query = 'SELECT * FROM jobs WHERE 1=1';
  const params: string[] = [];
  if (start_date) { query += ' AND job_date >= ?'; params.push(start_date); }
  if (end_date) { query += ' AND job_date <= ?'; params.push(end_date); }
  query += ' ORDER BY job_date DESC';
  try {
    const result = await c.env.DB.prepare(query).bind(...params).all();
    return c.json({ success: true, data: result.results });
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

app.get('/jobs/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  try {
    const result = await c.env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(id).first();
    if (!result) return c.json({ success: false, error: 'Job not found' }, 404);
    return c.json({ success: true, data: result });
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

app.post('/jobs', authMiddleware, async (c) => {
  try {
    const body = await c.req.json<Omit<Job, 'id' | 'profit' | 'created_at' | 'updated_at'>>();
    if (!body.client_name || body.full_price === undefined || body.material_cost === undefined || body.workers_cost === undefined || !body.job_date) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }
    const id = generateUUID();
    const timestamp = now();
    await c.env.DB.prepare(`INSERT INTO jobs (id, client_name, full_price, material_cost, workers_cost, job_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, body.client_name, body.full_price, body.material_cost, body.workers_cost, body.job_date, timestamp, timestamp).run();
    const created = await c.env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(id).first();
    return c.json({ success: true, data: created }, 201);
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

app.put('/jobs/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  try {
    const existing = await c.env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(id).first();
    if (!existing) return c.json({ success: false, error: 'Job not found' }, 404);
    const body = await c.req.json<Partial<Omit<Job, 'id' | 'profit' | 'created_at' | 'updated_at'>>>();
    const timestamp = now();
    const updates: string[] = [];
    const params: (string | number | null)[] = [];
    if (body.client_name !== undefined) { updates.push('client_name = ?'); params.push(body.client_name); }
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

app.delete('/jobs/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  try {
    const existing = await c.env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(id).first();
    if (!existing) return c.json({ success: false, error: 'Job not found' }, 404);
    await c.env.DB.prepare('DELETE FROM jobs WHERE id = ?').bind(id).run();
    return c.json({ success: true, message: 'Job deleted' });
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

// Goals endpoints
app.get('/goals/:year', authMiddleware, async (c) => {
  const year = parseInt(c.req.param('year'));
  if (isNaN(year)) return c.json({ success: false, error: 'Invalid year' }, 400);
  try {
    const result = await c.env.DB.prepare('SELECT * FROM goals WHERE year = ?').bind(year).first();
    if (!result) return c.json({ success: false, error: 'Goals not found for this year' }, 404);
    return c.json({ success: true, data: result });
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

app.put('/goals/:year', authMiddleware, async (c) => {
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

// Estimates endpoints
app.get('/estimates', authMiddleware, async (c) => {
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

app.get('/estimates/stats', authMiddleware, async (c) => {
  try {
    const result = await c.env.DB.prepare(`SELECT stage, COUNT(*) as count, COALESCE(SUM(estimate_amount), 0) as total_amount FROM estimates GROUP BY stage`).all();
    return c.json({ success: true, data: result.results });
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

app.get('/estimates/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  try {
    const result = await c.env.DB.prepare('SELECT * FROM estimates WHERE id = ?').bind(id).first();
    if (!result) return c.json({ success: false, error: 'Estimate not found' }, 404);
    return c.json({ success: true, data: result });
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

app.post('/estimates', authMiddleware, async (c) => {
  try {
    const body = await c.req.json<Omit<Estimate, 'id' | 'created_at' | 'updated_at'>>();
    if (!body.client_name) return c.json({ success: false, error: 'Missing required field: client_name' }, 400);
    const id = generateUUID();
    const timestamp = now();
    await c.env.DB.prepare(`INSERT INTO estimates (id, client_name, estimate_amount, stage, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(id, body.client_name, body.estimate_amount || null, body.stage || 'waiting', body.notes || null, timestamp, timestamp).run();
    const created = await c.env.DB.prepare('SELECT * FROM estimates WHERE id = ?').bind(id).first();
    return c.json({ success: true, data: created }, 201);
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

app.put('/estimates/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  try {
    const existing = await c.env.DB.prepare('SELECT * FROM estimates WHERE id = ?').bind(id).first();
    if (!existing) return c.json({ success: false, error: 'Estimate not found' }, 404);
    const body = await c.req.json<Partial<Omit<Estimate, 'id' | 'created_at' | 'updated_at'>>>();
    const timestamp = now();
    const updates: string[] = [];
    const params: (string | number | null)[] = [];
    if (body.client_name !== undefined) { updates.push('client_name = ?'); params.push(body.client_name); }
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

app.delete('/estimates/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  try {
    const existing = await c.env.DB.prepare('SELECT * FROM estimates WHERE id = ?').bind(id).first();
    if (!existing) return c.json({ success: false, error: 'Estimate not found' }, 404);
    await c.env.DB.prepare('DELETE FROM estimates WHERE id = ?').bind(id).run();
    return c.json({ success: true, message: 'Estimate deleted' });
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

// Stats endpoints
app.get('/stats/summary', authMiddleware, async (c) => {
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

// ============================================
// HEALTH CHECK (public)
// ============================================

app.get('/', (c) => {
  return c.json({ 
    success: true, 
    message: 'Mr Gutter Production Tracker API',
    version: '2.1.0',
    endpoints: {
      auth: ['POST /auth/login', 'GET /auth/verify'],
      jobs: ['GET /jobs', 'GET /jobs/:id', 'POST /jobs', 'PUT /jobs/:id', 'DELETE /jobs/:id'],
      goals: ['GET /goals/:year', 'PUT /goals/:year'],
      estimates: ['GET /estimates', 'GET /estimates/:id', 'POST /estimates', 'PUT /estimates/:id', 'DELETE /estimates/:id', 'GET /estimates/stats'],
      stats: ['GET /stats/summary'],
      alice: ['POST /alice']
    }
  });
});

app.notFound((c) => c.json({ success: false, error: 'Not found' }, 404));
app.onError((err, c) => { console.error('Server error:', err); return c.json({ success: false, error: 'Internal server error' }, 500); });

export default app;
