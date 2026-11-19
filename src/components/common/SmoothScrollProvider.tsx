'use client';

import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

export interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export const SmoothScrollProvider = ({
  children,
}: SmoothScrollProviderProps) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 1.0,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};
