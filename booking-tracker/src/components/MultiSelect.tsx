'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  color?: string;
  bg?: string;
}

interface MultiSelectProps {
  values: string[];
  options: Option[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  allLabel?: string;
  renderOption?: (option: Option, checked: boolean) => React.ReactNode;
  renderSelected?: (selected: Option[]) => React.ReactNode;
}

export function MultiSelect({
  values,
  options,
  onChange,
  placeholder = 'ทั้งหมด',
  className = '',
  allLabel = 'ทั้งหมด',
  renderOption,
  renderSelected,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isAll = values.length === 0;

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const toggleValue = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter(v => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  const selectAll = () => {
    onChange([]);
  };

  const selectedOptions = values.map(v => options.find(o => o.value === v)).filter(Boolean) as Option[];

  const displayContent = isAll
    ? <span className="text-slate-400 truncate">{placeholder}</span>
    : renderSelected
    ? renderSelected(selectedOptions)
    : <span className="font-medium truncate">
        {values.length === 1
          ? (options.find(o => o.value === values[0])?.label || values[0])
          : `${values.length} รายการ`}
      </span>;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-1 px-2 py-1 bg-white border rounded text-xs transition ${
          !isAll
            ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
            : 'border-slate-200 text-slate-700 hover:border-slate-300'
        } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
      >
        <div className="truncate">
          {displayContent}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {!isAll && (
            <span
              onClick={(e) => { e.stopPropagation(); selectAll(); }}
              className="hover:bg-indigo-200 rounded p-0.5 transition"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-max bg-white border border-slate-200 rounded shadow-lg overflow-hidden">
          {options.length > 5 && (
            <div className="p-1.5 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหา..."
                  className="w-full pl-6 pr-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          <div className="max-h-56 overflow-y-auto">
            {/* Select All */}
            <button
              type="button"
              onClick={selectAll}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition ${
                isAll ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                isAll ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'
              }`}>
                {isAll && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              {allLabel}
            </button>

            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-500 text-center">
                ไม่พบข้อมูล
              </div>
            ) : (
              filteredOptions.map(option => {
                const checked = values.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleValue(option.value)}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition ${
                      checked ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                      checked ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'
                    }`}>
                      {checked && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    {renderOption ? renderOption(option, checked) : option.label}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
