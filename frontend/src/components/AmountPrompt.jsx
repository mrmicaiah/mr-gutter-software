import { useState } from 'react';
import CurrencyInput from './CurrencyInput';

export default function AmountPrompt({ onConfirm, onCancel, title = "Enter Estimate Amount" }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!amount || parseFloat(amount) <= 0) { setError('Please enter a valid amount'); return; }
    onConfirm(parseFloat(amount));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
        <h2 className="font-display text-lg font-bold mb-4 text-center" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        <div className="mb-4"><label className="label">Estimate Amount *</label><CurrencyInput value={amount} onChange={setAmount} error={!!error} />{error && <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>{error}</p>}</div>
        <div className="flex gap-3"><button onClick={onCancel} className="btn btn-secondary flex-1">Cancel</button><button onClick={handleConfirm} className="btn btn-primary flex-1">Confirm</button></div>
      </div>
    </div>
  );
}