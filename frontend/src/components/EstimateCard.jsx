const STAGE_COLORS = { waiting: 'var(--gold)', estimated: 'var(--blue)', follow_up_1: 'var(--blue-bright)', follow_up_2: 'var(--gold)', follow_up_3: 'var(--red)', sold: 'var(--green)' };

const TEMP_STYLES = {
  hot: {
    glow: '0 0 12px rgba(255, 68, 68, 0.5), 0 0 4px rgba(255, 107, 53, 0.3)',
    border: '#ff4444',
    gradient: 'linear-gradient(135deg, rgba(255, 68, 68, 0.1) 0%, rgba(255, 107, 53, 0.05) 100%)',
    icon: '🔥',
  },
  warm: {
    glow: '0 0 10px rgba(255, 107, 53, 0.3), 0 0 4px rgba(74, 144, 217, 0.2)',
    border: 'linear-gradient(135deg, #ff6b35, #4a90d9)',
    gradient: 'linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(74, 144, 217, 0.08) 100%)',
    icon: '🌡️',
  },
  cold: {
    glow: '0 0 12px rgba(37, 99, 235, 0.4), 0 0 4px rgba(74, 144, 217, 0.3)',
    border: '#2563eb',
    gradient: 'linear-gradient(135deg, rgba(74, 144, 217, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
    icon: '❄️',
  },
};

export default function EstimateCard({ estimate, onClick, onDragStart, onDragEnd, isDragging }) {
  const color = STAGE_COLORS[estimate.stage] || 'var(--blue)';
  const amount = estimate.estimate_amount ? `$${estimate.estimate_amount.toLocaleString()}` : null;
  const temp = estimate.temperature || 'hot';
  const tempStyle = TEMP_STYLES[temp];
  
  const isSold = estimate.stage === 'sold';

  return (
    <div 
      draggable 
      onDragStart={(e) => { e.dataTransfer.setData('estimateId', estimate.id); e.dataTransfer.effectAllowed = 'move'; onDragStart?.(estimate); }} 
      onDragEnd={onDragEnd} 
      onClick={() => onClick?.(estimate)} 
      className="p-2 rounded-lg cursor-grab active:cursor-grabbing transition-all relative" 
      style={{ 
        background: isSold ? 'var(--bg-card)' : tempStyle.gradient,
        border: `1px solid ${isSold ? 'var(--border-primary)' : tempStyle.border}`, 
        borderLeft: `3px solid ${color}`, 
        opacity: isDragging ? 0.5 : 1, 
        transform: isDragging ? 'rotate(2deg) scale(1.02)' : 'none', 
        boxShadow: isDragging ? 'var(--shadow-lg)' : (isSold ? 'var(--shadow-sm)' : tempStyle.glow),
      }}
    >
      {!isSold && (
        <span className="absolute -top-1 -right-1 text-xs" title={`${temp} lead`}>{tempStyle.icon}</span>
      )}
      
      <div className="flex items-start justify-between gap-1 mb-1">
        <h4 className="font-semibold text-xs leading-tight truncate" style={{ color: 'var(--text-primary)' }}>{estimate.client_name}</h4>
        {amount && <span className="font-display font-bold text-xs whitespace-nowrap" style={{ color: 'var(--green)' }}>{amount}</span>}
      </div>
      {estimate.notes && (
        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{estimate.notes}</p>
      )}
    </div>
  );
}
