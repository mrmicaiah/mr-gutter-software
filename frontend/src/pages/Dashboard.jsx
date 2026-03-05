import { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';
import SpeedometerGauge from '../components/SpeedometerGauge';
import ProfitDial from '../components/ProfitDial';
import MoneyCounter from '../components/MoneyCounter';
import GoalRing from '../components/GoalRing';
import ZipcodeLeaderboard from '../components/ZipcodeLeaderboard';
import BestJobCard from '../components/BestJobCard';
import RecentJobsFeed from '../components/RecentJobsFeed';
import api from '../utils/api';

const RefreshIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>);

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-48 rounded-xl" style={{ background: 'var(--bg-tertiary)' }} />)}</div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{[1,2].map(i => <div key={i} className="h-64 rounded-xl" style={{ background: 'var(--bg-tertiary)' }} />)}</div>
  </div>
);

// Date range toggle component
const DateRangeToggle = ({ value, onChange }) => {
  const options = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
  ];
  
  return (
    <div className="inline-flex rounded-lg p-1" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
      {options.map(opt => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className="px-4 py-2 text-sm font-semibold rounded-md transition-all"
          style={{
            background: value === opt.key ? 'var(--blue)' : 'transparent',
            color: value === opt.key ? 'white' : 'var(--text-muted)',
            boxShadow: value === opt.key ? 'var(--shadow-brand)' : 'none',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const currentYear = new Date().getFullYear();
  const { error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('month');
  const [data, setData] = useState({ summary: null, zipcodes: [], recentJobs: [], goals: null });

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [summaryRes, zipcodesRes, jobsRes, goalsRes] = await Promise.allSettled([
        api.getSummary(),
        api.getZipcodeStats(),
        api.getJobs(),
        api.getGoals(currentYear),
      ]);
      setData({
        summary: summaryRes.status === 'fulfilled' ? summaryRes.value.data : null,
        zipcodes: zipcodesRes.status === 'fulfilled' ? zipcodesRes.value.data || [] : [],
        recentJobs: jobsRes.status === 'fulfilled' ? (jobsRes.value.data || []).slice(0, 10) : [],
        goals: goalsRes.status === 'fulfilled' ? goalsRes.value.data : null,
      });
    } catch (e) { showError('Failed to load dashboard'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const summary = data.summary || {};
  const week = summary.week || {};
  const month = summary.month || {};
  const quarter = summary.quarter || {};
  const year = summary.year || {};
  
  // Get stats based on selected date range
  const getStats = () => {
    const ranges = {
      week: { data: week, label: 'This Week', goalDivisor: 52 },
      month: { data: month, label: new Date().toLocaleDateString('en-US', { month: 'long' }), goalDivisor: 12 },
      year: { data: year, label: String(currentYear), goalDivisor: 1 },
    };
    const selected = ranges[dateRange];
    const d = selected.data;
    const yearlyGoal = year.goal || data.goals?.yearly_target || 300000;
    const periodGoal = yearlyGoal / selected.goalDivisor;
    
    return {
      production: d.total_production || 0,
      profit: d.total_profit || 0,
      jobs: d.job_count || 0,
      avgProfit: d.avg_profit_per_job || 0,
      label: selected.label,
      goal: periodGoal,
      yearlyGoal,
    };
  };
  
  const stats = getStats();
  const profitMargin = stats.production > 0 ? (stats.profit / stats.production) * 100 : 0;
  const yearProduction = year.total_production || 0;
  
  // Find best job
  const bestJob = data.recentJobs.reduce((best, job) => {
    const profit = (job.full_price || 0) - (job.material_cost || 0) - (job.workers_cost || 0);
    const bestProfit = best ? (best.full_price || 0) - (best.material_cost || 0) - (best.workers_cost || 0) : 0;
    return profit > bestProfit ? job : best;
  }, null);

  const formatMoney = (val) => '$' + val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  if (loading) return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <LoadingSkeleton />
    </div>
  );

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>Command Center</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <button onClick={() => fetchAllData(true)} disabled={refreshing} className="btn btn-secondary" style={{ opacity: refreshing ? 0.6 : 1 }}>
          <span style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none', display: 'inline-block' }}><RefreshIcon /></span>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Date Range Toggle + Money Counter Hero */}
      <div className="mb-6 p-6 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Viewing</p>
            <p className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{stats.label}</p>
          </div>
          <DateRangeToggle value={dateRange} onChange={setDateRange} />
        </div>
        <MoneyCounter value={stats.production} label={`${stats.label} Production`} />
      </div>

      {/* Main Gauges - respond to date range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div>
          <SpeedometerGauge value={stats.production} goal={stats.goal} label={`${stats.label} Production`} />
          <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>Production vs {dateRange === 'year' ? 'yearly' : dateRange + 'ly'} goal</p>
        </div>
        <div>
          <ProfitDial profit={stats.profit} revenue={stats.production} />
          <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>Profit margin — green is healthy, red needs work</p>
        </div>
        <div>
          <GoalRing current={yearProduction} goal={stats.yearlyGoal} label={`${currentYear} Goal`} />
          <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>Year-to-date progress toward annual goal</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Jobs</p>
          <p className="font-display text-2xl font-bold" style={{ color: 'var(--blue)' }}>{stats.jobs}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stats.label}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Profit</p>
          <p className="font-display text-2xl font-bold" style={{ color: 'var(--green)' }}>{formatMoney(stats.profit)}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stats.label}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Avg per Job</p>
          <p className="font-display text-2xl font-bold" style={{ color: 'var(--gold)' }}>{formatMoney(stats.avgProfit)}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Profit per job</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Margin</p>
          <p className="font-display text-2xl font-bold" style={{ color: profitMargin >= 35 ? 'var(--green)' : profitMargin >= 20 ? 'var(--gold)' : 'var(--red)' }}>{profitMargin.toFixed(1)}%</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Profit margin</p>
        </div>
      </div>

      {/* Best Job */}
      {bestJob && <div className="mb-6"><BestJobCard job={bestJob} /></div>}

      {/* Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ZipcodeLeaderboard data={data.zipcodes} />
        <RecentJobsFeed jobs={data.recentJobs} />
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
