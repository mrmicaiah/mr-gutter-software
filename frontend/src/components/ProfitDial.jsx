import { useEffect, useState } from 'react';

export default function ProfitDial({ profit = 0, revenue = 1 }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnimated(revenue > 0 ? (profit / revenue) * 100 : 0), 100); return () => clearTimeout(t); }, [profit, revenue]);

  const pct = Math.max(0, Math.min(animated, 100));
  const circ = 2 * Math.PI * 45;
  const offset = circ - (pct / 100) * circ;
  const getColor = (p) => p >= 35 ? 'var(--green)' : p >= 20 ? 'var(--gold)' : 'var(--red)';
  const color = getColor(pct);

  return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
      <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-center mb-4" style={{ color: 'var(--text-muted)' }}>Profit Margin</h3>
      <div className="relative w-32 h-32 mx-auto">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--bg-tertiary)" strokeWidth="8" />
          <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1.5s ease-out', filter: pct >= 35 ? `drop-shadow(0 0 6px ${color})` : 'none' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="font-display text-3xl font-bold" style={{ color }}>{pct.toFixed(0)}%</span><span className="text-xs" style={{ color: 'var(--text-muted)' }}>margin</span></div>
      </div>
      <div className="flex justify-center gap-4 mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--red)' }} />&lt;20%</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--gold)' }} />20-35%</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--green)' }} />35%+</span>
      </div>
    </div>
  );
}