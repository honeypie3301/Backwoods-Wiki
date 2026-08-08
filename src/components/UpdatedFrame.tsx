/**
 * IMPORTANT FOR AI ASSISTANTS / DEVELOPERS:
 * When adding or editing wiki components, wrap new/changed elements in <UpdatedFrame id="unique_feature_id" isUpdated={true}>.
 * DON'T FORGET: Whenever you update wiki content, you MUST also update the "Wiki Maintenance & Version Update Note"
 * in both `HomeView.tsx` and `Home.txt` with the latest feature/commit highlights.
 * Rule: Only underline "The wiki is always updated before a new version releases."
 */
import React, { useEffect, useRef, useState } from 'react';

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
      { threshold: 0.2 }
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

  return (
    <div
      ref={containerRef}
      className={`relative transition-all duration-700 ${
        active
          ? 'z-20 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)] rounded-xl'
          : ''
      } ${className}`}
    >
      {active && (
        <div className="absolute top-2.5 right-2.5 z-30 bg-amber-500/90 text-[#0f110d] font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-300/40 shadow-sm uppercase tracking-wider flex items-center gap-1 pointer-events-none select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-200" />
          <span>{badgeLabel}</span>
          <span className="text-[8px] opacity-75 font-normal">(7s)</span>
        </div>
      )}
      {children}
    </div>
  );
}
