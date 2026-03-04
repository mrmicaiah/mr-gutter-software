import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import JobCard from '../components/JobCard';
import { LoadingSkeleton } from '../components/Loading';
import { useToast } from '../components/Toast';
import api from '../utils/api';

const PlusIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const SearchIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const FilterIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>);
const XIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const CalendarIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const RefreshIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>);
const BriefcaseIcon = () => (<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>);

export default function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', zipcode: '' });
  const { error: showError } = useToast();

  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filterParams = {};
      if (filters.startDate) filterParams.start_date = filters.startDate;
      if (filters.endDate) filterParams.end_date = filters.endDate;
      if (filters.zipcode) filterParams.zipcode = filters.zipcode;
      const response = await api.getJobs(filterParams);
      setJobs(response.data || []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError(err.message || 'Failed to load jobs');
      showError(err.message || 'Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, [filters.startDate, filters.endDate, filters.zipcode]);

  const uniqueZipcodes = useMemo(() => Array.from(new Set(jobs.map(j => j.zipcode).filter(Boolean))).sort(), [jobs]);

  const filteredJobs = useMemo(() => {
    let result = [...jobs];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(job => job.client_name?.toLowerCase().includes(query) || job.zipcode?.includes(query) || job.phone?.includes(query));
    }
    result.sort((a, b) => new Date(b.job_date) - new Date(a.job_date));
    return result;
  }, [jobs, searchQuery]);

  const hasActiveFilters = filters.startDate || filters.endDate || filters.zipcode;
  const clearFilters = () => { setFilters({ startDate: '', endDate: '', zipcode: '' }); setSearchQuery(''); };

  const totals = useMemo(() => filteredJobs.reduce((acc, job) => {
    const profit = (job.full_price || 0) - (job.material_cost || 0) - (job.workers_cost || 0);
    return { revenue: acc.revenue + (job.full_price || 0), profit: acc.profit + profit, count: acc.count + 1 };
  }, { revenue: 0, profit: 0, count: 0 }), [filteredJobs]);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto pb-24 lg:pb-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-xl font-bold tracking-wider uppercase" style={{ color: 'var(--text-primary)' }}>Jobs</h1><p style={{ color: 'var(--text-muted)' }} className="text-sm mt-1">{isLoading ? 'Loading...' : `${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''}`}</p></div>
        <Link to="/jobs/new" className="btn btn-primary hidden lg:flex"><PlusIcon />New Job</Link>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative"><div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}><SearchIcon /></div><input type="search" placeholder="Search by name, zipcode..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input pl-11" /></div>
          <button onClick={() => setShowFilters(!showFilters)} className={`btn ${showFilters || hasActiveFilters ? 'btn-primary' : 'btn-secondary'}`}><FilterIcon /><span className="hidden sm:inline">Filter</span>{hasActiveFilters && <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center" style={{ background: 'white', color: 'var(--blue)' }}>!</span>}</button>
          <button onClick={fetchJobs} disabled={isLoading} className="btn btn-secondary" title="Refresh"><RefreshIcon /></button>
        </div>

        {showFilters && (
          <div className="p-4 rounded-xl space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className="label flex items-center gap-1"><CalendarIcon /> Start Date</label><input type="date" value={filters.startDate} onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))} className="input" /></div>
              <div><label className="label flex items-center gap-1"><CalendarIcon /> End Date</label><input type="date" value={filters.endDate} onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))} className="input" /></div>
              <div><label className="label">Zipcode</label><select value={filters.zipcode} onChange={(e) => setFilters(f => ({ ...f, zipcode: e.target.value }))} className="input"><option value="">All Zipcodes</option>{uniqueZipcodes.map(zip => <option key={zip} value={zip}>{zip}</option>)}</select></div>
            </div>
            {hasActiveFilters && <button onClick={clearFilters} className="text-sm font-semibold flex items-center gap-1" style={{ color: 'var(--blue)' }}><XIcon /> Clear all filters</button>}
          </div>
        )}
      </div>

      {filteredJobs.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
          <div className="text-center"><p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Jobs</p><p className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>{totals.count}</p></div>
          <div className="text-center"><p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Revenue</p><p className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(totals.revenue)}</p></div>
          <div className="text-center"><p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Profit</p><p className="font-display font-bold" style={{ color: totals.profit >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatCurrency(totals.profit)}</p></div>
        </div>
      )}

      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
        {isLoading ? <LoadingSkeleton rows={5} /> : error ? (
          <div className="p-8 text-center"><p style={{ color: 'var(--red)' }} className="mb-4">{error}</p><button onClick={fetchJobs} className="btn btn-primary">Try Again</button></div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}><BriefcaseIcon /></div>
            <h3 className="font-display text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{searchQuery || hasActiveFilters ? 'No jobs match your filters' : 'No jobs yet'}</h3>
            <p className="mb-4" style={{ color: 'var(--text-muted)' }}>{searchQuery || hasActiveFilters ? 'Try adjusting your search or filters' : 'Get started by adding your first job'}</p>
            {searchQuery || hasActiveFilters ? <button onClick={clearFilters} className="btn btn-secondary">Clear Filters</button> : <Link to="/jobs/new" className="btn btn-primary inline-flex"><PlusIcon />Add First Job</Link>}
          </div>
        ) : filteredJobs.map((job) => <JobCard key={job.id} job={job} />)}
      </div>

      <Link to="/jobs/new" className="lg:hidden fixed bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg z-40" style={{ background: 'var(--blue)', boxShadow: '0 4px 20px var(--blue-glow)' }}><PlusIcon /></Link>
    </div>
  );
}