'use client';

import { useEffect, useRef } from 'react';

export const ScrollProgressBar = () => {
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    if (
      typeof CSS !== 'undefined' &&
      CSS.supports('animation-timeline', 'scroll()')
    ) {
      return;
    }

    const handleScroll = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const ratio = Math.min(1, Math.max(0, window.scrollY / scrollable));
      bar.style.transform = `scaleX(${ratio})`;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={barRef}
      id="hago-scroll-progress"
      aria-hidden="true"
      className="fixed top-0 left-0 z-50 h-[2px] w-full origin-left bg-[#f4b942]"
    />
  );
};
