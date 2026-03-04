import { useEffect, useState } from 'react';

export default function StreakBadge({ streak = 0, bestStreak = 0 }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 300); return () => clearTimeout(t); }, []);

  const has = streak > 0, fire = streak >= 3, legend = streak >= 10;
  const msg = legend ? "LEGENDARY! 🏆" : fire ? "You're on fire!" : has ? "Keep it going!" : "Build your streak!";
  const flames = legend ? "🔥🔥🔥" : fire ? "🔥🔥" : has ? "🔥" : "💪";

  return (
    <div className="p-4 rounded-xl overflow-hidden relative" style={{ background: has ? 'linear-gradient(135deg, var(--gold-light) 0%, var(--bg-card) 100%)' : 'var(--bg-card)', border: `1px solid ${has ? 'var(--gold)' : 'var(--border-primary)'}`, transform: show ? 'scale(1)' : 'scale(0.9)', opacity: show ? 1 : 0, transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
      {legend && <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at center, var(--gold) 0%, transparent 70%)', animation: 'pulse 2s ease-in-out infinite' }} />}
      <div className="relative flex items-center gap-4">
        <div className="text-4xl" style={{ animation: has ? 'bounce 1s ease-in-out infinite' : 'none' }}>{flames}</div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2"><span className="font-display text-3xl font-bold" style={{ color: has ? 'var(--gold)' : 'var(--text-muted)' }}>{streak}</span><span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>week{streak !== 1 ? 's' : ''} hitting goal</span></div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{msg}</p>
        </div>
        {bestStreak > 0 && bestStreak > streak && <div className="text-center px-3 py-1 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Best</p><p className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>{bestStreak}</p></div>}
      </div>
      <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } } @keyframes pulse { 0%, 100% { opacity: 0.2; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.1); } }`}</style>
    </div>
  );
}