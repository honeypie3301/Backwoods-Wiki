import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface WikiOption {
  id: string;
  title: string;
  url?: string;
}

export const WIKI_OPTIONS: WikiOption[] = [
  {
    id: 'backwoods',
    title: 'BACKWOODS',
    url: '#/wiki/home'
  },
  {
    id: 'super_bonemeal',
    title: 'SUPER BONEMEAL',
    url: 'https://honeypie3301.github.io/Super-Bonemeal-Wiki/'
  },
  {
    id: 'darwinism',
    title: 'DARWINISM',
    url: 'https://honeypie3301.github.io/Darwinism-Wiki/#/wiki/home'
  }
];

export default function TitleDialPicker() {
  const [position, setPosition] = useState<number>(0);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number>(0);
  const dragStartPos = useRef<number>(0);
  const animFrameId = useRef<number | null>(null);
  const isSettling = useRef<boolean>(false);
  const isAutoResetting = useRef<boolean>(false);

  const itemHeight = 52;
  const viewportHeight = 56;

  // Reset to Backwoods (0) on mount, focus, or pageshow (such as when user presses Back button)
  useEffect(() => {
    setPosition(0);
    setSelectedIndex(0);

    const handleReset = () => {
      setPosition(0);
      setSelectedIndex(0);
    };

    window.addEventListener('pageshow', handleReset);
    window.addEventListener('focus', handleReset);
    return () => {
      window.removeEventListener('pageshow', handleReset);
      window.removeEventListener('focus', handleReset);
    };
  }, []);

  const animateToTarget = useCallback((targetIndex: number, shouldTriggerSettle: boolean = true) => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
    }

    isSettling.current = true;

    const step = () => {
      setPosition(prev => {
        const diff = targetIndex - prev;
        if (Math.abs(diff) < 0.005) {
          isSettling.current = false;
          setSelectedIndex(targetIndex);
          if (shouldTriggerSettle) {
            handleSettleOption(targetIndex);
          }
          return targetIndex;
        }
        return prev + diff * 0.22;
      });

      if (isSettling.current) {
        animFrameId.current = requestAnimationFrame(step);
      }
    };

    animFrameId.current = requestAnimationFrame(step);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSettleOption = useCallback((index: number) => {
    if (isAutoResetting.current) {
      isAutoResetting.current = false;
      return;
    }

    const targetOption = WIKI_OPTIONS[index];
    if (!targetOption) return;

    if (index !== 0) {
      // 1. If option has a URL (e.g. Super Bonemeal), redirect to it
      if (targetOption.url) {
        window.location.href = targetOption.url;
      }

      // 2. Animate dial back to BACKWOODS (0) smoothly
      setTimeout(() => {
        isAutoResetting.current = true;
        animateToTarget(0, false);
      }, 350);
    } else {
      if (window.location.hash !== '#/wiki/home' && window.location.hash !== '') {
        window.location.hash = '#/wiki/home';
      }
    }
  }, [animateToTarget]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    setPosition(currentPos => {
      const targetIndex = Math.max(0, Math.min(WIKI_OPTIONS.length - 1, Math.round(currentPos)));
      animateToTarget(targetIndex, true);
      return currentPos;
    });
  }, [isDragging, animateToTarget]);

  const handlePointerDown = (clientY: number) => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
    }
    isAutoResetting.current = false;

    setIsDragging(true);
    dragStartY.current = clientY;
    dragStartPos.current = position;
  };

  const handlePointerMove = (clientY: number) => {
    if (!isDragging) return;
    const deltaY = clientY - dragStartY.current;
    const posDelta = -deltaY / itemHeight;
    const rawPos = dragStartPos.current + posDelta;

    let boundedPos = rawPos;
    if (rawPos < 0) {
      boundedPos = rawPos * 0.3;
    } else if (rawPos > WIKI_OPTIONS.length - 1) {
      boundedPos = (WIKI_OPTIONS.length - 1) + (rawPos - (WIKI_OPTIONS.length - 1)) * 0.3;
    }

    setPosition(boundedPos);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handlePointerDown(e.clientY);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handlePointerDown(e.touches[0].clientY);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      handlePointerMove(e.touches[0].clientY);
    }
  };

  const onTouchEnd = () => {
    handleDragEnd();
  };

  useEffect(() => {
    const onGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) handlePointerMove(e.clientY);
    };

    const onGlobalMouseUp = () => {
      if (isDragging) handleDragEnd();
    };

    if (isDragging) {
      window.addEventListener('mousemove', onGlobalMouseMove);
      window.addEventListener('mouseup', onGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', onGlobalMouseMove);
      window.removeEventListener('mouseup', onGlobalMouseUp);
    };
  }, [isDragging, handleDragEnd]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (isDragging) return;

    if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    isAutoResetting.current = false;

    const delta = e.deltaY > 0 ? 1 : -1;
    const nextIndex = Math.max(0, Math.min(WIKI_OPTIONS.length - 1, selectedIndex + delta));
    if (nextIndex !== selectedIndex) {
      animateToTarget(nextIndex, true);
    }
  };

  useEffect(() => {
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onWheel={handleWheel}
      style={{ height: `${viewportHeight}px` }}
      className="relative overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none flex items-center justify-center w-full"
    >
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{ perspective: '400px', transformStyle: 'preserve-3d' }}
      >
        {WIKI_OPTIONS.map((opt, idx) => {
          const offset = idx - position;
          const absOffset = Math.abs(offset);

          if (absOffset > 2.0) return null;

          const translateY = offset * itemHeight;
          const rotateX = -offset * 35;
          const scale = Math.max(0.7, 1 - absOffset * 0.15);
          const opacity = Math.max(0, 1 - absOffset * 0.85);
          const isCenter = absOffset < 0.35;

          return (
            <h1
              key={opt.id}
              onClick={() => {
                if (!isDragging && idx !== selectedIndex) {
                  animateToTarget(idx, true);
                }
              }}
              style={{
                height: `${itemHeight}px`,
                transform: `translateY(${translateY}px) rotateX(${rotateX}deg) scale(${scale})`,
                opacity: opacity,
                zIndex: Math.round(10 - absOffset * 2)
              }}
              className={`
                absolute left-0 right-0 flex items-center justify-center
                font-serif text-4xl sm:text-5xl font-extrabold tracking-widest uppercase transition-all duration-75
                ${isCenter ? 'text-[#e0e7e0]' : 'text-[#709978]'}
              `}
            >
              {opt.title}
            </h1>
          );
        })}
      </div>
    </div>
  );
}
