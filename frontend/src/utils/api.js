const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mr-gutter-worker.YOUR_SUBDOMAIN.workers.dev';

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new ApiError(data.error || 'An error occurred', response.status, data);
    }
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new ApiError('Unable to connect to server.', 0);
    }
    throw new ApiError(error.message || 'An unexpected error occurred', 0);
  }
}

export const api = {
  async getJobs(filters = {}) {
    const params = new URLSearchParams();
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.zipcode) params.append('zipcode', filters.zipcode);
    const query = params.toString();
    return request(`/jobs${query ? `?${query}` : ''}`);
  },
  async getJob(id) { return request(`/jobs/${id}`); },
  async createJob(job) { return request('/jobs', { method: 'POST', body: JSON.stringify(job) }); },
  async updateJob(id, updates) { return request(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(updates) }); },
  async deleteJob(id) { return request(`/jobs/${id}`, { method: 'DELETE' }); },
  async getGoals(year) { return request(`/goals/${year}`); },
  async setGoals(year, goals) { return request(`/goals/${year}`, { method: 'PUT', body: JSON.stringify(goals) }); },
  async getSummary() { return request('/stats/summary'); },
  async getZipcodeStats(filters = {}) {
    const params = new URLSearchParams();
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    const query = params.toString();
    return request(`/stats/zipcodes${query ? `?${query}` : ''}`);
  },
};

export default api;