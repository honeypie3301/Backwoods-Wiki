import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectOption<T extends string | number> {
  value: T;
  label: string;
  desc?: string;
}

interface CustomSelectProps<T extends string | number> {
  value: T;
  onChange: (value: T) => void;
  options: CustomSelectOption<T>[];
  className?: string;
  placeholder?: string;
  widthClass?: string;
}

export default function CustomSelect<T extends string | number>({
  value,
  onChange,
  options,
  className = '',
  placeholder = 'Select option...',
  widthClass = 'w-full'
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${widthClass}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#141a15] hover:bg-[#19221c] border border-[#253327] hover:border-[#384e3a] rounded px-2.5 py-1.5 text-xs font-mono text-[#e0e7e0] flex items-center justify-between gap-2 focus:outline-none focus:border-[#709978] transition shadow-xs cursor-pointer ${className}`}
      >
        <span className="truncate text-left font-mono">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#709978] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 left-0 mt-1 z-50 bg-[#0c120e] border border-[#253327] rounded-lg shadow-2xl overflow-hidden animate-in fade-in duration-100">
          <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-mono flex items-center justify-between gap-2 transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#18241b] text-[#a9d1b0] font-bold border-l-2 border-l-[#709978]'
                      : 'text-[#c9d1c9] hover:bg-[#121c15] hover:text-[#e0e7e0]'
                  }`}
                >
                  <div className="truncate">
                    <div>{option.label}</div>
                    {option.desc && (
                      <div className="text-[10px] text-[#708573] font-normal truncate mt-0.5">{option.desc}</div>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#709978] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
