import { useState, useEffect, useMemo } from 'react';
import { useToast } from '../components/Toast';
import KanbanColumn from '../components/KanbanColumn';
import EstimateForm from '../components/EstimateForm';
import AmountPrompt from '../components/AmountPrompt';
import ConvertToJobModal from '../components/ConvertToJobModal';
import Loading from '../components/Loading';
import api from '../utils/api';

const PlusIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>);
const RefreshIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>);
const FunnelIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>);
const FireIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>);
const ThermometerIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>);
const SnowflakeIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/><line x1="2" y1="12" x2="22" y2="12"/></svg>);

const STAGES = [
  { key: 'waiting', title: 'Waiting', color: 'var(--gold)' }, 
  { key: 'estimated', title: 'Estimated', color: 'var(--blue)' }, 
  { key: 'follow_up_1', title: 'Follow Up 1', color: 'var(--blue-bright)' }, 
  { key: 'follow_up_2', title: 'Follow Up 2', color: 'var(--gold)' }, 
  { key: 'follow_up_3', title: 'Follow Up 3', color: 'var(--red)' }, 
  { key: 'sold', title: 'Sold', color: 'var(--green)' }
];

// Get temperature based on age
const getTemperature = (createdAt) => {
  if (!createdAt) return 'hot';
  const now = new Date();
  const created = new Date(createdAt);
  const daysDiff = Math.floor((now - created) / (1000 * 60 * 60 * 24));
  
  if (daysDiff <= 7) return 'hot';
  if (daysDiff <= 21) return 'warm';
  return 'cold';
};

export default function EstimatesPipeline() {
  const { success, error: showError } = useToast();
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [draggingId, setDraggingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState(null);
  const [amountPrompt, setAmountPrompt] = useState(null);
  const [convertModal, setConvertModal] = useState(null);

  useEffect(() => { fetchEstimates(); }, []);

  const fetchEstimates = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try { const res = await api.getEstimates(); setEstimates(res.data || []); }
    catch (e) { showError('Failed to load estimates'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  // Add temperature to each estimate
  const estimatesWithTemp = useMemo(() => {
    return estimates.map(e => ({
      ...e,
      temperature: getTemperature(e.created_at)
    }));
  }, [estimates]);

  const grouped = useMemo(() => {
    const g = {}; STAGES.forEach(s => { g[s.key] = { estimates: [], total: 0 }; });
    estimatesWithTemp.forEach(e => { 
      if (g[e.stage]) { 
        g[e.stage].estimates.push(e); 
        g[e.stage].total += e.estimate_amount || 0; 
      } 
    });
    return g;
  }, [estimatesWithTemp]);

  // Calculate temperature totals (exclude 'sold' from temperature tracking)
  const tempTotals = useMemo(() => {
    const totals = { hot: 0, warm: 0, cold: 0 };
    estimatesWithTemp.forEach(e => {
      if (e.stage !== 'sold' && e.estimate_amount) {
        totals[e.temperature] += e.estimate_amount;
      }
    });
    return totals;
  }, [estimatesWithTemp]);

  const pipelineTotal = useMemo(() => estimates.filter(e => e.stage !== 'sold').reduce((s, e) => s + (e.estimate_amount || 0), 0), [estimates]);

  const handleCardClick = (est) => { setEditingEstimate(est); setShowForm(true); };

  const handleDrop = async (estimateId, newStage) => {
    const est = estimatesWithTemp.find(e => e.id === estimateId);
    if (!est || est.stage === newStage) return;
    if (newStage !== 'waiting' && !est.estimate_amount) { setAmountPrompt({ estimateId, newStage }); return; }
    if (newStage === 'sold') { setConvertModal({ ...est, stage: newStage }); return; }
    await updateStage(estimateId, newStage);
  };

  const updateStage = async (id, stage, extra = {}) => {
    try { await api.updateEstimate(id, { stage, ...extra }); setEstimates(p => p.map(e => e.id === id ? { ...e, stage, ...extra } : e)); success('Estimate updated'); }
    catch { showError('Failed to update'); }
  };

  const handleAmountConfirm = async (amount) => {
    const { estimateId, newStage } = amountPrompt;
    if (newStage === 'sold') { const est = estimatesWithTemp.find(e => e.id === estimateId); setAmountPrompt(null); setConvertModal({ ...est, estimate_amount: amount, stage: newStage }); }
    else { await updateStage(estimateId, newStage, { estimate_amount: amount }); setAmountPrompt(null); }
  };

  const handleConvert = async (jobData) => {
    try {
      await api.createJob(jobData);
      await api.updateEstimate(convertModal.id, { stage: 'sold', estimate_amount: convertModal.estimate_amount });
      setEstimates(p => p.map(e => e.id === convertModal.id ? { ...e, stage: 'sold' } : e));
      success('Job created! 🎉'); setConvertModal(null);
    } catch { showError('Failed to convert'); }
  };

  const handleSave = async (data) => {
    try {
      if (editingEstimate) { await api.updateEstimate(editingEstimate.id, data); setEstimates(p => p.map(e => e.id === editingEstimate.id ? { ...e, ...data } : e)); success('Updated'); }
      else { const res = await api.createEstimate({ ...data, stage: 'waiting' }); setEstimates(p => [...p, res.data]); success('Created'); }
      setShowForm(false); setEditingEstimate(null);
    } catch { showError('Failed to save'); }
  };

  const handleDelete = async () => {
    try { await api.deleteEstimate(editingEstimate.id); setEstimates(p => p.filter(e => e.id !== editingEstimate.id)); success('Deleted'); setShowForm(false); setEditingEstimate(null); }
    catch { showError('Failed to delete'); }
  };

  if (loading) return <div className="p-4 lg:p-6"><Loading message="Loading pipeline..." /></div>;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 lg:p-6 flex-shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}><FunnelIcon /></div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>Estimates Pipeline</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{estimates.filter(e => e.stage !== 'sold').length} active • ${pipelineTotal.toLocaleString()} in pipeline</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => fetchEstimates(true)} disabled={refreshing} className="btn btn-secondary"><span style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none', display: 'inline-block' }}><RefreshIcon /></span></button>
            <button onClick={() => { setEditingEstimate(null); setShowForm(true); }} className="btn btn-primary"><PlusIcon /><span className="hidden sm:inline">Add Lead</span></button>
          </div>
        </div>

        {/* Temperature Totals */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Hot */}
          <div className="p-3 rounded-xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #ff4444 0%, #ff6b35 100%)', boxShadow: '0 4px 20px rgba(255, 68, 68, 0.3)' }}>
            <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 30% 50%, white 0%, transparent 60%)' }} />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80">🔥 Hot</p>
                <p className="text-xs text-white/60">Under 1 week</p>
              </div>
              <FireIcon style={{ color: 'white', opacity: 0.8 }} />
            </div>
            <p className="relative font-display text-2xl font-bold text-white mt-2">${tempTotals.hot.toLocaleString()}</p>
          </div>

          {/* Warm */}
          <div className="p-3 rounded-xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #ff6b35 0%, #4a90d9 100%)', boxShadow: '0 4px 20px rgba(255, 107, 53, 0.2)' }}>
            <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 50% 50%, white 0%, transparent 60%)' }} />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80">🌡️ Warm</p>
                <p className="text-xs text-white/60">1-3 weeks</p>
              </div>
              <ThermometerIcon style={{ color: 'white', opacity: 0.8 }} />
            </div>
            <p className="relative font-display text-2xl font-bold text-white mt-2">${tempTotals.warm.toLocaleString()}</p>
          </div>

          {/* Cold */}
          <div className="p-3 rounded-xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4a90d9 0%, #2563eb 100%)', boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3)' }}>
            <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 70% 50%, white 0%, transparent 60%)' }} />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80">❄️ Cold</p>
                <p className="text-xs text-white/60">Over 3 weeks</p>
              </div>
              <SnowflakeIcon style={{ color: 'white', opacity: 0.8 }} />
            </div>
            <p className="relative font-display text-2xl font-bold text-white mt-2">${tempTotals.cold.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto px-4 lg:px-6 pb-24 lg:pb-6">
        <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
          {STAGES.map(s => (
            <KanbanColumn 
              key={s.key} 
              stage={s.key} 
              title={s.title} 
              color={s.color} 
              estimates={grouped[s.key]?.estimates || []} 
              total={grouped[s.key]?.total || 0} 
              onCardClick={handleCardClick} 
              onDrop={handleDrop} 
              onDragStart={(e) => setDraggingId(e.id)} 
              onDragEnd={() => setDraggingId(null)} 
              draggingId={draggingId} 
            />
          ))}
        </div>
      </div>

      {showForm && <EstimateForm estimate={editingEstimate} isNew={!editingEstimate} onSave={handleSave} onDelete={handleDelete} onClose={() => { setShowForm(false); setEditingEstimate(null); }} />}
      {amountPrompt && <AmountPrompt title="Enter Estimate Amount" onConfirm={handleAmountConfirm} onCancel={() => setAmountPrompt(null)} />}
      {convertModal && <ConvertToJobModal estimate={convertModal} onConvert={handleConvert} onCancel={() => setConvertModal(null)} />}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
