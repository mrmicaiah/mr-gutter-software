export default function ZipcodeLeaderboard({ data = [] }) {
  if (!data.length) return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
      <h3 className="font-display text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Top Zipcodes</h3>
      <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No data yet</p>
    </div>
  );

  const max = Math.max(...data.map(d => d.total_production || 0));
  const medals = ['🥇', '🥈', '🥉', '4', '5'];

  return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
      <h3 className="font-display text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Top Zipcodes</h3>
      <div className="space-y-3">
        {data.slice(0, 5).map((item, i) => {
          const bar = max > 0 ? (item.total_production / max) * 100 : 0;
          const top3 = i < 3;
          return (
            <div key={item.zipcode} className="relative">
              <div className="absolute inset-y-0 left-0 rounded-lg transition-all duration-700" style={{ width: `${bar}%`, background: top3 ? 'var(--blue-light)' : 'var(--bg-tertiary)', opacity: 0.5 }} />
              <div className="relative flex items-center gap-3 p-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: top3 ? 'var(--blue)' : 'var(--bg-tertiary)', color: top3 ? 'white' : 'var(--text-muted)' }}>{medals[i]}</div>
                <div className="flex-1"><p className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>{item.zipcode}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.job_count} job{item.job_count !== 1 ? 's' : ''}</p></div>
                <div className="text-right"><p className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>${(item.total_production || 0).toLocaleString()}</p><p className="text-xs" style={{ color: 'var(--green)' }}>${(item.avg_profit || 0).toLocaleString()} avg</p></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}