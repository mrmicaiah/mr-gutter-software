import { useEffect, useState } from 'react';

export default function GoalRing({ current = 0, goal = 100000, label = "Yearly Goal" }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnimated(current), 100); return () => clearTimeout(t); }, [current]);

  const pct = goal > 0 ? Math.min((animated / goal) * 100, 100) : 0;
  const circ = 2 * Math.PI * 54;
  const offset = circ - (pct / 100) * circ;
  const done = pct >= 100;
  const color = done ? 'var(--gold)' : 'var(--blue)';

  return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
      <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-center mb-4" style={{ color: 'var(--text-muted)' }}>{label}</h3>
      <div className="relative w-36 h-36 mx-auto">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="54" fill="none" stroke="var(--bg-tertiary)" strokeWidth="10" />
          <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1.5s ease-out', filter: done ? `drop-shadow(0 0 10px ${color})` : 'none' }} />
          {[25, 50, 75].map(p => { const a = (p / 100) * 360 - 90, r = a * (Math.PI / 180); return <circle key={p} cx={60 + 54 * Math.cos(r)} cy={60 + 54 * Math.sin(r)} r="3" fill={pct >= p ? color : 'var(--bg-tertiary)'} style={{ transition: 'fill 0.3s' }} />; })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {done ? <><span className="text-3xl mb-1">🏆</span><span className="font-display text-xl font-bold" style={{ color }}>DONE!</span></> : <><span className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{pct.toFixed(0)}%</span><span className="text-xs" style={{ color: 'var(--text-muted)' }}>complete</span></>}
        </div>
      </div>
      <div className="flex justify-between mt-4 text-xs">
        <div className="text-center"><p style={{ color: 'var(--text-muted)' }}>Current</p><p className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>${(animated/1000).toFixed(0)}k</p></div>
        <div className="text-center"><p style={{ color: 'var(--text-muted)' }}>Remaining</p><p className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>${(Math.max(0, goal - animated)/1000).toFixed(0)}k</p></div>
        <div className="text-center"><p style={{ color: 'var(--text-muted)' }}>Goal</p><p className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>${(goal/1000).toFixed(0)}k</p></div>
      </div>
    </div>
  );
}