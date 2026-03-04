import { useMemo } from 'react';

export default function DistributionBar({ months, yearlyTarget }) {
  const data = useMemo(() => {
    const values = months.map(m => parseFloat(m.value) || 0);
    const max = Math.max(...values, 1);
    const evenAmount = yearlyTarget / 12;
    return months.map((m, i) => {
      const val = values[i];
      const height = (val / max) * 100;
      const diff = evenAmount > 0 ? ((val - evenAmount) / evenAmount) * 100 : 0;
      return { ...m, value: val, height, diff, isHigh: diff > 5, isLow: diff < -5 };
    });
  }, [months, yearlyTarget]);

  const total = data.reduce((s, d) => s + d.value, 0);
  const isBalanced = Math.abs(total - yearlyTarget) < 1;

  return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Distribution Shape</h3>
        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--green)' }} />Above</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--blue)' }} />Even</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--gold)' }} />Below</span>
        </div>
      </div>
      <div className="flex items-end justify-between gap-1 h-24 mb-3">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div className="w-full rounded-t transition-all duration-300 relative group" style={{ height: `${Math.max(d.height, 4)}%`, background: d.isHigh ? 'var(--green)' : d.isLow ? 'var(--gold)' : 'var(--blue)', opacity: d.value > 0 ? 1 : 0.3 }}>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-md)' }}>
                {d.label}: ${d.value.toLocaleString()}
                {d.diff !== 0 && <span style={{ color: d.isHigh ? 'var(--green)' : d.isLow ? 'var(--gold)' : 'var(--text-muted)' }}> ({d.diff > 0 ? '+' : ''}{d.diff.toFixed(0)}%)</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between gap-1">{data.map((d, i) => <div key={i} className="flex-1 text-center text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{d.label.slice(0, 1)}</div>)}</div>
      <div className="mt-4 pt-3 flex items-center justify-between text-sm" style={{ borderTop: '1px solid var(--border-primary)' }}>
        <span style={{ color: 'var(--text-muted)' }}>Total Distributed</span>
        <span className="font-display font-bold" style={{ color: isBalanced ? 'var(--green)' : 'var(--gold)' }}>
          ${total.toLocaleString()}
          {!isBalanced && <span className="font-normal text-xs ml-2" style={{ color: 'var(--gold)' }}>({total > yearlyTarget ? '+' : ''}{(total - yearlyTarget).toLocaleString()} from target)</span>}
        </span>
      </div>
    </div>
  );
}