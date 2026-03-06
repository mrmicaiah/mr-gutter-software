import { useState } from 'react';
import CurrencyInput from './CurrencyInput';

const CheckIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);

export default function ConvertToJobModal({ estimate, onConvert, onCancel }) {
  const [form, setForm] = useState({ 
    client_name: estimate?.client_name || '', 
    full_price: estimate?.estimate_amount || '', 
    material_cost: '', 
    workers_cost: '', 
    job_date: new Date().toISOString().split('T')[0] 
  });
  const [converting, setConverting] = useState(false);
  const profit = (parseFloat(form.full_price) || 0) - (parseFloat(form.material_cost) || 0) - (parseFloat(form.workers_cost) || 0);

  const handleConvert = async () => {
    setConverting(true);
    try { 
      await onConvert({ 
        client_name: form.client_name, 
        full_price: parseFloat(form.full_price), 
        material_cost: parseFloat(form.material_cost) || 0, 
        workers_cost: parseFloat(form.workers_cost) || 0, 
        job_date: form.job_date 
      }); 
    }
    finally { setConverting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '2px solid var(--green)' }}>
        <div className="p-4 text-center" style={{ background: 'var(--green-light)' }}>
          <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ background: 'var(--green)', color: 'white' }}><CheckIcon /></div>
          <h2 className="font-display text-lg font-bold" style={{ color: 'var(--green)' }}>Convert to Job!</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Great work! Let's record this sale.</p>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Client</label><input type="text" value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} className="input" /></div>
            <div><label className="label">Date</label><input type="date" value={form.job_date} onChange={e => setForm(f => ({ ...f, job_date: e.target.value }))} className="input" /></div>
          </div>
          <div><label className="label">Full Price</label><CurrencyInput value={form.full_price} onChange={v => setForm(f => ({ ...f, full_price: v }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Material Cost</label><CurrencyInput value={form.material_cost} onChange={v => setForm(f => ({ ...f, material_cost: v }))} /></div>
            <div><label className="label">Workers Cost</label><CurrencyInput value={form.workers_cost} onChange={v => setForm(f => ({ ...f, workers_cost: v }))} /></div>
          </div>
          <div className="p-3 rounded-lg text-center" style={{ background: 'var(--bg-tertiary)' }}>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Estimated Profit</p>
            <p className="font-display text-2xl font-bold" style={{ color: profit >= 0 ? 'var(--green)' : 'var(--red)' }}>${profit.toLocaleString()}</p>
          </div>
        </div>
        <div className="p-4 flex gap-3" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <button onClick={onCancel} className="btn btn-secondary flex-1">Cancel</button>
          <button onClick={handleConvert} disabled={converting} className="btn btn-primary flex-1" style={{ background: 'var(--green)' }}>{converting ? 'Creating...' : 'Create Job'}</button>
        </div>
      </div>
    </div>
  );
}
