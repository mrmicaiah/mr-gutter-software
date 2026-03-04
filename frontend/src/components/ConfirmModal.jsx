import { useEffect, useRef } from 'react';

const AlertTriangleIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);

export default function ConfirmModal({ isOpen, onClose, onConfirm, title = 'Confirm Action', message = 'Are you sure you want to proceed?', confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger', isLoading = false }) {
  const modalRef = useRef(null);
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) { confirmButtonRef.current?.focus(); document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape' && isOpen && !isLoading) onClose(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onClose]);

  const handleBackdropClick = (e) => { if (e.target === modalRef.current && !isLoading) onClose(); };
  if (!isOpen) return null;

  const variantConfig = { danger: { iconBg: 'var(--red-light)', iconColor: 'var(--red)', buttonBg: 'var(--red)' }, warning: { iconBg: 'var(--gold-light)', iconColor: 'var(--gold)', buttonBg: 'var(--gold)' }, info: { iconBg: 'var(--blue-light)', iconColor: 'var(--blue)', buttonBg: 'var(--blue)' } }[variant];

  return (
    <div ref={modalRef} onClick={handleBackdropClick} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', boxShadow: 'var(--shadow-lg)', animation: 'modal-in 0.2s ease-out' }}>
        <div className="flex justify-center mb-4"><div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: variantConfig.iconBg, color: variantConfig.iconColor }}><AlertTriangleIcon /></div></div>
        <h2 className="text-lg font-bold text-center mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        <p className="text-sm text-center mb-6" style={{ color: 'var(--text-muted)' }}>{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={isLoading} className="btn btn-secondary flex-1">{cancelText}</button>
          <button ref={confirmButtonRef} onClick={onConfirm} disabled={isLoading} className="btn flex-1 text-white" style={{ background: variantConfig.buttonBg, opacity: isLoading ? 0.7 : 1 }}>{isLoading ? 'Loading...' : confirmText}</button>
        </div>
      </div>
      <style>{`@keyframes modal-in { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
    </div>
  );
}