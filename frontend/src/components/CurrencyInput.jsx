import { useState, useRef, useEffect } from 'react';

export default function CurrencyInput({ value, onChange, id, name, placeholder = '0.00', required = false, disabled = false, error = false, className = '' }) {
  const inputRef = useRef(null);
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Only sync from prop when not focused (initial load or external changes)
  useEffect(() => {
    if (!isFocused) {
      if (value === '' || value === null || value === undefined || value === 0) {
        setDisplayValue('');
      } else {
        const num = parseFloat(value);
        if (!isNaN(num)) {
          setDisplayValue(num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        }
      }
    }
  }, [value, isFocused]);

  const handleChange = (e) => {
    const rawValue = e.target.value;
    
    // Only allow digits and one decimal point
    const cleaned = rawValue.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = cleaned.split('.');
    let sanitized = parts[0];
    if (parts.length > 1) {
      sanitized += '.' + parts[1].slice(0, 2);
    }
    
    // Update display with raw input (no formatting while typing)
    setDisplayValue(sanitized);
    
    // Send numeric value to parent
    const numericValue = parseFloat(sanitized) || 0;
    onChange(numericValue);
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    // Format on blur
    if (value !== '' && value !== null && value !== undefined && value !== 0) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        setDisplayValue(num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      }
    } else {
      setDisplayValue('');
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    
    // Show raw number on focus (no commas, easier to edit)
    if (value !== '' && value !== null && value !== undefined && value !== 0) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        // Show without trailing zeros if whole number
        setDisplayValue(num % 1 === 0 ? String(num) : num.toFixed(2));
      }
    }
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-base" style={{ color: 'var(--text-muted)' }}>$</span>
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        id={id}
        name={name}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`input pl-8 ${className}`}
        style={{ borderColor: error ? 'var(--red)' : undefined }}
        autoComplete="off"
      />
    </div>
  );
}
