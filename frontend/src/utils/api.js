const API_URL = import.meta.env.VITE_API_URL || 'https://mr-gutter-software.micaiah-tasks.workers.dev';

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const config = {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Jobs
  getJobs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/jobs${query ? `?${query}` : ''}`);
  }
  getJob(id) { return this.request(`/jobs/${id}`); }
  createJob(data) { return this.request('/jobs', { method: 'POST', body: data }); }
  updateJob(id, data) { return this.request(`/jobs/${id}`, { method: 'PUT', body: data }); }
  deleteJob(id) { return this.request(`/jobs/${id}`, { method: 'DELETE' }); }

  // Goals
  getGoals(year) { return this.request(`/goals/${year}`); }
  setGoals(year, data) { return this.request(`/goals/${year}`, { method: 'PUT', body: data }); }

  // Stats
  getSummary() { return this.request('/stats/summary'); }
  getZipcodeStats() { return this.request('/stats/zipcodes'); }

  // Estimates
  getEstimates(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/estimates${query ? `?${query}` : ''}`);
  }
  getEstimate(id) { return this.request(`/estimates/${id}`); }
  createEstimate(data) { return this.request('/estimates', { method: 'POST', body: data }); }
  updateEstimate(id, data) { return this.request(`/estimates/${id}`, { method: 'PUT', body: data }); }
  deleteEstimate(id) { return this.request(`/estimates/${id}`, { method: 'DELETE' }); }
  getEstimateStats() { return this.request('/estimates/stats'); }
}

export default new ApiClient();
