import { useEffect, useState } from 'react';

export default function SpeedometerGauge({ value = 0, goal = 10000, label = "Weekly Production" }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnimated(value), 100); return () => clearTimeout(t); }, [value]);

  const percentage = goal > 0 ? (animated / goal) * 100 : 0;
  const cappedPct = Math.min(percentage, 120);
  const rotation = -90 + (cappedPct / 120) * 180;
  const getColor = (p) => p >= 100 ? 'var(--gold)' : p >= 80 ? 'var(--green)' : p >= 50 ? 'var(--gold)' : 'var(--red)';
  const color = getColor(percentage);
  const isOver = percentage >= 100;

  return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
      <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-center mb-4" style={{ color: 'var(--text-muted)' }}>{label}</h3>
      <div className="relative w-48 h-28 mx-auto">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <path d="M 20 100 A 80 80 0 0 1 60 34" fill="none" stroke="var(--red)" strokeWidth="12" strokeLinecap="round" opacity="0.3" />
          <path d="M 60 34 A 80 80 0 0 1 100 20" fill="none" stroke="var(--gold)" strokeWidth="12" strokeLinecap="round" opacity="0.3" />
          <path d="M 100 20 A 80 80 0 0 1 140 34" fill="none" stroke="var(--green)" strokeWidth="12" strokeLinecap="round" opacity="0.3" />
          <path d="M 140 34 A 80 80 0 0 1 180 100" fill="none" stroke="var(--gold)" strokeWidth="12" strokeLinecap="round" opacity="0.3" />
          <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '100px 100px', transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <line x1="100" y1="100" x2="100" y2="30" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <circle cx="100" cy="100" r="8" fill={color} />
            <circle cx="100" cy="100" r="4" fill="var(--bg-card)" />
          </g>
          <text x="15" y="108" fill="var(--text-subtle)" fontSize="10">0</text>
          <text x="92" y="15" fill="var(--text-subtle)" fontSize="10">{(goal/2/1000).toFixed(0)}k</text>
          <text x="165" y="108" fill="var(--text-subtle)" fontSize="10">{(goal/1000).toFixed(0)}k+</text>
        </svg>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <p className="font-display text-2xl font-bold" style={{ color, textShadow: isOver ? `0 0 20px ${color}` : 'none' }}>${(animated/1000).toFixed(1)}k</p>
          <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{percentage.toFixed(0)}% of goal</p>
        </div>
      </div>
      {isOver && <div className="mt-3 text-center"><span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'var(--gold-light)', color: 'var(--gold)' }}>🔥 CRUSHING IT!</span></div>}
    </div>
  );
}