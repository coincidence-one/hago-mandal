'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Camera, Pause, Play } from 'lucide-react';
import {
  OhtaniScrollCanvas,
  type BurstFrameMeta,
} from './OhtaniScrollCanvas';
import { VerticalPitchCorridor } from './VerticalPitchCorridor';
import { HomeRunFlightCorridor } from './HomeRunFlightCorridor';
import { MANDALART_TEMPLATES } from '@/data/ohtaniMandalartData';
import type { CustomPoseMap, OhtaniPhaseId } from '@/types/mandalart';
import { cn } from '@/utils/cn';

export interface OhtaniScrollytellingSectionProps {
  onJumpToPlanner: () => void;
  onJumpToExplainer: () => void;
  onStartMyDraft?: (name: string, jerseyNumber: string, coreGoal: string) => void;
}

const PITCHER_FRAMES: BurstFrameMeta[] = [
  { src: '/images/ohtani/sequence/seq-01.jpg', label: 'SET POSITION', focalY: 0.2 },
  { src: '/images/ohtani/sequence/seq-02.jpg', label: 'FOCUS', focalY: 0.2 },
  { src: '/images/ohtani/sequence/seq-03.jpg', label: 'LOCK IN', focalY: 0.2 },
  { src: '/images/ohtani/sequence/seq-04.jpg', label: 'WEIGHT SHIFT', focalY: 0.2 },
  { src: '/images/ohtani/sequence/seq-05.jpg', label: 'WIND-UP', focalY: 0.2 },
  { src: '/images/ohtani/sequence/seq-06.jpg', label: 'BALANCE', focalY: 0.2 },
  { src: '/images/ohtani/sequence/seq-07.jpg', label: 'KNEE LIFT', focalY: 0.2 },
  { src: '/images/ohtani/sequence/seq-08.jpg', label: 'COIL', focalY: 0.2 },
  { src: '/images/ohtani/sequence/seq-09.jpg', label: 'HIGH LEG KICK', focalY: 0.2 },
  { src: '/images/ohtani/sequence/seq-10.jpg', label: 'STRIDE', focalY: 0.2 },
  { src: '/images/ohtani/sequence/seq-11.jpg', label: 'ACCELERATE', focalY: 0.2 },
  {
    src: '/images/ohtani/sequence/seq-12.jpg',
    label: '165KM/H RELEASE',
    focalX: 0.24,
    focalY: 0.2,
  },
];

const BATTER_CONTACT_FRAMES: BurstFrameMeta[] = [
  { src: '/images/ohtani/sequence/wide-bat-01.jpg', label: 'STANCE', focalX: 0.5, focalY: 0.5 },
  { src: '/images/ohtani/sequence/wide-bat-02.jpg', label: 'LOAD', focalX: 0.5, focalY: 0.5 },
  { src: '/images/ohtani/sequence/wide-bat-03.jpg', label: 'STRIDE', focalX: 0.5, focalY: 0.5 },
  { src: '/images/ohtani/sequence/wide-bat-04.jpg', label: 'FIRE HIPS', focalX: 0.5, focalY: 0.5 },
  { src: '/images/ohtani/sequence/wide-bat-05.jpg', label: 'BARREL CONTACT', focalX: 0.5, focalY: 0.5 },
];

const HOMERUN_FRAMES: BurstFrameMeta[] = [
  { src: '/images/ohtani/sequence/wide-hr-01.jpg', label: 'BARREL CONTACT', focalX: 0.5, focalY: 0.5 },
  { src: '/images/ohtani/sequence/wide-hr-02.jpg', label: 'FULL EXTENSION', focalX: 0.5, focalY: 0.5 },
  { src: '/images/ohtani/sequence/wide-hr-03.jpg', label: 'SKYWARD FOLLOW', focalX: 0.5, focalY: 0.5 },
  { src: '/images/ohtani/sequence/wide-hr-04.jpg', label: 'HOME RUN FINISH', focalX: 0.5, focalY: 0.5 },
];

const VERTICAL_STAGES: Array<{ id: string; code: string; label: string }> = [
  { id: 'zone-pitcher', code: '01', label: 'PITCHER' },
  { id: 'pitch-corridor', code: '02', label: '18.44M' },
  { id: 'zone-batter', code: '03', label: 'CONTACT' },
  { id: 'zone-homerun', code: '04', label: 'SWING' },
  { id: 'homerun-corridor', code: '05', label: '138M HR' },
  { id: 'zone-mandal-reveal', code: '06', label: 'MANDAL' },
];

const clamp = (val: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, val));

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const OhtaniScrollytellingSection = ({
  onJumpToPlanner,
  onJumpToExplainer,
  onStartMyDraft,
}: OhtaniScrollytellingSectionProps) => {
  const pitcherZoneRef = useRef<HTMLDivElement | null>(null);
  const corridorZoneRef = useRef<HTMLDivElement | null>(null);
  const batterZoneRef = useRef<HTMLDivElement | null>(null);
  const homerunZoneRef = useRef<HTMLDivElement | null>(null);
  const hrFlightZoneRef = useRef<HTMLDivElement | null>(null);
  const mandalZoneRef = useRef<HTMLDivElement | null>(null);

  const [pitcherProgress, setPitcherProgress] = useState<number>(0);
  const [corridorProgress, setCorridorProgress] = useState<number>(0);
  const [batterProgress, setBatterProgress] = useState<number>(0);
  const [homerunProgress, setHomerunProgress] = useState<number>(0);
  const [hrFlightProgress, setHrFlightProgress] = useState<number>(0);
  const [mandalEnterProgress, setMandalEnterProgress] = useState<number>(0);
  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);

  const [isMotionPaused, setIsMotionPaused] = useState<boolean>(false);
  const [isPhotoStudioOpen, setIsPhotoStudioOpen] = useState<boolean>(false);
  const [customPhotos, setCustomPhotos] = useState<CustomPoseMap>({});
  const [draftName, setDraftName] = useState<string>('');
  const [draftJersey, setDraftJersey] = useState<string>('17');
  const [draftCoreGoal, setDraftCoreGoal] = useState<string>('');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsMotionPaused(mediaQuery.matches);

    const handleMediaChange = (event: MediaQueryListEvent) => {
      setIsMotionPaused(event.matches);
    };
    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  useEffect(() => {
    let rafId = 0;

    const updateAllZones = () => {
      const vh = window.innerHeight || 1;

      if (pitcherZoneRef.current) {
        const rect = pitcherZoneRef.current.getBoundingClientRect();
        const scrollable = Math.max(1, rect.height - vh);
        setPitcherProgress(clamp(-rect.top / scrollable, 0, 1));
        if (rect.top <= vh * 0.5 && rect.bottom >= vh * 0.5) {
          setActiveStageIdx(0);
        }
      }

      if (corridorZoneRef.current) {
        const rect = corridorZoneRef.current.getBoundingClientRect();
        const scrollable = Math.max(1, rect.height - vh);
        setCorridorProgress(clamp(-rect.top / scrollable, 0, 1));
        if (rect.top <= vh * 0.5 && rect.bottom >= vh * 0.5) {
          setActiveStageIdx(1);
        }
      }

      if (batterZoneRef.current) {
        const rect = batterZoneRef.current.getBoundingClientRect();
        const scrollable = Math.max(1, rect.height - vh);
        setBatterProgress(clamp(-rect.top / scrollable, 0, 1));
        if (rect.top <= vh * 0.5 && rect.bottom >= vh * 0.5) {
          setActiveStageIdx(2);
        }
      }

      if (homerunZoneRef.current) {
        const rect = homerunZoneRef.current.getBoundingClientRect();
        const scrollable = Math.max(1, rect.height - vh);
        setHomerunProgress(clamp(-rect.top / scrollable, 0, 1));
        if (rect.top <= vh * 0.5 && rect.bottom >= vh * 0.5) {
          setActiveStageIdx(3);
        }
      }

      if (hrFlightZoneRef.current) {
        const rect = hrFlightZoneRef.current.getBoundingClientRect();
        const scrollable = Math.max(1, rect.height - vh);
        setHrFlightProgress(clamp(-rect.top / scrollable, 0, 1));
        if (rect.top <= vh * 0.5 && rect.bottom >= vh * 0.5) {
          setActiveStageIdx(4);
        }
      }

      if (mandalZoneRef.current) {
        const rect = mandalZoneRef.current.getBoundingClientRect();
        setMandalEnterProgress(
          clamp((vh * 0.85 - rect.top) / Math.max(1, vh * 0.7), 0, 1)
        );
        if (rect.top <= vh * 0.6) {
          setActiveStageIdx(5);
        }
      }
    };

    const onScroll = () => {
      if (rafId !== 0) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        updateAllZones();
      });
    };

    updateAllZones();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const handleJumpToStage = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({
      behavior: isMotionPaused ? 'auto' : 'smooth',
    });
  };

  const handlePhotoUpload = (
    phaseId: OhtaniPhaseId,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setCustomPhotos((prev) => ({
      ...prev,
      [phaseId]: objectUrl,
    }));
  };

  const handleClearPhoto = (phaseId: OhtaniPhaseId) => {
    setCustomPhotos((prev) => {
      const next = { ...prev };
      delete next[phaseId];
      return next;
    });
  };

  const ohtaniTemplate = MANDALART_TEMPLATES[0];

  const pitcherFrameIdx = Math.min(
    PITCHER_FRAMES.length - 1,
    Math.round(pitcherProgress * (PITCHER_FRAMES.length - 1))
  );
  const batterFrameIdx = Math.min(
    BATTER_CONTACT_FRAMES.length - 1,
    Math.round(batterProgress * (BATTER_CONTACT_FRAMES.length - 1))
  );
  const homerunFrameIdx = Math.min(
    HOMERUN_FRAMES.length - 1,
    Math.round(homerunProgress * (HOMERUN_FRAMES.length - 1))
  );

  // Kinetic Typography Variables (capped at scale 1.0 so display headlines never overlap adjacent copy)
  const pitcherFillPercent = isMotionPaused
    ? 100
    : Math.round(clamp(pitcherProgress * 115, 8, 100));
  const pitcherHeadScale = isMotionPaused
    ? 1
    : lerp(0.94, 1.0, clamp(pitcherProgress * 1.4, 0, 1));
  const pitcherSkew = isMotionPaused
    ? 0
    : pitcherProgress > 0.65
      ? lerp(0, -6, (pitcherProgress - 0.65) / 0.35)
      : 0;

  const impactT = clamp((batterProgress - 0.25) / 0.55, 0, 1);
  const impactScale = isMotionPaused ? 1 : lerp(0.9, 1.0, impactT);
  const impactFill = isMotionPaused
    ? 100
    : Math.round(clamp(batterProgress * 125, 10, 100));

  const hrScaleX = isMotionPaused ? 1 : lerp(0.94, 1.24, homerunProgress);
  const hrLetterSpacing = isMotionPaused
    ? 0
    : lerp(-0.02, 0.14, homerunProgress);
  const hrFrameScale = isMotionPaused ? 1 : lerp(0.88, 1.0, homerunProgress);

  const mandalScale = isMotionPaused
    ? 1
    : lerp(0.92, 1.0, clamp(mandalEnterProgress, 0, 1));

  return (
    <section
      id="ohtani-story"
      className="relative w-full bg-[#0b0c0e] text-[#f4f1ea]"
    >
      {/* Floating Swiss Telemetry Rail (Right Edge) */}
      <aside
        aria-label="오타니 투타 스크롤 단계 내비게이션"
        className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-1 border border-white/10 bg-[#0b0c0e]/85 p-2 backdrop-blur-md xl:flex"
      >
        {VERTICAL_STAGES.map((stage, idx) => {
          const isActive = activeStageIdx === idx;
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => handleJumpToStage(stage.id)}
              className={cn(
                'font-mono-tech flex items-center gap-2.5 px-2.5 py-1.5 text-left text-[11px] transition-colors',
                isActive
                  ? 'bg-[#f4b942] font-bold text-[#0b0c0e]'
                  : 'text-zinc-500 hover:text-[#f4f1ea]'
              )}
            >
              <span>{stage.code}</span>
              <span>{stage.label}</span>
            </button>
          );
        })}

        <div className="mt-1 flex flex-col gap-1 border-t border-white/10 pt-1.5">
          <button
            type="button"
            onClick={() => setIsPhotoStudioOpen((p) => !p)}
            className="font-mono-tech flex items-center justify-center gap-1 border border-white/10 py-1.5 text-[10px] text-zinc-400 hover:border-white/30 hover:text-white"
          >
            <Camera className="h-3 w-3" /> PHOTO
          </button>
          <button
            type="button"
            onClick={() => setIsMotionPaused((p) => !p)}
            className="font-mono-tech flex items-center justify-center gap-1 border border-white/10 py-1.5 text-[10px] text-zinc-400 hover:border-white/30 hover:text-white"
          >
            {isMotionPaused ? (
              <>
                <Play className="h-3 w-3" /> PLAY
              </>
            ) : (
              <>
                <Pause className="h-3 w-3" /> PAUSE
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Custom Photo Drawer */}
      {isPhotoStudioOpen ? (
        <div className="fixed top-20 right-4 left-4 z-50 mx-auto max-w-3xl border border-white/20 bg-[#0b0c0e]/95 p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="font-mono-tech text-xs font-bold tracking-widest text-[#f4b942] uppercase">
                CUSTOM PHOTO OVERRIDE
              </h3>
              <p className="mt-0.5 text-xs text-zinc-400">
                소장 중인 오타니 사진으로 각 액트(Act)의 비주얼을 교체할 수 있습니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPhotoStudioOpen(false)}
              className="font-mono-tech border border-white/15 px-2.5 py-1 text-xs text-zinc-300 hover:bg-white hover:text-black"
            >
              CLOSE ×
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(
              [
                ['windup', '01. 투수 와인드업'],
                ['release', '01. 투수 릴리즈'],
                ['transition', '03. 타자 정타'],
                ['swing', '04. 홈런 팔로스루'],
              ] as Array<[OhtaniPhaseId, string]>
            ).map(([phaseId, label]) => {
              const hasPhoto = Boolean(customPhotos[phaseId]);
              return (
                <div
                  key={phaseId}
                  className="flex flex-col justify-between border border-white/10 bg-zinc-950 p-3 text-xs"
                >
                  <span className="font-bold text-[#f4f1ea]">{label}</span>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <label className="font-mono-tech cursor-pointer bg-[#f4f1ea] px-2 py-1 text-[10px] font-bold text-[#0b0c0e] hover:bg-[#f4b942]">
                      {hasPhoto ? 'REPLACE' : 'UPLOAD'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(phaseId, e)}
                      />
                    </label>
                    {hasPhoto ? (
                      <button
                        type="button"
                        onClick={() => handleClearPhoto(phaseId)}
                        className="font-mono-tech border border-white/20 px-2 py-1 text-[10px] text-zinc-300 hover:text-white"
                      >
                        RESET
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* ===================================================================
          ACT I: PITCHER OHTANI (Asymmetric Swiss Editorial Spread)
         =================================================================== */}
      <div
        id="zone-pitcher"
        ref={pitcherZoneRef}
        className="relative h-[240vh] w-full"
      >
        <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden px-4 pt-16 sm:px-8">
          <div
            aria-hidden="true"
            className="film-grain-overlay pointer-events-none absolute inset-0 opacity-60"
          />

          <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-6 lg:grid-cols-12">
            {/* Left Editorial Typography Column */}
            <div className="relative z-20 flex flex-col items-start lg:col-span-6">
              <div className="font-mono-tech flex items-center gap-3 text-xs tracking-[0.22em] text-zinc-400 uppercase">
                <span className="font-bold text-[#f4b942]">ACT 01 // PITCHER</span>
                <span>·</span>
                <span>
                  FRAME {String(pitcherFrameIdx + 1).padStart(2, '0')}/12 (
                  {PITCHER_FRAMES[pitcherFrameIdx]?.label})
                </span>
              </div>

              <div
                style={{
                  transform: `scale(${pitcherHeadScale.toFixed(3)}) skewX(${pitcherSkew.toFixed(1)}deg)`,
                  transformOrigin: 'left center',
                }}
                className="relative mt-4 select-none will-change-transform"
              >
                <h1 className="font-display text-[56px] leading-[0.88] tracking-tight text-stroke-editorial uppercase sm:text-[96px] lg:text-[124px]">
                  DESIGN
                  <br />
                  THE PITCH
                </h1>
                <div
                  aria-hidden="true"
                  style={{
                    clipPath: `inset(${100 - pitcherFillPercent}% 0 0 0)`,
                  }}
                  className="font-display pointer-events-none absolute inset-0 text-[56px] leading-[0.88] tracking-tight text-[#f4f1ea] uppercase sm:text-[96px] lg:text-[124px]"
                >
                  DESIGN
                  <br />
                  THE PITCH
                </div>
              </div>

              <p className="mt-5 max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
                <strong className="text-[#f4f1ea]">던질 곳을 먼저 그렸다.</strong>{' '}
                165km/h의 강속구도 손끝이 아닌 종이 위에서 시작됐습니다. 고교 1학년 오타니가 빈 81칸에 새긴 매일의 루틴이 마운드 위 완벽한 릴리즈를 만들었습니다.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onJumpToPlanner}
                  className="font-mono-tech bg-[#f4b942] px-5 py-3 text-xs font-extrabold tracking-wider text-[#0b0c0e] uppercase transition hover:bg-[#f4f1ea]"
                >
                  내 81칸 설계하기 →
                </button>
                <span className="font-mono-tech inline-flex items-center gap-1.5 text-[11px] tracking-widest text-zinc-500 uppercase">
                  SCROLL TO THROW{' '}
                  <ArrowDown className="h-3.5 w-3.5 animate-bounce text-[#f4b942]" />
                </span>
              </div>
            </div>

            {/* Right Crisp Architectural Portrait Frame */}
            <div className="relative z-10 flex justify-center lg:col-span-6 lg:justify-end">
              <div className="relative h-[54vh] w-full max-w-[440px] border border-white/15 bg-zinc-950 sm:h-[72vh] lg:max-w-[500px]">
                <span className="font-mono-tech absolute -top-2.5 -left-2 z-20 text-xs text-zinc-500">+</span>
                <span className="font-mono-tech absolute -top-2.5 -right-2 z-20 text-xs text-zinc-500">+</span>
                <span className="font-mono-tech absolute -bottom-2.5 -left-2 z-20 text-xs text-zinc-500">+</span>
                <span className="font-mono-tech absolute -bottom-2.5 -right-2 z-20 text-xs text-zinc-500">+</span>

                <OhtaniScrollCanvas
                  frames={PITCHER_FRAMES}
                  progress={pitcherProgress}
                  isMotionPaused={isMotionPaused}
                  customPhotoUrl={
                    pitcherProgress > 0.65
                      ? customPhotos.release
                      : customPhotos.windup
                  }
                  zoomStart={1.0}
                  zoomEnd={1.08}
                  saturationStart={0.18}
                  saturationEnd={0.95}
                  ariaLabel="투수 오타니 와인드업부터 165km/h 릴리즈까지 12연사"
                />

                <div className="font-mono-tech absolute right-3 bottom-3 z-20 border border-white/15 bg-[#0b0c0e]/85 px-2.5 py-1 text-[10px] tracking-widest text-[#f4b942]">
                  #17 // {(148 + pitcherProgress * 17).toFixed(1)} KM/H
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          ACT II: | 18.44M 3D S-CURVE PITCH FLIGHT CORRIDOR
         =================================================================== */}
      <div ref={corridorZoneRef}>
        <VerticalPitchCorridor
          progress={corridorProgress}
          isMotionPaused={isMotionPaused}
        />
      </div>

      {/* ===================================================================
          ACT III: BATTER + BALL IMPACT (Pixel-Exact 1:1 Ball Sync on Canvas!)
         =================================================================== */}
      <div
        id="zone-batter"
        ref={batterZoneRef}
        className="relative h-[190vh] w-full"
      >
        <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden px-4 pt-16 sm:px-8">
          <div
            aria-hidden="true"
            className="film-grain-overlay pointer-events-none absolute inset-0 opacity-60"
          />

          <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-6 lg:grid-cols-12">
            {/* Left Generous 3:2 Widescreen Architectural Frame with 1:1 Pixel-Synced 3D Baseball */}
            <div className="relative z-10 order-2 flex justify-center lg:order-1 lg:col-span-7 lg:justify-start">
              <div className="relative aspect-[3/2] w-full max-w-[780px] border border-white/15 bg-zinc-950 shadow-2xl">
                <span className="font-mono-tech absolute -top-2.5 -left-2 z-20 text-xs text-zinc-500">+</span>
                <span className="font-mono-tech absolute -top-2.5 -right-2 z-20 text-xs text-zinc-500">+</span>
                <span className="font-mono-tech absolute -bottom-2.5 -left-2 z-20 text-xs text-zinc-500">+</span>
                <span className="font-mono-tech absolute -bottom-2.5 -right-2 z-20 text-xs text-zinc-500">+</span>

                <OhtaniScrollCanvas
                  frames={BATTER_CONTACT_FRAMES}
                  progress={batterProgress}
                  isMotionPaused={isMotionPaused}
                  customPhotoUrl={customPhotos.transition}
                  zoomStart={1.0}
                  zoomEnd={1.03}
                  saturationStart={0.35}
                  saturationEnd={1.08}
                  ballSyncMode="batter-contact"
                  ariaLabel="타석에 선 타자 오타니가 공을 정타하는 와이드 시퀀스"
                />

                <div className="font-mono-tech absolute bottom-3 left-3 z-20 border border-white/15 bg-[#0b0c0e]/85 px-2.5 py-1 text-[10px] tracking-widest text-[#f4f1ea]">
                  {BATTER_CONTACT_FRAMES[batterFrameIdx]?.label} // 0{batterFrameIdx + 1}/0{BATTER_CONTACT_FRAMES.length}
                </div>
              </div>
            </div>

            {/* Right Kinetic Typography Slamming In on Contact */}
            <div className="relative z-20 order-1 flex flex-col items-start lg:order-2 lg:col-span-5">
              <div className="font-mono-tech flex items-center gap-3 text-xs tracking-[0.22em] text-zinc-400 uppercase">
                <span className="font-bold text-[#f4b942]">ACT 03 // CONTACT</span>
                <span>·</span>
                <span>18.44M → SWEET SPOT</span>
              </div>

              <div
                style={{
                  transform: `scale(${impactScale.toFixed(3)})`,
                  transformOrigin: 'left center',
                }}
                className="relative mt-4 select-none will-change-transform"
              >
                <h2 className="font-display text-[60px] leading-[0.86] tracking-tight text-stroke-editorial uppercase sm:text-[96px] lg:text-[120px]">
                  BARREL
                  <br />
                  IMPACT
                </h2>
                <div
                  aria-hidden="true"
                  style={{
                    clipPath: `inset(${100 - impactFill}% 0 0 0)`,
                  }}
                  className="font-display pointer-events-none absolute inset-0 text-[60px] leading-[0.86] tracking-tight text-[#f4b942] uppercase sm:text-[96px] lg:text-[120px]"
                >
                  BARREL
                  <br />
                  IMPACT
                </div>
              </div>

              <p className="mt-5 max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
                <strong className="text-[#f4f1ea]">기다림이 폭발로 바뀌는 0.01초.</strong>{' '}
                흔들림 없는 시선과 폭발적인 회전이 배트 중심 한 점에 모이는 순간, 165km/h의 공은 191.5km/h의 타구로 되돌아갑니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          ACT IV: HOME RUN FOLLOW-THROUGH (Ball Launches Skyward off Bat!)
         =================================================================== */}
      <div
        id="zone-homerun"
        ref={homerunZoneRef}
        className="relative h-[200vh] w-full border-t border-white/10"
      >
        <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden px-4 pt-16 sm:px-8">
          <div
            aria-hidden="true"
            className="film-grain-overlay pointer-events-none absolute inset-0 opacity-60"
          />

          {/* Giant Stretching Kinetic Background Title */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-1/2 z-0 flex -translate-y-1/2 justify-center overflow-hidden select-none"
          >
            <h2
              style={{
                transform: `scaleX(${hrScaleX.toFixed(3)})`,
                letterSpacing: `${hrLetterSpacing.toFixed(3)}em`,
              }}
              className="font-display whitespace-nowrap text-[110px] leading-none text-stroke-editorial uppercase sm:text-[190px] lg:text-[240px]"
            >
              HOME RUN
            </h2>
          </div>

          {/* Centerpiece Generous 3:2 Widescreen Ohtani Home Run Follow-Through Frame */}
          <div
            style={{
              transform: `scale(${hrFrameScale.toFixed(3)})`,
            }}
            className="relative z-10 aspect-[3/2] w-full max-w-[820px] border border-white/20 bg-zinc-950 shadow-2xl will-change-transform lg:max-w-[940px]"
          >
            <OhtaniScrollCanvas
              frames={HOMERUN_FRAMES}
              progress={homerunProgress}
              isMotionPaused={isMotionPaused}
              customPhotoUrl={customPhotos.swing}
              zoomStart={1.0}
              zoomEnd={1.03}
              saturationStart={0.95}
              saturationEnd={1.15}
              ballSyncMode="homerun-launch"
              ariaLabel="오타니 시원한 와이드 홈런 스윙 및 좌상단 외야 타구 발사"
            />

            <div className="font-mono-tech absolute top-3 left-3 z-20 bg-[#f4b942] px-2.5 py-1 text-[10px] font-extrabold tracking-widest text-[#0b0c0e] uppercase">
              ACT 04 // {HOMERUN_FRAMES[homerunFrameIdx]?.label} (0{homerunFrameIdx + 1}/0{HOMERUN_FRAMES.length})
            </div>
            <div className="font-mono-tech absolute right-3 bottom-3 left-3 z-20 flex items-center justify-between border-t border-white/15 pt-2.5 text-[11px] tracking-widest text-[#f4f1ea]">
              <span>EXIT VELO 191.5 KM/H</span>
              <span className="text-[#f4b942]">28° LAUNCH · 138M MOONSHOT</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          ACT V: 138M HOME RUN BALL FLIGHT -> SPLITS INTO 9 MANDAL-ART CORES!
         =================================================================== */}
      <div ref={hrFlightZoneRef}>
        <HomeRunFlightCorridor
          progress={hrFlightProgress}
          isMotionPaused={isMotionPaused}
        />
      </div>

      {/* ===================================================================
          ACT VI: SWISS ARCHITECTURAL 9x9 MANDAL-ART REVEAL
         =================================================================== */}
      <div
        id="zone-mandal-reveal"
        ref={mandalZoneRef}
        className="relative mx-auto max-w-7xl border-t border-white/10 px-4 py-24 sm:px-8 sm:py-32"
      >
        <div className="overflow-hidden py-2 text-center">
          <div
            style={{
              transform: `scale(${mandalScale.toFixed(3)})`,
            }}
            className="will-change-transform"
          >
            <span className="font-mono-tech inline-block border border-[#f4b942]/40 px-3 py-1 text-[11px] font-bold tracking-[0.25em] text-[#f4b942] uppercase">
              ACT 06 // THE 81-CELL BLUEPRINT
            </span>
            <h2 className="font-display mt-4 text-5xl leading-none tracking-tight text-[#f4f1ea] uppercase sm:text-7xl lg:text-8xl">
              HAGO-MANDAL
            </h2>
          </div>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            <strong className="text-[#f4f1ea]">기적처럼 보이는 결과는 언제나 쪼개진 일상에서 나옵니다.</strong>{' '}
            고교 1학년 오타니가 1개의 목표·8개의 기둥·64개의 행동으로 증명한 공식을, 이제 당신의 목표에 대입할 차례입니다.
          </p>
        </div>

        {/* Crisp Architectural 3x3 Core Blueprint Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.045, delayChildren: 0.08 },
            },
          }}
          className="mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-px border border-white/15 bg-white/10"
        >
          {[
            ohtaniTemplate.subGoals[0],
            ohtaniTemplate.subGoals[1],
            ohtaniTemplate.subGoals[2],
            ohtaniTemplate.subGoals[3],
            ohtaniTemplate.coreGoal,
            ohtaniTemplate.subGoals[4],
            ohtaniTemplate.subGoals[5],
            ohtaniTemplate.subGoals[6],
            ohtaniTemplate.subGoals[7],
          ].map((title, idx) => {
            const isCenter = idx === 4;
            const outerIdx = idx > 4 ? idx - 1 : idx;
            const sampleActions = !isCenter
              ? ohtaniTemplate.outerActions[outerIdx]?.slice(0, 3) ?? []
              : [];

            return (
              <motion.div
                key={title}
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                onClick={onJumpToPlanner}
                className={cn(
                  'cursor-pointer p-4 text-left transition-colors sm:p-6',
                  isCenter
                    ? 'flex flex-col justify-between bg-[#f4b942] text-[#0b0c0e] hover:bg-[#f4f1ea]'
                    : 'bg-[#0b0c0e] text-[#f4f1ea] hover:bg-zinc-900'
                )}
              >
                <div className="font-mono-tech flex items-center justify-between text-[10px] font-bold tracking-widest uppercase opacity-60">
                  <span>{isCenter ? 'CORE' : `0${outerIdx + 1}`}</span>
                  <span>{isCenter ? '17' : '↗'}</span>
                </div>

                <p
                  className={cn(
                    'mt-4 font-black tracking-tight',
                    isCenter ? 'text-base sm:text-xl' : 'text-sm sm:text-lg'
                  )}
                >
                  {title}
                </p>

                {!isCenter ? (
                  <p className="mt-2 hidden text-[11px] leading-relaxed text-zinc-500 sm:block">
                    {sampleActions.join(' · ')}
                  </p>
                ) : (
                  <p className="font-mono-tech mt-2 text-[10px] font-extrabold uppercase">
                    CLICK TO BUILD 81 CELLS →
                  </p>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* =================================================================
            OHTANI #17 -> YOUR DRAFT BATON-PASS BOX
           ================================================================= */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (onStartMyDraft) {
              onStartMyDraft(draftName, draftJersey, draftCoreGoal);
            } else {
              onJumpToPlanner();
            }
          }}
          className="mx-auto mt-12 max-w-3xl border border-[#f4b942]/40 bg-zinc-950/90 p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <span className="font-mono-tech text-[10px] font-bold tracking-[0.22em] text-[#f4b942] uppercase">
                BATON PASS // OHTANI #17 → YOUR DRAFT
              </span>
              <h3 className="mt-1 text-lg font-black tracking-tight text-[#f4f1ea] sm:text-xl">
                재능이 아니라 설계도의 차이였습니다. 이제 당신의 타석입니다.
              </h3>
            </div>
            <span className="font-mono-tech border border-white/15 bg-[#0b0c0e] px-2.5 py-1 text-xs font-bold text-[#f4b942]">
              #{draftJersey.trim() || '17'} {draftName.trim() || 'ROOKIE'}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-12">
            <div className="sm:col-span-3">
              <label
                htmlFor="baton-jersey"
                className="font-mono-tech block text-[10px] font-bold tracking-widest text-zinc-400 uppercase"
              >
                등번호 (#NO.)
              </label>
              <input
                id="baton-jersey"
                type="text"
                maxLength={3}
                value={draftJersey}
                onChange={(e) => setDraftJersey(e.target.value)}
                placeholder="17"
                className="font-mono-tech mt-1.5 w-full border border-white/15 bg-[#0b0c0e] px-3 py-2.5 text-sm font-bold text-[#f4b942] placeholder-zinc-600 focus:border-[#f4b942] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="baton-name"
                className="font-mono-tech block text-[10px] font-bold tracking-widest text-zinc-400 uppercase"
              >
                플레이어 이름 (NAME)
              </label>
              <input
                id="baton-name"
                type="text"
                maxLength={18}
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="예: 홍길동"
                className="mt-1.5 w-full border border-white/15 bg-[#0b0c0e] px-3 py-2.5 text-sm font-bold text-[#f4f1ea] placeholder-zinc-600 focus:border-[#f4b942] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-5">
              <label
                htmlFor="baton-core"
                className="font-mono-tech block text-[10px] font-bold tracking-widest text-zinc-400 uppercase"
              >
                나의 핵심 목표 1줄 (CORE GOAL)
              </label>
              <input
                id="baton-core"
                type="text"
                maxLength={28}
                value={draftCoreGoal}
                onChange={(e) => setDraftCoreGoal(e.target.value)}
                placeholder="예: 나만의 프로덕트 런칭"
                className="mt-1.5 w-full border border-white/15 bg-[#0b0c0e] px-3 py-2.5 text-sm font-bold text-[#f4f1ea] placeholder-zinc-600 focus:border-[#f4b942] focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onJumpToExplainer}
              className="font-mono-tech border border-white/20 px-4 py-3 text-xs font-bold tracking-widest text-zinc-300 uppercase transition hover:border-white/50 hover:text-white"
            >
              오타니 8대 기둥 먼저 해부 보기 ↓
            </button>
            <button
              type="submit"
              className="font-mono-tech bg-[#f4b942] px-6 py-3 text-xs font-extrabold tracking-widest text-[#0b0c0e] uppercase transition hover:bg-[#f4f1ea]"
            >
              내 81칸 드래프트 시작하기 →
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
