'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Flame, Layers, Target } from 'lucide-react';
import { OHTANI_PILLAR_INSIGHTS } from '@/data/ohtaniMandalartData';
import { cn } from '@/utils/cn';

export const MandalartExplainerSection = () => {
  const [selectedPillarIdx, setSelectedPillarIdx] = useState<number>(6);

  const activeInsight =
    OHTANI_PILLAR_INSIGHTS[selectedPillarIdx] ?? OHTANI_PILLAR_INSIGHTS[0];

  return (
    <section
      id="mandalart-explainer"
      className="relative border-t border-white/10 bg-[#0b0c0e] py-24 px-4 text-[#f4f1ea] sm:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Swiss Editorial Section Header */}
        <div className="max-w-3xl">
          <span className="font-mono-tech inline-block border border-[#f4b942]/40 px-3 py-1 text-[11px] font-bold tracking-[0.22em] text-[#f4b942] uppercase">
            WHY HAGO-MANDAL // 1 → 8 → 64 ARCHITECTURE
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-[#f4f1ea] sm:text-5xl">
            막연한 꿈을{' '}
            <span className="text-[#f4b942]">
              오늘 당장 실행할 64개의 행동
            </span>
            으로 바꾸는 기술
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
            만다라트(Mandal-Art)는 ‘본질을 깨닫는 지혜(Manda + la)’와 ‘기술(Art)’의 합성어입니다. 고교 1학년 오타니 쇼헤이는 이 9×9 표 한 장으로 불가능이라 불리던 160km/h 투구와 투타겸업 신화를 설계했습니다.
          </p>
        </div>

        {/* 1 -> 8 -> 64 Architecture Cards */}
        <div className="mt-12 grid grid-cols-1 gap-px border border-white/15 bg-white/15 md:grid-cols-3">
          {[
            {
              badge: 'CORE 01',
              count: '1칸',
              icon: Target,
              accent: 'text-[#f4b942]',
              title: '심장을 뛰게 하는 단 하나의 핵심 목표',
              desc: '9×9 격자의 정중앙에는 가장 이루고 싶은 궁극적인 목표를 적습니다. 오타니는 고교 1학년 때 “8구단 드래프트 1순위”를 정중앙에 새겼습니다.',
            },
            {
              badge: 'PILLARS 08',
              count: '8칸',
              icon: Layers,
              accent: 'text-[#f4f1ea]',
              title: '핵심 목표를 떠받치는 8개의 기둥',
              desc: '핵심 목표 주변 8칸에는 이를 달성하기 위한 필수 영역을 적습니다. 기술(제구·구위·변화구·구속)뿐 아니라 멘탈·인간성·운(運)까지 균형 있게 배치했습니다.',
            },
            {
              badge: 'ACTIONS 64',
              count: '64칸',
              icon: Flame,
              accent: 'text-[#f4b942]',
              title: '망설임을 없애는 64개의 일일 루틴',
              desc: '8개의 기둥을 바깥쪽 3×3 블록의 중앙으로 확장한 뒤, 각 기둥마다 오늘 당장 실천할 수 있는 행동 8개씩을 채웁니다. 생각은 곧바로 행동이 됩니다.',
            },
          ].map((card, i) => {
            const IconComponent = card.icon;
            return (
              <motion.div
                key={card.badge}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.35,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex flex-col justify-between bg-[#0b0c0e] p-7"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono-tech border border-white/15 px-2.5 py-1 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                    {card.badge}
                  </span>
                  <span
                    className={cn(
                      'font-display flex items-center gap-2 text-3xl tracking-tight',
                      card.accent
                    )}
                  >
                    <IconComponent className="h-5 w-5 opacity-80" />
                    {card.count}
                  </span>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-extrabold text-[#f4f1ea]">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {card.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Interactive Ohtani 8-Pillar Anatomy Explorer */}
        <div className="mt-12 border border-white/15 bg-zinc-950 p-6 sm:p-10">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end">
            <div>
              <span className="font-mono-tech text-[11px] font-bold tracking-[0.22em] text-[#f4b942] uppercase">
                OHTANI SHOHEI&apos;S 8 PILLARS ANATOMY
              </span>
              <h3 className="mt-1 text-2xl font-black tracking-tight text-[#f4f1ea] sm:text-3xl">
                오타니의 8대 세부 목표를 클릭해 보세요
              </h3>
            </div>
            <p className="text-sm text-zinc-400">
              각 기둥을 선택하면 오타니가 실제로 적었던 8가지 실천 습관과 비하인드 스토리가 펼쳐집니다.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left: Interactive 3x3 Core Matrix Selector */}
            <div className="grid grid-cols-3 gap-px border border-white/15 bg-white/15 lg:col-span-5">
              {[0, 1, 2, 3, -1, 4, 5, 6, 7].map((pillarIdx, gridPos) => {
                if (pillarIdx === -1) {
                  return (
                    <div
                      key="core-center"
                      className="flex flex-col items-center justify-center bg-[#f4b942] p-4 text-center text-[#0b0c0e]"
                    >
                      <span className="font-mono-tech text-[10px] font-extrabold tracking-widest uppercase opacity-75">
                        CORE GOAL
                      </span>
                      <span className="mt-1 text-sm font-black sm:text-base">
                        8구단 드래프트 1순위
                      </span>
                    </div>
                  );
                }

                const pillar = OHTANI_PILLAR_INSIGHTS[pillarIdx];
                if (!pillar) return null;
                const isSelected = selectedPillarIdx === pillarIdx;

                return (
                  <button
                    key={pillar.title}
                    type="button"
                    onClick={() => setSelectedPillarIdx(pillarIdx)}
                    className={cn(
                      'group relative flex flex-col items-center justify-center p-4 text-center transition-colors duration-150',
                      isSelected
                        ? 'bg-zinc-900 text-[#f4b942]'
                        : 'bg-[#0b0c0e] text-zinc-300 hover:bg-zinc-900/70 hover:text-[#f4f1ea]'
                    )}
                  >
                    {isSelected ? (
                      <motion.div
                        layoutId="activePillarHighlight"
                        className="pointer-events-none absolute inset-0 border-2 border-[#f4b942]"
                        transition={{
                          type: 'spring',
                          stiffness: 360,
                          damping: 28,
                        }}
                      />
                    ) : null}
                    <span className="font-mono-tech relative z-10 text-[10px] font-bold tracking-wider opacity-60">
                      0{gridPos > 4 ? gridPos : gridPos + 1}
                    </span>
                    <span className="relative z-10 mt-1 text-sm font-extrabold sm:text-base">
                      {pillar.title}
                    </span>
                    <span className="font-mono-tech relative z-10 mt-0.5 text-[10px] opacity-60">
                      {pillar.englishTitle}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right: Selected Pillar Detail & 8 Habits */}
            <div className="flex flex-col justify-between border border-white/15 bg-[#0b0c0e] p-6 sm:p-8 lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeInsight.title}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="flex h-full flex-col justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono-tech bg-[#f4b942] px-2.5 py-1 text-[10px] font-extrabold tracking-widest text-[#0b0c0e] uppercase">
                        PILLAR 0{selectedPillarIdx + 1} · {activeInsight.englishTitle}
                      </span>
                      <span className="font-mono-tech text-[11px] font-bold text-zinc-500 uppercase">
                        HANAMAKI HIGASHI HIGH // #17
                      </span>
                    </div>

                    <h4 className="mt-4 text-2xl font-black tracking-tight text-[#f4f1ea] sm:text-3xl">
                      “{activeInsight.title}” — 왜 이 항목을 넣었을까?
                    </h4>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
                      {activeInsight.ohtaniStory}
                    </p>
                  </div>

                  <div className="mt-6">
                    <p className="font-mono-tech mb-3 text-[11px] font-bold tracking-widest text-zinc-500 uppercase">
                      8 DAILY ROUTINES // 이 기둥을 이루는 8가지 일일 실천 행동
                    </p>
                    <div className="grid grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-4">
                      {activeInsight.keyHabits.map((habit, i) => (
                        <motion.div
                          key={habit}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="flex items-center gap-2 bg-zinc-950 px-3 py-3 text-xs font-bold text-[#f4f1ea]"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#f4b942]" />
                          <span className="line-clamp-2">{habit}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
