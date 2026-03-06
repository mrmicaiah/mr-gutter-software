const API_URL = import.meta.env.VITE_API_URL || 'https://mr-gutter-software.micaiah-tasks.workers.dev';

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const config = {
      headers: { 
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers 
      },
      ...options,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);
    
    // Handle 401 - clear token and redirect to login
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Session expired');
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  login(email, password) {
    return this.request('/auth/login', { method: 'POST', body: { email, password } });
  }
  verifyToken() {
    return this.request('/auth/verify');
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

  // Alice AI
  askAlice(data) { return this.request('/alice', { method: 'POST', body: data }); }
}

export default new ApiClient();
