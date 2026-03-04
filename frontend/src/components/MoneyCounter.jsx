import { useEffect, useState, useRef } from 'react';

export default function MoneyCounter({ value = 0, label = "Total Production", duration = 2000 }) {
  const [display, setDisplay] = useState(0);
  const [animating, setAnimating] = useState(false);
  const prev = useRef(0);

  useEffect(() => {
    if (value === prev.current) return;
    setAnimating(true);
    const start = prev.current, end = value, startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
      else { setAnimating(false); prev.current = end; }
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  const digits = display.toLocaleString().split('');

  return (
    <div className="p-6 rounded-xl text-center" style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-tertiary) 100%)', border: '1px solid var(--border-primary)' }}>
      <h3 className="font-display text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>{label}</h3>
      <div className="flex items-center justify-center gap-0.5">
        <span className="font-display text-4xl font-bold" style={{ color: 'var(--green)' }}>$</span>
        {digits.map((d, i) => <span key={i} className="font-display text-4xl font-bold inline-block" style={{ color: 'var(--text-primary)', animation: animating ? `tickUp 0.1s ease ${i * 0.02}s` : 'none' }}>{d}</span>)}
      </div>
      <style>{`@keyframes tickUp { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }`}</style>
    </div>
  );
}