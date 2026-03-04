import { useState, useRef, useEffect } from 'react';

export default function CurrencyInput({ value, onChange, id, name, placeholder = '0.00', required = false, disabled = false, error = false, className = '' }) {
  const inputRef = useRef(null);
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value === '' || value === null || value === undefined) { setDisplayValue(''); }
    else { const num = parseFloat(value); if (!isNaN(num)) setDisplayValue(num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })); }
  }, [value]);

  const handleChange = (e) => {
    const rawValue = e.target.value;
    const cleaned = rawValue.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    let formatted = parts[0];
    if (parts.length > 1) formatted += '.' + parts[1].slice(0, 2);
    setDisplayValue(rawValue);
    const numericValue = parseFloat(formatted) || 0;
    onChange(numericValue);
  };

  const handleBlur = () => {
    if (value !== '' && value !== null && value !== undefined) {
      const num = parseFloat(value);
      if (!isNaN(num)) setDisplayValue(num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    }
  };

  const handleFocus = () => {
    if (value !== '' && value !== null && value !== undefined) {
      const num = parseFloat(value);
      if (!isNaN(num)) setDisplayValue(num.toFixed(2));
    }
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-base" style={{ color: 'var(--text-muted)' }}>$</span>
      <input ref={inputRef} type="text" inputMode="decimal" id={id} name={name} value={displayValue} onChange={handleChange} onBlur={handleBlur} onFocus={handleFocus} placeholder={placeholder} required={required} disabled={disabled} className={`input pl-8 ${className}`} style={{ borderColor: error ? 'var(--red)' : undefined }} />
    </div>
  );
}