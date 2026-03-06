import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CurrencyInput from '../components/CurrencyInput';
import { useToast } from '../components/Toast';
import api from '../utils/api';

const ArrowLeftIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>);
const SaveIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>);
const CalendarIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);
const PlusIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>);
const TrashIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>);

const INITIAL_ROWS = 5;

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

export default function AddWeekForm() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  
  const monday = getMonday(new Date());
  
  const [materialsTotal, setMaterialsTotal] = useState('');
  const [laborTotal, setLaborTotal] = useState('');
  const [rows, setRows] = useState(
    Array.from({ length: INITIAL_ROWS }, (_, i) => ({
      id: i,
      date: formatDate(monday),
      client_name: '',
      sale_amount: '',
    }))
  );
  const [saving, setSaving] = useState(false);

  const activeRows = useMemo(() => 
    rows.filter(r => r.client_name.trim() && r.sale_amount),
    [rows]
  );

  const totalSales = useMemo(() => 
    activeRows.reduce((sum, r) => sum + (parseFloat(r.sale_amount) || 0), 0),
    [activeRows]
  );

  const materials = parseFloat(materialsTotal) || 0;
  const labor = parseFloat(laborTotal) || 0;
  const profit = totalSales - materials - labor;

  const allocations = useMemo(() => {
    if (totalSales === 0) return {};
    
    const alloc = {};
    let remainingMaterials = materials;
    let remainingLabor = labor;
    
    activeRows.forEach((row, index) => {
      const saleAmount = parseFloat(row.sale_amount) || 0;
      const proportion = saleAmount / totalSales;
      
      if (index === activeRows.length - 1) {
        alloc[row.id] = {
          materials: Math.round(remainingMaterials * 100) / 100,
          labor: Math.round(remainingLabor * 100) / 100,
        };
      } else {
        const rowMaterials = Math.round(materials * proportion * 100) / 100;
        const rowLabor = Math.round(labor * proportion * 100) / 100;
        alloc[row.id] = { materials: rowMaterials, labor: rowLabor };
        remainingMaterials -= rowMaterials;
        remainingLabor -= rowLabor;
      }
    });
    
    return alloc;
  }, [activeRows, materials, labor, totalSales]);

  const updateRow = (id, field, value) => {
    setRows(prev => prev.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const addRow = () => {
    setRows(prev => [...prev, {
      id: Date.now(),
      date: formatDate(monday),
      client_name: '',
      sale_amount: '',
    }]);
  };

  const removeRow = (id) => {
    if (rows.length <= 1) return;
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const handleSave = async () => {
    if (activeRows.length === 0) {
      showError('Add at least one job');
      return;
    }

    if (!materials && !labor) {
      showError('Enter materials or labor cost');
      return;
    }

    setSaving(true);
    
    try {
      for (const row of activeRows) {
        const alloc = allocations[row.id] || { materials: 0, labor: 0 };
        await api.createJob({
          client_name: row.client_name.trim(),
          full_price: parseFloat(row.sale_amount),
          material_cost: alloc.materials,
          workers_cost: alloc.labor,
          job_date: row.date,
        });
      }
      
      success(`Created ${activeRows.length} jobs`);
      navigate('/jobs');
    } catch (err) {
      showError(err.message || 'Failed to save jobs');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/jobs')} className="p-2 -ml-2 rounded-lg" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeftIcon />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>
            <CalendarIcon />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-wider uppercase" style={{ color: 'var(--text-primary)' }}>Add Week</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Week of {monday.toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Costs Header */}
      <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
        <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Weekly Costs</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Materials</label>
            <CurrencyInput 
              value={materialsTotal} 
              onChange={setMaterialsTotal}
              placeholder="0"
            />
          </div>
          <div>
            <label className="label">Labor</label>
            <CurrencyInput 
              value={laborTotal} 
              onChange={setLaborTotal}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Jobs - Mobile: Cards, Desktop: Table */}
      <div className="rounded-xl overflow-hidden mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
        
        {/* Desktop Table Header - hidden on mobile */}
        <div className="hidden lg:grid grid-cols-12 gap-2 p-3 text-xs font-semibold uppercase tracking-wide" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
          <div className="col-span-2">Date</div>
          <div className="col-span-4">Client</div>
          <div className="col-span-2">Sale</div>
          <div className="col-span-2">Mat / Lab</div>
          <div className="col-span-2"></div>
        </div>

        {/* Rows */}
        <div className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
          {rows.map((row, index) => {
            const alloc = allocations[row.id] || { materials: 0, labor: 0 };
            const hasData = row.client_name.trim() && row.sale_amount;
            
            return (
              <div key={row.id}>
                {/* Mobile Layout */}
                <div className="lg:hidden p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Job {index + 1}</span>
                    <button
                      onClick={() => removeRow(row.id)}
                      className="p-1.5 rounded-lg"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Date</label>
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e) => updateRow(row.id, 'date', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{ 
                          background: 'var(--bg-tertiary)', 
                          border: '1px solid var(--border-primary)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Sale</label>
                      <CurrencyInput
                        value={row.sale_amount}
                        onChange={(v) => updateRow(row.id, 'sale_amount', v)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Client Name</label>
                    <input
                      type="text"
                      value={row.client_name}
                      onChange={(e) => updateRow(row.id, 'client_name', e.target.value)}
                      placeholder="Client name"
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{ 
                        background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                  
                  {hasData && (
                    <div className="flex gap-3 pt-1">
                      <div className="flex-1 px-3 py-2 rounded-lg text-center text-sm" style={{ background: 'var(--bg-secondary)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Mat: </span>
                        <span style={{ color: 'var(--text-secondary)' }}>${alloc.materials.toLocaleString()}</span>
                      </div>
                      <div className="flex-1 px-3 py-2 rounded-lg text-center text-sm" style={{ background: 'var(--bg-secondary)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Lab: </span>
                        <span style={{ color: 'var(--text-secondary)' }}>${alloc.labor.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:grid grid-cols-12 gap-2 p-2 items-center">
                  <div className="col-span-2">
                    <input
                      type="date"
                      value={row.date}
                      onChange={(e) => updateRow(row.id, 'date', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg text-sm"
                      style={{ 
                        background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={row.client_name}
                      onChange={(e) => updateRow(row.id, 'client_name', e.target.value)}
                      placeholder="Client name"
                      className="w-full px-2 py-1.5 rounded-lg text-sm"
                      style={{ 
                        background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                  <div className="col-span-2">
                    <CurrencyInput
                      value={row.sale_amount}
                      onChange={(v) => updateRow(row.id, 'sale_amount', v)}
                      placeholder="0"
                      compact
                    />
                  </div>
                  <div className="col-span-2 text-sm text-center" style={{ color: hasData ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                    {hasData ? `$${alloc.materials} / $${alloc.labor}` : '-'}
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <button
                      onClick={() => removeRow(row.id)}
                      className="p-1 rounded-lg transition-colors hover:bg-red-500/20"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Row Button */}
        <div className="p-3" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <button
            onClick={addRow}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-colors"
            style={{ color: 'var(--blue)', background: 'var(--blue-light)' }}
          >
            <PlusIcon /> Add Job
          </button>
        </div>
      </div>

      {/* Profit Summary */}
      <div className="rounded-xl p-4 mb-6" style={{ background: profit >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${profit >= 0 ? 'var(--green)' : 'var(--red)'}` }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Week Profit</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              ${totalSales.toLocaleString()} - ${materials.toLocaleString()} - ${labor.toLocaleString()}
            </p>
          </div>
          <p className="font-display text-3xl font-bold" style={{ color: profit >= 0 ? 'var(--green)' : 'var(--red)' }}>
            ${profit.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button onClick={() => navigate('/jobs')} className="btn btn-secondary">Cancel</button>
        <button
          onClick={handleSave}
          disabled={saving || activeRows.length === 0}
          className="btn btn-primary"
          style={{ opacity: saving || activeRows.length === 0 ? 0.7 : 1 }}
        >
          <SaveIcon />
          {saving ? 'Saving...' : `Save ${activeRows.length} Jobs`}
        </button>
      </div>
    </div>
  );
}
