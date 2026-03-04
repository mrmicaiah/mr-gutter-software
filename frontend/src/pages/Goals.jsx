import { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '../components/Toast';
import { SaveIcon } from '../components/Icons';
import DistributionBar from '../components/DistributionBar';
import MonthlyGrid from '../components/MonthlyGrid';
import Loading from '../components/Loading';
import api from '../utils/api';

const TargetIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>);
const ToggleIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="5" width="22" height="14" rx="7" ry="7" /><circle cx="16" cy="12" r="3" /></svg>);

const MONTHS = [
  { key: 'jan', label: 'January' }, { key: 'feb', label: 'February' }, { key: 'mar', label: 'March' },
  { key: 'apr', label: 'April' }, { key: 'may', label: 'May' }, { key: 'jun', label: 'June' },
  { key: 'jul', label: 'July' }, { key: 'aug', label: 'August' }, { key: 'sep', label: 'September' },
  { key: 'oct', label: 'October' }, { key: 'nov', label: 'November' }, { key: 'dec', label: 'December' },
];

export default function Goals() {
  const currentYear = new Date().getFullYear();
  const { success, error: showError } = useToast();
  const [year, setYear] = useState(currentYear);
  const [yearlyTarget, setYearlyTarget] = useState('');
  const [mode, setMode] = useState('even');
  const [monthlyValues, setMonthlyValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => { fetchGoals(); }, [year]);

  useEffect(() => {
    const handler = (e) => { if (hasChanges) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasChanges]);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await api.getGoals(year);
      if (res.data) {
        setYearlyTarget(res.data.yearly_target?.toString() || '500000');
        setMode(res.data.distribution_mode || 'even');
        const m = {}; MONTHS.forEach(mo => { m[mo.key] = res.data[mo.key]?.toString() || ''; }); setMonthlyValues(m);
      } else { setYearlyTarget('500000'); setMode('even'); setMonthlyValues({}); }
      setHasChanges(false);
    } catch { setYearlyTarget('500000'); setMode('even'); setMonthlyValues({}); setHasChanges(false); }
    finally { setLoading(false); }
  };

  const targetNum = parseFloat(yearlyTarget.replace(/,/g, '')) || 0;
  const evenAmount = targetNum / 12;

  const monthsData = useMemo(() => MONTHS.map(m => ({ ...m, value: mode === 'even' ? evenAmount.toFixed(0) : monthlyValues[m.key] || '' })), [mode, monthlyValues, evenAmount]);
  const customTotal = useMemo(() => mode === 'even' ? targetNum : MONTHS.reduce((s, m) => s + (parseFloat(monthlyValues[m.key]) || 0), 0), [mode, monthlyValues, targetNum]);
  const isBalanced = Math.abs(customTotal - targetNum) < 1;

  const handleTargetChange = (e) => { setYearlyTarget(e.target.value.replace(/[^0-9]/g, '')); setHasChanges(true); };
  const handleModeChange = (newMode) => {
    if (newMode === 'even' && mode === 'custom') {
      const even = (targetNum / 12).toFixed(0);
      const nv = {}; MONTHS.forEach(m => { nv[m.key] = even; }); setMonthlyValues(nv);
    }
    setMode(newMode); setHasChanges(true);
  };
  const handleMonthChange = useCallback((key, value) => { setMonthlyValues(p => ({ ...p, [key]: value })); setHasChanges(true); }, []);
  const handleDistributeEvenly = () => {
    const even = (targetNum / 12).toFixed(0);
    const nv = {}; MONTHS.forEach(m => { nv[m.key] = even; }); setMonthlyValues(nv); setMode('even'); setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { yearly_target: targetNum, distribution_mode: mode };
      MONTHS.forEach(m => { payload[m.key] = mode === 'even' ? evenAmount : parseFloat(monthlyValues[m.key]) || 0; });
      await api.setGoals(year, payload);
      success('Goals saved!'); setHasChanges(false);
    } catch (e) { showError(e.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const formatTarget = (v) => { if (!v) return ''; const n = parseInt(v.replace(/,/g, ''), 10); return isNaN(n) ? '' : n.toLocaleString(); };

  if (loading) return <div className="p-4 lg:p-6 max-w-4xl mx-auto"><Loading message="Loading goals..." /></div>;

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>{year} Goals</h1><p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Set your yearly production targets</p></div>
        <div className="flex gap-1">{[currentYear - 1, currentYear, currentYear + 1].map(y => (
          <button key={y} onClick={() => { if (hasChanges && !window.confirm('Unsaved changes. Continue?')) return; setYear(y); }} className="px-3 py-1.5 rounded-lg font-display font-bold text-sm transition-all" style={{ background: year === y ? 'var(--blue)' : 'var(--bg-tertiary)', color: year === y ? 'white' : 'var(--text-secondary)', boxShadow: year === y ? 'var(--shadow-brand)' : 'none' }}>{y}</button>
        ))}</div>
      </div>

      {/* Unsaved Warning */}
      {hasChanges && <div className="mb-4 px-4 py-2 rounded-lg flex items-center justify-between text-sm" style={{ background: 'var(--gold-light)', border: '1px solid var(--gold)', color: 'var(--gold)' }}><span className="font-semibold">Unsaved changes</span><button onClick={handleSave} disabled={saving} className="font-bold uppercase tracking-wide">{saving ? 'Saving...' : 'Save Now'}</button></div>}

      {/* Yearly Target Hero */}
      <div className="mb-6 p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, var(--blue) 0%, var(--blue-dark) 100%)', boxShadow: 'var(--shadow-brand)' }}>
        <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'rgba(255,255,255,0.2)' }}><TargetIcon /></div><div><h2 className="font-display text-sm font-semibold uppercase tracking-wider text-white/80">Yearly Target</h2><p className="text-xs text-white/60">Total production goal for {year}</p></div></div>
        <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-white/50">$</span><input type="text" inputMode="numeric" value={formatTarget(yearlyTarget)} onChange={handleTargetChange} className="w-full pl-12 pr-4 py-4 text-3xl font-display font-bold rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/40" placeholder="500,000" /></div>
        <p className="mt-3 text-sm text-white/60 text-center">${evenAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} per month average</p>
      </div>

      {/* Mode Toggle */}
      <div className="mb-6 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
        <div className="flex items-center gap-3" style={{ color: 'var(--text-muted)' }}><ToggleIcon /><div><h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Distribution Mode</h3><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{mode === 'even' ? 'Dividing evenly across all months' : 'Custom amounts per month'}</p></div></div>
        <div className="flex gap-2">
          <button onClick={() => handleModeChange('even')} className="px-4 py-2 rounded-lg font-semibold text-sm transition-all" style={{ background: mode === 'even' ? 'var(--blue-light)' : 'var(--bg-tertiary)', color: mode === 'even' ? 'var(--blue)' : 'var(--text-secondary)', border: `2px solid ${mode === 'even' ? 'var(--blue)' : 'transparent'}` }}>Even Split</button>
          <button onClick={() => handleModeChange('custom')} className="px-4 py-2 rounded-lg font-semibold text-sm transition-all" style={{ background: mode === 'custom' ? 'var(--blue-light)' : 'var(--bg-tertiary)', color: mode === 'custom' ? 'var(--blue)' : 'var(--text-secondary)', border: `2px solid ${mode === 'custom' ? 'var(--blue)' : 'transparent'}` }}>Custom</button>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="mb-6"><DistributionBar months={monthsData} yearlyTarget={targetNum} /></div>

      {/* Monthly Grid */}
      <div className="mb-6 p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Monthly Breakdown</h3>
          {mode === 'custom' && <button onClick={handleDistributeEvenly} className="text-xs font-semibold uppercase" style={{ color: 'var(--blue)' }}>Reset to Even</button>}
        </div>
        <MonthlyGrid months={monthsData} onChange={handleMonthChange} disabled={mode === 'even'} evenAmount={evenAmount} />
        {mode === 'custom' && (
          <div className="mt-6 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-primary)' }}>
            <div><span className="text-sm" style={{ color: 'var(--text-muted)' }}>Monthly Total</span>{!isBalanced && <p className="text-xs mt-0.5" style={{ color: 'var(--gold)' }}>{customTotal > targetNum ? 'Over' : 'Under'} by ${Math.abs(customTotal - targetNum).toLocaleString()}</p>}</div>
            <span className="font-display text-xl font-bold" style={{ color: isBalanced ? 'var(--green)' : 'var(--gold)' }}>${customTotal.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Save */}
      <div className="flex justify-end"><button onClick={handleSave} disabled={saving || !hasChanges} className="btn btn-primary text-lg px-8 py-3" style={{ opacity: saving || !hasChanges ? 0.6 : 1 }}><SaveIcon />{saving ? 'Saving...' : 'Save Goals'}</button></div>
    </div>
  );
}