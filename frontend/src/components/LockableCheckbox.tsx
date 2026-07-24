import React from 'react';

interface LockableCheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  locked: boolean;
  onToggleLock: () => void;
  help?: string;
}

export default function LockableCheckbox({
  label,
  name,
  checked,
  onChange,
  locked,
  onToggleLock,
  help,
}: LockableCheckboxProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer flex-1">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={locked}
            className={`w-4 h-4 ${locked ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
          <div className="flex-1">
            <span className={`text-sm ${locked ? 'opacity-60' : ''}`}>{label}</span>
            {help && <p className="text-xs text-text-light/50 mt-0.5">{help}</p>}
          </div>
        </label>
        <button
          type="button"
          onClick={onToggleLock}
          className={`text-xs px-2 py-1 rounded transition flex items-center gap-1 ml-2 flex-shrink-0 ${
            locked
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
                  d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 002 2z"
                />
              </svg>
              Unlocked
            </>
          )}
        </button>
      </div>
    </div>
  );
}
