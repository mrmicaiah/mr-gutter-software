const TrendUpIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>);
const TrendDownIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>);

export default function ComparisonCard({ current = 0, previous = 0, label = "vs Last Week", format = "currency" }) {
  const diff = previous > 0 ? ((current - previous) / previous) * 100 : 0;
  const isUp = diff > 0, sig = Math.abs(diff) >= 1;
  const fmt = (v) => format === 'currency' ? `$${v.toLocaleString()}` : format === 'percent' ? `${v.toFixed(1)}%` : v.toLocaleString();
  const color = isUp ? 'var(--green)' : 'var(--red)';
  const bg = isUp ? 'var(--green-light)' : 'var(--red-light)';

  return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
      <div className="flex items-start justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p><p className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{fmt(current)}</p></div>
        {sig && <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: bg, color }}>{isUp ? <TrendUpIcon /> : <TrendDownIcon />}<span className="font-bold text-sm">{Math.abs(diff).toFixed(0)}%</span></div>}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}><div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((current / Math.max(current, previous)) * 100, 100)}%`, background: color }} /></div>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{fmt(previous)} prev</span>
      </div>
    </div>
  );
}