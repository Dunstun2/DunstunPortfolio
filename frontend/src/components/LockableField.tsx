import React from 'react';

interface LockableFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  locked: boolean;
  onToggleLock: () => void;
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  placeholder?: string;
  rows?: number;
  options?: string[];
  help?: string;
}

export default function LockableField({
  label,
  name,
  value,
  onChange,
  locked,
  onToggleLock,
  type = 'text',
  placeholder = '',
  rows = 3,
  options = [],
  help,
}: LockableFieldProps) {
  const hasValue = value && value.trim().length > 0;

  const renderField = () => {
    const baseClass = `w-full bg-gray-900 border rounded-lg px-4 py-2 focus:outline-none transition-all ${locked
        ? `opacity-60 cursor-not-allowed ${hasValue ? 'border-gray-700' : 'border-yellow-600/30'}`
        : 'border-gray-700 focus:border-primary'
      }`;

    if (type === 'textarea') {
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={locked}
          placeholder={placeholder}
          rows={rows}
          className={baseClass}
        />
      );
    }

    if (type === 'select' && options.length > 0) {
      return (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={locked}
          className={baseClass}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={locked}
        placeholder={placeholder}
        className={baseClass}
      />
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold">{label}</label>
          {!hasValue && locked && (
            <span className="text-xs px-2 py-0.5 bg-yellow-600/20 text-yellow-500 rounded">
              Empty
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onToggleLock}
          className={`text-xs px-2 py-1 rounded transition flex items-center gap-1 ${locked
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-green-600/20 hover:bg-green-600/30 text-green-400'
            }`}
        >
          {locked ? (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Locked
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                />
              </svg>
              Unlocked
            </>
          )}
        </button>
      </div>
      {renderField()}
      {help && <p className="text-xs text-text-light/50 mt-1">{help}</p>}
    </div>
  );
}
