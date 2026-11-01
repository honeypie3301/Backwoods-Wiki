import React from 'react';
import { Sparkles, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

function ThemeToggle({ className = '', size = 'md' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isStarlight = theme === 'starlight';

  const sizeClasses = size === 'sm' ? 'w-8 h-8 p-1.5' : 'w-8 h-8 p-1.5';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      id="theme-toggle-button"
      className={`relative ${sizeClasses} rounded-lg border transition-all duration-300 flex items-center justify-center cursor-pointer group shrink-0 ${
        isStarlight
          ? 'bg-neutral-900 border-zinc-700 text-zinc-100 hover:bg-neutral-800 hover:border-zinc-500 shadow-[0_0_10px_rgba(255,255,255,0.12)]'
          : 'bg-[#182119] border-[#2d3a2f] text-[#a9d1b0] hover:bg-[#212f23] hover:border-[#425545]'
      } ${className}`}
      title={
        isStarlight
          ? 'Active Theme: Starlight Obsidian (Click to switch to Emerald Forest)'
          : 'Active Theme: Emerald Forest (Click to switch to Starlight Obsidian)'
      }
      aria-label="Toggle Theme"
    >
      {isStarlight ? (
        <Sparkles className="w-4 h-4 text-zinc-200 group-hover:scale-110 transition-transform duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-[#a9d1b0] group-hover:scale-110 transition-transform duration-200" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

export default React.memo(ThemeToggle);

