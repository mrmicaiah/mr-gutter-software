import { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';
import SpeedometerGauge from '../components/SpeedometerGauge';
import ProfitDial from '../components/ProfitDial';
import MoneyCounter from '../components/MoneyCounter';
import GoalRing from '../components/GoalRing';
import StreakBadge from '../components/StreakBadge';
import ZipcodeLeaderboard from '../components/ZipcodeLeaderboard';
import BestJobCard from '../components/BestJobCard';
import ComparisonCard from '../components/ComparisonCard';
import RecentJobsFeed from '../components/RecentJobsFeed';
import api from '../utils/api';

const RefreshIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>);

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-48 rounded-xl" style={{ background: 'var(--bg-tertiary)' }} />)}</div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{[1,2].map(i => <div key={i} className="h-64 rounded-xl" style={{ background: 'var(--bg-tertiary)' }} />)}</div>
  </div>
);

export default function Dashboard() {
  const currentYear = new Date().getFullYear();
  const { error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
  
  // Use actual API field names
  const weekProduction = week.total_production || 0;
  const weekProfit = week.total_profit || 0;
  const weekJobs = week.job_count || 0;
  
  const monthProduction = month.total_production || 0;
  const monthProfit = month.total_profit || 0;
  const monthJobs = month.job_count || 0;
  
  const yearProduction = year.total_production || 0;
  const yearlyGoal = year.goal || data.goals?.yearly_target || 300000;
  const weeklyGoal = yearlyGoal / 52;
  
  // Calculate profit margin
  const profitMargin = monthProduction > 0 ? (monthProfit / monthProduction) * 100 : 0;
  
  // Find best job
  const bestJob = data.recentJobs.reduce((best, job) => {
    const profit = (job.full_price || 0) - (job.material_cost || 0) - (job.workers_cost || 0);
    const bestProfit = best ? (best.full_price || 0) - (best.material_cost || 0) - (best.workers_cost || 0) : 0;
    return profit > bestProfit ? job : best;
  }, null);

  if (loading) return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6"><div><div className="h-8 w-48 rounded" style={{ background: 'var(--bg-tertiary)' }} /><div className="h-4 w-32 mt-2 rounded" style={{ background: 'var(--bg-tertiary)' }} /></div></div>
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

      {/* Money Counter Hero */}
      <div className="mb-6">
        <MoneyCounter value={monthProduction} label={`${new Date().toLocaleDateString('en-US', { month: 'long' })} Production`} />
      </div>

      {/* Gauges Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SpeedometerGauge value={weekProduction} goal={weeklyGoal} label="Weekly Production" />
        <ProfitDial profit={monthProfit} revenue={monthProduction} />
        <GoalRing current={yearProduction} goal={yearlyGoal} label={`${currentYear} Goal`} />
        <StreakBadge streak={weekJobs} bestStreak={monthJobs} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ComparisonCard current={weekProduction} previous={0} label="This Week" />
        <ComparisonCard current={monthProduction} previous={0} label="This Month" />
        <ComparisonCard current={weekJobs} previous={0} label="Jobs This Week" format="number" />
        <ComparisonCard current={profitMargin} previous={0} label="Profit Margin" format="percent" />
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
