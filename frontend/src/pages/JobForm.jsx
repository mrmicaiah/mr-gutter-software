import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CurrencyInput from '../components/CurrencyInput';
import ConfirmModal from '../components/ConfirmModal';
import Loading from '../components/Loading';
import { useToast } from '../components/Toast';
import { ArrowLeftIcon, SaveIcon, TrashIcon, UserIcon, MapPinIcon, CalendarIcon, DollarIcon } from '../components/Icons';
import api from '../utils/api';

const Field = ({ label, error, children }) => (<div><label className="label">{label}</label>{children}{error && <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>{error}</p>}</div>);
const Section = ({ title, icon: Icon, children }) => (<div className="section" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: '12px', overflow: 'hidden' }}><div className="section-header"><div className="section-title">{Icon && <Icon />} {title}</div></div><div className="p-4 space-y-4">{children}</div></div>);

export default function JobForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { success, error: showError } = useToast();
  const [form, setForm] = useState({ client_name: '', phone: '', zipcode: '', full_price: '', material_cost: '', workers_cost: '', job_date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => { if (isEdit) fetchJob(); }, [id]);

  const fetchJob = async () => {
    try {
      const res = await api.getJob(id);
      const j = res.data;
      setForm({ client_name: j.client_name || '', phone: j.phone || '', zipcode: j.zipcode || '', full_price: j.full_price || '', material_cost: j.material_cost || '', workers_cost: j.workers_cost || '', job_date: j.job_date || '' });
    } catch (e) { showError('Failed to load job'); navigate('/jobs'); }
    finally { setLoading(false); }
  };

  const profit = (parseFloat(form.full_price) || 0) - (parseFloat(form.material_cost) || 0) - (parseFloat(form.workers_cost) || 0);
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: null })); };
  const formatPhone = (v) => { const c = v.replace(/\D/g, ''); return c.length <= 3 ? c : c.length <= 6 ? `${c.slice(0,3)}-${c.slice(3)}` : `${c.slice(0,3)}-${c.slice(3,6)}-${c.slice(6,10)}`; };

  const validate = () => {
    const e = {};
    if (!form.client_name.trim()) e.client_name = 'Required';
    if (!form.zipcode.trim()) e.zipcode = 'Required'; else if (!/^\d{5}$/.test(form.zipcode)) e.zipcode = 'Invalid zipcode';
    if (!form.full_price || parseFloat(form.full_price) <= 0) e.full_price = 'Required';
    if (form.material_cost === '' || parseFloat(form.material_cost) < 0) e.material_cost = 'Required';
    if (form.workers_cost === '' || parseFloat(form.workers_cost) < 0) e.workers_cost = 'Required';
    if (!form.job_date) e.job_date = 'Required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const data = { client_name: form.client_name.trim(), phone: form.phone.trim() || null, zipcode: form.zipcode.trim(), full_price: parseFloat(form.full_price), material_cost: parseFloat(form.material_cost), workers_cost: parseFloat(form.workers_cost), job_date: form.job_date };
      if (isEdit) await api.updateJob(id, data); else await api.createJob(data);
      success(isEdit ? 'Job updated' : 'Job created');
      navigate('/jobs');
    } catch (e) { showError(e.message || 'Failed to save'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await api.deleteJob(id); success('Job deleted'); navigate('/jobs'); }
    catch (e) { showError(e.message || 'Failed to delete'); setShowDelete(false); }
    finally { setDeleting(false); }
  };

  if (loading) return <div className="p-4 lg:p-6 max-w-2xl mx-auto"><Loading message="Loading job..." /></div>;

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto pb-24 lg:pb-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/jobs" className="p-2 -ml-2 rounded-lg" style={{ color: 'var(--text-muted)' }}><ArrowLeftIcon /></Link>
        <div><h1 className="font-display text-xl font-bold tracking-wider uppercase" style={{ color: 'var(--text-primary)' }}>{isEdit ? 'Edit Job' : 'New Job'}</h1></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Client Info" icon={UserIcon}>
          <Field label="Client Name *" error={errors.client_name}><input type="text" value={form.client_name} onChange={e => set('client_name', e.target.value)} className="input" placeholder="John Smith" style={{ borderColor: errors.client_name ? 'var(--red)' : undefined }} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone"><input type="tel" value={form.phone} onChange={e => set('phone', formatPhone(e.target.value))} className="input" placeholder="256-555-1234" maxLength={12} /></Field>
            <Field label="Zipcode *" error={errors.zipcode}><input type="text" value={form.zipcode} onChange={e => set('zipcode', e.target.value)} className="input" placeholder="35801" maxLength={5} inputMode="numeric" style={{ borderColor: errors.zipcode ? 'var(--red)' : undefined }} /></Field>
          </div>
        </Section>

        <Section title="Job Details" icon={CalendarIcon}>
          <Field label="Job Date *" error={errors.job_date}><input type="date" value={form.job_date} onChange={e => set('job_date', e.target.value)} className="input max-w-xs" style={{ borderColor: errors.job_date ? 'var(--red)' : undefined }} /></Field>
        </Section>

        <Section title="Pricing" icon={DollarIcon}>
          <Field label="Full Price *" error={errors.full_price}><CurrencyInput value={form.full_price} onChange={v => set('full_price', v)} error={!!errors.full_price} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Material Cost *" error={errors.material_cost}><CurrencyInput value={form.material_cost} onChange={v => set('material_cost', v)} error={!!errors.material_cost} /></Field>
            <Field label="Workers Cost *" error={errors.workers_cost}><CurrencyInput value={form.workers_cost} onChange={v => set('workers_cost', v)} error={!!errors.workers_cost} /></Field>
          </div>
          <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
            <div className="flex justify-between items-center"><span className="font-display text-sm font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Profit</span><span className="font-display text-2xl font-bold" style={{ color: profit >= 0 ? 'var(--green)' : 'var(--red)' }}>${profit.toFixed(2)}</span></div>
          </div>
        </Section>

        <div className="flex justify-between pt-4">
          {isEdit ? <button type="button" onClick={() => setShowDelete(true)} className="flex items-center gap-2 font-semibold" style={{ color: 'var(--red)' }}><TrashIcon />Delete</button> : <div />}
          <div className="flex gap-3"><Link to="/jobs" className="btn btn-secondary">Cancel</Link><button type="submit" disabled={submitting} className="btn btn-primary" style={{ opacity: submitting ? 0.7 : 1 }}><SaveIcon />{submitting ? 'Saving...' : 'Save'}</button></div>
        </div>
      </form>

      <ConfirmModal isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} title="Delete Job" message={`Delete job for "${form.client_name}"? This cannot be undone.`} confirmText="Delete" variant="danger" isLoading={deleting} />
    </div>
  );
}