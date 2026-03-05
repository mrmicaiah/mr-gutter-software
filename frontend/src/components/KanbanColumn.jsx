import { useState } from 'react';
import EstimateCard from './EstimateCard';

export default function KanbanColumn({ stage, title, estimates, total, color, onCardClick, onDrop, onDragStart, onDragEnd, draggingId }) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); const id = e.dataTransfer.getData('estimateId'); if (id) onDrop(id, stage); };

  return (
    <div 
      className="flex flex-col rounded-xl transition-all" 
      style={{ 
        background: dragOver ? 'var(--bg-tertiary)' : 'var(--bg-secondary)', 
        border: `2px dashed ${dragOver ? color : 'transparent'}`, 
        minHeight: '400px',
        width: '200px',
        minWidth: '200px',
        flexShrink: 0,
      }} 
      onDragOver={handleDragOver} 
      onDragLeave={handleDragLeave} 
      onDrop={handleDrop}
    >
      <div className="p-2 sticky top-0 z-10" style={{ background: 'var(--bg-secondary)' }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            <h3 className="font-display text-xs font-bold uppercase tracking-wide truncate" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          </div>
          <span className="px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{estimates.length}</span>
        </div>
        {total > 0 && <p className="font-display text-sm font-bold" style={{ color }}>${total.toLocaleString()}</p>}
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        {estimates.length === 0 ? (
          <div className="h-20 rounded-lg border-2 border-dashed flex items-center justify-center text-xs" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}>Drop here</div>
        ) : estimates.map(est => <EstimateCard key={est.id} estimate={est} onClick={onCardClick} onDragStart={onDragStart} onDragEnd={onDragEnd} isDragging={draggingId === est.id} />)}
      </div>
    </div>
  );
}
