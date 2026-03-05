const PhoneIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0 1 22 16.92z" /></svg>);
const MapPinIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>);
const NotesIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>);

const STAGE_COLORS = { waiting: 'var(--gold)', estimated: 'var(--blue)', follow_up_1: 'var(--blue-bright)', follow_up_2: 'var(--gold)', follow_up_3: 'var(--red)', sold: 'var(--green)' };

export default function EstimateCard({ estimate, onClick, onDragStart, onDragEnd, isDragging }) {
  const color = STAGE_COLORS[estimate.stage] || 'var(--blue)';
  const amount = estimate.estimate_amount ? `$${estimate.estimate_amount.toLocaleString()}` : null;

  return (
    <div draggable onDragStart={(e) => { e.dataTransfer.setData('estimateId', estimate.id); e.dataTransfer.effectAllowed = 'move'; onDragStart?.(estimate); }} onDragEnd={onDragEnd} onClick={() => onClick?.(estimate)} className="p-3 rounded-lg cursor-grab active:cursor-grabbing transition-all" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderLeft: `3px solid ${color}`, opacity: isDragging ? 0.5 : 1, transform: isDragging ? 'rotate(2deg) scale(1.02)' : 'none', boxShadow: isDragging ? 'var(--shadow-lg)' : 'var(--shadow-sm)' }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{estimate.client_name}</h4>
        {amount && <span className="font-display font-bold text-sm whitespace-nowrap" style={{ color: 'var(--green)' }}>{amount}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span className="flex items-center gap-1"><MapPinIcon />{estimate.zipcode}</span>
        {estimate.phone && <span className="flex items-center gap-1"><PhoneIcon />{estimate.phone}</span>}
        {estimate.notes && <span className="flex items-center gap-1" title={estimate.notes}><NotesIcon /></span>}
      </div>
    </div>
  );
}