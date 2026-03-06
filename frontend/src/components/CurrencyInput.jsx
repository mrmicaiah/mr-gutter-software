import { useState, useEffect } from 'react';

export default function CurrencyInput({ value, onChange, error, placeholder = "0.00", compact = false }) {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      if (value === '' || value === null || value === undefined) {
        setDisplayValue('');
      } else {
        const num = parseFloat(value);
        if (!isNaN(num)) {
          setDisplayValue(num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }));
        }
      }
    }
  }, [value, isFocused]);

  const handleChange = (e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    const parts = raw.split('.');
    const cleaned = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : raw;
    setDisplayValue(cleaned);
    onChange(cleaned);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (value) {
      setDisplayValue(String(value));
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (displayValue) {
      const num = parseFloat(displayValue);
      if (!isNaN(num)) {
        onChange(num);
        setDisplayValue(num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }));
      }
    }
  };

  const baseStyles = {
    background: 'var(--bg-tertiary)',
    border: `1px solid ${error ? 'var(--red)' : 'var(--border-primary)'}`,
    color: 'var(--text-primary)',
  };

  if (compact) {
    return (
      <div className="relative">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>$</span>
        <input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full pl-5 pr-2 py-1.5 rounded-lg text-sm"
          style={baseStyles}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>$</span>
      <input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="input pl-8"
        style={baseStyles}
      />
    </div>
  );
}
