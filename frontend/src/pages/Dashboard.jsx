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

// Section header with description
const SectionHeader = ({ title, description }) => (
  <div className="mb-4">
    <h2 className="font-display text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>{title}</h2>
    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{description}</p>
  </div>
);

// Stat card for weekly summary
const WeeklyStatCard = ({ label, value, subLabel, icon, color = 'blue' }) => {
  const colors = {
    blue: { bg: 'var(--blue-light)', text: 'var(--blue)' },
    green: { bg: 'var(--green-light)', text: 'var(--green)' },
    gold: { bg: 'var(--gold-light)', text: 'var(--gold)' },
  };
  const c = colors[color] || colors.blue;
  
  return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: c.bg, color: c.text }}>{icon}</span>
      </div>
      <p className="font-display text-2xl font-bold" style={{ color: c.text }}>{value}</p>
      {subLabel && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{subLabel}</p>}
    </div>
  );
};

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
  const year = summary.year || {};
  
  // Weekly stats
  const weekProduction = week.total_production || 0;
  const weekProfit = week.total_profit || 0;
  const weekJobs = week.job_count || 0;
  const weekAvgProfit = week.avg_profit_per_job || 0;
  const weekProfitMargin = weekProduction > 0 ? (weekProfit / weekProduction) * 100 : 0;
  
  // Monthly stats
  const monthProduction = month.total_production || 0;
  const monthProfit = month.total_profit || 0;
  const monthJobs = month.job_count || 0;
  const monthProfitMargin = monthProduction > 0 ? (monthProfit / monthProduction) * 100 : 0;
  
  // Yearly stats
  const yearProduction = year.total_production || 0;
  const yearlyGoal = year.goal || data.goals?.yearly_target || 300000;
  const weeklyGoal = yearlyGoal / 52;
  const monthlyGoal = yearlyGoal / 12;
  
  // Find best job this week
  const bestJob = data.recentJobs.reduce((best, job) => {
    const profit = (job.full_price || 0) - (job.material_cost || 0) - (job.workers_cost || 0);
    const bestProfit = best ? (best.full_price || 0) - (best.material_cost || 0) - (best.workers_cost || 0) : 0;
    return profit > bestProfit ? job : best;
  }, null);

  const formatMoney = (val) => '$' + val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

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

      {/* THIS WEEK Section */}
      <SectionHeader 
        title="📅 This Week" 
        description="Your weekly production numbers at a glance. Week resets every Sunday."
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <WeeklyStatCard label="Production" value={formatMoney(weekProduction)} subLabel={`Goal: ${formatMoney(weeklyGoal)}`} icon="💰" color="blue" />
        <WeeklyStatCard label="Profit" value={formatMoney(weekProfit)} subLabel={`${weekProfitMargin.toFixed(0)}% margin`} icon="📈" color="green" />
        <WeeklyStatCard label="Jobs" value={weekJobs} subLabel={`Avg: ${formatMoney(weekAvgProfit)}/job`} icon="🔧" color="gold" />
        <WeeklyStatCard label="Weekly Goal" value={`${Math.min(100, (weekProduction / weeklyGoal * 100)).toFixed(0)}%`} subLabel={weekProduction >= weeklyGoal ? '🔥 Crushing it!' : `${formatMoney(weeklyGoal - weekProduction)} to go`} icon="🎯" color={weekProduction >= weeklyGoal ? 'green' : 'blue'} />
      </div>

      {/* GAUGES Section */}
      <SectionHeader 
        title="📊 Performance Gauges" 
        description="Visual tracking of your key metrics. Speedometer shows weekly progress, dial shows profit health, ring shows yearly goal."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div>
          <SpeedometerGauge value={weekProduction} goal={weeklyGoal} label="Weekly Production" />
          <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>Needle shows progress toward weekly target</p>
        </div>
        <div>
          <ProfitDial profit={monthProfit} revenue={monthProduction} />
          <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>Green = healthy margins, Red = needs attention</p>
        </div>
        <div>
          <GoalRing current={yearProduction} goal={yearlyGoal} label={`${currentYear} Goal`} />
          <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>Ring fills as you hit your yearly target</p>
        </div>
        <div>
          <MoneyCounter value={monthProduction} label={`${new Date().toLocaleDateString('en-US', { month: 'long' })} Total`} />
          <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>Total production this month</p>
        </div>
      </div>

      {/* MONTHLY SUMMARY */}
      <SectionHeader 
        title="📆 Monthly Summary" 
        description={`${new Date().toLocaleDateString('en-US', { month: 'long' })} performance overview.`}
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <WeeklyStatCard label="Production" value={formatMoney(monthProduction)} subLabel={`Goal: ${formatMoney(monthlyGoal)}`} icon="💵" color="blue" />
        <WeeklyStatCard label="Profit" value={formatMoney(monthProfit)} subLabel={`${monthProfitMargin.toFixed(0)}% margin`} icon="📊" color="green" />
        <WeeklyStatCard label="Jobs Completed" value={monthJobs} icon="✅" color="gold" />
        <WeeklyStatCard label="Monthly Goal" value={`${Math.min(100, (monthProduction / monthlyGoal * 100)).toFixed(0)}%`} subLabel={monthProduction >= monthlyGoal ? '🎉 Goal hit!' : `${formatMoney(monthlyGoal - monthProduction)} to go`} icon="🏆" color={monthProduction >= monthlyGoal ? 'green' : 'blue'} />
      </div>

      {/* Best Job */}
      {bestJob && (
        <>
          <SectionHeader 
            title="⭐ Top Performer" 
            description="Highest profit job from recent work."
          />
          <div className="mb-8"><BestJobCard job={bestJob} /></div>
        </>
      )}

      {/* Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SectionHeader 
            title="📍 Zipcode Breakdown" 
            description="See which areas are bringing in the most revenue."
          />
          <ZipcodeLeaderboard data={data.zipcodes} />
        </div>
        <div>
          <SectionHeader 
            title="🕐 Recent Jobs" 
            description="Your latest completed jobs."
          />
          <RecentJobsFeed jobs={data.recentJobs} />
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
