/**
 * IMPORTANT FOR AI ASSISTANTS / DEVELOPERS:
 * When adding or editing wiki components, wrap new/changed elements in <UpdatedFrame id="unique_feature_id" isUpdated={true}>.
 * DON'T FORGET: Whenever you update wiki content, you MUST also update the "Wiki Maintenance & Version Update Note"
 * in `HomeView.tsx` with the latest feature/commit highlights.
 * Rule: Only underline "The wiki is always updated before a new version releases."
 */
import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface UpdatedFrameProps {
  id: string; // Unique identifier for localStorage tracking
  children: React.ReactNode;
  isUpdated?: boolean;
  className?: string;
  badgeLabel?: string;
  key?: React.Key;
}

export default function UpdatedFrame({
  id,
  children,
  isUpdated = true,
  className = '',
  badgeLabel = 'UPDATED'
}: UpdatedFrameProps) {
  const { theme } = useTheme();
  const [active, setActive] = useState<boolean>(() => {
    if (!isUpdated) return false;
    try {
      const seen = localStorage.getItem(`backwoods_updated_seen_${id}`);
      return seen !== 'true';
    } catch (e) {
      return true;
    }
  });

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Monitor visibility using IntersectionObserver
  useEffect(() => {
    if (!active) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [active]);

  // Start 7-second countdown once displayed on user screen
  useEffect(() => {
    if (active && isVisible) {
      const timer = setTimeout(() => {
        setActive(false);
        try {
          localStorage.setItem(`backwoods_updated_seen_${id}`, 'true');
        } catch (e) {
          // Ignore quota / security error in restricted sandboxes
        }
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [active, isVisible, id]);

  const isStarlight = theme === 'starlight';

  return (
    <div
      ref={containerRef}
      className={`relative transition-all duration-700 ${
        isStarlight
          ? active
            ? 'z-20 border border-zinc-400/70 shadow-[0_0_8px_rgba(228,228,231,0.25)] rounded-xl animate-pulse'
            : ''
          : active
            ? 'z-20 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)] rounded-xl'
            : ''
      } ${className}`}
    >
      {active && (
        <div
          className={`absolute top-2.5 right-2.5 z-30 font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 pointer-events-none select-none ${
            isStarlight
              ? 'bg-zinc-800 text-zinc-200 border border-zinc-600 shadow-[0_0_6px_rgba(228,228,231,0.25)]'
              : 'bg-amber-500/90 text-[#0f110d] border border-amber-300/40'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isStarlight ? 'bg-zinc-950 animate-ping' : 'bg-amber-200'
            }`}
          />
          <span>{badgeLabel}</span>
          <span className="text-[8px] opacity-75 font-normal">(7s)</span>
        </div>
      )}
      {children}
    </div>
  );
}
