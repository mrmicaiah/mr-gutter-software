import { Link } from 'react-router-dom';

const ChevronRightIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>);
const CalendarIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const MapPinIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>);

export default function JobCard({ job, onClick }) {
  const profit = (job.full_price || 0) - (job.material_cost || 0) - (job.workers_cost || 0);
  const isProfitable = profit >= 0;
  const formattedDate = new Date(job.job_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const content = (
    <div className="block p-4 transition-all duration-200 group" style={{ background: 'var(--bg-card)', borderLeft: `3px solid ${isProfitable ? 'var(--green)' : 'var(--red)'}`, borderBottom: '1px solid var(--border-primary)' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate mb-1" style={{ color: 'var(--text-primary)' }}>{job.client_name}</h3>
          <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1"><CalendarIcon />{formattedDate}</span>
            <span className="flex items-center gap-1"><MapPinIcon />{job.zipcode}</span>
            {job.phone && <span className="hidden sm:inline">{job.phone}</span>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{formatCurrency(job.full_price || 0)}</p>
            <p className="font-mono text-sm font-semibold" style={{ color: isProfitable ? 'var(--green)' : 'var(--red)' }}>{isProfitable ? '+' : ''}{formatCurrency(profit)}</p>
          </div>
          <div className="transition-transform group-hover:translate-x-1" style={{ color: 'var(--text-muted)' }}><ChevronRightIcon /></div>
        </div>
      </div>
    </div>
  );

  if (onClick) return <button onClick={onClick} className="w-full text-left">{content}</button>;
  return <Link to={`/jobs/${job.id}/edit`} className="block">{content}</Link>;
}