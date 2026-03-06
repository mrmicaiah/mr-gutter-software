import { useState, useEffect } from 'react';
import CurrencyInput from './CurrencyInput';

const XIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
const TrashIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>);
const SaveIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /></svg>);

const STAGES = [{ key: 'waiting', label: 'Waiting on Estimate' }, { key: 'estimated', label: 'Estimated' }, { key: 'follow_up_1', label: 'Follow Up 1' }, { key: 'follow_up_2', label: 'Follow Up 2' }, { key: 'follow_up_3', label: 'Follow Up 3' }, { key: 'sold', label: 'Sold' }];

export default function EstimateForm({ estimate, onSave, onDelete, onClose, isNew = false }) {
  const [form, setForm] = useState({ client_name: '', estimate_amount: '', stage: 'waiting', notes: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (estimate) setForm({ client_name: estimate.client_name || '', estimate_amount: estimate.estimate_amount || '', stage: estimate.stage || 'waiting', notes: estimate.notes || '' }); }, [estimate]);

  const validate = () => { const e = {}; if (!form.client_name.trim()) e.client_name = 'Required'; if (form.stage !== 'waiting' && !form.estimate_amount) e.estimate_amount = 'Required for this stage'; setErrors(e); return !Object.keys(e).length; };
  const handleSave = async () => { if (!validate()) return; setSaving(true); try { await onSave({ ...form, estimate_amount: form.estimate_amount ? parseFloat(form.estimate_amount) : null }); } finally { setSaving(false); } };
  const handleDelete = async () => { if (!window.confirm('Delete this estimate?')) return; setDeleting(true); try { await onDelete(); } finally { setDeleting(false); } };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }} onClick={e => e.stopPropagation()}>
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-primary)' }}><h2 className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{isNew ? 'New Estimate' : 'Edit Estimate'}</h2><button onClick={onClose} className="p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}><XIcon /></button></div>
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div><label className="label">Client Name *</label><input type="text" value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} className="input" placeholder="John Smith" style={{ borderColor: errors.client_name ? 'var(--red)' : undefined }} />{errors.client_name && <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>{errors.client_name}</p>}</div>
          <div><label className="label">Estimate Amount {form.stage !== 'waiting' && '*'}</label><CurrencyInput value={form.estimate_amount} onChange={v => setForm(f => ({ ...f, estimate_amount: v }))} error={!!errors.estimate_amount} />{errors.estimate_amount && <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>{errors.estimate_amount}</p>}</div>
          <div><label className="label">Stage</label><select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))} className="input">{STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
          <div><label className="label">Notes</label><textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input" rows={3} placeholder="Additional notes..." /></div>
        </div>
        <div className="p-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-primary)' }}>{!isNew ? <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--red)' }}><TrashIcon />{deleting ? 'Deleting...' : 'Delete'}</button> : <div />}<div className="flex gap-3"><button onClick={onClose} className="btn btn-secondary">Cancel</button><button onClick={handleSave} disabled={saving} className="btn btn-primary"><SaveIcon />{saving ? 'Saving...' : 'Save'}</button></div></div>
      </div>
    </div>
  );
}
