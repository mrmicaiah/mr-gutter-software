import { useEffect, useState } from 'react';

const StarIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);

export default function BestJobCard({ job }) {
  const [show, setShow] = useState(false);
  const [sparkle, setSparkle] = useState(false);
  useEffect(() => { const t1 = setTimeout(() => setShow(true), 200); const t2 = setTimeout(() => setSparkle(true), 700); return () => { clearTimeout(t1); clearTimeout(t2); }; }, []);

  if (!job) return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
      <h3 className="font-display text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Best Job This Month</h3>
      <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No jobs yet this month</p>
    </div>
  );

  const profit = (job.full_price || 0) - (job.material_cost || 0) - (job.workers_cost || 0);

  return (
    <div className="p-4 rounded-xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--gold-light) 0%, var(--bg-card) 50%)', border: '2px solid var(--gold)', transform: show ? 'scale(1)' : 'scale(0.95)', opacity: show ? 1 : 0, transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
      {sparkle && <><div className="absolute top-2 right-8 text-lg animate-ping" style={{ animationDuration: '1.5s' }}>✨</div><div className="absolute top-6 right-2 text-sm animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }}>✨</div></>}
      <div className="flex items-center gap-2 mb-3"><div style={{ color: 'var(--gold)' }}><StarIcon /></div><h3 className="font-display text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--gold)' }}>Best Job This Month</h3></div>
      <div className="flex items-center justify-between">
        <div><p className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{job.client_name}</p><p className="text-sm" style={{ color: 'var(--text-muted)' }}>{job.zipcode} • {new Date(job.job_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p></div>
        <div className="text-right"><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Profit</p><p className="font-display text-2xl font-bold" style={{ color: 'var(--green)', textShadow: '0 0 20px var(--green-glow)' }}>${profit.toLocaleString()}</p></div>
      </div>
      <div className="absolute -bottom-4 -right-4 text-6xl opacity-10" style={{ transform: 'rotate(-15deg)' }}>🏆</div>
    </div>
  );
}