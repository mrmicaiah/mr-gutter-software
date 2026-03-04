import { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';
import { SaveIcon } from '../components/Icons';
import api from '../utils/api';

const CalculatorIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/></svg>);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export default function Goals() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [mode, setMode] = useState('even');
  const [target, setTarget] = useState('500000');
  const [monthly, setMonthly] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success, error: showError } = useToast();

  useEffect(() => { fetchGoals(); }, [year]);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await api.getGoals(year);
      if (res.data) {
        setTarget(res.data.yearly_target?.toString() || '500000');
        setMode(res.data.distribution_mode || 'even');
        const m = {};
        MONTH_KEYS.forEach(k => { if (res.data[k]) m[k] = res.data[k].toString(); });
        setMonthly(m);
      }
    } catch (e) { /* No goals yet, use defaults */ }
    finally { setLoading(false); }
  };

  const even = parseFloat(target) / 12 || 0;
  const customTotal = MONTH_KEYS.reduce((s, k) => s + (parseFloat(monthly[k]) || 0), 0);

  const distribute = () => {
    const val = (parseFloat(target) / 12).toFixed(0);
    const m = {};
    MONTH_KEYS.forEach(k => m[k] = val);
    setMonthly(m);
    setMode('even');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        yearly_target: parseFloat(target),
        distribution_mode: mode,
        ...MONTH_KEYS.reduce((a, k) => { a[k] = mode === 'even' ? even : parseFloat(monthly[k]) || 0; return a; }, {})
      };
      await api.setGoals(year, data);
      success('Goals saved!');
    } catch (e) { showError(e.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto pb-24 lg:pb-6">
      <div className="mb-6"><h1 className="font-display text-xl font-bold tracking-wider uppercase" style={{ color: 'var(--text-primary)' }}>Goals</h1><p style={{ color: 'var(--text-muted)' }} className="text-sm mt-1">Set yearly production targets</p></div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Year */}
        <div className="section" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: '12px', overflow: 'hidden' }}>
          <div className="section-header"><div className="section-title">Select Year</div></div>
          <div className="p-4 flex gap-2">
            {[currentYear - 1, currentYear, currentYear + 1].map(y => (
              <button key={y} type="button" onClick={() => setYear(y)} className="px-4 py-2 rounded-lg font-display font-bold text-sm transition-all" style={{ background: year === y ? 'var(--blue)' : 'var(--bg-tertiary)', color: year === y ? 'white' : 'var(--text-secondary)', boxShadow: year === y ? 'var(--shadow-brand)' : 'none' }}>{y}</button>
            ))}
          </div>
        </div>

        {/* Target */}
        <div className="section" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: '12px', overflow: 'hidden' }}>
          <div className="section-header"><div className="section-title">Yearly Target</div></div>
          <div className="p-4">
            <label className="label">Total Goal for {year}</label>
            <div className="relative max-w-xs"><span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold" style={{ color: 'var(--text-muted)' }}>$</span><input type="number" value={target} onChange={e => setTarget(e.target.value)} className="input pl-8" step="1000" min="0" /></div>
          </div>
        </div>

        {/* Distribution */}
        <div className="section" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: '12px', overflow: 'hidden' }}>
          <div className="section-header"><div className="section-title">Monthly Distribution</div><button type="button" onClick={distribute} className="flex items-center gap-1.5 text-xs font-semibold uppercase" style={{ color: 'var(--blue)' }}><CalculatorIcon />Distribute Evenly</button></div>
          <div className="p-4">
            <div className="flex gap-2 mb-6">
              <button type="button" onClick={() => setMode('even')} className="px-4 py-2 rounded-lg font-semibold text-sm" style={{ background: mode === 'even' ? 'var(--blue-light)' : 'var(--bg-tertiary)', color: mode === 'even' ? 'var(--blue)' : 'var(--text-secondary)', border: `2px solid ${mode === 'even' ? 'var(--blue)' : 'transparent'}` }}>Even</button>
              <button type="button" onClick={() => setMode('custom')} className="px-4 py-2 rounded-lg font-semibold text-sm" style={{ background: mode === 'custom' ? 'var(--blue-light)' : 'var(--bg-tertiary)', color: mode === 'custom' ? 'var(--blue)' : 'var(--text-secondary)', border: `2px solid ${mode === 'custom' ? 'var(--blue)' : 'transparent'}` }}>Custom</button>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {MONTHS.map((m, i) => {
                const k = MONTH_KEYS[i];
                const v = mode === 'even' ? even.toFixed(0) : monthly[k] || '';
                return (<div key={k}><label className="block text-xs font-bold uppercase mb-1 text-center" style={{ color: 'var(--text-muted)' }}>{m}</label><div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-subtle)' }}>$</span><input type="number" value={v} onChange={e => setMonthly(p => ({ ...p, [k]: e.target.value }))} disabled={mode === 'even'} className="input pl-5 text-sm text-center" style={{ opacity: mode === 'even' ? 0.7 : 1 }} step="100" min="0" /></div></div>);
              })}
            </div>
            {mode === 'custom' && (
              <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
                <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Total:</span><span className="font-display font-bold" style={{ color: Math.abs(customTotal - parseFloat(target)) < 1 ? 'var(--green)' : 'var(--gold)' }}>${customTotal.toLocaleString()}</span></div>
                {Math.abs(customTotal - parseFloat(target)) >= 1 && <p className="text-sm mt-1" style={{ color: 'var(--gold)' }}>Difference: ${Math.abs(customTotal - parseFloat(target)).toLocaleString()}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end"><button type="submit" disabled={saving || loading} className="btn btn-primary" style={{ opacity: saving ? 0.7 : 1 }}><SaveIcon />{saving ? 'Saving...' : 'Save Goals'}</button></div>
      </form>
    </div>
  );
}