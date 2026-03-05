import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CurrencyInput from '../components/CurrencyInput';
import ConfirmModal from '../components/ConfirmModal';
import Loading from '../components/Loading';
import { useToast } from '../components/Toast';
import api from '../utils/api';

const ArrowLeftIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>);
const SaveIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>);
const TrashIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>);
const UserIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
const DollarIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>);
const ClipboardIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>);

const STAGES = [
  { key: 'waiting', label: 'Waiting on Estimate' },
  { key: 'estimated', label: 'Estimated' },
  { key: 'follow_up_1', label: 'Follow Up 1' },
  { key: 'follow_up_2', label: 'Follow Up 2' },
  { key: 'follow_up_3', label: 'Follow Up 3' },
  { key: 'sold', label: 'Sold' },
];

const Field = ({ label, error, children }) => (
  <div>
    <label className="label">{label}</label>
    {children}
    {error && <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>{error}</p>}
  </div>
);

const Section = ({ title, icon: Icon, children }) => (
  <div className="section" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: '12px', overflow: 'hidden' }}>
    <div className="section-header">
      <div className="section-title">{Icon && <Icon />} {title}</div>
    </div>
    <div className="p-4 space-y-4">{children}</div>
  </div>
);

export default function EstimateFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { success, error: showError } = useToast();
  
  const [form, setForm] = useState({
    client_name: '',
    phone: '',
    zipcode: '',
    estimate_amount: '',
    stage: 'waiting',
    notes: '',
  });
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) fetchEstimate();
  }, [id]);

  const fetchEstimate = async () => {
    try {
      const res = await api.getEstimate(id);
      const e = res.data;
      setForm({
        client_name: e.client_name || '',
        phone: e.phone || '',
        zipcode: e.zipcode || '',
        estimate_amount: e.estimate_amount || '',
        stage: e.stage || 'waiting',
        notes: e.notes || '',
      });
    } catch (e) {
      showError('Failed to load estimate');
      navigate('/estimates');
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }));
  };

  const formatPhone = (v) => {
    const c = v.replace(/\D/g, '');
    return c.length <= 3 ? c : c.length <= 6 ? `${c.slice(0,3)}-${c.slice(3)}` : `${c.slice(0,3)}-${c.slice(3,6)}-${c.slice(6,10)}`;
  };

  const validate = () => {
    const e = {};
    if (!form.client_name.trim()) e.client_name = 'Required';
    if (!form.zipcode.trim()) e.zipcode = 'Required';
    else if (!/^\d{5}$/.test(form.zipcode)) e.zipcode = 'Invalid zipcode';
    if (form.stage !== 'waiting' && !form.estimate_amount) e.estimate_amount = 'Required for this stage';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const data = {
        client_name: form.client_name.trim(),
        phone: form.phone.trim() || null,
        zipcode: form.zipcode.trim(),
        estimate_amount: form.estimate_amount ? parseFloat(form.estimate_amount) : null,
        stage: form.stage,
        notes: form.notes.trim() || null,
      };
      if (isEdit) {
        await api.updateEstimate(id, data);
      } else {
        await api.createEstimate(data);
      }
      success(isEdit ? 'Estimate updated' : 'Estimate created');
      navigate('/estimates');
    } catch (e) {
      showError(e.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteEstimate(id);
      success('Estimate deleted');
      navigate('/estimates');
    } catch (e) {
      showError(e.message || 'Failed to delete');
      setShowDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-4 lg:p-6 max-w-2xl mx-auto"><Loading message="Loading estimate..." /></div>;

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto pb-24 lg:pb-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/estimates" className="p-2 -ml-2 rounded-lg" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeftIcon />
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold tracking-wider uppercase" style={{ color: 'var(--text-primary)' }}>
            {isEdit ? 'Edit Estimate' : 'New Estimate'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Client Info" icon={UserIcon}>
          <Field label="Client Name *" error={errors.client_name}>
            <input
              type="text"
              value={form.client_name}
              onChange={e => set('client_name', e.target.value)}
              className="input"
              placeholder="John Smith"
              style={{ borderColor: errors.client_name ? 'var(--red)' : undefined }}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone">
              <input
                type="tel"
                value={form.phone}
                onChange={e => set('phone', formatPhone(e.target.value))}
                className="input"
                placeholder="256-555-1234"
                maxLength={12}
              />
            </Field>
            <Field label="Zipcode *" error={errors.zipcode}>
              <input
                type="text"
                value={form.zipcode}
                onChange={e => set('zipcode', e.target.value)}
                className="input"
                placeholder="35801"
                maxLength={5}
                inputMode="numeric"
                style={{ borderColor: errors.zipcode ? 'var(--red)' : undefined }}
              />
            </Field>
          </div>
        </Section>

        <Section title="Estimate Details" icon={DollarIcon}>
          <Field label={`Estimate Amount ${form.stage !== 'waiting' ? '*' : ''}`} error={errors.estimate_amount}>
            <CurrencyInput
              value={form.estimate_amount}
              onChange={v => set('estimate_amount', v)}
              error={!!errors.estimate_amount}
            />
          </Field>
          <Field label="Stage">
            <select
              value={form.stage}
              onChange={e => set('stage', e.target.value)}
              className="input"
            >
              {STAGES.map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </Field>
        </Section>

        <Section title="Notes" icon={ClipboardIcon}>
          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              className="input"
              rows={4}
              placeholder="Additional notes about this estimate..."
            />
          </Field>
        </Section>

        <div className="flex justify-between pt-4">
          {isEdit ? (
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              className="flex items-center gap-2 font-semibold"
              style={{ color: 'var(--red)' }}
            >
              <TrashIcon />Delete
            </button>
          ) : <div />}
          <div className="flex gap-3">
            <Link to="/estimates" className="btn btn-secondary">Cancel</Link>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ opacity: submitting ? 0.7 : 1 }}
            >
              <SaveIcon />{submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </form>

      <ConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Estimate"
        message={`Delete estimate for "${form.client_name}"? This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}
