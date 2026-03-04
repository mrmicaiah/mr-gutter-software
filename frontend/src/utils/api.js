// API Configuration
// Update this URL after deploying your Cloudflare Worker
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mr-gutter-worker.YOUR_SUBDOMAIN.workers.dev';

/**
 * API Error class for structured error handling
 */
class APIError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Base fetch wrapper with error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new APIError(
        data.error || 'An error occurred',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    // Network error or other issues
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new APIError('Network error. Please check your connection.', 0);
    }
    
    throw new APIError(error.message || 'An unexpected error occurred', 500);
  }
}

/**
 * API methods organized by resource
 */
export const api = {
  // Jobs
  jobs: {
    list: (params = {}) => {
      const query = new URLSearchParams();
      if (params.start_date) query.append('start_date', params.start_date);
      if (params.end_date) query.append('end_date', params.end_date);
      if (params.zipcode) query.append('zipcode', params.zipcode);
      const queryString = query.toString();
      return request(`/jobs${queryString ? `?${queryString}` : ''}`);
    },
    
    get: (id) => request(`/jobs/${id}`),
    
    create: (job) => request('/jobs', {
      method: 'POST',
      body: JSON.stringify(job),
    }),
    
    update: (id, job) => request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(job),
    }),
    
    delete: (id) => request(`/jobs/${id}`, {
      method: 'DELETE',
    }),
  },

  // Goals
  goals: {
    get: (year) => request(`/goals/${year}`),
    
    set: (year, goals) => request(`/goals/${year}`, {
      method: 'PUT',
      body: JSON.stringify(goals),
    }),
  },

  // Stats
  stats: {
    summary: () => request('/stats/summary'),
    
    zipcodes: (params = {}) => {
      const query = new URLSearchParams();
      if (params.start_date) query.append('start_date', params.start_date);
      if (params.end_date) query.append('end_date', params.end_date);
      const queryString = query.toString();
      return request(`/stats/zipcodes${queryString ? `?${queryString}` : ''}`);
    },
  },

  // Health check
  health: () => request('/'),
};

/**
 * Helper to format currency
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
}

/**
 * Helper to format date
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Helper to format date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(date = new Date()) {
  return date.toISOString().split('T')[0];
}

export { APIError };
export default api;