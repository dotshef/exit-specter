'use client';

import { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label?: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function Dropdown({ label, options, value, onChange, placeholder = '전체' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const displayText = selectedOption?.label || placeholder;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(val: string) {
    onChange(val);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between gap-2 px-3 py-2
          border rounded-lg text-sm cursor-pointer transition-colors
          ${isOpen
            ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20 bg-white'
            : 'border-gray-300 bg-white hover:border-gray-400'
          }
          ${!selectedOption ? 'text-gray-400' : 'text-gray-900'}
        `}
      >
        <span className="truncate">{displayText}</span>
        <svg
          className={`w-4 h-4 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-dropdown">
          <ul className="max-h-60 overflow-auto py-1">
            {/* 전체 옵션 */}
            <li>
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`
                  w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors
                  ${value === '' ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium' : 'text-gray-700 hover:bg-gray-50'}
                `}
              >
                {placeholder}
              </button>
            </li>

            {options.length > 0 && (
              <li className="border-t border-gray-100" />
            )}

            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors
                    ${value === option.value
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className="flex items-center justify-between">
                    <span className="truncate">{option.label}</span>
                    {value === option.value && (
                      <svg className="w-4 h-4 shrink-0 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                </button>
              </li>
            ))}

            {options.length === 0 && (
              <li className="px-3 py-3 text-sm text-gray-400 text-center">
                항목이 없습니다.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
