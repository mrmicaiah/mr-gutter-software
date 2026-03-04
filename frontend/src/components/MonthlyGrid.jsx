import { useMemo } from 'react';

const TrendUpIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /></svg>);
const TrendDownIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /></svg>);

const formatDisplay = (value) => {
  if (!value || value === '0') return '';
  const num = parseInt(value, 10);
  if (isNaN(num)) return '';
  return num.toLocaleString();
};

export default function MonthlyGrid({ months, onChange, disabled = false, evenAmount = 0 }) {
  const stats = useMemo(() => months.map(m => {
    const val = parseFloat(m.value) || 0;
    const diff = evenAmount > 0 ? ((val - evenAmount) / evenAmount) * 100 : 0;
    return { ...m, numericValue: val, diff, isHigh: diff > 5, isLow: diff < -5 };
  }), [months, evenAmount]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {stats.map((month) => (
        <div key={month.key} className="relative" style={{ opacity: disabled ? 0.7 : 1 }}>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor={month.key} className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{month.label}</label>
            {!disabled && month.numericValue > 0 && Math.abs(month.diff) > 5 && (
              <div className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: month.isHigh ? 'var(--green)' : 'var(--gold)' }}>
                {month.isHigh ? <TrendUpIcon /> : <TrendDownIcon />}
                <span>{Math.abs(month.diff).toFixed(0)}%</span>
              </div>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: 'var(--text-subtle)' }}>$</span>
            <input type="text" inputMode="numeric" id={month.key} value={formatDisplay(month.value)} onChange={(e) => onChange(month.key, e.target.value.replace(/[^0-9]/g, ''))} disabled={disabled} className="input pl-7 text-sm font-semibold" style={{ borderColor: month.isHigh ? 'var(--green)' : month.isLow ? 'var(--gold)' : undefined, background: disabled ? 'var(--bg-tertiary)' : undefined }} placeholder="0" />
          </div>
          {!disabled && evenAmount > 0 && (
            <div className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min((month.numericValue / evenAmount) * 50, 100)}%`, background: month.isHigh ? 'var(--green)' : month.isLow ? 'var(--gold)' : 'var(--blue)' }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}