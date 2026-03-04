import { useState, useEffect, createContext, useContext, useCallback } from 'react';

const CheckIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>);
const XIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const AlertIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>);

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    return id;
  }, []);
  const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  const success = useCallback((message) => addToast(message, 'success'), [addToast]);
  const error = useCallback((message) => addToast(message, 'error'), [addToast]);
  const warning = useCallback((message) => addToast(message, 'warning'), [addToast]);
  return (<ToastContext.Provider value={{ addToast, removeToast, success, error, warning }}>{children}<ToastContainer toasts={toasts} removeToast={removeToast} /></ToastContext.Provider>);
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}

function ToastContainer({ toasts, removeToast }) {
  return (<div className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:w-96 z-50 flex flex-col gap-2">{toasts.map(toast => (<Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />))}</div>);
}

function Toast({ toast, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setIsVisible(true)); }, []);
  const handleClose = () => { setIsVisible(false); setTimeout(onClose, 200); };
  const config = { success: { icon: <CheckIcon />, bg: 'var(--green)', lightBg: 'var(--green-light)' }, error: { icon: <XIcon />, bg: 'var(--red)', lightBg: 'var(--red-light)' }, warning: { icon: <AlertIcon />, bg: 'var(--gold)', lightBg: 'var(--gold-light)' } }[toast.type];
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl shadow-lg transition-all duration-200" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderLeft: `4px solid ${config.bg}`, opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(20px)' }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: config.lightBg, color: config.bg }}>{config.icon}</div>
      <p className="flex-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{toast.message}</p>
      <button onClick={handleClose} className="p-1 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}><XIcon /></button>
    </div>
  );
}

export default Toast;