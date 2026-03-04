import { Link } from 'react-router-dom';

const ChevronRightIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>);

export default function RecentJobsFeed({ jobs = [] }) {
  if (!jobs.length) return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
      <h3 className="font-display text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Recent Jobs</h3>
      <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No recent jobs</p>
    </div>
  );

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
      <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <h3 className="font-display text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Recent Jobs</h3>
        <Link to="/jobs" className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--blue)' }}>View All <ChevronRightIcon /></Link>
      </div>
      <div>
        {jobs.slice(0, 5).map((job, i) => {
          const profit = (job.full_price || 0) - (job.material_cost || 0) - (job.workers_cost || 0);
          const ok = profit >= 0;
          const d = new Date(job.job_date);
          const recent = (Date.now() - d.getTime()) < 24 * 60 * 60 * 1000;
          return (
            <Link key={job.id} to={`/jobs/${job.id}/edit`} className="flex items-center gap-3 p-3" style={{ borderBottom: i < jobs.length - 1 ? '1px solid var(--border-primary)' : 'none' }}>
              <div className="w-12 h-12 rounded-lg flex flex-col items-center justify-center" style={{ background: recent ? 'var(--blue-light)' : 'var(--bg-tertiary)', color: recent ? 'var(--blue)' : 'var(--text-muted)' }}>
                <span className="text-xs font-semibold uppercase">{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                <span className="font-display text-lg font-bold leading-none">{d.getDate()}</span>
              </div>
              <div className="flex-1 min-w-0"><p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{job.client_name}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{job.zipcode}</p></div>
              <div className="text-right"><p className="font-display font-bold" style={{ color: ok ? 'var(--green)' : 'var(--red)' }}>{ok ? '+' : ''}${profit.toLocaleString()}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>${(job.full_price || 0).toLocaleString()}</p></div>
              <div style={{ color: 'var(--text-subtle)' }}><ChevronRightIcon /></div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}